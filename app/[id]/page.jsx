'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import Layout from '@/components/layout';

const BlogDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id  = params.id;
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the specific blog from the API
    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/blogs/${id}`);
                if (!response.ok) throw new Error('Failed to fetch blog');
                const data = await response.json();
                setBlog(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!blog) return <p>Blog not found</p>;

    return (
        <Layout>
            <div className="bg-gray-900 text-white min-h-screen p-6">
                <div className="flex justify-center">
                    <div className="w-full md:w-3/4 lg:w-3/4">
                        <h1 className="text-3xl font-bold mb-6 text-left">{blog.title}</h1>
                        <div className='w-full flex justify-center'>
                            <img className='mb-8' src={blog.image.path} alt={blog.title} />
                        </div>
                        <div
                            className="prose prose-invert" // Use Tailwind's prose for rich text styling
                            dangerouslySetInnerHTML={{ __html: blog.body }}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BlogDetailPage;