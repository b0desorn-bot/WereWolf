export const TEAMS = {
  VILLAGERS: {
    id: 'villagers',
    name: 'ฝ่ายชาวบ้าน',
    color: 'from-blue-600 to-emerald-600',
    badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    description: 'กำจัดมนุษย์หมาป่าทั้งหมดเพื่อความสงบสุขของหมู่บ้าน'
  },
  WEREWOLVES: {
    id: 'werewolves',
    name: 'ฝ่ายมนุษย์หมาป่า',
    color: 'from-red-600 to-rose-900',
    badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
    description: 'กำจัดชาวบ้านจนมีจำนวนเท่ากับหรือมากกว่าฝ่ายชาวบ้าน'
  },
  NEUTRAL: {
    id: 'neutral',
    name: 'ฝ่ายเป็นกลาง',
    color: 'from-amber-600 to-yellow-700',
    badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    description: 'มีเงื่อนไขและเป้าหมายชัยชนะเฉพาะตัว'
  }
};

export const ROLES = {
  villager: {
    id: 'villager',
    name: 'ชาวบ้าน',
    team: 'villagers',
    weight: 1,
    emoji: '🧑‍🌾',
    icon: 'User',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'ชาวบ้านผู้บริสุทธิ์ ไม่มีพลังพิเศษ หลับใหลในยามค่ำคืน และร่วมสืบสวนหาตัวหมาป่าในยามกลางวัน',
    actionPrompt: 'คุณไม่มีพลังพิเศษในค่ำคืนนี้ จงนอนหลับให้สนิท',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/40',
      glow: 'shadow-emerald-500/20',
      accent: 'emerald'
    }
  },

  werewolf: {
    id: 'werewolf',
    name: 'มนุษย์หมาป่า',
    team: 'werewolves',
    weight: -6,
    emoji: '🐺',
    icon: 'Moon',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 40,
    description: 'ตื่นขึ้นมาพร้อมฝูงหมาป่าทุกคืน ปรึกษากันผ่านหน้าจอเพื่อเลือกสังหารเหยื่อ 1 คน',
    actionPrompt: 'ตื่นขึ้นมาร่วมกับฝูงหมาป่า และเลือกเหยื่อที่ต้องการสังหารในคืนนี้',
    scanResult: 'werewolves',
    colorTheme: {
      border: 'border-red-600/70',
      bg: 'bg-red-950/50',
      glow: 'shadow-red-600/30',
      accent: 'red'
    }
  },

  seer: {
    id: 'seer',
    name: 'ผู้หยั่งรู้',
    team: 'villagers',
    weight: 7,
    emoji: '🔮',
    icon: 'Eye',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 30,
    description: 'ในแต่ละคืน สามารถเลือกส่องดูผู้เล่น 1 คนเพื่อรู้ว่าคนนั้นเป็น "มนุษย์หมาป่า" หรือ "ไม่ใช่หมาป่า"',
    actionPrompt: 'เลือกผู้เล่น 1 คนที่คุณต้องการล่วงรู้ตัวตนที่แท้จริง',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-purple-500/70',
      bg: 'bg-purple-950/50',
      glow: 'shadow-purple-500/30',
      accent: 'purple'
    }
  },

  bodyguard: {
    id: 'bodyguard',
    name: 'บอดี้การ์ด',
    team: 'villagers',
    weight: 3,
    emoji: '🛡️',
    icon: 'Shield',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 50,
    description: 'เลือกปกป้องผู้เล่น 1 คนในแต่ละคืนจากการถูกหมาป่าสังหาร (ห้ามเลือกปกป้องคนเดิมซ้ำสองคืนติด)',
    actionPrompt: 'เลือกผู้เล่นที่คุณต้องการปกป้องในคืนนี้ (ห้ามเลือกคนเดิมซ้ำกับคืนที่แล้ว)',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-cyan-500/70',
      bg: 'bg-cyan-950/50',
      glow: 'shadow-cyan-500/30',
      accent: 'cyan'
    }
  },

  witch: {
    id: 'witch',
    name: 'แม่มด',
    team: 'villagers',
    weight: 4,
    emoji: '🧙‍♀️',
    icon: 'Sparkles',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 60,
    description: 'มียาวิเศษ 2 ขวด: "ยาชุบชีวิต" (ช่วยคนที่กำลังถูกหมาป่าฆ่า) และ "ยาพิษ" (สังหารใครก็ได้ 1 คน) แต่ละขวดใช้ได้เพียงครั้งเดียวในเกม',
    actionPrompt: 'คุณจะใช้ยาชุบชีวิตช่วยเหยื่อ หรือใช้ยาพิษปลิดชีพใครหรือไม่?',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-fuchsia-500/70',
      bg: 'bg-fuchsia-950/50',
      glow: 'shadow-fuchsia-500/30',
      accent: 'fuchsia'
    }
  },

  hunter: {
    id: 'hunter',
    name: 'นายพราน',
    team: 'villagers',
    weight: 3,
    emoji: '🏹',
    icon: 'Crosshair',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'เมื่อนายพรานตาย (ไม่ว่าจะถูกหมาป่าฆ่าหรือโดนโหวตแขวนคอ) จะสามารถยิงผู้เล่นอีกคนให้ตายตามได้ทันที',
    actionPrompt: 'หากคุณตาย คุณจะได้รับสิทธิ์เลือกลากผู้เล่นอีก 1 คนให้ตายตกตามกันทันที',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-amber-600/70',
      bg: 'bg-amber-950/50',
      glow: 'shadow-amber-500/30',
      accent: 'amber'
    }
  },

  cupid: {
    id: 'cupid',
    name: 'กามเทพ',
    team: 'villagers',
    weight: -2,
    emoji: '💘',
    icon: 'Heart',
    firstNightOnly: true,
    wakeUpEveryNight: false,
    nightOrder: 10,
    description: 'ในคืนแรก เลือกผู้เล่น 2 คนให้ผูกจิตเป็น "คู่รัก" หากคนใดคนหนึ่งตาย อีกคนจะตรอมใจตายตามทันที',
    actionPrompt: 'ในคืนแรกนี้ จงเลือกผู้เล่น 2 คนให้กลายเป็นคู่รักชะตากรรมเดียวกัน',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-pink-500/70',
      bg: 'bg-pink-950/50',
      glow: 'shadow-pink-500/30',
      accent: 'pink'
    }
  },

  mayor: {
    id: 'mayor',
    name: 'ผู้ใหญ่บ้าน',
    team: 'villagers',
    weight: 2,
    emoji: '🎖️',
    icon: 'Award',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'ผู้นำชุมชน เสียงโหวตตอนกลางวันมีค่าเท่ากับ 2 เสียง หากคะแนนโหวตประหารเสมอกัน ผู้ใหญ่บ้านจะเป็นผู้ตัดสิน',
    actionPrompt: 'เสียงโหวตของคุณมีน้ำหนัก 2 เสียง จงชี้นำชาวบ้านให้รอดพ้น',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-yellow-500/70',
      bg: 'bg-yellow-950/50',
      glow: 'shadow-yellow-500/30',
      accent: 'yellow'
    }
  },

  prince: {
    id: 'prince',
    name: 'เจ้าชาย',
    team: 'villagers',
    weight: 3,
    emoji: '👑',
    icon: 'Crown',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'เชื้อพระวงศ์ผู้สูงศักดิ์ หากถูกชาวบ้านโหวตแขวนคอ จะเปิดเผยตัวตนว่าเป็นเจ้าชายและรอดพ้นจากการประหารในครั้งนั้น!',
    actionPrompt: 'หากถูกโหวตประหาร จะเปิดเผยตัวและรอดชีวิตทันที 1 ครั้ง',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-indigo-500/70',
      bg: 'bg-indigo-950/50',
      glow: 'shadow-indigo-500/30',
      accent: 'indigo'
    }
  },

  lycan: {
    id: 'lycan',
    name: 'มนุษย์วานร',
    team: 'villagers',
    weight: -1,
    emoji: '🦍',
    icon: 'AlertTriangle',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'แท้จริงเป็นฝ่ายชาวบ้าน แต่ด้วยสัญชาตญาณสัตว์ป่า หากผู้หยั่งรู้ส่องดู จะมองเห็นเป็น "มนุษย์หมาป่า"',
    actionPrompt: 'คุณเป็นชาวบ้าน แต่ผู้หยั่งรู้จะเห็นคุณเป็นหมาป่า ระวังการถูกเข้าใจผิด!',
    scanResult: 'werewolves',
    colorTheme: {
      border: 'border-stone-500/70',
      bg: 'bg-stone-950/50',
      glow: 'shadow-stone-500/30',
      accent: 'stone'
    }
  },

  cursed: {
    id: 'cursed',
    name: 'คนต้องสาป',
    team: 'villagers',
    weight: -3,
    emoji: '🩸',
    icon: 'Skull',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'เริ่มต้นเป็นชาวบ้าน แต่หากถูกหมาป่ากัดในคืนใดคืนหนึ่ง จะไม่ตายและกลายร่างเป็นพวกหมาป่าในคืนถัดไปทันที',
    actionPrompt: 'คุณเป็นฝ่ายชาวบ้านจนกว่าจะถูกหมาป่ากัด เมื่อนั้นคุณจะกลายร่างเป็นหมาป่า!',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-violet-700/70',
      bg: 'bg-violet-950/50',
      glow: 'shadow-violet-700/30',
      accent: 'violet'
    }
  },

  tanner: {
    id: 'tanner',
    name: 'คนฟอกหนัง',
    team: 'neutral',
    weight: 1,
    emoji: '🎭',
    icon: 'Smile',
    firstNightOnly: false,
    wakeUpEveryNight: false,
    nightOrder: 999,
    description: 'ผู้เบื่อหน่ายชีวิต เป้าหมายเดียวในชีวิตคือ "หลอกล่อให้ชาวบ้านโหวตแขวนคอตัวเองให้สำเร็จ" หากทำสำเร็จจะชนะเกมทันทีเพียงคนเดียว!',
    actionPrompt: 'จงทำทุกวิถีทางให้ชาวบ้านเข้าใจผิดและโหวตประหารคุณตอนกลางวัน แล้วคุณจะชนะเกมทันที!',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-orange-500/70',
      bg: 'bg-orange-950/50',
      glow: 'shadow-orange-500/30',
      accent: 'orange'
    }
  },

  wolf_pup: {
    id: 'wolf_pup',
    name: 'ลูกหมาป่า',
    team: 'werewolves',
    weight: -8,
    emoji: '🐾',
    icon: 'Zap',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 40,
    description: 'สมาชิกตัวน้อยของฝูงหมาป่า หากลูกหมาป่าถูกฆ่าตาย คืนถัดไปฝูงหมาป่าจะคลั่งแค้นและสังหารเหยื่อได้ถึง 2 คน!',
    actionPrompt: 'คุณเป็นลูกหมาป่า หากคุณตาย คืนต่อไปฝูงหมาป่าจะฆ่าเหยื่อได้ 2 คน',
    scanResult: 'werewolves',
    colorTheme: {
      border: 'border-rose-600/70',
      bg: 'bg-rose-950/50',
      glow: 'shadow-rose-600/30',
      accent: 'rose'
    }
  },

  minion: {
    id: 'minion',
    name: 'สมุนหมาป่า',
    team: 'werewolves',
    weight: -6,
    emoji: '🗡️',
    icon: 'EyeOff',
    firstNightOnly: true,
    wakeUpEveryNight: false,
    nightOrder: 45,
    description: 'มนุษย์ผู้ภักดีต่อหมาป่า รู้ว่าใครเป็นหมาป่า แต่ไม่ตื่นมาร่วมฆ่า เมื่อผู้หยั่งรู้ส่องดูจะเห็นเป็นชาวบ้านธรรมดา',
    actionPrompt: 'ในคืนแรก คุณจะได้ลืมตาเห็นตัวตนของหมาป่าทั้งหมด จงคอยปั่นหัวชาวบ้านเพื่อช่วยให้หมาป่าชนะ',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-red-800/70',
      bg: 'bg-neutral-950/50',
      glow: 'shadow-red-800/30',
      accent: 'red'
    }
  },

  sorcerer: {
    id: 'sorcerer',
    name: 'หมอผีสมุนหมาป่า',
    team: 'werewolves',
    weight: -3,
    emoji: '🔮',
    icon: 'Sparkle',
    firstNightOnly: false,
    wakeUpEveryNight: true,
    nightOrder: 35,
    description: 'อยู่ฝ่ายหมาป่า ในแต่ละคืนสามารถส่องดูผู้เล่น 1 คน เพื่อค้นหาว่าคนนั้นคือ "ผู้หยั่งรู้" หรือไม่',
    actionPrompt: 'เลือกผู้เล่น 1 คนเพื่อตรวจดูว่าเป็นผู้หยั่งรู้หรือไม่',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-purple-800/70',
      bg: 'bg-purple-950/50',
      glow: 'shadow-purple-800/30',
      accent: 'purple'
    }
  },

  doppelganger: {
    id: 'doppelganger',
    name: 'โดปเปลแกงเกอร์',
    team: 'neutral',
    weight: -2,
    emoji: '👥',
    icon: 'Copy',
    firstNightOnly: true,
    wakeUpEveryNight: false,
    nightOrder: 15,
    description: 'ในคืนแรก เลือกส่องดูและผูกวิญญาณกับผู้เล่น 1 คน หากคนนั้นตาย คุณจะกลายร่างเป็นบทบาทของคนนั้นทันที!',
    actionPrompt: 'ในคืนแรก เลือกผู้เล่น 1 คน เมื่อเขาตาย คุณจะสืบทอดบทบาทของเขาทันที',
    scanResult: 'villagers',
    colorTheme: {
      border: 'border-teal-500/70',
      bg: 'bg-teal-950/50',
      glow: 'shadow-teal-500/30',
      accent: 'teal'
    }
  }
};

/**
 * คำนวณชุดการ์ดแนะนำอัตโนมัติตามจำนวนผู้เล่น (Auto Balance Presets)
 */
export function getRecommendedDeck(playerCount) {
  const count = Math.max(4, Math.min(playerCount, 20));
  
  // Presets ตามจำนวนผู้เล่นที่สมดุล สนุก และครอบครัวเข้าใจง่าย
  const presets = {
    4: ['werewolf', 'seer', 'villager', 'villager'],
    5: ['werewolf', 'seer', 'bodyguard', 'villager', 'villager'],
    6: ['werewolf', 'werewolf', 'seer', 'bodyguard', 'villager', 'villager'],
    7: ['werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'villager', 'villager'],
    8: ['werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'hunter', 'villager', 'villager'],
    9: ['werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'villager', 'villager'],
    10: ['werewolf', 'werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'villager', 'villager'],
    11: ['werewolf', 'werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'villager', 'villager'],
    12: ['werewolf', 'werewolf', 'werewolf', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'prince', 'tanner', 'villager'],
    13: ['werewolf', 'werewolf', 'werewolf', 'wolf_pup', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'prince', 'tanner', 'villager'],
    14: ['werewolf', 'werewolf', 'werewolf', 'wolf_pup', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'prince', 'tanner', 'lycan', 'villager'],
    15: ['werewolf', 'werewolf', 'werewolf', 'wolf_pup', 'minion', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'prince', 'tanner', 'lycan', 'villager'],
    16: ['werewolf', 'werewolf', 'werewolf', 'wolf_pup', 'minion', 'seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'prince', 'tanner', 'cursed', 'villager', 'villager']
  };

  if (presets[count]) {
    return presets[count];
  }

  // สำหรับจำนวนมากกว่า 16
  const werewolvesCount = Math.floor(count / 4);
  const deck = [];
  for (let i = 0; i < werewolvesCount; i++) deck.push('werewolf');
  deck.push('seer', 'bodyguard', 'witch', 'hunter', 'cupid', 'mayor', 'tanner');
  while (deck.length < count) {
    deck.push('villager');
  }
  return deck.slice(0, count);
}
