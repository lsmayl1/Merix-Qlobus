const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database"); // Veritabanı bağlantısı

const Suppliers = sequelize.define(
  "Suppliers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
  }
);

module.exports = Suppliers;
