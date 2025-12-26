import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
export const Modal = ({ handleClose, onSubmit }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  return (
    <div className="absolute inset-0 z-50 flex max-md:-top-54  h-screen w-full drop-shadow-lg">
      <ToastContainer />

      <div
        className={`flex w-full  justify-center max-md:p-0 ${
          isMobile ? "py-2 px-2 h-full" : ""
        }`}
      >
        <div
          className={`flex  ${
            isMobile
              ? "w-full max-md:h-full  h-[90%] justify-between"
              : " gap-32 h-fit"
          } flex-col  rounded-xl border  border-gray-200 bg-white px-4 py-6 w-1/3 `}
        >
          {/* Form Fields */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`flex flex-col w-full gap-4   max-md:gap-8 ${
              isMobile ? "gap-16" : "gap-10"
            }`}
          >
            {/* Product Name */}
            <div className="flex justify-between flex-col gap-6 items-end ">
              <div className="flex flex-col w-full ">
                <label htmlFor="name" className="text-md max-lg:text-md">
                  {t("name")}
                </label>
                <input
                  id="name"
                  placeholder={t("name")}
                  {...register("name", { required: "Name Required" })}
                  className="rounded-lg focus:outline-blue-500  border py-1 border-mainBorder px-2"
                />
                {errors?.name && (
                  <p className="text-red-500 text-sm">
                    {errors?.name?.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col w-full ">
                <label htmlFor="name" className="text-md max-lg:text-md">
                  {t("Phone")}
                </label>
                <input
                  id="phone"
                  placeholder={t("Phone")}
                  {...register("phone")}
                  className="rounded-lg focus:outline-blue-500  border py-1 border-mainBorder px-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 justify-end w-full">
                <button
                  onClick={() => {
                    reset();
                    handleClose();
                  }}
                  type="button"
                  className="rounded-xl truncate  max-lg:text-md cursor-pointer border border-red-700 px-4 py-1 font-semibold text-red-700"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl max-lg:text-md cursor-pointer border border-blue-700 px-4 py-1 font-semibold text-blue-700"
                >
                  {t("add")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
