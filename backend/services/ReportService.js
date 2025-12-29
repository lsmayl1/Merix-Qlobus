const calculateRevenueReport = (sales) => {
  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalSales = 0;
  let totalReturns = 0;
  sales.forEach((sale) => {
	if (sale.transaction_type === "sale") {
	  totalRevenue += parseFloat(sale.total_amount);
	} else if (sale.transaction_type === "return") {
	  totalReturns += parseFloat(sale.total_amount);
	}
	totalDiscounts += parseFloat(sale.discounted_amount);
	totalSales += 1;
  })
  return {
	totalRevenue,
	totalDiscounts,
	totalSales,
	totalReturns,
};
};


module.exports = {
  calculateRevenueReport,
};
