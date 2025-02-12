'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, ArcElement, PieController, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '@/components/layout';  
import CreateTransactionModal from '@/components/createTransactionModal';
import EditTransactionModal from '@/components/editTransactionModal';
import CategoryModalContent from '@/components/categoryModalContent';
import { Calendar } from "@/components/ui/calendar"

  
ChartJS.register(ArcElement, PieController, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

function TransactionsPage() {
    const [data, setData] = useState({ total_income: 0, total_expence: 0, transactions: [] });
    const [difference, setDifference] = useState(0);
    const [filter, setFilter] = useState('expense');
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState(new Date());
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [chartData, setChartData] = useState({});
    const [chartType, setChartType] = useState('bar'); 
    const [view, setView] = useState('kategorie');    

    const fetchTransactionData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error("No authentication token found.");

            const url = new URL('http://127.0.0.1:8000/api/v1/transactions');
            if (startDate) url.searchParams.set('from', format(startDate, 'yyyy-MM-dd'));
            if (endDate) url.searchParams.set('to', format(endDate, 'yyyy-MM-dd'));

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch transactions');

            const data = await response.json();
            setData(data);
            setDifference(data.total_expence + data.total_income);

            const filtered = data.transactions.filter(transaction => 
                filter === 'income' ? transaction.type === 'income' : 
                filter === 'expense' ? transaction.type === 'expense' : true
            );

            setFilteredTransactions(filtered);
            setChartData(data.chart_data[filter]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTransactionData();

    }, [startDate, endDate, filter]);

    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            if (sortBy === 'date') {
                return sortDirection === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
            } else if (sortBy === 'amount') {
                return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            } else if (sortBy === 'description') {
                return sortDirection === 'asc' ? a.category.name.localeCompare(b.category.name) : b.category.name.localeCompare(a.category.name);
            } else if (sortBy === 'category') {
                return sortDirection === 'asc' ? a.description.localeCompare(b.description) : b.description.localeCompare(a.description);
            }
            return 0;
        });
    }, [filteredTransactions, sortBy, sortDirection]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('desc');
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: chartType === 'bar'? 'top': 'right',
            },
            title: {
                display: true,
                text: `Total ${filter === 'income' ? 'Income' : 'Expense'} by Category`,
            },

        },
        scales: chartType === 'bar' && filter === 'expense' ?{
            x: {
                stacked: true,
            },
            y: {
                stacked: false,
            }
        } : undefined
    };

    const datasets = [
            {
                label: `Total ${filter === 'income' ? 'Income' : 'Expense'}`,
                data: Object.values(chartData || {}).map(category => Math.abs(category.total_amount)),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
                barPercentage: 0.7, // Adjust width of total bars        
            },
    ];

    if (chartType === 'bar' && filter === 'expense') {
        datasets.push({
            label: 'Category Budget',
            data: Object.values(chartData || {}).map(category => category.budget ? category.budget : null),
            backgroundColor: datasets[0].backgroundColor.map(color => color.replace(/[\d\.]+\)$/, '0.05)')), // More transparent
            borderColor: datasets[0].borderColor.map(color => color.replace(/[\d\.]+\)$/, '0.3)')), // More transparent
            borderWidth: 1,
            borderDash: [5, 5], // Dashed border
            barPercentage: 0.8,
            categoryPercentage: 0.7
        });
    }
    
    const chartDataConfig = {

        labels: Object.keys(chartData || {}),
        datasets: datasets,
    };
    

    return (
        <Layout>
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-6 relative">

            <main className="w-full max-w-5xl p-6">
                <header className="w-full max-w.5xl grid grid-cols-4 gap-2 mb-6">
                    {/* Date Picker */}
                    <div className="bg-gray-800 p-4 rounded-md flex flex-col cursor-pointer w-full" >
                        <span className="text-sm text-gray-400">Obdobie Od - Do</span>
                        <DatePicker selected={startDate} onChange={setStartDate} className="bg-gray-700 text-white rounded-md px-2 py-1 mt-2" />
                        <DatePicker selected={endDate} onChange={setEndDate} className="bg-gray-700 text-white rounded-md px-2 py-1 mt-2" />
                    </div>

                    {/* Income */}
                    <div 
                        className="bg-gray-800 p-4 rounded-md flex flex-col cursor-pointer hover:bg-green-900 transition"
                        onClick={() => handleFilterChange('income')}
                    >
                        <span className="text-sm text-gray-400">Príjmy</span>
                        <span className="text-green-500 text-2xl font-bold">+ {data.total_income.toFixed(2)} €</span>
                    </div>

                    {/* Expense */}
                    <div 
                        className="bg-gray-800 p-4 rounded-md flex flex-col cursor-pointer hover:bg-red-900 transition"
                        onClick={() => handleFilterChange('expense')}
                    >
                        <span className="text-sm text-gray-400">Výdavky</span>
                        <span className="text-red-500 text-2xl font-bold">- {Math.abs(data.total_expence).toFixed(2)} €</span>
                    </div>

                    {/* Difference */}
                    <div className="bg-gray-800 p-6 rounded-md flex flex-col">
                        <span className="text-sm text-gray-400">Rozdiel</span>
                        <span className={`${difference >= 0 ? "text-green-500" : "text-red-500"} text-2xl font-bold`}>
                            {difference >= 0 ? "+" : "-"} {Math.abs(difference).toFixed(2)} €
                        </span>
                    </div>
                </header>  

                {/* Chart Section */}
                <div className="bg-gray-800 p-6 rounded-md mb-6 relative">
                    {/* Chart Header */}
                    <div className={`flex justify-between items-center ${chartType === 'pie' ? 'relative z-10' : ''}`}>
                        <h2 className="text-lg font-bold">Chart</h2>
                        <div>
                            <button 
                                onClick={() => setChartType('pie')} 
                                className={`px-4 py-2 rounded-md ${chartType === 'pie' ? 'bg-blue-500' : 'bg-gray-700'}`}
                            >
                                Pie Chart
                            </button>
                            <button 
                                onClick={() => setChartType('bar')} 
                                className={`px-4 py-2 rounded-md ml-2 ${chartType === 'bar' ? 'bg-blue-500' : 'bg-gray-700'}`}
                            >
                                Column Chart
                            </button>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="relative flex justify-center items-center" style={{ height: '300px' }}>
                    {chartType === 'pie' ? (
                        <div className="w-full max-w-[450px] flex justify-center items-center">
                            <Doughnut data={chartDataConfig} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="w-full max-w-[600px] flex justify-center items-center">
                            <Bar data={chartDataConfig} options={chartOptions} />
                        </div>
                    )}
                    </div>
                </div>


                {/* Conditional Rendering Based on View */}

                <div className="bg-gray-800 p-6 rounded-md mb-6">
                    <div className='radio-inputs-bar flex justify-between items-center'> 
                        {/* Radio Buttons */}
                        <div className="radio-inputs">
                            <label className="radio">
                                <input 
                                    type="radio" 
                                    name="radio" 
                                    checked={view === 'kategorie'} 
                                    onChange={() => setView('kategorie')} 
                                />
                                <span className="name transition-all">Kategorie</span>
                            </label>

                            <label className="radio">
                                <input 
                                    type="radio" 
                                    name="radio" 
                                    checked={view === 'transakcie'} 
                                    onChange={() => setView('transakcie')} 
                                />
                                <span className="name transition-all">Transakcie</span>
                            </label>
                        </div>

                        {/* Buttons on the Right */}
                        <div className="flex gap-4">
                        <CategoryModalContent fetchTransactionData={fetchTransactionData}/>
                        <CreateTransactionModal fetchTransactionData={fetchTransactionData} />
                        </div>
                    </div>
                    
                    {/* New Category Modal */}

                   {view === 'kategorie' ? (

                        <table className="w-full text-left">
                            <thead className="bg-gray-700 text-gray-400">
                                <tr>
                                    <th className="p-3">Kategória</th>
                                    <th className="p-3">Suma</th>
                                    {
                                        filter === 'expense' ? (
                                            <th className="p-3">Monthly Budget</th>
                                        ): null
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(chartData || {}).map(([category, data], index) => (
                                    <tr key={index} className="border-b border-gray-700 ">
                                        <td className="p-3">{category}</td>
                                        <td className={`p-3 font-bold ${data.total_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{data.total_amount >= 0 ? '+' : '-'} {Math.abs(data.total_amount).toFixed(2)} €</td>
                                        {
                                            filter === 'expense' ? (
                                                <td className={`p-3 font-bold 'text-white-500`}>{data.budget ? data.budget.toFixed(2) + " €" : "-" }</td>
                                            ): null
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                ) : (
                        <table className="w-full text-left bg-gray-800 rounded-md overflow-hidden">
                            <thead className="bg-gray-700 text-gray-400">
                                <tr>
                                    <th className="p-3 cursor-pointer" onClick={() => handleSort('category')}>Kategória {sortBy === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                                    <th className="p-3 cursor-pointer" onClick={() => handleSort('description')}>Popis {sortBy === 'description' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                                    <th className="p-3 cursor-pointer" onClick={() => handleSort('date')}>Dátum {sortBy === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                                    <th className="p-3 cursor-pointer" onClick={() => handleSort('amount')}>Suma {sortBy === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((transaction, index) => (
                                    <EditTransactionModal 
                                        key={index} 
                                        transaction={transaction} 
                                        fetchTransactionData={fetchTransactionData}
                                    />
                                ))}
                            </tbody>

                            <tbody>

                                {sortedTransactions.map((transaction, index) => (
                                    <tr key={index} className="border-b border-gray-700">
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                )}
                </div>

            </main>
            <footer className="bg-blue-500 h-4"></footer>
        </div>
        </Layout>
        
    );
    
}


export default TransactionsPage;