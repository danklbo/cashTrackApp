'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';
import { TrashIcon } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';


const CategoryModalContent = ({ fetchTransactionData, categories, refetch }) => {
    const [showTableModal, setShowTableModal] = useState(false); // Controls the table modal
    const [showFormModal, setShowFormModal] = useState(false); // Controls the create/edit modal
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        budget: "",
    });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [errors, setErrors] = useState({
        delete_category: {},
        category: {}
    });


    const handleInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
    };

    const handleCreateOrUpdateCategory = async () => {
        if (!validateCategoryForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Autentifikačný token nebol nájdený.");

        const url = editingCategoryId 
            ? buildApiUrl(`/api/v1/transaction/category/${editingCategoryId}`)
            : buildApiUrl('/api/v1/transaction/category');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryFormData),
        });

        if (response.status === 422) {
            const data = await response.json();
            setErrors({ ...errors, category: { name: data.message} });
            return;
        }
        
        refetch()
        setShowFormModal(false); // Close the form modal
        setEditingCategoryId(null); // Reset editing state
        fetchTransactionData()
        setCategoryFormData({ name: "", budget: "" }); // Reset form data
    };
    
    

    const handleDelete = async (category) => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Autentifikačný token nebol nájdený.");
        try {
            const response = await fetch(buildApiUrl(`/api/v1/transaction/category/${category.id}`), {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                setErrors({ ...errors, delete_category: { message: data.message} });
                setShowErrorModal(true);
                return;
            }

            refetch()
            setShowFormModal(false); 
            fetchTransactionData()
            } catch (err) {
        }
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

    const validateCategoryForm = () => {
        const newErrors = {};
        if (!categoryFormData.name) newErrors.name = "Meno je povinné.";
        if (categoryFormData.budget && isNaN(categoryFormData.budget)) newErrors.budget = "Rozpočet musí byť číslo.";
        if (categoryFormData.budget && categoryFormData.budget < 1) newErrors.budget = "Rozpočet musí byť vačší ako nula"

        setErrors({ ...errors, category: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };


    return (
        <div>
            {/* Table Modal */}
            <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
                <DialogTrigger asChild>
                    <Button className="bg-gray-700 hover:bg-gray-600 transition-colors">
                        Spravovať Kategórie
                    </Button>
                </DialogTrigger>
    
                <DialogContent className="bg-gray-800 text-white rounded-md">
                    <DialogHeader>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <DialogTitle className="text-lg font-bold">Kategórie</DialogTitle>
                                <DialogDescription className="text-sm text-gray-400">
                                    Zobrazte a spravujte svoje kategórie.
                                </DialogDescription>
                            </div>
    
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 transition-colors mr-7"
                                onClick={handleCreateNewCategory}
                            >
                                Vytvoriť novú kategóriu
                            </Button>
                        </div>
                    </DialogHeader>
    
                    <div className="max-h-[70vh] overflow-y-scroll">
                        {/* Table to display categories */}
                        <table className="w-full bg-gray-700 text-white rounded-md relative">
                            <thead className="bg-gray-600 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Meno</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Rozpočet</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="cursor-pointer hover:bg-gray-600 transition-colors"
                                        
                                    >
                                        <td className="px-4 py-3" onClick={() => handleEditCategory(category)}>{category.name}</td>
                                        <td className="px-4 py-3" onClick={() => handleEditCategory(category)}>{category.budget}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="text-red-500 hover:text-red-700 transition-colors mr-10 mt-2"
                                            >
                                                <TrashIcon size={20} />
                                            </button>
                                        </td>
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
                            {editingCategoryId ? 'Upravenie Kategórie' : 'Vytvorenie novej Kategórie'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-400">
                            {editingCategoryId
                                ? 'Upravte údaje kategórie.'
                                : 'Vyplňte údaje pre vytvorenie novej kategórie.'}
                        </DialogDescription>
                    </DialogHeader>
    
                    {/* Name Input */}
                    <div>
                        <Input
                            name="name"
                            placeholder="Názov vašej kategórie"
                            value={categoryFormData.name || ""}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.category.name && <p className="text-red-500 text-sm mt-1">{errors.category.name}</p>}
                    </div>

    
                    {/* Budget Input */}
                    <div>
                        <Input
                            name="budget"
                            type="number"
                            placeholder="Mesačný rozpočet pre vašu kategóriu (nepovinné pole)"
                            value={categoryFormData.budget || ""}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.category.budget && <p className="text-red-500 text-sm mt-1">{errors.category.budget}</p>}
                    </div>
    
                    {/* Submit Button */}
                    <Button
                        onClick={handleCreateOrUpdateCategory}
                        className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                    >
                        {editingCategoryId ? 'Upraviť' : 'Vytvoriť'}
                    </Button>
                </DialogContent>
            </Dialog>
            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent className="bg-gray-800 text-white rounded-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Kategória má priradené transakcie</DialogTitle>
                    </DialogHeader>
                    <p className="text-red-500 text-sm mt-1">{errors.delete_category.message}</p>
                    <Button
                        className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                        onClick={() => setShowErrorModal(false)}
                    >
                        Close
                    </Button>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default CategoryModalContent;
