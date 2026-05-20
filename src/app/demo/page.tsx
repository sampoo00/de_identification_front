'use client';

import { useState, useRef, useEffect } from 'react';
import { processDeidentify } from '@/lib/api';
import { useDebugErrorTrap } from '@/hooks/useErrorTrap';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoPage() {
    const [user, setUser] = useState<any>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [selectedApiKey, setSelectedApiKey] = useState<string>('');
    const router = useRouter();

    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState<'VLM' | 'SEGMENTATION' | 'DETECTION'>('VLM');
    const [shape, setShape] = useState<'bbox' | 'circle' | 'ellipse'>('bbox');
    const [level, setLevel] = useState<number | null>(null); // null is Auto
    const [target, setTarget] = useState<'inner' | 'outer'>('inner');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 상태: 처리중, 결과, 에러
    const [isLoading, setIsLoading] = useState(false);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Phase 5: Error Trap & Hook Validation (5+ limit)
    const { reportError, resetErrorTrap } = useDebugErrorTrap(5);
    const MAX_FILE_SIZE_MB = 10;

    // 인증 및 키 정보 확인
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login?returnTo=/demo');
            } else {
                setUser(user);
                fetchApiKeys(user.id);
                setIsAuthLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const fetchApiKeys = async (userId: string) => {
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (!error && data && data.length > 0) {
            setApiKeys(data);
            setSelectedApiKey(data[0].secret_key); // 첫 번째 키를 기본값으로 설정
        }
    };

    const validateFile = (file: File): boolean => {
        if (!file.type.startsWith('image/')) {
            const msg = '이미지 파일(JPG, PNG)만 업로드 가능합니다.';
            setError(msg);
            reportError(msg);
            return false;
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
            const msg = `파일 크기가 너무 큽니다. (현재: ${fileSizeMB.toFixed(1)}MB / 최대: ${MAX_FILE_SIZE_MB}MB)`;
            setError(msg);
            reportError(msg);
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResultUrl(null);
                setError(null);
                resetErrorTrap();
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResultUrl(null);
                setError(null);
                resetErrorTrap();
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = async () => {
        if (!imageFile) {
            const msg = '이미지를 먼저 업로드해주세요.';
            setError(msg);
            reportError(msg);
            return;
        }
        if (!prompt.trim()) {
            const msg = '명령어(Prompt)를 입력해주세요.';
            setError(msg);
            reportError(msg);
            return;
        }

        setIsLoading(true);
        setJobStatus('initializing');
        setError(null);

        const response = await processDeidentify({
            image: imageFile,
            prompt,
            target,
            category,
            shape,
            level,
            apiKey: selectedApiKey || undefined,
            onStatusUpdate: (status) => setJobStatus(status)
        });

        if (response.success && response.resultUrl) {
            setResultUrl(response.resultUrl);
            setJobStatus('completed');
            resetErrorTrap();
        } else {
            const errMsg = response.message || '비식별화 처리 중 오류가 발생했습니다.';
            setError(errMsg);
            setJobStatus('failed');
            reportError(errMsg);
        }
        setIsLoading(false);
    };

    if (isAuthLoading) {
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
            className="max-w-6xl mx-auto px-6 py-12"
        >
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Interactive Demo</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Upload an image and type what you want to de-identify. Our AI will handle the rest.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl h-[600px] flex flex-col">
                        <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">AI</span>
                            Command Interface
                        </h3>

                        <div className="space-y-4 flex-grow overflow-y-auto pr-1 no-scrollbar">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">API Key</label>
                                {apiKeys.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            value={selectedApiKey}
                                            onChange={(e) => setSelectedApiKey(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            {apiKeys.map((key) => (
                                                <option key={key.id} value={key.secret_key}>
                                                    {key.name} ({key.secret_key.substring(0, 10)}...)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-amber-500 bg-amber-900/20 p-2 rounded-lg border border-amber-800/50">
                                        생성된 키가 없습니다. <Link href="/keys" className="underline font-bold">Keys 페이지</Link>에서 생성해 주세요.
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Refining Prompt</label>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. '사람 얼굴 가려줘'"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-700"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Detection Engine</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['VLM', 'SEGMENTATION', 'DETECTION'] as const).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            disabled={isLoading}
                                            className={`py-2 rounded-lg text-[9px] font-bold transition-all border ${category === cat
                                                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] border-blue-400'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTarget('inner')}
                                        disabled={isLoading}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border ${target === 'inner'
                                            ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                                            }`}
                                    >
                                        INNER
                                    </button>
                                    <button
                                        onClick={() => setTarget('outer')}
                                        disabled={isLoading}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border ${target === 'outer'
                                            ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                                            }`}
                                    >
                                        OUTER
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">De-id Shape</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['bbox', 'circle', 'ellipse'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setShape(s)}
                                            disabled={isLoading}
                                            className={`py-2 rounded-lg text-[9px] font-bold transition-all border ${shape === s
                                                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] border-blue-400'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                                                }`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-medium text-gray-400">Intensity</label>
                                    <span className="text-[10px] font-bold text-blue-400">
                                        {level === null ? 'AUTO' : `L${level}`}
                                    </span>
                                </div>
                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        value={level === null ? 0 : level}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setLevel(val === 0 ? null : val);
                                        }}
                                        disabled={isLoading}
                                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm overflow-hidden"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pt-6 border-t border-gray-800 mt-auto">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${isLoading
                                    ? 'bg-blue-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        AI Processing...
                                    </span>
                                ) : 'De-identify Image'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!previewUrl && !resultUrl ? (
                            <motion.div
                                key="upload-zone"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gray-900/50 border-2 border-gray-800 border-dashed rounded-2xl h-[600px] flex flex-col items-center justify-center text-gray-500 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all cursor-pointer backdrop-blur-sm"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                <svg className="w-16 h-16 mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <p className="text-xl font-medium text-gray-300">클릭하거나 이미지를 드래그 앤 드롭 하세요.</p>
                                <p className="text-sm mt-3 text-gray-500">JPG, PNG 파일 지원 (최대 10MB)</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview-zone"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-[600px] shadow-2xl flex flex-col"
                            >
                                <div className="flex-grow flex divide-x divide-gray-800 h-full overflow-hidden">
                                    <div className="flex-1 flex flex-col relative bg-gray-950/20">
                                        <div className="absolute top-3 left-4 z-20">
                                            <span className="bg-gray-900/60 backdrop-blur-md text-[10px] text-gray-400 px-2.5 py-1 rounded-full border border-gray-800 font-bold tracking-wider">ORIGINAL</span>
                                        </div>
                                        <div className="flex-grow flex items-center justify-center p-4">
                                            <img
                                                src={previewUrl!}
                                                alt="Original"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col relative bg-gray-950/40">
                                        <div className="absolute top-3 left-4 z-20">
                                            <span className="bg-blue-600/20 backdrop-blur-md text-[10px] text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30 font-bold tracking-wider">DE-IDENTIFIED</span>
                                        </div>
                                        <div className="flex-grow flex items-center justify-center p-4 relative">
                                            {resultUrl ? (
                                                <img
                                                    src={resultUrl}
                                                    alt="Result"
                                                    className="max-w-full max-h-full object-contain animate-in fade-in duration-700"
                                                />
                                            ) : (
                                                <div className="text-gray-700 font-mono text-sm">
                                                    Waiting for AI...
                                                </div>
                                            )}

                                            {isLoading && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/40 backdrop-blur-[2px]">
                                                    <div className="w-full h-1 bg-blue-500/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                                                    <div className="bg-gray-900/90 px-6 py-4 rounded-xl border border-blue-500/30 backdrop-blur-md flex flex-col items-center gap-3 shadow-2xl">
                                                        <div className="text-blue-400 font-mono text-xs tracking-widest uppercase text-center">
                                                            {jobStatus === 'pending' ? 'QUEUEING...' : 
                                                            jobStatus?.includes('waiting') ? 'IN QUEUE...' :
                                                            'AI PROCESSING...'}
                                                            <div className="mt-1 text-[10px] text-blue-500/70">{jobStatus}</div>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-3 right-4 flex gap-2 z-30">
                                    {resultUrl && !isLoading && (
                                        <a
                                            href={resultUrl}
                                            download={`masgo-result-${Date.now()}.png`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-xl shadow-lg border border-green-500/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center w-10 h-10"
                                            title="다운로드"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            setResultUrl(null);
                                            setImageFile(null);
                                            setJobStatus(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="bg-gray-800/80 hover:bg-gray-700 text-gray-300 p-2.5 rounded-xl shadow-lg border border-gray-700 backdrop-blur-md transition-all hover:scale-105 active:scale-95 w-10 h-10 flex items-center justify-center"
                                        title="초기화"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png"
                        className="hidden"
                    />
                </div>
            </div>
        </motion.div>
    );
}
