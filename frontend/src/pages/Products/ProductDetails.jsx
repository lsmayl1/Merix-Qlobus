import React from "react";
import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "../../redux/slices/ApiSlice";
import { Table } from "../../components/Table";
import { useGetProductStockMovementQuery } from "../../redux/slices/StockMovementsSlice";
import { createColumnHelper } from "@tanstack/react-table";

export const ProductDetails = () => {
  const { id } = useParams();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("product_id", {
      header: "ID",
      headerClassName: "text-center rounded-s-lg bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("date", {
      header: "Date",
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("unit_price", {
      header: "Price",
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("transaction_type", {
      header: "Type",
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
  ];

  const { data } = useGetProductStockMovementQuery(id, {
    skip: !id,
  });
  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-0 rounded-lg px-4 py-2">
      <h1 className="text-2xl"> {data?.product?.name}</h1>
      <div className="flex flex-col gap-2 bg-white w-full h-full min-h-0 rounded-lg px-4 py-2">
        <Table columns={columns} data={data?.transactions} />
      </div>
    </div>
  );
};
