import React, { useState } from 'react';
import { SelectionFlow } from './components/SelectionFlow';
import { TarotReveal } from './components/TarotReveal';
import { Scenario } from './types';

const App: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#fbbf24] selection:bg-amber-500/30 selection:text-amber-100 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10">
        {!currentScenario ? (
          <SelectionFlow onSelect={setCurrentScenario} />
        ) : (
          <TarotReveal 
            scenario={currentScenario} 
            onReset={() => setCurrentScenario(null)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;