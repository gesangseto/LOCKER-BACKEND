const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');

const SysLog = Sequel.define(
  'sys_log',
  {
    created_by: { type: DataTypes.BIGINT },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    path: { type: DataTypes.STRING, allowNull: false },
    method: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.JSON },
    user_agent: { type: DataTypes.STRING, allowNull: false },
    ip_address: { type: DataTypes.STRING, allowNull: false },
  },
  {
    freezeTableName: true,
    createdAt: 'created_at',
    indexes: [
      { fields: ['id'] },
      { fields: ['path'] },
      { fields: ['method'] },
      { fields: ['user_agent'] },
      { fields: ['ip_address'] },
    ],
  }
);

SysLog.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.error(`sys_log kesalahan saat melakukan sync`);
  });

const querySysLog = () => {
  let _res = ` SELECT 
    * 
  FROM sys_log`;
  return _res;
};
module.exports = { SysLog, querySysLog };
