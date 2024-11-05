const moment = require('moment');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { sqlInjectionPrevention } = require('./app/helper/utils');
require('express-group-routes');
const fs = require('fs');

global.appRoot = path.resolve(__dirname);
global.memCache = {};

dotenv.config();
var express = require('express'),
  app = express(),
  port = process.env.APP_PORT,
  bodyParser = require('body-parser');

app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// LOAD MIDDLEWARE OAUTH
var middleware = require('./app/middleware/middleware');
app.use(async function (req, res, next) {
  // Create log for request
  let request = {
    currentTime:
      moment().format('Y-MM-D') + ' ' + moment().format('HH:mm:ss:SSS'),
    client_ip: req.headers['x-forwarded-for'] || req.ip,
    method: req.method,
    path: req.originalUrl,
    // body: req.body,
  };
  console.log('======================================================');
  console.log(`req : ${JSON.stringify(request).substring(0, 500)}`);
  // PREVENT FROM SQL INJECTION
  if (req.method === 'GET') {
    req.query = sqlInjectionPrevention(req.query);
  } else {
    req.body = sqlInjectionPrevention(req.body);
  }
  // next();
  let check_token = await middleware.check_token(req, res);
  let create_log = process.env.CREATE_TOKEN;
  if (!check_token) {
    return;
  } else if (req.method != 'GET' && create_log) {
    await middleware.create_log(req, res);
  }
  next();
});
// END MIDDLEWARE OAUTH
const createTempFolder = () => {
  let _dir = appRoot + '/temp_file';
  if (!fs.existsSync(_dir)) fs.mkdirSync(_dir, { recursive: true });
};

createTempFolder();
var routes = require('./app/config/routes');
routes(app);

app.listen(port);
console.log(`${process.env.APP_NAME} started on port: ${port}`);
