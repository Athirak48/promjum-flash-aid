import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // Format: "HH:mm"
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, minutes] = value.split(':').map(Number);
  const [localHours, setLocalHours] = useState(hours);
  const [localMinutes, setLocalMinutes] = useState(minutes);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const allMinutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    const newTime = `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;
    if (newTime !== value) {
      onChange(newTime);
    }
  }, [localHours, localMinutes]);

  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
      const itemHeight = 40;
      ref.current.scrollTop = value * itemHeight - itemHeight * 2;
    }
  };

  useEffect(() => {
    scrollToValue(hoursRef, localHours);
    scrollToValue(minutesRef, localMinutes);
  }, []);

  const incrementHours = () => setLocalHours((prev) => (prev + 1) % 24);
  const decrementHours = () => setLocalHours((prev) => (prev - 1 + 24) % 24);
  const incrementMinutes = () => setLocalMinutes((prev) => (prev + 1) % 60);
  const decrementMinutes = () => setLocalMinutes((prev) => (prev - 1 + 60) % 60);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Hours Picker */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={incrementHours}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div 
          ref={hoursRef}
          className="h-[120px] w-16 overflow-y-scroll scrollbar-hide scroll-smooth"
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const itemHeight = 40;
            const newHour = Math.round(scrollTop / itemHeight);
            if (newHour !== localHours && newHour >= 0 && newHour < 24) {
              setLocalHours(newHour);
            }
          }}
        >
          <div className="py-10">
            {allHours.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-10 flex items-center justify-center cursor-pointer transition-all",
                  hour === localHours 
                    ? "text-primary font-bold text-xl" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setLocalHours(hour);
                  scrollToValue(hoursRef, hour);
                }}
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={decrementHours}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="text-2xl font-bold">:</div>

      {/* Minutes Picker */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={incrementMinutes}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div 
          ref={minutesRef}
          className="h-[120px] w-16 overflow-y-scroll scrollbar-hide scroll-smooth"
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const itemHeight = 40;
            const newMinute = Math.round(scrollTop / itemHeight);
            if (newMinute !== localMinutes && newMinute >= 0 && newMinute < 60) {
              setLocalMinutes(newMinute);
            }
          }}
        >
          <div className="py-10">
            {allMinutes.map((minute) => (
              <div
                key={minute}
                className={cn(
                  "h-10 flex items-center justify-center cursor-pointer transition-all",
                  minute === localMinutes 
                    ? "text-primary font-bold text-xl" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setLocalMinutes(minute);
                  scrollToValue(minutesRef, minute);
                }}
              >
                {String(minute).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={decrementMinutes}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
