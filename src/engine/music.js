// Web Audio Chiptune Music Synthesizer & Sequencer

const NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function parseNote(str) {
  const match = /^([A-G])(#|b)?(-?\d)$/.exec(str);
  if (!match) return null;
  return 12 * (+match[3] + 1) + NOTE_SEMITONES[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function parseChord(str) {
  const match = /^([A-G])(#|b)?(m|7|m7)?$/.exec(str);
  if (!match) return { r: 0, third: 4, sev: 11 };
  const root = NOTE_SEMITONES[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  const qual = match[3] || '';
  return {
    r: root,
    third: qual.startsWith('m') ? 3 : 4,
    sev: qual === '7' || qual === 'm7' ? 10 : 11
  };
}

function chordNote(chord, sym, oct) {
  const intervals = { R: 0, 3: chord.third, 5: 7, 7: chord.sev, 8: 12, 9: 14 };
  return 12 * (oct + 1) + chord.r + (intervals[sym] ?? 0);
}

function parsePattern(str) {
  const events = [];
  let at = 0;
  for (const token of str.trim().split(/\s+/)) {
    if (!token) continue;
    const [note, durStr] = token.split(':');
    const dur = durStr ? +durStr : 1;
    if (note !== '.') {
      events.push({ at, sym: note, dur });
    }
    at += dur;
  }
  return { events, len: at };
}

// Noise buffer cache for drums
let noiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = ctx.sampleRate * 0.2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

function playDrum(ctx, dest, type, time) {
  try {
    if (type === 'k') {
      // Kick drum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(gain).connect(dest);
      osc.start(time);
      osc.stop(time + 0.13);
    } else if (type === 's') {
      // Snare drum
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      noise.connect(filter).connect(gain).connect(dest);
      noise.start(time);
      noise.stop(time + 0.13);
    } else if (type === 'h') {
      // Hi-hat
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.025, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      noise.connect(filter).connect(gain).connect(dest);
      noise.start(time);
      noise.stop(time + 0.05);
    }
  } catch (e) {}
}

function playTone(ctx, dest, freq, time, duration, wave = 'square', gainVal = 0.035, opts = {}) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);

    if (opts.vib) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.5;
      lfoGain.gain.value = freq * 0.02;
      lfo.connect(osc.frequency);
      lfo.start(time);
      lfo.stop(time + duration);
    }

    gain.gain.setValueAtTime(gainVal, time);
    if (opts.pluck) {
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    } else {
      gain.gain.setValueAtTime(gainVal, time + duration * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    }

    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  } catch (e) {}
}

// 8-bit Song Definitions
export const SONGS = {
  // Title Theme: Triumphant retro melody
  title: {
    bpm: 136,
    spb: 16,
    chords: ['C', 'C', 'F', 'G', 'C', 'Am', 'F', 'G'],
    lead: {
      wave: 'square',
      v: 1,
      pat: 'E5:2 G5:2 C6:4 B5:2 G5:2 E5:4 F5:2 E5:2 D5:2 C5:2 D5:4 G4:4 A4:2 C5:2 F5:4 E5:2 F5:2 A5:4 G5:4 F5:2 E5:2 D5:4 G5:4'
    },
    bass: {
      pat: 'R:2 R:2 5:2 8:2 R:2 R:2 5:2 8:2 R:2 R:2 5:2 8:2 R:2 R:2 5:2 8:2'
    },
    arp: {
      pat: 'R:1 3:1 5:1 8:1 5:1 3:1 R:1 3:1'
    },
    drums: {
      k: 'x...x...x...x...',
      s: '....x.......x...',
      h: 'x.x.x.x.x.x.x.x.'
    }
  },

  // Overworld: NES classic bounce (World 1-1 style)
  overworld: {
    bpm: 140,
    spb: 16,
    chords: ['C', 'C', 'F', 'G', 'C', 'G', 'C', 'G'],
    lead: {
      wave: 'square',
      v: 0.9,
      pat: 'E5:2 E5:2 .:2 E5:2 .:2 C5:2 E5:4 G5:4 .:4 G4:4 .:4 C5:3 .:3 G4:3 .:3 E4:3 A4:2 B4:2 Bb4:2 A4:2 G4:3 E5:3 G5:3 A5:4 F5:2 G5:2 .:2 E5:2 .:2 C5:2 D5:2 B4:4'
    },
    bass: {
      pat: 'R:2 .:2 5:2 R:2 R:2 .:2 5:2 R:2'
    },
    arp: {
      pat: 'R:1 3:1 5:1 3:1 R:1 3:1 5:1 8:1'
    },
    drums: {
      k: 'x...x...x...x...',
      s: '....x.......x...',
      h: 'x.x.x.x.x.x.x.x.'
    }
  },

  // Greve / Fábrica ABC: Industrial rhythmic pulse
  fabrica: {
    bpm: 128,
    spb: 16,
    chords: ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A7'],
    lead: {
      wave: 'square',
      v: 0.95,
      pat: 'D5:2 F5:2 A5:4 G5:2 F5:2 E5:4 D5:2 D5:2 F5:2 G5:2 A5:4 D5:4 F5:2 G5:2 A5:4 Bb5:2 A5:2 G5:4 F5:2 E5:2 D5:2 E5:2 F5:4 E5:4'
    },
    bass: {
      pat: 'R:2 R:2 R:2 5:2 R:2 R:2 8:2 5:2'
    },
    arp: {
      pat: 'R:1 3:1 5:1 3:1 R:1 3:1 5:1 3:1'
    },
    drums: {
      k: 'x.x...x.x.x...x.',
      s: '....x.......x...',
      h: 'xxxxxxxxxxxxxxxx'
    }
  },

  // Praia / Triplex / Guarujá: Bossa chiptune
  praia: {
    bpm: 122,
    spb: 16,
    chords: ['Fmaj7', 'G7', 'Em7', 'A7', 'Dm7', 'G7', 'C', 'C7'],
    lead: {
      wave: 'triangle',
      v: 1.1,
      pat: 'A5:3 C6:3 B5:2 G5:4 E5:4 F5:3 A5:3 G5:2 E5:4 C5:4 D5:3 F5:3 E5:2 C5:4 A4:4 B4:3 D5:3 C5:2 G4:4 C5:4'
    },
    bass: {
      pat: 'R:4 5:4 R:4 5:4'
    },
    arp: {
      pat: 'R:2 3:2 5:2 7:2 8:2 7:2 5:2 3:2'
    },
    drums: {
      k: 'x.....x...x.....',
      s: '....x.......x...',
      h: 'x.x.x.x.x.x.x.x.'
    }
  },

  // Curitiba / Vigília: Reflective minor chiptune
  curitiba: {
    bpm: 116,
    spb: 16,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'Dm', 'E7', 'Am'],
    lead: {
      wave: 'square',
      v: 0.85,
      vib: true,
      pat: 'A4:4 C5:4 B4:4 A4:4 F5:4 E5:4 D5:4 C5:4 E5:4 D5:4 C5:4 B4:4 A4:8 .:8'
    },
    bass: {
      pat: 'R:4 5:4 R:4 5:4'
    },
    arp: {
      pat: 'R:2 3:2 5:2 8:2'
    },
    drums: {
      k: 'x.......x.......',
      s: '....x.......x...',
      h: 'x...x...x...x...'
    }
  }
};

// Music Synthesizer Player
export class MusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.masterGain = null;
    this.trackGain = null;
    this.step = 0;
    this.loopCount = 0;
    this.nextStepTime = 0;
    this.compiledSongs = {};

    for (const [key, data] of Object.entries(SONGS)) {
      this.compiledSongs[key] = {
        ...data,
        CH: data.chords.map(parseChord),
        L: parsePattern(data.lead.pat),
        B: parsePattern(data.bass.pat),
        A: parsePattern(data.arp.pat)
      };
    }
  }

  tick(ctx, trackName, muted, paused) {
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { ctx.resume().catch(() => {}); } catch (e) {}
    }
    if (this.currentTrack !== trackName) {
      this.switchTrack(ctx, trackName);
    }
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = 0.28;
      this.masterGain.connect(ctx.destination);
    }

    const targetGain = muted || paused ? 0 : 0.28;
    if (Math.abs(this.masterGain.gain.value - targetGain) > 0.001) {
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
    }

    if (!this.currentTrack || !this.trackGain || muted || paused) return;

    const song = this.compiledSongs[this.currentTrack];
    if (!song) return;

    const stepDuration = 60 / song.bpm / 4;
    const now = ctx.currentTime;

    if (this.nextStepTime < now - 0.25) {
      this.nextStepTime = now + 0.05;
    }

    while (this.nextStepTime < now + 0.18) {
      this.playStep(ctx, this.trackGain, song, this.step, this.nextStepTime, this.loopCount);
      this.step++;
      const totalSteps = song.CH.length * song.spb;
      if (this.step >= totalSteps) {
        this.step = 0;
        this.loopCount++;
      }
      this.nextStepTime += stepDuration;
    }
  }

  switchTrack(ctx, trackName) {
    const now = ctx.currentTime;
    if (this.trackGain) {
      const oldGain = this.trackGain;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0, now + 0.3);
      setTimeout(() => {
        try { oldGain.disconnect(); } catch (e) {}
      }, 500);
    }

    this.currentTrack = trackName;
    this.trackGain = null;
    this.step = 0;
    this.loopCount = 0;

    if (trackName && this.compiledSongs[trackName]) {
      this.trackGain = ctx.createGain();
      this.trackGain.gain.setValueAtTime(0, now);
      this.trackGain.gain.linearRampToValueAtTime(1, now + 0.35);
      this.trackGain.connect(this.masterGain);
      this.nextStepTime = now + 0.1;
    }
  }

  playStep(ctx, dest, song, step, time, loop) {
    const stepDuration = 60 / song.bpm / 4;
    const chordIndex = Math.floor(step / song.spb) % song.CH.length;
    const chord = song.CH[chordIndex];

    // Play Lead
    const leadStep = step % song.L.len;
    for (const ev of song.L.events) {
      if (ev.at === leadStep) {
        const midi = parseNote(ev.sym);
        if (midi !== null) {
          const freq = midiToFreq(midi);
          playTone(
            ctx,
            dest,
            freq,
            time,
            ev.dur * stepDuration * 0.92,
            song.lead.wave,
            0.04 * song.lead.v,
            { vib: song.lead.vib }
          );
        }
      }
    }

    // Play Bass
    const bassStep = step % song.B.len;
    for (const ev of song.B.events) {
      if (ev.at === bassStep) {
        const midi = chordNote(chord, ev.sym, 2);
        const freq = midiToFreq(midi);
        playTone(ctx, dest, freq, time, ev.dur * stepDuration * 0.9, 'triangle', 0.06);
      }
    }

    // Play Arp
    const arpStep = step % song.A.len;
    for (const ev of song.A.events) {
      if (ev.at === arpStep) {
        const midi = chordNote(chord, ev.sym, 3);
        const freq = midiToFreq(midi);
        playTone(ctx, dest, freq, time, ev.dur * stepDuration * 0.7, 'square', 0.015, { pluck: true });
      }
    }

    // Play Drums
    if (song.drums) {
      for (const [drumType, pat] of Object.entries(song.drums)) {
        if (pat[step % pat.length] === 'x') {
          playDrum(ctx, dest, drumType, time);
        }
      }
    }
  }

  stop(ctx) {
    if (this.trackGain && ctx) {
      this.switchTrack(ctx, null);
    }
  }
}

export const music = new MusicPlayer();

