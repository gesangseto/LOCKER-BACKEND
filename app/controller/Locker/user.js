'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText } = require('../../helper/utils');
const { queryLkrUser, LkrUser } = require('../../model/Locker/locker_user');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'locker_user.id' },
      { alias: 'username', original: 'locker_user.username' },
      { alias: 'phone_number', original: 'locker_user.phone_number' },
      { alias: 'pin_number', original: 'locker_user.pin_number' },
      { alias: 'status', original: 'locker_user.status' },
    ];
    let genQuery = new QueryBuilderV2(queryLkrUser(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('locker_user.id');
    let getData = await genQuery.getDataAndCountAll();
    data.rows = getData.rows;
    data.count = getData.count;
    return response.response(data, res);
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

exports.insert = async function (req, res) {
  var data = { rows: [req.body] };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;
    let _res = await LkrUser.create(body, { transaction: _exec });
    await _exec.commit();
    return response.response(_res, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

exports.update = async function (req, res) {
  var data = { data: req.body };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;
    if (!body.id) throw new Error(`ID is required`);
    let require = ['id', 'status']
    for (const row of require) {
      if (!body[`${row}`]) {
        throw new Error(`${humanizeText(row)} is required.`);
      }
    }

    let _res = await LkrUser.update(body, {
      where: { id: body.id },
      transaction: _exec,
    });
    await _exec.commit();
    return response.response(_res, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

exports.delete = async function (req, res) {
  var data = { data: req.body };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;
    if (!body.id) throw new Error(`ID is required`);

    let _res = await LkrUser.destroy({
      where: { id: body.id },
      transaction: _exec,
    });
    await _exec.commit();
    return response.response(_res, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

