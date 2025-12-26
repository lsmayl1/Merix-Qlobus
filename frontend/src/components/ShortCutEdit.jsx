import Fuse from "fuse.js";
import { SearchIcon } from "../assets/SearchIcon";
import { Basket } from "../assets/Basket";
import { RecycleBin } from "../assets/recycleBin";
import { CloseIcon } from "../assets/Close";

import React, { useState, useEffect } from "react";
import axios from "axios";

export const ShortCutEdit = ({ data, isLoading, handleClose }) => {
  const { API } = useApi();
  const [query, setQuery] = useState("");
  const [productAllReadyExist, setProductAllReadyExist] = useState("");
  const [shortCutProducts, setShortCutProducts] = useState(() => {
    const storedData = localStorage.getItem("shorcuts");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return parsedData && Array.isArray(parsedData.products)
        ? parsedData
        : { products: [] };
    }
    return { products: [] };
  });
  const [freshProducts, setFreshProducts] = useState([]);

  useEffect(() => {
    const freshData = async () => {
      if (shortCutProducts?.products?.length === 0) return;
      try {
        const res = await axios.post(`${API}/products/bulk`, {
          identifiers: shortCutProducts.products,
        });
        setFreshProducts(res.data);
      } catch (error) {
        console.error("Error fetching fresh data:", error);
        // Optionally handle the error in state or UI
      }
    };
    freshData();
  }, [shortCutProducts]);

  useEffect(() => {
    // Yerel depolamayı güncelle
    localStorage.setItem("shorcuts", JSON.stringify(shortCutProducts));
  }, [shortCutProducts]); // shortCutProducts her değiştiğinde yerel depolama güncellenir

  const fuse = new Fuse(data, {
    keys: ["name"],
    includeScore: true,
    threshold: 0.3,
  });
  const [filteredProducts, setFilteredProducts] = useState(data);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Fuse.js ile arama yap
    const searchResults = fuse.search(value);
    setFilteredProducts(searchResults.map((result) => result.item));
  };

  const AddShortCutProducts = (id) => {
    const product = data.find((item) => item.product_id === id);

    const existingProduct = shortCutProducts.products.find(
      (p) => p.product_id === id
    );
    if (existingProduct) {
      setProductAllReadyExist("mehsul movcuttur");
      return;
    } else {
      setShortCutProducts((prevState) => ({
        ...prevState,
        products: [...prevState.products, product.product_id],
      }));
    }
  };

  const DeleteProductFromShorCuts = (id) => {
    setShortCutProducts((prev) => {
      const updatedProducts = prev.products.filter((product) => product !== id);
      return { ...prev, products: updatedProducts };
    });

    setFreshProducts((prev) =>
      prev.filter((product) => product.product_id !== id)
    );
  };

  useEffect(() => {
    const closePage = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", closePage);
    return () => {
      document.removeEventListener("keydown", closePage);
    };
  });

  return (
    <div className="absolute  backdrop-blur-xs w-full  h-full border  z-50 flex justify-center items-center">
      <div className="bg-white relative h-9/12 w-1/2 px-6 border py-6 border-[#ADA3A3] rounded-xl flex flex-col">
        <div className="absolute -top-4 size-8 overflow-hidden bg-white rounded-l-3xl -right-4 ">
          <button className="cursor-pointer" onClick={handleClose}>
            <CloseIcon className={"w-full h-full"} />
          </button>
        </div>
        <div className="relative  w-full   flex items-center ">
          <input
            type="text"
            placeholder="Məhsul axtar..."
            value={query}
            onChange={handleInputChange}
            className="w-full border h-10 text-sm px-12 border-[#ADA3A3] rounded-lg focus:outline-none"
          />
          <SearchIcon className={"absolute ml-2"} />
          <div
            onClick={() => {
              setQuery("");
            }}
            className="absolute w-10 right-0 items-center justify-center flex px-1 py-3 cursor-pointer rounded-full "
          >
            <button className="">X</button>
          </div>
          {query && (
            <div className="absolute  top-12 w-full  rounded-lg border-[#ADA3A3] h-128  bg-white z-50 border p-4">
              <ul className="h-full overflow-auto flex flex-col">
                {isLoading && "Loading"}
                {filteredProducts.length === 0 && "Mehsul yoxdur"}

                {filteredProducts.map((product) => (
                  <li
                    className="text-xl border-b border-newborder "
                    key={product.product_id}
                  >
                    {" "}
                    <div className="flex hover:bg-gray-100 p-2 items-center justify-between w-full pr-5 ">
                      {" "}
                      <p className="w-9/14">{product.name} </p>
                      <span className="text-right">
                        {product?.sellPrice?.toFixed(2)} ₼{" "}
                      </span>{" "}
                      <button
                        onClick={() => AddShortCutProducts(product.product_id)}
                        className="cursor-pointer flex items-center justify-center border border-[#ADA3A3] hover:bg-green-700  bg-white rounded-xl hover:text-white"
                      >
                        <Basket className={`size-10 `} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="h-full py-5 px-10">
          <ul className="flex flex-col gap-2  ">
            {freshProducts?.map((product) => (
              <li key={product.product_id}>
                <div className="flex justify-between border border-[#ADA3A3] text-sm rounded  w-full items-center px-5">
                  {" "}
                  <span className="w-1/2"> {product.name} </span>{" "}
                  <span className="w-1/2">{product?.sellPrice + " ₼"}</span>
                  <div className=" p-2 rounded-xl  flex justify-center ">
                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        DeleteProductFromShorCuts(product.product_id)
                      }
                    >
                      <RecycleBin className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
