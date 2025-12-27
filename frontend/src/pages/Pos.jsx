import React, { useEffect, useRef, useState } from "react";
import { Plus } from "../assets/Plus";
import { Logout } from "../assets/Logout";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../components/Table";
import TrashBin from "../assets/TrashBin";
import { Cash } from "../assets/Cash";
import { CreditCard } from "../assets/CreditCard";
import Payment from "../assets/Payment";
import {
  useGetProductsByQueryQuery,
  useLazyGetProductByIdQuery,
  usePostSaleMutation,
  usePostSalePreviewMutation,
} from "../redux/slices/ApiSlice";
import { BarcodeField } from "../components/BarcodeField";
import { ProductShortcuts } from "../components/Pos/ProductShortcuts";
import { NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { QtyInput } from "../components/QtyInput";
import { useTranslation } from "react-i18next";
import { SearchModal } from "../components/Pos/SearchModal";
import { ChartPie } from "../assets/chart-pie";
import Return from "../assets/Navigation/Return";
export const Pos = () => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const [inputData, setInputData] = useState([]);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [postPreview, { isLoading: previewLoading }] =
    usePostSalePreviewMutation();
  const { data: searchData } = useGetProductsByQueryQuery(query, {
    skip: !query || query.length < 3,
  });
  const [trigger, { isLoading, isFetching }] = useLazyGetProductByIdQuery();
  const columns = [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start rounded-s-lg bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => <span>{row.original?.sellPrice?.toFixed(2)} ₼</span>,
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      cell: ({ row }) => (
        <QtyInput
          qty={row.original.quantity}
          barcode={row.original.barcode}
          handleQty={handleChangeQtyAndFocus}
          allign={"justify-center"}
        />
      ),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: t("subtotal"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div>
          <span>{row.original?.subtotal?.toFixed(2)} ₼</span>
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: t("delete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <button onClick={() => handleDeleteProduct(row.original.barcode)}>
          <TrashBin className="size-6 text-red-500" />
        </button>
      ),
    }),
  ];
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [AmountToReturn, setAmountToReturn] = useState(0);
  const [postSale, { isLoading: postLoading }] = usePostSaleMutation();
  const searchInput = useRef();
  const modalRef = useRef();
  const receivedInput = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    document.title = "Kassa";
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        searchInput.current?.focus();
      } else if (key === "/") {
        e.preventDefault();
        receivedInput.current?.select();
      } else if (key === "escape") {
        setQuery("");
        barcodeRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChangeQty = async (barcode, action, qty) => {
    const existProduct = inputData.find((x) => x.barcode == barcode);

    if (existProduct) {
      // Adet bazlı ürünler için eski davranış
      if (existProduct.unit === "piece") {
        setInputData((prevData) =>
          prevData.map((item) => {
            if (item.barcode === barcode) {
              let newQuantity = item.quantity;

              if (qty !== undefined && qty !== null) {
                newQuantity = Math.max(0.001, Number(qty));
              } else if (action === "increase") {
                newQuantity += 1;
              } else if (action === "deacrese") {
                newQuantity = Math.max(0.001, item.quantity - 1);
              }

              return {
                ...item,
                quantity: newQuantity,
              };
            }
            return item;
          })
        );
        return;
      }

      // KG bazlı ürünler için (direct qty update)
      if (existProduct.unit === "kg") {
        // Eğer qty varsa güncelle, yoksa artırma/azaltma mantığına göre davranabiliriz
        setInputData((prevData) =>
          prevData.map((item) => {
            if (item.barcode === barcode) {
              let newQuantity = item.quantity;

              if (qty !== undefined && qty !== null) {
                newQuantity = Math.max(0.001, parseFloat(qty)); // minimum 1 gram
              } else if (action === "increase") {
                newQuantity += 0.1; // örnek olarak 100 gram artır
              } else if (action === "deacrese") {
                newQuantity = Math.max(0.001, item.quantity - 0.1);
              }

              return {
                ...item,
                quantity: newQuantity,
              };
            }
            return item;
          })
        );
        return;
      }
    }

    // Ürün yoksa ve artırma işlemi ise yeni ürün ekle
    if (action === "increase") {
      if (isFetching) return;
      try {
        const validProduct = await trigger(barcode).unwrap();
        if (!validProduct) return null;

        const existProduct = inputData.find(
          (x) => x.barcode == validProduct.productBarcode
        );

        if (existProduct) {
          // Ürün zaten listede varsa, miktarı artır
          setInputData((prevData) =>
            prevData.map((item) => {
              if (item.barcode === validProduct.productBarcode) {
                let newQuantity = item.quantity;

                if (validProduct.unit === "kg") {
                  // Tartım barkodundan gelen quantity varsa onu ekle
                  if (validProduct.quantity) {
                    newQuantity += validProduct.quantity;
                  } else {
                    newQuantity += 0.1;
                  }
                } else {
                  newQuantity += 1;
                }

                return {
                  ...item,
                  quantity: newQuantity,
                };
              }
              return item;
            })
          );
          return;
        } else
          setInputData((prevData) => [
            ...prevData,
            {
              quantity: validProduct.quantity ? validProduct.quantity : 1, // kg ürün için default 0.1 (100 gram)
              barcode: validProduct.barcode,
              productBarcode: validProduct?.productBarcode,
              unit: validProduct.unit,
            },
          ]);
      } catch (err) {
        toast.error(err.data.error);
        console.log(err);
      }
    }

    barcodeRef.current?.focus();
  };

  const handleDeleteProduct = (id) => {
    const newData = inputData.filter(
      (x) =>
        String(x.barcode) !== String(id) &&
        String(x.productBarcode) !== String(id)
    );
    setInputData(newData);
  };

  const handleSubmitSale = async (type) => {
    if (postLoading) return;
    try {
      await postSale({
        payment_method: paymentMethod,
        products: data?.items,
        type: type || "sale",
        discount: discount,
      }).unwrap();
      setData([]);
      setInputData([]);
      setPaymentMethod("cash");
      setDiscount(0);
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handlePreview = async () => {
      if (inputData.length == 0) {
        setData([]);
        return;
      }

      const response = await postPreview({
        items: inputData,
        discount: discount,
      }).unwrap();
      setData(response); // response = { subtotal, total, items }
    };

    handlePreview();
  }, [inputData, discount]);

  useEffect(() => {
    if (receivedAmount && data.total) {
      setAmountToReturn(receivedAmount - data?.total.toFixed(2));
    } else {
      setAmountToReturn(0);
      setReceivedAmount(0);
    }
  }, [receivedAmount, data.total]);

  const handleChangeQtyAndFocus = (...args) => {
    handleChangeQty(...args);
    barcodeRef.current?.focus();
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    barcodeRef.current?.focus();
  };

  const handleDuplicateTab = () => {
    const newWindow = window.open(window.location.href, "_blank");

    // Eğer yönlendirme yapılmasını istiyorsan (aktif sekme o olsun):
    if (newWindow) {
      newWindow.focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmitSale("sale");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmitSale]);

  return (
    <div className="flex flex-col  overflow-hidden h-screen  gap-2 w-full ">
      <ToastContainer />

      <div className="flex gap-4 items-center justify-between px-8 py-4">
        <div className="flex gap-2 items-center ">
          <button
            onClick={handleDuplicateTab}
            className="p-2  border border-mainBorder rounded-lg"
          >
            <Plus />
          </button>
        </div>
        <SearchModal
          data={searchData}
          setQuery={setQuery}
          query={query}
          barcodeRef={barcodeRef}
          handleAdd={handleChangeQtyAndFocus}
        />
        <div className="flex items-center gap-6">
          <h1
            onClick={() => setInputData([])}
            className="text-red-500 cursor-pointer"
          >
            {" "}
            {t("clearAll")}
          </h1>
          <NavLink to={"/reports/sale"}>
            <ChartPie className="size-8" />
          </NavLink>

          <NavLink to={"/"}>
            <Logout className="size-8" />
          </NavLink>
          <BarcodeField
            ref={barcodeRef}
            handleBarcode={(id) => handleChangeQty(id, "increase")}
          />
        </div>
      </div>
      <div className="bg-[#F8F8F8] w-full flex h-full px-4  min-h-0">
        <ProductShortcuts
          data={data?.items}
          // products={products}
          handleChangeQty={handleChangeQtyAndFocus}
        />
        <div className="flex-1 min-h-0  bg-white px-4 gap-4 h-full flex flex-col justify-between pb-2 ">
          <div className="flex flex-col min-h-0 gap-1 ">
            <div className="flex justify-between items-center"></div>
            <div className="overflow-y-auto min-h-0  ">
              <Table columns={columns} data={data?.items} pagination={false} />
            </div>
          </div>
          {inputData.length > 0 && (
            <div className="flex flex-col h-fit justify-center gap-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center ">
                    <span className="text-2xl font-medium">{t("Endirim")}</span>
                    <input
                      type="number"
                      className="border border-gray-200 w-12 rounded-lg py-1 px-2 text-center"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Math.max(0, Math.min(100, e.target.value)))
                      }
                    />
                    <span>%</span>
                  </div>
                  <span className="text-3xl font-medium">
                    {data?.discountAmount || "0.00"} ₼
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-medium">
                    {t("Yekun Məbləğ")}
                  </span>
                  <span className="text-3xl font-medium">
                    {data?.total?.toFixed(2) || "0.00"} ₼
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex gap-2 items-center w-full h-full">
                    <button
                      onClick={() => handlePaymentMethodChange("cash")}
                      className={`flex flex-col gap-1 items-center border  px-6 py-1 rounded-lg w-full ${
                        paymentMethod == "cash"
                          ? "border-blue-500 bg-blue-50"
                          : " border-mainBorder"
                      }`}
                    >
                      <Cash
                        className={`${
                          paymentMethod == "cash"
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      />
                      <span
                        className={`${
                          paymentMethod == "cash"
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      >
                        {t("cash")}
                      </span>
                    </button>
                    <button
                      onClick={() => handlePaymentMethodChange("card")}
                      className={`flex flex-col gap-1 items-center border ${
                        paymentMethod == "card"
                          ? "border-blue-500 bg-blue-50"
                          : " border-mainBorder"
                      }  px-6 py-1 rounded-lg w-full`}
                    >
                      <CreditCard
                        className={`${
                          paymentMethod == "card"
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      />
                      <span
                        className={`${
                          paymentMethod == "card"
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      >
                        {t("card")}
                      </span>
                    </button>
                  </div>
                  <button
                    disabled={data.length == 0 || postLoading}
                    onClick={() => handleSubmitSale("return")}
                    className="flex justify-center  gap-2 items-center border border-mainBorder px-6 h-full rounded-lg w-full"
                  >
                    <Return className={"text-red-500"} />
                    <span className="text-red-500">{t("Qaytarılma")}</span>
                  </button>
                </div>
                <div className="flex flex-col gap-2 border-mainBorder border rounded-lg w-full p-2 font-medium ">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <h1>{t("receivedAmount")}</h1>{" "}
                      <span className="bg-gray-100 rounded-full px-2  border border-mainBorder text-gray-400">
                        /
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className="text-xl text-right"
                        step={0.01}
                        ref={receivedInput}
                        type="number"
                        onChange={(e) =>
                          setReceivedAmount(e.target.value.replace(",", "."))
                        }
                        value={receivedAmount}
                      />
                      <span> ₼</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h1>{t("amountToReturn")}</h1>
                    <span className="text-xl">
                      {AmountToReturn.toFixed(2)} ₼
                    </span>
                  </div>
                </div>

                <div cname="flex items-center gap-2 w-full h-full">
                  <button
                    disabled={data.length == 0 || postLoading}
                    onClick={() => handleSubmitSale("sale")}
                    className="flex justify-center text-2xl gap-2 items-center border border-mainBorder px-6 h-16 rounded-lg w-full"
                  >
                    <Payment className={"size-8 text-green-500"} />
                    <span className="text-green-500"> {t("Satış")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
