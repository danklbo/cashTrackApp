'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";

const CreateTransactionModalContent = ({ fetchTransactionData, categories, add_category }) => {
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [transactionFormData, setTransactionFormData] = useState({
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0], //ocakavany format pre dateinput
        category_id: ""
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        budget: "",
    });

    const [errors, setErrors] = useState({
        transaction: {},
        category: {}
    });

    const handleInputChange = (name, value) => {
        setTransactionFormData({ ...transactionFormData, [name]: value });
        // Clear errors when user starts typing
        setErrors({ ...errors, transaction: { ...errors.transaction, [name]: "" } });
    };

    const handleCategoryInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
        // Clear errors when user starts typing
        setErrors({ ...errors, category: { ...errors.category, [name]: "" } });
    };

    const validateTransactionForm = () => {
        const newErrors = {};
        if (!transactionFormData.amount) newErrors.amount = "Amount is required.";
        if (!transactionFormData.description) newErrors.description = "Description is required.";
        if (!transactionFormData.category_id) newErrors.category_id = "Category is required.";

        setErrors({ ...errors, transaction: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const validateCategoryForm = () => {
        const newErrors = {};
        if (!categoryFormData.name) newErrors.name = "Name is required.";
        if (categoryFormData.budget && isNaN(categoryFormData.budget)) newErrors.budget = "Budget must be a number.";
        if (categoryFormData.budget && categoryFormData.budget < 1) newErrors.budget = "Budget musi byt vacsi ako nula"

        setErrors({ ...errors, category: newErrors });
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleCreateCategory = async () => {
        if (!validateCategoryForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");

        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/transaction/category", {
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

    const handleSubmit = () => {
        if (!validateTransactionForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");

        fetch("http://127.0.0.1:8000/api/v1/transaction", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionFormData)
        })
            .then(() => setShowDialog(false))
            .then(() => fetchTransactionData())
            .catch((err) => console.error("Error creating transaction:", err));

        setTransactionFormData({
            amount: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            category_id: ""
        });
    };

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
                <Button className="ml-auto bg-gray-700 hover:bg-gray-600 transition-colors">
                    Create Transaction
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-gray-800 text-white rounded-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Create Transaction</DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                        Fill in the details to create a new transaction.
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
                        <Select value={`${transactionFormData.category_id}`} onValueChange={(value) => handleInputChange('category_id', value)}>
                            <SelectTrigger className="w-[280px] bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Vyberte Kategóriu" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white rounded-md">
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                        className="hover:bg-gray-700 transition-colors"
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
                                Create Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 text-white rounded-md">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Create Category</DialogTitle>
                                <DialogDescription className="text-sm text-gray-400">
                                    Fill in the details to create a new category.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Name Input */}
                            <div>
                                <Input
                                    name="name"
                                    placeholder="Name of Your Category"
                                    value={categoryFormData.name}
                                    onChange={(e) => handleCategoryInputChange(e.target.name, e.target.value)}
                                    className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.category.budget && <p className="text-red-500 text-sm mt-1">{errors.category.budget}</p>}
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleCreateCategory}
                                className="bg-blue-500 hover:bg-blue-600 transition-colors mt-4"
                            >
                                Create Category
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors mt-6"
                >
                    Submit
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTransactionModalContent;