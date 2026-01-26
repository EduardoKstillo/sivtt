import { Card, CardContent } from '@components/ui/card'
import { cn } from '@/lib/utils'

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600'
}

export const MetricCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            colorClasses[color]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}