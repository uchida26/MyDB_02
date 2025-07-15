import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagBadgeProps {
  name: string
  color: string
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function TagBadge({ name, color, onClick, selected, className }: TagBadgeProps) {
  return (
    <Badge
      className={cn(
        "cursor-pointer transition-all",
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      style={{
        backgroundColor: color + '20', // 20% opacity
        color: color,
        borderColor: color
      }}
      variant="outline"
      onClick={(e) => {
        e.stopPropagation() // イベントの伝播を停止
        onClick?.()
      }}
    >
      {name}
    </Badge>
  )
}

