/**
 * ตัวสังเคราะห์เสียงบรรยากาศและเอฟเฟกต์ (Web Audio API)
 * ทำงานได้ทันทีบน iPhone Safari, Android Chrome และ iPad โดยไม่ต้องพึ่งพาไฟล์ภายนอก
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    return this.enabled;
  }

  // เสียงหมาป่าหอนยามค่ำคืน (Wolf Howl / Dark chord)
  playNight() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Deep drone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.exponentialRampToValueAtTime(75, t + 2.5);
    
    gain1.gain.setValueAtTime(0.01, t);
    gain1.gain.linearRampToValueAtTime(0.15, t + 0.5);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    // Filter for haunting dark sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(600, t + 1.2);
    filter.frequency.exponentialRampToValueAtTime(200, t + 2.5);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 2.5);
  }

  // เสียงระฆังเช้า / รุ่งสาง (Morning Bell / Chime)
  playMorning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad)

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);

      gain.gain.setValueAtTime(0.12, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.15 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 1.8);
    });
  }

  // เสียงคลิกโหวต / เลือกการ์ด (Snappy Tap)
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // เสียงประกาศประหาร / ความตาย (Solemn Gong)
  playDeath() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 2.0);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 2.0);
  }

  // เสียงชัยชนะ (Victory Fanfare)
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major arpeggio
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);

      gain.gain.setValueAtTime(0.18, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 1.2);
    });
  }

  // เสียงส่องดูบทบาท (Magic Sparkle)
  playReveal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [659.25, 880.00, 1174.66, 1760.00];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.1, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.6);
    });
  }
}

export const sound = new SoundEffects();
