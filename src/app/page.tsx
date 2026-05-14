import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Background Glow */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Intelligent Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">De-identification</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Harness the power of VLM and SAM3 to protect privacy. Simply describe what you want to hide, and our AI automatically detects and anonymizes the target object with precision.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/demo"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
            >
              Try the Demo
            </Link>
            <Link href="/technology" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
              Learn how it works <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">Natural Language Grounding</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Input text like &quot;blur the license plate&quot; and the VLM translates your prompt into precise spatial coordinates.</p>
              </dd>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">SAM3 Precision</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Segment Anything 3 handles the bounding boxes to generate pixel-perfect masks around complex objects automatically.</p>
              </dd>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">Enterprise Grade Security</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Auto-cleanup routines and strictly controlled queue mechanisms ensure your data never stays on our servers.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
