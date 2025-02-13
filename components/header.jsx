import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // If using Next.js, otherwise use your preferred routing library
import { useRouter } from 'next/navigation';
import { CircleUserRound, Menu, X } from 'lucide-react'; 

const Header = () => {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if the user is authenticated (has a bearer token)
    const isAuthenticated = () => {
        const token = localStorage.getItem('authToken');
        return !!token; // Returns true if token exists, false otherwise
    };

    const handleLogOut = () => {
        localStorage.removeItem('authToken'); // Clear the authentication token
        router.push('/login');
    }

    // Fetch user data from the API
    const fetchUserData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/info', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch user data');

            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Handle tab click (Blogs or Transactions)
    const handleTabClick = (path) => {
        if (isAuthenticated()) {
            router.push(path);
        } else {
            router.push('/login');
        }
    };

    // Fetch user data on component mount
    useEffect(() => {
        if (isAuthenticated()) {
            fetchUserData();
        }
    }, []);

    return (
        <header className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Left Side: Logo, App Name, and Tabs */}
                <div className="flex items-center space-x-8">
                    {/* Logo and App Name */}
                    <Link href="/">
                        <div className="flex items-center cursor-pointer">
                            <svg width={82} viewBox="0 0 122.88 72.15">
                                <title>money-transactions</title>
                                <path stroke="#4CAF50"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    fill='transparent'
                                    strokeLinejoin="round" d="M94.81,26.32,61.3,61.37,42.73,44.12l1.92-2.69L58.25,54l.17.16a3.18,3.18,0,0,0,4.49-.21L64,52.71l0,0L69.17,47,92,23.72l2.81,2.6ZM96.2,43.78V37a1,1,0,0,1,0-.17c.12-3,2.13-4,4.84-3.13a1.47,1.47,0,0,1,.41.22c6.84,5.37,13.21,10.73,20,16.1l.09.09a3.17,3.17,0,0,1,1.21,3.18A4.49,4.49,0,0,1,121,55.74L102.62,70.62C99.38,73.17,96,72.69,96,68c0-2.09,0-4.2,0-6.29H69.9l17.18-18ZM30.53,33.06c0,1.64.15,3.66,0,5.26a7,7,0,0,1-.34,1.8,4.8,4.8,0,0,1-1.91,2.56,5,5,0,0,1-3,.77A7.8,7.8,0,0,1,23.16,43h0a3.57,3.57,0,0,1-.51-.22,4.6,4.6,0,0,1-.46-.3h0c-3.29-2.58-6.7-5.36-10.12-8.13-3.18-2.59-6.37-5.18-9.92-8l-.2-.18A5.83,5.83,0,0,1,.27,23.88l-.06-.2a4.82,4.82,0,0,1-.09-2.47,5.43,5.43,0,0,1,1-2.05,8.18,8.18,0,0,1,1.49-1.51C8.79,13,14.82,7.58,21,2.78A8.12,8.12,0,0,1,25.84.83a4.74,4.74,0,0,1,2,.42,4.44,4.44,0,0,1,1.64,1.29,6.87,6.87,0,0,1,1.26,4.33h0v4.36H55.63l-3.69,3.86H28.76a1.92,1.92,0,0,1-1.9-1.95c0-1.44,0-2.9,0-4.34V6.87h0a3.2,3.2,0,0,0-.44-1.95.67.67,0,0,0-.21-.18.92.92,0,0,0-.37-.06,4.37,4.37,0,0,0-2.47,1.13L5,20.68a4.07,4.07,0,0,0-.78.77,1.57,1.57,0,0,0-.3.59,1,1,0,0,0,0,.46l0,.09a2.24,2.24,0,0,0,.6.8c3.24,2.54,6.61,5.27,10,8s6.43,5.23,10,8a4.05,4.05,0,0,0,.94.18,1.27,1.27,0,0,0,.75-.16,1,1,0,0,0,.38-.55,3.31,3.31,0,0,0,.14-.77v-7A1.92,1.92,0,0,1,28.6,29.2h9.85l-3.53,3.7-.14.16ZM93.89,17.25,60.39,52.3,41.82,35.05,75.33,0,93.89,17.25Zm-21.15,7.4a5.76,5.76,0,1,1-7.37-3.47,5.76,5.76,0,0,1,7.37,3.47Zm12.78-4L63.13,43.67a3.75,3.75,0,0,0-5.29.2L50.5,37.06a3.75,3.75,0,0,0-.2-5.29L72.69,8.68A3.74,3.74,0,0,0,78,8.48l7.35,6.82a3.76,3.76,0,0,0,.19,5.3Z" />
                            </svg>
                            <span className="text-xl font-bold ml-2">CashTrack</span>
                        </div>
                    </Link>

                    {/* Tabs - Hidden on mobile */}
                    <nav className="hidden md:flex space-x-6">
                        <button
                            onClick={() => handleTabClick('/')}
                            className="hover:text-gray-400"
                        >
                            Blogs
                        </button>
                        <button
                            onClick={() => handleTabClick('/transactions')}
                            className="hover:text-gray-400"
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => handleTabClick('/about')}
                            className="hover:text-gray-400"
                        >
                            O Aplikácii
                        </button>
                    </nav>
                </div>

                {/* Right Side: Profile Icon and Mobile Menu Toggle */}
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Log Out Button - Hidden on mobile */}
                    <button
                        onClick={handleLogOut}
                        className="hidden md:block px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Visible on mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-700">
                    <nav className="flex flex-col space-y-4 p-4">
                        <button
                            onClick={() => {
                                handleTabClick('/');
                                setIsMobileMenuOpen(false);
                            }}
                            className="hover:text-gray-400"
                        >
                            Blogs
                        </button>
                        <button
                            onClick={() => {
                                handleTabClick('/transactions');
                                setIsMobileMenuOpen(false);
                            }}
                            className="hover:text-gray-400"
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => {
                                handleTabClick('/about');
                                setIsMobileMenuOpen(false);
                            }}
                            className="hover:text-gray-400"
                        >
                            O Aplikácii
                        </button>
                        <button
                            onClick={handleLogOut}
                            className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Log Out
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;