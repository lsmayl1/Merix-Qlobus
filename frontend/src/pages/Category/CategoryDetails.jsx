import React from "react";
import { KPI } from "../../components/Metric/KPI";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../../components/Table";
import { DateRange } from "../../components/Date/DateRange";
import { useParams } from "react-router-dom";
import { useGetCategoryByIdQuery } from "../../redux/slices/CategorySlice";

export const CategoryDetails = () => {
  const { id } = useParams();
  const { data } = useGetCategoryByIdQuery(id);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("stock", {
      header: "Stock Count",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <span>
          {parseFloat(row.original.stock?.current_stock).toFixed(2) || 0}{" "}
        </span>
      ),
    }),
    columnHelper.accessor("soldCount", {
      header: "sold Count",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("sellPrice", {
      header: "Price",
      cellClassName: "text-center",
      cell: ({ row }) => <span>{row.original.sellPrice + " ₼"}</span>,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cellClassName: "text-center",
      cell: ({ row }) => <span>{row.original.amount + " ₼"}</span>,
    }),
  ];
  return (
    <div className="flex flex-col p-6 h-full gap-2 ">
      <h1 className="text-4xl font-semibold mb-4">{data?.name}</h1>
      {/* <DateRange /> */}
      <KPI
        data={[
          { label: "Revenue", value: data?.amount },
          { label: "Stock Cost", value: data?.stockCost },
          { label: "Profit", value: data?.totalProfit },
        ]}
      />
      <div className=" bg-white h-full p-4 rounded-lg overflow-auto">
        <Table columns={columns} data={data?.products} />
      </div>
    </div>
  );
};
