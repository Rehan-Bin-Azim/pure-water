import React from 'react';
import { X, Check, Droplets, Leaf, Shield, Award, Sparkles, ExternalLink } from 'lucide-react';

interface DrawerInfoProps {
  topic: 'process' | 'sustainability' | 'shop' | null;
  onClose: () => void;
  onOpenGetInvolved: () => void;
}

export const DrawerInfo: React.FC<DrawerInfoProps> = ({
  topic,
  onClose,
  onOpenGetInvolved,
}) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-xl bg-[#0b0f15] border-l border-white/10 h-full overflow-y-auto flex flex-col p-6 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-display tracking-[0.3em] text-white text-sm">P U R E</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
              {topic.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content depending on topic */}
        <div className="py-8 flex-1 space-y-8">
          {topic === 'process' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  Alpine Filtration Cycle
                </span>
                <h3 className="font-display text-4xl text-white font-light mt-1">
                  How Nature Filters Water Over 100 Years
                </h3>
                <p className="text-sm text-zinc-400 font-light mt-2 leading-relaxed">
                  Before modern filtration was engineered, Earth perfected its own hydrological cycle
                  through ancient volcanic granite and subterranean gravel beds.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Alpine Precipitation & Glacial Snowmelt',
                    desc: 'Pure mountain snowfall at elevations above 3,500m remains pristine and untouched by agricultural or urban runoff.',
                  },
                  {
                    step: '02',
                    title: 'Basalt & Granite Subterranean Infiltration',
                    desc: 'Water trickles through hundreds of meters of dense volcanic basalt rock, naturally stripping suspended particulates.',
                  },
                  {
                    step: '03',
                    title: 'Natural Electrolyte Enrichment',
                    desc: 'The water absorbs balanced ionic minerals including natural magnesium, calcium, and potassium with a stable 7.8 pH.',
                  },
                  {
                    step: '04',
                    title: 'Non-Thermal UV Micro-Purification',
                    desc: 'Gentle, zero-chemical UV light guarantees biological sterile purity while preserving natural hydration taste.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400">{item.step}</span>
                      <h4 className="text-sm text-white font-medium">{item.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed pl-6">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topic === 'sustainability' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  Ecological Manifesto
                </span>
                <h3 className="font-display text-4xl text-white font-light mt-1">
                  Leaving Every Drop Cleaner Than We Found It
                </h3>
                <p className="text-sm text-zinc-400 font-light mt-2 leading-relaxed">
                  Our commitments are verified by third-party environmental audits. We operate under
                  a strict net-positive water pledge.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Leaf className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="text-sm text-white font-medium">100% Circular Glass</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Eliminated all plastic vessels. Replaced with infinitely recyclable, lead-free borosilicate.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Droplets className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="text-sm text-white font-medium">1:1 River Restoration</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    For every liter enjoyed, we replenish 2 liters back into protected wild freshwater watersheds.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Award className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="text-sm text-white font-medium">B-Corp Certified</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Highest tier governance score for worker equity, water stewardship, and supply chain ethics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Shield className="w-5 h-5 text-indigo-400 mb-2" />
                  <h4 className="text-sm text-white font-medium">Carbon Negative Logistics</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Shipped exclusively via electric road fleets and emission-offset maritime logistics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {topic === 'shop' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  Artifacts of Hydration
                </span>
                <h3 className="font-display text-4xl text-white font-light mt-1">
                  The PURE Glassware Collection
                </h3>
                <p className="text-sm text-zinc-400 font-light mt-2 leading-relaxed">
                  Hand-crafted artisanal glass inspired by the tumblers featured in our storytelling sequence.
                  100% of profits fund clean water wells.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'The Story Tumbler (Set of 2)',
                    price: '$65',
                    tag: 'Featured in 3D Film',
                    desc: 'Hand-blown heavy base borosilicate glass with optical prism refraction and etched water level guide.',
                  },
                  {
                    name: 'The Alpine Thermal Carafe',
                    price: '$110',
                    tag: 'Bestseller',
                    desc: 'Dual-wall vacuum borosilicate carafe with natural walnut wood stopper. Keeps alpine water chilled 24 hours.',
                  },
                  {
                    name: 'The Riverbed Filter Vessel',
                    price: '$85',
                    tag: 'Community Edition',
                    desc: 'Equipped with reusable coconut carbon and volcanic mineral filtration cartridge.',
                  },
                ].map((product) => (
                  <div
                    key={product.name}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all flex items-start justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-300 tracking-wider">
                        {product.tag}
                      </span>
                      <h4 className="text-base text-white font-display font-medium mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{product.desc}</p>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenGetInvolved();
                        }}
                        className="mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs uppercase tracking-wider font-semibold transition-colors"
                      >
                        Reserve Artifact
                      </button>
                    </div>
                    <span className="font-display text-2xl text-white font-light">
                      {product.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA in drawer */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Every purchase plants clean water access.</span>
          <button
            onClick={() => {
              onClose();
              onOpenGetInvolved();
            }}
            className="px-5 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Get Involved
          </button>
        </div>
      </div>
    </div>
  );
};
