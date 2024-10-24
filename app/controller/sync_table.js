'use strict';
const response = require('../config/response');
const fs = require('fs');
const { Sequel } = require('../config/connection');
const path = require('path');
const _dir = appRoot + '/app/migration';

function removeExtension(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}
exports.sync = async function (req, res) {
  var data = { rows: [req.query] };
  try {
    let list_file = fs.readdirSync(_dir);
    list_file = list_file.filter(
      (file) => path.extname(file).toLowerCase() === '.sql'
    );
    list_file = list_file.sort();
    for (const file of list_file) {
      // Sync table
      let tableName = removeExtension(file).replace(/^\d+\.\s*/, '');
      console.log(`Sync table ${tableName} . . . `);
      if (tableName !== 'all_function') {
        let model = Sequel.models[tableName];
        await model
          .sync({ alter: true })
          .then(() => {})
          .catch((error) => {
            console.log(error);
          });
      }
      // Eksekusi query table
      console.log(`Query to table ${tableName} . . . `);
      let query = await new Promise((resolve, reject) => {
        fs.readFile(`${_dir}/${file}`, 'utf-8', function (err, content) {
          if (err) console.log(err);
          return resolve(content);
        });
      });
      await Sequel.query(query)
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
      console.log(`======================================================`);
    }
    data.rows = list_file;
    return response.response(data, res);
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    data.original_error = error;
    return response.response(data, res);
  }
};
