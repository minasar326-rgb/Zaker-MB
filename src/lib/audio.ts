// Web Audio API synthesized chimes for study focus, breaks & daily motivation
// 100% offline, zero audio assets to load, works across all browsers

export function playMotivationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Distinctive uplifting 6-note triumphant melodic arpeggio:
    // F4 (349.23), A4 (440.0), C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 349.23, time: 0.00, dur: 1.1, vol: 0.18 },
      { freq: 440.00, time: 0.11, dur: 1.1, vol: 0.20 },
      { freq: 523.25, time: 0.22, dur: 1.2, vol: 0.24 },
      { freq: 659.25, time: 0.33, dur: 1.3, vol: 0.26 },
      { freq: 783.99, time: 0.44, dur: 1.5, vol: 0.28 },
      { freq: 1046.50, time: 0.58, dur: 1.9, vol: 0.32 },
    ];

    notes.forEach((note) => {
      const startTime = now + note.time;

      // 1. Primary fundamental warm bell tone (Sine)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(note.freq, startTime);

      gain1.gain.setValueAtTime(0.0001, startTime);
      gain1.gain.linearRampToValueAtTime(note.vol, startTime + 0.025);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(startTime);
      osc1.stop(startTime + note.dur + 0.05);

      // 2. Distinctive crystal shimmer harmonic overtone (Triangle, +4 cents detune for rich sparkle)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(note.freq * 2, startTime); // Octave overtone
      osc2.detune.setValueAtTime(4, startTime);

      gain2.gain.setValueAtTime(0.0001, startTime);
      gain2.gain.linearRampToValueAtTime(note.vol * 0.4, startTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + (note.dur * 0.7));

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime);
      osc2.stop(startTime + note.dur * 0.75);
    });
  } catch (err) {
    console.warn('[Zaker Audio] Motivation chime could not be played:', err);
  }
}

export function playChime(type: 'focus' | 'break' | 'motivation' = 'focus') {
  if (type === 'motivation') {
    return playMotivationChime();
  }
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'focus') {
      // Celebratory multi-tone bell chime: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = now + idx * 0.13;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.35);
      });
    } else {
      // Gentle mellow chime for break: G4 (392Hz) -> C5 (523.25Hz)
      const notes = [392.0, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const startTime = now + idx * 0.18;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.15);
      });
    }
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}
