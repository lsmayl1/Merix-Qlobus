import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LogoMain from "../../assets/Logo/LogoMain";
export const Login = ({ data = [], handleBack, value = 40 }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const buttons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "", "0", "⌫"];

  const applyValue = (btn) => {
    if (btn === "⌫") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (inputValue.length >= 4) {
      return;
    } else {
      setInputValue((prev) => prev + btn);
    }
  };
  return (
    <div className="flex flex-col h-screen justify-center gap-24 items-center ">
      <LogoMain />
      <div className="flex items-center justify-center  gap-4 font-medium flex-col">
        <ul className="flex gap-8 text-3xl">
          <li className="rounded-full border-gray-200 border p-8 size-26 flex items-center justify-center">
            {inputValue.slice(0, 1)}
          </li>
          <li className="rounded-full border-gray-200 border p-8 size-26 flex items-center justify-center">
            {inputValue.slice(1, 2)}
          </li>
          <li className="rounded-full border-gray-200 border p-8 size-26 flex items-center justify-center">
            {inputValue.slice(2, 3)}
          </li>
          <li className="rounded-full border-gray-200 border p-8 size-26 flex items-center justify-center">
            {inputValue.slice(3, 4)}
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 w-1/4 justify-center items-center">
        <div className="w-full">
          <div className="grid grid-cols-3 gap-2 ">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => applyValue(btn)}
                className="h-24 text-2xl font-medium border border-gray-200  rounded hover:bg-gray-300 active:scale-95"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
