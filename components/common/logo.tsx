import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10">
        <Package className="h-6 w-6" {...props} />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground/90">
        LifeCycle
      </span>
    </div>
  )
}

export function LogoIcon({ className, ...props }: LogoProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10",
        className,
      )}
    >
      <Package className="h-6 w-6" {...props} />
    </div>
  )
}
