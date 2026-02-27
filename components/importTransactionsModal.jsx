'use client'

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildApiUrl } from '@/lib/api';

const MAX_FILE_SIZE = 1024 * 1024;

const ImportTransactionsModal = ({ fetchTransactionData, triggerClassName = '' }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [bank, setBank] = useState('lunar');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);

    const fileName = useMemo(() => file?.name || '', [file]);

    const resetState = () => {
        setBank('lunar');
        setFile(null);
        setError('');
        setSummary(null);
        setLoading(false);
    };

    const validateFile = (selectedFile) => {
        if (!selectedFile) {
            return 'Súbor je povinný.';
        }

        const isCsv = selectedFile.name.toLowerCase().endsWith('.csv');
        if (!isCsv) {
            return 'Podporovaný je iba CSV súbor.';
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            return 'Maximálna veľkosť súboru je 1 MB.';
        }

        return '';
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
        setSummary(null);
        setError(selectedFile ? validateFile(selectedFile) : '');
    };

    const handleSubmit = async () => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Autentifikačný token nebol nájdený.');
            return;
        }

        setLoading(true);
        setError('');
        setSummary(null);

        try {
            const formData = new FormData();
            formData.append('bank', bank);
            formData.append('file', file);

            const response = await fetch(buildApiUrl('/api/v1/transactions/import'), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Import zlyhal.');
                return;
            }

            setSummary(data.summary || null);
            fetchTransactionData();
        } catch (submitError) {
            setError('Nastala chyba pri importe súboru.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={showDialog}
            onOpenChange={(isOpen) => {
                setShowDialog(isOpen);
                if (!isOpen) resetState();
            }}
        >
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={triggerClassName || "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"}
                >
                    Import z CSV
                </button>
            </DialogTrigger>

            <DialogContent className="bg-gray-800 text-white rounded-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Import transakcií</DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                        Nahrajte CSV z Lunar alebo Revolut.
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <Select value={bank} onValueChange={setBank}>
                        <SelectTrigger className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Vyberte banku" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white rounded-md">
                            <SelectItem value="lunar">Lunar</SelectItem>
                            <SelectItem value="revolut">Revolut</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileChange}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
                    />
                    {fileName && <p className="text-sm text-gray-300 mt-2">Súbor: {fileName}</p>}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {summary && (
                    <div className="bg-gray-700 rounded-md p-3 text-sm space-y-1">
                        <p>Spracované: {summary.processed}</p>
                        <p>Importované: {summary.imported}</p>
                        <p>Duplikáty: {summary.duplicates}</p>
                        <p>Zlyhané: {summary.failed}</p>
                        {Array.isArray(summary.errors) && summary.errors.length > 0 && (
                            <div className="pt-1">
                                <p className="text-red-400">Chyby:</p>
                                {summary.errors.slice(0, 5).map((item, index) => (
                                    <p key={index} className="text-red-300">• {item}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors mt-2 px-4 py-2 text-white rounded-md disabled:opacity-50"
                >
                    {loading ? 'Importujem...' : 'Importovať'}
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default ImportTransactionsModal;
