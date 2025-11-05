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
      const itemHeight = 28;
      ref.current.scrollTo({
        top: value * itemHeight - itemHeight,
        behavior: 'auto'
      });
    }
  };

  useEffect(() => {
    scrollToValue(hoursRef, localHours);
    scrollToValue(minutesRef, localMinutes);
  }, []);

  const incrementHours = () => {
    const newHour = (localHours + 1) % 24;
    setLocalHours(newHour);
    setTimeout(() => scrollToValue(hoursRef, newHour), 0);
  };
  
  const decrementHours = () => {
    const newHour = (localHours - 1 + 24) % 24;
    setLocalHours(newHour);
    setTimeout(() => scrollToValue(hoursRef, newHour), 0);
  };
  
  const incrementMinutes = () => {
    const newMinute = (localMinutes + 1) % 60;
    setLocalMinutes(newMinute);
    setTimeout(() => scrollToValue(minutesRef, newMinute), 0);
  };
  
  const decrementMinutes = () => {
    const newMinute = (localMinutes - 1 + 60) % 60;
    setLocalMinutes(newMinute);
    setTimeout(() => scrollToValue(minutesRef, newMinute), 0);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Hours Picker */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={incrementHours}
          className="p-0.5 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <div className="relative h-[84px] w-12">
          {/* Fixed selection box */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-7 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />
          
          <div 
            ref={hoursRef}
            className="h-full w-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const itemHeight = 28;
              const newHour = Math.round(scrollTop / itemHeight);
              if (newHour !== localHours && newHour >= 0 && newHour < 24) {
                setLocalHours(newHour);
              }
            }}
          >
            <div className="py-7">
              {allHours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "h-7 flex items-center justify-center cursor-pointer transition-colors text-sm",
                    hour === localHours 
                      ? "text-primary font-semibold" 
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
        </div>
        <button
          type="button"
          onClick={decrementHours}
          className="p-0.5 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="text-lg font-semibold text-muted-foreground">:</div>

      {/* Minutes Picker */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={incrementMinutes}
          className="p-0.5 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <div className="relative h-[84px] w-12">
          {/* Fixed selection box */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-7 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />
          
          <div 
            ref={minutesRef}
            className="h-full w-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const itemHeight = 28;
              const newMinute = Math.round(scrollTop / itemHeight);
              if (newMinute !== localMinutes && newMinute >= 0 && newMinute < 60) {
                setLocalMinutes(newMinute);
              }
            }}
          >
            <div className="py-7">
              {allMinutes.map((minute) => (
                <div
                  key={minute}
                  className={cn(
                    "h-7 flex items-center justify-center cursor-pointer transition-colors text-sm",
                    minute === localMinutes 
                      ? "text-primary font-semibold" 
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
        </div>
        <button
          type="button"
          onClick={decrementMinutes}
          className="p-0.5 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
