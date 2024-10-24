const { DataTypes, Op } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');
const { AdmDepartment } = require('./department');

let tableName = 'adm_section';
const AdmSection = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    department_id: { type: DataTypes.BIGINT },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['code'], unique: true, name: 'UQ_adm_section_code' },
      { fields: ['name'] },
    ],
  }
);

AdmSection.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.log(error);

    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

AdmSection.belongsTo(AdmDepartment, {
  foreignKey: 'department_id',
  targetKey: 'id',
  as: '_department',
});

const queryAdmSection = () => {
  let _res = ` SELECT 
    adm_section.*,
    sys_status_information.code status_code,
    sys_status_information.name status_name,
    sys_status_information.is_final AS is_final,
    sys_status_information.is_lock_data AS is_lock_data,
    adm_department.code AS department_code,
    adm_department.name AS department_name
  FROM adm_section 
  LEFT JOIN sys_status_information ON adm_section.status = sys_status_information.id 
  LEFT JOIN adm_department ON adm_section.department_id = adm_department.id
  WHERE adm_section.deleted_at IS NULL`;
  return _res;
};

module.exports = { AdmSection, queryAdmSection };
