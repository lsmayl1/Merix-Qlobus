const {
  Products,
  SupplierTransactionDetails,
  SupplierTransactions,
  ProductStock,
  Suppliers,
  Op,
} = require("../models");
const AppError = require("../utils/AppError");
const formatDate = require("../utils/dateUtils");

const GetSupplierByQuery = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      throw new AppError("Query must be at least 2 characters long", 400);
    }

    const suppliers = await Suppliers.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`, // Kelimenin herhangi bir yerinde geçmesine izin ver
        },
      },
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type"],
      },
      order: [["name", "ASC"]],
      limit: 50, // En fazla 20 ürün getir
    });

    if (suppliers.length > 0) {
      const suppliersWithDebt = suppliers.map((supplier) => {
        const transactions = supplier.transactions || [];

        const totalDebt = transactions.reduce((acc, transaction) => {
          const amount = Number(transaction.amount) || 0;

          if (transaction.type === "purchase" && payment_method === "credit") {
            return acc + amount;
          } else if (
            transaction.type === "payment" &&
            payment_method === "credit"
          ) {
            return acc - amount;
          }
          return acc;
        }, 0);

        // Explicitly exclude transactions from the supplier data
        const { transactions: _, ...supplierData } = supplier.toJSON();

        return {
          ...supplierData,
          totalDebt,
        };
      });
      return suppliersWithDebt;
    } else {
      throw new AppError("No suppliers found for the given query", 404);
    }
  } catch (error) {
    throw error;
  }
};

const CreateTransaction = async (data) => {
  const {
    date,
    supplier_id,
    products,
    transaction_date,
    transaction_type,
    payment_method,
  } = data;

  let t; // ← burada tanımlıyoruz
  try {
    // Transaction (veritabanı işlemi) başlatıyoruz
    if (products.length === 0) {
      throw new AppError("Products list cannot be empty", 400);
    }
    t = await Products.sequelize.transaction();

    let totalAmount = 0;

    // 1) Ürünleri kontrol et / oluştur / güncelle
    for (const p of products) {
      let product = await Products.findOne({
        where: { barcode: p.barcode },
        transaction: t,
      });

      if (product) {
        // Gerekirse güncelle
        await product.update(
          {
            name: p.name || product.name,
            buyPrice: p.buyPrice || product.buyPrice,
            sellPrice: p.sellPrice || product.sellPrice,
          },
          { transaction: t }
        );
      } else {
        // Yeni ürün oluştur
        product = await Products.create(
          {
            name: p.name,
            barcode: p.barcode,
            buyPrice: p.buyPrice,
            sellPrice: p.sellPrice || 0,
            unit: p.unit,
          },
          { transaction: t }
        );
      }
      // 1.1) Stok güncelleme
      let stockRecord = await ProductStock.findOne({
        where: { product_id: product.product_id },
        transaction: t,
      });

      let stockChange =
        transaction_type === "purchase"
          ? Number(p.quantity)
          : -Number(p.quantity);

      if (stockRecord) {
        const prevStock = Number(stockRecord.current_stock) || 0;

        // Güncelle
        await stockRecord.update(
          {
            current_stock: prevStock + stockChange,
          },
          { transaction: t }
        );
      } else {
        // Yeni stok kaydı oluştur
        await ProductStock.create(
          {
            product_id: product.product_id,
            current_stock: stockChange > 0 ? stockChange : 0, // ilk kayıt için negatif olmasın
          },
          { transaction: t }
        );
      }

      // Toplam fiyatı hesapla
      const lineTotal = p.quantity * p.buyPrice;
      totalAmount += lineTotal;

      // Ürün objesine transaction için ID ekleyelim
      p.product_id = product.product_id;
      p.total_price = lineTotal;
    }

    // 2) SupplierTransaction kaydını oluştur
    const supplierTransaction = await SupplierTransactions.create(
      {
        date: date || new Date(),
        supplier_id,
        transaction_date: transaction_date || new Date(),
        amount: totalAmount,
        type: transaction_type,
        payment_method: payment_method,
      },
      { transaction: t }
    );

    // 3) SupplierTransactionDetails kayıtlarını oluştur
    const detailsData = products.map((p) => ({
      transaction_id: supplierTransaction.id,
      supplier_id: supplier_id,
      product_id: p.product_id,
      quantity: p.quantity,
      unit_price: p.buyPrice,
      total_price: p.total_price,
    }));

    await SupplierTransactionDetails.bulkCreate(detailsData, {
      transaction: t,
    });

    // Commit işlemi
    await t.commit();

    return { success: true, message: "Transaction created successfully" };
  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
};

const GetSupplierTransactionsWithDetails = async (id) => {
  try {
    if (!id) {
      throw new AppError("Id not reconized");
    }
    const Transactions = await SupplierTransactions.findAll({
      where: { supplier_id: id },
      include: {
        model: SupplierTransactionDetails,
        as: "details",
        include: {
          model: Products,
          as: "product",
        },
      },
    });

    if (Transactions.length > 0) {
      return Transactions;
    } else {
      throw new AppError("Transactions Not Found", 404);
    }
  } catch (error) {
    throw error;
  }
};

const GetSupplierInvoice = async (supplier_id, transaction_id) => {
  try {
    // Validation
    if (!supplier_id && !transaction_id) {
      throw new AppError("Supplier ID veya Transaction ID gerekli", 404);
    }

    const transaction = await SupplierTransactions.findOne({
      where: { id: transaction_id },
    });
    // Transaction detaylarını getir
    const transactionDetails = await SupplierTransactionDetails.findAll({
      where: { transaction_id },
      attributes: ["quantity", "unit_price", "total_price"],
      include: {
        model: Products,
        as: "product",
        attributes: ["name", "barcode", "unit"],
      },
    });

    const formatedDetails = transactionDetails.map((dt) => ({
      name: dt.product?.name,
      barcode: dt.product?.barcode,
      unit: dt.product?.unit,
      id: dt.id,
      price: dt.unit_price + " ₼",
      quantity: dt.quantity,
      total: dt.total_price + " ₼",
    }));

    if (!transactionDetails.length) {
      throw new AppError("Bu işlem için detay bulunamadı  ", 404);
    }
    const formatedTransaction = {
      ...transaction.toJSON(),
      amount: transaction.amount + " ₼",
      date: formatDate(transaction.createdAt.toJSON()),
    };
    return {
      transaction: formatedTransaction,
      details: formatedDetails, // detayları ekle
    };
  } catch (error) {
    throw error;
  }
};

const GetSupplierDebt = async (id) => {
  try {
    if (!id) {
      throw new AppError("Supplier ID is required", 400);
    }
    const supplier = await Suppliers.findOne({
      where: { id },
      include: {
        model: SupplierTransactions,
        as: "transactions",
        attributes: ["amount", "type", "payment_method"],
      },
    });
    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }
    const transactions = supplier.transactions || [];
    const totalDebt = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (
        transaction.type === "purchase" &&
        transaction.payment_method === "credit"
      ) {
        return acc + amount; // borca ekle
      } else if (
        transaction.type === "payment" ||
        transaction.type === "return"
      ) {
        return acc - amount; // borçtan düş
      }
      return acc;
    }, 0);

    return totalDebt.toFixed(2);
  } catch (error) {
    throw new AppError(
      "Error fetching supplier debt",
      500,
      error.message || "Internal server error"
    );
  }
};

const UpdateSupplierTransaction = async (id, data) => {
  const {
    date,
    supplier_id,
    transaction_date,
    transaction_type,
    payment_method,
  } = data;
  try {
    if (!id) {
      throw new AppError("Transaction ID is required", 400);
    }
    const transaction = await SupplierTransactions.findByPk(id);
    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }
    // 1) Transaction güncelle
    await transaction.update({
      date: date || transaction.date,
      supplier_id: supplier_id || transaction.supplier_id,
      transaction_date: transaction_date || transaction.transaction_date,
      type: transaction_type || transaction.type,
      payment_method: payment_method || transaction.payment_method,
    });

    return {
      success: true,
      message: "Transaction updated successfully",
    };
  } catch (error) {
    throw new AppError(error, 500);
  }
};
// 2) Transaction detaylarını sil

module.exports = {
  CreateTransaction,
  GetSupplierTransactionsWithDetails,
  GetSupplierInvoice,
  GetSupplierByQuery,
  GetSupplierDebt,
  UpdateSupplierTransaction,
};
