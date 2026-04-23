import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface AcnhTrapezoidBoxProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  bgColor?: string;
}

/**
 * A highly specific, ACNH-style organic container.
 * Features:
 * - Completely flat (NO highlights, NO shadows).
 * - Trapezoidal shape (bottom width is narrower).
 * - Very large rounded corners.
 * - Symmetrical left/right lines that dent inward at the bottom 1/3 position.
 */
export default function AcnhTrapezoidBox({
  children,
  className = '',
  bgColor = '#F9F8F2', // Default creamy white color
  ...props
}: AcnhTrapezoidBoxProps) {
  return (
    <motion.div 
      className={`relative ${className}`}
      {...props}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            /* 
              Symmetrical Path Design (Milder):
              - Top edge: (8,0) to (92,0)
              - Top Right Corner: sweeping curve to (100, 20)
              - Right Line: straight down to (99, 45)
              - Right Dent In: bottom 1/3, dents into x=96 at y=66 (mild 4% dent)
              - Right Dent Out: recovers to x=97 at y=88
              - Bottom Right Corner: tight sweep ending at (88, 100)
              - Bottom Edge: (88,100) to (12,100) - shorter bottom forms trapezoid
              - (Mirrored backwards for left side)
            */
            d="
              M 8 0 
              L 92 0 
              C 98 0, 100 5, 100 20 
              L 99 45 
              C 98 55, 96 60, 96 66 
              C 96 72, 98 80, 97 88 
              C 96 98, 92 100, 88 100 
              L 12 100 
              C 8 100, 4 98, 3 88 
              C 2 80, 4 72, 4 66 
              C 4 60, 2 55, 1 45 
              L 0 20 
              C 0 5, 2 0, 8 0 
              Z
            "
            fill={bgColor}
          />
        </svg>
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
