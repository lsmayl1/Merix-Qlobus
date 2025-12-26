import React from "react";
import Barcode from "react-barcode";
import { CloseIcon } from "../../assets/Close";

export const LabelPrint = ({ handleClose, product }) => {
  return (
    <div className="absolute  flex items-center justify-center w-full h-screen">
      <div className="border border-newborder relative w-9/12 h-9/12 rounded bg-white flex flex-col">
        <div className="absolute -top-4 size-10 overflow-hidden bg-white rounded-l-3xl -right-5 ">
          <button className="cursor-pointer" onClick={handleClose}>
            <CloseIcon className={"w-full h-full"} />
          </button>
        </div>
        <header className="h-1/12 border-b border-newborder flex items-center px-10 w-full justify-end ">
          <button className="px-2 py-1 border rounded cursor-pointer">
            Cap et
          </button>
        </header>
        <div className="flex items-center">
          <div className="flex flex-col items-center  border py-4">
            <h1 className="text-xl">{product?.name}</h1>
            <span className="text-3xl font-semibold">
              {product?.sellPrice?.toFixed(2) + " ₼"}
            </span>
            <div className="flex flex-col items-center ">
              <Barcode
                value={product?.barcode}
                displayValue={false}
                height={50}
              />
              <span className=" tracking-[10px] pl-2">{product?.barcode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
