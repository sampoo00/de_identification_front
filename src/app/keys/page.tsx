'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// API Key 타입 정의 (Supabase DB 구조에 맞춤)
interface ApiKey {
    id: string;
    name: string;
    secret_key: string;
    created_at: string;
}

export default function KeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('My MasGO Key');
    const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
            } else {
                setUser(user);
                fetchKeys(user.id);
            }
        };
        checkUser();
    }, [router]);

    const fetchKeys = async (userId: string) => {
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching keys:', error);
        } else {
            setKeys(data || []);
        }
        setIsLoading(false);
    };

    const generateSecret = () => {
        const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return `sk-mg-${randomStr}`;
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim() || !user) return;

        const secret = generateSecret();
        const { data, error } = await supabase
            .from('api_keys')
            .insert([
                { 
                    user_id: user.id, 
                    name: newKeyName, 
                    secret_key: secret 
                }
            ])
            .select();

        if (error) {
            alert('키 생성 중 오류가 발생했습니다: ' + error.message);
        } else {
            setKeys([data[0], ...keys]);
            setNewlyCreatedSecret(secret);
            setIsModalOpen(false);
            setNewKeyName('My MasGO Key');
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (confirm('정말로 이 API 키를 삭제(Revoke) 하시겠습니까? 복구할 수 없습니다.')) {
            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', id);

            if (error) {
                alert('키 삭제 중 오류가 발생했습니다: ' + error.message);
            } else {
                setKeys(keys.filter(k => k.id !== id));
                if (newlyCreatedSecret && keys.find(k => k.id === id)?.secret_key === newlyCreatedSecret) {
                    setNewlyCreatedSecret(null);
                }
            }
        }
    };

    const maskSecret = (secret: string) => {
        const prefix = secret.substring(0, 10);
        const suffix = secret.substring(secret.length - 4);
        return `${prefix}${'*'.repeat(16)}${suffix}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto px-6 py-12"
        >
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
                    <p className="text-gray-400">Manage your secret keys for accessing MasGO via API.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                    <p className="text-sm text-blue-400 font-medium">{user?.email}</p>
                </div>
            </div>

            <AnimatePresence>
                {newlyCreatedSecret && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-6 bg-green-900/20 border border-green-800 rounded-xl relative overflow-hidden"
                    >
                        <h3 className="text-green-400 font-semibold mb-2">새로운 API 키가 생성되었습니다!</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            이 시크릿 키는 보안을 위해 <strong>지금 단 한 번만</strong> 표시됩니다. 안전한 곳에 복사해 두세요.
                        </p>
                        <div className="flex items-center gap-4 bg-gray-950 p-4 border border-gray-800 rounded-lg">
                            <code className="text-blue-400 text-lg flex-1">{newlyCreatedSecret}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(newlyCreatedSecret);
                                    alert('복사되었습니다!');
                                }}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
                            >
                                Copy
                            </button>
                        </div>
                        <button
                            onClick={() => setNewlyCreatedSecret(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sm:flex-row flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-white">Your Secret Keys</h3>
                        <p className="text-sm text-gray-500 mt-1">Do not share your API key with others, or expose it in the browser.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-100 text-gray-900 hover:bg-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        + Create new secret key
                    </button>
                </div>

                <div className="p-6 overflow-x-auto">
                    {keys.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            현재 활성화된 키가 없습니다. 생성버튼을 눌러 새로운 키를 발급하세요.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-400 mt-2 min-w-[600px]">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-950/50">
                                <tr>
                                    <th className="px-4 py-4 font-medium rounded-tl-lg">Name</th>
                                    <th className="px-4 py-4 font-medium">Secret Key</th>
                                    <th className="px-4 py-4 font-medium">Created</th>
                                    <th className="px-4 py-4 text-right font-medium rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                <AnimatePresence>
                                    {keys.map((key) => (
                                        <motion.tr
                                            key={key.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="hover:bg-gray-800/30 transition-colors group"
                                        >
                                            <td className="px-4 py-5 text-gray-200 font-medium">{key.name}</td>
                                            <td className="px-4 py-5 font-mono text-gray-500">{maskSecret(key.secret_key)}</td>
                                            <td className="px-4 py-5 text-gray-500">{new Date(key.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-5 text-right">
                                                <button
                                                    onClick={() => handleRevokeKey(key.id)}
                                                    className="text-red-400 hover:text-red-300 opacity-80 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Revoke
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}

                    <div className="mt-8 text-sm text-gray-500 bg-gray-950 p-5 rounded-lg flex items-start gap-4 border border-blue-900/30">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="leading-relaxed">Your API key gives full access to the de-identification engine. Use it with the MCP (Model Context Protocol) or directly via REST endpoints. Refer to the GitHub documentation for more details.</p>
                    </div>
                </div>
            </div>

            {/* 키 생성 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Create new secret key</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Name (Optional)</label>
                            <input
                                type="text"
                                autoFocus
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="My API Key"
                            />
                        </div>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKey}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg font-medium transition-colors"
                            >
                                Create secret key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
