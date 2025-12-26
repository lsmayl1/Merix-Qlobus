const express = require("express");
const router = express.Router();

const { Suppliers, SupplierTransactions } = require("../../models/index");
const {
  GetSupplierByQuery,
  GetSupplierDebt,
} = require("../../services/SupplierService");

// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll({
      order: [["name", "ASC"]],
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type", "payment_method"],
      },
    });

    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }
    const suppliersWithDebt = await Promise.all(
      suppliers.map(async (supplier) => {
        const totalDebt = await GetSupplierDebt(supplier.id);
        return {
          ...supplier.toJSON(),
          totalDebt: totalDebt || 0,
        };
      })
    );

    res.status(200).json(suppliersWithDebt);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll({
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type"],
      },
    });

    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    const suppliersWithDebt = suppliers.map((supplier) => {
      const transactions = supplier.transactions || [];

      const totalDebt = transactions.reduce((acc, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "purchase") {
          return acc + amount;
        } else if (transaction.type === "payment") {
          return acc - amount;
        }
        return acc;
      }, 0);

      const { ...supplierData } = supplier.toJSON(); // DİKKAT: Burada transactions çıkarılıyor

      return {
        ...supplierData,
        totalDebt,
      };
    });

    res.status(200).json(suppliersWithDebt);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/query", async (req, res) => {
  const { query } = req.query;
  try {
    const suppliers = await GetSupplierByQuery(query);

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Name and contact info are required" });
    }
    const newSupplier = await Suppliers.create({ name, phone });
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  try {
    const supplier = await Suppliers.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    if (!name) {
      return res
        .status(400)
        .json({ message: "Name and contact info are required" });
    }
    supplier.name = name;
    supplier.phone = phone;
    await supplier.save();
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Suppliers.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await supplier.destroy();
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Suppliers.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
