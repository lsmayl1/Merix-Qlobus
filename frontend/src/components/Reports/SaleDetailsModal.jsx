import React from "react";
import { Table } from "../Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useGetSaleByIdQuery } from "../../redux/slices/ApiSlice";

export const SaleDetailsModal = ({ saleId, handleClose }) => {
  const { data } = useGetSaleByIdQuery(saleId, {
    skip: !saleId,
  });
  const columnHelper = createColumnHelper();
  const column = [
    columnHelper.accessor("name", {
      header: "Product",
      headerClassName: "text-start",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: "Price",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: "Subtotal",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
  ];

  return (
    <div className="flex absolute  w-full h-full   items-center justify-center z-50">
      <div className="flex bg-white min-w-1/3 min-h-0 top-0 rounded-lg shadow-lg flex-col gap-10 p-6">
        <h1 className="w-full text-center font-semibold text-2xl">
          Sale Details
        </h1>
        <div className="flex justify-between pb-4 border-b border-mainBorder ">
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-mainText">Sale ID</h1>
            <span className="text-lg  ">#{data?.saleId}</span>
          </div>
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-end text-mainText">
              Date
            </h1>
            <span className="text-lg">{data?.date}</span>
          </div>
        </div>
        <div className="min-h-0 max-h-[400px] overflow-auto ">
          <Table columns={column} data={data?.details} pagination={false} />
        </div>
        <div className="flex flex-col gap-2 pb-4 border-b border-mainBorder ">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-mainText">Subtotal</span>
            <span>{data?.totalAmount}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-mainText">Discount</span>
            <span>0.00 ₼</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-mainText">Payment Method</span>
            <span>{data?.paymentMethod}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-semibold">Total</span>
          <span className="text-2xl font-semibold">{data?.totalAmount}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg">
            Print Receipt
          </button>
          <button
            onClick={() => handleClose(false)}
            className="px-4 py-2 border-red-500 border text-red-500  font-semibold rounded-lg"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
