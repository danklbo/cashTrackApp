'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';

const EditTransactionModal = ({ transaction, fetchTransactionData, categories, add_category, compactRow = false }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [transactionFormData, setTransactionFormData] = useState({
        amount: "",
        description: "",
        date: "",
        category_id: "",
    });
    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        budget: "",
    });
    const [errors, setErrors] = useState({
        transaction: {},
        category: {},
    });

    // Handle input changes for transaction form
    const handleInputChange = (name, value) => {
        setTransactionFormData({ ...transactionFormData, [name]: value });
        // Clear errors when user starts typing
        setErrors({ ...errors, transaction: { ...errors.transaction, [name]: "" } });
    };

    // Handle input changes for category form
    const handleCategoryInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
        // Clear errors when user starts typing
        setErrors({ ...errors, category: { ...errors.category, [name]: "" } });
    };

    // Validate transaction form
    const validateTransactionForm = () => {
        const newErrors = {};
        if (!transactionFormData.amount) newErrors.amount = "Suma je povinná.";
        if (!transactionFormData.description) newErrors.description = "Popis je povinný.";
        if (!transactionFormData.category_id) newErrors.category_id = "Kategória je povinná.";

        setErrors({ ...errors, transaction: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Validate category form
    const validateCategoryForm = () => {
        const newErrors = {};
        if (!categoryFormData.name) newErrors.name = "Meno je povinné.";
        if (categoryFormData.budget && isNaN(categoryFormData.budget)) newErrors.budget = "Rozpočet musí byť číslo.";
        if (categoryFormData.budget && categoryFormData.budget < 1) newErrors.budget = "Rozpočet musí byť vačší ako nula"

        setErrors({ ...errors, category: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle creating a new category
    const handleCreateCategory = async () => {
        if (!validateCategoryForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Nebol nájdený autentifikačný token.");

        try {
            const response = await fetch(buildApiUrl('/api/v1/transaction/category'), {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryFormData),
            });

            const data = await response.json();
            if (response.status === 422) {
                setErrors({ ...errors, category: { name: data.message} });
                return;
            }

            setShowCategoryDialog(false);
            add_category(data.data);
            setTransactionFormData({ ...transactionFormData, category_id: data.data.id });
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    // Handle updating a transaction
    const handleSubmit = async () => {
        if (!validateTransactionForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Nebol nájdený autentifikačný token.");

        try {
            const response = await fetch(buildApiUrl(`/api/v1/transaction/${transaction.id}`), {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update transaction: ${response.status} - ${errorData.message || response.statusText}`);
            }

            setShowDialog(false);
            fetchTransactionData(); // Refresh transaction list
        } catch (err) {
            console.error("Error updating transaction:", err);
        }
    };

    // Handle deleting a transaction
    const handleDelete = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Nebol nájdený autentifikačný token.");

        try {
            const response = await fetch(buildApiUrl(`/api/v1/transaction/${transaction.id}`), {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to delete transaction: ${response.status} - ${errorData.message || response.statusText}`);
            }

            setShowDialog(false);
            fetchTransactionData(); // Refresh the transaction list
        } catch (err) {
            console.error("Error deleting transaction:", err);
        }
    };

    // Initialize form data when transaction changes
    useEffect(() => {
        setTransactionFormData({
            amount: transaction.amount,
            description: transaction.description,
            date: format(new Date(transaction.date), 'yyyy-MM-dd'),
            category_id: transaction.category.id,
        });
    }, [transaction]);

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
                <tr className="border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition">
                    {!compactRow && <td className="p-3">{transaction.category.name}</td>}
                    <td className="p-3">{transaction.description}</td>
                    <td className="p-3">{format(new Date(transaction.date), 'yyyy-MM-dd')}</td>
                    <td className={`p-3 font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.amount >= 0 ? '+' : '-'} {Math.abs(transaction.amount).toFixed(2)} €
                    </td>
                </tr>
            </DialogTrigger>

            <DialogContent className="bg-gray-800 text-white rounded-md">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-lg font-bold">Upravte Transakciu</DialogTitle>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 transition-colors mr-10 mt-2"
                        >
                            <TrashIcon size={20} />
                        </button>
                    </div>
                    <DialogDescription className="text-sm text-gray-400">
                        Aktualizujte podrobnosti transakcie.
                    </DialogDescription>
                </DialogHeader>

                {/* Amount Input */}
                <div>
                    <Input
                        name="amount"
                        type="number"
                        placeholder="Amount"
                        value={transactionFormData.amount}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.transaction.amount && <p className="text-red-500 text-sm mt-1">{errors.transaction.amount}</p>}
                </div>

                {/* Description Input */}
                <div>
                    <Input
                        name="description"
                        placeholder="Description"
                        value={transactionFormData.description}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.transaction.description && <p className="text-red-500 text-sm mt-1">{errors.transaction.description}</p>}
                </div>

                {/* Date Input */}
                <div>
                    <Input
                        name="date"
                        type="date"
                        value={transactionFormData.date}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.transaction.date && <p className="text-red-500 text-sm mt-1">{errors.transaction.date}</p>}
                </div>

                {/* Category Select */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <Select
                            value={`${transactionFormData.category_id}`}
                            onValueChange={(value) => handleInputChange('category_id', value)}
                        >
                            <SelectTrigger className="w-[280px] bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Vyberte Kategóriu" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white rounded-md">
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                        className="hover:bg-gray-600 transition-colors"
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.transaction.category_id && <p className="text-red-500 text-sm mt-1">{errors.transaction.category_id}</p>}
                    </div>

                    {/* Create Category Button */}
                    <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 transition-colors"
                                onClick={() => setShowCategoryDialog(true)}
                            >
                                Vytvoriť Kategóriu
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 text-white rounded-md">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Vytvoriť Kategóriu</DialogTitle>
                                <DialogDescription className="text-sm text-gray-400">
                                    Pre vytvorenie Kategórie vyplňte podrobnosti.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Name Input */}
                            <div>
                                <Input
                                    name="name"
                                    placeholder="Name of Your Category"
                                    value={categoryFormData.name}
                                    onChange={(e) => handleCategoryInputChange(e.target.name, e.target.value)}
                                    className="bg-gray-700 text-white rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                {errors.category.name && <p className="text-red-500 text-sm mt-1">{errors.category.name}</p>}
                            </div>

                            {/* Budget Input */}
                            <div>
                                <Input
                                    name="budget"
                                    type="number"
                                    placeholder="Optional monthly budget for your category"
                                    value={categoryFormData.budget}
                                    onChange={(e) => handleCategoryInputChange(e.target.name, e.target.value)}
                                    className="bg-gray-700 text-white rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                {errors.category.budget && <p className="text-red-500 text-sm mt-1">{errors.category.budget}</p>}
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleCreateCategory}
                                className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                            >
                                Vytvoriť kategóriu
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Update Button */}
                <Button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors mt-6"
                >
                    Upraviť
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EditTransactionModal;
