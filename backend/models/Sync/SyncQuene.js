const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const SyncQueue = sequelize.define(
  "SyncQueue",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entity: DataTypes.STRING,
    record_id: DataTypes.UUID,
    action: DataTypes.STRING,
    payload: DataTypes.JSONB,
    attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("pending", "processing", "success", "failed"),
      defaultValue: "pending",
    },
    last_error: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "sync_queue",
    timestamps: false,
  }
);

module.exports = SyncQueue;
