'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText, encryptData } = require('../../helper/utils');
const { AdmSection } = require('../../model/Admin/section');
const { queryAdmUser, AdmUser } = require('../../model/Admin/user');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'adm_user.id' },
      { alias: 'name', original: 'adm_user.name' },
      { alias: 'email', original: 'adm_user.email' },
      { alias: 'phone', original: 'adm_user.phone' },
      { alias: 'status_name', original: 'sys_status_information.name' },
      { alias: 'department_name', original: 'adm_department.name' },
      { alias: 'section_name', original: 'adm_section.name' },
    ];
    let genQuery = new QueryBuilderV2(queryAdmUser(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('adm_user.id');
    let getData = await genQuery.getDataAndCountAll();
    let newData = [];
    for (const it of getData.rows) {
      delete it.password;
      newData.push(it);
    }
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

    if (!body.section_id) throw new Error(`Section ID is required.`);

    let _section = await AdmSection.findOne({
      where: { id: body.section_id, status: 1 },
    });
    if (!_section) throw new Error(`Section is not found.`);

    delete body.id;
    body.password = encryptData(body.password);
    let _res = await AdmUser.create(body, { transaction: _exec });
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

    if (body.section_id) {
      let _section = await AdmSection.findOne({
        where: { id: body.section_id, status: 1 },
      });
      if (!_section) throw new Error(`Section is not found.`);
    }


    if (body.password) body.password = encryptData(body.password);
    else delete body.password;
    let _res = await AdmUser.update(body, {
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
  var _exec = await Sequel.transaction();
  var data = { data: req.body };
  try {
    let body = req.body;
    const require_data = ['id'];
    for (const row of require_data) {
      if (!body[`${row}`]) {
        throw new Error(`${humanizeText(row)} is required!`);
      }
    }
    let find = await AdmUser.findOne({ where: { id: body.id, status: 1 } });
    if (find) {
      let msg = require('../../constant/message.json');
      throw new Error(msg.error.delete_active);
    }
    let _res = await AdmUser.destroy({
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
