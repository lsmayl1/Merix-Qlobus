import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
export const Table = ({
  data = [],
  columns = [],
  isLoading,
  path,
  pagination = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Varsayılan sayfa başına satır sayısı
      },
    },
  });

  const handleRowClick = (row) => {
    if (path) {
      navigate(`${path}/${row.original.product_id}`);
    }
  };
  return (
    <div className="w-full h-full flex flex-col  min-h-0 rounded-lg justify-between   bg-white gap-1">
      <div className="overflow-y-auto flex flex-col min-h-0  h-full">
        <table className="w-full">
          <thead>
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <tr key={headerGroup.id} className=" ">
                {headerGroup.headers?.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-4 font-medium text-black max-md:px-2 max-md:py-1 text-nowrap max-md:text-xs py-2 capitalize ${
                      index == 0
                        ? "text-center rounded-s-lg bg-gray-100"
                        : index == headerGroup.headers.length - 1
                        ? "text-center bg-gray-100 rounded-e-lg"
                        : " bg-gray-100"
                    } ${header.column.columnDef.headerClassName || ""}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    Loading
                  </div>
                </td>
              </tr>
            ) : data.length == 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    {t("empty")}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel()?.rows?.map((row) => (
                <tr
                  onClick={() => handleRowClick(row)}
                  key={row.id}
                  className="hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 max-md:px-2 max-md:py-1 max-md:text-xs text-nowrap ${
                        cell.column.columnDef.cellClassName || ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* {data && data.length > 10 && !isLoading && pagination && (
        <div className="flex items-center justify-between   px-4  bg-white rounded-lg ">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700  hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${
                  table.getState().pagination.pageIndex === i
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors duration-200`}
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};
