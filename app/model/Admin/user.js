const { DataTypes, Op } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');
const { AdmSection } = require('./section');

let tableName = 'adm_user';
const AdmUser = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    section_id: { type: DataTypes.BIGINT, allowNull: false },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    password: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT },
    layout_config: { type: DataTypes.JSON },
    status: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['email'], unique: true, name: 'UQ_adm_user_email' },
      { fields: ['name'] },
      { fields: ['phone'] },
    ],
  }
);

AdmUser.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

AdmUser.belongsTo(AdmSection, {
  foreignKey: 'section_id',
  targetKey: 'id',
  as: '_section',
});

const queryAdmUser = () => {
  let _res = ` SELECT 
  adm_user.*,
  sys_status_information.code status_code,
  sys_status_information.name status_name,
  sys_status_information.is_final AS is_final,
  sys_status_information.is_lock_data AS is_lock_data,
  adm_department.id AS department_id,
  adm_department.code AS department_code,
  adm_department.name AS department_name,
  adm_section.code AS section_code,
  adm_section.name AS section_name
FROM adm_user
LEFT JOIN adm_section ON adm_section.id = adm_user.section_id
LEFT JOIN sys_status_information ON adm_user.status = sys_status_information.id 
LEFT JOIN adm_department ON adm_section.department_id = adm_department.id
WHERE adm_user.deleted_at IS NULL`;
  return _res;
};
module.exports = { AdmUser, queryAdmUser };
