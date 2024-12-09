const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_transaction';
const LkrTransaction = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING },

    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    gross_amount: { type: DataTypes.FLOAT, allowNull: true },
    box_number: { type: DataTypes.STRING, allowNull: false },
    locker_name: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    pin_number: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    start_at: { type: DataTypes.DATE, allowNull: true },
    expire_at: { type: DataTypes.DATE, allowNull: true },
    card_number: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['id'] },
      { fields: ['gross_amount'] },
      { fields: ['box_number'] },
      { fields: ['locker_name'] },
      { fields: ['phone_number'] },
      { fields: ['pin_number'] },
      { fields: ['status'] },
      { fields: ['start_at'] },
      { fields: ['expire_at'] },
      { fields: ['card_number'] }
    ],
  }
);

LkrTransaction.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrTransaction = () => {
  let _res = ` SELECT 
  locker_transaction.*
FROM locker_transaction
WHERE locker_transaction.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrTransaction, queryLkrTransaction };
