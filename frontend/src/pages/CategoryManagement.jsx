import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepBack, Plus, X, Edit2, Trash2 } from "lucide-react";
import useCategoryStore from "../store/categoryStore";

export default function CategoryManagement() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  const categories = useCategoryStore((state) => state.categories);
  const getCategories = useCategoryStore((state) => state.getCategories);
  const createCategory = useCategoryStore((state) => state.createCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);

  useEffect(() => {
    getCategories();
  }, []);

  const handleCreateOrUpdateCategory = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a category title!");
      return;
    }

    if (editCategoryId) {
      updateCategory(editCategoryId, title);
      setEditCategoryId(null);
    } else {
      createCategory(title);
    }

    setTitle("");
    setShowModal(false);
  };

  const handleEdit = (cat) => {
    setTitle(cat.title);
    setEditCategoryId(cat._id);
    setShowModal(true);
  };

  const handleDelete = (catId) => {
    setDeleteCategoryId(catId);
  };

  const confirmDelete = () => {
    deleteCategory(deleteCategoryId);
    setDeleteCategoryId(null);
  };

  return (
    <div className="p-6 min-h-screen bg-[rgb(254,243,226)]">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mx-auto flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 active:scale-95"
      >
        <StepBack className="w-5 h-5" />
        <span className="font-medium">Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mt-8 flex justify-center items-center gap-3">
        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          Category Management
        </span>
      </h1>

      {/* Create Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => {
            setTitle("");
            setEditCategoryId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="max-w-3xl mx-auto mt-10 grid gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <span className="font-medium text-gray-800">{cat.title}</span>
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(cat)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-yellow-400 text-white hover:bg-yellow-500 transition"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
          <div className="bg-white w-[90%] sm:w-[400px] rounded-2xl p-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              {editCategoryId ? "Edit Category" : "Create New Category"}
            </h2>

            <form
              onSubmit={handleCreateOrUpdateCategory}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter category title"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
              />

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-lg shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                {editCategoryId ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[90%] sm:w-[400px] rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteCategoryId(null)}
                className="bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
