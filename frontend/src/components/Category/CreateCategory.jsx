import React, { useState } from "react";

export const CreateCategory = ({ handleClose, createCategory }) => {
  const [categoryName, setCategoryName] = useState("");
  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      <div className="bg-white border border-mainBorder p-6 rounded-lg flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Create New Category</h2>
        <input
          type="text"
          placeholder="Category Name"
          className="border-mainBorder border
			rounded-lg px-4 py-2 w-96"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border-mainBorder border"
          >
            Cancel
          </button>
          <button
            onClick={() => createCategory(categoryName)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
