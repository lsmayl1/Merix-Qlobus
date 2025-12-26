import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from "../../redux/slices/CategorySlice";
import { CreateCategory } from "../../components/Category/CreateCategory";

export const Category = () => {
  const { data, refetch } = useGetCategoriesQuery();
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [createCategory] = useCreateCategoryMutation();

  const handleCreateCategory = async (categoryName) => {
    try {
      if (categoryName.trim() === "") return;
      await createCategory({ name: categoryName }).unwrap();
      setShowCreateCategory(false);
      refetch();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };
  return (
    <div className=" p-6 w-full h-full relative ">
      {showCreateCategory && (
        <CreateCategory
          handleClose={() => setShowCreateCategory(false)}
          createCategory={handleCreateCategory}
        />
      )}
      <div className="bg-white h-full rounded-lg w-full flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            className=" rounded-lg  w-full text-xl px-4"
            placeholder="Category name"
          />
          <button
            onClick={() => setShowCreateCategory(true)}
            className="text-nowrap border-mainBorder border px-4 py-2 rounded-lg"
          >
            Create Category
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4 justify-center  overflow-y-auto min-h-1/5">
          {data?.map((dt) => (
            <NavLink
              key={dt.category_id}
              to={`${dt.category_id}`}
              className="p-6 items-center justify-center hover:bg-gray-200 cursor-pointer rounded-lg border-mainBorder border flex gap-4 "
            >
              <span className=" text-3xl">{dt.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
