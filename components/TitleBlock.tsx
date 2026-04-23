import { motion } from 'motion/react';

const blocks = [
  { text: '岛', bg: '#F26C4F', shadow: '#C94326', rotate: -2, radius: '22% 25% 20% 24% / 24% 20% 25% 22%' },
  { text: '上', bg: '#1BA191', shadow: '#106B60', rotate: 1, radius: '25% 22% 24% 20% / 20% 24% 22% 25%' },
  { text: '的', bg: '#EE3487', shadow: '#B3195C', rotate: -1, radius: '24% 20% 25% 22% / 22% 25% 20% 24%' },
  { text: '一', bg: '#00ACEE', shadow: '#007CA8', rotate: 3, radius: '20% 24% 22% 25% / 25% 22% 24% 20%' },
  { text: '天', bg: '#FFB700', shadow: '#BA8500', rotate: -2, radius: '23% 25% 21% 22% / 24% 21% 25% 23%' },
];

const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function TitleBlock() {
  return (
    <div className="flex flex-row items-center justify-center gap-3 md:gap-5 select-none mb-10 mt-8">
      {blocks.map((b, i) => (
        <motion.div
          key={i}
          initial={{ y: -60, opacity: 0, rotate: b.rotate - 15 }}
          animate={{ y: 0, opacity: 1, rotate: b.rotate }}
          transition={{
            type: 'spring',
            bounce: 0.5,
            duration: 0.8,
            delay: i * 0.1,
          }}
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: b.bg,
            borderRadius: b.radius,
            boxShadow: `0 5px 0 ${b.shadow}, 0 15px 20px 10px rgba(0,0,0,0.12)`,
            width: 'clamp(4rem, 14vw, 8rem)',
            height: 'clamp(4rem, 14vw, 8rem)',
          }}
        >
          {/* Texture Layer - Subtle grain/woven feel */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: paperTexture,
              opacity: 0.9
            }}
          />
          
          {/* Inner soft bevel/matte light reflection */}
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_4px_10px_rgba(255,255,255,0.15),inset_0_-4px_10px_rgba(0,0,0,0.05)] pointer-events-none" />

          {/* Text with Deep Top Shadow (Embossed inward look) */}
          <span 
            className="font-name font-black text-white relative z-10"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              textShadow: `0px -4px 0px ${b.shadow}`,
              lineHeight: 1
            }}
          >
            {b.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
