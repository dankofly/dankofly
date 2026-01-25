import React, { useState, useMemo } from 'react';
import { NUT_DATA, RDA } from '../constants';
import { DailyIntake, Nutrients } from '../types';
import NutrientChart from './NutrientChart';
import { Info, Leaf, ShoppingCart, Zap, Sparkles, Package, RotateCcw, ShieldCheck } from 'lucide-react';

const Calculator: React.FC = () => {
  const [intake, setIntake] = useState<DailyIntake>(
    NUT_DATA.reduce((acc, nut) => ({ ...acc, [nut.id]: 0 }), {} as DailyIntake)
  );

  const handleSliderChange = (id: string, value: number) => {
    setIntake(prev => ({ ...prev, [id]: value }));
  };

  const applyPreset = (preset: DailyIntake) => {
    // Fill missing nuts with 0
    const fullPreset = NUT_DATA.reduce((acc, nut) => {
        acc[nut.id] = preset[nut.id] || 0;
        return acc;
    }, {} as DailyIntake);
    setIntake(fullPreset);
  };

  const totalNutrients: Nutrients = useMemo(() => {
    const total: Nutrients = {
      energy: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0,
      magnesium: 0, calcium: 0, iron: 0,
      zinc: 0, potassium: 0, vitaminE: 0, b1: 0, b6: 0, selenium: 0, omega3: 0
    };

    Object.entries(intake).forEach(([id, val]) => {
      const grams = val as number;
      const nut = NUT_DATA.find(n => n.id === id);
      if (nut && grams > 0) {
        const factor = grams / 100;
        Object.keys(total).forEach((key) => {
          const k = key as keyof Nutrients;
          total[k] += (nut.nutrientsPer100g[k] || 0) * factor;
        });
      }
    });
    return total;
  }, [intake]);

  const totalGrams = (Object.values(intake) as number[]).reduce((a, b) => a + b, 0);

  // Define Presets based on typical pack sizes and nutritional goals
  const PRESETS = {
    power100: {
        name: '100g Power-Mix',
        icon: <Package size={16} />,
        values: { walnut: 30, almond: 30, cashew: 20, brazil: 20 }
    },
    family250: {
        name: '250g Wellness',
        icon: <Sparkles size={16} />,
        values: { walnut: 50, almond: 50, hazelnut: 50, pistachio: 50, pumpkin: 50 }
    },
    immune100: {
        name: 'Immuno-Boost',
        icon: <ShieldCheck size={16} />,
        values: { brazil: 20, pumpkin: 50, pecan: 30 }
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Controls Section */}
      <div className="space-y-6">
        <div className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-brand-light flex items-center gap-3">
              <div className="bg-brand-accent/20 p-2 rounded-lg">
                <Leaf className="text-brand-accent" size={24} />
              </div>
              Deine Mischung
            </h2>
            <div className="bg-brand-input px-3 py-1 rounded-full border border-brand-border flex items-center gap-2">
                <span className="text-brand-accent font-black text-sm">{totalGrams}g</span>
                <span className="text-brand-muted text-[10px] font-bold uppercase">Gesamtgewicht</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mb-8">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Schnellauswahl / Packungsgrößen</p>
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => applyPreset(PRESETS.power100.values)}
                    className="flex items-center gap-2 bg-white border border-brand-border hover:border-brand-accent px-3 py-2 rounded-lg text-xs font-bold text-brand-light transition-all shadow-sm hover:shadow-md"
                >
                    {PRESETS.power100.icon}
                    {PRESETS.power100.name}
                </button>
                <button 
                    onClick={() => applyPreset(PRESETS.family250.values)}
                    className="flex items-center gap-2 bg-white border border-brand-border hover:border-brand-accent px-3 py-2 rounded-lg text-xs font-bold text-brand-light transition-all shadow-sm hover:shadow-md"
                >
                    {PRESETS.family250.icon}
                    {PRESETS.family250.name}
                </button>
                <button 
                    onClick={() => applyPreset(PRESETS.immune100.values)}
                    className="flex items-center gap-2 bg-white border border-brand-border hover:border-brand-accent px-3 py-2 rounded-lg text-xs font-bold text-brand-light transition-all shadow-sm hover:shadow-md"
                >
                    {PRESETS.immune100.icon}
                    {PRESETS.immune100.name}
                </button>
                <button 
                    onClick={() => applyPreset({})}
                    className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 border border-transparent px-3 py-2 rounded-lg text-xs font-bold text-brand-muted transition-all"
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {NUT_DATA.map(nut => (
              <div key={nut.id} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${nut.imageColor}`}></div>
                    <label className="text-brand-light font-bold text-sm uppercase tracking-wide">{nut.name}</label>
                  </div>
                  <span className="text-brand-accent font-mono font-bold bg-brand-input px-2 rounded">{intake[nut.id]}g</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={intake[nut.id]}
                  onChange={(e) => handleSliderChange(nut.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-input rounded-lg appearance-none cursor-pointer accent-brand-accent hover:accent-brand-accent/80 transition-all"
                />
                <p className="text-[10px] text-brand-muted mt-1.5 font-medium leading-tight">{nut.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-brand-border">
            <a 
              href="https://www.2die4livefoods.com/de-de/products/2die4-all-in-one-bundle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-brand-light hover:bg-black text-white py-4 px-4 rounded-xl font-black transition-all shadow-lg active:scale-95 group"
            >
              <ShoppingCart size={20} className="group-hover:animate-bounce" />
              ALLES IN EINEM PAKET KAUFEN
            </a>
            <p className="text-center text-[10px] text-brand-muted mt-2">
                Hol dir das "All-In-One" Set für deine Mischung
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-6 sticky top-24">
         {/* Simple Macro View */}
         <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Energie', value: totalNutrients.energy, unit: 'kcal', color: 'text-brand-light' },
              { label: 'Protein', value: totalNutrients.protein, unit: 'g', color: 'text-brand-accent' },
              { label: 'Carbs', value: totalNutrients.carbs, unit: 'g', color: 'text-brand-muted' },
              { label: 'Fett', value: totalNutrients.fat, unit: 'g', color: 'text-brand-muted' }
            ].map((m, i) => (
              <div key={i} className="bg-white p-3 rounded-xl text-center border border-brand-border shadow-md">
                <span className="block text-brand-muted text-[10px] font-black uppercase tracking-widest mb-1">{m.label}</span>
                <span className={`text-lg font-black ${m.color}`}>{m.value.toFixed(0)}<span className="text-[10px] ml-0.5">{m.unit}</span></span>
              </div>
            ))}
         </div>

        {/* The Re-Optimized Chart */}
        <div className="min-h-[550px]">
           <NutrientChart currentIntake={totalNutrients} />
        </div>

        {/* Insights */}
        <div className="bg-brand-accent/5 p-6 rounded-2xl border border-brand-accent/20">
            <h3 className="text-brand-accent font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Zap size={18} fill="currentColor"/>
                Bio-Optimierung
            </h3>
            <ul className="space-y-3">
                {[
                  { condition: totalNutrients.selenium >= RDA.selenium, text: '100% Selen-Bedarf gedeckt', sub: 'Unterstützt die Schilddrüse' },
                  { condition: totalNutrients.magnesium >= RDA.magnesium * 0.5, text: '>50% Magnesium erreicht', sub: 'Ideal für Nerven & Muskeln' },
                  { condition: totalNutrients.vitaminE >= RDA.vitaminE, text: 'Voller Vitamin-E Zellschutz', sub: 'Starkes Antioxidans' },
                  { condition: totalNutrients.omega3 >= RDA.omega3, text: 'Omega-3 Tagesbedarf gedeckt', sub: 'Herz & Gehirn Support' }
                ].map((item, i) => item.condition && (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-500 rounded-full p-0.5 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-light leading-none">{item.text}</p>
                        <p className="text-[10px] text-brand-muted mt-1">{item.sub}</p>
                    </div>
                  </li>
                ))}
                {totalGrams === 0 && (
                   <li className="text-sm text-brand-muted font-medium italic flex items-center gap-2">
                     <Info size={16} /> Wähle Nüsse aus oder nutze ein Preset oben, um zu starten.
                   </li>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Calculator;