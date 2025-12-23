import { Badge } from "@/components/ui/badge"
import { InventoryItem } from "@/types/inventory"
import { differenceInDays, parseISO } from "date-fns"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface ItemStatusBadgeProps {
  item: InventoryItem
}

export function ItemStatusBadge({ item }: ItemStatusBadgeProps) {
  // Logic 1: Out of Stock
  if (item.stock <= 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Out of Stock
      </Badge>
    )
  }

  // Logic 2: Expiration Warning
  if (item.expirationDate) {
    const today = new Date()
    const expDate = new Date(item.expirationDate)
    const daysLeft = differenceInDays(expDate, today)

    // Expired or expiring very soon (<= 0 days)
    if (daysLeft <= 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Clock className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    // Warning zone (e.g., within 7 days or custom logic)
    // For now, let's say within 7 days is "Expiring Soon"
    if (daysLeft <= 7) {
      return (
        <Badge
          variant="secondary"
          className="gap-1 text-orange-600 bg-orange-100 hover:bg-orange-200 border-orange-200"
        >
          <Clock className="h-3 w-3" />
          {daysLeft}d Left
        </Badge>
      )
    }
  }

  // Logic 3: Low Stock (e.g. < 2) - Optional, can be customized
  if (item.stock < 2) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-yellow-600 border-yellow-200 bg-yellow-50"
      >
        Low Stock
      </Badge>
    )
  }

  // Default: OK
  return (
    <Badge
      variant="outline"
      className="gap-1 text-green-600 border-green-200 bg-green-50"
    >
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  )
}
