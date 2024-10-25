const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_customer';
const LkrCustomer = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },

    update_at: { type: DataTypes.DATE }, //Request Jay

    id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
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
      { fields: ['box_number'] },
      { fields: ['locker_name'] },
      { fields: ['phone_number'] },
      { fields: ['pin_number'] },
      { fields: ['status'] },
    ],
  }
);

LkrCustomer.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrCustomer = () => {
  let _res = ` SELECT 
  locker_customer.*
FROM locker_customer
WHERE locker_customer.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrCustomer, queryLkrCustomer };
