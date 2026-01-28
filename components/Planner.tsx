import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UserProfile, WeeklyPlan, DayPlan, Language, Nutrients } from '../types';
import { getNutData, APP_CONTENT } from '../constants';
import { generateWeeklyPlan } from '../services/geminiService';
import { dbService, getProfileHash } from '../services/dbService';
import { validateUserProfile } from '../services/validationService';
import NutrientChart from './NutrientChart';
import { Brain, Loader2, CalendarCheck, AlertTriangle, Leaf, CheckCircle2, Pill, Zap, Users, User, ShoppingCart, ShoppingBag, Package, Activity, CalendarDays, ArrowRight, Target, ShieldCheck, Terminal, Share2, Printer, Mail, MessageCircle, Gift, Truck, Sparkles } from 'lucide-react';

interface PlannerProps {
    language: Language;
}

interface ShoppingListItem {
    name: string;
    amount: number;
    packRecommendation: string;
    url: string;
}

const Planner: React.FC<PlannerProps> = ({ language }) => {
  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    gender: 'female',
    lifeStage: 'adult',
    goal: 'energy',
    weight: 70,
    duration: 4,
    language: language
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(p => ({ ...p, language }));
  }, [language]);

  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load latest plan
  useEffect(() => {
    const init = async () => {
      try {
        const lastPlan = await dbService.getLatestPlan();
        // Validation: Ensure the retrieved plan has a valid schedule array
        if (lastPlan && Array.isArray(lastPlan.schedule) && lastPlan.schedule.length > 0) {
          setPlan(lastPlan);
        }
      } catch (e) {
        console.warn('Initial load from DB failed', e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (plan && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [plan]);

  const txt = APP_CONTENT[language].planner;
  const options = txt.form.options;

  useEffect(() => {
    if (loading) {
      setProgressPercent(0);
      const steps = language === 'de'
        ? ["Initialisiere...", "Analysiere...", "Wähle Protokoll...", "Generiere Tage...", "Finalisiere..."]
        : ["Initializing...", "Analyzing...", "Selecting Protocol...", "Generating Days...", "Finalizing..."];

      let stepIndex = 0;
      setProgressText(steps[0]);
      const timer = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setProgressText(steps[stepIndex]);
          setProgressPercent(Math.min(((stepIndex + 1) / steps.length) * 100, 98));
        }
      }, 800);
      return () => clearInterval(timer);
    }
  }, [loading, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    
    // Validate input
    const validationErrors = validateUserProfile(profile);
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.map(e => e.message).join('; ');
      setError(language === 'de' 
        ? `Eingabefehler: ${errorMsg}` 
        : `Validation error: ${errorMsg}`);
      setLoading(false);
      return;
    }
    
    const hash = getProfileHash(profile);

    try {
      // 1. Check cache
      const cachedPlan = await dbService.getLatestPlan(hash);
      if (cachedPlan && Array.isArray(cachedPlan.schedule) && cachedPlan.schedule.length > 0) {
        setPlan(cachedPlan);
        setLoading(false);
        return;
      }

      // 2. Generate new
      const result = await generateWeeklyPlan(profile);
      
      if (result && Array.isArray(result.schedule) && result.schedule.length === 7) {
          setPlan(result);
          dbService.savePlan(result, hash).catch(err => console.error('Cache save failed', err));
      } else {
          throw new Error("Invalid plan structure generated. Expected 7 days.");
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(language === 'de' 
        ? "Fehler bei der Generierung. Bitte versuche es in wenigen Augenblicken erneut." 
        : "Generation failed. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyNutrients = useCallback((mix: string[]): Nutrients => {
    if (!mix || !Array.isArray(mix)) return { energy: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, magnesium: 0, calcium: 0, iron: 0, zinc: 0, potassium: 0, vitaminE: 0, b1: 0, b6: 0, selenium: 0, omega3: 0 };

    const nutData = getNutData(language);
    const sortedNuts = [...nutData].sort((a, b) => b.name.length - a.name.length);
    const total: Nutrients = { energy: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, magnesium: 0, calcium: 0, iron: 0, zinc: 0, potassium: 0, vitaminE: 0, b1: 0, b6: 0, selenium: 0, omega3: 0 };

    mix.forEach(item => {
        const match = item.match(/(\d+)\s*g/i);
        if (match) {
            const grams = parseInt(match[1]);
            const nut = sortedNuts.find(n => item.toLowerCase().includes(n.name.toLowerCase()));
            if (nut) {
                const factor = grams / 100;
                (Object.keys(total) as Array<keyof Nutrients>).forEach(key => {
                     total[key] += (nut.nutrientsPer100g[key] || 0) * factor;
                });
            }
        }
    });
    return total;
  }, [language]);

  const calculateShoppingList = useCallback((schedule: DayPlan[]): ShoppingListItem[] => {
    if (!schedule || !Array.isArray(schedule)) return [];
    const totals: Record<string, number> = {};
    const nutData = getNutData(language);
    const sortedNuts = [...nutData].sort((a, b) => b.name.length - a.name.length);

    schedule.forEach(day => {
      if (day.mix) {
          day.mix.forEach(item => {
            const match = item.match(/(\d+)\s*g/i);
            if (match) {
              const amount = parseInt(match[1]);
              const nut = sortedNuts.find(n => item.toLowerCase().includes(n.name.toLowerCase()));
              const key = nut ? nut.name : item.replace(/(\d+)\s*g/i, '').replace(/^[-,.]\s*/, '').trim();
              totals[key] = (totals[key] || 0) + (amount * profile.duration);
            }
          });
      }
    });

    return Object.entries(totals).map(([name, amount]) => {
      const packRecommendation = amount < 80 ? '1x 100g' : amount <= 250 ? '1x 250g' : `${Math.ceil(amount / 250)}x 250g`;
      const nutProfile = nutData.find(n => name.toLowerCase() === n.name.toLowerCase() || n.name.toLowerCase().includes(name.toLowerCase()));
      const url = nutProfile ? nutProfile.shopUrl : `https://www.2die4livefoods.com/search?q=${encodeURIComponent(name)}`;
      return { name, amount, packRecommendation, url };
    }).sort((a, b) => b.amount - a.amount);
  }, [language, profile.duration]);

  const shoppingList = useMemo(() => {
    if (!plan?.schedule) return [];
    return calculateShoppingList(plan.schedule);
  }, [plan?.schedule, calculateShoppingList]);

  // Format plan as shareable text
  const formatPlanAsText = useCallback((): string => {
    if (!plan) return '';

    const header = `🥜 ${plan.title}\n\n${plan.strategy}\n\n`;

    const days = plan.schedule.map(day => {
      const mixText = day.mix.map(item => `  • ${item}`).join('\n');
      return `📅 ${day.day}\n${mixText}\n   🎯 ${day.focus}`;
    }).join('\n\n');

    const shopping = shoppingList.map(item => `  • ${item.name}: ${item.amount}g`).join('\n');
    const shoppingText = `\n\n🛒 ${language === 'de' ? 'Einkaufsliste' : 'Shopping List'}:\n${shopping}`;

    const footer = `\n\n${plan.summary}\n\n---\n${language === 'de' ? 'Erstellt mit' : 'Created with'} NutriPlan AI • 2die4livefoods.com`;

    return header + days + shoppingText + footer;
  }, [plan, shoppingList, language]);

  // Share handlers
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = formatPlanAsText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = plan ? `${plan.title} - NutriPlan AI` : 'My NutriPlan';
    const body = formatPlanAsText();
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan?.title || 'NutriPlan',
          text: formatPlanAsText(),
        });
      } catch (err) {
        // User cancelled or error - silently fail
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4">
      {/* FORM SECTION */}
      <div className="bg-brand-card rounded-2xl p-5 sm:p-8 border border-brand-border shadow-xl mb-8 sm:mb-12 print:hidden w-full mx-auto">
        <div className="mb-6 sm:mb-8 border-b border-brand-border pb-6">
             <h2 className="text-2xl sm:text-3xl font-black text-brand-light flex items-center gap-3">
                <div className="bg-brand-accent/10 p-2 rounded-xl">
                    <Brain className="text-brand-accent" size={24} />
                </div>
                {txt.title}
            </h2>
            <p className="text-base sm:text-lg text-brand-muted mt-3 leading-relaxed max-w-2xl">
                {txt.subtitle}
            </p>
        </div>
       
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="md:col-span-2">
                <label className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.lifeStage}</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button type="button" onClick={() => setProfile({...profile, lifeStage: 'adult', goal: 'energy'})} className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all font-bold text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${profile.lifeStage === 'adult' ? 'border-brand-accent bg-brand-accent text-white shadow-md' : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-white'}`}><User size={18} /> {options.adult}</button>
                    <button type="button" onClick={() => setProfile({...profile, lifeStage: 'child', goal: 'growth_focus', age: 8, weight: 30})} className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all font-bold text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${profile.lifeStage === 'child' ? 'border-brand-accent bg-brand-accent text-white shadow-md' : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-white'}`}><Users size={18} /> {options.child}</button>
                </div>
            </div>

            <div>
                <label htmlFor="goal-select" className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.goal}</label>
                <select id="goal-select" value={profile.goal} onChange={(e) => setProfile({...profile, goal: e.target.value as UserProfile['goal']})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold appearance-none focus:ring-2 focus:ring-brand-accent focus:outline-none">
                    {profile.lifeStage === 'adult' ? (
                        <>
                            <option value="balance">{options.goals.balance}</option>
                            <option value="energy">{options.goals.energy}</option>
                            <option value="muscle">{options.goals.muscle}</option>
                            <option value="immunity">{options.goals.immunity}</option>
                            <option value="keto">{options.goals.keto}</option>
                        </>
                    ) : (
                        <>
                            <option value="growth_focus">{options.goals.growth_focus}</option>
                            <option value="concentration">{options.goals.concentration}</option>
                            <option value="immunity">{options.goals.immunity}</option>
                        </>
                    )}
                </select>
            </div>
            
             <div>
                <label htmlFor="gender-select" className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.gender}</label>
                <select id="gender-select" value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value as UserProfile['gender']})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold appearance-none focus:ring-2 focus:ring-brand-accent focus:outline-none">
                    <option value="female">{options.female}</option>
                    <option value="male">{options.male}</option>
                    <option value="diverse">{options.diverse}</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <label htmlFor="age-input" className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.age}</label>
                    <input id="age-input" type="number" value={profile.age} onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold focus:ring-2 focus:ring-brand-accent focus:outline-none" min={profile.lifeStage === 'child' ? "3" : "18"} />
                </div>
                <div>
                    <label htmlFor="weight-input" className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.weight}</label>
                    <input id="weight-input" type="number" value={profile.weight} onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold focus:ring-2 focus:ring-brand-accent focus:outline-none" min="10" />
                </div>
            </div>

            <div className="md:col-span-1">
                <label htmlFor="duration-select" className="block text-brand-light mb-2 text-xs font-bold uppercase tracking-wider">{txt.form.duration}</label>
                <select id="duration-select" value={profile.duration} onChange={(e) => setProfile({...profile, duration: parseInt(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold appearance-none focus:ring-2 focus:ring-brand-accent focus:outline-none">
                    <option value="1">1 {language === 'de' ? 'Woche' : 'Week'}</option>
                    <option value="2">2 {language === 'de' ? 'Wochen' : 'Weeks'}</option>
                    <option value="4">4 {language === 'de' ? 'Wochen' : 'Weeks'}</option>
                </select>
            </div>

            <div className="md:col-span-2 mt-4">
                 <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-accent to-[#85bc22] text-white font-black text-lg sm:text-xl py-4 sm:py-5 px-6 rounded-xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CalendarCheck size={20} />}
                    {loading ? txt.form.buttonLoading : txt.form.buttonDefault}
                </button>
            </div>

            {loading && (
                <div className="md:col-span-2 bg-stone-50 rounded-xl p-4 sm:p-6 border border-brand-accent/20 mt-2">
                    <div className="flex items-center gap-3 mb-3 text-brand-accent font-bold font-mono text-xs">
                        <Terminal size={14} />
                        <span className="animate-pulse">{progressText}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-brand-accent h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            )}
        </form>
      </div>

      {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-6 rounded-2xl flex items-center gap-4 mb-8 mx-auto shadow-sm">
              <AlertTriangle className="shrink-0" size={20} />
              <span className="font-medium text-base sm:text-lg">{error}</span>
          </div>
      )}

      {/* RESULTS SECTION */}
      <div ref={resultsRef}>
        {plan && plan.schedule && (
            <div className="space-y-8 sm:space-y-12 animate-fade-in pb-20">
                <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-stone-200 shadow-xl print:shadow-none print:border-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8 mb-6 sm:mb-8 border-b border-stone-100 pb-6 sm:pb-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                    <span className="bg-brand-accent text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md">{txt.results.title}</span>
                                    {profile.lifeStage === 'child' && <span className="bg-amber-100 text-amber-700 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">Kids Edition</span>}
                                </div>
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-light tracking-tight mb-4">{plan.title}</h3>
                                <p className="text-stone-600 text-lg sm:text-xl leading-relaxed font-medium max-w-3xl">{plan.strategy}</p>
                            </div>
                            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 min-w-full md:min-w-[240px]">
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{txt.results.createdFor}</div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg border border-stone-200">{profile.lifeStage === 'child' ? <Users size={18} className="text-brand-accent"/> : <User size={18} className="text-brand-accent"/>}</div>
                                    <div>
                                        <div className="font-black text-brand-light text-base sm:text-lg">{profile.lifeStage === 'child' ? options.child : options.adult}</div>
                                        <div className="text-[10px] sm:text-xs font-medium text-stone-500">{profile.gender}, {profile.age}y</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 print:hidden">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mr-2">
                                {language === 'de' ? 'Teilen' : 'Share'}:
                            </span>
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                                title="WhatsApp"
                            >
                                <MessageCircle size={16} />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                            <button
                                onClick={handleEmailShare}
                                className="flex items-center gap-2 px-3 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2"
                                title="Email"
                            >
                                <Mail size={16} />
                                <span className="hidden sm:inline">Email</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                                title={language === 'de' ? 'Drucken' : 'Print'}
                            >
                                <Printer size={16} />
                                <span className="hidden sm:inline">{language === 'de' ? 'Drucken' : 'Print'}</span>
                            </button>
                            {typeof navigator !== 'undefined' && navigator.share && (
                                <button
                                    onClick={handleNativeShare}
                                    className="flex items-center gap-2 px-3 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                                    title={language === 'de' ? 'Mehr...' : 'More...'}
                                >
                                    <Share2 size={16} />
                                    <span className="hidden sm:inline">{language === 'de' ? 'Mehr' : 'More'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {plan.schedule.map((day, idx) => {
                        const dailyNutrients = calculateDailyNutrients(day.mix);
                        return (
                            <div key={idx} className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-stone-100 pb-4 sm:pb-6">
                                    <h4 className="text-xl sm:text-2xl font-black text-brand-light flex items-center gap-3"><CalendarDays className="text-brand-accent" size={20} /> {day.day}</h4>
                                    <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full self-start sm:self-auto">
                                        <Target size={12} className="text-stone-500" />
                                        <span className="text-[9px] sm:text-[10px] font-black text-stone-500 uppercase tracking-widest">{day.focus}</span>
                                    </div>
                                </div>
                                <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">MIX</p>
                                            <div className="space-y-2 mb-6 sm:mb-8">
                                                {day.mix && day.mix.map((item, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className="mt-0.5 shrink-0"><Leaf size={16} className="text-brand-accent" /></div>
                                                        <span className="font-medium text-brand-light text-base sm:text-lg leading-snug">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {day.supplement && (
                                            <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#fef3c7] mt-auto">
                                                <div className="flex gap-3"><Zap className="text-amber-500 shrink-0 mt-0.5" size={18} fill="currentColor" />
                                                    <div><p className="text-[10px] font-black text-amber-700 uppercase mb-1 tracking-wider">Bio-Hack</p>
                                                        <p className="text-xs sm:text-sm font-medium text-amber-900/90 leading-relaxed">{day.supplement}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lg:border-l border-stone-100 lg:pl-12 flex flex-col pt-4 lg:pt-0">
                                        <div className="flex items-center gap-2 mb-4"><Activity size={14} className="text-stone-400" /><h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{language === 'de' ? 'Nährwert-Profil' : 'Nutrient Profile'}</h4></div>
                                        <div className="flex-1 min-h-[180px] sm:min-h-[250px]">
                                            <NutrientChart currentIntake={dailyNutrients} language={language} simple={true} height="100%" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ALL-IN-ONE Set Promo Box */}
                <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-brand-accent/10 p-2 rounded-xl">
                                    <Gift className="text-brand-accent" size={24} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-brand-light">
                                    {language === 'de' ? '2DiE4 ALL-IN-ONE Set!' : '2DiE4 ALL-IN-ONE Set!'}
                                </h3>
                                <div className="bg-red-500 text-white px-3 py-1 rounded-lg transform rotate-[-3deg] shadow-md">
                                    <span className="font-black text-sm">-22%</span>
                                </div>
                            </div>

                            <p className="text-stone-600 text-sm sm:text-base mb-4 font-medium">
                                {language === 'de'
                                    ? 'Entdecke oder verschenke alle unsere Nüsse: 7 Sorten à 100g'
                                    : 'Discover or gift all our nuts: 7 varieties × 100g'}
                            </p>

                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start gap-2 text-sm">
                                    <Sparkles className="text-brand-accent shrink-0 mt-0.5" size={16} />
                                    <span><strong className="text-brand-light">{language === 'de' ? 'Premium-Auswahl' : 'Premium Selection'}:</strong> {language === 'de' ? '7 x 100g aktivierte Bio-Nüsse (inkl. Nuss-Mix)' : '7 x 100g activated organic nuts (incl. Nut Mix)'}</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                    <span><strong className="text-brand-light">{language === 'de' ? 'Smart gespart' : 'Smart savings'}:</strong> {language === 'de' ? 'Du sicherst dir 22% Rabatt im Set' : 'You save 22% with the set'}</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <Truck className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                    <span><strong className="text-brand-light">{language === 'de' ? 'Sofort-Bonus' : 'Instant bonus'}:</strong> {language === 'de' ? 'Versandkostenfrei (DE/AT)!' : 'Free shipping (DE/AT)!'}</span>
                                </li>
                            </ul>

                            <p className="text-xs text-stone-500 italic mb-4">
                                {language === 'de'
                                    ? 'Das Set enthält alle unserer Bestseller und die restlichen Nüsse im Nuss-Mix.'
                                    : 'The set contains all our bestsellers and the remaining nuts in the Nut Mix.'}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 lg:min-w-[200px]">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-black text-brand-accent">49,90 €</div>
                                <div className="text-sm text-stone-400 line-through">64,30 €</div>
                            </div>
                            <a
                                href="https://www.2die4livefoods.com/de-de/products/2die4-all-in-one-bundle"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-black py-4 px-8 rounded-xl text-center transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <span>{language === 'de' ? 'Jetzt kaufen!' : 'Buy now!'}</span>
                                <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
                    <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden flex flex-col">
                        <div className="bg-brand-light p-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 text-white font-bold text-xl"><ShoppingBag className="text-brand-accent" size={20} /> <span>{txt.results.shoppingList}</span></div>
                            <span className="hidden xs:inline-block text-[10px] bg-brand-accent text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-wide">{profile.duration} {txt.results.weekSupply}</span>
                        </div>
                        <div className="p-4 sm:p-8 grid sm:grid-cols-2 gap-4 sm:gap-6 bg-stone-50/30 flex-1">
                            {shoppingList.map((item, idx) => (
                                <div key={idx} className="flex flex-col p-4 rounded-2xl bg-white border border-stone-200 hover:border-brand-accent/50 hover:shadow-lg transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className="font-bold text-base sm:text-lg text-brand-light leading-tight">{item.name}</span>
                                        <span className="text-[10px] sm:text-sm font-mono font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-md">{item.amount}g</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                                        <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-bold uppercase tracking-wide"><Package size={12} /> <span>{txt.results.packRec}: <strong className="text-stone-900">{item.packRecommendation}</strong></span></div>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-brand-light hover:bg-brand-accent text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg shadow-md shrink-0"><ShoppingCart size={10} /> Shop</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-[#1c1917] text-white rounded-3xl p-6 shadow-xl relative border border-stone-800">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6"><h4 className="font-black text-4xl text-white">ABO</h4><div className="bg-brand-accent text-white px-2 py-1 rounded-lg transform rotate-[-3deg]"><span className="font-black text-lg">-15%</span></div></div>
                                <p className="text-xs sm:text-sm text-stone-300 mb-8 font-medium leading-relaxed">{txt.aboBox.aboDesc}</p>
                                <a href="https://www.2die4livefoods.com/de-de/products/2die4-all-in-one-bundle" target="_blank" rel="noopener noreferrer" className="w-full bg-white text-brand-light hover:bg-brand-accent hover:text-white font-black py-4 px-6 rounded-xl text-center transition-all shadow-lg flex items-center justify-center gap-2 text-sm"><span>{txt.aboBox.aboButtonText}</span> <ArrowRight size={16} /></a>
                                <div className="flex items-center justify-center gap-2 text-[9px] text-stone-500 font-medium mt-4"><ShieldCheck size={10} className="text-emerald-500" /> <span>{txt.aboBox.cancelAnytime}</span></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl flex-1 flex flex-col justify-center">
                            <div className="bg-stone-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 border border-stone-100"><Pill className="text-brand-accent" size={20} /></div>
                            <h4 className="text-base sm:text-lg font-bold text-brand-light mb-2">{txt.results.summaryTitle}</h4>
                            <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">{plan.summary}</p>
                        </div>
                    </div>
                </div>
                <div className="pt-6 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-400 gap-3 text-center md:text-left">
                    <p>{txt.results.disclaimer}</p>
                    <p className="font-bold text-stone-300 flex items-center gap-1.5 uppercase tracking-widest"><CheckCircle2 size={10} /> 2die4 Live Foods • NutriPlan AI</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Planner;