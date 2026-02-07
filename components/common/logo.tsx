import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt="LifeCycle"
        width={40}
        height={40}
        className="h-10 w-10 shrink-0"
        priority
      />
      <span className="text-xl font-bold tracking-tight text-foreground/90">
        LifeCycle
      </span>
    </div>
  )
}

export function LogoIcon({ className }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="LifeCycle"
      width={40}
      height={40}
      className={cn("h-10 w-10 shrink-0", className)}
      priority
    />
  )
}
