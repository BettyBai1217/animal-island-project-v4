import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CloudBubbleProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hasTail?: boolean;
  tailDirection?: 'left' | 'right' | 'top' | 'bottom';
  seed?: number; 
}

// Organic, responsive % based shapes (Toast / Cloud)
// These create soft, asymmetrical ovals that scale with content
const BUBBLE_SHAPES = [
  '55% 45% 50% 50% / 50% 55% 45% 50%',
  '50% 50% 40% 60% / 55% 45% 50% 50%',
  '45% 55% 50% 50% / 50% 45% 55% 50%',
  '60% 40% 45% 55% / 45% 50% 55% 50%',
  '52% 48% 55% 45% / 48% 52% 50% 50%'
];

export default function CloudBubble({
  children,
  className = '',
  hasTail = false,
  tailDirection = 'left',
  seed = 0,
  ...props
}: CloudBubbleProps) {
  const shape = BUBBLE_SHAPES[seed % BUBBLE_SHAPES.length];

  return (
    <motion.div 
      className={`relative inline-block ${className}`}
      {...props}
    >
      {/* Speech Tail - Rendered first so it sits under the main body if needed, 
          but actually we want it to merge perfectly. 
          A drop shadow on the wrapper handles the overall shadow. */}
      
      {/* Main Container for Shadow merging */}
      <div 
        className="absolute inset-0 z-0 drop-shadow-[0_8px_24px_rgba(84,68,57,0.15)] pointer-events-none"
      >
        {/* Main Blob Body */}
        <div 
          className="w-full h-full bg-[#FBF8EF]"
          style={{
            borderRadius: shape,
            boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.8), inset 0 -4px 6px rgba(138,126,102,0.05)',
          }}
        />

        {/* Tail Component */}
        {hasTail && (
          <div 
             className="absolute bg-[#FBF8EF] z-[-1]"
             style={{
               width: '32px',
               height: '32px',
               borderRadius: '6px 20px 6px 20px',
               ...(tailDirection === 'left' && { top: '50%', left: '-12px', transform: 'translateY(-50%) rotate(45deg)' }),
               ...(tailDirection === 'right' && { top: '50%', right: '-12px', transform: 'translateY(-50%) rotate(45deg)' }),
               ...(tailDirection === 'top' && { left: '50%', top: '-12px', transform: 'translateX(-50%) rotate(45deg)' }),
               ...(tailDirection === 'bottom' && { left: '50%', bottom: '-12px', transform: 'translateX(-50%) rotate(45deg)' }),
               // Match inner shadow styling slightly for the tail
               boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.5)',
             }}
          />
        )}
      </div>

      {/* Actual Content Wrapper */}
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </motion.div>
  );
}
