import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../baseQuery";

export const CashMovementSlice = createApi({
  reducerPath: "cashMovement",
  baseQuery,
  endpoints: (build) => ({
    getCashMovements: build.mutation({
      query: (date) => ({
        url: `/cash-transactions`,
        method: "POST",
        body: date,
      }),
      keepUnusedDataFor: 0,
    }),
    createCashMovement: build.mutation({
      query: (newTransaction) => ({
        url: `/cash-transactions/create-transaction/`,
        method: "POST",
        body: newTransaction,
      }),
    }),
    deleteCashMovement: build.mutation({
      query: (id) => ({
        url: `/cash-transactions/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCashMovementsMutation,
  useCreateCashMovementMutation,
  useDeleteCashMovementMutation,
} = CashMovementSlice;
