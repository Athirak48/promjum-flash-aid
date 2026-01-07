import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    className?: string;
    size?: 'default' | 'sm';
}

export function TimePicker({
    value = '00:00',
    onChange,
    min,
    className,
    size = 'default'
}: TimePickerProps) {
    const [currentStrHour, currentStrMinute] = value.split(':');
    const currentHour = parseInt(currentStrHour || '0');
    const currentMinute = parseInt(currentStrMinute || '0');

    // Parse min time
    const [minStrHour, minStrMinute] = (min || '00:00').split(':');
    const minHour = parseInt(minStrHour || '0');
    const minMinute = parseInt(minStrMinute || '0');

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []); // 5-minute steps for cleaner UI

    const handleHourChange = (newHourStr: string) => {
        const newHour = parseInt(newHourStr);
        // Validate minute against min time if hour matches min hour
        let newMinute = currentMinute;
        if (newHour === minHour && newMinute < minMinute) {
            newMinute = minMinute;
        }
        onChange(`${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`);
    };

    const handleMinuteChange = (newMinuteStr: string) => {
        const newMinute = parseInt(newMinuteStr);
        onChange(`${String(currentHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`);
    };

    const isSmall = size === 'sm';
    const heightClass = isSmall ? 'h-8' : 'h-10';
    const widthClass = isSmall ? 'w-[60px]' : 'w-[72px]';
    const textClass = isSmall ? 'text-xs' : 'text-lg';

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Hour Selector */}
            <div className="relative">
                <Select
                    value={String(currentHour)}
                    onValueChange={handleHourChange}
                >
                    <SelectTrigger className={cn(
                        widthClass, heightClass,
                        "border border-white/10 bg-white/5 hover:bg-white/10 focus:bg-indigo-500/10 focus:border-indigo-500/50 transition-all rounded-lg font-mono font-medium justify-center text-slate-200 px-0 [&>svg]:hidden text-center",
                        textClass
                    )}>
                        <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent className="h-[200px] rounded-xl border-white/10 bg-[#1e293b] text-slate-200">
                        {hours.map((h) => (
                            <SelectItem
                                key={h}
                                value={String(h)}
                                disabled={min ? h < minHour : false}
                                className="justify-center text-xs font-medium py-1.5 cursor-pointer focus:bg-indigo-500/20 focus:text-indigo-200"
                            >
                                {String(h).padStart(2, '0')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <span className={cn("font-bold text-slate-600 pb-0.5 px-0.5", isSmall ? "text-xs" : "text-lg")}>:</span>

            {/* Minute Selector */}
            <div className="relative">
                <Select
                    value={String(currentMinute)}
                    onValueChange={handleMinuteChange}
                >
                    <SelectTrigger className={cn(
                        widthClass, heightClass,
                        "border border-white/10 bg-white/5 hover:bg-white/10 focus:bg-indigo-500/10 focus:border-indigo-500/50 transition-all rounded-lg font-mono font-medium justify-center text-slate-200 px-0 [&>svg]:hidden text-center",
                        textClass
                    )}>
                        <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="h-[200px] rounded-xl border-white/10 bg-[#1e293b] text-slate-200">
                        {minutes.map((m) => (
                            <SelectItem
                                key={m}
                                value={String(m)}
                                disabled={min && currentHour === minHour ? m < minMinute : false}
                                className="justify-center text-xs font-medium py-1.5 cursor-pointer focus:bg-indigo-500/20 focus:text-indigo-200"
                            >
                                {String(m).padStart(2, '0')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
