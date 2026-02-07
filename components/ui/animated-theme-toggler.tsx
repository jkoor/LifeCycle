"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SunMoon, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

const themeOrder = ["light", "dark", "system"] as const
type ThemeType = (typeof themeOrder)[number]

const themeLabels: Record<ThemeType, string> = {
  light: "亮色模式",
  dark: "暗色模式",
  system: "跟随系统",
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the icon based on current theme state
  const ThemeIcon =
    theme === "system"
      ? SunMoon // System mode shows monitor icon
      : resolvedTheme === "light"
        ? Sun // Dark mode shows sun (click to switch to light)
        : Moon // Light mode shows moon (click to switch to dark)

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    // Three-state cycling: light -> dark -> system -> light
    const currentIndex = themeOrder.indexOf((theme as ThemeType) || "system")
    const newTheme = themeOrder[(currentIndex + 1) % 3]

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    // @ts-ignore
    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme)
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }, [theme, setTheme, duration])

  if (!mounted) {
    return (
      <button className={cn(className, "opacity-0")} {...props}>
        <SunMoon className="size-5" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={buttonRef}
          onClick={toggleTheme}
          className={cn(className)}
          {...props}
        >
          <ThemeIcon className="size-5" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{themeLabels[(theme as ThemeType) || "system"]}</p>
      </TooltipContent>
    </Tooltip>
  )
}
