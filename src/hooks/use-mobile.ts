
import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device has a mobile screen size
 * @returns {boolean} True if the device has a mobile screen size
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
