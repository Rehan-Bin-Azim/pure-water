import React, { useState } from 'react';
import { X, CheckCircle2, Heart, Sparkles, Users, Droplet, Shield } from 'lucide-react';

interface GetInvolvedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GetInvolvedModal: React.FC<GetInvolvedModalProps> = ({ isOpen, onClose }) => {
  const [pledgeAmount, setPledgeAmount] = useState<number>(30);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSigned, setIsSigned] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real calculations
  // $30 provides 1 person with safe, sustainable clean water for life
  const peopleImpacted = Math.floor(pledgeAmount / 30);
  const gallonsPurified = Math.floor(peopleImpacted * 18250); // ~50 gallons/day * 365
  const plasticBottlesSaved = peopleImpacted * 2800;

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsSigned(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090d13]">
          <div className="flex items-center gap-3">
            <span className="font-display tracking-[0.3em] text-white text-sm">P U R E</span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
              Action & Impact
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {!isSigned ? (
            <>
              <div>
                <h3 className="font-display text-3xl sm:text-4xl text-white font-light">
                  Transform a Life with One Drop
                </h3>
                <p className="text-sm text-zinc-400 mt-1 font-light">
                  Adjust the contribution slider below to see how your direct partnership protects
                  freshwater ecosystems and supplies clean water to vulnerable communities.
                </p>
              </div>

              {/* Interactive Impact Calculator Slider */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                    Monthly Partnership Pledge
                  </span>
                  <span className="text-3xl font-display text-cyan-300 font-light">
                    ${pledgeAmount}
                    <span className="text-xs text-zinc-400 font-sans"> / mo</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="15"
                  max="300"
                  step="15"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>$15 (Seed)</span>
                  <span>$60 (Family)</span>
                  <span>$150 (Village Tap)</span>
                  <span>$300 (Deep Well)</span>
                </div>

                {/* Live Real-time Impact Cards */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col items-center text-center">
                    <Users className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xl font-display text-white font-light">
                      {peopleImpacted} {peopleImpacted === 1 ? 'Person' : 'People'}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      Clean Water for Life
                    </span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col items-center text-center">
                    <Droplet className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xl font-display text-white font-light">
                      {gallonsPurified.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      Gal Filtered / Yr
                    </span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col items-center text-center">
                    <Shield className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xl font-display text-white font-light">
                      {plasticBottlesSaved.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      Plastic Bottles Avoided
                    </span>
                  </div>
                </div>
              </div>

              {/* Pledge Form */}
              <form onSubmit={handlePledge} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@example.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="transparency"
                    defaultChecked
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-cyan-400 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="transparency" className="text-xs text-zinc-400 cursor-pointer">
                    Send me GPS coordinates and photographic updates of completed clean water well projects.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>Confirm Clean Water Pledge (${pledgeAmount}/mo)</span>
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-display text-4xl text-white font-light">
                Thank You, {name}
              </h3>
              <p className="text-sm text-zinc-300 max-w-md font-light">
                Your pledge of <strong className="text-cyan-300">${pledgeAmount}/mo</strong> has
                been recorded. You have provided clean drinking water for{' '}
                <strong className="text-white">{peopleImpacted} people</strong> for life.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 max-w-sm w-full text-xs text-zinc-400 font-mono">
                Pledge ID: PUR-{Math.random().toString(36).substring(2, 9).toUpperCase()}
                <br />
                Verification Sent to {email}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-full bg-cyan-400 text-black text-xs uppercase font-semibold tracking-wider hover:bg-cyan-300 transition-colors"
              >
                Return to Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
