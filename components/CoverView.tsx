'use client';

import { motion } from 'motion/react';
import { Plane } from 'lucide-react';
import { useState } from 'react';
import TitleBlock from './TitleBlock';

export default function CoverView({ onNext }: { onNext: () => void }) {
  const [isTakingOff, setIsTakingOff] = useState(false);

  const handleClick = () => {
    setIsTakingOff(true);
    setTimeout(() => {
      onNext();
    }, 800);
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#1A1A1A]"
      style={{
        backgroundImage: "url('/封面.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      // Cover page enters fading in and scaling up.
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="z-10 flex flex-col items-center"
        animate={isTakingOff ? { y: -20, opacity: 0 } : { y: [0, -8, 0], opacity: 1 }}
        transition={isTakingOff ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <TitleBlock />

        <div className="h-10" />
      </motion.div>

      <div className="z-10 h-24 flex items-center justify-center relative">
        <motion.div
          initial={{ y: 0, scale: 1 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={handleClick}
            className={`group flex items-center gap-3 px-10 py-5 rounded-full font-black text-2xl transition-all duration-300 ease-out
              ${isTakingOff
                ? 'bg-transparent text-transparent shadow-none pointer-events-none'
                : 'bg-[#F9F8F2] text-[#544439] shadow-[0_6px_0_#C6B9AD,0_15px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_10px_0_#C6B9AD,0_20px_25px_rgba(0,0,0,0.2)] active:translate-y-[6px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]'}
            `}
          >
            <motion.div
              animate={isTakingOff ? { scale: 5, rotate: 45, x: 'calc(-50vw + 158px)', color: '#FFFFFF' } : { rotate: 0, scale: 1, x: 0, color: 'currentColor' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex items-center justify-center relative z-20"
            >
              <Plane size={32} strokeWidth={2.5} className={isTakingOff ? 'drop-shadow-lg' : ''} />
            </motion.div>
            <span className={`font-name tracking-widest transition-opacity duration-500 ${isTakingOff ? 'opacity-0' : 'opacity-100'}`}>办理登岛手续</span>
          </button>
        </motion.div>
      </div>

    </motion.div>
  );
}
