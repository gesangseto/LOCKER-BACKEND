const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_api_message';
const LkrApiMessage = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },

    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    unique_id: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    sync: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['id'] },
      { fields: ['unique_id'], unique: true, name: 'UQ_locker_api_message' },
    ],
  }
);

LkrApiMessage.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrApiMessage = () => {
  let _res = ` SELECT 
  locker_api_message.*
FROM locker_api_message
WHERE locker_api_message.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrApiMessage, queryLkrApiMessage };
