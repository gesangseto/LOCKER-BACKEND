'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { ExportDataToXLS } = require('../../lib/export-data');
const { queryLkrTransaction, LkrTransaction } = require('../../model/Locker/locker_transaction');


const exportFile = ({ items, res, body }) => {
  let fields = JSON.parse(body.fieldTable)
  let headerField = {}
  for (const it of fields) {
    headerField[it.label] = it.key
  }
  let MakeFile = new ExportDataToXLS({
    headerTrx: headerField,
    items: items,
    title: `Transaction-Report`,
    res: res,
  });
  return MakeFile.generateCsv();
};


exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'locker_transaction.id' },
      { alias: 'type', original: 'locker_transaction.type' },
      { alias: 'sync', original: 'locker_transaction.sync' },
    ];
    let genQuery = new QueryBuilderV2(queryLkrTransaction(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('locker_transaction.id');
    if (body.export && body.export_type) {
      return exportFile({ items: await genQuery.getData(), res: res, body: body })
    }
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
    let _res = await LkrTransaction.create(body, { transaction: _exec });
    await _exec.commit();
    return response.response(_res, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};


