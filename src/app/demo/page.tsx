'use client';

import { useState } from 'react';

export default function DemoPage() {
    const [prompt, setPrompt] = useState('');
    const [target, setTarget] = useState('inner');

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
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Command AI</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. '사람 얼굴 가려줘'"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Mode</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setTarget('inner')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${target === 'inner'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        Inner (Target)
                                    </button>
                                    <button
                                        onClick={() => setTarget('outer')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${target === 'outer'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        Outer (Background)
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                    De-identify Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Image Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl h-[500px] flex flex-col items-center justify-center text-gray-500 hover:border-gray-600 hover:bg-gray-800/50 transition-all cursor-pointer">
                        <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-300">Click to upload or drag & drop</p>
                        <p className="text-sm mt-2">JPG, PNG up to 10MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
