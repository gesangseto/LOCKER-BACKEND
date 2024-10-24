const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

var conf = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};

// Option 3: Passing parameters separately (other dialects)
const Sequel = new Sequelize(conf.database, conf.user, conf.password, {
  host: conf.host,
  dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000, // waktu dalam milidetik untuk menunggu koneksi
    idle: 10000,
  },
});

// Sequel.query('CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;');
// Sequel.query('SELECT drop_unique_constraints_with_key();');

module.exports = { Sequel, Op };
