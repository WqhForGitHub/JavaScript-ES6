/**
 * 手写 Speech API 语音合成
 *
 * Web Speech API 作用：
 *   - SpeechSynthesis：文字转语音（TTS）
 *   - SpeechRecognition：语音识别（STT，部分浏览器支持）
 *
 * 实现思路：
 *   1. 封装 speak（队列、速率、音调、音量）
 *   2. 语音列表选择
 *   3. 暂停/恢复/取消
 *   4. 边界事件（朗读到哪句/哪个字）
 *   5. Node 环境：mock SpeechSynthesis 验证流程
 */

function getSpeechSynthesis() {
  if (typeof speechSynthesis !== "undefined") return speechSynthesis;
  // Node mock
  const { EventEmitter } = require("events");
  class MockUtterance extends EventEmitter {
    constructor(text) {
      super();
      this.text = text;
      this.lang = "zh-CN";
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onboundary = null;
      this.onpause = null;
      this.onresume = null;
    }
  }
  const queue = [];
  let speaking = false;
  let current = null;
  let paused = false;
  const synth = {
    pending: false,
    speaking: false,
    paused: false,
    getVoices() {
      return [
        { name: "zh-CN-1", lang: "zh-CN", default: true },
        { name: "en-US-1", lang: "en-US" },
        { name: "ja-JP-1", lang: "ja-JP" },
      ];
    },
    speak(u) {
      queue.push(u);
      this.pending = true;
      this._next();
    },
    _next() {
      if (speaking || queue.length === 0) return;
      current = queue.shift();
      speaking = true;
      this.speaking = true;
      this.pending = queue.length > 0;
      const u = current; // 捕获当前 utterance，防止 cancel 后 current=null 导致报错
      setTimeout(() => {
        if (current !== u) return; // 已被取消或替换
        u.onstart && u.onstart();
        // 模拟边界事件（按字）
        const chars = u.text.split("");
        chars.forEach((ch, i) => {
          setTimeout(() => {
            if (current !== u) return;
            if (u.onboundary)
              u.onboundary({ charIndex: i, charLength: 1, name: "word" });
          }, i * 5);
        });
        const totalMs = chars.length * 5 + 10;
        setTimeout(() => {
          if (current !== u) return;
          u.onend && u.onend();
          speaking = false;
          this.speaking = queue.length > 0;
          current = null;
          this._next();
        }, totalMs);
      }, 5);
    },
    cancel() {
      queue.length = 0;
      if (current) {
        current.onend && current.onend();
        current = null;
      }
      speaking = false;
      this.speaking = false;
      this.pending = false;
      paused = false;
      this.paused = false;
    },
    pause() {
      paused = true;
      this.paused = true;
      current && current.onpause && current.onpause();
    },
    resume() {
      paused = false;
      this.paused = false;
      current && current.onresume && current.onresume();
    },
    _emitter: new EventEmitter(),
    addEventListener(t, fn) {
      this._emitter.on(t, fn);
    },
  };
  return synth;
}

function getSpeechUtteranceClass() {
  if (typeof SpeechSynthesisUtterance !== "undefined")
    return SpeechSynthesisUtterance;
  const { EventEmitter } = require("events");
  return class extends EventEmitter {
    constructor(text) {
      super();
      this.text = text;
      this.lang = "zh-CN";
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onboundary = null;
    }
  };
}

class SpeechWrapper {
  constructor() {
    this.synth = getSpeechSynthesis();
    this.Utterance = getSpeechUtteranceClass();
    this._voices = [];
    this._loadVoices();
    // 语音列表可能异步加载
    if (this.synth.addEventListener) {
      this.synth.addEventListener("voiceschanged", () => this._loadVoices());
    }
  }

  _loadVoices() {
    this._voices = this.synth.getVoices() || [];
  }

  getVoices() {
    if (this._voices.length === 0) this._loadVoices();
    return this._voices;
  }

  // 按语言选语音
  pickVoice(lang) {
    return this.getVoices().find((v) => v.lang === lang) || this.getVoices()[0];
  }

  /**
   * 朗读文本
   * @param {string} text
   * @param {object} opts { lang, rate, pitch, volume, voice, onBoundary, onEnd }
   */
  speak(text, opts = {}) {
    const u = new this.Utterance(text);
    u.lang = opts.lang || "zh-CN";
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    u.volume = opts.volume ?? 1;
    if (opts.voice) u.voice = opts.voice;
    else u.voice = this.pickVoice(u.lang);

    return new Promise((resolve) => {
      u.onend = () => {
        opts.onEnd?.();
        resolve();
      };
      if (opts.onBoundary) u.onboundary = opts.onBoundary;
      u.onerror = (e) => {
        console.error("[Speech] 朗读错误:", e);
        resolve();
      };
      this.synth.speak(u);
    });
  }

  // 朗读队列（多段文本顺序播放）
  async speakQueue(texts, opts = {}) {
    for (const text of texts) {
      await this.speak(text, opts);
    }
  }

  pause() {
    this.synth.pause();
  }
  resume() {
    this.synth.resume();
  }
  cancel() {
    this.synth.cancel();
  }

  get speaking() {
    return this.synth.speaking;
  }
  get pending() {
    return this.synth.pending;
  }
}

// ===== 测试 =====
(async () => {
  const speech = new SpeechWrapper();

  // --- 语音列表 ---
  const voices = speech.getVoices();
  console.log("语音数量:", voices.length); // 3
  console.log("中文语音:", voices.find((v) => v.lang === "zh-CN").name); // 'zh-CN-1'

  // --- 单段朗读 ---
  const boundaries = [];
  await speech.speak("你好世界", {
    lang: "zh-CN",
    rate: 1.2,
    onBoundary: (e) => boundaries.push(e.charIndex),
    onEnd: () => console.log("单段朗读结束"),
  });
  console.log("单段朗读结束"); // 单段朗读结束
  console.log("边界事件数:", boundaries.length); // 4（4 个字）

  // --- 队列朗读 ---
  const played = [];
  await speech.speakQueue(["第一句", "第二句", "第三句"], {
    onEnd: () => played.push("done"),
  });
  console.log("队列朗读完成:", played.length); // 3

  // --- 暂停/恢复/取消 ---
  speech.speak("这段会被取消");
  speech.cancel();
  console.log("取消后 speaking:", speech.speaking); // false

  console.log("Speech API 语音合成演示完成");
})();
