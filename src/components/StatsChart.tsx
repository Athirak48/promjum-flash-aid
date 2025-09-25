import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

interface StatsChartProps {
  title: string;
  value: number;
  unit: string;
  percentage?: number;
  icon: 'chart' | 'trending' | 'clock' | 'target';
  color?: string;
}

const iconMap = {
  chart: BarChart3,
  trending: TrendingUp,
  clock: Clock,
  target: Target,
};

export default function StatsChart({ title, value, unit, percentage, icon, color = 'primary' }: StatsChartProps) {
  const Icon = iconMap[icon];
  
  return (
    <div className="bg-gradient-card backdrop-blur-sm rounded-lg p-4 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          <Icon className={`h-4 w-4 text-${color}`} />
        </div>
        {percentage !== undefined && (
          <div className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {percentage}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{unit}</div>
        
        {/* Simple progress visualization */}
        {percentage !== undefined && (
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`bg-gradient-primary h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="text-xs font-medium text-foreground/80 mt-2 truncate">
        {title}
      </div>
    </div>
  );
}