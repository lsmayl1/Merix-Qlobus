import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseQuery";

export const StockMovementsSlice = createApi({
  reducerPath: "stockMovements",
  baseQuery,
  endpoints: (build) => ({
    getStockMovements: build.mutation({
      query: (data) => ({
        url: `/stock-transactions/`,
        method: "POST",
        body: data,
      }),
    }),
    createStockMovement: build.mutation({
      query: (newTransaction) => ({
        url: `/stock-transactions/create`,
        method: "POST",
        body: newTransaction,
      }),
    }),
    deleteStockMovement: build.mutation({
      query: (id) => ({
        url: `/stock-transactions/${id}`,
        method: "DELETE",
      }),
    }),
    getProductStockMovement: build.query({
      query: (id) => `/stock-transactions/product/${id}`,
    }),
  }),
});

export const {
  useGetStockMovementsMutation,
  useCreateStockMovementMutation,
  useDeleteStockMovementMutation,
  useGetProductStockMovementQuery,
} = StockMovementsSlice;
