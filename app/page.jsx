'use client'
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
      <Layout>
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Naučte sa pracovať s vašimi financiami</h1>
            <div className="flex justify-center">
                <div className="w-full md:w-3/4 lg:w-3/4 space-y-6">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <img className='mb-5' src={blog.image.path} alt={blog.title} />
                            <h1 className="text-2xl font-bold mb-2">{blog.title}</h1>
                            <p className="text-gray-400 mb-4">{blog.description}</p>
                            <Link href={`/${blog.id}`}>
                                <span className="text-blue-500 hover:text-blue-400 cursor-pointer">
                                    Čítaj viac
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </Layout>

    );
};

export default BlogsPage;
