'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

export function AcnhStarsBurst({ delay = 0, style = {} }: { delay?: number, style?: React.CSSProperties }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]" style={style}>
      {/* Star particles only */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-12 h-12 flex items-center justify-center"
          initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1.8, 0],
            x: Math.cos(i * (Math.PI * 2 / 8) - Math.PI/2) * 320, 
            y: Math.sin(i * (Math.PI * 2 / 8) - Math.PI/2) * 320,
            rotate: 220
          }}
          transition={{ duration: 0.65, ease: "easeOut", delay }}
        >
          <svg viewBox="0 0 24 24" fill="#FFBA08" className="w-full h-full drop-shadow-lg">
            <path d="M12 0l3 9h9l-7.5 5.5 3 9-7.5-5.5-7.5 5.5 3-9L0 9h9z" />
          </svg>
        </motion.div>
      ))}
      
      {/* Center burst flash for the magic pop-in */}
      <motion.div
        className="absolute bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,1)] mix-blend-normal"
        initial={{ scale: 0.5, opacity: 1, width: 200, height: 200 }}
        animate={{ scale: [1, 3.5], opacity: [1, 0] }}
        transition={{ duration: 0.45, ease: "easeOut", delay }}
      />
    </div>,
    document.body
  );
}

export function AcnhSmokeBurst() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  
  if (!mounted || typeof document === 'undefined') return null;

  // Explosive outward eruption of smoke clouds in all directions
  const numPuffs = 10;
  const smokePuffs = [...Array(numPuffs)].map((_, i) => {
    // 360 degree distribution
    const angle = (i * (Math.PI * 2)) / numPuffs + (i % 2 === 0 ? 0.2 : -0.2);
    // Large outward range: 140px to 280px radius
    const dist = 140 + (i % 3) * 60 + (i % 2) * 20; 
    // Varied sizes for the plane-style smoke balls
    const size = 110 + (i % 2) * 50 + (i % 3) * 30;
    // Fast appearance, almost simultaneous but slightly organic
    const delay = (i % 3) * 0.04;
    return { angle, dist, size, delay };
  });

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      {smokePuffs.map((puff, i) => (
        <motion.div
          key={`close-smoke-${i}`}
          className="absolute bg-[#FDFCF8] shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={{
            width: puff.size,
            height: puff.size * 0.85,
            borderRadius: `${40 + (i % 3)*10}% ${60 - (i % 2)*10}% ${50 + (i % 2)*20}% ${50 - (i % 3)*10}% / ${50 + (i % 2)*10}% ${50 - (i % 2)*10}% ${60 - (i % 3)*10}% ${40 + (i % 3)*10}%`
          }}
          initial={{ scale: 0, opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            scale: [0, 1.2, 1.6],
            opacity: [1, 1, 0],
            // Explode outwards, then drift out a little more
            x: [
              0, 
              Math.cos(puff.angle) * puff.dist, 
              Math.cos(puff.angle) * (puff.dist + 40)
            ],
            // Explode outwards, then drift out and slightly upward
            y: [
              0, 
              Math.sin(puff.angle) * puff.dist, 
              Math.sin(puff.angle) * (puff.dist + 40) - 30
            ],
            rotate: [0, i % 2 === 0 ? 45 : -45, i % 2 === 0 ? 90 : -90]
          }}
          transition={{ 
            duration: 0.65, 
            ease: "easeOut", 
            delay: puff.delay,
            // 40% of duration for explosive burst outward, then 60% for drift & fade
            times: [0, 0.4, 1] 
          }}
        />
      ))}
      {/* Central burst to connect the smoke ring visually initially */}
      <motion.div
        className="absolute bg-[#FDFCF8] rounded-full"
        initial={{ scale: 0, opacity: 1, width: 250, height: 250 }}
        animate={{ scale: [0, 1.4, 1.8], opacity: [1, 1, 0] }}
        transition={{ duration: 0.5, ease: "easeOut", times: [0, 0.3, 1] }}
      />
    </div>,
    document.body
  );
}
