const { DataTypes, Op } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');
const { SysMenu } = require('../System/menu');
const { AdmSection } = require('./section');

let tableName = 'conf_access_menu';
const ConfAccessMenu = Sequel.define(
  tableName,
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    section_id: { type: DataTypes.BIGINT, allowNull: false },
    menu_id: { type: DataTypes.BIGINT, allowNull: false },
    create: { type: DataTypes.BOOLEAN },
    read: { type: DataTypes.BOOLEAN },
    update: { type: DataTypes.BOOLEAN },
    delete: { type: DataTypes.BOOLEAN },
    print: { type: DataTypes.BOOLEAN },
    workflow: { type: DataTypes.BOOLEAN },
  },
  {
    ...conf_table(),
    paranoid: false,
    indexes: [
      { fields: ['id'] },
      {
        unique: true,
        fields: ['section_id', 'menu_id'],
        name: 'UQ_conf_access_menu_section_menu',
      },
    ],
  }
);

ConfAccessMenu.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.log(error);
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

ConfAccessMenu.belongsTo(AdmSection, {
  foreignKey: 'section_id',
  targetKey: 'id',
  as: '_section',
});
ConfAccessMenu.belongsTo(SysMenu, {
  foreignKey: 'menu_id',
  targetKey: 'id',
  as: '_menu',
});

const queryAccessMenu = (section_id, type) => {
  let query = `SELECT 
  conf_access_menu.*,
  sys_menu.*,
  sys_menu_module.name AS menu_module_name,
  sys_menu_module.code AS menu_module_code,
  sys_menu_module.is_mobile AS is_mobile
FROM sys_menu
LEFT JOIN conf_access_menu ON conf_access_menu.menu_id = sys_menu.id  AND conf_access_menu.section_id =${section_id}
LEFT JOIN sys_menu_module ON sys_menu_module.id =  sys_menu.menu_module_id
WHERE sys_menu.status = 1 `;

  if (type && type.toString().toLowerCase() == 'mobile') {
    query += ` AND sys_menu_module.is_mobile = TRUE `;
  } else if (type && type.toString().toLowerCase() == 'website') {
    query += ` AND (sys_menu_module.is_mobile = FALSE OR  sys_menu_module.is_mobile IS NULL )  `;
  }
  query += ` ORDER BY sys_menu.order ; `;
  return query;
};
const queryAccessMenuFiter = (section_id, type) => {
  let query = `SELECT 
  conf_access_menu.*,
  sys_menu.*,
  sys_menu_module.name AS menu_module_name,
  sys_menu_module.code AS menu_module_code,
  sys_menu_module.is_mobile AS is_mobile
FROM sys_menu
LEFT JOIN conf_access_menu ON conf_access_menu.menu_id = sys_menu.id  AND conf_access_menu.section_id =${section_id}
LEFT JOIN sys_menu_module ON sys_menu_module.id =  sys_menu.menu_module_id
WHERE sys_menu.status = 1 AND 
(conf_access_menu.create is true OR conf_access_menu.read is true or conf_access_menu.update is true or conf_access_menu.delete is true or conf_access_menu.print is true or conf_access_menu.workflow is true 
or sys_menu.parent_id is NULL) 
`;
  if (type && type.toString().toLowerCase() == 'mobile') {
    query += ` AND sys_menu_module.is_mobile = TRUE `;
  } else if (type && type.toString().toLowerCase() == 'website') {
    query += ` AND (sys_menu_module.is_mobile = FALSE OR  sys_menu_module.is_mobile IS NULL )  `;
  }
  query += ` ORDER BY sys_menu.order ; `;
  return query;
};

module.exports = {
  ConfAccessMenu,
  queryAccessMenu,
  queryAccessMenuFiter,
};
