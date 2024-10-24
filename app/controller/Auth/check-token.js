'use strict';
const response = require('../../config/response');

exports.get = async function (req, res) {
  var data = {
    rows: [
      {
        user_id: req.headers['user_id'],
        section_id: req.headers['section_id'],
        token: req.headers['token'],
        expired_at: req.headers['expired_at'],
      },
    ],
  };
  try {
    return response.response(data, res);
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};
