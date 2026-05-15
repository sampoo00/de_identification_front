export default function TechnologyPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-8 text-white">Behind the Intelligence</h1>
            <p className="text-xl text-gray-300 mb-12">
                MasGO integrates three core AI components to seamlessly translate human intent into privacy-protected visual data.
            </p>

            <div className="space-y-16">
                {/* Section 1: VLM */}
                <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/40">
                    <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Vision-Language Model (VLM)</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Powered by models like <strong>Agentic VLM</strong>, the system interprets your vague requests (e.g., &quot;hide the background&quot; or &quot;blur the faces&quot;). The VLM reasons about the scene and maps these natural language concepts to analytical targets.
                    </p>
                </div>

                {/* Section 2: Segmentation */}
                <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/40">
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">2. Promptable Concept Segmentation</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Once the target is identified, <strong>Promptable Concept Segmentation</strong> is performed. Unlike previous versions that focused on a single instance, "Promptable Concept Segmentation" moves from instance-centric to <strong>concept-centric</strong> segmentation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
                            <h3 className="text-sm font-bold text-gray-200 mb-2">Textual Concepts</h3>
                            <p className="text-xs text-gray-400">Segments all matching instances in a scene using open-vocabulary text prompts like "all faces" or "license plates".</p>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
                            <h3 className="text-sm font-bold text-gray-200 mb-2">Visual Exemplars</h3>
                            <p className="text-xs text-gray-400">Identify a single example via a box, and "Promptable Concept Segmentation" automatically "learns" the concept to segment every similar object.</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Orchestration */}
                <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/40">
                    <h2 className="text-2xl font-semibold text-teal-400 mb-4">3. Auto-Level & Translation Layer</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        The platform automatically judges the sensitivity of a scene to assign a de-identification strength (Auto Level). Using LLMs, it can also automatically translate user prompts from Korean to English to maximize the recognition accuracy of the Vision AI tools.
                    </p>
                </div>
            </div>
        </div>
    );
}
