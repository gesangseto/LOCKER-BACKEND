'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText } = require('../../helper/utils');
const { AdmDepartment } = require('../../model/Admin/department');
const { queryAdmSection, AdmSection } = require('../../model/Admin/section');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'adm_section.id' },
      { alias: 'code', original: 'adm_section.code' },
      { alias: 'name', original: 'adm_section.name' },
      { alias: 'description', original: 'adm_section.description' },
      { alias: 'status_name', original: 'sys_status_information.name' },
      { alias: 'department_id', original: 'adm_department.id' },
      { alias: 'department_name', original: 'adm_department.name' },
    ];
    let genQuery = new QueryBuilderV2(queryAdmSection(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('adm_section.id');
    // genQuery
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
    if (!body.department_id) throw new Error(`Department ID is required.`);

    let _department = await AdmDepartment.findOne({
      where: { id: body.department_id, status: 1 },
    });
    if (!_department) throw new Error(`Department is not found.`);

    delete body.id;
    let _res = await AdmSection.create(body, { transaction: _exec });
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

    if (!body.department_id) throw new Error(`Department ID is required.`);

    let _department = await AdmDepartment.findOne({
      where: { id: body.department_id, status: 1 },
    });
    if (!_department) throw new Error(`Department is not found.`);

    let _res = await AdmSection.update(body, {
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
    const require_data = ['id'];
    for (const row of require_data) {
      if (!body[`${row}`]) {
        throw new Error(`${humanizeText(row)} is required!`);
      }
    }
    let find = await AdmSection.findOne({ where: { id: body.id, status: 1 } });
    if (find) {
      let msg = require('../../constant/message.json');
      throw new Error(msg.error.delete_active);
    }
    let _res = await AdmSection.destroy({
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
