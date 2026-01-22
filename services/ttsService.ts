
// Track current audio to allow stopping
let currentAudio: HTMLAudioElement | null = null;

// Initialize voices immediately
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}

export const speak = (
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void,
    pitch: number = 1.0,
    rate: number = 1.0
) => {
  // 1. STOP all current audio (Network)
  if (currentAudio) {
    try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  
  // Stop Native TTS
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (typeof window === 'undefined') return;

  // 2. Check for Native Vietnamese Voice
  let selectedVoice: SpeechSynthesisVoice | null = null;
  
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    // Broad filtering for VN voices
    selectedVoice = voices.find(v => 
        v.lang.toLowerCase().includes('vi') || 
        v.name.toLowerCase().includes('viet') ||
        v.name.toLowerCase().includes('linh')
    ) || null;
  }

  // Helper to handle end of speech
  const handleEnd = () => {
    if (onEnd) onEnd();
  };

  const handleStart = () => {
    if (onStart) onStart();
  }

  // 3. DECISION: Native vs Fallback
  if (selectedVoice) {
    // OPTION A: Use Native (Fast, Offline)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'vi-VN'; 
    utterance.pitch = pitch; 
    utterance.rate = rate;   
    
    utterance.onstart = handleStart;
    utterance.onend = handleEnd;
    utterance.onerror = (e) => {
        console.warn("Native TTS Error, trying fallback", e);
        playNetworkTTS(text, pitch, rate, handleStart, handleEnd);
    };

    window.speechSynthesis.speak(utterance);
  } else {
    // OPTION B: Network Fallback (HTML5 Audio)
    playNetworkTTS(text, pitch, rate, handleStart, handleEnd);
  }
};

const playNetworkTTS = (text: string, pitch: number, rate: number, onStart?: () => void, onEnd?: () => void) => {
    try {
        const encodedText = encodeURIComponent(text);
        // Using Google Translate TTS API (Client-side usage requires direct Audio element, not fetch, to avoid CORS)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodedText}`;
        
        const audio = new Audio(url);
        currentAudio = audio;
        
        // PITCH & RATE LOGIC FOR AUDIO ELEMENT
        // HTML5 Audio doesn't support independent pitch shifting easily.
        // We simulate it by disabling pitch preservation (if pitch != 1.0) and modifying rate.
        
        // If Pitch = 1.5 (High) and Rate = 1.0 -> Play at 1.5x speed (Chipmunk)
        // If Pitch = 0.5 (Low) and Rate = 1.0 -> Play at 0.5x speed (Slow/Deep)
        
        try {
            if (Math.abs(pitch - 1.0) > 0.1) {
                const effectiveRate = rate * pitch;
                audio.playbackRate = effectiveRate;
                
                // Disable pitch preservation to allow pitch shift (Chipmunk effect)
                // This property is non-standard but supported in many browsers
                if ('preservesPitch' in audio) {
                    (audio as any).preservesPitch = false;
                } else if ('mozPreservesPitch' in audio) {
                    (audio as any).mozPreservesPitch = false;
                } else if ('webkitPreservesPitch' in audio) {
                    (audio as any).webkitPreservesPitch = false;
                }
            } else {
                audio.playbackRate = rate;
            }
        } catch (e) {
            console.warn("Could not set playback rate/pitch", e);
        }
        
        audio.onplay = () => {
            if (onStart) onStart();
        };
        
        audio.onended = () => {
            currentAudio = null;
            if (onEnd) onEnd();
        };
        
        audio.onerror = (e) => {
            console.warn("Network TTS playback failed (Offline or blocked)", e);
            currentAudio = null;
            if (onEnd) onEnd();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Audio play blocked or failed:", error);
                if (onEnd) onEnd();
            });
        }
    } catch (e) {
        console.error("Fallback TTS Critical Error:", e);
        if (onEnd) onEnd();
    }
}
