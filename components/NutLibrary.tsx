import React, { useState, useMemo } from 'react';
import { getNutData, RDA, APP_CONTENT, NUTRIENT_LABELS } from '../constants';
import { Nutrients, Language } from '../types';
import NutrientChart from './NutrientChart';
import { Info, Sparkles, Target, ShoppingBag, TrendingUp, CheckCircle2, ArrowRight, Calculator, Sprout } from 'lucide-react';

interface NutLibraryProps {
    language: Language;
}

const NutLibrary: React.FC<NutLibraryProps> = ({ language }) => {
  const nutData = getNutData(language);
  const [selectedId, setSelectedId] = useState<string>(nutData[0].id);
  const [amount, setAmount] = useState<number>(100); // State for the calculator (grams)

  const selectedNut = useMemo(() => 
    nutData.find(n => n.id === selectedId) || nutData[0], 
  [selectedId, nutData]);

  const txt = APP_CONTENT[language].nutLibrary;
  const labels = NUTRIENT_LABELS[language];

  // Calculate nutrients based on the selected amount (slider)
  const calculatedNutrients = useMemo(() => {
    const result = {} as Nutrients;
    (Object.keys(selectedNut.nutrientsPer100g) as Array<keyof Nutrients>).forEach(key => {
        result[key] = (selectedNut.nutrientsPer100g[key] * amount) / 100;
    });
    return result;
  }, [selectedNut, amount]);

  // Helper: Find the top 3 nutrients relative to RDA for badges based on CALCULATED amount
  const topNutrients = useMemo(() => {
    const relativeValues = Object.entries(calculatedNutrients).map(([key, value]) => {
      const nutrientKey = key as keyof Nutrients;
      const rdaValue = RDA[nutrientKey] || 1;
      // Skip energy/macros for this specific list, focus on micros
      if(['energy', 'fat', 'saturatedFat', 'carbs', 'sugar', 'protein'].includes(key)) return null;

      return {
        key: nutrientKey,
        label: labels[nutrientKey] || key,
        percent: ((value as number) / rdaValue) * 100,
        value: value as number
      };
    }).filter(Boolean) as {key: string, label: string, percent: number, value: number}[];

    // Sort by percentage coverage descending
    return relativeValues.sort((a, b) => b.percent - a.percent).slice(0, 3);
  }, [calculatedNutrients, labels]);

  const getGutHealthText = (score: number) => {
    if (score >= 9.5) return txt.gutHealthLevels.excellent;
    if (score >= 8.5) return txt.gutHealthLevels.veryGood;
    if (score >= 7.5) return txt.gutHealthLevels.good;
    return txt.gutHealthLevels.standard;
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* ROW 1: Selection List & Detail Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Sidebar / Selection List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-brand-border overflow-hidden h-full">
                <div className="p-4 bg-brand-input border-b border-brand-border">
                    <h3 className="text-sm font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                        <Info size={16} className="text-brand-accent" />
                        {txt.selectionTitle}
                    </h3>
                </div>
                <div className="flex flex-col">
                {nutData.map((nut) => (
                    <button
                    key={nut.id}
                    onClick={() => { setSelectedId(nut.id); setAmount(100); }} 
                    className={`group w-full text-left px-5 py-4 border-l-4 transition-all duration-300 flex items-center justify-between hover:bg-stone-50 ${
                        selectedId === nut.id
                        ? 'border-brand-accent bg-brand-accent/5'
                        : 'border-transparent'
                    }`}
                    >
                    <div>
                        <span className={`block font-bold text-lg leading-none mb-1 group-hover:text-brand-accent transition-colors ${selectedId === nut.id ? 'text-brand-light' : 'text-stone-500'}`}>
                            {nut.name}
                        </span>
                        <span className="text-xs text-brand-muted font-medium line-clamp-1">
                            {nut.description}
                        </span>
                    </div>
                    {selectedId === nut.id && (
                        <ArrowRight size={16} className="text-brand-accent animate-in slide-in-from-left-2 duration-300" />
                    )}
                    </button>
                ))}
                </div>
          </div>

          {/* 2. Main Detail View - Header */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-brand-border shadow-xl animate-in fade-in duration-500 h-full" key={`header-${selectedId}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 border-b border-brand-input pb-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-light tracking-tight mb-2">{selectedNut.name}</h2>
                        <p className="text-xl text-brand-muted font-serif italic">{selectedNut.description}</p>
                    </div>
                    <a 
                        href={selectedNut.shopUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-brand-light text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-accent transition-all shadow-lg text-sm shrink-0"
                    >
                        <ShoppingBag size={16} />
                        {txt.shopLinkText}
                    </a>
                </div>

                {/* Single Nut Calculator Control */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-brand-accent text-white p-2.5 rounded-lg shadow-sm">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-brand-light text-sm leading-tight">{txt.calcTitle}</p>
                            <p className="text-xs text-brand-muted">{txt.calcSubtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-grow justify-end max-w-md">
                         <input
                            type="range"
                            min="0"
                            max="250"
                            step="5"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-2 bg-brand-input rounded-lg appearance-none cursor-pointer accent-brand-accent hover:accent-brand-accent/80 transition-all"
                        />
                        <div className="bg-white border border-brand-border px-3 py-1.5 rounded-lg font-mono font-bold text-lg text-brand-light min-w-[80px] text-center shadow-sm">
                            {amount}g
                        </div>
                    </div>
                </div>

                {/* Top Stats Cards & Macros */}
                <div className="mb-8">
                    <h4 className="text-xs font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={14} />
                        {txt.powerValuesTitle} ({language === 'de' ? 'für' : 'for'} {amount}g)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Energy Card - Updated to Green */}
                        <div className="bg-brand-accent text-white rounded-xl p-4 border border-brand-accent shadow-sm flex flex-col justify-between">
                            <span className="block text-white/80 text-xs font-bold uppercase mb-1">{labels.energy}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black">{calculatedNutrients.energy.toFixed(0)}</span>
                                <span className="text-xs font-bold">kcal</span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold inline-block px-1.5 py-0.5 rounded bg-white/20 text-white w-fit">
                                {language === 'de' ? 'Brennwert' : 'Energy'}
                            </div>
                        </div>

                        {/* Macros (Protein, Carbs, Fat) */}
                        {[
                              { label: labels.protein, value: calculatedNutrients.protein, unit: 'g', color: 'text-brand-accent', sub: '' },
                              { label: labels.carbs, value: calculatedNutrients.carbs, unit: 'g', color: 'text-brand-muted', sub: `${labels.sugar}: ${calculatedNutrients.sugar.toFixed(1)}g` },
                              { label: labels.fat, value: calculatedNutrients.fat, unit: 'g', color: 'text-brand-muted', sub: `${labels.saturatedFat}: ${calculatedNutrients.saturatedFat.toFixed(1)}g` }
                        ].map((stat, idx) => (
                             <div key={`macro-${idx}`} className="bg-white rounded-xl p-4 border border-brand-border hover:border-brand-accent/50 transition-colors shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="block text-brand-muted text-xs font-bold uppercase mb-1">{stat.label}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value.toFixed(1)}</span>
                                        <span className="text-xs text-brand-light font-bold">
                                            {stat.unit}
                                        </span>
                                    </div>
                                    {stat.sub && (
                                        <p className="text-[10px] text-stone-400 mt-1 font-medium">{stat.sub}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Micros Row */}
                     <div className="grid grid-cols-3 gap-4 mt-4">
                        {topNutrients.map((stat, idx) => (
                            <div key={`micro-${idx}`} className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex flex-col justify-center text-center">
                                <span className="block text-brand-muted text-[10px] font-bold uppercase mb-1">{labels[stat.key as keyof typeof labels] || stat.label}</span>
                                <div className="text-brand-accent font-black text-lg">
                                    {stat.percent > 100 ? '>100' : stat.percent.toFixed(0)}% <span className="text-xs text-stone-400">RDA</span>
                                </div>
                                <span className="text-[10px] text-stone-500 font-mono">
                                    {stat.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {stat.key === 'selenium' ? 'µg' : 'mg'}
                                </span>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Gut Health Score Card */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h4 className="text-brand-light font-bold flex items-center gap-2">
                                <Sprout className="text-brand-accent" size={20} />
                                {txt.gutHealthTitle}
                            </h4>
                            <span className="text-2xl font-black text-brand-accent">{selectedNut.gutHealthScore}/10</span>
                        </div>
                        <div className="w-full bg-brand-input rounded-full h-3 mb-3">
                            <div 
                                className="bg-brand-accent h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${selectedNut.gutHealthScore * 10}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed font-medium">
                            {getGutHealthText(selectedNut.gutHealthScore)}
                        </p>
                    </div>

                    {/* Health Benefits List */}
                    <div>
                        <h4 className="text-brand-light font-bold flex items-center gap-2 mb-4 text-lg">
                            <Target className="text-brand-accent" size={20} />
                            {txt.healthFocusTitle}
                        </h4>
                        <ul className="space-y-4">
                            {selectedNut.benefits.split(',').map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3 group">
                                    <CheckCircle2 className="text-brand-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
                                    <span className="text-stone-700 font-medium">{benefit.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
          </div>
      </div>

      {/* ROW 2: Why Activated & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3. Info Card Sidebar - Why Activated */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-brand-border p-6 overflow-hidden h-full order-last lg:order-first">
                <h4 className="font-bold text-brand-light flex items-center gap-2 mb-4 text-lg">
                    <Sparkles size={20} className="text-brand-accent" />
                    {txt.whyActivated.title}
                </h4>
                <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
                    <p>{txt.whyActivated.intro}</p>
                    
                    <div className="bg-brand-input/50 p-3 rounded-lg border-l-2 border-brand-accent">
                        <p className="italic text-brand-light font-medium">
                            {txt.whyActivated.processBox}
                        </p>
                    </div>

                    <p>{txt.whyActivated.processDescription}</p>

                    <div className="pt-2">
                        <strong className="block text-brand-light mb-2 text-xs uppercase tracking-widest font-black">{txt.whyActivated.resultTitle}</strong>
                        <div className="grid grid-cols-1 gap-2">
                            {txt.whyActivated.benefitsList.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-brand-light font-medium">
                                    <CheckCircle2 size={14} className="text-brand-accent shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="font-serif italic text-brand-light pt-2 border-t border-brand-input mt-2">
                        {txt.whyActivated.quote}
                    </p>
                </div>
          </div>

          {/* 4. Nutrient Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-brand-border shadow-xl animate-in fade-in duration-500 h-full" key={`chart-${selectedId}`}>
                <div className="mb-6">
                    <h4 className="text-brand-light font-bold text-xl mb-1">{txt.chartTitle}</h4>
                    <p className="text-sm text-brand-muted">
                        {language === 'de' ? `Vollständige Analyse für ${amount}g aktivierte ${selectedNut.name}` : `Full analysis for ${amount}g activated ${selectedNut.name}`}
                    </p>
                </div>
                <div className="h-[500px]">
                     <NutrientChart currentIntake={calculatedNutrients} language={language} />
                </div>
          </div>
      </div>
    </div>
  );
};

export default NutLibrary;