'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText } = require('../../helper/utils');
const { LkrHostname, queryLkrHostname } = require('../../model/Locker/locker_hostname');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'locker_hostname.id' },
      { alias: 'locker_name', original: 'locker_hostname.locker_name' },
      { alias: 'locker_id', original: 'locker_hostname.locker_id' },
      { alias: 'locker_ip', original: 'locker_hostname.locker_ip' },
    ];
    let genQuery = new QueryBuilderV2(queryLkrHostname(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('locker_hostname.id');
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

exports.update = async function (req, res) {
  var data = { data: req.body };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;
    if (!body.id) throw new Error(`ID is required`);
    let require = ['id']
    for (const row of require) {
      if (!body[`${row}`]) {
        throw new Error(`${humanizeText(row)} is required.`);
      }
    }
    let _res = await LkrHostname.update(body, {
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

