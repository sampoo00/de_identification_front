'use client';

import { useState, useRef } from 'react';
import { processDeidentify } from '@/lib/api';

export default function DemoPage() {
    const [prompt, setPrompt] = useState('');
    const [target, setTarget] = useState<'inner' | 'outer'>('inner');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 상태: 처리중, 결과, 에러
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null); // 새로운 이미지 업로드 시 결과 초기화
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResultUrl(null);
                setError(null);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = async () => {
        if (!imageFile) {
            setError('이미지를 먼저 업로드해주세요.');
            return;
        }
        if (!prompt.trim()) {
            setError('명령어(Prompt)를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const response = await processDeidentify({
            image: imageFile,
            prompt,
            target
        });

        if (response.success && response.resultUrl) {
            setResultUrl(response.resultUrl);
        } else {
            setError(response.message || '비식별화 처리 중 오류가 발생했습니다.');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Interactive Demo</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Upload an image and type what you want to de-identify. Our AI will handle the rest.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">AI</span>
                            Command Interface
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Refining Prompt</label>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. '사람 얼굴 가려줘'"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Mode</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setTarget('inner')}
                                        disabled={isLoading}
                                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${target === 'inner'
                                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        객체 가리기 (Inner)
                                    </button>
                                    <button
                                        onClick={() => setTarget('outer')}
                                        disabled={isLoading}
                                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${target === 'outer'
                                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        배경 가리기 (Outer)
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-800">
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
                </div>

                {/* Right Column: Image Preview & Result */}
                <div className="lg:col-span-2">
                    {!previewUrl && !resultUrl ? (
                        // 빈 업로드 공간
                        <div
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
                        </div>
                    ) : (
                        // 이미지 프리뷰 / 결과 표시 영역
                        <div className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-[600px] shadow-2xl flex items-center justify-center">

                            <img
                                src={resultUrl || previewUrl!}
                                alt="Working Image"
                                className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-40 blur-sm' : 'opacity-100'} transition-all duration-500`}
                            />

                            {/* 스캐닝/로딩 오버레이 UI */}
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <div className="w-full h-1 bg-blue-500/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                                    <div className="text-blue-400 font-mono text-xl tracking-widest bg-gray-900/80 px-6 py-2 rounded-lg border border-blue-500/30 backdrop-blur-md">
                                        ANALYZING SUBJECT...
                                    </div>
                                </div>
                            )}

                            {/* 액션 버튼들 (우측 상단) */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                {resultUrl && (
                                    <a
                                        href={resultUrl}
                                        download="de-identified-result.png"
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shadow-lg border border-blue-500/50 transition-colors tooltip flex items-center justify-center w-10 h-10"
                                        title="다운로드"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setResultUrl(null);
                                        setImageFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg shadow-lg border border-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
                                    title="초기화"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png"
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
