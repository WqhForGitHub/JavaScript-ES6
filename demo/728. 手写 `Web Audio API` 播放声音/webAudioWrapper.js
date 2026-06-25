/**
 * 手写 Web Audio API 播放声音
 *
 * Web Audio API 作用：
 *   - 通过 AudioContext 生成、处理、播放音频
 *   - 可合成音色（振荡器）、加载音频文件、应用效果链
 *
 * 实现思路：
 *   1. AudioContext 单例管理
 *   2. 振荡器合成：beep（频率/时长/音量）
 *   3. 音符序列播放（旋律）
 *   4. 音频文件加载与播放
 *   5. Node 环境：mock AudioContext 记录调用
 */

function getAudioContext() {
  if (typeof AudioContext !== "undefined") return new AudioContext();
  if (typeof webkitAudioContext !== "undefined")
    return new webkitAudioContext();
  // Node mock
  return createMockAudioContext();
}

function createMockAudioContext() {
  const nodes = [];
  const ctx = {
    currentTime: 0,
    destination: { _type: "destination" },
    sampleRate: 44100,
    state: "running",
    resume() {
      return Promise.resolve();
    },
    suspend() {
      return Promise.resolve();
    },
    close() {
      return Promise.resolve();
    },
    createOscillator() {
      const osc = {
        _type: "oscillator",
        frequency: { value: 440 },
        type: "sine",
        connect: (n) => {
          nodes.push(["osc->", n._type]);
          return n;
        },
        start(t) {
          nodes.push(["start", t]);
        },
        stop(t) {
          nodes.push(["stop", t]);
        },
      };
      return osc;
    },
    createGain() {
      const gain = {
        _type: "gain",
        gain: {
          value: 1,
          setValueAtTime(v, t) {
            this.value = v;
          },
          exponentialRampToValueAtTime(v, t) {
            this.value = v;
          },
          linearRampToValueAtTime(v, t) {
            this.value = v;
          },
        },
        connect: (n) => {
          nodes.push(["gain->", n._type]);
          return n;
        },
      };
      return gain;
    },
    createBufferSource() {
      return {
        _type: "bufferSource",
        buffer: null,
        loop: false,
        connect: (n) => n,
        start() {},
        stop() {},
      };
    },
    createBuffer(channels, length, sampleRate) {
      return {
        numberOfChannels: channels,
        length,
        sampleRate,
        getChannelData: () => new Float32Array(length),
      };
    },
    decodeAudioData(arr) {
      return Promise.resolve({ duration: arr.length / 44100 });
    },
    _nodes: nodes,
  };
  return ctx;
}

class WebAudioPlayer {
  constructor() {
    this.ctx = getAudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
  }

  // 音量控制（0-1）
  setVolume(v) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  /**
   * 合成一个音符
   * @param {number} freq 频率 Hz
   * @param {number} duration 时长秒
   * @param {object} opts { type, startTime, volume }
   */
  beep(freq, duration, opts = {}) {
    const {
      type = "sine",
      startTime = this.ctx.currentTime,
      volume = 0.5,
    } = opts;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // 包络：快速上升 + 平稳 + 快速衰减，避免爆音
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return { osc, gain };
  }

  // 播放音符序列
  playMelody(notes, tempo = 120) {
    const beat = 60 / tempo; // 每拍秒数
    let t = this.ctx.currentTime;
    notes.forEach(({ freq, beats = 1 }) => {
      this.beep(freq, beat * beats * 0.9, { startTime: t });
      t += beat * beats;
    });
    return t - this.ctx.currentTime; // 总时长
  }

  // 加载音频文件并播放
  async playFile(arrayBuffer) {
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.masterGain);
    source.start();
    return audioBuffer.duration;
  }
}

// 音符频率表
const NOTE_FREQ = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

// ===== 测试 =====
(async () => {
  const player = new WebAudioPlayer();

  // --- 音量 ---
  player.setVolume(0.8);
  console.log("主音量:", player.masterGain.gain.value); // 0.8

  // --- 单音 ---
  player.beep(NOTE_FREQ.A4, 0.2);
  console.log("beep 节点记录:", player.ctx._nodes.length > 0); // true

  // --- 旋律（小星星片段）---
  const melody = [
    { freq: NOTE_FREQ.C4, beats: 1 },
    { freq: NOTE_FREQ.C4, beats: 1 },
    { freq: NOTE_FREQ.G4, beats: 1 },
    { freq: NOTE_FREQ.G4, beats: 1 },
    { freq: NOTE_FREQ.A4, beats: 1 },
    { freq: NOTE_FREQ.A4, beats: 1 },
    { freq: NOTE_FREQ.G4, beats: 2 },
  ];
  const total = player.playMelody(melody, 120);
  console.log("旋律总时长:", +total.toFixed(2), "秒"); // 4.0（8 拍 × 0.5s）

  // --- 不同波形 ---
  ["sine", "square", "sawtooth", "triangle"].forEach((type) => {
    player.beep(NOTE_FREQ.E4, 0.1, { type });
  });

  // --- 音频文件（mock decodeAudioData）---
  const fakeBuffer = new Uint8Array(44100); // 1 秒
  const duration = await player.playFile(fakeBuffer);
  console.log("音频时长:", +duration.toFixed(2), "秒"); // 1.0

  console.log("Web Audio API 演示完成");
})();
