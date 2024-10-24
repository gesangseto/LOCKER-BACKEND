'use strict';

const { Sequel } = require('../../config/connection');
const { encryptData, makeId, makeIdDate } = require('../../helper/utils');
const { queryAdmUser } = require('../../model/Admin/user');
const { ConfApplication } = require('../../model/Config/application');
const response = require('../../config/response');
const { SysAuthentication } = require('../../model/Auth/authentication');
const moment = require('moment');
const { Op } = require('sequelize');
const {
  queryAccessMenuFiter,
  queryAccessMenu,
} = require('../../model/Admin/access_menu');
const QueryBuilderV2 = require('../../helper/query_builder_v2');

exports.post = async function (req, res) {
  var data = { rows: [req.body] };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;
    let usr = null;
    if (!body.email) {
      throw new Error(`Email is required!`);
    } else if (!body.password) {
      throw new Error(`Password is required!`);
    }
    body.password = encryptData(body.password);
    let super_usr = await ConfApplication.findOne({
      attributes: { exclude: ['users_password'] },
      where: {
        email: body.email,
        password: body.password,
      },
      raw: true,
    });
    body.delete_flag = 0;
    if (!super_usr) {
      let searchingParameter = [
        { alias: 'email', original: 'adm_user.email' },
        { alias: 'password', original: 'adm_user.password' },
      ];
      let genQuery = new QueryBuilderV2(queryAdmUser(), body);
      genQuery.exactSearch(searchingParameter);
      let getData = await genQuery.getData();
      if (getData.length === 0) {
        throw new Error(`Email or Password is wrong!`);
      }
      usr = getData[0];
      delete usr.password;
      if (usr.deleted_at) throw new Error(`User has been deleted`);
      if (usr.status != 1) {
        throw new Error(
          ` Login failed, This user is currently Inactive. Please contact administrator!`
        );
      }
    } else {
      usr = super_usr;
      usr.id = 0;
      usr.section_id = 0;
    }
    delete usr.password;
    let token = await createToken(usr, _exec);
    // FIND ROLE ACCESS
    let query = queryAccessMenuFiter(usr.section_id, body.type);
    if (token.token === process.env.DEV_TOKEN) {
      query = queryAccessMenu(0, body.type);
    }
    let role = await Sequel.query(query, { transaction: _exec });
    role = role[0];
    let newRole = [];
    for (var it of role) {
      if (!it.parent_id) {
        let idx = role.findIndex((o) => o.parent_id == it.id);
        if (~idx) {
          newRole.push(it);
        }
      } else {
        if (token.token === process.env.DEV_TOKEN) {
          it = { ...it, ...superAdminAccess() };
        }
        newRole.push(it);
      }
    }
    usr = { ...usr, ...token, access_menu: newRole };
    data.rows[0] = usr;
    data.count = 1;
    data.message = `Login success.\nWelcome ${usr.name}`;
    _exec.commit();
    return response.response(data, res);
  } catch (error) {
    console.log(error);
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

const createToken = async (data, trx) => {
  let confApplication = await ConfApplication.findOne({ transaction: trx });
  let token =
    data.id == 0
      ? process.env.DEV_TOKEN
      : `${makeId(5)}-${makeId(5)}-${makeId(5)}-${makeIdDate()}`;
  let expired_at = moment(new Date()).add(
    confApplication.session_timeout || 5,
    'minute'
  );
  let params = {
    user_id: data.id,
    section_id: data.section_id,
    token: token,
    expired_at: expired_at,
    status: 1,
  };
  let result = {
    token: token,
    expired_at: expired_at,
    session_timeout: confApplication.session_timeout || 5,
  };
  if (token == process.env.DEV_TOKEN) return result;
  await SysAuthentication.create(params, { transaction: trx });
  await SysAuthentication.destroy({
    where: {
      user_id: data.id,
      expired_at: { [Op.lt]: new Date() },
    },
    transaction: trx,
  });
  return result;
};

const superAdminAccess = () => {
  return {
    create: true,
    read: true,
    update: true,
    delete: true,
    print: true,
    workflow: true,
  };
};
