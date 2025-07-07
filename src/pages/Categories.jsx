import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Categories = ({ token }) => {
    const [categories, setCategories] = useState([]); // لتخزين قائمة الفئات
    const [newCategoryName, setNewCategoryName] = useState(""); // لإضافة فئة جديدة
    const [newCategoryParent, setNewCategoryParent] = useState(""); // لإضافة فئة جديدة - الكاتيجوري الأب
    const [editCategoryId, setEditCategoryId] = useState(null); // لتحديد الفئة المراد تعديلها
    const [editCategoryName, setEditCategoryName] = useState(""); // لتعديل اسم الفئة
    const [editCategoryParent, setEditCategoryParent] = useState(""); // لتعديل الكاتيجوري الأب
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // للتحكم في عرض المودال
    const [categoryToDelete, setCategoryToDelete] = useState(null); // لتخزين الفئة المراد حذفها
    const [openAccordionIds, setOpenAccordionIds] = useState([]);
    const navigate = useNavigate();

    // Helper function to log errors
    const logError = (functionName, error, additionalDetails = {}) => {
        const errorDetails = {
            function: functionName,
            message: error.message || "Unknown error",
            status: error.response?.status || "N/A",
            responseData: error.response?.data || null,
            stack: error.stack || "No stack trace available",
            ...additionalDetails,
        };
        return errorDetails;
    };

    // Helper function to display error messages in the UI
    const displayError = (errorDetails) => {
        let userMessage = "An error occurred. Please try again.";
        if (errorDetails.status === 401 || errorDetails.status === 514) {
            userMessage = "Session expired. Please log in again.";
        } else if (errorDetails.message.includes("Network Error")) {
            userMessage = "Could not connect to the server. Please ensure the backend is running.";
        } else if (errorDetails.status === 422) {
            const validationErrors = errorDetails.responseData?.errors || {};
            userMessage = Object.values(validationErrors).flat().join(", ") || "Validation Errors";
        } else if (errorDetails.status === 500) {
            if (errorDetails.responseData?.message?.includes("Duplicate entry")) {
                userMessage = "Category name already exists.";
            } else {
                userMessage = `Server error: ${errorDetails.responseData?.message || "Unknown server error"}`;
            }
        } else if (errorDetails.responseData?.message) {
            userMessage = errorDetails.responseData.message;
        }
        toast.error(userMessage);
        return userMessage;
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${backendUrl}/api/categories?limit=40`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            let categoriesArray = [];
            if (Array.isArray(response.data.data)) {
                categoriesArray = response.data.data;
            } else if (response.data.data && Array.isArray(response.data.data.categories)) {
                categoriesArray = response.data.data.categories;
            } else {
                throw new Error("Invalid response structure: Categories data not found");
            }

            const formattedCategories = categoriesArray
                .slice(0, 40)
                .map(category => ({
                    id: category.category_id,
                    name: category.category_name,
                    category_id: category.category_id,
                    parent: category.parent,
                }));

            setCategories(formattedCategories);
        } catch (error) {
            const errorDetails = logError("fetchCategories", error);
            displayError(errorDetails);

            if (errorDetails.status === 401 || errorDetails.status === 514) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [token, navigate]);

    // Add new category
    const addCategory = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            const categoryExists = categories.some(
                (category) =>
                    category.name.toLowerCase() === newCategoryName.toLowerCase() &&
                    ((category.parent ? category.parent.id : "") === (newCategoryParent ? parseInt(newCategoryParent) : ""))
            );
            if (categoryExists) {
                throw new Error("Category name already exists under the same parent (client-side check)");
            }

            const requestData = { name: newCategoryName };
            if (newCategoryParent) {
                requestData.parent_id = parseInt(newCategoryParent);
            }

            const response = await axios.post(
                `${backendUrl}/api/categories`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Add Category Response:', response);

            if (response.data.status === 200 || response.data.status === 201) {
                toast.success("Category added successfully");
                setNewCategoryName("");
                setNewCategoryParent("");
                fetchCategories();
            } else {
                throw new Error(response.data.message || "Failed to add category");
            }
        } catch (error) {
            console.error('Add Category Error:', error);
            const errorDetails = logError("addCategory", error, { newCategoryName, newCategoryParent });
            displayError(errorDetails);

            if (errorDetails.status === 401 || errorDetails.status === 514) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Update category
    const updateCategory = async (categoryId) => {
        try {
            setIsLoading(true);

            const categoryExists = categories.some(
                (category) =>
                    category.category_id !== categoryId &&
                    category.name.toLowerCase() === editCategoryName.toLowerCase()
            );
            if (categoryExists) {
                throw new Error("Category name already exists (client-side check)");
            }

            const requestData = { name: editCategoryName };
            if (editCategoryParent) {
                requestData.parent_id = parseInt(editCategoryParent);
            } else {
                requestData.parent_id = null;
            }

            const response = await axios.put(
                `${backendUrl}/api/categories/${categoryId}?_method=PUT`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 200) {
                toast.success("Category updated successfully");
                setEditCategoryId(null);
                setEditCategoryName("");
                setEditCategoryParent("");
                fetchCategories();
            } else {
                throw new Error(response.data.message || "Failed to update category");
            }
        } catch (error) {
            const errorDetails = logError("updateCategory", error, { categoryId, editCategoryName, editCategoryParent });
            displayError(errorDetails);

            if (errorDetails.status === 401 || errorDetails.status === 514) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Delete category
    const deleteCategory = async (categoryId) => {
        try {
            setIsLoading(true);

            const response = await axios.delete(
                `${backendUrl}/api/categories/${categoryId}?_method=DELETE`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.status === 200) {
                toast.success("Category deleted successfully");
                fetchCategories();
            } else {
                throw new Error(response.data.message || "Failed to delete category");
            }
        } catch (error) {
            const errorDetails = logError("deleteCategory", error, { categoryId });
            displayError(errorDetails);

            if (errorDetails.status === 401 || errorDetails.status === 514) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    // Open delete modal
    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    // Confirm deletion
    const confirmDelete = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete.category_id);
        }
    };

    // Get parent categories (categories without parents or with null parent)
    const getParentCategories = () => {
        return categories.filter(category => !category.parent);
    };

    // Get category name by ID
    const getCategoryNameById = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : '';
    };

    // دالة تبديل الفتح/الإغلاق للكاتيجوري الرئيسية
    const toggleAccordion = (parentId) => {
        setOpenAccordionIds((prev) =>
            prev.includes(parentId)
                ? prev.filter((id) => id !== parentId)
                : [...prev, parentId]
        );
    };

    // دالة لجلب الكاتيجوري الفرعية
    const getSubCategories = (parentId) =>
        categories.filter((cat) => cat.parent && cat.parent.id === parentId);

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#f9fafb] p-6">
            {/* Add new category form */}
            <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Category</h2>
                <form onSubmit={addCategory}>
                    <div className="mb-6">
                        <input
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            value={newCategoryName}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            type="text"
                            placeholder="Enter category name"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <select
                            onChange={(e) => setNewCategoryParent(e.target.value)}
                            value={newCategoryParent}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            <option value="">Select Parent Category (Optional)</option>
                            {getParentCategories().map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Category"}
                    </button>
                </form>
            </div>

            {/* Categories table */}
            <div className="w-full max-w-6xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories List</h2>
                {isLoading ? (
                    <p className="text-gray-500 text-center">Loading...</p>
                ) : !categories || categories.length === 0 ? (
                    <p className="text-gray-500 text-center">No categories found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-12"></th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Parent Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Edit</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* صفوف الكاتيجوري الرئيسية فقط */}
                                {categories.filter((cat) => !cat.parent).map((category) => (
                                    <React.Fragment key={category.category_id}>
                                        <tr className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-4 text-center cursor-pointer" onClick={() => toggleAccordion(category.category_id)}>
                                                {getSubCategories(category.category_id).length > 0 && (
                                                    <span className="text-lg select-none">
                                                        {openAccordionIds.includes(category.category_id) ? "▲" : "▼"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editCategoryId === category.category_id ? (
                                                    <input
                                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                                        value={editCategoryName}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                                        type="text"
                                                        placeholder="Edit category name"
                                                    />
                                                ) : (
                                                    <span className="text-gray-800">{category.name}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editCategoryId === category.category_id ? (
                                                    <select
                                                        onChange={(e) => setEditCategoryParent(e.target.value)}
                                                        value={editCategoryParent}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        <option value="">No Parent</option>
                                                        {getParentCategories().map((parentCategory) => (
                                                            <option 
                                                                key={parentCategory.category_id} 
                                                                value={parentCategory.category_id}
                                                                disabled={parentCategory.category_id === category.category_id}
                                                            >
                                                                {parentCategory.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-gray-600">
                                                        {category.parent ? category.parent.name : "No Parent"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editCategoryId === category.category_id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateCategory(category.category_id)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                                            disabled={isLoading}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditCategoryId(null);
                                                                setEditCategoryName("");
                                                                setEditCategoryParent("");
                                                            }}
                                                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-400"
                                                            disabled={isLoading}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditCategoryId(category.category_id);
                                                            setEditCategoryName(category.name);
                                                            setEditCategoryParent(category.parent ? category.parent.id.toString() : "");
                                                        }}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                                                        disabled={isLoading}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openDeleteModal(category)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                        {/* صفوف الكاتيجوري الفرعية إذا كانت مفتوحة */}
                                        {openAccordionIds.includes(category.category_id) &&
                                            getSubCategories(category.category_id).map((sub) => (
                                                <tr key={sub.category_id} className="border-b bg-gray-50">
                                                    <td className="px-2 py-4"></td>
                                                    <td className="px-10 py-4 text-gray-700">
                                                        {editCategoryId === sub.category_id ? (
                                                            <input
                                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                                value={editCategoryName}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                                                type="text"
                                                                placeholder="Edit category name"
                                                            />
                                                        ) : (
                                                            <span>{sub.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {editCategoryId === sub.category_id ? (
                                                            <select
                                                                onChange={(e) => setEditCategoryParent(e.target.value)}
                                                                value={editCategoryParent}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                                            >
                                                                <option value="">No Parent</option>
                                                                {getParentCategories().map((parentCategory) => (
                                                                    <option 
                                                                        key={parentCategory.category_id} 
                                                                        value={parentCategory.category_id}
                                                                        disabled={parentCategory.category_id === sub.category_id}
                                                                    >
                                                                        {parentCategory.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span>{sub.parent ? sub.parent.name : "No Parent"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editCategoryId === sub.category_id ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => updateCategory(sub.category_id)}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                                                    disabled={isLoading}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditCategoryId(null);
                                                                        setEditCategoryName("");
                                                                        setEditCategoryParent("");
                                                                    }}
                                                                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-400"
                                                                    disabled={isLoading}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditCategoryId(sub.category_id);
                                                                    setEditCategoryName(sub.name);
                                                                    setEditCategoryParent(sub.parent ? sub.parent.id.toString() : "");
                                                                }}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                                                                disabled={isLoading}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => openDeleteModal(sub)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                                                            disabled={isLoading}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the category "{categoryToDelete?.name}"?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;