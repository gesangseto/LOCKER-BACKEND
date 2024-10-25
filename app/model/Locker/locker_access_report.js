const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_access_report';
const LkrAccessReport = Sequel.define(
  tableName,
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    section_id: { type: DataTypes.BIGINT, allowNull: false },
    access_column: { type: DataTypes.JSON, allowNull: false },
  },
  {
    ...conf_table(),
    paranoid: false,
    indexes: [
      { fields: ['id'] },
      {
        unique: true,
        fields: ['section_id'],
        name: 'UQ_locker_access_report',
      },
    ],
  }
);

LkrAccessReport.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrAccessReport = (section_id, type) => {
  let query = `SELECT 
    locker_access_report.*
  FROM locker_access_report
  WHERE locker_access_report.section_id =${section_id} `;
  return query;
};

module.exports = { LkrAccessReport, queryLkrAccessReport };
