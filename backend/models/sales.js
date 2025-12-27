const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Sales = sequelize.define(
  "Sales",
  {
    sale_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // otomatik uuid üretsin
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Varsayılan olarak şu anki tarih/saat
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2), // 10 hane, 2 ondalık
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2), // İndirim yüzdesi
      defaultValue: 0.0, // Varsayılan indirim %0
    },
    discounted_amount: {
      type: DataTypes.DECIMAL(10, 2), // İndirimli tutar
      defaultValue: 0.0,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card"), // Ödeme yöntemi: nakit, kart, kredi
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM("sale", "return"), // İşlem türü:
      allowNull: false,
      defaultValue: "sale", // Varsayılan olarak "sale"
    },
  },
  {
    timestamps: false, // Sequelize’nin otomatik createdAt/updatedAt eklemesini kapat
    tableName: "sales", // Tablo adı
  }
);

module.exports = Sales;
