import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DurationPickerProps {
  value: number; // minutes
  onChange: (duration: number) => void;
  className?: string;
}

const presetDurations = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120];

export function DurationPicker({ value, onChange, className }: DurationPickerProps) {
  const [isCustom, setIsCustom] = useState(!presetDurations.includes(value));
  const [customValue, setCustomValue] = useState(value.toString());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCustom && scrollRef.current) {
      const index = presetDurations.indexOf(value);
      if (index !== -1) {
        const itemHeight = 28;
        scrollRef.current.scrollTop = index * itemHeight - itemHeight;
      }
    }
  }, [value, isCustom]);

  const scrollToValue = (duration: number) => {
    if (scrollRef.current) {
      const index = presetDurations.indexOf(duration);
      if (index !== -1) {
        const itemHeight = 28;
        scrollRef.current.scrollTo({
          top: index * itemHeight,
          behavior: 'auto'
        });
      }
    }
  };

  const incrementDuration = () => {
    const currentIndex = presetDurations.indexOf(value);
    if (currentIndex !== -1 && currentIndex < presetDurations.length - 1) {
      const newValue = presetDurations[currentIndex + 1];
      onChange(newValue);
      setTimeout(() => scrollToValue(newValue), 0);
    } else if (currentIndex === -1) {
      // ถ้าค่าปัจจุบันไม่อยู่ในรายการ ให้หาค่าที่ใกล้ที่สุด
      const nextValue = presetDurations.find(d => d > value) || presetDurations[presetDurations.length - 1];
      onChange(nextValue);
      setTimeout(() => scrollToValue(nextValue), 0);
    }
  };

  const decrementDuration = () => {
    const currentIndex = presetDurations.indexOf(value);
    if (currentIndex !== -1 && currentIndex > 0) {
      const newValue = presetDurations[currentIndex - 1];
      onChange(newValue);
      setTimeout(() => scrollToValue(newValue), 0);
    } else if (currentIndex === -1) {
      // ถ้าค่าปัจจุบันไม่อยู่ในรายการ ให้หาค่าที่ใกล้ที่สุด
      const prevValue = [...presetDurations].reverse().find(d => d < value) || presetDurations[0];
      onChange(prevValue);
      setTimeout(() => scrollToValue(prevValue), 0);
    }
  };

  const handleCustomInput = (inputValue: string) => {
    setCustomValue(inputValue);
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
      onChange(numValue);
    }
  };

  if (isCustom) {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <Input
          type="number"
          min="1"
          max="999"
          value={customValue}
          onChange={(e) => handleCustomInput(e.target.value)}
          className="w-16 h-8 text-center text-sm"
          placeholder="นาที"
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            const nearest = presetDurations.reduce((prev, curr) =>
              Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
            );
            onChange(nearest);
          }}
          className="text-[10px] text-primary hover:underline"
        >
          รายการ
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-0.5", className)}>
      <button
        type="button"
        onClick={decrementDuration}
        className="p-0.5 hover:bg-muted rounded transition-colors"
      >
        <ChevronUp className="w-3 h-3" />
      </button>

      <div className="relative h-[84px] w-16">
        {/* Fixed selection box */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-7 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />

        <div
          ref={scrollRef}
          className="h-full w-full overflow-y-scroll scrollbar-hide"
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const itemHeight = 28;
            const index = Math.round(scrollTop / itemHeight);
            if (index >= 0 && index < presetDurations.length) {
              const newDuration = presetDurations[index];
              if (newDuration !== value) {
                onChange(newDuration);
              }
            }
          }}
        >
          <div className="py-7">
            {presetDurations.map((duration) => (
              <div
                key={duration}
                className={cn(
                  "h-7 flex items-center justify-center cursor-pointer transition-colors text-sm",
                  duration === value
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  onChange(duration);
                  scrollToValue(duration);
                }}
              >
                {duration}น
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={incrementDuration}
        className="p-0.5 hover:bg-muted rounded transition-colors"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      <button
        type="button"
        onClick={() => {
          setIsCustom(true);
          setCustomValue(value.toString());
        }}
        className="mt-1 text-[10px] text-primary hover:underline"
      >
        กำหนดเอง
      </button>
    </div>
  );
}
