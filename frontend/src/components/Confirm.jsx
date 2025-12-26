import React from "react";

export const Confirm = ({ name, handleOption }) => {
  const handleSelection = (a) => {
    handleOption(a);
  };

  return (
    <div className="flex absolute  w-full z-50 backdrop-blur-sm flex-col items-center justify-center h-screen ">
      <div className="flex items-center bg-white gap-10 justify-center border-[#ADA3A3] flex-col border rounded-2xl p-16 w-1/4">
        <h1 className="text-2xl">{name}</h1>
        <div className="flex justify-between w-9/12 ">
          <button
            onClick={() => handleSelection(false)}
            className="border text-xl border-[#ADA3A3] py-2 px-4 rounded-xl hover:bg-red-500 hover:text-white cursor-pointer"
          >
            Xeyr
          </button>
          <button
            onClick={() => handleSelection(true)}
            className="border text-xl border-[#ADA3A3] px-4 rounded-xl hover:bg-green-500 hover:text-white  cursor-pointer"
          >
            Bəli
          </button>
        </div>
      </div>
    </div>
  );
};
