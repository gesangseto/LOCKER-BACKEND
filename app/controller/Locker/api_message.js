'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText } = require('../../helper/utils');
const { queryLkrApiMessage, LkrApiMessage } = require('../../model/Locker/locker_api_message');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'locker_api_message.id' },
      { alias: 'unique_id', original: 'locker_api_message.unique_id' },
      { alias: 'sync', original: 'locker_api_message.sync' },
    ];
    let genQuery = new QueryBuilderV2(queryLkrApiMessage(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('locker_api_message.id');
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
    let _res = await LkrApiMessage.create(body, { transaction: _exec });
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
    let require = ['id', 'status', 'update_at']
    for (const row of require) {
      if (!body[`${row}`]) {
        throw new Error(`${humanizeText(row)} is required.`);
      }
    }

    delete body.unique_id
    delete body.message

    let _res = await LkrApiMessage.update(body, {
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

