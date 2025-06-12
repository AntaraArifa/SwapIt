import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-indigo-100 flex flex-col items-center px-4 md:px-12 py-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                    Empower Your <span className="text-indigo-600">Learning</span><br />
                    With the Future of <span className="text-sky-600">Knowledge Sharing</span>
                </h1>
                <p className="mt-4 text-gray-600 text-lg md:text-xl">
                    A collaborative platform where learners and teachers thrive together. Modern, intuitive, and built to scale.
                </p>
                <div className="mt-8 flex justify-center space-x-4">
                    <Link to="/signup">
                        <Button className="px-6 py-3 text-lg font-semibold">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/about">
                        <Button variant="outline" className="px-6 py-3 text-lg">
                            Learn More
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Features Section */}
            <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {[
                    {
                        title: "Interactive Learning",
                        desc: "Engage with mentors and peers using dynamic tools and real-time collaboration.",
                        icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
                    },
                    {
                        title: "AI-Powered Matching",
                        desc: "Smart pairing between learners and teachers based on skills, goals, and styles.",
                        icon: <Sparkles className="w-8 h-8 text-pink-500" />,
                    },
                    {
                        title: "Seamless Experience",
                        desc: "A beautifully crafted interface that keeps you focused on growth.",
                        icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
                    },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.2 }}
                        viewport={{ once: true }}
                        className="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition"
                    >
                        <div className="flex justify-center mb-4">{item.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* CTA Banner */}
            <motion.div
                className="mt-24 w-full max-w-5xl rounded-2xl px-8 py-12 text-center shadow-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2 className="text-3xl font-bold mb-4">Ready to change the way you learn?</h2>
                <p className="text-lg mb-6">Join our community and unlock a smarter future.</p>
                <Link to="/signup">
                    <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition">
                        Create Your Account
                    </button>
                </Link>
            </motion.div>
        </div>
    );
};

export default Home;
