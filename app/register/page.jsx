'use client'

// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({}); // Store field-specific errors
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrors({ password_confirmation: ['Passwords do not match'] });
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, first_name, password, password_confirmation: confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend validation errors
        if (data.error) {
          setErrors(data.error);
        } else {
          throw new Error('Registration failed');
        }
        return;
      }

      // Store the token in localStorage
      localStorage.setItem('authToken', data.data.token);

      router.push('/transactions');
    } catch (err) {
      setErrors({ general: [err.message || 'An error occurred during registration.'] });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 font-sans">
        <div className="bg-gray-800 p-8 rounded-md shadow-md w-96">
            <h1 className="text-2xl font-bold mb-4 text-white">Register</h1>

            {/* General Error Message */}
            {errors.general && (
                <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded mb-4">
                    {errors.general.join(' ')}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-gray-400 font-medium mb-1">
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.join(' ')}</p>
                    )}
                </div>

                {/* Username Input */}
                <div>
                    <label htmlFor="first_name" className="block text-gray-400 font-medium mb-1">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name.join(' ')}</p>
                    )}
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
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.join(' ')}</p>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-gray-400 font-medium mb-1">
                        Confirm Password:
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password_confirmation && (
                        <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.join(' ')}</p>
                    )}
                </div>

                {/* Register Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                >
                    Register
                </button>
            </form>

            {/* Login Link */}
            <p className="mt-4 text-center text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 hover:underline">
                    Login here
                </Link>
            </p>
        </div>
    </div>
);
}
