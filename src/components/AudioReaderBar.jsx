import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import { prepareMarkdownForSpeech, chunkTextForSpeech } from "../utils/speechUtils";

export default function AudioReaderBar({ title, content, isOpen, onClose }) {
  // Comfortable speeds: 0.85x (relaxed), 1.0x (normal), 1.2x (gentle brisk — reduced from 1.5x)
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem("notemaster_reader_speed");
    return saved ? parseFloat(saved) : 1.0;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const chunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const rateRef = useRef(rate);
  const isPlayingRef = useRef(false);
  const bestVoiceRef = useRef(null);

  currentChunkIndexRef.current = currentChunkIndex;
  rateRef.current = rate;
  isPlayingRef.current = isPlaying;

  // Mount safety guard for createPortal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prepare and chunk text whenever title or content changes
  const chunks = useMemo(() => {
    if (!isOpen) return [];
    const plainText = prepareMarkdownForSpeech(title, content);
    return chunkTextForSpeech(plainText);
  }, [title, content, isOpen]);

  chunksRef.current = chunks;

  // Automatically pick the best natural voice in background
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const pickBestVoice = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      const preferred =
        allVoices.find(
          (v) =>
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Neural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Jenny")) &&
            v.lang.startsWith("en")
        ) ||
        allVoices.find((v) => v.lang.startsWith("en")) ||
        allVoices[0];

      bestVoiceRef.current = preferred || null;
    };

    pickBestVoice();
    window.speechSynthesis.onvoiceschanged = pickBestVoice;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Speak single chunk
  const speakChunk = useCallback((index) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const currentChunks = chunksRef.current;
    if (index >= currentChunks.length || index < 0) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      return;
    }

    setCurrentChunkIndex(index);

    const utterance = new SpeechSynthesisUtterance(currentChunks[index]);
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;

    if (bestVoiceRef.current) {
      utterance.voice = bestVoiceRef.current;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakChunk(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.error("SpeechSynthesis error:", e);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Auto-play when bar is opened
  useEffect(() => {
    if (isOpen && chunks.length > 0) {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      const timer = setTimeout(() => {
        speakChunk(0);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
    }
  }, [isOpen, chunks, speakChunk]);

  // Clean cancellation on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      speakChunk(currentChunkIndex);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentChunkIndex - 1);
    speakChunk(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(chunks.length - 1, currentChunkIndex + 1);
    speakChunk(nextIdx);
  };

  // Speed selection (0.85x, 1.0x, 1.2x)
  const handleRateSelect = (newRate) => {
    setRate(newRate);
    rateRef.current = newRate;
    try {
      localStorage.setItem("notemaster_reader_speed", newRate.toString());
    } catch {
      // ignore
    }
    if (isPlaying && !isPaused) {
      speakChunk(currentChunkIndex);
    }
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  if (!isOpen || !mounted || typeof document === "undefined" || !document.body) {
    return null;
  }

  const progressPercent =
    chunks.length > 0
      ? Math.round(((currentChunkIndex + 1) / chunks.length) * 100)
      : 0;

  // Gentle, comfortable listening speeds
  const comfortableSpeeds = [
    { label: "0.85x", val: 0.85 },
    { label: "1x", val: 1.0 },
    { label: "1.2x", val: 1.2 },
  ];

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[95%] max-w-2xl animate-scale-up">
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow:
            "0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle)",
        }}
      >
        {/* Top Progress Line */}
        <div className="w-full h-1" style={{ background: "var(--border-subtle)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background:
                "linear-gradient(90deg, var(--accent), var(--accent-light))",
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 sm:px-5 gap-3">
          {/* Left: Waveform Icon + Note Title + Current Section */}
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(224, 144, 80, 0.15)",
                border: "1px solid rgba(224, 144, 80, 0.3)",
                color: "var(--accent)",
              }}
            >
              {isPlaying && !isPaused ? (
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-[var(--accent)] rounded-full animate-pulse h-4" />
                  <span className="w-1 bg-[var(--accent)] rounded-full animate-bounce h-2" />
                  <span className="w-1 bg-[var(--accent)] rounded-full animate-pulse h-3.5" />
                  <span className="w-1 bg-[var(--accent)] rounded-full animate-bounce h-1.5" />
                </div>
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="text-xs sm:text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
                title={title}
              >
                {title || "Reading note aloud..."}
              </p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                {chunks.length > 0
                  ? `Sentence ${currentChunkIndex + 1} of ${chunks.length} · ${progressPercent}%`
                  : "Preparing speech..."}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentChunkIndex <= 0}
              className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
              title="Previous sentence"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full transition-transform active:scale-95 cursor-pointer shadow-md"
              style={{
                background: "var(--accent)",
                color: "#1a1614",
              }}
              title={isPlaying && !isPaused ? "Pause" : "Play"}
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentChunkIndex >= chunks.length - 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
              title="Next sentence"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleStop}
              className="p-2 rounded-lg transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Gentle Speed Selector (0.85x, 1x, 1.2x) + Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Speed Pills */}
            <div
              className="flex items-center p-0.5 rounded-lg font-mono text-xs"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {comfortableSpeeds.map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => handleRateSelect(s.val)}
                  className="px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer"
                  style={{
                    background: rate === s.val ? "var(--accent)" : "transparent",
                    color: rate === s.val ? "#1a1614" : "var(--text-muted)",
                  }}
                  title={`Speed: ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
              title="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
