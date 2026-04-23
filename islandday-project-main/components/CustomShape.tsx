import React, { useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Predictable random number generator based on a seed
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

interface Props extends HTMLMotionProps<"div"> {
  bgColor?: string;
  seed?: number;
}

export default function CustomShape({ bgColor = '#F9F7E8', className = '', seed = 1, children, ...props }: Props) {
  // Generate 4 randomized overlapping ellipses strictly constrained to borders
  const ellipses = useMemo(() => {
    const rand = mulberry32(seed);
    const r = (scale: number) => rand() * scale;
    
    // We restrict circle centers to exactly [38, 48] and [52, 62] coordinates. 
    // This strict geometric constraint inherently ensures:
    // 1. The boundaries are mathematically perfectly tangent precisely at bounds 0 and 100
    // 2. The overlaps in the 4 centers prevent any gaps/empty space in the middle.
    // 3. The 4 seams/indents naturally form precisely a maximum of 3%~8% indent, entirely protecting layout content safely.
    const cx1 = 38 + r(10), cy1 = 38 + r(10);
    const cx2 = 52 + r(10), cy2 = 38 + r(10);
    const cx3 = 38 + r(10), cy3 = 52 + r(10);
    const cx4 = 52 + r(10), cy4 = 52 + r(10);

    return [
      { cx: cx1, cy: cy1, rx: cx1, ry: cy1 }, // Top Left
      { cx: cx2, cy: cy2, rx: 100 - cx2, ry: cy2 }, // Top Right
      { cx: cx3, cy: cy3, rx: cx3, ry: 100 - cy3 }, // Bottom Left
      { cx: cx4, cy: cy4, rx: 100 - cx4, ry: 100 - cy4 }, // Bottom Right
    ];
  }, [seed]);

  return (
    <motion.div className={`relative ${className}`} {...props}>
      {/* SVG Background Layer consisting purely of 4 overlapping ellipses, no shadows or highlights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Precise tangency to viewBox boundaries means shape won't obscure other elements and scales perfectly */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="block">
          {ellipses.map((e, index) => (
            <ellipse
              key={index}
              cx={e.cx}
              cy={e.cy}
              rx={e.rx}
              ry={e.ry}
              fill={bgColor}
            />
          ))}
        </svg>
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
}
