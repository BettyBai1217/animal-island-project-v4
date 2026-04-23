'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CoverView from '@/components/CoverView';
import NatureView from '@/components/NatureView';
import NeighborsView from '@/components/NeighborsView';

type ViewMode = 'cover' | 'drum';
export type DrumFace = 'nature' | 'neighbors';

function DrumContainer({ onExit }: { onExit: () => void }) {
  const [face, setFace] = useState<DrumFace>('nature');
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [impactTrigger, setImpactTrigger] = useState(0);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getHours());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  const handleSwitch = (targetFace: DrumFace) => {
    if (isRotating || targetFace === face) return;

    setIsRotating(true);
    setFace(targetFace);
    setRotation(r => r + 180);

    setTimeout(() => {
      setIsRotating(false);
      setImpactTrigger(prev => prev + 1);
    }, 280);
  };

  return (
    <div className="w-full h-full relative perspective-[1200px] overflow-hidden flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 preserve-3d" style={{ transform: 'translateZ(-50vh)', transformStyle: 'preserve-3d' }}>
        <motion.div
          className="w-full h-full preserve-3d origin-center"
          style={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{
            rotateX: rotation,
            y: isRotating ? 0 : [-5, 0],
            scaleY: isRotating ? [1, 1.15, 1] : 1
          }}
          transition={{
            rotateX: { duration: 0.3, ease: [0.19, 1, 0.22, 1] },
            y: { delay: 0.28, duration: 0.2, type: 'spring', stiffness: 500, damping: 15 },
            scaleY: { duration: 0.3, ease: [0.19, 1, 0.22, 1] }
          }}
        >
          {/* Nature Face: Angle 0 */}
          <div className="absolute inset-0" style={{ transform: 'rotateX(0deg) translateZ(50vh)', backfaceVisibility: 'hidden' }}>
            <motion.div
              className="w-full h-full"
              animate={{ filter: isRotating ? 'blur(4px)' : 'blur(0px)' }}
              transition={{ duration: 0.15 }}
            >
              <NatureView
                onGoToNeighbors={() => handleSwitch('neighbors')}
                impactTrigger={impactTrigger}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                month={month}
                setMonth={setMonth}
              />
            </motion.div>
          </div>

          {/* Neighbors Face: Angle 180 */}
          <div className="absolute inset-0" style={{ transform: 'rotateX(-180deg) translateZ(50vh) rotateZ(0deg)', backfaceVisibility: 'hidden' }}>
            <motion.div
              className="w-full h-full"
              animate={{ filter: isRotating ? 'blur(4px)' : 'blur(0px)' }}
              transition={{ duration: 0.15 }}
            >
              <NeighborsView
                onGoToNature={() => handleSwitch('nature')}
                impactTrigger={impactTrigger}
                onExit={onExit}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewMode>('cover');

  return (
    <main className="w-full h-screen overflow-hidden bg-[#1A1A1A] relative">
      <AnimatePresence mode="popLayout">
        {view === 'cover' && (
          <CoverView key="cover" onNext={() => setView('drum')} />
        )}
        {view === 'drum' && (
          <motion.div
            key="drum"
            className="w-full h-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
          >
            <DrumContainer onExit={() => setView('cover')} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
