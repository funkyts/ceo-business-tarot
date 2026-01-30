import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCENARIOS } from '../data/tarotData';
import { Scenario } from '../types';

interface SelectionFlowProps {
  onSelect: (scenario: Scenario) => void;
}

export const SelectionFlow: React.FC<SelectionFlowProps> = ({ onSelect }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Soft click sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  const handleSelect = async (scenario: Scenario) => {
    playClickSound();
    setLoadingId(scenario.id);
    // Simulate "Fate Picking" delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSelect(scenario);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-[80vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          CEO Business Tarot
        </h1>
        <p className="text-slate-300 font-serif text-lg">
          당신의 가장 깊은 경영 고민은 무엇인가요?
          <br />
          카드가 당신에게 필요한 답을 보여줄 것입니다.
        </p>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {SCENARIOS.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(scenario)}
              disabled={!!loadingId}
              whileHover={!loadingId ? {
                y: -4,
                boxShadow: "0 8px 30px rgba(251, 191, 36, 0.3)"
              } : {}}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-6 rounded-xl border transition-all duration-300 group
                ${loadingId === scenario.id
                  ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-amber-500/70 text-sm font-cinzel mb-1 block">
                    {scenario.category}
                  </span>
                  <p className="text-slate-100 text-lg font-medium group-hover:text-amber-100 transition-colors">
                    {scenario.question}
                  </p>
                </div>
                {loadingId === scenario.id && (
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                      scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    }}
                    className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"
                  />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};