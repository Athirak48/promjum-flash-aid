import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberSpinnerProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
}

export function NumberSpinner({
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    className,
    disabled = false,
}: NumberSpinnerProps) {
    const handleIncrement = () => {
        const newValue = Math.min(value + step, max);
        onChange(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.max(value - step, min);
        onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value) || min;
        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
            >
                <Minus className="h-4 w-4" />
            </Button>

            <Input
                type="number"
                value={value}
                onChange={handleInputChange}
                className="text-center font-semibold text-lg w-20 h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={min}
                max={max}
                disabled={disabled}
            />

            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
