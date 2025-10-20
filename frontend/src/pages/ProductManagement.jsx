import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepBack, Edit2, Trash2, Plus, X } from "lucide-react";
import useProductStore from "../store/productStore";
import useCategoryStore from "../store/categoryStore";

export default function ProductManagement() {
    const navigate = useNavigate();

    const products = useProductStore((state) => state.products);
    const getProducts = useProductStore((state) => state.getProducts);
    const createProduct = useProductStore((state) => state.createProduct);
    const updateProduct = useProductStore((state) => state.updateProduct);
    const deleteProduct = useProductStore((state) => state.deleteProduct);
    const loading = useProductStore((state) => state.loading);
    const categories = useCategoryStore((state) => state.categories);
    const getCategories = useCategoryStore((state) => state.getCategories);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        merchantPrice: "",
        category: "",
        image: null,
        COD: true
    });

    useEffect(() => {
        getProducts();
        getCategories();
    }, [getProducts, getCategories]);

    const resetForm = () =>
        setFormData({
            title: "",
            description: "",
            price: "",
            merchantPrice: "",
            category: "",
            image: null,
            COD: true
        });

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.merchantPrice ||
            !formData.category
        ) {
            alert("All fields are required!");
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // Convert boolean to string so it passes properly via multipart/form-data
                data.append(key, typeof value === "boolean" ? String(value) : value);
            }
        });

        if (showEditModal && selectedProduct) {
            setShowEditModal(false);
            await updateProduct(selectedProduct._id, data);
        } else {
            setShowAddModal(false);
            await createProduct(data);
        }

        resetForm();
    };
    return (
        <div className="p-6">
            {/* Go Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mx-auto flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 active:scale-95"
            >
                <StepBack className="w-5 h-5" />
                <span className="font-medium">Go Back</span>
            </button>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mt-6 text-center">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                    Product Management
                </span>
            </h1>

            {/* Add Product Button */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
                {products?.length === 0 && !loading ? (
                    <p className="text-center text-gray-500 col-span-full">
                        No products available.
                    </p>
                ) : (
                    products?.map((p) => (
                        <div
                            key={p._id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col overflow-hidden"
                        >
                            <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-3 flex flex-col flex-grow">
                                <h2 className="text-lg font-semibold text-gray-800 truncate">
                                    {p.title}
                                </h2>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {p.description}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    Cash on Delivery: {p.COD ? "YES" : "NO"}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {p?.category?.title}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-lg font-semibold text-[rgb(221,3,3)] tracking-wide">
                                        ₹{p.price}
                                    </span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                                        Merchant: ₹{p.merchantPrice}
                                    </span>
                                </div>
                                <div className="flex justify-end mt-3 gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setFormData({
                                                title: p?.title,
                                                description: p?.description,
                                                price: p?.price,
                                                merchantPrice: p?.merchantPrice,
                                                category: p?.category?._id,
                                                image: null,
                                                COD: p?.COD
                                            });
                                            setShowEditModal(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-yellow-400 text-white hover:bg-yellow-500 transition"

                                    >
                                        <Edit2 className="w-5 h-5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setShowDeleteModal(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                                    >
                                        <Trash2 className="w-5 h-5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 relative shadow-xl">
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                setShowEditModal(false);
                                resetForm();
                            }}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {showEditModal ? "Edit Product" : "Add Product"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            ></textarea>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="w-1/2 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Merchant Price"
                                    className="w-1/2 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.merchantPrice}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            merchantPrice: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <select
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                            >
                                <option value="">Select Category</option>
                                {categories?.map((c) => (
                                    <option key={c?._id} value={c?._id}>
                                        {c?.title}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData({ ...formData, image: e.target.files[0] })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.COD}
                                    onChange={(e) =>
                                        setFormData({ ...formData, COD: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                />
                                <label className="text-gray-700">Cash on Delivery Available</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                            >
                                {showEditModal ? "Update Product" : "Add Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3 relative shadow-xl text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Delete Product
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-red-500">
                                {selectedProduct.title}
                            </span>
                            ?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteProduct(selectedProduct._id);
                                    setShowDeleteModal(false);
                                }}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}