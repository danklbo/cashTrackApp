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

    const handleInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
    };

    const validateCategoryForm = () => {
        const newErrors = {};
        if (!categoryFormData.name) newErrors.name = "Meno je povinné.";
        if (categoryFormData.budget && isNaN(categoryFormData.budget)) newErrors.budget = "Rozpočet musí byť číslo.";
        if (categoryFormData.budget && categoryFormData.budget < 1) newErrors.budget = "Rozpočet musí byť vačší ako nula"

        setErrors({ ...errors, category: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const [errors, setErrors] = useState({
        category: {}
    });



    const handleEditCategory = async () => {
        if (!validateCategoryForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Nebol nájdený autentifikačný token.");

        const response = await fetch(`http://127.0.0.1:8000/api/v1/transaction/category/${data.id}`, {
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
        setShowFormModal(false);
        setCategoryFormData({ name: "", budget: "" }); // Reset form data
    };

    return (
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
            <DialogTrigger asChild>
                <tr className="border-b border-gray-700 hover:bg-gray-700 transition">
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
                        Upravte Kategóriu
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                            Upravte údaje kategórie
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
                    onClick={handleEditCategory}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                >
                    Upravtiť Kategóriu
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryModal;