'use strict';
const { removeFirstSpace } = require('../helper/utils');
const moment = require('moment');

exports.response = function (data = null, res, useLog = true) {
  let msg = null;
  try {
    msg = removeFirstSpace(data.message.split(`Error:`).pop());
  } catch (error) {
    msg = 'Success';
  }
  var body_res = {
    error: data.error || false,
    message: msg || 'Success',
    total: data.rows ? parseInt(data.rows.length) : 0,
    grand_total: data.count ? parseInt(data.count) : 0,
    data: data.rows || [],
  };
  if (data.status_code) {
    body_res.status_code = data.status_code;
  }
  // Set jika response memiliki original_error
  if (data.original_error && data.original_error.original) {
    let originError = data.original_error.original;
    body_res.error = `${originError} [${originError.detail}]`;
  }
  // Create Log On Response
  let _res = body_res;
  if (useLog) {
    console.log(`res : ${JSON.stringify(body_res)}`);
  } else {
    _res = {
      currentTime: body_res.currentTime,
      error: body_res.error,
      message: body_res.message,
    };
  }
  // End Create Log On Response
  res.json(_res);
  res.end();
};


exports.responseFile = function ({ content, fileName }, res) {
  let directory = appRoot + '/temp_file';
  const extExcel = ['xls', 'xlsx'];
  const extPdf = ['pdf'];
  const extZip = ['zip'];
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(fileName)[1];
  var name = fileName.replace(/\.[^/.]+$/, '');
  let dateFormat = moment().format('YYYY-MM-DD HHmmss');
  name = `${name}_${dateFormat}.${ext}`;
  if (!ext) {
    return null;
  }
  if (extExcel.includes(ext)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.sendFile(`${directory}/${fileName}`);
  } else if (extPdf.includes(ext) && content) {
    res.setHeader('Content-Type', 'application/pdf');
    return res.send(content);
  } else if (extPdf.includes(ext)) {
    res.setHeader('Content-Type', 'application/pdf');
    return res.sendFile(`${directory}/${fileName}`);
  } else if (extZip.includes(ext)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.sendFile(`${directory}/${fileName}`);
  }
  throw new Error('Error Send File');
};
