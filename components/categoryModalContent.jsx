'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';

const CategoryModalContent = ({ fetchTransactionData, categories, refetch }) => {
    const [showTableModal, setShowTableModal] = useState(false); // Controls the table modal
    const [showFormModal, setShowFormModal] = useState(false); // Controls the create/edit modal
    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        budget: "",
    });
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const handleInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
    };

    const handleCreateOrUpdateCategory = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");

        const url = editingCategoryId 
            ? `http://127.0.0.1:8000/api/v1/transaction/category/${editingCategoryId}`
            : 'http://127.0.0.1:8000/api/v1/transaction/category';

        const method = editingCategoryId ? 'POST' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryFormData),
        });

        refetch()
        setShowFormModal(false); // Close the form modal
        setEditingCategoryId(null); // Reset editing state
        fetchTransactionData()
        setCategoryFormData({ name: "", budget: "" }); // Reset form data
    };

    const handleEditCategory = (category) => {
        setCategoryFormData({
            name: category.name || "", // Ensure name is a string
            budget: category.budget || "", // Ensure budget is a string
        });
        setEditingCategoryId(category.id);
        setShowFormModal(true); // Open the form modal
    };

    const handleCreateNewCategory = () => {
        setCategoryFormData({ name: "", budget: "" }); // Reset form data
        setEditingCategoryId(null); // No category is being edited
        setShowFormModal(true); // Open the form modal
    };

    return (
        <div>
            {/* Table Modal */}
            <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
                <DialogTrigger asChild>
                    <Button className="bg-gray-700 hover:bg-gray-600 transition-colors">
                        Manage Categories
                    </Button>
                </DialogTrigger>
    
                <DialogContent className="bg-gray-800 text-white rounded-md">
                    <DialogHeader>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <DialogTitle className="text-lg font-bold">Categories</DialogTitle>
                                <DialogDescription className="text-sm text-gray-400">
                                    View and manage your categories.
                                </DialogDescription>
                            </div>
    
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 transition-colors mr-7"
                                onClick={handleCreateNewCategory}
                            >
                                Create New Category
                            </Button>
                        </div>
                    </DialogHeader>
    
                    <div className="max-h-[70vh] overflow-y-scroll">
                        {/* Table to display categories */}
                        <table className="w-full bg-gray-700 text-white rounded-md relative">
                            <thead className="bg-gray-600 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Budget</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="cursor-pointer hover:bg-gray-600 transition-colors"
                                        onClick={() => handleEditCategory(category)}
                                    >
                                        <td className="px-4 py-3">{category.name}</td>
                                        <td className="px-4 py-3">{category.budget}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
    
            {/* Form Modal for Creating/Editing Categories */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent className="bg-gray-800 text-white rounded-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-400">
                            {editingCategoryId
                                ? 'Edit the details of the category.'
                                : 'Fill in the details to create a new category.'}
                        </DialogDescription>
                    </DialogHeader>
    
                    {/* Name Input */}
                    <Input
                        name="name"
                        placeholder="Name of Your Category"
                        value={categoryFormData.name || ""}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
    
                    {/* Budget Input */}
                    <Input
                        name="budget"
                        type="number"
                        placeholder="Optional monthly budget for your category"
                        value={categoryFormData.budget || ""}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
    
                    {/* Submit Button */}
                    <Button
                        onClick={handleCreateOrUpdateCategory}
                        className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                    >
                        {editingCategoryId ? 'Update Category' : 'Create Category'}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryModalContent;