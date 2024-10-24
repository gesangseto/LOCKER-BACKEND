const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { AdmUser } = require('../Admin/user');

const SysAuthentication = Sequel.define(
  'sys_authentication',
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    section_id: { type: DataTypes.BIGINT, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    expired_at: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { fields: ['id'] },
      { fields: ['user_id'] },
      { fields: ['section_id'] },
      {
        unique: true,
        fields: ['token'],
        name: 'UQ_sys_authentication_token',
      },
    ],
  }
);

SysAuthentication.belongsTo(AdmUser, {
  foreignKey: 'user_id',
  targetKey: 'id',
  as: '_user',
});

SysAuthentication.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.error(`SysAuthentication kesalahan saat melakukan sync`);
  });

const querySysAuthentication = () => {
  let _res = ` SELECT 
    sys_menu.* 
  FROM sys_menu
  LEFT JOIN sys_menu_module ON sys_menu.menu_module_id = sys_menu_module.id`;
  return _res;
};
module.exports = { SysAuthentication, querySysAuthentication };
