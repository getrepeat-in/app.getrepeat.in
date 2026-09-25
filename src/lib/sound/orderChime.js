let ringerInterval = null;

export const playOrderChime = () => {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playTone = (freq, startTime, duration, volume = 0.28) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Upbeat alert chime: E5 (659Hz) -> A5 (880Hz) -> C#6 (1108Hz)
    playTone(659.25, now, 0.35, 0.22);
    playTone(880.00, now + 0.14, 0.35, 0.26);
    playTone(1108.73, now + 0.28, 0.6, 0.32);
  } catch (err) {
    console.debug("[Audio] Notification sound skipped:", err);
  }
};

/**
 * Starts repeated order ringing until stopped.
 */
export const startOrderRinger = () => {
  stopOrderRinger();
  playOrderChime();
  ringerInterval = setInterval(() => {
    playOrderChime();
  }, 2800);
  return stopOrderRinger;
};

/**
 * Stops the continuous order ringing.
 */
export const stopOrderRinger = () => {
  if (ringerInterval) {
    clearInterval(ringerInterval);
    ringerInterval = null;
  }
};
