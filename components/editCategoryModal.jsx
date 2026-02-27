'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useMemo, useState } from 'react';
import { buildApiUrl } from '@/lib/api';
import EditTransactionModal from './editTransactionModal';

const EditCategoryModal = ({ data, category, filter, transactions = [], fetchTransactionData, categories = [], add_category, refetchCategories }) => {
    const [showFormModal, setShowFormModal] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: category,
        budget: data.budget || "",
    });
    const [errors, setErrors] = useState({
        category: {}
    });

    const categoryTransactions = useMemo(() => {
        return transactions
            .filter((transaction) => (transaction.category?.name || '') === category)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, category]);

    const handleInputChange = (name, value) => {
        setCategoryFormData({ ...categoryFormData, [name]: value });
        setErrors({ ...errors, category: { ...errors.category, [name]: "" } });
    };

    const validateCategoryForm = () => {
        const newErrors = {};

        if (!categoryFormData.name) newErrors.name = "Meno je povinné.";
        if (categoryFormData.budget && isNaN(categoryFormData.budget)) newErrors.budget = "Rozpočet musí byť číslo.";
        if (categoryFormData.budget && categoryFormData.budget < 1) newErrors.budget = "Rozpočet musí byť vačší ako nula";

        setErrors({ ...errors, category: newErrors });
        return Object.keys(newErrors).length === 0;
    };

    const handleEditCategory = async () => {
        if (!validateCategoryForm()) return;

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Nebol nájdený autentifikačný token.");

        const response = await fetch(buildApiUrl(`/api/v1/transaction/category/${data.id}`), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryFormData),
        });

        if (response.status === 422) {
            const responseData = await response.json();
            setErrors({ ...errors, category: { name: responseData.message } });
            return;
        }

        if (typeof fetchTransactionData === 'function') {
            fetchTransactionData();
        }

        if (typeof refetchCategories === 'function') {
            refetchCategories();
        }

        setShowFormModal(false);
    };

    return (
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
            <DialogTrigger asChild>
                <tr className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3">{category}</td>
                    <td className={`p-3 font-bold ${data.total_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{data.total_amount >= 0 ? '+' : '-'} {Math.abs(data.total_amount).toFixed(2)} €</td>
                    {
                        filter === 'expense' ? (
                            <td className="p-3 font-bold text-white">{data.budget ? data.budget.toFixed(2) + " €" : "-"}</td>
                        ) : null
                    }
                </tr>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white rounded-md max-h-[90vh] overflow-hidden flex flex-col sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        Detail kategórie
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                        Prehľad kategórie a transakcií
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-700 rounded-md p-3">
                        <p className="text-xs text-gray-400">Meno</p>
                        <Input
                            name="name"
                            value={categoryFormData.name || ""}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="bg-gray-600 text-white border border-gray-500 rounded-md px-3 py-2 mt-2"
                        />
                        {errors.category.name && <p className="text-red-500 text-sm mt-1">{errors.category.name}</p>}
                    </div>

                    <div className="bg-gray-700 rounded-md p-3">
                        <p className="text-xs text-gray-400">Rozpočet</p>
                        <Input
                            name="budget"
                            type="number"
                            value={categoryFormData.budget || ""}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="bg-gray-600 text-white border border-gray-500 rounded-md px-3 py-2 mt-2"
                        />
                        {errors.category.budget && <p className="text-red-500 text-sm mt-1">{errors.category.budget}</p>}
                    </div>
                </div>

                <Button
                    onClick={handleEditCategory}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                    Uložiť kategóriu
                </Button>

                <div className="bg-gray-700 rounded-md overflow-hidden max-h-[55vh] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-600 text-gray-300 sticky top-0">
                            <tr>
                                <th className="p-3">Popis</th>
                                <th className="p-3">Dátum</th>
                                <th className="p-3">Suma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryTransactions.length > 0 ? (
                                categoryTransactions.map((transaction) => (
                                    <EditTransactionModal
                                        key={transaction.id}
                                        transaction={transaction}
                                        categories={categories}
                                        add_category={add_category}
                                        fetchTransactionData={fetchTransactionData}
                                        compactRow={true}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-3 text-gray-400">Žiadne transakcie pre túto kategóriu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryModal;
