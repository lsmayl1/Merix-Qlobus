import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../Table";
import { useGetBestSellersQuery } from "../../redux/slices/ApiSlice";

export const StockOverview = () => {
  const columnHelper = createColumnHelper();
  const { data } = useGetBestSellersQuery();
  const columns = [
    columnHelper.accessor("name", {
      header: "Mehsul",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("sold", {
      header: "Satilan Miqdar",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("stock", {
      header: "Qaliq",
      headerClassName: "text-start",
    }),
  ];
  return <Table columns={columns} data={data} />;
};
