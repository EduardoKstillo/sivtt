import { Card, CardContent } from '@components/ui/card'
import { cn } from '@/lib/utils'

const colorClasses = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  orange: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  },
  red: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  },
}

export const MetricCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const styles = colorClasses[color] || colorClasses.blue

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mb-0.5 tabular-nums">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}