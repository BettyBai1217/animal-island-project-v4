'use client';

import { motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';

export function ImpactWrapper({ 
  children, 
  trigger, 
  delay = 0, 
  magnitude = 1,
  className = "" 
}: { 
  children: React.ReactNode, 
  trigger: number, 
  delay?: number, 
  magnitude?: number,
  className?: string
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger > 0) {
      controls.start({
        y: [20 * magnitude, -5 * magnitude, 0],
        scaleY: [0.95, 1.05, 1],
        transition: { 
          duration: 0.25, 
          delay: delay, 
          ease: "easeOut" 
        }
      });
    }
  }, [trigger, controls, delay, magnitude]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
}