'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // If using Next.js, otherwise use your preferred routing library
import Layout from '@/components/layout';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch blogs from the API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/blogs');
                if (!response.ok) throw new Error('Failed to fetch blogs');
                const data = await response.json();
                setBlogs(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <Layout>
            <div className="bg-gray-900 text-white min-h-screen p-6">
                {/* Page Title */}
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-500">
                    Naučte sa pracovať s vašimi financiami
                </h1>

                {/* Blog List */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Blog Image */}
                                <img
                                    src={blog.image.path}
                                    alt={blog.title}
                                    className="w-full h-48 object-cover"
                                />

                                {/* Blog Content */}
                                <div className="p-6">
                                    {/* Blog Title */}
                                    <h2 className="text-2xl font-bold mb-3 text-white">
                                        {blog.title}
                                    </h2>

                                    {/* Blog Description */}
                                    <p className="text-gray-400 mb-4">
                                        {blog.description}
                                    </p>

                                    {/* Read More Link */}
                                    <Link href={`/${blog.id}`}>
                                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300">
                                            Čítaj viac
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BlogsPage;