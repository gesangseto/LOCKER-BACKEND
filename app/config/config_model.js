const conf_table = () => {
  return {
    paranoid: true,
    freezeTableName: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
    deletedAt: "deleted_at",
  };
};
const is_force = () => {
  return true;
};

module.exports = {
  conf_table,
  is_force,
};
