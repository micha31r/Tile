'use client'

import { XIcon } from "lucide-react";
import { useState } from "react";

export function Popup({ 
  title, 
  trigger, 
  children 
}: { 
  title: string; 
  trigger: (onClick: () => void) => React.ReactNode; 
  children?: React.ReactNode 
}) {
  const [translateY, setTranslateY] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('rgba(0,0,0,0)');
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    if (!isOpen) {
      setTranslateY(-100);
      setBackgroundColor('rgba(0,0,0,0.2)');
      setIsOpen(true);
    } else {
      setTranslateY(0);
      setBackgroundColor('rgba(0,0,0,0)');
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
      
      <div onClick={onOutsideClick} className="fixed w-full sm:max-w-96 h-full top-0 left-1/2 -translate-x-1/2 right-0 sm:rounded-[48px] transition-colors duration-500 overflow-hidden z-20" style={{
        backgroundColor: backgroundColor,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}>
        <div className="fixed z-50 left-1/2 top-full transition-all duration-500 w-full max-w-96" style={{
          transform: `translate(-50%, ${translateY}%)`
        }}>
          <div className="bg-background mx-4 mb-8 p-4 pb-0 rounded-3xl pointer-events-auto">
            <div className="flex flex-row gap-3 justify-between items-center mb-4">
              <h2 className=" font-medium">{title}</h2>

              <button onClick={toggle} className="flex items-center justify-center rounded-full w-8 aspect-square bg-secondary text-muted-foreground">
                <XIcon className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Seperator */}
            <div className="w-full h-px bg-border/50"></div>

            <div className="max-h-96 overflow-y-auto py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}