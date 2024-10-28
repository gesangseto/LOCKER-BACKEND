const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_size';
const LkrSize = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    size: { type: DataTypes.STRING(2), allowNull: false },
    price: { type: DataTypes.STRING, allowNull: false },

  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['id'] },
      { fields: ['size'], unique: true, name: 'UQ_locker_size' },
      { fields: ['price'] },
    ],
  }
);

LkrSize.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrSize = () => {
  let _res = ` SELECT 
  locker_size.*
FROM locker_size
WHERE locker_size.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrSize, queryLkrSize };
