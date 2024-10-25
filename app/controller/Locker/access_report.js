'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const { queryAdmSection } = require('../../model/Admin/section');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { LkrAccessReport } = require('../../model/Locker/locker_access_report');
const { LkrTransaction } = require('../../model/Locker/locker_transaction');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let isSuper = false
    if (!req.headers.user_id && body.id == 'sa') {
      delete body.id;
      isSuper = true
    }

    let searchingParameter = [
      { alias: 'id', original: 'adm_section.id' },
      { alias: 'name', original: 'adm_section.name' },
      { alias: 'code', original: 'adm_section.code' },
      { alias: 'description', original: 'adm_section.description' },
      { alias: 'status_name', original: 'sys_status_information.name' },
      { alias: 'department_name', original: 'adm_department.name' },
    ];
    let genQuery = new QueryBuilderV2(queryAdmSection(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('adm_section.id');
    // genQuery
    let getData = await genQuery.getData();
    let newData = [];
    for (const it of getData) {
      it.access_column = []
      if (body.id) {
        let data = await LkrAccessReport.findOne({ where: { section_id: body.id } })
        if (data)
          it.access_column = data.access_column
      } else if (isSuper) {
        //ini super admin
        it.access_column = Object.keys(LkrTransaction.rawAttributes);
      }
      it.section_id = it.id;
      it.section_code = it.code;
      it.section_name = it.name;
      newData.push(it);
    }
    data.rows = newData;
    data.count = await genQuery.getCount();
    return response.response(data, res);
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

exports.getAttributeReport = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    data.rows = Object.keys(LkrTransaction.rawAttributes);
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
    if (!body.section_id) throw new Error(`Section id is required!`);
    if (!body.access_column && !body.items) throw new Error(`Items is required!`);
    body.access_column = body.access_column || body.items;
    let find = await LkrAccessReport.findOne({
      where: { section_id: body.section_id },
      transaction: _exec,
    });
    if (find) {
      find.access_column = body.access_column
      await find.save({ transaction: _exec })
    } else {
      await LkrAccessReport.create(body, { transaction: _exec, });
    }
    await _exec.commit();
    return response.response(data, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};
