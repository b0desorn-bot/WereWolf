import { ROLES, TEAMS, getRecommendedDeck } from './roles.js';

export class GameRoom {
  constructor(code, hostId, hostName) {
    this.code = code;
    this.hostId = hostId;
    this.createdAt = Date.now();
    this.state = 'LOBBY'; // LOBBY, ROLE_REVEAL, NIGHT, DAY_ANNOUNCEMENT, DAY_DISCUSSION, VOTING, HUNTER_REVENGE, GAME_OVER
    
    // Players: Map of id -> player object
    this.players = new Map();
    
    // Role deck configuration
    this.deck = ['werewolf', 'seer', 'bodyguard', 'villager'];
    
    // Game progression state
    this.nightNumber = 0;
    this.dayNumber = 0;
    this.nightStep = null; // Current active role action in night
    this.nightSteps = []; // Queue of roles to wake up tonight
    this.nightStepIndex = 0;
    
    // Night action records
    this.nightActions = {
      werewolfVotes: {}, // { werewolfPlayerId: targetPlayerId }
      werewolfTargets: [], // final chosen target(s)
      seerTarget: null,
      seerResult: null,
      sorcererTarget: null,
      bodyguardTarget: null,
      lastProtectedId: null,
      witchHealUsedOn: null,
      witchPoisonUsedOn: null,
      witchChoiceHeal: false,
      witchChoicePoisonTarget: null,
      cupidLovers: [],
      doppelgangerTarget: null
    };

    // Daytime state
    this.deathsTonight = []; // list of players who died last night
    this.discussionTimer = 180; // seconds
    this.discussionTimeRemaining = 180;
    this.discussionInterval = null;
    this.votes = {}; // { voterId: targetId }
    this.votingTimer = 45;
    this.votingTimeRemaining = 45;
    this.votingInterval = null;
    this.pendingHunterRevenge = null; // hunter player who needs to shoot
    
    // Game results
    this.winner = null; // 'villagers' | 'werewolves' | 'tanner' | 'lovers'
    this.winReason = '';
    this.gameLogs = []; // Thai game log history
    
    // Add initial host
    this.addPlayer(hostId, hostName, true);
  }

  log(message, type = 'info') {
    const logEntry = {
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      message,
      type
    };
    this.gameLogs.unshift(logEntry);
    if (this.gameLogs.length > 100) this.gameLogs.pop();
  }

  addPlayer(id, name, isHost = false) {
    const avatarList = ['🦊', '🐻', '🦉', '🐱', '🐶', '🦁', '🐯', '🐰', '🐼', '🐨', '🐸', '🐵'];
    const randomAvatar = avatarList[this.players.size % avatarList.length];
    const sessionToken = 'tok_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();

    const player = {
      id,
      sessionToken,
      name: name || `ผู้เล่น ${this.players.size + 1}`,
      avatar: randomAvatar,
      isHost,
      isAlive: true,
      role: null,
      loverId: null,
      witchHealLeft: true,
      witchPoisonLeft: true,
      princeSaved: false,
      isCursed: false,
      isTransformedToWolf: false,
      doppelgangerTargetId: null,
      hasSeenRole: false,
      connected: true,
      disconnectTimer: null
    };

    this.players.set(id, player);
    this.log(`${player.name} เข้าร่วมห้องแล้ว`);
    
    // Auto-update deck if in lobby
    if (this.state === 'LOBBY' && this.players.size >= 4) {
      this.deck = getRecommendedDeck(this.players.size);
    }

    return player;
  }

  markDisconnected(socketId, gracePeriodMs = 180000, onExpire) {
    const player = this.players.get(socketId);
    if (!player) return;

    player.connected = false;
    this.log(`${player.name} หลุดการเชื่อมต่อชั่วคราว (รอการเชื่อมต่อใหม่ 3 นาที)`, 'warning');

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
    }

    player.disconnectTimer = setTimeout(() => {
      if (!player.connected) {
        this.removePlayer(socketId);
        if (typeof onExpire === 'function') onExpire();
      }
    }, gracePeriodMs);
  }

  reconnectPlayer(sessionToken, newSocketId) {
    for (const [oldSocketId, player] of this.players.entries()) {
      if (player.sessionToken === sessionToken) {
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer);
          player.disconnectTimer = null;
        }

        // Remap to new socket ID
        this.players.delete(oldSocketId);
        player.id = newSocketId;
        player.connected = true;
        this.players.set(newSocketId, player);

        if (player.isHost) {
          this.hostId = newSocketId;
        }

        this.log(`${player.name} เชื่อมต่อกลับเข้าห้องสำเร็จ!`, 'success');
        return player;
      }
    }
    return null;
  }

  removePlayer(id) {
    const player = this.players.get(id);
    if (!player) return;

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    this.log(`${player.name} ออกจากห้องแล้ว`, 'warning');
    this.players.delete(id);

    // If host leaves, assign next player as host
    if (player.isHost && this.players.size > 0) {
      const nextHost = this.players.values().next().value;
      nextHost.isHost = true;
      this.hostId = nextHost.id;
      this.log(`${nextHost.name} ได้รับเลือกเป็นหัวหน้าห้องคนใหม่`, 'success');
    }

    // Auto-balance deck if in lobby
    if (this.state === 'LOBBY' && this.players.size >= 4) {
      this.deck = getRecommendedDeck(this.players.size);
    }
  }

  setDeck(newDeck) {
    if (this.state !== 'LOBBY') return;
    this.deck = [...newDeck];
  }

  // Calculate balance rating based on card weights
  getBalanceScore() {
    return this.deck.reduce((sum, roleId) => {
      const role = ROLES[roleId];
      return sum + (role ? role.weight : 0);
    }, 0);
  }

  startGame() {
    if (this.players.size < 4) {
      return { success: false, message: 'ต้องมีผู้เล่นอย่างน้อย 4 คนขึ้นไป' };
    }
    if (this.deck.length !== this.players.size) {
      return { 
        success: false, 
        message: `จำนวนการ์ด (${this.deck.length} ใบ) ไม่ตรงกับจำนวนผู้เล่น (${this.players.size} คน)` 
      };
    }

    // Shuffle deck
    const shuffledRoles = [...this.deck].sort(() => Math.random() - 0.5);
    
    let index = 0;
    for (const player of this.players.values()) {
      const roleId = shuffledRoles[index++];
      player.role = roleId;
      player.isAlive = true;
      player.loverId = null;
      player.witchHealLeft = true;
      player.witchPoisonLeft = true;
      player.princeSaved = false;
      player.isCursed = (roleId === 'cursed');
      player.isTransformedToWolf = false;
      player.doppelgangerTargetId = null;
      player.hasSeenRole = false;
    }

    this.state = 'ROLE_REVEAL';
    this.nightNumber = 0;
    this.dayNumber = 0;
    this.winner = null;
    this.winReason = '';
    this.log('เริ่มเกมแล้ว! กำลังแจกการ์ดบทบาทให้ทุกคน', 'highlight');

    return { success: true };
  }

  confirmRoleSeen(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.hasSeenRole = true;
    }
  }

  allPlayersSeenRole() {
    for (const player of this.players.values()) {
      if (!player.hasSeenRole) return false;
    }
    return true;
  }

  beginFirstNight() {
    this.nightNumber = 1;
    this.setupNightSequence();
  }

  setupNightSequence() {
    this.state = 'NIGHT';
    this.deathsTonight = [];
    
    // Clear temporary night actions
    this.nightActions.werewolfVotes = {};
    this.nightActions.werewolfTargets = [];
    this.nightActions.seerTarget = null;
    this.nightActions.seerResult = null;
    this.nightActions.sorcererTarget = null;
    this.nightActions.bodyguardTarget = null;
    this.nightActions.witchChoiceHeal = false;
    this.nightActions.witchChoicePoisonTarget = null;

    // Determine which roles are alive and should wake up tonight
    const steps = [];

    // Night 1 only: Cupid
    if (this.nightNumber === 1 && this.hasLivingRole('cupid')) {
      steps.push('cupid');
    }

    // Night 1 only: Doppelgänger
    if (this.nightNumber === 1 && this.hasLivingRole('doppelganger')) {
      steps.push('doppelganger');
    }

    // Seer (Every night)
    if (this.hasLivingRole('seer')) {
      steps.push('seer');
    }

    // Sorcerer (Every night)
    if (this.hasLivingRole('sorcerer')) {
      steps.push('sorcerer');
    }

    // Werewolves (Every night, as long as at least 1 wolf is alive)
    if (this.getLivingWerewolves().length > 0) {
      steps.push('werewolf');
    }

    // Bodyguard (Every night)
    if (this.hasLivingRole('bodyguard')) {
      steps.push('bodyguard');
    }

    // Witch (Every night)
    if (this.hasLivingRole('witch')) {
      const witch = this.getPlayerByRole('witch');
      if (witch && (witch.witchHealLeft || witch.witchPoisonLeft)) {
        steps.push('witch');
      }
    }

    this.nightSteps = steps;
    this.nightStepIndex = 0;

    if (steps.length > 0) {
      this.nightStep = steps[0];
      this.log(`ค่ำคืนที่ ${this.nightNumber}: หมู่บ้านเข้าสู่ความเงียบสงัด...`, 'night');
      this.logRoleWakeup(this.nightStep);
    } else {
      // No night roles left to wake up, go straight to sunrise
      this.resolveNight();
    }
  }

  logRoleWakeup(roleId) {
    const role = ROLES[roleId];
    if (role) {
      this.log(`🌙 ถึงตาของ ${role.name} ลืมตาขึ้นมาปฏิบัติการ`, 'night');
    }
  }

  nextNightStep() {
    this.nightStepIndex++;
    if (this.nightStepIndex < this.nightSteps.length) {
      this.nightStep = this.nightSteps[this.nightStepIndex];
      this.logRoleWakeup(this.nightStep);
      return false; // Still night
    } else {
      this.nightStep = null;
      this.resolveNight();
      return true; // Night ended
    }
  }

  // --- NIGHT ACTIONS ---

  handleCupidAction(cupidPlayerId, loverId1, loverId2) {
    if (this.nightStep !== 'cupid') return { success: false };
    if (!loverId1 || !loverId2 || loverId1 === loverId2) {
      return { success: false, message: 'ต้องเลือกผู้เล่น 2 คนที่ไม่ซ้ำกัน' };
    }

    const p1 = this.players.get(loverId1);
    const p2 = this.players.get(loverId2);
    if (!p1 || !p2) return { success: false, message: 'ไม่พบผู้เล่น' };

    p1.loverId = loverId2;
    p2.loverId = loverId1;
    this.nightActions.cupidLovers = [loverId1, loverId2];

    this.log(`กามเทพได้ผูกชะตารักให้กับผู้เล่น 2 คนแล้ว`, 'action');
    this.nextNightStep();
    return { success: true };
  }

  handleDoppelgangerAction(playerId, targetId) {
    if (this.nightStep !== 'doppelganger') return { success: false };
    const player = this.players.get(playerId);
    const target = this.players.get(targetId);
    if (!player || !target || playerId === targetId) return { success: false };

    player.doppelgangerTargetId = targetId;
    this.nightActions.doppelgangerTarget = targetId;
    this.log(`โดปเปลแกงเกอร์ได้เลือกเป้าหมายผูกวิญญาณแล้ว`, 'action');
    this.nextNightStep();
    return { success: true };
  }

  handleSeerAction(seerPlayerId, targetId) {
    if (this.nightStep !== 'seer') return { success: false };
    const target = this.players.get(targetId);
    if (!target) return { success: false, message: 'ไม่พบเป้าหมาย' };

    const targetRole = ROLES[target.role];
    let isWolf = false;

    // Checks: Lycan scans as werewolf, minion/sorcerer scans as villager
    if (target.role === 'lycan' || target.isTransformedToWolf) {
      isWolf = true;
    } else if (targetRole && targetRole.team === 'werewolves' && target.role !== 'minion' && target.role !== 'sorcerer') {
      isWolf = true;
    }

    this.nightActions.seerTarget = targetId;
    this.nightActions.seerResult = {
      targetId,
      targetName: target.name,
      targetAvatar: target.avatar,
      isWerewolf: isWolf,
      resultText: isWolf ? 'เป็น "มนุษย์หมาป่า" 🐺' : 'ไม่ใช่หมาป่า (ฝ่ายชาวบ้าน) 🧑‍🌾'
    };

    this.log(`ผู้หยั่งรู้ได้ส่องดูผู้เล่น 1 คน`, 'action');
    return { success: true, result: this.nightActions.seerResult };
  }

  handleSorcererAction(sorcererPlayerId, targetId) {
    if (this.nightStep !== 'sorcerer') return { success: false };
    const target = this.players.get(targetId);
    if (!target) return { success: false };

    const isSeer = target.role === 'seer';
    this.nightActions.sorcererTarget = targetId;
    return {
      success: true,
      result: {
        targetName: target.name,
        isSeer,
        resultText: isSeer ? 'คนนี้คือ "ผู้หยั่งรู้" 🔮' : 'คนนี้ "ไม่ใช่ผู้หยั่งรู้"'
      }
    };
  }

  handleWerewolfVote(voterId, targetId) {
    if (this.nightStep !== 'werewolf') return { success: false };
    const voter = this.players.get(voterId);
    if (!voter || !this.isWerewolfTeam(voter)) return { success: false };

    this.nightActions.werewolfVotes[voterId] = targetId;
    return { success: true, votes: this.nightActions.werewolfVotes };
  }

  confirmWerewolfKill(targetId) {
    if (this.nightStep !== 'werewolf') return { success: false };
    const target = this.players.get(targetId);
    if (!target || !target.isAlive) return { success: false };

    this.nightActions.werewolfTargets = [targetId];
    this.log(`ฝูงหมาป่าได้ตกลงเลือกเหยื่อเรียบร้อยแล้ว`, 'action');
    this.nextNightStep();
    return { success: true };
  }

  handleBodyguardAction(bgPlayerId, targetId) {
    if (this.nightStep !== 'bodyguard') return { success: false };
    if (targetId === this.nightActions.lastProtectedId) {
      return { success: false, message: 'ห้ามเลือกปกป้องคนเดิมซ้ำสองคืนติด' };
    }

    this.nightActions.bodyguardTarget = targetId;
    this.nightActions.lastProtectedId = targetId;
    this.log(`บอดี้การ์ดได้เลือกผู้เล่นที่ต้องการคุ้มกันแล้ว`, 'action');
    this.nextNightStep();
    return { success: true };
  }

  handleWitchAction(witchPlayerId, useHeal, poisonTargetId) {
    if (this.nightStep !== 'witch') return { success: false };
    const witch = this.players.get(witchPlayerId);
    if (!witch) return { success: false };

    if (useHeal && witch.witchHealLeft) {
      this.nightActions.witchChoiceHeal = true;
      witch.witchHealLeft = false;
      this.log(`แม่มดตัดสินใจใช้ "ยาชุบชีวิต" ในคืนนี้`, 'action');
    }

    if (poisonTargetId && witch.witchPoisonLeft) {
      this.nightActions.witchChoicePoisonTarget = poisonTargetId;
      witch.witchPoisonLeft = false;
      this.log(`แม่มดตัดสินใจสาด "ยาพิษ" ใส่เป้าหมาย`, 'action');
    }

    this.nextNightStep();
    return { success: true };
  }

  // --- RESOLVE NIGHT TO MORNING ---

  resolveNight() {
    this.dayNumber++;
    this.deathsTonight = [];
    const deadPlayerIds = new Set();

    // 1. Check Werewolf attack
    for (const targetId of this.nightActions.werewolfTargets) {
      const victim = this.players.get(targetId);
      if (!victim || !victim.isAlive) continue;

      // Check Bodyguard protection
      const isProtected = (this.nightActions.bodyguardTarget === targetId);

      // Check Witch heal
      const isHealed = this.nightActions.witchChoiceHeal;

      if (isProtected || isHealed) {
        // Saved!
        this.log(`มีคนรอดชีวิตจากการโจมตีของหมาป่าในคืนนี้!`, 'success');
      } else if (victim.role === 'cursed' && !victim.isTransformedToWolf) {
        // Cursed person becomes a werewolf instead of dying!
        victim.isTransformedToWolf = true;
        victim.role = 'werewolf';
        this.log(`มีผู้เล่นคนหนึ่งถูกคำสาปกลายร่างเป็นหมาป่าอย่างลับๆ`, 'action');
      } else {
        deadPlayerIds.add(targetId);
      }
    }

    // 2. Check Witch Poison
    if (this.nightActions.witchChoicePoisonTarget) {
      deadPlayerIds.add(this.nightActions.witchChoicePoisonTarget);
    }

    // 3. Process deaths and cascade (lovers, doppelganger, etc.)
    this.processDeaths(Array.from(deadPlayerIds), 'night');

    // Transition to DAY_ANNOUNCEMENT
    this.state = 'DAY_ANNOUNCEMENT';

    if (this.deathsTonight.length === 0) {
      this.log(`☀️ เช้าวันที่ ${this.dayNumber}: เป็นคืนที่เงียบสงบ ไม่มีใครเสียชีวิต!`, 'success');
    } else {
      const names = this.deathsTonight.map(p => p.name).join(', ');
      this.log(`☀️ เช้าวันที่ ${this.dayNumber}: ข่าวร้าย! ผู้เสียชีวิตเมื่อคืนนี้ ได้แก่ ${names}`, 'danger');
    }

    // Check game over
    this.checkWinConditions();
  }

  processDeaths(initialDeadIds, cause = 'night') {
    const queue = [...initialDeadIds];
    const processed = new Set();

    while (queue.length > 0) {
      const deadId = queue.shift();
      if (processed.has(deadId)) continue;
      processed.add(deadId);

      const player = this.players.get(deadId);
      if (!player || !player.isAlive) continue;

      player.isAlive = false;
      this.deathsTonight.push({
        id: player.id,
        name: player.name,
        role: player.role,
        roleName: ROLES[player.role]?.name || player.role,
        avatar: player.avatar,
        cause
      });

      // Check Hunter: Needs to shoot!
      if (player.role === 'hunter') {
        this.pendingHunterRevenge = player.id;
        this.log(`🏹 นายพราน (${player.name}) เสียชีวิต! ได้รับสิทธิ์ยิงลากคนตายตาม 1 คน`, 'danger');
      }

      // Check Lovers: Heartbreak death!
      if (player.loverId) {
        const lover = this.players.get(player.loverId);
        if (lover && lover.isAlive && !processed.has(lover.id)) {
          this.log(`💔 ${lover.name} ตรอมใจตายตามคู่รัก (${player.name})!`, 'danger');
          queue.push(lover.id);
        }
      }

      // Check Doppelgänger inheritance
      for (const p of this.players.values()) {
        if (p.isAlive && p.role === 'doppelganger' && p.doppelgangerTargetId === deadId) {
          p.role = player.role;
          this.log(`โดปเปลแกงเกอร์ได้ดูดซับวิญญาณและกลายเป็น "${ROLES[p.role]?.name}" แทนแล้ว`, 'action');
        }
      }
    }
  }

  // --- DAY & VOTING LOGIC ---

  startDayDiscussion(timerSeconds = 180) {
    this.state = 'DAY_DISCUSSION';
    this.discussionTimer = timerSeconds;
    this.discussionTimeRemaining = timerSeconds;
    this.log(`เริ่มการพูดคุยสืบสวนคดีประจำวัน (${timerSeconds} วินาที)`, 'info');
  }

  startVotingPhase(timerSeconds = 60) {
    this.state = 'VOTING';
    this.votes = {};
    this.votingTimer = timerSeconds;
    this.votingTimeRemaining = timerSeconds;
    this.log(`เข้าสู่ช่วงโหวตตัดสินคดีประหารชีวิต! ทุกคนจงลงคะแนนอย่างเป็นความลับ`, 'highlight');
  }

  castVote(voterId, targetId) {
    if (this.state !== 'VOTING') return { success: false };
    const voter = this.players.get(voterId);
    if (!voter || !voter.isAlive) return { success: false };

    this.votes[voterId] = targetId; // targetId can be player ID or 'skip'
    return { success: true };
  }

  hasAllAlivePlayersVoted() {
    const living = Array.from(this.players.values()).filter(p => p.isAlive);
    for (const p of living) {
      if (!this.votes[p.id]) return false;
    }
    return true;
  }

  resolveVoting() {
    const livingPlayers = Array.from(this.players.values()).filter(p => p.isAlive);
    const voteCounts = {}; // targetId -> total weight
    const voteDetails = {}; // targetId -> [voterNames]

    // Initialize counts
    voteCounts['skip'] = 0;
    voteDetails['skip'] = [];

    for (const p of livingPlayers) {
      voteCounts[p.id] = 0;
      voteDetails[p.id] = [];
    }

    // Tally votes
    for (const [voterId, targetId] of Object.entries(this.votes)) {
      const voter = this.players.get(voterId);
      if (!voter || !voter.isAlive) continue;

      // Mayor vote has weight of 2
      const weight = (voter.role === 'mayor') ? 2 : 1;
      const targetKey = targetId || 'skip';

      voteCounts[targetKey] = (voteCounts[targetKey] || 0) + weight;
      if (!voteDetails[targetKey]) voteDetails[targetKey] = [];
      voteDetails[targetKey].push({
        name: voter.name,
        weight,
        isMayor: voter.role === 'mayor'
      });
    }

    // Determine highest voted target
    let highestVotes = 0;
    let topTargets = [];

    for (const [targetKey, count] of Object.entries(voteCounts)) {
      if (count > highestVotes) {
        highestVotes = count;
        topTargets = [targetKey];
      } else if (count === highestVotes && count > 0) {
        topTargets.push(targetKey);
      }
    }

    const voteSummary = {
      voteCounts,
      voteDetails,
      highestVotes,
      topTargets,
      executedPlayer: null,
      wasPrinceSaved: false,
      isTannerWin: false,
      message: ''
    };

    if (topTargets.length === 1 && topTargets[0] !== 'skip' && highestVotes > 0) {
      const targetId = topTargets[0];
      const condemned = this.players.get(targetId);

      if (condemned) {
        // 1. Check Tanner Victory Condition!
        if (condemned.role === 'tanner') {
          condemned.isAlive = false;
          voteSummary.executedPlayer = condemned;
          voteSummary.isTannerWin = true;
          this.winner = 'tanner';
          this.winReason = `คนฟอกหนัง (${condemned.name}) หลอกให้ชาวบ้านโหวตประหารตัวเองได้สำเร็จ! เขาคือผู้ชนะเกมเพียงคนเดียว!`;
          this.state = 'GAME_OVER';
          this.log(this.winReason, 'winner');
          return voteSummary;
        }

        // 2. Check Prince Immunity
        if (condemned.role === 'prince' && !condemned.princeSaved) {
          condemned.princeSaved = true;
          voteSummary.wasPrinceSaved = true;
          voteSummary.message = `👑 เปิดเผยตัวตน! ${condemned.name} คือเจ้าชายผู้สูงศักดิ์ จึงได้รับการยกเว้นจากการแขวนคอในครั้งนี้!`;
          this.log(voteSummary.message, 'success');
        } else {
          // Normal execution
          this.deathsTonight = [];
          this.processDeaths([condemned.id], 'vote');
          voteSummary.executedPlayer = condemned;
          voteSummary.message = `⚖️ คำพิพากษาเป็นเอกฉันท์! ${condemned.name} (${ROLES[condemned.role]?.name}) ถูกชาวบ้านโหวตแขวนคอประหารชีวิต`;
          this.log(voteSummary.message, 'danger');
        }
      }
    } else if (topTargets.length > 1) {
      voteSummary.message = `คะแนนเสียงโหวตเสมอกัน (${highestVotes} คะแนน) จึงไม่มีใครถูกประหารชีวิตในวันนี้`;
      this.log(voteSummary.message, 'info');
    } else {
      voteSummary.message = `ชาวบ้านส่วนใหญ่เลือกงดออกเสียง จึงไม่มีใครถูกประหารชีวิต`;
      this.log(voteSummary.message, 'info');
    }

    // Check if Hunter needs to shoot
    if (this.pendingHunterRevenge) {
      this.state = 'HUNTER_REVENGE';
    } else {
      // Check win condition
      if (!this.checkWinConditions()) {
        // Proceed to next night
        this.nightNumber++;
      }
    }

    return voteSummary;
  }

  handleHunterShot(hunterId, targetId) {
    if (this.state !== 'HUNTER_REVENGE' && !this.pendingHunterRevenge) return { success: false };
    const hunter = this.players.get(hunterId);
    const target = this.players.get(targetId);
    if (!hunter || !target || !target.isAlive) return { success: false };

    this.pendingHunterRevenge = null;
    this.log(`🏹 นายพราน (${hunter.name}) ลั่นไกสังหาร ${target.name} ตกตายตามกัน!`, 'danger');
    this.processDeaths([target.id], 'hunter');

    if (!this.checkWinConditions()) {
      this.nightNumber++;
      this.setupNightSequence();
    }

    return { success: true };
  }

  // --- WIN CONDITIONS ---

  checkWinConditions() {
    if (this.winner) return true;

    const living = Array.from(this.players.values()).filter(p => p.isAlive);
    const werewolves = living.filter(p => this.isWerewolfTeam(p));
    const villagers = living.filter(p => !this.isWerewolfTeam(p) && p.role !== 'tanner');

    // Check Lovers win condition: If only 2 living players left and they are lovers
    if (living.length === 2) {
      const [p1, p2] = living;
      if (p1.loverId === p2.id) {
        this.winner = 'lovers';
        this.winReason = `ความรักชนะทุกสิ่ง! คู่รักชะตากรรม (${p1.name} & ${p2.name}) คือผู้รอดชีวิตคู่สุดท้ายและเป็นผู้ชนะ!`;
        this.state = 'GAME_OVER';
        this.log(this.winReason, 'winner');
        return true;
      }
    }

    // Werewolves eliminated -> Villagers win
    if (werewolves.length === 0) {
      this.winner = 'villagers';
      this.winReason = 'ชาวบ้านสามารถกำจัดมนุษย์หมาป่าได้จนหมดสิ้น! ความสงบสุขกลับคืนสู่หมู่บ้านแล้ว!';
      this.state = 'GAME_OVER';
      this.log(this.winReason, 'winner');
      return true;
    }

    // Werewolves count >= Villagers count -> Werewolves win
    if (werewolves.length >= villagers.length) {
      this.winner = 'werewolves';
      this.winReason = 'ฝูงหมาป่ามีจำนวนเท่ากับหรือมากกว่าชาวบ้านแล้ว! หมู่บ้านถูกยึดครองโดยมนุษย์หมาป่าอย่างสมบูรณ์!';
      this.state = 'GAME_OVER';
      this.log(this.winReason, 'winner');
      return true;
    }

    return false;
  }

  // --- HELPERS ---

  isWerewolfTeam(player) {
    if (!player) return false;
    if (player.isTransformedToWolf) return true;
    const role = ROLES[player.role];
    return role ? role.team === 'werewolves' : false;
  }

  getLivingWerewolves() {
    return Array.from(this.players.values()).filter(p => p.isAlive && this.isWerewolfTeam(p));
  }

  hasLivingRole(roleId) {
    for (const player of this.players.values()) {
      if (player.isAlive && player.role === roleId) return true;
    }
    return false;
  }

  getPlayerByRole(roleId) {
    for (const player of this.players.values()) {
      if (player.isAlive && player.role === roleId) return player;
    }
    return null;
  }

  // Sanitized state sent to specific player (security: never leak other player's roles)
  getClientState(playerId) {
    const me = this.players.get(playerId);
    const livingWerewolves = this.getLivingWerewolves();
    const isMeWolf = me ? this.isWerewolfTeam(me) : false;

    // Filter player list to hide secret roles
    const safePlayers = Array.from(this.players.values()).map(p => {
      const isSelf = p.id === playerId;
      const isKnownWolfTeammate = isMeWolf && this.isWerewolfTeam(p);
      const isMyLover = me && me.loverId === p.id;
      const isGameOver = this.state === 'GAME_OVER';

      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isHost: p.isHost,
        isAlive: p.isAlive,
        isLover: isMyLover,
        princeSaved: p.princeSaved,
        connected: p.connected,
        // Role is only revealed to self, wolf teammates, or when game over
        role: (isSelf || isKnownWolfTeammate || isGameOver) ? p.role : null,
        roleInfo: (isSelf || isGameOver) ? ROLES[p.role] : null
      };
    });

    return {
      code: this.code,
      state: this.state,
      nightNumber: this.nightNumber,
      dayNumber: this.dayNumber,
      nightStep: this.nightStep,
      nightStepIndex: this.nightStepIndex,
      totalNightSteps: this.nightSteps.length,
      deck: this.deck,
      balanceScore: this.getBalanceScore(),
      players: safePlayers,
      me: me ? {
        id: me.id,
        sessionToken: me.sessionToken,
        name: me.name,
        avatar: me.avatar,
        isHost: me.isHost,
        isAlive: me.isAlive,
        role: me.role,
        roleInfo: ROLES[me.role],
        loverId: me.loverId,
        witchHealLeft: me.witchHealLeft,
        witchPoisonLeft: me.witchPoisonLeft,
        hasSeenRole: me.hasSeenRole,
        pendingRevenge: this.pendingHunterRevenge === me.id
      } : null,
      deathsTonight: this.deathsTonight,
      winner: this.winner,
      winReason: this.winReason,
      gameLogs: this.gameLogs.slice(0, 20),
      // Night specific private data
      nightData: {
        werewolfVotes: isMeWolf ? this.nightActions.werewolfVotes : {},
        seerResult: (me && me.role === 'seer') ? this.nightActions.seerResult : null,
        witchVictim: (me && me.role === 'witch' && me.witchHealLeft) ? this.nightActions.werewolfTargets[0] : null,
        lastProtectedId: (me && me.role === 'bodyguard') ? this.nightActions.lastProtectedId : null
      },
      // Day voting data
      votingData: {
        votes: this.state === 'GAME_OVER' ? this.votes : Object.keys(this.votes).length, // hide who voted whom until end or count
        myVote: this.votes[playerId] || null
      }
    };
  }
}
