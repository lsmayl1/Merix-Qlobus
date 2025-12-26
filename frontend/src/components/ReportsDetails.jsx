import React, { useEffect, useState } from "react";
import { CloseIcon } from "../assets/Close";
import axios from "axios";
import { FormatDate } from "./utils/DateFunctions";
export const ReportsDetails = ({ selectedSale, handleClose }) => {
  const { API } = useApi();
  const [data, setData] = useState(null);
  useEffect(() => {
    const getSaleById = async () => {
      try {
        const res = await axios.get(`${API}/sales/${selectedSale?.sale_id}`);
        setData(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getSaleById();
  }, [selectedSale, API]);

  return (
    <div className="absolute w-full backdrop-blur-xs h-screen z-50  flex items-center justify-center">
      <div className="bg-white relative  w-8/12 h-9/12 border border-newborder rounded">
        <div className="absolute -top-4 size-8 overflow-hidden bg-white rounded-full -right-4 ">
          <button onClick={handleClose} className="cursor-pointer">
            <CloseIcon className={"w-full h-full text-gray-500"} />
          </button>
        </div>
        <div className="flex gap-4 h-20 items-center px-16 justify-between w-full text-xl">
          <div className="flex gap-4">
            <span>Satış Nömrəsi </span>
            <span className="font-semibold">{selectedSale?.sale_id}</span>
          </div>

          <div className="flex items-center gap-5">
            <h1 className="text-xl">{FormatDate(data?.date)}</h1>
            <div className="flex items-center justify-center">
              <button className="p-2 border cursor-pointer hover:bg-gray-300 border-newborder rounded-xl">
                Çap
              </button>
            </div>
          </div>
        </div>
        <div className="h-9/12 overflow-auto">
          <table className="w-full border border-newborder">
            <thead>
              <tr className="h-14 border border-newborder">
                <th style={{ width: "40%" }}>Məhsul</th>
                <th>Miqdar</th>
                <th>Qiymət</th>
                <th>Məbləg</th>
              </tr>
            </thead>
            <tbody>
              {data?.details?.map((details) => (
                <tr
                  key={details?.product?.barcode}
                  className="h-12 border-b border-newborder hover:bg-gray-200"
                >
                  <td className="px-4">{details?.product?.name}</td>
                  <td className="text-center">
                    {details?.quantity?.toFixed(1)}
                  </td>
                  <td className="text-center">
                    {" "}
                    <div className="flex w-8/12 text-lg gap-4 justify-end  items-center">
                      <span>{details?.product.sellPrice}</span>
                      <span>₼</span>
                    </div>
                  </td>
                  <td className="text-center">
                    {" "}
                    <div className="flex w-8/12 text-lg gap-4 justify-end  items-center">
                      <span>{details?.subtotal}</span>
                      <span>₼</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-20 flex py-4 items-center justify-between px-4 gap-4">
          <div className="text-xl flex gap-4">
            <span>Odəniş </span>{" "}
            <span> {data?.paymentMethod === "cash" ? "Nağd" : "Kart"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl">Total</span>
            <div className="flex text-2xl gap-4  items-center">
              <span>{data?.totalAmount}</span>
              <span>₼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
