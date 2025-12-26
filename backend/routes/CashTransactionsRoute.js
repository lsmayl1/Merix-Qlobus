const express = require("express");
const router = express.Router();
const {
  CashTransactions,
  Sequelize,
  Sales,
  Op,
  SalesDetails,
} = require("../models");
const formatDate = require("../utils/dateUtils");
// GetAll Transactions

router.post("/", async (req, res) => {
  const { from, to } = req.body;

  const fromDate = new Date(from);
  let toDate = to ? new Date(to) : new Date(from);
  if (!to) toDate.setHours(23, 59, 59, 999); // Aynı günün sonuna kadar

  // Tarih kontrolü
  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return res.status(400).json({ error: "Geçersiz tarih formatı" });
  }

  try {
    // Günlük nakit işlemleri
    const transactions = await CashTransactions.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["date", "DESC"]],
    });

    let todayIncome = 0;
    let todayExpense = 0;

    const formatted = transactions.map((t) => {
      if (t.transactionType === "in") {
        todayIncome += parseFloat(t.amount);
      } else if (t.transactionType === "out") {
        todayExpense += parseFloat(t.amount);
      }

      const amount =
        t.transactionType === "out"
          ? `- ${parseFloat(t.amount).toFixed(2)}`
          : `+ ${parseFloat(t.amount).toFixed(2)}`;

      return {
        ...t.toJSON(),
        date: formatDate(t.date),
        amount,
      };
    });

    // Satışlardan ciro ve kar hesapla
    let totalRevenue = 0;
    let totalProfit = 0;

    const dailySales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details", // ilişkideki alias buysa
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
      attributes: ["transaction_type", "date"],
    });

    dailySales.forEach((sale) => {
      const isReturn = sale.transaction_type === "return";

      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const revenue = Number(detail.sell_price) * Number(detail.quantity);
          const profit =
            (Number(detail.sell_price) - Number(detail.buy_price)) *
            Number(detail.quantity);

          if (isReturn) {
            totalRevenue -= revenue;
            totalProfit -= profit;
          } else {
            totalRevenue += revenue;
            totalProfit += profit;
          }
        });
      }
    });

    res.json({
      transactions: formatted,
      todayIncome: `${todayIncome.toFixed(2)} ₼`,
      todayExpense: `- ${todayExpense.toFixed(2)} ₼`,
      todayTotal: `${(todayIncome - todayExpense + totalRevenue).toFixed(2)} ₼`,
      totalRevenue: `${totalRevenue.toFixed(2)} ₼`,
      totalProfit: `${totalProfit.toFixed(2)} ₼`,
    });
  } catch (error) {
    console.error("Hesaplama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});
// Create
router.post("/create-transaction", async (req, res) => {
  try {
    const { date, transactionType, amount, description, paymentMethod } =
      req.body;

    if (!transactionType || !amount || !paymentMethod) {
      return res.status(400).json({
        error: "transactionType, amount ve paymentMethod zorunludur.",
      });
    }

    const transaction = await CashTransactions.create({
      date: date || new Date(),
      transactionType,
      amount,
      description,
      paymentMethod,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, transactionType, amount, description, paymentMethod } =
    req.body;
  try {
    const transaction = await CashTransactions.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.date = date || transaction.date;
    transaction.transactionType =
      transactionType || transaction.transactionType;
    transaction.amount = amount || transaction.amount;
    transaction.description = description || transaction.description;
    transaction.paymentMethod = paymentMethod || transaction.paymentMethod;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await CashTransactions.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await transaction.destroy();
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
