'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Background Glow */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <motion.div
        className="mx-auto max-w-7xl px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Intelligent Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">De-identification</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Harness the power of VLM and Promptable Concept Segmentation to protect privacy. Simply describe what you want to hide, and our AI automatically detects and anonymizes the target object with precision.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/demo"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
            >
              Try the Demo
            </Link>
            <Link href="/technology" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
              Learn how it works <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Section */}
      <motion.div
        className="mx-auto mt-32 max-w-7xl px-6 lg:px-8 pb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm hover:bg-gray-800/40 transition-colors">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">Natural Language Grounding</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Input text like &quot;blur the license plate&quot; and the VLM translates your prompt into precise spatial coordinates.</p>
              </dd>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm hover:bg-gray-800/40 transition-colors">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">Promptable Concept Segmentation</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Promptable Concept Segmentation handles everything from text phrases to visual examples, identifying and masking all related instances automatically.</p>
              </dd>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm hover:bg-gray-800/40 transition-colors">
              <dt className="text-xl font-semibold leading-7 text-white mt-4">Enterprise Grade Security</dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                <p>Auto-cleanup routines and strictly controlled queue mechanisms ensure your data never stays on our servers.</p>
              </dd>
            </div>
          </dl>
        </div>
      </motion.div>
    </div>
  );
}
