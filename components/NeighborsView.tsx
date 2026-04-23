'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Leaf, Clock, Sun, Moon, Mailbox, BadgeCheck } from 'lucide-react';
import CloudBubble from './CloudBubble';
import { AcnhStarsBurst, AcnhSmokeBurst } from './Effects';
import { ImpactWrapper } from './ImpactWrapper';

import villagersFullData from '@/data/villagers_24h_full.json';
import Image from 'next/image';

interface TimelineEvent {
  hour: number;
  text: string;
}

interface Villager {
  id: string;
  name: string;
  personality: string;
  hobby: string;
  birthday: string;
  catchphrase: string;
  color: string;
  imageUri: string;
  timeline: TimelineEvent[];
}

const PERSONALITIES = ['普通', '元气', '悠闲', '运动', '自恋', '成熟', '暴躁', '大姐姐'] as const;

type VillagerFull = {
  id: string;
  name_CN: string;
  personality: string;
  birthday: string;
  catch_phrase: string;
  hobby: string;
  daily_timeline: Record<string, string>;
};

function buildVillagerModel(src: VillagerFull, color: string): Villager {
  const timeline: TimelineEvent[] = [];
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, '0');
    const text = src?.daily_timeline?.[key];
    if (text) timeline.push({ hour: h, text });
  }
  return {
    id: src.id,
    name: src.name_CN,
    personality: src.personality,
    hobby: src.hobby,
    birthday: src.birthday,
    catchphrase: src.catch_phrase,
    color,
    imageUri: `/icons/villagers/${src.id}.png`,
    timeline
  };
}

function buildPersonalityVillagers(full: VillagerFull[]): Villager[] {
  const byPersonality = new Map<string, VillagerFull>();
  for (const v of full) {
    if (!byPersonality.has(v.personality)) byPersonality.set(v.personality, v);
  }

  const palette = ['#5DB1A7', '#d95757', '#8b5a2b', '#2a4365', '#90DB8B', '#F9DB91', '#8c6281', '#64C6D5'];

  return PERSONALITIES.map((p, idx) => {
    const src = byPersonality.get(p) || {
      id: `missing-${p}`,
      name_CN: p,
      personality: p,
      birthday: '',
      catch_phrase: '',
      hobby: '',
      daily_timeline: {}
    };
    return buildVillagerModel(src, palette[idx % palette.length]);
  });
}

const hourlyAtmosphere = [
  { bg: '#101626', nightOp: 1, dayOp: 0 },    // 0:00 Deep night
  { bg: '#131a2d', nightOp: 1, dayOp: 0 },    // 1:00
  { bg: '#161e33', nightOp: 1, dayOp: 0 },    // 2:00
  { bg: '#1a243d', nightOp: 1, dayOp: 0 },    // 3:00
  { bg: '#212c47', nightOp: 0.9, dayOp: 0 },  // 4:00 Before dawn
  { bg: '#353b59', nightOp: 0.7, dayOp: 0.2 },// 5:00 Dawn purple
  { bg: '#8f6a70', nightOp: 0.4, dayOp: 0.5 },// 6:00 Sunrise pinkish
  { bg: '#deba95', nightOp: 0.1, dayOp: 0.8 },// 7:00 Early morning golden
  { bg: '#f2e3c6', nightOp: 0, dayOp: 1 },    // 8:00
  { bg: '#f7f0d4', nightOp: 0, dayOp: 1 },    // 9:00
  { bg: '#f9f4df', nightOp: 0, dayOp: 1 },    // 10:00
  { bg: '#fbf8e9', nightOp: 0, dayOp: 1 },    // 11:00
  { bg: '#F9F7E8', nightOp: 0, dayOp: 1 },    // 12:00 Noon
  { bg: '#F9F7E8', nightOp: 0, dayOp: 1 },    // 13:00
  { bg: '#f7f5e3', nightOp: 0, dayOp: 1 },    // 14:00
  { bg: '#f5eed6', nightOp: 0, dayOp: 1 },    // 15:00
  { bg: '#f2e3ba', nightOp: 0, dayOp: 1 },    // 16:00 Early afternoon warm
  { bg: '#eac593', nightOp: 0.1, dayOp: 0.8 },// 17:00 Golden hour
  { bg: '#d98f77', nightOp: 0.4, dayOp: 0.5 },// 18:00 Sunset red/orange
  { bg: '#8c6281', nightOp: 0.7, dayOp: 0.2 },// 19:00 Dusk purple
  { bg: '#444366', nightOp: 0.9, dayOp: 0 },  // 20:00 Early night
  { bg: '#2e3557', nightOp: 1, dayOp: 0 },    // 21:00
  { bg: '#1f2b47', nightOp: 1, dayOp: 0 },    // 22:00
  { bg: '#162136', nightOp: 1, dayOp: 0 },    // 23:00
];

export default function NeighborsView({
  onGoToNature,
  onExit,
  impactTrigger = 0,
  currentTime,
  setCurrentTime
}: {
  onGoToNature: () => void;
  onExit: () => void;
  impactTrigger?: number;
  currentTime: number;
  setCurrentTime: (h: number) => void;
}) {
  const currentHour = currentTime;
  const setCurrentHour = setCurrentTime;
  const [selectedVillager, setSelectedVillager] = useState<Villager | null>(null);
  const [journalTransition, setJournalTransition] = useState<'from-plaza' | 'from-friend'>('from-plaza');
  const [exitMode, setExitMode] = useState<'none' | 'modal' | 'flying' | 'ended'>('none');
  const [showSmoke, setShowSmoke] = useState(false);

  const triggerSmoke = () => {
    setShowSmoke(true);
    setTimeout(() => setShowSmoke(false), 800);
  };

  const handleFlyToReality = () => {
    setExitMode('flying');
    setTimeout(() => {
      setExitMode('ended');
    }, 1200);
  };

  const isPM = currentHour >= 12;
  const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
  const isNight = currentHour >= 18 || currentHour < 6;
  const atmosphere = hourlyAtmosphere[currentHour] || hourlyAtmosphere[0];
  const allVillagers = useMemo(() => {
    const full = villagersFullData as VillagerFull[];
    const palette = ['#5DB1A7', '#d95757', '#8b5a2b', '#2a4365', '#90DB8B', '#F9DB91', '#8c6281', '#64C6D5'];
    return full.map((v, idx) => buildVillagerModel(v, palette[idx % palette.length]));
  }, []);

  const villagerByName = useMemo(() => {
    const m = new Map<string, Villager>();
    for (const v of allVillagers) m.set(v.name, v);
    return m;
  }, [allVillagers]);

  const plazaVillagers = useMemo(() => buildPersonalityVillagers(villagersFullData as VillagerFull[]), []);

  // Render the Plaza
  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backgroundColor: atmosphere.bg,
        transition: 'background-color 1s ease'
      }}
    >
      {/* Night Pattern Background (Stars) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: atmosphere.nightOp,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath transform='translate(40,50) scale(1.5) rotate(15 10 10)' fill-opacity='0.25' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(120,30) scale(0.8) rotate(-20 10 10)' fill-opacity='0.15' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(220,80) scale(1.2) rotate(45 10 10)' fill-opacity='0.3' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(70,150) scale(0.9) rotate(75 10 10)' fill-opacity='0.15' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(180,180) scale(1.6) rotate(-10 10 10)' fill-opacity='0.2' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(250,240) scale(0.7) rotate(30 10 10)' fill-opacity='0.1' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(30,250) scale(1.1) rotate(60 10 10)' fill-opacity='0.25' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(120,260) scale(1.3) rotate(-35 10 10)' fill-opacity='0.15' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(260,20) scale(1.0) rotate(5 10 10)' fill-opacity='0.2' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3Cpath transform='translate(140,120) scale(0.6) rotate(40 10 10)' fill-opacity='0.1' d='M10 0l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      {/* Morning/Day Pattern Background (Texture) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: atmosphere.dayOp,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.08'%3E%3Cpath d='M15 10 L25 25 L5 25 Z'/%3E%3Ccircle cx='32' cy='15' r='3'/%3E%3Cpath d='M55 50 L65 65 L45 65 Z'/%3E%3Ccircle cx='72' cy='55' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <ImpactWrapper trigger={impactTrigger} delay={0.05} magnitude={1.4} className="absolute top-6 left-6 z-20 flex flex-col gap-3">
        <button
          onClick={onGoToNature}
          className="flex items-center gap-2 px-5 py-3 h-12 bg-[#F9F8F2] text-[#544439] rounded-full font-bold shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
        >
          <Leaf size={20} strokeWidth={2.5} className="text-[#5DB1A7]" />
          亲近一下大自然
        </button>

        <button
          onClick={() => setCurrentHour(new Date().getHours())}
          className="flex items-center gap-2 px-5 py-3 h-12 bg-[#F9F8F2] text-[#544439] rounded-full font-bold shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
        >
          <Clock size={20} strokeWidth={2.5} className="text-[#5DB1A7]" />
          同步现实
        </button>
      </ImpactWrapper>

      <AnimatePresence mode="wait" custom={journalTransition}>
        {!selectedVillager ? (
          <PlazaView
            key="plaza"
            currentHour={currentHour}
            setCurrentHour={setCurrentHour}
            displayHour={displayHour}
            isPM={isPM}
            isNight={isNight}
            villagers={plazaVillagers}
            impactTrigger={impactTrigger}
            onSelect={(v) => {
              setJournalTransition('from-plaza');
              setSelectedVillager(v);
            }}
          />
        ) : (
          <JournalView
            key={`journal-${selectedVillager.id}`}
            villager={selectedVillager}
            friendLookup={villagerByName}
            transitionType={journalTransition}
            onClose={() => {
              triggerSmoke();
              setSelectedVillager(null);
            }}
            onSelectFriend={(friendName) => {
              const friend = villagerByName.get(friendName);
              if (!friend) return;
              triggerSmoke();
              setTimeout(() => {
                setJournalTransition('from-friend');
                setSelectedVillager(friend);
              }, 350);
            }}
          />
        )}
      </AnimatePresence>

      {showSmoke && <AcnhSmokeBurst />}

      {/* Narrative Exit Flow */}
      <ImpactWrapper trigger={impactTrigger} delay={0.1} magnitude={1.2} className="absolute bottom-6 right-6 z-40">
        <button
          onClick={() => setExitMode('modal')}
          className="flex items-center gap-3 bg-[#F9F8F2] text-[#544439] px-6 py-4 rounded-full font-bold text-xl shadow-[0_6px_0_#C6B9AD,0_15px_20px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_0_#C6B9AD,0_20px_25px_rgba(0,0,0,0.2)] active:translate-y-[6px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
        >
          <Mailbox size={28} strokeWidth={2.5} className="text-[#5DB1A7]" />
          <span className="font-name tracking-widest">飞回现实世界</span>
        </button>
      </ImpactWrapper>

      <AnimatePresence>
        {(exitMode === 'modal' || exitMode === 'flying') && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
          >
            <motion.div
              className="relative bg-[#F9F7E8] w-[90%] max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex flex-col p-10 overflow-hidden rounded-[1rem] border-8 border-white"
              initial={{ y: '100%', rotate: -5, opacity: 0 }}
              animate={
                exitMode === 'flying'
                  ? { x: '100vw', y: '-100vh', rotate: 45, scale: 0.2, opacity: 0, transition: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] } }
                  : { y: 0, rotate: -2, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
              }
            >
              {/* Fake jagged edge with repeating dots on sides */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-[radial-gradient(circle_at_left,#F9F7E8_4px,transparent_5px)] bg-[length:10px_10px]" style={{ mixBlendMode: 'screen' }} />

              <div className="flex justify-between items-start mt-2 mb-8 border-b-[4px] border-dashed border-[#e6e2cd] pb-6">
                <h2 className="text-4xl font-black text-[#8A7E66] font-name">特急联络单</h2>
                <div className="flex flex-col items-center rotate-12 opacity-90 ml-4">
                  <BadgeCheck size={56} className="text-[#d95757]" strokeWidth={2.5} />
                  <span className="text-[#d95757] font-black tracking-widest text-sm mt-1">APPROVED</span>
                </div>
              </div>

              <p className="text-2xl text-[#8A7E66] font-bold leading-relaxed mb-10 tracking-wide font-name">
                别忘了，当你感到孤单时，总有一座小岛在时间的另一端，陪你一起呼吸。
              </p>

              <button
                onClick={handleFlyToReality}
                className="self-center bg-[#F9F8F2] text-[#544439] px-10 py-5 rounded-full font-black text-2xl shadow-[0_6px_0_#C6B9AD,0_15px_20px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_0_#C6B9AD,0_20px_25px_rgba(0,0,0,0.2)] active:translate-y-[6px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
              >
                <span className="font-name tracking-widest">回到现实</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exitMode === 'ended' && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto bg-[#F6F2E5]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8, type: 'spring', bounce: 0.5 }}
            >
              <button
                onClick={() => onExit?.()}
                className="bg-[#F9F8F2] text-[#544439] px-12 py-6 rounded-full font-black text-3xl shadow-[0_8px_0_#C6B9AD,0_20px_30px_rgba(0,0,0,0.2)] transition-all duration-200 ease-out hover:-translate-y-2 hover:shadow-[0_12px_0_#C6B9AD,0_30px_40px_rgba(0,0,0,0.25)] active:translate-y-[8px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)] flex items-center gap-3"
              >
                <span className="font-name tracking-widest">回到昨天</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

function PlazaView({
  currentHour,
  setCurrentHour,
  displayHour,
  isPM,
  isNight,
  villagers,
  impactTrigger,
  onSelect
}: {
  currentHour: number;
  setCurrentHour: (h: number) => void;
  displayHour: number;
  isPM: boolean;
  isNight: boolean;
  villagers: Villager[];
  impactTrigger?: number;
  onSelect: (v: Villager) => void;
}) {

  // Distribute 8 villagers in a circle around the center
  const [radius, setRadius] = useState(160);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRadius(window.innerWidth > 768 ? 300 : 160);
    const handleResize = () => setRadius(window.innerWidth > 768 ? 300 : 160);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [unwrappedAngle, setUnwrappedAngle] = useState(() => {
    let h = currentHour;
    if (h === 0) h = 24;
    return h * 30;
  });
  const latestAngleRef = useRef(unwrappedAngle);

  const prevHourRef = useRef(currentHour);
  useEffect(() => {
    if (prevHourRef.current !== currentHour) {
      prevHourRef.current = currentHour;
      let h = currentHour;
      if (h === 0) h = 24;
      // Avoid jumping if we're wrapping around naturally,
      // but if externally changed, sync the shortest path just to be safe
      const newAngle = h * 30;
      latestAngleRef.current = newAngle;
      setUnwrappedAngle(newAngle);
    }
  }, [currentHour]);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    let rawAngle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (rawAngle < 0) rawAngle += 360;

    const prev = latestAngleRef.current;
    let currentMod = prev % 360;
    if (currentMod < 0) currentMod += 360;

    let diff = rawAngle - currentMod;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const newUnwrapped = prev + diff;
    latestAngleRef.current = newUnwrapped;
    setUnwrappedAngle(newUnwrapped);

    let h = Math.round(newUnwrapped / 30);
    let wrappedH = h % 24;
    while (wrappedH <= 0) wrappedH += 24;

    let hourForApp = wrappedH === 24 ? 0 : wrappedH;
    if (hourForApp !== prevHourRef.current) {
      prevHourRef.current = hourForApp;
      setCurrentHour(hourForApp);
    }
  };

  const isAMMode = currentHour >= 1 && currentHour <= 12;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      {/* Central 12-hour Clock */}
      <ImpactWrapper trigger={impactTrigger || 0} delay={0.05} magnitude={1} className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#f4ebd0] border-[8px] md:border-[12px] border-[#8b5a2b] shadow-2xl flex items-center justify-center z-10 select-none">

        <div className="absolute -top-[95px] md:-top-[115px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 text-[#8A7E66] opacity-90 drop-shadow-sm transition-all duration-500">
          {isAMMode ? <Sun size={40} fill="currentColor" className="text-orange-400" /> : <Moon size={40} fill="currentColor" className="text-blue-400" />}
        </div>

        <div className="absolute -bottom-[95px] md:-bottom-[115px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 transition-all duration-500">
          <span className={`font-black text-sm md:text-base px-5 py-1.5 rounded-[1rem] shadow-sm tracking-widest border-2 ${isAMMode ? 'bg-[#f4ebd0] text-[#8b5a2b] border-[#8b5a2b]' : 'bg-[#2a4365] text-white border-[#f4ebd0]'}`}>
            {isAMMode ? 'AM' : 'PM'}
          </span>
        </div>

        {/* Outer Circle Numbers Using Trig */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(12)].map((_, i) => {
            const numPosition = i === 0 ? 12 : i;
            const displayNum = isAMMode ? numPosition : (i === 0 ? 0 : numPosition + 12);

            const deg = i * 30;
            const rad = deg * (Math.PI / 180);
            return (
              <div
                key={numPosition}
                className="absolute text-[#8b5a2b] font-black pointer-events-none drop-shadow-sm flex items-center justify-center w-12 h-12"
                style={{
                  left: `calc(50% + ${Math.sin(rad) * 65}%)`,
                  top: `calc(50% - ${Math.cos(rad) * 65}%)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={displayNum}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute text-2xl md:text-3xl"
                  >
                    {displayNum}
                  </motion.span>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-1 md:inset-2 bg-[#f4ebd0] rounded-full shadow-inner border-2 border-[#8b5a2b]/20" />

        <motion.div
          className="absolute bottom-1/2 left-1/2 w-3 md:w-4 h-[42%] bg-[#4a3014] rounded-full origin-bottom pointer-events-none z-10 shadow-md"
          style={{ x: '-50%' }}
          animate={{ rotate: unwrappedAngle }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#8b5a2b] rounded-full border-[3px] md:border-4 border-[#f4ebd0] z-20 pointer-events-none shadow-md" />

        <div
          className="absolute inset-0 z-30 cursor-pointer rounded-full touch-none"
          onPointerDown={handlePointer}
          onPointerMove={(e) => {
            if (e.buttons > 0) handlePointer(e);
          }}
        />
      </ImpactWrapper>

      {/* Villagers Circular Layout */}
      {villagers.map((villager, index) => {
        const angle = (index / villagers.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isLeft = index >= 4;

        // Find if this villager has an event at the current hour
        const event = villager.timeline.find(t => t.hour === currentHour);

        return (
          <div key={villager.id} className="absolute z-20" style={{ transform: `translate(${x}px, ${y}px)` }}>
            <ImpactWrapper trigger={impactTrigger || 0} delay={0.06 + (index * 0.015)} magnitude={1.3}>
              <motion.div
                layoutId={`villager-container-${villager.id}`}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => onSelect(villager)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Speech Bubble (if has event) */}
                <AnimatePresence>
                  {event && (
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? 10 : -10, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={`absolute top-[40px] md:top-[48px] -translate-y-1/2 pointer-events-none z-30 flex items-center ${isLeft ? 'right-full mr-3 md:mr-5 justify-end' : 'left-full ml-3 md:ml-5 justify-start'}`}
                    >
                      <motion.div
                        animate={{
                          borderRadius: [
                            "61% 39% 70% 30% / 37% 65% 35% 63%",
                            "43% 57% 33% 67% / 65% 34% 66% 35%",
                            "74% 26% 59% 41% / 54% 43% 57% 46%",
                            "61% 39% 70% 30% / 37% 65% 35% 63%"
                          ]
                        }}
                        transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
                        className="bg-[#FBF8EF] px-5 py-4 flex items-center justify-center relative min-w-[140px] max-w-[200px]"
                      >
                        <p className="text-[13px] md:text-sm font-bold text-[#544439] leading-relaxed font-name text-center relative z-10 w-full break-words">
                          {event.text}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  layoutId={`villager-image-${villager.id}`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-xl overflow-hidden relative flex items-center justify-center"
                  style={{ backgroundColor: villager.color }}
                >
                  <Image src={villager.imageUri} alt={villager.name} fill className="object-cover" />
                </motion.div>

                <motion.div layoutId={`villager-name-${villager.id}`} className="mt-2 bg-yellow-100/90 text-[#8A7E66] border-2 border-dashed border-[#d4bd8a] px-3 py-1 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap font-name">
                  {villager.name}
                </motion.div>
              </motion.div>
            </ImpactWrapper>
          </div>
        );
      })}
    </motion.div>
  );
}

const journalVariants: Variants = {
  initial: (type: 'from-plaza' | 'from-friend') => {
    if (type === 'from-friend') {
      return { scale: 0.4, opacity: 0, borderRadius: '50%' };
    }
    return { y: 200, scale: 0.7, opacity: 0, borderRadius: '60px' };
  },
  animate: (type: 'from-plaza' | 'from-friend') => {
    if (type === 'from-friend') {
      return {
        y: 0,
        scale: 1,
        opacity: 1,
        borderRadius: '0%',
        transition: { delay: 0.35, type: 'spring' as const, stiffness: 350, damping: 25, bounce: 0.4 }
      };
    }
    // For plaza we unify to spring as well
    return { y: 0, scale: 1, opacity: 1, borderRadius: '0%', transition: { type: 'spring' as const, stiffness: 300, damping: 25 } };
  },
  exit: (type: 'from-plaza' | 'from-friend') => {
    return { scale: 0.2, opacity: 0, borderRadius: '50%', transition: { duration: 0.2, ease: 'easeIn' } };
  }
};

function JournalView({
  villager,
  friendLookup,
  transitionType,
  onClose,
  onSelectFriend
}: {
  villager: Villager;
  friendLookup: Map<string, Villager>;
  transitionType: 'from-plaza' | 'from-friend';
  onClose: () => void;
  onSelectFriend: (friendName: string) => void;
}) {
  return (
    <motion.div
      custom={transitionType}
      variants={journalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 bg-[#f4ebd0] p-6 md:p-12 overflow-y-auto transform-gpu origin-center z-[50]"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l10 3.5-10 3.5zM40 20.5V18H20v-2h20v-2.5l-10 3.5 10 3.5z' fill='%23e6e3c9' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
    >
      <AcnhStarsBurst delay={transitionType === 'from-friend' ? 0.35 : 0} />
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white/50 relative mt-4 md:mt-8">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-30 w-12 h-12 bg-[#F9F8F2] text-[#544439] rounded-full flex items-center justify-center font-black text-xl shadow-[0_4px_0_#C6B9AD,0_8px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_0_#C6B9AD,0_12px_20px_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-[0_0px_0_#C6B9AD,0_0px_0_rgba(0,0,0,0)]"
        >
          B
        </button>

        {/* Profile Header */}
        <div className="relative pt-24 pb-12 px-8 flex flex-col md:flex-row items-center gap-8 border-b-4 border-dashed border-[#e6e2cd]" style={{ backgroundColor: `${villager.color}33` }}>
          <motion.div
            layoutId={`villager-image-${villager.id}`}
            className="w-40 h-40 shrink-0 rounded-full border-8 border-white shadow-xl overflow-hidden z-10 relative flex items-center justify-center"
            style={{ backgroundColor: villager.color }}
          >
            <Image src={villager.imageUri} alt={villager.name} fill className="object-cover" />
          </motion.div>

          <div className="flex-1 text-center md:text-left z-10">
            <motion.h2 layoutId={`villager-name-${villager.id}`} className="text-4xl font-black text-[#8A7E66] mb-2 font-name">{villager.name}</motion.h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge label="生日" value={villager.birthday} />
              <Badge label="性格" value={villager.personality} color={villager.color} />
              <Badge label="爱好" value={villager.hobby} />
              <Badge label="口头禅" value={`"${villager.catchphrase}"`} />
            </div>
          </div>

          {/* Decorative Pattern Background per personality */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `radial-gradient(${villager.color} 20%, transparent 20%)`,
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Timeline Body */}
        <div className="p-8 md:p-12 relative">
          <div className="absolute left-10 md:left-24 top-0 bottom-0 w-2 bg-[#e6e2cd] rounded-full" />

          <h3 className="text-2xl font-black text-[#8A7E66] mb-10 text-center relative z-10 font-name">24小时交织轨迹</h3>

          <div className="flex flex-col gap-12">
            {[...Array(24)].map((_, hour) => {
              const event = villager.timeline.find(t => t.hour === hour);
              if (!event) return null;

              return (
                <div key={hour} className="relative flex items-center gap-6 md:gap-12 pl-6 md:pl-20">
                  <div className="absolute left-[-5px] md:left-[51px] w-5 h-5 bg-white border-4 border-[#5DB1A7] rounded-full shadow-md z-10" />
                  <div className="w-16 text-right font-black text-xl text-[#8b5a2b]/40 shrink-0">
                    {hour}:00
                  </div>
                  <div className="flex-1 w-full bg-white rounded-[3rem]">
                    <div className="p-8 md:p-10">
                      <div className="text-[#544439] font-bold leading-relaxed text-lg">
                        {parseEventText(event.text, friendLookup, onSelectFriend)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center border-t-2 border-dashed border-[#e6e2cd] pt-12" />
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <span className="flex items-center text-sm font-bold border-2 border-[#e6e2cd] rounded-full overflow-hidden shadow-sm bg-white">
      <span className="bg-[#e6e2cd] text-[#8A7E66] px-3 py-1">{label}</span>
      <span className="px-3 py-1" style={{ color: color || '#8b5a2b' }}>{value}</span>
    </span>
  );
}

function parseEventText(text: string, friendLookup: Map<string, Villager>, onSelectFriend: (name: string) => void) {
  const regex = /【([^】]+)】/g;
  const parts: Array<{ type: 'text'; value: string } | { type: 'friend'; value: string }> = [];

  let lastIndex = 0;
  for (const match of text.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, idx) });
    parts.push({ type: 'friend', value: match[1] });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });

  return parts.map((p, i) => {
    if (p.type === 'friend') {
      const friend = friendLookup.get(p.value);
      return (
        <FriendMention
          key={`${p.value}-${i}`}
          friendName={p.value}
          friendIconSrc={friend?.imageUri}
          onSelect={() => onSelectFriend(p.value)}
        />
      );
    }
    return <span key={i}>{p.value}</span>;
  });
}

function FriendMention({
  friendName,
  friendIconSrc,
  onSelect
}: {
  friendName: string;
  friendIconSrc?: string;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block mx-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[200] pointer-events-none drop-shadow-lg"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#5DB1A7] relative flex items-center justify-center">
              {friendIconSrc ? (
                <Image src={friendIconSrc} alt={friendName} fill className="object-cover" />
              ) : (
                <span className="text-white font-black text-lg font-name">{friendName}</span>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
      <strong
        onClick={onSelect}
        title={`点击查看 ${friendName} 的轨迹`}
        className="text-[#5DB1A7] bg-[#5DB1A7]/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#5DB1A7]/20 hover:shadow-sm transition-all"
      >
        {friendName}
      </strong>
    </span>
  );
}
