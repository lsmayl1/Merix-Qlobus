import React, { useEffect, useState } from "react";
import { CloseIcon } from "../assets/Close";
import { FormatDate } from "./utils/DateFunctions";

export const PosReports = ({ handleClose }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const closePage = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", closePage);

    return () => {
      document.addEventListener("keydown", closePage);
    };
  });

  return (
    <div className="absolute  flex justify-center items-center w-full h-full backdrop-blur-xs z-40">
      <div className="flex py-4  flex-col items-center   h-[90%] bg-white w-[90%] rounded-l-xl border-newborder border relative gap-10">
        <div className="absolute -top-4 size-8 overflow-hidden bg-white rounded-full -right-4 ">
          <button className="cursor-pointer" onClick={handleClose}>
            <CloseIcon className={"w-full h-full"} />
          </button>
        </div>

        <div className="w-full px-10 overflow-auto max-h-[90%]     flex justify-center ">
          <table
            className="w-full"
            style={{ tableLayout: "auto", borderSpacing: 0 }}
            border={1}
          >
            <thead className="text-center bg-gray-500 h-14 text-white text-xl font-light   top-0">
              <tr>
                <th style={{ width: "15%" }}>Satıs Nömrəsi</th>
                <th>Toplam Məbləğ</th>
                <th>Ödəniş növü</th>
                <th>Tarix</th>
                <th>Cap et</th>
              </tr>
            </thead>
            <tbody>
              {data?.sales?.map((sale) => (
                <tr
                  key={sale.sale_id}
                  className="text-center h-12 w-full border-[#ADA3A3] border-b text-xl hover:bg-gray-200"
                >
                  <td>
                    <div className="flex items-center justify-center pl-5">
                      <h1>{sale.sale_id}</h1>
                    </div>
                  </td>
                  <td> {sale.total_amount + " ₼"}</td>
                  <td>
                    <div className="flex justify-center items-center">
                      <div className="flex items-center">
                        <span className="flex gap-2 justify-center items-center cursor-pointer">
                          {sale.payment_method === "cash" ? "Nağd" : "Kart"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex w-full justify-center items-center">
                      <span className="text-right min-w-20 flex justify-end">
                        {FormatDate(sale.date)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
