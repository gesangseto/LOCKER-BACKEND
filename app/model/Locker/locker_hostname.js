const { DataTypes } = require('sequelize');
const { Sequel } = require('../../config/connection');
const { conf_table } = require('../../config/config_model');

let tableName = 'locker_hostname';
const LkrHostname = Sequel.define(
  tableName,
  {
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },

    update_at: { type: DataTypes.DATE }, //Request Jay

    id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
    locker_name: { type: DataTypes.STRING, allowNull: false },
    locker_id: { type: DataTypes.STRING, allowNull: false },
    locker_ip: { type: DataTypes.STRING(30), allowNull: true },
  },
  {
    ...conf_table(),
    indexes: [
      { fields: ['id'] },
      { fields: ['locker_name'] },
      { fields: ['locker_id'] },
      { fields: ['locker_ip'] },
    ],
  }
);

LkrHostname.sync({ alter: true })
  .then(() => { })
  .catch((error) => {
    console.error(`${tableName} kesalahan saat melakukan sync`);
  });

const queryLkrHostname = () => {
  let _res = ` SELECT 
  locker_hostname.*
FROM locker_hostname
WHERE locker_hostname.deleted_at IS NULL`;
  return _res;
};
module.exports = { LkrHostname, queryLkrHostname };
