import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { Table } from "../Table";
import CloseSquare from "../../assets/Navigation/CloseSquare";

export const InvoiceView = ({ handleClose, data }) => {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("unit", {
      header: "Unit",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("total", {
      header: "amount",
      cellClassName: "text-center",
    }),
  ];
  if (!data || !data.transaction || !data.details) {
    return;
  }
  return (
    <div className="flex absolute  w-full h-full   items-center justify-center z-50">
      <div className="flex bg-white min-w-1/2 h-full gap-4 rounded-lg shadow-lg flex-col  pt-4 pb-12 px-6">
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2  font-semibold rounded-lg"
          >
            <CloseSquare className={"size-12"} />
          </button>
        </div>
        <h1 className="w-full text-center font-semibold text-2xl">
          Invoice Details
        </h1>
        <div className="flex justify-between pb-4 border-b border-mainBorder ">
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-mainText">Invoice ID</h1>
            <span className="text-lg  ">#{data?.transaction?.id}</span>
          </div>
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-end text-mainText">
              Date
            </h1>
            <span className="text-lg">{data?.transaction?.date}</span>
          </div>
        </div>
        <div className="min-h-0 h-full  overflow-auto ">
          <Table columns={columns} data={data?.details} pagination={false} />
        </div>
        <div className="flex justify-end gap-4 items-center">
          <span className="text-2xl font-semibold">Total :</span>
          <span className="text-2xl font-semibold">
            {data?.transaction?.amount || 0.0}
          </span>
        </div>
      </div>
    </div>
  );
};
