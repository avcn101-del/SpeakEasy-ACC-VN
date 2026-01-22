
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
    rate: number = 1.0,
    forceOnline: boolean = false
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
  let useNative = false;
  let vnVoice: SpeechSynthesisVoice | undefined;

  // Only check native if we are NOT forcing online
  if (!forceOnline && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      // Strict check for Vietnamese
      vnVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
      if (vnVoice) {
          useNative = true;
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
        // Fallback if native crashes (though usually it just silently fails)
        playNetworkTTS(text, pitch, rate, onStart, onEnd);
    };

    window.speechSynthesis.speak(utterance);
  } else {
    // 3. Network TTS Fallback (or Forced)
    playNetworkTTS(text, pitch, rate, onStart, onEnd);
  }
};

const playNetworkTTS = (text: string, pitch: number, rate: number, onStart?: () => void, onEnd?: () => void) => {
    const cleanText = text.trim();
    const isSingleWord = !cleanText.includes(' ') && cleanText.length < 10;
    
    // 1. Punctuation Logic
    // For single words, we purposefully REMOVE punctuation to get the rawest sound sample,
    // relying on the speed boost to handle finality. Adding a dot sometimes adds a lingering effect.
    let query = cleanText;
    if (!isSingleWord) {
        const hasPunctuation = ['.', '!', '?'].some(char => cleanText.endsWith(char));
        query = hasPunctuation ? cleanText : `${cleanText}.`;
    }
    
    // 2. Cache Buster: Prevent stale audio
    const timestamp = Date.now();

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(query)}&tl=vi&client=tw-ob&t=${timestamp}`;
    
    const audio = new Audio(url);
    currentAudio = audio;
    
    // 3. Short Word Speed Hack (Aggressive):
    // Single words with heavy tones (like "Mẹ") produce a "dragged out" artifact on Google TTS.
    // We boost playback speed to 1.5x (50% faster) to clip this tail.
    // This makes the word sound snappy and natural.
    let finalRate = rate;
    
    // Only apply if user hasn't set a custom rate
    if (isSingleWord && Math.abs(rate - 1.0) < 0.1) {
        finalRate = 1.5; 
    }

    try {
        // SCENARIO A: Pitch Shifted (Child Mode)
        // Disable pitch preservation to allow chipmunk effect
        if (Math.abs(pitch - 1.0) > 0.1) {
            audio.playbackRate = finalRate * pitch; 
            
            if ('preservesPitch' in audio) (audio as any).preservesPitch = false;
            else if ('mozPreservesPitch' in audio) (audio as any).mozPreservesPitch = false;
            else if ('webkitPreservesPitch' in audio) (audio as any).webkitPreservesPitch = false;
        } 
        // SCENARIO B: Normal Pitch
        // Apply speed boost but PRESERVE pitch (default browser behavior), so it just sounds faster, not higher.
        else {
            audio.playbackRate = finalRate;
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
