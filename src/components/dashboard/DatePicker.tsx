import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [localDay, setLocalDay] = useState(value.getDate());
  const [localMonth, setLocalMonth] = useState(value.getMonth());
  const [localYear, setLocalYear] = useState(value.getFullYear());

  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const allMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const allYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  useEffect(() => {
    const newDate = new Date(localYear, localMonth, localDay);
    if (newDate.getTime() !== value.getTime()) {
      onChange(newDate);
    }
  }, [localDay, localMonth, localYear]);

  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const itemHeight = 32;
      ref.current.scrollTo({
        top: index * itemHeight,
        behavior: 'auto'
      });
    }
  };

  useEffect(() => {
    scrollToValue(dayRef, localDay - 1);
    scrollToValue(monthRef, localMonth);
    scrollToValue(yearRef, allYears.indexOf(localYear));
  }, []);

  const incrementDay = () => {
    const newDay = localDay === 31 ? 1 : localDay + 1;
    setLocalDay(newDay);
    setTimeout(() => scrollToValue(dayRef, newDay - 1), 0);
  };

  const decrementDay = () => {
    const newDay = localDay === 1 ? 31 : localDay - 1;
    setLocalDay(newDay);
    setTimeout(() => scrollToValue(dayRef, newDay - 1), 0);
  };

  const incrementMonth = () => {
    const newMonth = (localMonth + 1) % 12;
    setLocalMonth(newMonth);
    setTimeout(() => scrollToValue(monthRef, newMonth), 0);
  };

  const decrementMonth = () => {
    const newMonth = (localMonth - 1 + 12) % 12;
    setLocalMonth(newMonth);
    setTimeout(() => scrollToValue(monthRef, newMonth), 0);
  };

  const incrementYear = () => {
    const currentIndex = allYears.indexOf(localYear);
    if (currentIndex < allYears.length - 1) {
      const newYear = allYears[currentIndex + 1];
      setLocalYear(newYear);
      setTimeout(() => scrollToValue(yearRef, currentIndex + 1), 0);
    }
  };

  const decrementYear = () => {
    const currentIndex = allYears.indexOf(localYear);
    if (currentIndex > 0) {
      const newYear = allYears[currentIndex - 1];
      setLocalYear(newYear);
      setTimeout(() => scrollToValue(yearRef, currentIndex - 1), 0);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Day Picker */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={decrementDay}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="relative h-[96px] w-16">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-8 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />

          <div
            ref={dayRef}
            className="h-full w-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const itemHeight = 32;
              const newDay = Math.round(scrollTop / itemHeight) + 1;
              if (newDay !== localDay && newDay >= 1 && newDay <= 31) {
                setLocalDay(newDay);
              }
            }}
          >
            <div className="py-8">
              {allDays.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "h-8 flex items-center justify-center cursor-pointer transition-colors text-sm",
                    day === localDay
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setLocalDay(day);
                    scrollToValue(dayRef, day - 1);
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={incrementDay}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Month Picker */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={decrementMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="relative h-[96px] w-24">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-8 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />

          <div
            ref={monthRef}
            className="h-full w-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const itemHeight = 32;
              const newMonth = Math.round(scrollTop / itemHeight);
              if (newMonth !== localMonth && newMonth >= 0 && newMonth < 12) {
                setLocalMonth(newMonth);
              }
            }}
          >
            <div className="py-8">
              {allMonths.map((month, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-8 flex items-center justify-center cursor-pointer transition-colors text-xs",
                    index === localMonth
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setLocalMonth(index);
                    scrollToValue(monthRef, index);
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={incrementMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Year Picker */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={decrementYear}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="relative h-[96px] w-16">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-8 border border-primary/50 bg-primary/10 rounded pointer-events-none z-10 mx-1" />

          <div
            ref={yearRef}
            className="h-full w-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const itemHeight = 32;
              const newIndex = Math.round(scrollTop / itemHeight);
              if (newIndex >= 0 && newIndex < allYears.length && allYears[newIndex] !== localYear) {
                setLocalYear(allYears[newIndex]);
              }
            }}
          >
            <div className="py-8">
              {allYears.map((year, index) => (
                <div
                  key={year}
                  className={cn(
                    "h-8 flex items-center justify-center cursor-pointer transition-colors text-sm",
                    year === localYear
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setLocalYear(year);
                    scrollToValue(yearRef, index);
                  }}
                >
                  {year + 543}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={incrementYear}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}