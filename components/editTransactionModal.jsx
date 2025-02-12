'use client';

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { TrashIcon } from 'lucide-react';


const EditTransactionModal = ({ transaction, fetchTransactionData }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [categories, setCategories] = useState([]);
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

    const handleInputChange = (name, value) => {
        setTransactionFormData({ ...transactionFormData, [name]: value });
    };
    const handleCategoryInputChange = (name, value) => {;
        setCategoryFormData({ ...categoryFormData, [name]: value});
    };

    const handleCreateCategory = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch("http://127.0.0.1:8000/api/v1/transaction/category", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryFormData),
        });
        const data = await response.json();
        setShowCategoryDialog(false);
        setCategories([...categories, data.data]);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/transaction/${transaction.id}`, {
                method: "POST", // Use PUT for updates
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionFormData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details from the server
                throw new Error(`Failed to update transaction: ${response.status} - ${errorData.message || response.statusText}`);
            }

            setShowDialog(false);
            fetchTransactionData(); // Refresh transaction list
        } catch (err) {
            console.error("Error updating transaction:", err);
            // Consider showing an error message to the user here
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found.");
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/transaction/${transaction.id}`, {
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
    

    const fetchCategoryData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch('http://127.0.0.1:8000/api/v1/transaction/categories', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            })

            const data = await response.json();
            setCategories(data.data);
            
            if (!response.ok) throw new Error('Failed to fetch categories');
        } catch (err) {
            setError(err.message);
        }
    }


    useEffect(() => {
        fetchCategoryData();

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
                    <td className="p-3">{transaction.category.name}</td>
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
                        <DialogTitle className="text-lg font-bold">Edit Transaction</DialogTitle>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 transition-colors mr-10 mt-2"
                        >
                            <TrashIcon size={20} />
                        </button>
                    </div>
                    <DialogDescription className="text-sm text-gray-400">
                        Update your transaction details below.
                    </DialogDescription>
                </DialogHeader>
    
                {/* Amount Input */}
                <Input
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    value={transactionFormData.amount}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
    
                {/* Description Input */}
                <Input
                    name="description"
                    placeholder="Description"
                    value={transactionFormData.description}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
    
                {/* Date Input */}
                <Input
                    name="date"
                    type="date"
                    value={transactionFormData.date}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
    
                {/* Category Select */}
                <div className="flex justify-between items-center mt-4">
                    <Select
                        value={transactionFormData.category_id?.toString()}
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
                            <Input
                                name="name"
                                placeholder="Name of Your Category"
                                value={categoryFormData.name}
                                onChange={(e) => handleCategoryInputChange(e.target.name, e.target.value)}
                                className="bg-gray-700 text-white rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
    
                            {/* Budget Input */}
                            <Input
                                name="budget"
                                type="number"
                                placeholder="Optional monthly budget for your category"
                                value={categoryFormData.budget}
                                onChange={(e) => handleCategoryInputChange(e.target.name, e.target.value)}
                                className="bg-gray-700 text-white rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
    
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
    
                {/* Update Button */}
                <Button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors mt-6"
                >
                    Update
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EditTransactionModal;
