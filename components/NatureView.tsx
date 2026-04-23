'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Sun, Moon, MapPin, X, Plane } from 'lucide-react';
import CloudBubble from './CloudBubble';
import { AcnhStarsBurst, AcnhSmokeBurst } from './Effects';
import { ImpactWrapper } from './ImpactWrapper';
import bugsData from '@/data/bugs.json';
import fishData from '@/data/fish.json';
import seaData from '@/data/sea.json';

type Hemisphere = 'northern' | 'southern';

interface SourceCreature {
  id: number;
  'file-name': string;
  name: { 'name-CNzh': string };
  image_uri: string;
  'catch-phrase': string;
  availability: {
    'month-array-northern': number[];
    'month-array-southern': number[];
    'time-array': number[];
    location?: string;
  };
}

interface Creature {
  id: string;
  name_CNzh: string;
  image_uri: string;
  catch_phrase: string;
  'month-array-northern': number[];
  'month-array-southern': number[];
  'time-array': number[];
  location?: string;
  type: 'bug' | 'fish' | 'sea';
  fileName: string;
}

// Map data into uniform structure
const allCreatures: Creature[] = [
  ...(bugsData as SourceCreature[]).map((b) => ({
    id: `bug-${b.id}`,
    name_CNzh: b.name['name-CNzh'],
    image_uri: b.image_uri,
    catch_phrase: b['catch-phrase'],
    'month-array-northern': b.availability['month-array-northern'],
    'month-array-southern': b.availability['month-array-southern'],
    'time-array': b.availability['time-array'],
    location: b.availability.location,
    type: 'bug' as const,
    fileName: b['file-name']
  })),
  ...(fishData as SourceCreature[]).map((f) => ({
    id: `fish-${f.id}`,
    name_CNzh: f.name['name-CNzh'],
    image_uri: f.image_uri,
    catch_phrase: f['catch-phrase'],
    'month-array-northern': f.availability['month-array-northern'],
    'month-array-southern': f.availability['month-array-southern'],
    'time-array': f.availability['time-array'],
    location: f.availability.location,
    type: 'fish' as const,
    fileName: f['file-name']
  })),
  ...(seaData as SourceCreature[]).map((s) => ({
    id: `sea-${s.id}`,
    name_CNzh: s.name['name-CNzh'],
    image_uri: s.image_uri,
    catch_phrase: s['catch-phrase'],
    'month-array-northern': s.availability['month-array-northern'],
    'month-array-southern': s.availability['month-array-southern'],
    'time-array': s.availability['time-array'],
    location: s.availability.location,
    type: 'sea' as const,
    fileName: s['file-name']
  }))
];

function creatureFolder(type: Creature['type']) {
  // public/icons uses plural "bugs", but Creature.type is singular "bug"
  if (type === 'bug') return 'bugs';
  return type;
}

function getLocalIconUri(type: Creature['type'], fileName: string) {
  return `/icons/${creatureFolder(type)}/${fileName}.png`;
}

function getLocalImageUri(type: Creature['type'], fileName: string) {
  return `/images/${creatureFolder(type)}/${fileName}.png`;
}

function getRemoteFallbackUri(creature: Creature) {
  // If you want to be fully offline, you can remove this and use a local placeholder instead.
  return creature.image_uri;
}

// Pre-define hardcoded grass clusters to avoid hydration mismatches
// Each cluster has 1-6 triangular blades, rotated randomly, grouped naturally yet not touching, with random positions.
const GRASS_CLUSTERS = [
  { cx: 40, cy: 40, blades: [ { dx: 0, dy: 0, rot: 15, s: 1.0, op: 0.7 }, { dx: 16, dy: -8, rot: -25, s: 0.8, op: 0.6 }, { dx: -12, dy: 14, rot: 42, s: 0.9, op: 0.5 } ] },
  { cx: 160, cy: 30, blades: [ { dx: 0, dy: 0, rot: -10, s: 1.1, op: 0.75 } ] },
  { cx: 280, cy: 60, blades: [ { dx: 0, dy: 0, rot: 5, s: 1.0, op: 0.65 }, { dx: -15, dy: -10, rot: 35, s: 0.9, op: 0.55 }, { dx: 18, dy: -5, rot: -40, s: 0.85, op: 0.6 }, { dx: 5, dy: 18, rot: 20, s: 0.75, op: 0.8 }, { dx: -18, dy: 15, rot: -15, s: 0.95, op: 0.5 } ] },
  { cx: 30, cy: 140, blades: [ { dx: 0, dy: 0, rot: 60, s: 0.85, op: 0.6 }, { dx: 16, dy: 12, rot: -5, s: 1.0, op: 0.7 } ] },
  { cx: 150, cy: 150, blades: [ { dx: -10, dy: -12, rot: 25, s: 1.0, op: 0.65 }, { dx: 12, dy: -15, rot: -30, s: 0.9, op: 0.75 }, { dx: 15, dy: 10, rot: 10, s: 1.1, op: 0.55 }, { dx: -14, dy: 12, rot: -45, s: 0.8, op: 0.6 }, { dx: 0, dy: 22, rot: 0, s: 0.85, op: 0.8 }, { dx: 25, dy: 0, rot: 55, s: 0.9, op: 0.5 } ] },
  { cx: 280, cy: 150, blades: [ { dx: 0, dy: 0, rot: -18, s: 0.95, op: 0.7 }, { dx: -15, dy: 15, rot: 12, s: 1.0, op: 0.6 } ] },
  { cx: 80, cy: 250, blades: [ { dx: 0, dy: 0, rot: 45, s: 0.9, op: 0.5 }, { dx: 18, dy: -5, rot: -20, s: 1.0, op: 0.7 }, { dx: -10, dy: -18, rot: 15, s: 0.8, op: 0.6 }, { dx: -15, dy: 12, rot: -60, s: 0.85, op: 0.65 } ] },
  { cx: 190, cy: 260, blades: [ { dx: 0, dy: 0, rot: -5, s: 1.0, op: 0.7 }, { dx: -20, dy: -5, rot: 30, s: 0.85, op: 0.6 }, { dx: 15, dy: 15, rot: -25, s: 0.95, op: 0.75 } ] },
  { cx: 290, cy: 250, blades: [ { dx: 0, dy: 0, rot: 8, s: 1.1, op: 0.6 } ] },
  { cx: 110, cy: 90, blades: [ { dx: 0, dy: 0, rot: 33, s: 0.9, op: 0.7 }, { dx: -15, dy: 12, rot: -12, s: 0.8, op: 0.5 } ] },
  { cx: 220, cy: 100, blades: [ { dx: 0, dy: 0, rot: -42, s: 1.0, op: 0.65 }, { dx: 14, dy: 14, rot: 25, s: 0.85, op: 0.55 } ] },
  { cx: 120, cy: 210, blades: [ { dx: 0, dy: 0, rot: 55, s: 0.8, op: 0.7 } ] },
  { cx: 240, cy: 200, blades: [ { dx: 0, dy: 0, rot: -20, s: 0.9, op: 0.6 }, { dx: 15, dy: -15, rot: 40, s: 1.0, op: 0.75 }, { dx: -12, dy: -10, rot: -60, s: 0.85, op: 0.65 } ] }
];

export default function NatureView({
  onGoToNeighbors,
  impactTrigger = 0,
  currentTime,
  setCurrentTime,
  month,
  setMonth
}: {
  onGoToNeighbors: () => void;
  impactTrigger?: number;
  currentTime: number;
  setCurrentTime: (h: number) => void;
  month: number;
  setMonth: (m: number) => void;
}) {
  const [hemisphere, setHemisphere] = useState<Hemisphere>('northern');
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [isRevealing, setIsRevealing] = useState(true);
  
  const triggerSmoke = () => {
    setShowSmoke(true);
    setTimeout(() => setShowSmoke(false), 800);
  };

  const triggerStars = () => {
    setShowStars(true);
    setTimeout(() => setShowStars(false), 800);
  };

  const isNight = currentTime >= 18 || currentTime < 6;

  // Derive available creatures
  const visibleCreatures = useMemo(() => {
    return allCreatures.filter(c => {
      const monthArray = c[`month-array-${hemisphere}`];
      return monthArray.includes(month) && c['time-array'].includes(currentTime);
    });
  }, [hemisphere, month, currentTime]);

  const skyBugs = visibleCreatures.filter(c => c.type === 'bug' && c.location?.includes('Flying'));
  const grassBugs = visibleCreatures.filter(c => c.type === 'bug' && !c.location?.includes('Flying'));
  const riverFish = visibleCreatures.filter(c => c.type === 'fish');
  const oceanCreatures = visibleCreatures.filter(c => c.type === 'sea');

  const handleSyncReality = () => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setCurrentTime(now.getHours());
  };

  return (
    <div className="w-full h-full relative font-name overflow-hidden pointer-events-auto bg-[#1A1A1A]">
      
      {/* Shared Space Plane Transition */}
      {isRevealing && (
        <motion.div
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: [0, '150vw'], y: [0, -150, -50, -100, -80], scale: [1, 6, 8, 8, 8] }}
          transition={{ 
            x: { duration: 3.5, ease: [0.45, 0, 0.55, 1] },
            y: { duration: 3.5, ease: 'easeInOut' },
            scale: { duration: 3.5, ease: [0.33, 1, 0.68, 1] }
          }}
          className="absolute z-[100] flex items-center justify-center drop-shadow-[0_20px_40px_rgba(255,255,255,0.6)] pointer-events-none"
          style={{ left: '80px', top: 'calc(50% + 110px)', marginLeft: '-80px', marginTop: '-80px' }}
          onAnimationComplete={() => setIsRevealing(false)}
        >
          <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
               initial={{ opacity: 1, rotate: 45, scale: 5 }}
               animate={{ opacity: 0, rotate: 45, scale: 5 }}
               transition={{ duration: 1.5, ease: 'easeInOut' }}
               className="absolute inset-0 flex items-center justify-center text-[#FFFFFF]"
            >
              <Plane size={32} strokeWidth={2.5} />
            </motion.div>
            <motion.div
               initial={{ opacity: 0, rotate: 45, scale: 5 }}
               animate={{ opacity: 1, rotate: 45, scale: 5 }}
               transition={{ duration: 1.5, ease: 'easeInOut' }}
               className="absolute inset-0 flex items-center justify-center text-[#FFFFFF]"
            >
              <Plane size={32} strokeWidth={2.5} fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* The Masked Scene Container */}
      <motion.div 
        initial={{ clipPath: 'inset(0 100% 0 0)', filter: 'blur(10px)', x: -30 }}
        animate={{ clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', x: 0 }}
        transition={{ duration: 3.5, ease: [0.45, 0, 0.55, 1] }}
        className={`w-full h-full absolute inset-0 flex flex-col bg-[#a5d6f2] z-50 ${isRevealing ? 'pointer-events-none' : ''}`}
      >
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <polygon id="grass-blade" points="-4,-3.5 4,-3.5 0,3.5" fill="#F0FFF0" />
          <pattern id="grass-v" width="320" height="320" patternUnits="userSpaceOnUse">
            {GRASS_CLUSTERS.map((cluster, cIdx) => (
              <g key={`cluster-${cIdx}`} transform={`translate(${cluster.cx}, ${cluster.cy})`}>
                {cluster.blades.map((b, bIdx) => (
                  <use 
                    key={`blade-${cIdx}-${bIdx}`} 
                    href="#grass-blade" 
                    transform={`translate(${b.dx}, ${b.dy}) rotate(${b.rot}) scale(${b.s})`} 
                    opacity={b.op} 
                  />
                ))}
              </g>
            ))}
          </pattern>
          <pattern id="river-m" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path d="M 5 15 L 9 10 L 13 15 L 17 11 L 21 15 Z" fill="#64C6D5" />
            <path d="M 25 8 L 29 3 L 33 8 L 37 4 L 41 8 Z" fill="#64C6D5" opacity="0.7"/>
          </pattern>
          <pattern id="ocean-m" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M 10 20 L 15 14 L 20 20 L 25 15 L 30 20 Z" fill="#4FB3CD" />
            <path d="M 40 10 L 45 4 L 50 10 L 55 5 L 60 10 Z" fill="#4FB3CD" opacity="0.7" />
          </pattern>
        </defs>
      </svg>

      {/* Night Overlay Container */}
      <div 
        className="absolute inset-0 z-[60] pointer-events-none transition-colors duration-1000"
        style={{
          backgroundColor: isNight ? 'rgba(25, 25, 112, 0.45)' : 'transparent',
          mixBlendMode: 'multiply'
        }}
      />
      {isNight && (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen pointer-events-none z-[60]" />
      )}

      {/* Layer 1: Sky (Top 25%) */}
      <div className="relative h-[25%] w-full z-10 bg-[#a5d6f2] overflow-hidden pointer-events-auto">
        {/* Cloud 1: Small, Left-most, slightly lower */}
        <motion.svg 
            viewBox="0 0 120 60" 
            className="absolute top-[45%] left-[-2%] w-28 h-14 md:w-32 md:h-16 pointer-events-none z-0"
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
           <ellipse cx="45" cy="38" rx="35" ry="18" fill="#DAEEF2" />
           <ellipse cx="85" cy="38" rx="28" ry="15" fill="#DAEEF2" />
           <ellipse cx="65" cy="28" rx="25" ry="20" fill="#DAEEF2" />
        </motion.svg>

        {/* Cloud 2: Small, beside it, slightly higher */}
        <motion.svg 
            viewBox="0 0 140 70" 
            className="absolute top-[18%] left-[18%] md:left-[15%] w-32 h-16 md:w-40 md:h-20 pointer-events-none z-0"
            animate={{ x: [0, -12, 0] }}
            transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
           <ellipse cx="50" cy="42" rx="40" ry="20" fill="#DAEEF2" />
           <ellipse cx="100" cy="45" rx="32" ry="18" fill="#DAEEF2" />
           <ellipse cx="78" cy="30" rx="32" ry="22" fill="#DAEEF2" />
        </motion.svg>

        {/* Cloud 3: Right edge, large, elongated */}
        <motion.svg 
            viewBox="0 0 300 100" 
            className="absolute top-[25%] -right-[15%] md:-right-[10%] w-60 h-20 md:w-80 md:h-28 pointer-events-none z-0"
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
           <ellipse cx="95" cy="60" rx="80" ry="30" fill="#DAEEF2" />
           <ellipse cx="215" cy="62" rx="70" ry="28" fill="#DAEEF2" />
           <ellipse cx="155" cy="45" rx="60" ry="38" fill="#DAEEF2" />
        </motion.svg>

        {/* Cloud 4: Bottom center, medium, bubble-shaped */}
        <div className="absolute bottom-[5%] left-[40%] md:left-[45%]">
          <motion.svg 
              viewBox="0 0 200 90" 
              className="w-48 h-20 md:w-56 md:h-24 pointer-events-none z-0"
              animate={{ x: [0, 18, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          >
             <ellipse cx="65" cy="58" rx="50" ry="25" fill="#DAEEF2" />
             <ellipse cx="145" cy="60" rx="45" ry="22" fill="#DAEEF2" />
             <ellipse cx="105" cy="38" rx="50" ry="32" fill="#DAEEF2" />
          </motion.svg>
        </div>

        <div className="absolute inset-0 z-[120] pointer-events-auto">
          <CreatureZone
            creatures={isRevealing ? [] : skyBugs}
            onSelect={(c) => { triggerStars(); setSelectedCreature(c); }}
            isNight={isNight}
            padding="pt-10 md:pt-8 pb-0 px-24 md:px-64"
            layout="center"
          />
        </div>
      </div>

      {/* Layer 2: Grass (25%) */}
      <div className="relative h-[25%] w-full z-20 bg-[#90DB8B]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect width="100%" height="100%" fill="url(#grass-v)" />
        </svg>
        <CreatureZone creatures={isRevealing ? [] : grassBugs} onSelect={(c) => { triggerStars(); setSelectedCreature(c); }} isNight={isNight} padding="p-2 md:p-6 pt-4" />
      </div>

      {/* Layer 3: River (25%) */}
      <div className="relative h-[25%] w-full z-30 bg-[#8BDEE9]">
        {/* Wavy top line separating Grass and River (Low amplitude, long wavelength) */}
        <div className="absolute top-0 left-0 w-full h-[20px] -translate-y-full pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 20' preserveAspectRatio='none'%3E%3Cpath d='M0,20 Q40,10 80,15 T160,20 V20 H0 Z' fill='%238BDEE9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '160px 20px',
          backgroundPosition: 'bottom'
        }} />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect width="100%" height="100%" fill="url(#river-m)" />
        </svg>
        <CreatureZone creatures={isRevealing ? [] : riverFish} onSelect={(c) => { triggerStars(); setSelectedCreature(c); }} isNight={isNight} padding="p-2 md:p-6" />
      </div>

      {/* Layer 4: Ocean (25%) */}
      <div className="relative h-[25%] w-full z-40 bg-[#6FCAE1]">
        {/* Wavy top line separating River and Ocean (Higher amplitude, shorter wavelength) */}
        <div className="absolute top-0 left-0 w-full h-[20px] -translate-y-full pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 20' preserveAspectRatio='none'%3E%3Cpath d='M0,20 Q20,0 40,10 T80,20 V20 H0 Z' fill='%236FCAE1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '80px 20px',
          backgroundPosition: 'bottom'
        }} />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect width="100%" height="100%" fill="url(#ocean-m)" />
        </svg>
        <CreatureZone creatures={isRevealing ? [] : oceanCreatures} onSelect={(c) => { triggerStars(); setSelectedCreature(c); }} isNight={isNight} padding="p-2 md:p-6 pb-28 md:pb-32" />
      </div>
      </motion.div>

      {/* UI Controls Container */}
      <AnimatePresence>
        {!isRevealing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none z-[100] flex flex-col justify-between overflow-hidden"
          >
            {/* Controls Overlay */}
            <div className="flex justify-between items-start pt-6 px-6 relative z-[110] pointer-events-auto">
        <ImpactWrapper trigger={impactTrigger} delay={0.05} magnitude={1.4} className="flex flex-col gap-4 pointer-events-auto">
          {/* Hemisphere toggle */}
          <button 
            onClick={() => setHemisphere(h => h === 'northern' ? 'southern' : 'northern')}
            className="flex items-center gap-2 px-5 py-2 bg-[#F9F8F2] text-[#544439] rounded-full font-bold shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
          >
            <MapPin size={18} className="text-[#5DB1A7]" />
            {hemisphere === 'northern' ? '北半球' : '南半球'}
          </button>

          {/* Sync reality button */}
          <button 
            onClick={handleSyncReality}
            className="flex items-center gap-2 px-5 py-2 bg-[#F9F8F2] text-[#544439] rounded-full font-bold shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
          >
            <Leaf size={18} className="text-[#5DB1A7]" />
            同步现实
          </button>

          {/* To Neighbors page */}
          <button 
            onClick={onGoToNeighbors}
            className="flex items-center gap-2 px-5 py-2 mt-2 bg-[#F9F8F2] text-[#544439] rounded-full font-bold shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
          >
            去广场看看邻居
          </button>
        </ImpactWrapper>

        {/* Month selector */}
        <ImpactWrapper trigger={impactTrigger} delay={0.02} magnitude={1} className="pointer-events-auto w-[200px] md:w-[220px] bg-[#F9F7E8] rounded-[3rem] relative">
          <div className="p-4 md:p-5 grid grid-cols-3 gap-x-2 gap-y-2 relative z-10">
            {[...Array(12)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setMonth(i + 1)}
                className={`w-8 h-8 md:w-9 md:h-9 text-xs mx-auto rounded-full flex items-center justify-center font-bold transition-all duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[0_4px_0_#C6B9AD] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD] relative z-10 ${
                  month === i + 1 
                    ? 'bg-[#5DB1A7] text-[#F9F8F2] translate-y-[2px] shadow-[0_2px_0_#498F86] hover:translate-y-[2px] hover:shadow-[0_2px_0_#498F86]' 
                    : 'bg-[#F9F8F2] text-[#544439] shadow-[0_4px_0_#C6B9AD]'
                }`}
              >
                {i + 1}月
              </button>
            ))}
          </div>
        </ImpactWrapper>
      </div>

      {/* Modern Minimalist ACNH Time Slider Overlay */}
      <ImpactWrapper trigger={impactTrigger} delay={0.08} magnitude={1.4} className="pointer-events-auto absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[70] flex flex-col items-center">
        {/* Minimalist dashed track */}
        <div className="relative w-full h-[10px] bg-black/10 rounded-full border border-white/30 backdrop-blur-sm shadow-inner group mt-8">
          <input 
            title="Time Slider"
            type="range" 
            min="0" 
            max="23" 
            value={currentTime}
            onChange={(e) => setCurrentTime(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-[20px] -top-[5px] opacity-0 cursor-pointer z-30"
          />
          {/* Active track fill */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-[#5DB1A7] rounded-full pointer-events-none z-0" 
            style={{ width: `${((currentTime) / 23) * 100}%` }}
          />
          {/* Dotted scale markers */}
          <div className="absolute inset-0 w-full h-full flex justify-between px-[3px] items-center pointer-events-none z-10">
             {[...Array(24)].map((_, i) => (
                <div key={i} className={`w-[2px] h-[4px] rounded-full ${i <= currentTime ? 'bg-white/80' : 'bg-white/40'}`} />
             ))}
          </div>
          
          {/* Custom thumb tracking */}
          <div 
            className="absolute -top-[5px] transition-none flex flex-col items-center pointer-events-none z-20"
            style={{ 
              left: `calc(${((currentTime) / 23) * 100}% - 24px)`,
              width: '48px'
            }}
          >
             <span className="absolute -top-7 font-black text-[#544439] text-[13px] bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/50 tracking-wide leading-none">
               {currentTime}:00
             </span>
             <div className="w-5 h-5 bg-[#F9F8F2] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1),0_2px_0_#C6B9AD] border-2 border-white flex items-center justify-center pointer-events-auto" />
          </div>
        </div>
      </ImpactWrapper>
      </motion.div>
      )}
      </AnimatePresence>

      {/* Dialog */}
      <AnimatePresence mode="wait">
        {selectedCreature && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { triggerSmoke(); setSelectedCreature(null); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
              className="w-[90%] max-w-2xl relative z-10 bg-[#F9F7E8] rounded-[3rem]"
            >
              <div className="w-full h-full p-10 md:p-12 flex flex-col md:flex-row gap-6 md:gap-8 items-center relative z-10">
                <button 
                  onClick={() => { triggerSmoke(); setSelectedCreature(null); }}
                  className="absolute top-6 right-8 md:right-10 w-10 h-10 bg-[#F9F8F2] text-[#544439] rounded-full flex items-center justify-center font-black shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_6px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)] z-20"
                >
                  <X size={20} className="stroke-[3]" />
                </button>

                <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-[2rem] bg-white border-4 border-[#e6e2cd] shadow-inner overflow-hidden flex flex-col items-center justify-center relative">
                   <CreatureImage key={`dialog-${selectedCreature.id}-${selectedCreature.fileName}`} creature={selectedCreature} />
                   <div className="absolute bottom-0 w-full bg-[#8A7E66] text-white text-center py-2 font-bold text-lg z-10 font-name">
                      {selectedCreature.name_CNzh}
                   </div>
                </div>

                <div className="flex-1 w-full md:w-auto min-h-[160px] flex items-center justify-center relative px-8 py-10 md:py-12 mt-4 md:mt-0">
                  <motion.div 
                    animate={{
                      borderRadius: [
                         "61% 39% 70% 30% / 37% 65% 35% 63%",
                         "43% 57% 33% 67% / 65% 34% 66% 35%",
                         "74% 26% 59% 41% / 54% 43% 57% 46%",
                         "61% 39% 70% 30% / 37% 65% 35% 63%"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#f9db91] z-0 pointer-events-none"
                  />
                  <h3 className="text-xl md:text-2xl font-black text-[#5e411b] leading-relaxed relative z-10 font-name text-center max-w-[85%]">
                    {selectedCreature.catch_phrase}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showSmoke && <AcnhSmokeBurst />}
      {showStars && <AcnhStarsBurst />}

    </div>
  );
}

import Image from 'next/image';

function CreatureImage({ creature }: { creature: Creature }) {
  const [src, setSrc] = useState(getLocalIconUri(creature.type, creature.fileName));
  const [fallbackStage, setFallbackStage] = useState<'icon' | 'image' | 'remote'>('icon');

  return (
    <Image
      src={src}
      alt={creature.name_CNzh}
      fill
      referrerPolicy="no-referrer"
      className="object-cover"
      onError={() => {
        if (fallbackStage === 'icon') {
          setFallbackStage('image');
          setSrc(getLocalImageUri(creature.type, creature.fileName));
          return;
        }
        if (fallbackStage === 'image') {
          setFallbackStage('remote');
          setSrc(getRemoteFallbackUri(creature));
        }
      }}
    />
  );
}

function CreatureZone({ 
  creatures, 
  onSelect, 
  isNight,
  padding,
  layout = 'spread'
}: { 
  creatures: Creature[], 
  onSelect: (c: Creature) => void,
  isNight: boolean,
  padding: string,
  layout?: 'spread' | 'center'
}) {
  return (
    <div
      className={[
        'w-full h-full relative z-10 pointer-events-auto',
        'flex flex-wrap gap-6 items-center',
        layout === 'center' ? 'justify-center' : 'justify-around',
        padding
      ].join(' ')}
    >
      <AnimatePresence>
        {creatures.map((c) => (
          <motion.div
            key={c.id}
            layoutId={c.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ y: -10, scale: 1.1 }}
            onClick={() => onSelect(c)}
            className="relative cursor-pointer group"
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 shadow-lg transition-colors relative ${isNight ? 'border-white shadow-white/50' : 'border-black/10'}`}>
              <CreatureImage key={`${c.id}-${c.image_uri}`} creature={c} />
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#F9F7E8] border-[3px] border-[#5DB1A7] text-[#8A7E66] font-bold px-3 py-1 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20 font-name">
              {c.name_CNzh}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#F9F7E8] border-b-[3px] border-r-[3px] border-[#5DB1A7] rotate-45" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
