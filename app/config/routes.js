'use strict';

module.exports = function (app) {
  // var sync_table = require('../controller/sync_table');
  // app.route('/api/v1/sync-table').get(sync_table.sync);

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
};
