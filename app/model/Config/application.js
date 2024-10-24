const { DataTypes } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');
let tableName = 'conf_application';
const ConfApplication = Sequel.define(
  tableName,
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING },
    logo: { type: DataTypes.TEXT },
    session_timeout: { type: DataTypes.INTEGER },
    multiple_login: { type: DataTypes.BOOLEAN },
    date_format: { type: DataTypes.STRING },
  },
  { ...conf_table() }
);

ConfApplication.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.log(error);
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

module.exports = { ConfApplication };
