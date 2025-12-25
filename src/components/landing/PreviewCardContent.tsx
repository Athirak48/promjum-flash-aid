
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PreviewCardContent = () => {
    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        {
            id: 'talking',
            label: 'คนคุย',
            emoji: '💬',
            color: 'blue',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            text: 'text-blue-100',
            message: "ว้ายยยๆๆ 🤪 เป็นได้แค่คนคุย\nแต่ไม่ได้ครอบครอง!"
        },
        {
            id: 'friend',
            label: 'เพื่อนสนิท',
            emoji: '💕',
            color: 'pink',
            bg: 'bg-pink-500/20',
            border: 'border-pink-500/30',
            text: 'text-pink-100',
            message: "เฟรนด์โซนตลอดไป... 💅 ได้เเค่เพื่อนอ่ะเนอะ"
        },
        {
            id: 'lover',
            label: 'คนรู้ใจ',
            emoji: '❤️',
            color: 'red',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            text: 'text-red-100',
            message: "รู้ใจเท่า ไอ้หมอนั่นรึเปล่าาา 😏"
        },
        {
            id: 'known',
            label: 'คนรู้จัก',
            emoji: '🤝',
            color: 'amber',
            bg: 'bg-amber-500/20',
            border: 'border-amber-500/30',
            text: 'text-amber-100',
            message: "ได้รู้จักก็ดีแล้วเนอะๆๆ 🥶 อย่าล้ำเส้นนะจ๊ะ"
        },
    ];

    return (
        <div className="w-full relative min-h-[180px]">
            <AnimatePresence mode="wait">
                {!selected ? (
                    <motion.div
                        key="options"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full grid grid-cols-2 gap-3"
                    >
                        {options.map((opt) => (
                            <motion.div
                                key={opt.id}
                                onClick={() => setSelected(opt.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`h-24 ${opt.bg} border ${opt.border} rounded-2xl hover:brightness-125 transition-all cursor-pointer flex items-center justify-center ${opt.text} font-bold text-xl gap-3 shadow-sm`}
                            >
                                <span className="text-xl">{opt.emoji}</span> {opt.label}
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="popup"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center z-10"
                    >
                        <div className="glass-card-rose-violet border border-white/40 bg-black/60 backdrop-blur-md rounded-2xl p-4 shadow-2xl w-full h-full flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl animate-bounce drop-shadow-md">
                                {options.find(o => o.id === selected)?.emoji}
                            </span>
                            <p className="text-white font-bold text-lg leading-snug font-cute px-2 drop-shadow-sm whitespace-pre-line">
                                {options.find(o => o.id === selected)?.message}
                            </p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(null);
                                }}
                                className="mt-3 flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 shadow-lg group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">⬅️</span> เลือกใหม่
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
