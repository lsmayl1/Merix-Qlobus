const express = require("express");
const router = express.Router();
const { Sales, Op, SalesDetails, Products } = require("../models/index");

router.post("/", async (req, res) => {
  try {
    const { from, to } = req.body;

    // Parse the from date explicitly
    const fromDate = new Date(from);
    let toDate = to ? new Date(to) : new Date(from);
    if (!to) toDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999 of the same day

    // Validate dates
    const isValidDate = (date) => date instanceof Date && !isNaN(date);
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      return res.status(400).json({ error: "Geçersiz tarih formatı" });
    }

    // Fetch sales with their details
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["quantity", "sell_price", "buy_price"],
        },
      ],
    });

    // Calculate turnover
    let turnover = 0;
    if (sales && sales.length > 0) {
      turnover = sales.reduce((sum, item) => {
        const amount = Number(item.total_amount) || 0;
        return sum + amount;
      }, 0);
    }
    const resTurnover = turnover.toFixed(2);

    // Calculate profit and update sales with individual profit
    const updatedSales = sales.map((sale) => {
      const rawProfit = sale.details.reduce((total, detail) => {
        const purchasePrice = Number(detail.buy_price) || 0;
        if (purchasePrice > 0) {
          const sellingPrice = Number(detail.sell_price) || 0;
          const quantity = Number(detail.quantity) || 0;
          return total + (sellingPrice - purchasePrice) * quantity;
        }
        return total;
      }, 0);

      return {
        sale_id: sale.sale_id,
        paymentMethod: sale.payment_method,
        total_amount: sale.total_amount,
        date: sale.date,
        profit: rawProfit.toFixed(2), // Her satışın kârı
      };
    });

    // Calculate total profit
    const totalProfit = updatedSales
      .reduce((sum, sale) => {
        return sum + Number(sale.profit);
      }, 0)
      .toFixed(2);

    const sellCount = sales.length;

    // Sort sales by date (most recent first)
    updatedSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      turnover: resTurnover,
      profit: totalProfit,
      sales: updatedSales,
      sellCount,
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/sales", async (req, res) => {
  try {
    const { from, to } = req.body;

    // Tarih validasyonu
    const fromDate = new Date(from);
    let toDate = to ? new Date(to) : new Date(from);
    if (!to) toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ error: "Geçersiz tarih formatı" });
    }

    // Veritabanı sorgusu
    const sales = await Sales.findAll({
      where: { date: { [Op.between]: [fromDate, toDate] } },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["quantity", "sell_price", "buy_price"],
        },
      ],
    });

    // Kâr hesapla
    const updatedSales = sales.map((sale) => {
      const rawProfit = sale.details.reduce((total, detail) => {
        if (detail.buy_price > 0) {
          return (
            total + (detail.sell_price - detail.buy_price) * detail.quantity
          );
        }
        return total;
      }, 0);

      return {
        sale_id: sale.sale_id,
        paymentMethod: sale.payment_method,
        total_amount: sale.total_amount,
        date: sale.date,
        profit: rawProfit.toFixed(2), // 2 ondalık basamak
      };
    });

    updatedSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ sales: updatedSales });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({
      error: "Sunucu hatası",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.post("/sold-products", async (req, res) => {
  try {
    const { from, to } = req.body;

    // Tarihleri parse et
    const fromDate = new Date(from);
    let toDate = to ? new Date(to) : new Date(from);
    if (!to) toDate.setHours(23, 59, 59, 999); // Eğer "to" yoksa, aynı günün sonunu ayarla

    // Tarihlerin geçerliliğini kontrol et
    const isValidDate = (date) => date instanceof Date && !isNaN(date);
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      return res.status(400).json({ error: "Geçersiz tarih formatı" });
    }

    // Satışları veritabanından çek
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["quantity", "sell_price", "buy_price"],
          include: [
            {
              model: Products,
              as: "product",
              attributes: [
                "product_id",
                "name",
                "unit",
                "sellPrice",
                "buyPrice",
              ],
            },
          ],
        },
      ],
    });

    // Ürün bazında toplam satışları, turnover ve kazancı hesapla
    const productSummary = {};

    sales.forEach((sale) => {
      sale.details.forEach((detail) => {
        const productId = detail.product.product_id;
        const productName = detail.product.name;
        const quantity = detail.quantity;
        const unit = detail.product.unit;
        const sellPrice = parseFloat(detail.sell_price); // Satış detayındaki fiyatı kullan
        const buyPrice = parseFloat(detail.buy_price); // Satış detayındaki alış fiyatını kullan

        if (!productSummary[productId]) {
          productSummary[productId] = {
            id: productId,
            name: productName,
            totalQuantity: 0,
            totalProfit: null, // Varsayılan olarak null, buyPrice 0 ise hesaplanmayacak
            totalRevenue: 0,
            unit: unit,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
          };
        }

        // Toplam miktar ve ciroyu güncelle
        productSummary[productId].totalQuantity += Number(quantity) || 0;
        productSummary[productId].totalRevenue += sellPrice * Number(quantity);

        // BuyPrice 0 değilse kârı hesapla
        if (buyPrice !== 0) {
          if (productSummary[productId].totalProfit === null) {
            productSummary[productId].totalProfit = 0; // İlk kez hesaplanıyorsa 0 ile başlat
          }
          productSummary[productId].totalProfit +=
            quantity * (sellPrice - buyPrice);
        }
      });
    });

    // Sonucu diziye çevir
    const summaryArray = Object.values(productSummary).map((item) => ({
      productId: item.id,
      productName: item.name,
      totalSold: item.totalQuantity.toFixed(2),
      unit: item.unit == "piece" ? "pcs" : "kg",
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      totalRevenue: item.totalRevenue.toFixed(2) + " ₼",
      profitMargin:
        item.totalProfit !== null
          ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2) + " %"
          : 0 + " ₼",
      profit:
        item.totalProfit !== null
          ? item.totalProfit.toFixed(2) + " ₼"
          : 0 + " ₼", // Profit null ise öyle kalsın
    }));

    // Yanıtı döndür
    res.json({ products: summaryArray });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});
router.get("/turnover-per-month", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [
            new Date(`${currentYear}-01-01`),
            new Date(`${currentYear}-12-31`),
          ],
        },
      },
    });

    const monthlyTurnover = {
      Yanvar: 0,
      Fevral: 0,
      Mart: 0,
      Aprel: 0,
      May: 0,
      Iyun: 0,
      Iyul: 0,
      Avqust: 0,
      Sentyabr: 0,
      Oktyabr: 0,
      Noyabr: 0,
      Dekabr: 0,
    };

    sales.forEach((sale) => {
      const month = new Date(sale.date).getMonth(); // 0-11
      const amount = parseFloat(sale.total_amount) || 0;

      const months = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avqust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr",
      ];

      monthlyTurnover[months[month]] += amount;
    });

    // 0 olan ayları çıkart
    const filteredTurnover = Object.fromEntries(
      Object.entries(monthlyTurnover).filter(([_, value]) => value !== 0)
    );

    console.log(filteredTurnover);
    res.json(filteredTurnover);
  } catch (error) {
    console.error("Error calculating monthly turnover:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
