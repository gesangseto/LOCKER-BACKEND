const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_user';
const LkrUser = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },

    update_at: { type: DataTypes.DATE }, //Request Jay

    id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false },
    pin_number: { type: DataTypes.STRING, allowNull: true },
    card_number: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },

  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['id'] },
      { fields: ['username'] },
      { fields: ['phone_number'] },
      { fields: ['pin_number'] },
      { fields: ['status'] },
    ],
  }
);

LkrUser.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrUser = () => {
  let _res = ` SELECT 
  locker_user.*
FROM locker_user
WHERE locker_user.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrUser, queryLkrUser };
