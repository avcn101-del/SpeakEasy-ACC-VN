
// Track current audio to allow stopping
let currentAudio: HTMLAudioElement | null = null;

// Initialize voices immediately
const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined') {
    loadVoices();
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

export const speak = (
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void,
    pitch: number = 1.0,
    rate: number = 1.0
) => {
  // 1. STOP all current audio
  if (currentAudio) {
    try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (typeof window === 'undefined') return;

  // 2. DECIDE: Native vs Network
  // We must decide Synchronously to preserve User Gesture for Audio.play()
  
  let useNative = false;
  let vnVoice: SpeechSynthesisVoice | undefined;

  if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      
      // Strict check: Only use native if we find a Vietnamese voice.
      // Otherwise, the browser uses the default (English), which sounds broken.
      vnVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
      
      if (vnVoice) {
          useNative = true;
      } else {
          console.warn("No Native Vietnamese voice found. Switching to Network Audio.");
      }
  }

  if (useNative && vnVoice) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = vnVoice;
    utterance.lang = 'vi-VN'; 
    utterance.pitch = pitch; 
    utterance.rate = rate;

    utterance.onstart = () => {
        if (onStart) onStart();
    };
    utterance.onend = () => {
        if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
        console.warn("Native TTS Error:", e);
        // If native fails mid-stream, we can't do much without user gesture, 
        // but we can try network fallback just in case.
        if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } else {
    // 3. Network TTS Fallback
    playNetworkTTS(text, pitch, rate, onStart, onEnd);
  }
};

const playNetworkTTS = (text: string, pitch: number, rate: number, onStart?: () => void, onEnd?: () => void) => {
    // Primary: Google Translate TTS (Client=gtx) - usually most reliable
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=gtx`;
    
    // Backup: If we needed a secondary URL, we could chain them, but simple is better for now.
    
    const audio = new Audio(url);
    currentAudio = audio;
    
    // Attempt to handle pitch/rate for Audio element
    try {
        if (Math.abs(pitch - 1.0) > 0.1 || Math.abs(rate - 1.0) > 0.1) {
            audio.playbackRate = rate * pitch; 
            // Non-standard props to try and alter pitch vs speed
            if ('preservesPitch' in audio) (audio as any).preservesPitch = false;
            else if ('mozPreservesPitch' in audio) (audio as any).mozPreservesPitch = false;
            else if ('webkitPreservesPitch' in audio) (audio as any).webkitPreservesPitch = false;
        } else {
            audio.playbackRate = 1.0;
        }
    } catch (e) {}

    audio.onplay = () => { if (onStart) onStart(); };
    audio.onended = () => { currentAudio = null; if (onEnd) onEnd(); };
    audio.onerror = (e) => {
        console.error("Network Audio Failed", e);
        currentAudio = null;
        if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Playback prevented. User interaction required.", error);
            if (onEnd) onEnd();
        });
    }
}
