const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');

const SysMenuModule = Sequel.define(
  'sys_menu_module',
  {
    status: { type: DataTypes.INTEGER, defaultValue: 0 },

    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    is_mobile: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { fields: ['id'] },
      { fields: ['name'] },
      { fields: ['code'], unique: true, name: 'UQ_sys_menu_module_code' },
    ],
  }
);
SysMenuModule.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.log(error.sql);
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const querySysMenuModule = () => {
  let _res = ` SELECT * FROM sys_menu_module`;
  return _res;
};
module.exports = { SysMenuModule, querySysMenuModule };
