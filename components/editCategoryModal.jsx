'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';

const EditCategoryModal = ({ data, refetch, category, filter }) => {
    const [showFormModal, setShowFormModal] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: category,
        budget: data.budget,
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
        setShowFormModal(false);
        setEditingCategoryId(null);
        add_category({ categoryFormData })
        setCategoryFormData({ name: "", budget: "" }); // Reset form data
    };

    return (
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
            <DialogTrigger asChild>
                <tr className="border-b border-gray-700 ">
                    <td className="p-3">{category}</td>
                    <td className={`p-3 font-bold ${data.total_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{data.total_amount >= 0 ? '+' : '-'} {Math.abs(data.total_amount).toFixed(2)} €</td>
                    {
                        filter === 'expense' ? (
                            <td className={`p-3 font-bold 'text-white-500`}>{data.budget ? data.budget.toFixed(2) + " €" : "-"}</td>
                        ) : null
                    }
                </tr>
            </DialogTrigger>
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
                    Create Category
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryModal;