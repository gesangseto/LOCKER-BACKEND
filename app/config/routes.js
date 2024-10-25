'use strict';

module.exports = function (app) {
  var sync_table = require('../controller/sync_table');
  app.route('/api/v1/sync-table').get(sync_table.sync);

  app.group('/api/v1/auth', (router) => {
    var login = require('../controller/Auth/login');
    router.post('/login', login.post);
  });

  app.group('/api/v1/admin', (router) => {
    var department = require('../controller/Admin/department');
    router.get('/department', department.get);
    router.put('/department', department.insert);
    router.post('/department', department.update);
    router.delete('/department', department.delete);
    var section = require('../controller/Admin/section');
    router.get('/section', section.get);
    router.put('/section', section.insert);
    router.post('/section', section.update);
    router.delete('/section', section.delete);
    var user = require('../controller/Admin/user');
    router.get('/user', user.get);
    router.put('/user', user.insert);
    router.post('/user', user.update);
    router.delete('/user', user.delete);
  });

  app.group('/api/v1/config', (router) => {
    var access_menu = require('../controller/Config/access_menu');
    router.get('/access-menu', access_menu.get);
    router.post('/access-menu', access_menu.update);
    var application = require('../controller/Config/application');
    router.get('/application', application.get);
    router.post('/application', application.update);
  });
  app.group('/api/v1/locker', (router) => {
    var customer = require('../controller/Locker/customer');
    router.get('/customer', customer.get);
    router.put('/customer', customer.insert);
    router.post('/customer', customer.update);
    var api_message = require('../controller/Locker/api_message');
    router.get('/api-message', api_message.get);
    router.put('/api-message', api_message.insert);
    router.post('/api-message', api_message.update);
    var transaction = require('../controller/Locker/transaction');
    router.get('/transaction', transaction.get);
    router.put('/transaction', transaction.insert);
    var access_report = require('../controller/Locker/access_report');
    router.get('/access-report/attribute', access_report.getAttributeReport);
    router.get('/access-report', access_report.get);
    router.post('/access-report', access_report.update);
  });
};
