"use strict";
const { Sequel } = require("../../config/connection");
const response = require("../../config/response");
const { encryptData } = require("../../helper/utils");
const { ConfApplication } = require("../../model/Config/application");

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let getData = await ConfApplication.findOne({ raw: true });
    delete getData.password;
    data.rows = [getData];
    data.count = 1;
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
    if (body.password) body.password = encryptData(body.password);
    else delete body.password;
    await ConfApplication.update(body, { where: { id: body.id } });
    await _exec.commit();
    return response.response(data, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};
