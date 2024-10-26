'use strict';
let response = require('../config/response');
// const models = require("../model");
const moment = require('moment');
const dotenv = require('dotenv');
const { SysAuthentication } = require('../model/Auth/authentication');
const { Op } = require('sequelize');
const { ConfApplication } = require('../model/Config/application');
const { SysLog } = require('../model/System/log');
dotenv.config(); //- MYSQL Module

async function check_token(req, res) {
  var data = { data: req.body, error: null, message: null };
  try {
    let allowingUrl = [
      '/api/v1/auth/login',
      '/api/v1/sync-table',
      '/api/v1/config/application',
      '/api/v1/locker/transaction'
    ];
    for (const url of allowingUrl) {
      if (req.originalUrl.includes(url)) {
        return true;
      }
    }
    let token = req.headers['token'];
    if (!token) {
      data.error = true;
      data.status_code = 401;
      data.message = `Authentication failed, token header is invalid or has expired`;
      return response.response(data, res);
    }
    if (process.env.DEV_TOKEN == token) {
      req.headers['user_id'] = 0;
      req.headers['section_id'] = null;
      if (req.method == 'PUT') {
        req.body.created_by = '0';
        req.body.created_at = new Date();
      } else if (req.method == 'POST' || req.method == 'DELETE') {
        req.body.updated_by = '0';
        req.body.updated_at = new Date();
      }
      return true;
    }
    let auth = await SysAuthentication.findOne({
      where: { token: token, expired_at: { [Op.gt]: new Date() } },
      raw: true,
    });
    if (!auth) {
      throw new Error(
        `Authentication failed, token header is invalid or has expired`
      );
    }
    req.headers['user_id'] = auth.user_id;
    req.headers['section_id'] = auth.section_id;

    if (req.method == 'PUT') {
      req.body.created_by = auth.user_id;
      req.body.created_at = new Date();
    } else if (req.method == 'POST' || req.method == 'DELETE') {
      req.body.updated_by = auth.user_id;
      req.body.updated_at = new Date();
    }

    let confApplication = await ConfApplication.findOne();
    let params = {
      expired_at: moment(new Date()).add(
        confApplication.session_timeout || 5,
        'minute'
      ),
    };
    await SysAuthentication.update(params, {
      where: { token: token },
      raw: true,
    });
    req.headers['expired_at'] = params.expired_at;
    return true;
  } catch (error) {
    data.status_code = 401;
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
}

async function create_log(req, res) {
  var data = { data: req.body, error: null, message: null };
  try {
    if (process.env.DEV_TOKEN == req.headers.token) {
      return true;
    }
    let body_log = {};
    Object.keys(req.body).forEach((key) => {
      if (key.toLowerCase().includes('password')) {
        body_log[key] = '***RAHASIA***';
      } else {
        body_log[key.toLowerCase()] = req.body[key];
      }
    });
    let params = {
      created_by: req.headers.user_id,
      path: req.originalUrl,
      method: req.method,
      data: body_log,
      ip_address: (
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ).replace(/::ffff:/, ''),
      user_agent: req.get('User-Type') || req.get('User-Agent'),
    };
    await SysLog.create(params);
    return true;
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
}

module.exports = {
  check_token,
  create_log,
};
