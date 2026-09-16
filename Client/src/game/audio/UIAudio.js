/**
 * UIAudio.js
 * Procedural Web Audio API synthesizer for tactile interface feedback:
 * button clicks, lever detent notches, toggle switches, modal transitions, and alert pings.
 */

export class UIAudio {
  /**
   * Initializes audio nodes and parameters for UI sound synthesis.
   */
  constructor(audioCtx, outputGainNode) {
    this.audioCtx = audioCtx;
    this.outputGain = outputGainNode;
    this.isInitialized = false;

    // Sub-bus for UI audio
    this.uiGain = null;
  }

  /**
   * Builds audio graph for UI feedback upon user interaction.
   */
  init() {
    if (this.isInitialized || !this.audioCtx) return;

    try {
      const tmp_now = this.audioCtx.currentTime;

      // Master UI gain bus
      this.uiGain = this.audioCtx.createGain();
      this.uiGain.gain.setValueAtTime(0.85, tmp_now);
      this.uiGain.connect(this.outputGain);

      this.isInitialized = true;
    } catch (err) {
      console.warn('UIAudio init error:', err);
    }
  }

  /**
   * Synthesizes a crisp tactile industrial button click.
   */
  playButtonClick() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'triangle';
    tmp_osc.frequency.setValueAtTime(1600, tmp_now);
    tmp_osc.frequency.exponentialRampToValueAtTime(320, tmp_now + 0.028);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.3, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.03);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.uiGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.035);
  }

  /**
   * Synthesizes a heavy mechanical notch detent snap for throttle and brake levers.
   */
  playLeverNotch() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // Sharp percussive transient
    const tmp_osc1 = this.audioCtx.createOscillator();
    tmp_osc1.type = 'sine';
    tmp_osc1.frequency.setValueAtTime(980, tmp_now);
    tmp_osc1.frequency.exponentialRampToValueAtTime(140, tmp_now + 0.035);

    const tmp_gain1 = this.audioCtx.createGain();
    tmp_gain1.gain.setValueAtTime(0.35, tmp_now);
    tmp_gain1.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.04);

    tmp_osc1.connect(tmp_gain1);
    tmp_gain1.connect(this.uiGain);
    tmp_osc1.start(tmp_now);
    tmp_osc1.stop(tmp_now + 0.045);

    // Subtle low body clack
    const tmp_osc2 = this.audioCtx.createOscillator();
    tmp_osc2.type = 'triangle';
    tmp_osc2.frequency.setValueAtTime(320, tmp_now);
    tmp_osc2.frequency.exponentialRampToValueAtTime(80, tmp_now + 0.05);

    const tmp_gain2 = this.audioCtx.createGain();
    tmp_gain2.gain.setValueAtTime(0.2, tmp_now);
    tmp_gain2.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.055);

    tmp_osc2.connect(tmp_gain2);
    tmp_gain2.connect(this.uiGain);
    tmp_osc2.start(tmp_now);
    tmp_osc2.stop(tmp_now + 0.06);
  }

  /**
   * Synthesizes a solid industrial toggle switch click (reverser, headlight switch).
   */
  playSwitchToggle() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'square';
    tmp_osc.frequency.setValueAtTime(1250, tmp_now);
    tmp_osc.frequency.exponentialRampToValueAtTime(220, tmp_now + 0.04);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.22, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.045);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.uiGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.05);
  }

  /**
   * Synthesizes a smooth modal dialog reveal whoosh/chime.
   */
  playModalOpen() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // Upward harmonic progression
    const arr_notes = [523.25, 659.25]; // C5 -> E5
    arr_notes.forEach((freq, idx) => {
      const tmp_start = tmp_now + idx * 0.08;
      const tmp_osc = this.audioCtx.createOscillator();
      tmp_osc.type = 'sine';
      tmp_osc.frequency.setValueAtTime(freq, tmp_start);

      const tmp_gain = this.audioCtx.createGain();
      tmp_gain.gain.setValueAtTime(0.001, tmp_now);
      tmp_gain.gain.setValueAtTime(0.25, tmp_start);
      tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_start + 0.25);

      tmp_osc.connect(tmp_gain);
      tmp_gain.connect(this.uiGain);
      tmp_osc.start(tmp_start);
      tmp_osc.stop(tmp_start + 0.28);
    });
  }

  /**
   * Synthesizes a subtle modal dialog dismiss sound.
   */
  playModalClose() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'sine';
    tmp_osc.frequency.setValueAtTime(587.33, tmp_now); // D5
    tmp_osc.frequency.exponentialRampToValueAtTime(392.0, tmp_now + 0.15); // G4

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.2, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.16);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.uiGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.18);
  }

  /**
   * Synthesizes an affirmative confirmation beep for controls/key rebinding.
   */
  playKeyRebind() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'sine';
    tmp_osc.frequency.setValueAtTime(1046.5, tmp_now); // C6

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.25, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.12);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.uiGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.14);
  }
}
