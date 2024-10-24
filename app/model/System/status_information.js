const { DataTypes } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');

const SysStatusInformation = Sequel.define(
  'sys_status_information',
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    uri: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    is_lock_data: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_final: { type: DataTypes.BOOLEAN },
    sys: { type: DataTypes.BOOLEAN },
  },
  {
    ...conf_table(),
    paranoid: false,
    indexes: [
      { fields: ['id'] },
      { fields: ['code'] },
      { fields: ['name'] },
      { fields: ['uri'] },
      {
        unique: true,
        fields: ['code'],
        name: 'UQ_sys_status_information_code',
      },
    ],
  }
);

SysStatusInformation.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.error('SysStatusInformation kesalahan saat melakukan sync:', error);
  });

const querySysStatusInformation = () => {
  let _res = `SELECT 
    *
    FROM sys_status_information
    WHERE 1+1=2`;
  return _res;
};
module.exports = { SysStatusInformation, querySysStatusInformation };
