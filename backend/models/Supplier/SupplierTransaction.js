const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database"); // Veritabanı bağlantısı

const SupplierTransactions = sequelize.define(
  "SupplierTransactions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("purchase", "payment", "return"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "credit"),
      allowNull: true, // sadece `type: payment` için anlamlı
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "supplier_transactions",
    timestamps: true,
  }
);

module.exports = SupplierTransactions;
