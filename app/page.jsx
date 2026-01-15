'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // If using Next.js, otherwise use your preferred routing library
import Layout from '@/components/layout';
import { buildApiUrl } from '@/lib/api';

const MainPage = () => {
    return (
        <Layout>
            <div className="bg-gray-900 text-white min-h-screen p-6">
                {/* Page Title */}
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-500">
                    Naučte sa pracovať s vašimi financiami
                </h1>
            </div>
        </Layout>
    );
};

export default MainPage;
