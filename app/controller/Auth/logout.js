'use strict';

const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const { SysAuthentication } = require('../../model/Auth/authentication');

exports.post = async function (req, res) {
  var data = { rows: [req.body] };
  var _exec = await Sequel.transaction();
  try {
    await SysAuthentication.destroy({
      where: { token: req.headers['token'] },
      transaction: _exec,
    });

    data.message = `Logout success.`;
    _exec.commit();
    return response.response(data, res);
  } catch (error) {
    console.log(error);
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};
