import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scenario } from '../types';
import { subscribeEmail } from '../services/emailService';

interface TarotRevealProps {
  scenario: Scenario;
  onReset: () => void;
}

export const TarotReveal: React.FC<TarotRevealProps> = ({ scenario, onReset }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textProgress, setTextProgress] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Audio effect for card flip
  const playFlipSound = () => {
    try {
      // Create a deeper, more mystical sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Deep mystical gong-like sound
      oscillator.type = 'triangle'; // Triangle wave for warmer, mystical tone
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Lower, deeper start
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.8); // Very low finish

      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  // Audio effect for page turn
  const playPageTurnSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Gentle swoosh sound - very subtle
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  useEffect(() => {
    // Reset image loaded state when scenario changes
    setImageLoaded(false);
    setTextProgress(0);

    // Preload the image
    const img = new Image();
    img.src = scenario.tarot.imageUrl;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // Set to true even on error to show UI
  }, [scenario]);

  const handleShare = async () => {
    const shareData = {
      title: 'CEO Business Tarot - 사장님을 위한 타로',
      text: '경영 고민을 타로 카드로 풀어보세요. 신태순 작가의 진심어린 조언과 함께합니다.',
      url: 'https://www.ceotarot.space/'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('링크가 복사되었습니다! 친구에게 공유해보세요.');
      }
    } catch (error) {
      console.log('Share cancelled or failed');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length === 0) {
      setSubmitStatus('error');
      setSubmitMessage('이름을 입력해주세요.');
      return;
    }

    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      setSubmitMessage('유효한 이메일을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');

    const result = await subscribeEmail(email, name);

    setSubmitting(false);

    if (result.success) {
      setSubmitStatus('success');
      setSubmitMessage(result.message);
      setName('');
      setEmail('');
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } else {
      setSubmitStatus('error');
      setSubmitMessage(result.error || '오류가 발생했습니다.');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 min-h-screen pb-32">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        {/* Card Section */}
        <div className="relative w-72 h-[400px] md:w-80 md:h-[480px] perspective-1000 mb-12 cursor-pointer group">
          <motion.div
            className="w-full h-full relative transform-style-3d"
            animate={{
              rotateY: isFlipped ? 180 : 0,
              y: !isFlipped && imageLoaded ? [0, -10, 0] : 0
            }}
            transition={{
              rotateY: { duration: 0.5, ease: "easeInOut" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={!isFlipped && imageLoaded ? {
              scale: 1.05,
              rotateX: 5,
              rotateY: -5,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            } : {}}
            onClick={() => {
              if (imageLoaded) {
                playFlipSound();
                setIsFlipped(true);
              }
            }}
          >
            {/* Card Back */}
            <motion.div
              className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/50 shadow-2xl flex items-center justify-center overflow-hidden"
              whileHover={!isFlipped ? {
                boxShadow: "0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.3)",
                borderColor: "rgba(251, 191, 36, 0.8)"
              } : {}}
            >
              {/* Pattern on back */}
              <div className="absolute inset-2 border border-amber-500/30 rounded-xl opacity-50 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-amber-500/30 animate-pulse"></div>
              </div>
              <div className="text-amber-500 font-cinzel text-2xl tracking-widest z-10">DESTINY</div>
            </motion.div>

            {/* Card Front */}
            <motion.div
              className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-slate-950 border-2 border-amber-400 overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.3)]"
              animate={isFlipped ? {
                boxShadow: [
                  "0 0 30px rgba(251,191,36,0.3)",
                  "0 0 40px rgba(251,191,36,0.5)",
                  "0 0 30px rgba(251,191,36,0.3)"
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {!imageLoaded ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <span className="text-amber-500 animate-pulse">Loading...</span>
                </div>
              ) : (
                <>
                  <img
                    src={scenario.tarot.imageUrl}
                    alt={scenario.tarot.name}
                    className="w-full h-4/5 object-cover"
                  />
                  <div className="h-1/5 bg-slate-900 flex flex-col items-center justify-center border-t border-amber-500/30 p-2 text-center">
                    <h3 className="text-amber-400 font-cinzel font-bold text-lg md:text-xl">{scenario.tarot.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {scenario.tarot.keywords.map(k => (
                        <span key={k} className="text-xs text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
          {!isFlipped && imageLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-16 left-0 right-0 text-center px-4"
            >
              <p className="text-amber-200/70 text-sm md:text-base font-serif mb-1">
                심호흡을 한 번 하고
              </p>
              <p className="text-amber-400/90 text-xs md:text-sm animate-bounce">
                카드를 클릭하세요
              </p>
            </motion.div>
          )}
        </div>

        {/* Content Section - Only visible after flip */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full space-y-12"
          >
            {/* Rational Solution */}
            <section className="bg-slate-900/50 border border-amber-500/30 p-6 md:p-8 rounded-xl backdrop-blur-sm">
              <h2 className="text-amber-500 font-cinzel text-sm tracking-wider mb-2 border-b border-amber-500/20 pb-2">
                RATIONAL SOLUTION
              </h2>
              <h3 className="text-2xl font-bold text-slate-100 mb-4 font-serif">
                {scenario.rationalSolution.title}
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                {scenario.rationalSolution.advice}
              </p>
              <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <span className="text-amber-400 font-bold text-sm block mb-1">ACTION ITEM</span>
                <p className="text-amber-100/90 italic">
                  {scenario.rationalSolution.actionItem}
                </p>
              </div>
            </section>

            {/* Emotional Content (Book Essay) */}
            <section className="prose prose-invert max-w-none">
              <h2 className="text-amber-500 font-cinzel text-sm tracking-wider mb-6 border-b border-amber-500/20 pb-2">
                출간예정 "사장도 사실은 출근하기 싫습니다(신태순)" 중에서
              </h2>
              <h3 className="text-3xl font-bold text-white mb-8">
                {scenario.emotionalContent.title}
              </h3>
              <div
                className="text-slate-300 leading-relaxed whitespace-pre-line text-base md:text-lg cursor-pointer select-none relative"
                onClick={() => {
                  const lines = scenario.emotionalContent.content.split('\n').filter(l => l.trim());
                  if (textProgress < lines.length) {
                    playPageTurnSound();

                    // Calculate lines per viewport (approximately)
                    // Assuming ~30px per line, viewport height / 30 = lines per screen
                    const viewportHeight = window.innerHeight;
                    const lineHeight = 30; // approximate line height in pixels
                    const linesPerScreen = Math.floor(viewportHeight / lineHeight);

                    // Show one viewport worth of lines per tap
                    const increment = Math.max(linesPerScreen, 5); // minimum 5 lines
                    const newProgress = Math.min(textProgress + increment, lines.length);
                    setTextProgress(newProgress);

                    // Scroll to the start of newly revealed content
                    setTimeout(() => {
                      const allLines = scenario.emotionalContent.content.split('\n');
                      let actualIndex = 0;
                      let nonEmptyCount = 0;

                      // Find the line index that corresponds to the OLD textProgress
                      for (let i = 0; i < allLines.length; i++) {
                        if (allLines[i].trim()) {
                          if (nonEmptyCount === textProgress) {
                            actualIndex = i;
                            break;
                          }
                          nonEmptyCount++;
                        }
                      }

                      if (textRefs.current[actualIndex]) {
                        textRefs.current[actualIndex]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }, 100);
                  }
                }}
              >
                {scenario.emotionalContent.content.split('\n').map((line, i) => {
                  const nonEmptyLines = scenario.emotionalContent.content.split('\n').filter(l => l.trim());
                  const currentLineIndex = scenario.emotionalContent.content.split('\n').slice(0, i).filter(l => l.trim()).length;
                  const isVisible = currentLineIndex < textProgress;
                  const isHighlight = line.includes('"') || line.endsWith('니다.') || line.endsWith('요.');

                  return (
                    <p
                      key={i}
                      ref={(el) => textRefs.current[i] = el}
                      className={`${line.trim() === '' ? 'h-4' : 'mb-4'
                        } ${isHighlight && line.length > 20 ? 'text-slate-100' : ''} ${!isVisible && line.trim() ? 'opacity-20 blur-sm' : 'opacity-100'
                        } transition-all duration-500`}
                    >
                      {line.includes('💡') ? (
                        <span className="bg-amber-500/20 px-2 py-1 rounded inline-block w-full">{line}</span>
                      ) : line}
                    </p>
                  )
                })}
                {textProgress < scenario.emotionalContent.content.split('\n').filter(l => l.trim()).length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-8 left-0 right-0 z-50 pointer-events-none"
                  >
                    <div className="max-w-4xl mx-auto px-4">
                      <div className="bg-slate-900/95 backdrop-blur-sm border border-amber-500/30 rounded-full py-3 px-6 shadow-lg shadow-amber-500/20">
                        <p className="text-amber-400 text-sm md:text-base text-center animate-pulse">
                          👆 터치하여 계속 읽기
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </section>

            {/* CTA Footer */}
            <footer className="pt-12 mt-12 border-t border-slate-800 text-center space-y-6">
              <p className="text-slate-400 italic">이 조언이 마음에 드셨나요?</p>

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <a
                  href="https://www.threads.com/@shintaesoon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-slate-800 border border-slate-600 rounded-full hover:bg-slate-700 hover:border-amber-500 text-slate-200 transition-all"
                >
                  신태순 작가 쓰레드 팔로우하기
                </a>
              </div>

              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                친구에게 공유하기
              </motion.button>

              <div className="w-full max-w-md mx-auto">
                <form onSubmit={handleEmailSubmit} className="flex flex-col w-full gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    disabled={submitting}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      disabled={submitting}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '전송 중...' : '출간 알림'}
                    </button>
                  </div>

                  {submitStatus !== 'idle' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm ${submitStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {submitMessage}
                    </motion.p>
                  )}
                </form>
              </div>

              <button
                onClick={onReset}
                className="text-slate-500 hover:text-amber-500 text-sm mt-8 underline underline-offset-4"
              >
                다른 고민 상담하기
              </button>
            </footer>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};