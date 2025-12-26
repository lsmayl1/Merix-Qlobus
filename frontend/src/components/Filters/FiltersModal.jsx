import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const FiltersModal = ({ handleClose, handleFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFilters, setSelectedFilters] = useState({
    name: "",
    unit: [],
  });

  const filterOptions = [
    {
      label: "Name",
      value: "name",
      options: { type: "single", value: ["A-Z", "Z-A"] },
    },
    {
      label: "Stock",
      value: "stock",
      options: { type: "single", value: ["A-Z", "Z-A"] },
    },
    {
      label: "Unit",
      value: "unit",
      options: { type: "multiple", value: ["KG", "Piece"] },
    },
  ];

  useEffect(() => {
    const initialFilters = {
      name: searchParams.get("name") || "",
      unit: searchParams.get("unit") ? searchParams.get("unit").split(",") : [],
    };
    setSelectedFilters(initialFilters);
  }, [searchParams]);

  const handleMultipleSelection = (option, name) => {
    setSelectedFilters((prev) => {
      const currentSelection = prev[name];
      let updatedSelection = [];
      if (currentSelection.includes(option)) {
        updatedSelection = currentSelection.filter((item) => item !== option);
      } else {
        updatedSelection = [...currentSelection, option];
      }
      return {
        ...prev,
        [name]: updatedSelection,
      };
    });
  };

  const handleSingleSelection = (option, name) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: prev?.[name] === option ? "" : option,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedFilters.name) params.set("name", selectedFilters.name);
    if (selectedFilters.unit.length > 0)
      params.set("unit", selectedFilters.unit.join(","));
    setSearchParams(params);
  };

  return (
    <div className="bg-white absolute border z-50 top-10 right-12 border-mainBorder px-4 flex flex-col gap-12 pt-4 rounded-lg shadow-md w-64 ">
      <div className="w-full">
        <ul className="w-full flex flex-col gap-6">
          {filterOptions.map((item, index) => (
            <li className="flex flex-col" key={index}>
              <div className="flex gap-1 items-center justify-between">
                <label>{item.label}</label>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {item.options.type === "single" &&
                  item.options.value.map((option, idx) => (
                    <div className="flex items-center gap-2" key={idx}>
                      <button
                        onClick={() =>
                          handleSingleSelection(option, item.value)
                        }
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <label className="relative cursor-pointer flex items-center justify-center">
                          <div className="size-6 border border-mainBorder rounded-full relative overflow-hidden" />
                          {selectedFilters[item.value] === option && (
                            <div className="size-4 bg-blue-400 rounded-full absolute" />
                          )}
                        </label>
                      </button>
                      <button className="text-gray-500 text-nowrap hover:text-black transition-colors">
                        {option}
                      </button>
                    </div>
                  ))}
                {item.options.type === "multiple" &&
                  item.options.value.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleMultipleSelection(option, item.value)
                        }
                        className="flex items-center justify-center size-6 border border-mainBorder rounded-lg"
                      >
                        {selectedFilters[item.value]?.includes(option) ? (
                          <div className="size-3 bg-blue-400 rounded-lg" />
                        ) : (
                          <div className="size-4" />
                        )}
                      </button>
                      <label
                        htmlFor={`${item.value}-${idx}`}
                        className="text-gray-500 text-nowrap hover:text-black cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 justify-end items-center w-full pb-2">
        <button
          onClick={() => handleClose(false)}
          className="text-red-500 text-nowrap hover:text-black transition-colors duration-200 border border-red-500 px-4 py-1 rounded-lg text-xs"
        >
          Cancel
        </button>
        <button
          onClick={applyFilters}
          className="text-nowrap text-white px-4 py-1 rounded-lg text-xs transition-colors duration-200 bg-blue-500 hover:bg-blue-600 border border-blue-500"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
