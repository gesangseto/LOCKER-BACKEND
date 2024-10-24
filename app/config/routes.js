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
  });
};
