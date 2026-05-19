'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navigation() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in ms

    useEffect(() => {
        const checkSessionTimeout = () => {
            const loginTimestamp = localStorage.getItem('masgo_login_at');
            if (loginTimestamp) {
                const elapsed = Date.now() - parseInt(loginTimestamp);
                if (elapsed > SESSION_TIMEOUT) {
                    handleLogout();
                    return true;
                }
            }
            return false;
        };

        const getUser = async () => {
            if (checkSessionTimeout()) return;
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                localStorage.setItem('masgo_login_at', Date.now().toString());
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('masgo_login_at');
            }
            
            setUser(session?.user ?? null);
            checkSessionTimeout();
        });

        // 1분마다 타임아웃 체크
        const interval = setInterval(checkSessionTimeout, 60000);

        return () => {
            authListener.subscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('masgo_login_at');
        setUser(null);
        router.push('/');
        router.refresh();
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-white text-xl font-bold tracking-tight">
                            Mas<span className="text-blue-500">GO</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/technology" className="text-gray-300 hover:text-white transition-colors">
                            Technology
                        </Link>
                        <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">
                            Demo
                        </Link>
                        {user && (
                            <Link href="/keys" className="text-gray-300 hover:text-white transition-colors">
                                API Keys
                            </Link>
                        )}
                    </nav>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-xs text-gray-500 hidden sm:inline">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
