export default function Footer() {
    return (
        <footer className="bg-gray-950 py-12 border-t border-gray-800 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} MasGo Intelligent De-identification. All rights reserved.
                </p>
                <p className="text-gray-600 text-xs mt-2">
                    Powered by VLM, SAM3, and Transformer AI Technologies
                </p>
            </div>
        </footer>
    );
}
