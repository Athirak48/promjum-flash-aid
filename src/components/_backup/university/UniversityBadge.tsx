import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building } from 'lucide-react';

interface UniversityBadgeProps {
    universityName: string;
    universityShortName: string;
    facultyName?: string;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export default function UniversityBadge({
    universityName,
    universityShortName,
    facultyName,
    size = 'md',
    onClick
}: UniversityBadgeProps) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                inline-flex items-center gap-2 
                bg-gradient-to-r from-purple-100 to-pink-100 
                dark:from-purple-900/40 dark:to-pink-900/40
                border border-purple-200 dark:border-purple-700
                rounded-full ${sizeClasses[size]}
                cursor-pointer hover:shadow-md transition-all
            `}
        >
            {/* University Icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                {universityShortName.slice(0, 2)}
            </div>

            {/* Info */}
            <div className="text-left">
                <div className="flex items-center gap-1">
                    <GraduationCap className={`${iconSizes[size]} text-purple-600 dark:text-purple-400`} />
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                        {universityShortName}
                    </span>
                </div>
                {facultyName && (
                    <div className="flex items-center gap-1 text-purple-500 dark:text-purple-400 text-xs">
                        <Building className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{facultyName}</span>
                    </div>
                )}
            </div>

            {/* Battle indicator */}
            <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-lg"
            >
                ⚔️
            </motion.span>
        </motion.div>
    );
}
