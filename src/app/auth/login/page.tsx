'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // 로컬 스토리지에서 저장된 이메일 불러오기
    useEffect(() => {
        const savedEmail = localStorage.getItem('masgo_remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            // 이메일 기억하기 설정 처리
            if (rememberEmail) {
                localStorage.setItem('masgo_remembered_email', email);
            } else {
                localStorage.removeItem('masgo_remembered_email');
            }
            
            router.push('/keys');
            router.refresh();
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to manage your MasGO API keys</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-email"
                            type="checkbox"
                            checked={rememberEmail}
                            onChange={(e) => setRememberEmail(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="remember-email" className="ml-2 block text-sm text-gray-400 cursor-pointer select-none">
                            Remember Email Address
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Don't have an account? </span>
                    <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                        Create one now
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
