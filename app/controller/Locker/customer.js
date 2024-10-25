'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText } = require('../../helper/utils');
const { queryLkrCustomer, LkrCustomer } = require('../../model/Locker/locker_customer');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'locker_customer.id' },
      { alias: 'box_number', original: 'locker_customer.box_number' },
      { alias: 'locker_name', original: 'locker_customer.locker_name' },
      { alias: 'phone_number', original: 'locker_customer.phone_number' },
      { alias: 'status', original: 'locker_customer.status' },
    ];
    let genQuery = new QueryBuilderV2(queryLkrCustomer(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('locker_customer.id');
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
    let _res = await LkrCustomer.create(body, { transaction: _exec });
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

    delete body.box_number
    delete body.locker_name
    delete body.phone_number
    delete body.pin_number
    delete body.card_number

    let _res = await LkrCustomer.update(body, {
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

