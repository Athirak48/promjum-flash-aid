import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function FeedbackWidget() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/feedback')}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: isHovered ? -8 : 0
            }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />

            {/* Monkey mascot */}
            <motion.div
                className="relative w-12 h-12 sm:w-14 sm:h-14"
                animate={{
                    rotate: [0, -5, 5, -5, 0],
                    y: [0, -10, 0]
                }}
                transition={{
                    rotate: {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    },
                    y: {
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }
                }}
            >
                <img
                    src="/monkey-mascot.png"
                    alt="Feedback Mascot"
                    className="w-full h-full object-contain drop-shadow-2xl"
                />
            </motion.div>

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : 10
                }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-purple-500/50 border-2 border-white/20 backdrop-blur-md">
                    <p className="font-bold text-sm">มีอะไรจะบอกไหมครับ? 💬</p>
                    {/* Arrow */}
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rotate-45 border-r-2 border-t-2 border-white/20" />
                </div>
            </motion.div>

            {/* Notification badge (optional) */}
            <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <span className="text-white text-xs font-black">!</span>
            </motion.div>
        </motion.div>
    );
}
