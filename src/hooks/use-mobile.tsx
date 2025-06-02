
import * as React from "react"

// Standard mobile breakpoint at 768px (tablet/mobile)
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkMobile()

    // Create a media query list
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Add event listener for media query changes
    const handleMediaChange = () => {
      checkMobile()
    }
    
    // Add event listener for window resize (for browsers that don't support matchMedia)
    window.addEventListener("resize", checkMobile)
    
    // Use the newer event listener pattern
    mql.addEventListener("change", handleMediaChange)
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("resize", checkMobile)
      mql.removeEventListener("change", handleMediaChange)
    }
  }, [])

  // Return boolean or false if undefined (fallback)
  return !!isMobile
}

