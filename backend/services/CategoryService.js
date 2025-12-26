const {
  Category,
  Products,
  ProductStock,
  Op,
  Sales,
  SalesDetails,
} = require("../models/index");
const moment = require("moment");
const AppError = require("../utils/AppError");

const getAllCategories = async () => {
  try {
    const categories = await Category.findAll();
    if (!categories) {
      throw new AppError("Category Not Found", 404);
    }
    return categories;
  } catch (error) {
    throw error;
  }
};

const createCategory = async (data) => {
  try {
    const { name, parent_id } = data;
    if (!name) {
      throw new AppError("Name not reconized", 404);
    }
    await Category.create({
      name,
      parent_id,
    });

    return { message: "Category Created" };
  } catch (error) {
    throw error;
  }
};

const getCategoryById = async (id) => {
  try {
    if (!id) {
      throw new AppError("Id not recognized", 404);
    }

    const category = await Category.findByPk(id, {
      include: {
        model: Products,
        as: "products",
        include: {
          model: ProductStock,
          as: "stock",
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const products = category.products;
    if (!products || products.length === 0) {
      return {
        ...category.toJSON(),
        soldCount: 0,
        amount: 0,
        stockCost: 0,
        totalProfit: 0,
        products: [],
      };
    }

    const productIds = products.map((p) => p.product_id);

    const startOfToday = moment().startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    const todaySales = await SalesDetails.findAll({
      where: {
        product_id: { [Op.in]: productIds },
      },
      include: [
        {
          model: Sales,
          as: "sale",
        },
      ],
    });

    const salesMap = {}; // { product_id: { soldCount, amount, profit } }

    for (const saleDetail of todaySales) {
      const pid = saleDetail.product_id;
      if (!salesMap[pid]) {
        salesMap[pid] = { soldCount: 0, amount: 0, profit: 0 };
      }

      const quantity = parseFloat(saleDetail.quantity);
      const sellPrice = parseFloat(saleDetail.sell_price);
      const buyPrice = parseFloat(saleDetail.buy_price ?? 0); // null olursa 0 al

      const lineAmount = quantity * sellPrice;
      const lineProfit = quantity * (sellPrice - buyPrice);

      salesMap[pid].soldCount += quantity;
      salesMap[pid].amount += lineAmount;
      salesMap[pid].profit += lineProfit;
    }

    let totalSoldCount = 0;
    let totalAmount = 0;
    let totalStockCost = 0;
    let totalProfit = 0;

    const enrichedProducts = products.map((product) => {
      const stats = salesMap[product.product_id] || {
        soldCount: 0,
        amount: 0,
        profit: 0,
      };

      totalSoldCount += stats.soldCount;
      totalAmount += stats.amount;
      totalProfit += stats.profit;

      const currentStock = product.stock?.current_stock;
      const buyPrice = parseFloat(product.buyPrice ?? 0);
      const stockCost =
        currentStock !== undefined ? parseFloat(currentStock) * buyPrice : 0;

      totalStockCost += stockCost;

      return {
        ...product.toJSON(),
        soldCount: stats.soldCount.toFixed(2),
        amount: stats.amount.toFixed(2),
        profit: stats.profit.toFixed(2),
        stockCost: stockCost.toFixed(2),
      };
    });

    return {
      ...category.toJSON(),
      soldCount: totalSoldCount.toFixed(2),
      amount: totalAmount.toFixed(2),
      stockCost: totalStockCost.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      products: enrichedProducts,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllCategories, createCategory, getCategoryById };
