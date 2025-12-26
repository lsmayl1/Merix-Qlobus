import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../baseQuery";

export const CategorySlice = createApi({
  reducerPath: "category",
  baseQuery,
  endpoints: (build) => ({
    getCategories: build.query({
      query: () => "/category",
    }),
    getCategoryById: build.query({
      query: (id) => `/category/${id}`,
    }),
    createCategory: build.mutation({
      query: (body) => ({
        url: "/category",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetCategoryByIdQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} = CategorySlice;
