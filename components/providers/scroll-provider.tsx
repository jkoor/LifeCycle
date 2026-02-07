"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface ScrollState {
  isScrollingDown: boolean
  isScrolled: boolean // true when scrolled past threshold
  scrollY: number
}

interface ScrollContextValue extends ScrollState {
  handleScroll: (scrollTop: number) => void
}

const ScrollContext = createContext<ScrollContextValue | undefined>(undefined)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrollingDown: false,
    isScrolled: false,
    scrollY: 0,
  })

  const lastScrollY = React.useRef(0)
  const scrollThreshold = 10

  const handleScroll = useCallback((scrollTop: number) => {
    const scrollDelta = scrollTop - lastScrollY.current

    // Only trigger if scroll delta exceeds threshold
    if (Math.abs(scrollDelta) > scrollThreshold) {
      setScrollState({
        isScrollingDown: scrollDelta > 0 && scrollTop > 50,
        isScrolled: scrollTop > 20,
        scrollY: scrollTop,
      })
      lastScrollY.current = scrollTop
    }
  }, [])

  return (
    <ScrollContext.Provider value={{ ...scrollState, handleScroll }}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScrollState() {
  const context = useContext(ScrollContext)
  if (context === undefined) {
    throw new Error("useScrollState must be used within a ScrollProvider")
  }
  return context
}
