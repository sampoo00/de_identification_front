'use client';

import { useState, useRef, useEffect } from 'react';
import { processDeidentify } from '@/lib/api';
import { useDebugErrorTrap } from '@/hooks/useErrorTrap';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Example images data
const EXAMPLES = [
    {
        id: 'portrait',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        prompt: '사람얼굴 비식별화 해줘',
        name: 'Portrait'
    },
    {
        id: 'car',
        url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300',
        prompt: '차량을 비식별화 해줘',
        name: 'Automobile'
    }
];

export default function DemoPage() {
    // Auth & API Key states
    const [user, setUser] = useState<any>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [selectedApiKey, setSelectedApiKey] = useState<string>('');

    // Modal state for image preview
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    const router = useRouter();

    // Configuration states
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState<'VLM' | 'SEGMENTATION' | 'DETECTION'>('VLM');
    const [shape, setShape] = useState<'bbox' | 'circle' | 'ellipse' | 'polygon'>('bbox');
    const [level, setLevel] = useState<number | null>(null); // null is Auto
    const [target, setTarget] = useState<'inner' | 'outer'>('inner');

    // Media states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Processing states
    const [isLoading, setIsLoading] = useState(false);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { reportError, resetErrorTrap } = useDebugErrorTrap(5);
    const MAX_FILE_SIZE_MB = 10;

    // Phase 5: Auth & Keys
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login?returnTo=/demo');
            } else {
                setUser(user);
                await fetchApiKeys(user.id);
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
            setSelectedApiKey(data[0].secret_key);
        }
    };

    // File handlers
    const validateFile = (file: File): boolean => {
        if (!file.type.startsWith('image/')) {
            const msg = 'Image files (JPG, PNG) only.';
            setError(msg);
            reportError(msg);
            return false;
        }
        if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
            const msg = `File too large (Max ${MAX_FILE_SIZE_MB}MB).`;
            setError(msg);
            reportError(msg);
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        if (validateFile(file)) {
            setImageFile(file);
            setImageUrl(''); // Clear URL if file is chosen
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
            resetErrorTrap();
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleExampleClick = async (example: typeof EXAMPLES[0]) => {
        setPrompt(example.prompt);
        setImageUrl(example.url);
        setImageFile(null); // Clear file if example URL is chosen
        setPreviewUrl(example.url);
        setResultUrl(null);
        setError(null);
    };

    const urlToFile = async (url: string): Promise<File | null> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], 'image_from_url.jpg', { type: blob.type });
        } catch (e) {
            console.error('Failed to convert URL to file', e);
            return null;
        }
    };

    const handleSubmit = async () => {
        let finalFile = imageFile;

        if (!finalFile && imageUrl) {
            setJobStatus('fetching image from url...');
            finalFile = await urlToFile(imageUrl);
        }

        if (!finalFile) {
            const msg = 'Please upload an image or provide a valid URL.';
            setError(msg);
            reportError(msg);
            return;
        }
        if (!prompt.trim()) {
            const msg = 'Please enter a prompt.';
            setError(msg);
            reportError(msg);
            return;
        }

        setIsLoading(true);
        setJobStatus('initializing');
        setError(null);

        // Actual API Call
        const response = await processDeidentify({
            image: finalFile,
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
            const errMsg = response.message || 'Processing failed.';
            setError(errMsg);
            setJobStatus('failed');
            reportError(errMsg);
        }
        setIsLoading(false);
    };

    const handleDownload = async () => {
        if (!resultUrl) return;

        try {
            const response = await fetch(resultUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Try to get filename from original image or use default
            let fileName = 'deidentified_image.png';
            if (imageFile) {
                const nameParts = imageFile.name.split('.');
                const extension = nameParts.pop();
                fileName = `deid_${nameParts.join('.')}.${extension}`;
            } else if (imageUrl) {
                const urlParts = imageUrl.split('/');
                const lastPart = urlParts[urlParts.length - 1].split('?')[0];
                if (lastPart.includes('.')) {
                    const nameParts = lastPart.split('.');
                    const extension = nameParts.pop();
                    fileName = `deid_${nameParts.join('.')}.${extension}`;
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab if blob download fails
            window.open(resultUrl, '_blank');
        }
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
                        <span className="w-8 h-[1px] bg-blue-500"></span>
                        AI De-identification
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Interactive <span className="text-blue-500">Demo</span></h1>
                    <p className="text-gray-500 mt-4 text-base max-w-2xl leading-relaxed">
                        Specify what you want to mask using natural language.
                        Our AI analyzes the context and applies precision de-identification based on your settings.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Input and Results */}
                    <div className="flex-grow space-y-8">
                        {/* Input Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800 p-6 shadow-2xl"
                        >
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-grow relative">
                                    <input
                                        type="text"
                                        placeholder="Paste image URL here..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all pr-32"
                                    />
                                    <button
                                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        APPLY
                                    </button>
                                </div>
                                <div className="flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-600 px-4">OR</span>
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-xs font-bold border border-gray-700 transition-all"
                                >
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    UPLOAD
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Try these examples:</span>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLES.map((ex) => (
                                        <button
                                            key={ex.id}
                                            onClick={() => handleExampleClick(ex)}
                                            className="group relative w-12 h-12 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all"
                                            title={ex.name}
                                        >
                                            <img src={ex.url} alt={ex.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Result Display Area */}
                        <AnimatePresence mode="wait">
                            {(previewUrl || resultUrl) ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {/* Original Pane */}
                                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 relative group">
                                        <div className="absolute top-6 left-6 z-10">
                                            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white/50 border border-white/10 tracking-widest">ORIGINAL</span>
                                        </div>
                                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-950 flex items-center justify-center">
                                            <img src={previewUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                                        </div>

                                        {/* Original Action Bar */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (previewUrl) {
                                                            setModalImageUrl(previewUrl);
                                                            setIsModalOpen(true);
                                                        }
                                                    }}
                                                    className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all border border-gray-700"
                                                    title="View Original Image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Result Pane */}
                                    <div className="bg-gray-900 rounded-2xl border border-blue-900/30 p-4 relative overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.05)]">
                                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                                            <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-blue-400 tracking-widest">DE-IDENTIFIED</span>
                                            {isLoading && (
                                                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-blue-400 border border-blue-500/20">
                                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></span>
                                                    PROCESSING
                                                </span>
                                            )}
                                        </div>

                                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-950 flex items-center justify-center relative">
                                            {resultUrl ? (
                                                <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500" />
                                            ) : isLoading ? (
                                                <div className="flex flex-col items-center gap-4 text-gray-700">
                                                    <div className="w-12 h-12 border-2 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <span className="text-xs font-mono tracking-tighter uppercase">{jobStatus || 'Processing...'}</span>
                                                </div>
                                            ) : null}

                                            {isLoading && (
                                                <div className="absolute inset-0 pointer-events-none">
                                                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute top-0 animate-[scan_2.5s_infinite] opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (resultUrl) {
                                                            setModalImageUrl(resultUrl);
                                                            setIsModalOpen(true);
                                                        }
                                                    }}
                                                    className={`p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all border border-gray-700 ${!resultUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="View Full Image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                {resultUrl && (
                                                    <button
                                                        onClick={handleDownload}
                                                        className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
                                                        title="Download De-identified Image"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setResultUrl(null);
                                                    setImageFile(null);
                                                    setImageUrl('');
                                                }}
                                                className="text-[10px] font-bold text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest"
                                            >
                                                Clear Results
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-700 min-h-[400px] hover:border-blue-500/50 hover:bg-gray-900/30 transition-all cursor-pointer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-6 shadow-xl">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-2">Drop image here or click</h3>
                                    <p className="text-xs text-gray-600 max-w-[240px] text-center">
                                        Supports JPG, PNG (Max 10MB). Image will be auto-processed using current AI settings.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: AI Controls (Sidebar) */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sticky top-24 shadow-2xl">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
                                AI Configuration
                            </h3>

                            <div className="space-y-6">
                                {/* API Key Selection */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Active API Key</label>
                                    {apiKeys.length > 0 ? (
                                        <select
                                            value={selectedApiKey}
                                            onChange={(e) => setSelectedApiKey(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-[11px] font-mono text-blue-400 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                        >
                                            {apiKeys.map((key) => (
                                                <option key={key.id} value={key.secret_key}>{key.name} (***{key.secret_key.slice(-4)})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Link href="/keys" className="block p-3 rounded-lg bg-amber-900/10 border border-amber-900/30 text-amber-500 text-[10px] font-bold hover:bg-amber-900/20 transition-all">
                                            No active keys found. <br /> <span className="underline mt-1 inline-block">Generate one now →</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Prompt Input */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Refining Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g. 'blur all faces and car number plates'"
                                        className="w-full h-24 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-all resize-none"
                                    />
                                    {(category === 'SEGMENTATION' || category === 'DETECTION') && (
                                        <p className="text-[10px] text-amber-500 mt-2 font-medium">
                                            * SEGMENTATION과 DETECTION 카테고리에서는 프롬프트에 단어만 입력해 주세요.
                                        </p>
                                    )}
                                </div>

                                {/* Engine Settings */}
                                <div className="space-y-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Model Category</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['VLM', 'SEGMENTATION', 'DETECTION'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setCategory(cat as any);
                                                        if (cat === 'SEGMENTATION') {
                                                            setShape('polygon');
                                                        } else if (cat === 'VLM' || cat === 'DETECTION') {
                                                            setShape('bbox');
                                                        }
                                                    }}
                                                    className={`py-2 rounded-lg text-[9px] font-black transition-all ${category === cat
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                                                        : 'bg-gray-800 text-gray-600 hover:text-gray-400'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Masking Shape</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['bbox', 'circle', 'ellipse', 'polygon'].map((s) => (
                                                <button
                                                    key={s}
                                                    disabled={category === 'SEGMENTATION' && s !== 'polygon'}
                                                    onClick={() => setShape(s as any)}
                                                    className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all ${(category === 'SEGMENTATION' && s !== 'polygon')
                                                        ? 'bg-gray-900 text-gray-800 border border-gray-800/50 cursor-not-allowed opacity-50'
                                                        : shape === s
                                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                                                            : 'bg-gray-950 text-gray-700 border border-gray-800 hover:border-gray-700'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>


                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Blur Intensity</label>
                                            <span className="text-[10px] font-black text-blue-500">{level === null ? 'AUTO' : `L${level}`}</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="10" step="1"
                                            value={level === null ? 0 : level}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value);
                                                setLevel(v === 0 ? null : v);
                                            }}
                                            className="w-full accent-blue-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Error Trap Display */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-500 text-[10px] font-bold"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLoading
                                        ? 'bg-blue-900/50 text-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            PROCESSING...
                                        </span>
                                    ) : 'Apply De-id'}
                                </button>
                            </div>
                        </div>

                        {/* Footer Spacer */}
                        <div className="mt-6"></div>
                    </aside>
                </div>
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
            />

            {/* Image Preview Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-full max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={modalImageUrl}
                                alt="Full Preview"
                                className="max-w-full max-h-[90vh] rounded-xl shadow-2xl border border-white/10"
                            />
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors group"
                            >
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase mr-2 opacity-0 group-hover:opacity-100 transition-all">Close</span>
                                <svg className="w-8 h-8 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes scan {
                    from { transform: translateY(0); }
                    to { transform: translateY(400px); }
                }
            `}</style>
        </div>
    );
}
