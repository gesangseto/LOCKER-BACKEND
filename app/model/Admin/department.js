const { DataTypes, Op } = require('sequelize');
const { conf_table } = require('../../config/config_model');
const { Sequel } = require('../../config/connection');

let tableName = 'adm_department';
const AdmDepartment = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
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
      { fields: ['code'], unique: true, name: 'UQ_adm_department_code' },
      { fields: ['name'] },
    ],
  }
);

AdmDepartment.sync({ alter: true })
  .then(() => {})
  .catch((error) => {
    console.log(error.sql);
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryAdmDepartment = () => {
  let _res = ` SELECT 
    adm_department.*,
    sys_status_information.code status_code,
    sys_status_information.is_final AS is_final,
    sys_status_information.is_lock_data AS is_lock_data,
    sys_status_information.name status_name
  FROM adm_department 
  LEFT JOIN sys_status_information ON adm_department.status = sys_status_information.id 
  WHERE adm_department.deleted_at IS NULL`;
  return _res;
};
module.exports = { AdmDepartment, queryAdmDepartment };
