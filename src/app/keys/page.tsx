export default function KeysPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
                <p className="text-gray-400">Manage your secret keys for accessing GEMINI via API.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium text-white">Your Secret Keys</h3>
                        <p className="text-sm text-gray-500 mt-1">Do not share your API key with others, or expose it in the browser.</p>
                    </div>
                    <button className="bg-gray-100 text-gray-900 hover:bg-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                        + Create new secret key
                    </button>
                </div>

                <div className="p-6">
                    <table className="w-full text-left text-sm text-gray-400 mt-4">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Secret Key</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                <td className="px-4 py-4 text-white">Default Key</td>
                                <td className="px-4 py-4 font-mono">gemini-****************xyz</td>
                                <td className="px-4 py-4">May 14, 2026</td>
                                <td className="px-4 py-4 text-right">
                                    <button className="text-red-400 hover:text-red-300">Revoke</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 text-sm text-gray-500 bg-gray-950 p-4 rounded-lg flex items-start gap-4">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Your API key gives full access to the de-identification engine. Use it with the MCP (Model Context Protocol) or directly via REST endpoints. Refer to the GitHub documentation for more details.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
