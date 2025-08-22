'use client';

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useHaptic } from "react-haptic";
import MobileDetect from "mobile-detect";

export function Popup({ 
  title, 
  trigger, 
  children 
}: { 
  title: React.ReactNode; 
  trigger: (onClick: () => void) => React.ReactNode; 
  children?: React.ReactNode 
}) {
  const [translateY, setTranslateY] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('bg-transparent');
  const [isOpen, setIsOpen] = useState(false);
  const { vibrate } = useHaptic();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const md = new MobileDetect(window.navigator.userAgent);
    setIsIOS(md.is("iPhone") || md.is("iPad") || md.os() === "iOS");
  }, []);

  function toggle() {
    if (!isOpen) {
      vibrate();
      setTranslateY(-100);
      setBackgroundColor('bg-black/20 dark:bg-white/20');
      setIsOpen(true);
    } else {
      setTranslateY(0);
      setBackgroundColor('bg-transparent');
      setIsOpen(false);
    }
  }

  function onOutsideClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.target === event.currentTarget) {
      toggle();
    }
  }

  return (
    <>
      {trigger && trigger(toggle)}
      
      <div onClick={onOutsideClick} className={cn("fixed w-full sm:max-w-96 h-full top-0 left-1/2 -translate-x-1/2 right-0 sm:rounded-[48px] transition-colors duration-500 overflow-hidden z-20", backgroundColor)} style={{
        pointerEvents: isOpen ? 'auto' : 'none'
      }}>
        <div className="fixed z-50 left-1/2 top-full transition-all duration-500 w-full sm:max-w-96 max-w-md" style={{
          transform: `translate(-50%, ${translateY}%)`
        }}>
          <div className="bg-background sm:mx-4 sm:mb-8 p-4 pb-0 sm:rounded-3xl rounded-t-3xl pointer-events-auto overflow-scroll max-h-[calc(100svh-64px)]">
            <div className="z-10 sticky top-0 shadow-[0_0_0_16px_hsla(var(--background))] bg-background flex flex-row gap-3 justify-between items-center mb-4">
              <h2 className="font-medium flex-1">{title}</h2>

              <button onClick={toggle} className="flex items-center justify-center rounded-full w-8 aspect-square bg-secondary text-muted-foreground">
                <XIcon className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Seperator */}
            <div className="w-full h-px bg-border/50 dark:bg-border"></div>

            <div className={cn("py-4", {
              "pb-8": isIOS
            })}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}