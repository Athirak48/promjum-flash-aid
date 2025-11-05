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
        const itemHeight = 40;
        scrollRef.current.scrollTop = index * itemHeight - itemHeight * 2;
      }
    }
  }, [value, isCustom]);

  const scrollToValue = (duration: number) => {
    if (scrollRef.current) {
      const index = presetDurations.indexOf(duration);
      if (index !== -1) {
        const itemHeight = 40;
        scrollRef.current.scrollTop = index * itemHeight - itemHeight * 2;
      }
    }
  };

  const incrementDuration = () => {
    const currentIndex = presetDurations.indexOf(value);
    if (currentIndex !== -1 && currentIndex < presetDurations.length - 1) {
      const newValue = presetDurations[currentIndex + 1];
      onChange(newValue);
      scrollToValue(newValue);
    }
  };

  const decrementDuration = () => {
    const currentIndex = presetDurations.indexOf(value);
    if (currentIndex !== -1 && currentIndex > 0) {
      const newValue = presetDurations[currentIndex - 1];
      onChange(newValue);
      scrollToValue(newValue);
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
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          type="number"
          min="1"
          max="999"
          value={customValue}
          onChange={(e) => handleCustomInput(e.target.value)}
          className="w-20 text-center"
          placeholder="นาที"
        />
        <span className="text-sm text-muted-foreground">นาที</span>
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            const nearest = presetDurations.reduce((prev, curr) => 
              Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
            );
            onChange(nearest);
          }}
          className="text-xs text-primary hover:underline"
        >
          เลือกจากรายการ
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <button
        type="button"
        onClick={incrementDuration}
        className="p-1 hover:bg-muted rounded transition-colors"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      
      <div 
        ref={scrollRef}
        className="h-[120px] w-24 overflow-y-scroll scrollbar-hide scroll-smooth"
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          const itemHeight = 40;
          const index = Math.round(scrollTop / itemHeight);
          if (index >= 0 && index < presetDurations.length) {
            const newDuration = presetDurations[index];
            if (newDuration !== value) {
              onChange(newDuration);
            }
          }
        }}
      >
        <div className="py-10">
          {presetDurations.map((duration) => (
            <div
              key={duration}
              className={cn(
                "h-10 flex items-center justify-center cursor-pointer transition-all",
                duration === value 
                  ? "text-primary font-bold text-xl" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                onChange(duration);
                scrollToValue(duration);
              }}
            >
              {duration} น.
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={decrementDuration}
        className="p-1 hover:bg-muted rounded transition-colors"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => {
          setIsCustom(true);
          setCustomValue(value.toString());
        }}
        className="mt-2 text-xs text-primary hover:underline"
      >
        กำหนดเอง
      </button>
    </div>
  );
}
