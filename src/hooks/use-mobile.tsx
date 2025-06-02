
import * as React from "react"

// Enhanced mobile breakpoints for better device detection
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const TOUCH_BREAKPOINT = 1200

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Enhanced mobile detection
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
      
      // Touch device detection
      const hasTouchScreen = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 ||
                           (navigator as any).msMaxTouchPoints > 0
      
      setIsTouchDevice(hasTouchScreen || width < TOUCH_BREAKPOINT)
    }

    // Initial check
    checkDeviceType()

    // Debounced resize handler for better performance
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkDeviceType, 150)
    }

    // Create media query listeners for better performance
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletQuery = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    const handleMediaChange = () => checkDeviceType()
    
    // Modern event listener pattern
    mobileQuery.addEventListener("change", handleMediaChange)
    tabletQuery.addEventListener("change", handleMediaChange)
    window.addEventListener("resize", debouncedResize)
    window.addEventListener("orientationchange", checkDeviceType)
    
    return () => {
      clearTimeout(timeoutId)
      mobileQuery.removeEventListener("change", handleMediaChange)
      tabletQuery.removeEventListener("change", handleMediaChange)
      window.removeEventListener("resize", debouncedResize)
      window.removeEventListener("orientationchange", checkDeviceType)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet,
    isTouchDevice,
    isDesktop: !isMobile && !isTablet
  }
}

// Legacy export for backward compatibility
export { useIsMobile as default }
