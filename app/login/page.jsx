'use client'

// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      console.log('Login successful:', data);

      // Store the token in localStorage
      localStorage.setItem('authToken', data.data.token);

      router.push('/transactions');
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 font-sans">
        <div className="bg-gray-800 p-8 rounded-md shadow-md w-96">
            <h1 className="text-2xl font-bold mb-4 text-white">Login</h1>

            {error && (
                <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Login Input */}
                <div>
                    <label htmlFor="login" className="block text-gray-400 font-medium mb-1">
                        Login:
                    </label>
                    <input
                        type="text"
                        id="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-gray-400 font-medium mb-1">
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                >
                    Login
                </button>
            </form>

            {/* Register Link */}
            <p className="mt-4 text-center text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-500 hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    </div>
);
}
