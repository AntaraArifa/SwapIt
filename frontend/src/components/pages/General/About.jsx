import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    const teamMembers = [
        {
            name: 'Niaz Rahman',
            role: 'Frontend Developer',
            img: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
        {
            name: 'Tahsin Islam',
            role: 'Backend Developer',
            img: 'https://randomuser.me/api/portraits/men/41.jpg',
        },
        {
            name: 'Antara Arifa',
            role: 'UI/UX Designer',
            img: 'https://randomuser.me/api/portraits/women/68.jpg',
        },
        {
            name: 'Takia Farhin',
            role: 'UI/UX Designer',
            img: 'https://randomuser.me/api/portraits/women/69.jpg',
        },
        {
            name: 'Labibah Hoque',
            role: 'UI/UX Designer',
            img: 'https://randomuser.me/api/portraits/women/70.jpg',
        },
    ];

    return (
        <div className="min-h-screen px-6 py-16 md:px-20 bg-gradient-to-br from-white via-slate-50 to-blue-50 text-gray-800">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                    About <span className="text-indigo-600">SwapIT</span>
                </h1>
                <p className="text-lg text-gray-600 mb-12">
                    SwapIT is more than just a learning platform. It’s a movement — a place where knowledge meets accessibility, where teachers and learners grow together, and where every skill swap is a step toward a smarter world.
                </p>
            </motion.div>

            {/* Mission & Vision Section */}
            <motion.div
                className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto"
                initial="hidden"
                whileInView="visible"
                transition={{ staggerChildren: 0.2 }}
                viewport={{ once: true }}
            >
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 shadow-xl rounded-xl"
                >
                    <h3 className="text-2xl font-bold text-indigo-600 mb-3">🌍 Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed">
                        To make quality education accessible and personalized for everyone. Whether you’re learning a new skill or teaching what you know, SwapIT helps you grow through meaningful, modern knowledge exchange.
                    </p>
                </motion.div>

                <motion.div
                    variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 shadow-xl rounded-xl"
                >
                    <h3 className="text-2xl font-bold text-sky-600 mb-3">🚀 Our Vision</h3>
                    <p className="text-gray-700 leading-relaxed">
                        To become the most trusted and innovative global platform for peer-to-peer learning. We believe in a future where learning is collaborative, inclusive, and powered by community.
                    </p>
                </motion.div>
            </motion.div>

            {/* Meet the Team Section */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-24 max-w-6xl mx-auto text-center"
            >
                <h2 className="text-3xl font-bold mb-6 text-gray-800">👥 Meet the Team</h2>
                <p className="text-gray-600 mb-12">Passionate minds building the future of learning.</p>

                {/* Flex wrapper centers last row with 2 cards */}
                <div className="flex flex-wrap justify-center gap-10">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition w-full max-w-xs text-center"
                        >
                            <img
                                src={member.img}
                                alt={member.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                            />
                            <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
            {/* Footer Section */}
            <div className="mt-24 text-center text-gray-600">
                <p>Built with ❤️ by a team that believes in lifelong learning.</p>
                <p className="mt-2 text-sm">© {new Date().getFullYear()} SwapIT. All rights reserved.</p>
            </div>
        </div>
    );
};

export default About;
