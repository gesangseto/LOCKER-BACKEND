const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');

let tableName = 'locker_box';
const LkrBox = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },

    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    number: { type: DataTypes.INTEGER, allowNull: false },
    module: { type: DataTypes.INTEGER, allowNull: false },
    cabinet: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING(2), allowNull: false },
    status: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'enable' },

  },
  {
    paranoid: false,
    freezeTableName: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
    indexes: [
      { fields: ['id'] },
      { fields: ['number'], unique: true, name: 'UQ_locker_box_number' },
      { fields: ['cabinet', 'module'], unique: true, name: 'UQ_locker_box_cb_md' },
      { fields: ['number'] },
      { fields: ['module'] },
      { fields: ['cabinet'] },
      { fields: ['size'] },
      { fields: ['status'] },
    ],
  }
);

LkrBox.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });


const queryGroupLkrBox = () => {
  let _res = `SELECT 
    MAX(locker_box.module) AS module,
    MAX(locker_box.cabinet) AS cabinet,
    MAX(locker_box.size) AS size
  FROM locker_box
  WHERE 1+1=2 `;
  return _res;
};
const queryLkrBox = () => {
  let _res = `SELECT *
  FROM locker_box
  WHERE 1+1=2 `;
  return _res;
};
module.exports = { LkrBox, queryGroupLkrBox, queryLkrBox };
