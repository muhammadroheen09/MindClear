import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Feather, Sparkles, Bell, Shield, Cloud, CloudRain, 
  CloudLightning, SunMedium, Wind, Mic, Check, X, Sparkle, 
  BookOpen, Clock, Heart, ArrowRight, Download, Volume2, VolumeX, AlertCircle
} from 'lucide-react';
import Terms from './Terms';
import Privacy from './privacy';

// --- Web Audio API Procedural Ambient Sound Generator with Volume Control ---
class AmbientSoundGenerator {
  constructor() {
    this.ctx = null;
    this.rainNode = null;
    this.fireNode = null;
    this.libraryNode = null;
    this.currentSound = null;
    this.volume = 0.15;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = val;
    if (this.rainNode && this.rainNode.gain) this.rainNode.gain.gain.value = val;
    if (this.fireNode && this.fireNode.gain) this.fireNode.gain.gain.value = val;
    if (this.libraryNode && this.libraryNode.gain) this.libraryNode.gain.gain.value = val;
  }

  playRain() {
    this.stop();
    this.init();
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.rainNode = { source: whiteNoise, gain: gainNode };
    this.currentSound = 'rain';
  }

  playLibrary() {
    this.stop();
    this.init();
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 3.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume * 0.6;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.libraryNode = { source: whiteNoise, gain: gainNode };
    this.currentSound = 'library';
  }

  playFire() {
    this.stop();
    this.init();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.002) {
        output[i] = (Math.random() * 2 - 1) * 0.8;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.05;
      }
    }

    const crackle = this.ctx.createBufferSource();
    crackle.buffer = noiseBuffer;
    crackle.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume * 0.8;

    crackle.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    crackle.start();
    this.fireNode = { source: crackle, gain: gainNode };
    this.currentSound = 'fire';
  }

  stop() {
    if (this.rainNode) {
      try { this.rainNode.source.stop(); } catch(e){}
      this.rainNode = null;
    }
    if (this.libraryNode) {
      try { this.libraryNode.source.stop(); } catch(e){}
      this.libraryNode = null;
    }
    if (this.fireNode) {
      try { this.fireNode.source.stop(); } catch(e){}
      this.fireNode = null;
    }
    this.currentSound = null;
  }
}

const soundGen = new AmbientSoundGenerator();

// Weather / Mood icons mapping
const MOODS = [
  { level: 1, label: 'storm', icon: CloudLightning, tint: 'rgba(74, 85, 104, 0.07)' },
  { level: 2, label: 'rain', icon: CloudRain, tint: 'rgba(107, 142, 120, 0.06)' },
  { level: 3, label: 'fog', icon: Wind, tint: 'rgba(156, 163, 175, 0.06)' },
  { level: 4, label: 'clouds', icon: Cloud, tint: 'rgba(217, 119, 6, 0.05)' },
  { level: 5, label: 'clear', icon: SunMedium, tint: 'rgba(234, 179, 8, 0.06)' },
];

export default function App() {
  // Verification & Legal States
  const [isVerified, setIsVerified] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Legal Modal States for Clickable Links
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('today');

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('mc_theme') === 'dark';
  });

  // Persistent Entries (Clean Initial State)
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('mc_entries');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [];
  });

  // Today's Form State
  const todayKey = new Date().toISOString().split('T')[0];
  const [brainDumpText, setBrainDumpText] = useState('');
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [selectedMood, setSelectedMood] = useState(3);
  const [resetStress, setResetStress] = useState('');
  const [resetWin, setResetWin] = useState('');
  const [resetGratitude, setResetGratitude] = useState('');
  const [isTodayCleared, setIsTodayCleared] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [showGroundingCard, setShowGroundingCard] = useState(false);

  // Audio / Speech State
  const [activeSound, setActiveSound] = useState(null);
  const [soundVolume, setSoundVolume] = useState(0.15);
  const [isListening, setIsListening] = useState(false);

  // Breathing Overlay State
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); 
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycle, setBreathCycle] = useState(1);
  const [breathFinished, setBreathFinished] = useState(false);

  // Reminders State
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem('mc_reminder_enabled') !== 'false';
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('mc_reminder_time') || '21:00';
  });

  // Gratitude Jar State
  const [revealedMemory, setRevealedMemory] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  // History Tab Filter State
  const [historyRange, setHistoryRange] = useState('weekly');

  // Streak & Shields calculation
  const completedCount = entries.filter(e => e.completed).length + (isTodayCleared ? 1 : 0);

  // Sync entries to local storage
  useEffect(() => {
    localStorage.setItem('mc_entries', JSON.stringify(entries));
  }, [entries]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('mc_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync reminder settings
  useEffect(() => {
    localStorage.setItem('mc_reminder_enabled', reminderEnabled);
    localStorage.setItem('mc_reminder_time', reminderTime);
  }, [reminderEnabled, reminderTime]);

  // Trigger Grounding Card if storm mood selected
  useEffect(() => {
    if (selectedMood === 1) {
      setShowGroundingCard(true);
    } else {
      setShowGroundingCard(false);
    }
  }, [selectedMood]);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Handle ambient sound toggle & volume
  const toggleSound = (soundType) => {
    if (activeSound === soundType) {
      soundGen.stop();
      setActiveSound(null);
    } else {
      if (soundType === 'rain') soundGen.playRain();
      if (soundType === 'library') soundGen.playLibrary();
      if (soundType === 'fire') soundGen.playFire();
      setActiveSound(soundType);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    soundGen.setVolume(val);
  };

  // Speech Recognition Handler
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice transcription is not supported in this browser engine.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setBrainDumpText(prev => (prev + ' ' + transcript).trim());
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Clear Mind Disappearing Ink Animation
  const handleClearMind = () => {
    if (!brainDumpText.trim() && !resetStress && !resetWin && !resetGratitude) return;
    
    setIsDisappearing(true);
    setTimeout(() => {
      setBrainDumpText('');
      setIsDisappearing(false);
      setIsTodayCleared(true);

      const affirmations = [
        "Your mind is a sky. Thoughts are just clouds passing through.",
        "You have released the noise. Tonight, sleep lighter.",
        "What is done is done. What remains is calm.",
        "Softness is your strength. Rest well today."
      ];
      setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);

      const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
      const newEntry = {
        id: todayKey,
        date: dateStr,
        mood: selectedMood,
        stress: resetStress || 'General overthinking released',
        win: resetWin || 'Took time for self-care today',
        gratitude: resetGratitude || 'A moment of stillness',
        completed: true,
        shieldUsed: false
      };

      setEntries(prev => [newEntry, ...prev.filter(e => e.id !== todayKey)]);
    }, 1000);
  };

  // Guided Breathing Logic
  useEffect(() => {
    let interval = null;
    if (showBreathing && !breathFinished) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev > 1) return prev - 1;

          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 4;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 4;
          } else if (breathPhase === 'exhale') {
            if (breathCycle >= 5) {
              setBreathFinished(true);
              return 0;
            } else {
              setBreathCycle(c => c + 1);
              setBreathPhase('inhale');
              return 4;
            }
          }
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showBreathing, breathPhase, breathCycle, breathFinished]);

  const startBreathing = () => {
    setBreathPhase('inhale');
    setBreathTimer(4);
    setBreathCycle(1);
    setBreathFinished(false);
    setShowBreathing(true);
  };

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 17) return 'Good afternoon.';
    return 'Winding down.';
  };

  // Export Reflections / Memories to Markdown File
  const handleExportData = () => {
    if (entries.length === 0) return;
    
    let markdownContent = `# MindClear — Field Notes & Memories\n\n`;
    entries.forEach((entry, idx) => {
      markdownContent += `### Entry ${idx + 1} — ${entry.date}\n`;
      markdownContent += `- **Mood Level**: ${entry.mood}/5\n`;
      if (entry.stress) markdownContent += `- **Weighing On You**: ${entry.stress}\n`;
      if (entry.win) markdownContent += `- **Small Win**: ${entry.win}\n`;
      if (entry.gratitude) markdownContent += `- **Grateful For**: ${entry.gratitude}\n`;
      markdownContent += `\n---\n\n`;
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mind Clear_Field_Notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentMoodObj = MOODS.find(m => m.level === selectedMood) || MOODS[2];

  // Pick random memory for jar
  const handleShakeJar = () => {
    const memories = entries.filter(e => e.gratitude || e.win);
    if (memories.length === 0) return;
    setIsShaking(true);
    setTimeout(() => {
      const random = memories[Math.floor(Math.random() * memories.length)];
      setRevealedMemory(random);
      setIsShaking(false);
    }, 600);
  };

  return (
    <div 
      className={`min-h-screen w-full transition-colors duration-700 select-none flex justify-center relative overflow-x-hidden ${
        darkMode ? 'bg-[#121212] text-[#E5E0D8]' : 'bg-[#FBF9F5] text-[#2C2A29]'
      }`}
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: darkMode 
          ? '#121212' 
          : selectedMood ? currentMoodObj.tint : '#FBF9F5'
      }}
    >
      {/* Age & Legal Verification Modal */}
      {!isVerified && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4 border ${darkMode ? 'bg-[#1e1c1b] border-white/10 text-[#E5E0D8]' : 'bg-white border-black/10 text-[#2C2A29]'}`}>
            <h2 className="text-xl font-serif italic font-medium">Welcome to MindClear</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Before proceeding, please review and accept our legal terms. Mind Clear is a private self-care journaling tool and is <strong>not</strong> a substitute for professional medical advice or therapy.
            </p>
            
            {/* Interactive Compliance Checkboxes with Clickable Legal Links */}
            <div className="space-y-3 pt-2 text-xs opacity-90">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedAge}
                  onChange={(e) => setAgreedAge(e.target.checked)}
                  className="mt-0.5 accent-amber-600 cursor-pointer"
                />
                <span>I confirm that I am at least 13 years of age.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 accent-amber-600 cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowPrivacyModal(true)} 
                    className="underline text-amber-600 hover:text-amber-500 font-medium cursor-pointer"
                  >
                    Privacy Policy
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal(true)} 
                    className="underline text-amber-600 hover:text-amber-500 font-medium cursor-pointer"
                  >
                    Terms & Conditions
                  </button> (Non-custodial, client-side browser storage).
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button 
                onClick={() => {
                  localStorage.setItem('mc_verified', 'true');
                  setIsVerified(true);
                }}
                disabled={!agreedAge || !agreedTerms}
                className="bg-amber-600/90 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Legal Modals when clicked */}
      {showTermsModal && <Terms onClose={() => setShowTermsModal(false)} darkMode={darkMode} />}
      {showPrivacyModal && <Privacy onClose={() => setShowPrivacyModal(false)} darkMode={darkMode} />}

      {/* Background Ambient Glowing Blur Pools for Desktop Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-700 ${
          darkMode ? 'bg-amber-950/20' : 'bg-[#F5E6CA]'
        }`} />
        <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 transition-colors duration-700 ${
          darkMode ? 'bg-emerald-950/20' : 'bg-[#E8D5B7]'
        }`} />

        {/* Ambient Floating Dust Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full pointer-events-none animate-dust ${
              darkMode ? 'bg-amber-300/10' : 'bg-amber-900/10'
            }`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${12 + i * 4}s`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Background Paper Micro Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25 dark:opacity-5 mix-blend-multiply z-0"
        style={{
          backgroundImage: `radial-gradient(#2C2A29 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Responsive Paper Card Container */}
      <div className="w-full max-w-md md:max-w-xl min-h-screen flex flex-col justify-between relative z-10 pb-32 px-5 sm:px-8 pt-6 md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-[#EAE3D2] md:dark:border-stone-800/80 md:bg-white/80 md:dark:bg-stone-900/40 backdrop-blur-sm">

        {/* --- HEADER --- */}
        <header className="flex items-center justify-between py-3 mb-4 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800 dark:text-emerald-400 stroke-[1.5]" />
            <h1 className="text-2xl font-serif italic tracking-tight font-medium text-stone-900 dark:text-stone-100">
              MindClear
            </h1>
            {/* Symmetrical Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 ml-1 flex items-center justify-center rounded-full bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 hover:opacity-80 transition-opacity active:scale-95"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Daily Pause Streak Tracker */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-200/40 dark:bg-stone-800/60 text-xs font-mono">
              <span className="text-[10px] tracking-wider text-stone-500 uppercase mr-1">PAUSE</span>
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i < (completedCount % 8) 
                      ? 'bg-amber-600 dark:bg-amber-400 scale-110 shadow-[0_0_6px_rgba(217,119,6,0.6)]' 
                      : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* --- TAB CONTENT --- */}
        <main className="flex-1 flex flex-col">
          {/* ================= TAB 1: TODAY ================= */}
          {activeTab === 'today' && (
            <div className="flex-1 flex flex-col gap-7 animate-fadeIn">
              
              {/* 1. Time-aware Greeting Card */}
              <section className="space-y-1 p-5 rounded-2xl bg-white/60 dark:bg-stone-900/50 border border-[#EAE3D2] dark:border-stone-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <p className="text-[11px] font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h2 className="text-4xl font-serif italic text-stone-800 dark:text-stone-100 font-normal">
                  {getGreeting()}
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 italic">
                  Let your thoughts settle like dust in still air.
                </p>
              </section>

              {/* 2. Take a Breath Ring Card */}
              <section className="flex flex-col items-center py-4 p-5 rounded-2xl bg-white/60 dark:bg-stone-900/50 border border-[#EAE3D2] dark:border-stone-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <button
                  onClick={startBreathing}
                  className="group relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center border border-emerald-800/20 dark:border-emerald-400/20 transition-all duration-700 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 rounded-full border border-emerald-700/30 dark:border-emerald-400/30 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '6s' }} />
                  <div className="absolute inset-2 rounded-full border border-emerald-600/10 dark:border-emerald-400/10 animate-pulse pointer-events-none" />
                  
                  <span className="text-lg font-serif italic text-emerald-800 dark:text-emerald-300">
                    take a breath
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500 mt-1 uppercase">
                    TAP
                  </span>
                </button>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 font-light">
                  Tap the ring for a minute of guided breath.
                </p>
              </section>

              {/* 3. Brain Dump Feature Card */}
              <section className="space-y-3 p-5 rounded-2xl bg-white/60 dark:bg-stone-900/50 border border-[#EAE3D2] dark:border-stone-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif italic text-stone-800 dark:text-stone-200">
                    Brain Dump
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                    WON'T BE SAVED
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    value={brainDumpText}
                    onChange={(e) => setBrainDumpText(e.target.value.slice(0, 2000))}
                    placeholder="Pour the loops, worries, and noise out of your mind. It won't be saved..."
                    className={`w-full h-36 bg-transparent border-none resize-none focus:outline-none placeholder-stone-400 dark:placeholder-stone-600 text-base leading-relaxed transition-all duration-1000 ${
                      isDisappearing ? 'scale-90 opacity-0 filter blur-sm' : 'opacity-100'
                    }`}
                  />
                  <div className="text-right text-[11px] font-mono text-stone-400 dark:text-stone-600">
                    {brainDumpText.length}/2000
                  </div>
                </div>

                {/* Sound & Voice Audio Control Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={toggleVoiceInput}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-colors min-h-[44px] sm:min-h-0 ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse'
                          : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isListening ? 'listening...' : 'speak your mind'}</span>
                    </button>

                    {['rain', 'library', 'fire'].map((sound) => (
                      <button
                        key={sound}
                        onClick={() => toggleSound(sound)}
                        className={`px-3 py-2 sm:py-1.5 rounded-full text-xs capitalize transition-colors min-h-[44px] sm:min-h-0 ${
                          activeSound === sound
                            ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                            : 'bg-stone-200/40 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:bg-stone-200/70'
                        }`}
                      >
                        {sound}
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider if sound is playing */}
                  {activeSound && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-stone-200/30 dark:bg-stone-800/30">
                      <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                      <input 
                        type="range" 
                        min="0" 
                        max="0.4" 
                        step="0.01"
                        value={soundVolume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 accent-emerald-700 bg-stone-300 dark:bg-stone-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleClearMind}
                    disabled={!brainDumpText.trim() && !resetStress && !resetWin && !resetGratitude}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-800/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-800/20 disabled:opacity-40 transition-all active:scale-95 min-h-[44px] sm:min-h-0 ml-auto"
                  >
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Clear Mind</span>
                  </button>
                </div>

                {isTodayCleared && affirmation && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm italic font-serif text-center animate-fadeIn">
                    "{affirmation}"
                  </div>
                )}
              </section>

              {/* 4. The Weather Inside (MoodCheck) Card */}
              <section className="space-y-3 p-5 rounded-2xl bg-white/60 dark:bg-stone-900/50 border border-[#EAE3D2] dark:border-stone-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-serif italic text-stone-800 dark:text-stone-200">
                    The weather inside
                  </h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    One tap. No words needed.
                  </p>
                </div>

                <div className="flex items-center justify-between px-2 py-3 bg-stone-200/30 dark:bg-stone-900/40 rounded-2xl">
                  {MOODS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMood === m.level;
                    return (
                      <button
                        key={m.level}
                        onClick={() => setSelectedMood(m.level)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 min-w-[50px] ${
                          isSelected
                            ? 'scale-110 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                        <span className="text-[11px] font-mono">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Storm Grounding Card */}
                {showGroundingCard && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">Stormy Weather Detected</h4>
                    </div>
                    <p className="text-xs leading-relaxed font-light">
                      It feels heavy right now. Before pouring your thoughts, take one quiet minute with the breathing ring above to ground yourself.
                    </p>
                    <button
                      onClick={startBreathing}
                      className="text-xs font-serif italic underline text-amber-800 dark:text-amber-300 hover:opacity-80"
                    >
                      Start 60s Breathing Pause →
                    </button>
                  </div>
                )}
              </section>

              {/* 5. The 3-Line Reset Card */}
              <section className="space-y-4 p-5 rounded-2xl bg-white/60 dark:bg-stone-900/50 border border-[#EAE3D2] dark:border-stone-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="text-xl font-serif italic text-stone-800 dark:text-stone-200">
                  The 3-line reset
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
                      <span>One thing weighing on you right now...</span>
                      {resetStress && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <input
                      type="text"
                      value={resetStress}
                      onChange={(e) => setResetStress(e.target.value)}
                      placeholder="..."
                      className="w-full bg-transparent border-b border-stone-300 dark:border-stone-800 pb-1.5 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
                      <span>One tiny step you can take today...</span>
                      {resetWin && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <input
                      type="text"
                      value={resetWin}
                      onChange={(e) => setResetWin(e.target.value)}
                      placeholder="..."
                      className="w-full bg-transparent border-b border-stone-300 dark:border-stone-800 pb-1.5 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
                      <span>One quiet moment to be grateful for...</span>
                      {resetGratitude && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <input
                      type="text"
                      value={resetGratitude}
                      onChange={(e) => setResetGratitude(e.target.value)}
                      placeholder="..."
                      className="w-full bg-transparent border-b border-stone-300 dark:border-stone-800 pb-1.5 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              </section>

              <footer className="py-6 text-center text-xs text-stone-400 dark:text-stone-600 leading-relaxed font-light space-y-1">
                <p>Brain dump never stored. Your weather, mood & 3-line reset are kept — only for you.</p>
                <p className="opacity-75">MindClear is a non-custodial journaling tool and not a substitute for professional medical care.</p>
              </footer>

            </div>
          )}

          {/* ================= TAB 2: HISTORY ================= */}
          {activeTab === 'history' && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
              <header className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif italic text-stone-800 dark:text-stone-100">
                    field notes
                  </h2>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    the days you showed up for yourself.
                  </p>
                </div>

                {entries.length > 0 && (
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 transition-colors"
                    title="Export notes to Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                )}
              </header>

              {/* Range Selector & Summary Card */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-stone-900/40 border border-[#EAE3D2] dark:border-stone-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-amber-700 dark:text-amber-400 uppercase font-semibold">
                    INSIGHTS
                  </span>
                  <div className="flex items-center gap-1 bg-stone-300/40 dark:bg-stone-800/60 p-0.5 rounded-full text-[10px]">
                    <button 
                      onClick={() => setHistoryRange('weekly')}
                      className={`px-2.5 py-0.5 rounded-full transition-colors ${historyRange === 'weekly' ? 'bg-stone-100 dark:bg-stone-700 font-medium' : 'text-stone-500'}`}
                    >
                      Weekly
                    </button>
                    <button 
                      onClick={() => setHistoryRange('monthly')}
                      className={`px-2.5 py-0.5 rounded-full transition-colors ${historyRange === 'monthly' ? 'bg-stone-100 dark:bg-stone-700 font-medium' : 'text-stone-500'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <p className="text-sm italic font-serif text-stone-700 dark:text-stone-300 leading-relaxed">
                  {entries.length > 0 
                    ? `You cleared your mind ${entries.length} time${entries.length > 1 ? 's' : ''} in your ${historyRange} summary.`
                    : "a quiet week so far — tomorrow is a fresh page."}
                </p>
              </div>

              {/* Empty State */}
              {entries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="p-3 rounded-full bg-stone-200/50 dark:bg-stone-800/50">
                    <Feather className="w-6 h-6 text-emerald-800 dark:text-emerald-400 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-serif italic text-stone-500 dark:text-stone-400">
                    the first page is still blank.
                  </p>
                  <button
                    onClick={() => setActiveTab('today')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-800/20 transition-all active:scale-95"
                  >
                    <span>begin today</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div 
                      key={entry.id}
                      className="p-4 rounded-2xl bg-white/60 dark:bg-stone-900/60 border border-[#EAE3D2] dark:border-stone-800/50 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200/40 dark:border-stone-800/40 pb-2">
                        <span className="text-xs font-mono text-stone-400 dark:text-stone-500">{entry.date}</span>
                        <span className="text-xs font-mono uppercase text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                          Cleared
                        </span>
                      </div>

                      {entry.stress && (
                        <div className="text-xs text-stone-600 dark:text-stone-400">
                          <strong className="font-normal text-stone-400 dark:text-stone-500 mr-1">Weighing:</strong>
                          {entry.stress}
                        </div>
                      )}
                      {entry.win && (
                        <div className="text-xs text-stone-600 dark:text-stone-400">
                          <strong className="font-normal text-stone-400 dark:text-stone-500 mr-1">Small win:</strong>
                          {entry.win}
                        </div>
                      )}
                      {entry.gratitude && (
                        <div className="text-xs text-stone-600 dark:text-stone-400">
                          <strong className="font-normal text-stone-400 dark:text-stone-500 mr-1">Grateful for:</strong>
                          {entry.gratitude}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: JAR ================= */}
          {activeTab === 'jar' && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
              <header className="space-y-1">
                <h2 className="text-3xl font-serif italic text-stone-800 dark:text-stone-100">
                  Gratitude jar
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  every win and thanks you've held onto, kept in one place.
                </p>
              </header>

              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <div 
                  className={`relative w-56 h-64 rounded-3xl border-2 border-stone-300 dark:border-stone-700 bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 shadow-sm ${
                    isShaking ? 'animate-bounce scale-105' : ''
                  }`}
                >
                  <div className="absolute inset-x-4 bottom-4 top-12 flex flex-wrap gap-2 items-end justify-center overflow-hidden opacity-60">
                    {entries.map((_, idx) => (
                      <div 
                        key={idx}
                        className="w-4 h-4 rounded-full bg-amber-400/80 dark:bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      />
                    ))}
                  </div>

                  {revealedMemory ? (
                    <div className="relative z-10 space-y-2 animate-fadeIn">
                      <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
                      <p className="text-sm font-serif italic text-stone-800 dark:text-stone-200 leading-snug">
                        "{revealedMemory.gratitude || revealedMemory.win}"
                      </p>
                      <span className="text-[10px] font-mono text-stone-400 block pt-1">
                        {revealedMemory.date}
                      </span>
                    </div>
                  ) : (
                    <p className="relative z-10 text-xs text-stone-400 dark:text-stone-600 font-serif italic">
                      the jar fills with each cleared day.
                    </p>
                  )}
                </div>

                <div className="text-center mt-6 space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
                    {entries.filter(e => e.gratitude || e.win).length} MEMORIES GATHERED
                  </span>

                  <div>
                    <button
                      onClick={handleShakeJar}
                      disabled={entries.filter(e => e.gratitude || e.win).length === 0}
                      className="px-5 py-3 sm:py-2.5 rounded-full bg-stone-300/60 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-stone-400/50 transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                      shake for a memory
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: REMINDERS ================= */}
          {activeTab === 'reminders' && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
              <header className="space-y-1">
                <h2 className="text-3xl font-serif italic text-stone-800 dark:text-stone-100">
                  reminders
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  a soft, once-a-night nudge to keep the flame going. nothing more.
                </p>
              </header>

              <div className="p-5 rounded-2xl bg-white/60 dark:bg-stone-900/60 border border-[#EAE3D2] dark:border-stone-800/50 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                      <Bell className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-stone-800 dark:text-stone-200">Nightly check-in</h4>
                      <p className="text-xs text-stone-400 dark:text-stone-500">On. We'll send one gentle reminder at your chosen hour, only if today's reset isn't done.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 relative shrink-0 ${
                      reminderEnabled ? 'bg-emerald-800 dark:bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="space-y-2 pt-2 border-t border-stone-200/40 dark:border-stone-800/40">
                    <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Remind me at</span>
                    </label>
                    <select
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-200/40 dark:bg-stone-800/40 border border-stone-300/40 dark:border-stone-700/40 text-sm focus:outline-none"
                    >
                      <option value="20:00">8:00 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                    </select>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). You can change this in your device settings.
                    </p>
                  </div>
                )}
              </div>

              <footer className="py-4 text-center text-xs text-stone-400 dark:text-stone-600 font-serif italic">
                reminders arrive as a phone notification — a quiet friend, not an alarm.
              </footer>
            </div>
          )}
        </main>

        {/* --- FLOATING BOTTOM NAVIGATION --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-full bg-stone-200/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-300/50 dark:border-stone-800/50 shadow-xl">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] justify-center ${
                activeTab === 'today'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600 shadow-md scale-105'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-label="Today"
            >
              <Moon className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-xs font-medium">Today</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] justify-center ${
                activeTab === 'history'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600 shadow-md scale-105'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-label="History"
            >
              <Feather className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-xs font-medium">History</span>
            </button>

            <button
              onClick={() => setActiveTab('jar')}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] justify-center ${
                activeTab === 'jar'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600 shadow-md scale-105'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-label="Gratitude Jar"
            >
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-xs font-medium">Jar</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] justify-center ${
                activeTab === 'reminders'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600 shadow-md scale-105'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-label="Reminders"
            >
              <Bell className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-xs font-medium">Reminders</span>
            </button>
          </div>
        </nav>

        {/* ================= OVERLAY: GUIDED BREATHING ================= */}
        {showBreathing && (
          <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md text-stone-100 flex flex-col items-center justify-between p-6 sm:p-8 animate-fadeIn">
            <button
              onClick={() => setShowBreathing(false)}
              className="self-end p-3 rounded-full text-stone-400 hover:text-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            {!breathFinished ? (
              <div className="flex flex-col items-center gap-8 my-auto">
                <div 
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-emerald-400 flex flex-col items-center justify-center transition-all duration-1000 ${
                    breathPhase === 'inhale' 
                      ? 'scale-125 border-emerald-300 shadow-[0_0_30px_rgba(110,231,183,0.4)]' 
                      : breathPhase === 'hold' 
                      ? 'scale-125 border-amber-300' 
                      : 'scale-90 border-emerald-600'
                  }`}
                >
                  <span className="text-2xl font-serif italic text-emerald-200 capitalize">
                    {breathPhase}
                  </span>
                  <span className="text-4xl font-mono mt-2">{breathTimer}</span>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                    CYCLE {breathCycle} OF 5
                  </p>
                  <p className="text-xs text-stone-500">Focus on the rise and fall of your chest.</p>
                </div>
              </div>
            ) : (
              <div className="my-auto text-center space-y-4 animate-fadeIn">
                <Sparkles className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-2xl font-serif italic text-emerald-200">
                  Breathing session complete
                </h3>
                <p className="text-sm text-stone-400 max-w-xs">
                  Your heart rate has slowed. You are ready to rest your mind.
                </p>
                <button
                  onClick={() => setShowBreathing(false)}
                  className="mt-4 px-6 py-3 rounded-full bg-emerald-600 text-white text-xs font-medium"
                >
                  Return to MindClear
                </button>
              </div>
            )}

            <div />
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes dust {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
        }

        .animate-dust {
          animation: dust infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}