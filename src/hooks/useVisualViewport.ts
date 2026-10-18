import { useEffect, useState, RefObject } from 'react';

interface VisualViewportInfo {
  isKeyboardOpen: boolean;
  viewportHeight: number;
  keyboardHeight: number;
}

/**
 * Hook that leverages the VisualViewport API to detect mobile virtual keyboard
 * presence, viewport resize, and helps keep inputs and chat messages visible.
 */
export function useVisualViewport(
  targetElementRef?: RefObject<HTMLElement | null>,
  scrollContainerRef?: RefObject<HTMLElement | null>
): VisualViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<VisualViewportInfo>({
    isKeyboardOpen: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const vv = window.visualViewport;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const currentHeight = vv.height;
      const diff = windowHeight - currentHeight;
      const isKeyboard = diff > 140; // Virtual keyboard typically > 140px

      setViewportInfo({
        isKeyboardOpen: isKeyboard,
        viewportHeight: currentHeight,
        keyboardHeight: isKeyboard ? diff : 0,
      });

      if (isKeyboard) {
        // If target element is provided (like the chat input), ensure it's in view
        if (targetElementRef?.current) {
          targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        // If scroll container is provided, scroll to bottom
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [targetElementRef, scrollContainerRef]);

  return viewportInfo;
}
