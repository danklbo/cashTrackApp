'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
function AboutPage() {
    const [statistics, setStatistics] = useState({ users: 0, transactions: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/statistics');
                if (!response.ok) throw new Error('Failed to fetch statistics');

                const data = await response.json();
                setStatistics(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <Layout>
            <div className="bg-gray-900 text-white min-h-screen p-6">
                <main className="w-full max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">O nás</h1>

                    {/* Guide Section */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Ako používať aplikáciu</h2>
                        <div className="space-y-4">
                            <p>
                                Vitajte v našej aplikácii na správu financií! Tu je stručný návod, ako používať jej sekcie:
                            </p>

                            <h3 className="mb-3">Blogy</h3>
                            <ul className="list-disc list-inside">
                                <li>Vzdelávacia sekcia s článkami na zlepšenie finančnej gramotnosti.</li>
                            </ul>

                            <h3 className="mb-3">Transakcie</h3>
                            <ul className="list-disc list-inside">
                                <li>Prihláste sa do aplikácie</li>
                                <li>Vytvorte si nové transakcie</li>
                                <li>Organizujte svoje transakcie do kategórií.</li>
                                <li>Zobrazujte si prehľady o svojich financiách.</li>
                                <li>Exportujte svoje údaje do CSV alebo PDF.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Statistics Section */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Štatistiky</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-6 rounded-md">
                                <h3 className="text-lg font-semibold">Celkový Počet Užívateľov</h3>
                                <p className="text-2xl font-bold text-blue-500">{statistics.user_count}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-md">
                                <h3 className="text-lg font-semibold">Celkový Počet Blogov</h3>
                                <p className="text-2xl font-bold text-green-500">{statistics.blog_count}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-md">
                                <h3 className="text-lg font-semibold">Celkový Počet Transakcií</h3>
                                <p className="text-2xl font-bold text-green-500">{statistics.transaction_count}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-md">
                                <h3 className="text-lg font-semibold">Celkový Počet Kategórií</h3>
                                <p className="text-2xl font-bold text-green-500">{statistics.category_count}</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </Layout>
    );
}

export default AboutPage;