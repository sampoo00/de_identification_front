import Link from 'next/link';

export default function Navigation() {
    return (
        <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-white text-xl font-bold tracking-tight">
                            GEMINI<span className="text-blue-500">.AI</span>
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
                    </nav>
                    <div className="flex items-center">
                        <Link
                            href="/keys"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        >
                            API Keys
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
