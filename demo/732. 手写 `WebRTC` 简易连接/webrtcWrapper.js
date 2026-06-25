/**
 * 手写 WebRTC 简易连接
 *
 * WebRTC 作用：
 *   - 浏览器间点对点音视频/数据传输
 *   - 核心对象：RTCPeerConnection，通过 SDP offer/answer 与 ICE 候选交换完成握手
 *
 * 实现思路：
 *   1. 封装 RTCPeerConnection 的 createOffer/Answer、setLocal/RemoteDescription
 *   2. ICE 候选交换（信令模拟）
 *   3. DataChannel 数据通道收发
 *   4. Node 环境：用 mock 模拟两端握手流程
 */

let _MockPC = null; // 单例缓存，确保所有 peer 共享同一通道桥
function getRTCPeerConnection() {
  if (typeof window !== "undefined" && typeof RTCPeerConnection !== "undefined")
    return RTCPeerConnection;
  if (_MockPC) return _MockPC; // 复用，保证 channelBridge 全局共享
  // Node mock：模拟两端 SDP/ICE 交换 + datachannel 配对
  const { EventEmitter } = require("events");
  // 通道桥：同一 label 的 offerer/answerer dataChannel 自动配对，send 互通
  const channelBridge = new Map(); // label -> offerer channel
  function makeChannel(label) {
    return {
      label,
      readyState: "connecting",
      onopen: null,
      onmessage: null,
      onclose: null,
      _peer: null,
      send(data) {
        if (this.readyState !== "open") return;
        // 投递到配对的对端通道
        if (this._peer && this._peer.onmessage) this._peer.onmessage({ data });
      },
      close() {
        this.readyState = "closed";
        this.onclose && this.onclose();
      },
    };
  }
  class MockPC extends EventEmitter {
    constructor(config) {
      super();
      this.localDescription = null;
      this.remoteDescription = null;
      this.connectionState = "new";
      this.iceConnectionState = "new";
      this._pendingCandidates = [];
      this._onicecandidate = null;
      this._ondatachannel = null;
      this._isAnswerer = false;
    }
    set onicecandidate(fn) {
      this._onicecandidate = fn;
    }
    set ondatachannel(fn) {
      this._ondatachannel = fn;
    }
    async createOffer() {
      return { type: "offer", sdp: "v=0\r\no=mock offer\r\n" };
    }
    async createAnswer() {
      return { type: "answer", sdp: "v=0\r\no=mock answer\r\n" };
    }
    async setLocalDescription(desc) {
      this.localDescription = desc;
      // 模拟 ICE 候选生成
      setTimeout(() => {
        const candidate = {
          candidate: "candidate:mock",
          sdpMid: "0",
          sdpMLineIndex: 0,
        };
        this._onicecandidate && this._onicecandidate({ candidate });
      }, 5);
      this._maybeConnect();
    }
    async setRemoteDescription(desc) {
      this.remoteDescription = desc;
      this._isAnswerer = desc.type === "offer";
      this._maybeConnect();
    }
    _maybeConnect() {
      if (!this.localDescription || !this.remoteDescription) return;
      if (this.connectionState === "connected") return;
      setTimeout(() => {
        if (this.connectionState === "connected") return;
        this.connectionState = "connected";
        this.iceConnectionState = "connected";
        this.emit("iceconnectionstatechange");
        this.emit("connectionstatechange");
        // answerer 在连接建立时收到 datachannel 事件
        if (this._isAnswerer && this._ondatachannel && channelBridge.size > 0) {
          const offererDc = [...channelBridge.values()][0];
          const answererDc = makeChannel(offererDc.label);
          offererDc._peer = answererDc;
          answererDc._peer = offererDc;
          channelBridge.delete(offererDc.label);
          this._ondatachannel({ channel: answererDc });
          setTimeout(() => {
            answererDc.readyState = "open";
            answererDc.onopen && answererDc.onopen();
          }, 5);
        }
      }, 10);
    }
    addIceCandidate(candidate) {
      this._pendingCandidates.push(candidate);
      return Promise.resolve();
    }
    createDataChannel(label) {
      const dc = makeChannel(label);
      channelBridge.set(label, dc); // offerer 注册，等待 answerer 配对
      setTimeout(() => {
        dc.readyState = "open";
        dc.onopen && dc.onopen();
      }, 15);
      return dc;
    }
    close() {
      this.connectionState = "closed";
    }
  }
  _MockPC = MockPC;
  return MockPC;
}

class WebRTCPeer {
  constructor(config = {}) {
    this.RTC = getRTCPeerConnection();
    this.pc = new this.RTC(config);
    this.dataChannel = null;
    this.role = null; // 'offer' | 'answer'
    this._onMessage = null;

    this.pc.onicecandidate = (e) => {
      if (e.candidate && this.onIceCandidate) this.onIceCandidate(e.candidate);
    };
  }

  set onIceCandidate(fn) {
    this._iceCb = fn;
  }
  get onIceCandidate() {
    return this._iceCb;
  }

  // 作为发起方：创建 offer
  async createOffer() {
    this.role = "offer";
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.dataChannel = this.pc.createDataChannel("chat");
    this.dataChannel.onmessage = (e) => this._onMessage?.(e.data);
    return offer;
  }

  // 作为接收方：响应 offer，创建 answer
  async createAnswer(offer) {
    this.role = "answer";
    await this.pc.setRemoteDescription(offer);
    this.pc.ondatachannel = (e) => {
      this.dataChannel = e.channel;
      this.dataChannel.onmessage = (ev) => this._onMessage?.(ev.data);
    };
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  // 接收对方 answer
  async acceptAnswer(answer) {
    await this.pc.setRemoteDescription(answer);
  }

  // 接收 ICE 候选
  async addIceCandidate(candidate) {
    await this.pc.addIceCandidate(candidate);
  }

  // 发送数据
  send(data) {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(data);
      return true;
    }
    return false;
  }

  onMessage(fn) {
    this._onMessage = fn;
  }

  get state() {
    return this.pc.connectionState;
  }

  close() {
    this.dataChannel?.close();
    this.pc.close();
  }
}

// ===== 测试：模拟两端握手 =====
(async () => {
  // 信令通道：用函数模拟消息传递
  const peerA = new WebRTCPeer();
  const peerB = new WebRTCPeer();

  // ICE 候选交换
  peerA.onIceCandidate = (c) => peerB.addIceCandidate(c);
  peerB.onIceCandidate = (c) => peerA.addIceCandidate(c);

  // 消息接收
  const receivedA = [];
  const receivedB = [];
  peerA.onMessage((d) => receivedA.push(d));
  peerB.onMessage((d) => receivedB.push(d));

  // 1. A 创建 offer，发给 B
  const offer = await peerA.createOffer();
  // 2. B 响应，返回 answer
  const answer = await peerB.createAnswer(offer);
  // 3. A 接受 answer
  await peerA.acceptAnswer(answer);

  // 等待连接建立
  await new Promise((r) => setTimeout(r, 30));
  console.log("A 状态:", peerA.state); // connected
  console.log("B 状态:", peerB.state); // connected
  console.log("A 数据通道:", peerA.dataChannel?.readyState); // open
  console.log("B 数据通道:", peerB.dataChannel?.readyState); // open

  // 4. 数据通信
  peerA.send("Hello from A");
  peerB.send("Hi from B");
  await new Promise((r) => setTimeout(r, 10));
  console.log("B 收到:", receivedB); // ['Hello from A']
  console.log("A 收到:", receivedA); // ['Hi from B']

  peerA.close();
  peerB.close();
  console.log("WebRTC 简易连接演示完成");
})();
