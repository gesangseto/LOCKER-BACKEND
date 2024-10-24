const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { SysMenuModule } = require('./menu_module');
const { SysStatusInformation } = require('./status_information');

let tableName = 'sys_menu';
const SysMenu = Sequel.define(
  tableName,
  {
    menu_module_id: { type: DataTypes.BIGINT, allowNull: false },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    parent_id: { type: DataTypes.BIGINT },
    name: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
    can_create: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_read: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_update: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_delete: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_print: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_workflow: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { fields: ['menu_module_id'] },
      { fields: ['id'] },
      { fields: ['parent_id'] },
      { fields: ['name'] },
      { fields: ['url'] },
    ],
  }
);
SysMenu.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.log(error.sql);
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

SysMenu.belongsTo(SysMenuModule, {
  foreignKey: 'menu_module_id',
  targetKey: 'id',
  as: '_sys_menu_module',
});

SysMenu.belongsTo(SysStatusInformation, {
  foreignKey: 'status',
  targetKey: 'id',
  as: '_status',
});

const querySysMenu = () => {
  let _res = ` SELECT 
    sys_menu.* 
  FROM sys_menu
  LEFT JOIN sys_menu_module ON sys_menu.menu_module_id = sys_menu_module.id`;
  return _res;
};

module.exports = { SysMenu, querySysMenu };
