import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';

const Planner = lazy(() => import('./components/Planner'));
const NutLibrary = lazy(() => import('./components/NutLibrary'));
const FAQ = lazy(() => import('./components/FAQ'));
const Sources = lazy(() => import('./components/Sources'));
import ErrorBoundary from './components/ErrorBoundary';
import { Brain, Menu, X, BookOpen, Globe, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { APP_CONTENT } from './constants';
import { withUtm } from './services/shopLink';
import { dbService } from './services/dbService';
import { Language, StoredPlan } from './types';

enum Tab {
  PLANNER = 'planner',
  LIBRARY = 'library',
  FAQ = 'faq',
  SOURCES = 'sources',
}

// Custom Logo Component - mobil kompakt, Desktop groß
const BrandLogo = () => (
  <div className="p-1 md:p-2">
    <img
      src="https://www.2die4livefoods.com/cdn/shop/files/LogoStempel_Vektor_schwarz.png?v=1633334363&width=150"
      alt="2DiE4 Live Foods"
      className="h-14 w-14 md:h-[100px] md:w-[100px] object-contain"
    />
  </div>
);

/**
 * Parse language from URL path: /en/ → 'en', everything else → 'de'
 */
const getLanguageFromPath = (): Language => {
  const path = window.location.pathname;
  return path.startsWith('/en') ? 'en' : 'de';
};

// Shareable URL hash per tab, e.g. /de/#rechner. Planner ist Default (kein Hash).
const TAB_TO_HASH: Record<Tab, string> = {
  [Tab.PLANNER]: '',
  [Tab.LIBRARY]: 'rechner',
  [Tab.FAQ]: 'faq',
  [Tab.SOURCES]: 'quellen',
};

const HASH_TO_TAB: Record<string, Tab> = {
  rechner: Tab.LIBRARY,
  calculator: Tab.LIBRARY,
  faq: Tab.FAQ,
  quellen: Tab.SOURCES,
  sources: Tab.SOURCES,
};

const getTabFromHash = (): Tab =>
  HASH_TO_TAB[window.location.hash.slice(1).toLowerCase()] ?? Tab.PLANNER;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(getLanguageFromPath);
  const [sharedPlan, setSharedPlan] = useState<StoredPlan | null>(null);
  const [sharedPlanNotFound, setSharedPlanNotFound] = useState(false);

  const txt = APP_CONTENT[language].general;

  // Geteilten Plan aus ?plan=<id> laden (Permalink)
  useEffect(() => {
    const planParam = new URLSearchParams(window.location.search).get('plan');
    if (!planParam) return;

    const planId = parseInt(planParam, 10);
    if (!Number.isInteger(planId) || planId <= 0) {
      setSharedPlanNotFound(true);
      return;
    }

    dbService.getPlanById(planId).then(stored => {
      if (!stored) {
        setSharedPlanNotFound(true);
        return;
      }
      // UI-Sprache an die Plan-Sprache angleichen: das Nussnamen-Matching
      // der Einkaufsliste ist sprachgebunden.
      const ctxLang = stored.context?.language;
      if ((ctxLang === 'de' || ctxLang === 'en') && ctxLang !== getLanguageFromPath()) {
        window.history.replaceState({ language: ctxLang }, '', `/${ctxLang}/?plan=${planId}`);
        setLanguage(ctxLang);
      }
      setSharedPlan(stored);
      setActiveTab(Tab.PLANNER);
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'de' ? 'en' : 'de';
      const newPath = `/${next}/${window.location.hash}`;
      window.history.pushState({ language: next }, '', newPath);
      return next;
    });
  }, []);

  // Canonical, Title und Meta-Description pro Sprache nachziehen
  useEffect(() => {
    const base = 'https://liveactivated.org';
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${base}/${language}/`;
    document.documentElement.lang = language;

    document.title = APP_CONTENT[language].general.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', APP_CONTENT[language].general.metaDescription);
  }, [language]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setLanguage(getLanguageFromPath());
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    const hash = TAB_TO_HASH[tab];
    const url = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ''}`;
    window.history.pushState({ tab }, '', url);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans selection:bg-brand-accent selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* Navigation Bar - Natural height based on padding and content */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo Area */}
            <a
                href={withUtm("https://www.2die4livefoods.com/", 'header-logo')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity -ml-2 shrink-0"
            >
                <BrandLogo />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleTabChange(Tab.PLANNER)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === Tab.PLANNER 
                    ? 'bg-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium text-brand-light/70 hover:text-brand-light hover:bg-brand-input'
                }`}
              >
                <Brain size={18} />
                <span>{txt.plannerTab}</span>
              </button>
              <button
                onClick={() => handleTabChange(Tab.LIBRARY)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === Tab.LIBRARY
                    ? 'bg-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium text-brand-light/70 hover:text-brand-light hover:bg-brand-input'
                }`}
              >
                <BookOpen size={18} />
                <span>{txt.libraryTab}</span>
              </button>
              <button
                onClick={() => handleTabChange(Tab.FAQ)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === Tab.FAQ
                    ? 'bg-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium text-brand-light/70 hover:text-brand-light hover:bg-brand-input'
                }`}
              >
                <HelpCircle size={18} />
                <span>{txt.faqTab}</span>
              </button>
              <button
                onClick={() => handleTabChange(Tab.SOURCES)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === Tab.SOURCES
                    ? 'bg-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium text-brand-light/70 hover:text-brand-light hover:bg-brand-input'
                }`}
              >
                <FileText size={18} />
                <span>{txt.sourcesTab}</span>
              </button>

              <div className="h-6 w-px bg-brand-border mx-2"></div>

              {/* Language Toggle - beide Sprachen sichtbar, aktive markiert */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-sm font-bold transition-colors"
                title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
              >
                <Globe size={18} className="whimsy-lang-flip text-brand-muted" />
                <span className={language === 'de' ? 'text-brand-light underline decoration-brand-accent decoration-2 underline-offset-4' : 'text-brand-muted hover:text-brand-light'}>DE</span>
                <span className="text-brand-border">|</span>
                <span className={language === 'en' ? 'text-brand-light underline decoration-brand-accent decoration-2 underline-offset-4' : 'text-brand-muted hover:text-brand-light'}>EN</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 text-sm font-bold"
                    title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
                >
                    <Globe size={18} className="text-brand-muted" />
                    <span className={language === 'de' ? 'text-brand-light underline decoration-brand-accent decoration-2 underline-offset-4' : 'text-brand-muted'}>DE</span>
                    <span className="text-brand-border">|</span>
                    <span className={language === 'en' ? 'text-brand-light underline decoration-brand-accent decoration-2 underline-offset-4' : 'text-brand-muted'}>EN</span>
                </button>
                <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="text-brand-muted hover:text-brand-light p-2"
                    aria-label="Open menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <Menu />
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-border bg-stone-50/50">
            <h2 className="text-xl font-bold text-brand-light">Menu</h2>
            <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-muted hover:text-brand-light p-2 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close menu"
            >
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
             <button
                onClick={() => handleTabChange(Tab.PLANNER)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-lg transition-all duration-200 border ${
                activeTab === Tab.PLANNER 
                    ? 'bg-brand-accent border-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium bg-white border-transparent text-brand-light/70 hover:bg-stone-50 hover:text-brand-light'
                }`}
            >
                <div className="flex items-center gap-4">
                    <Brain size={24} />
                    {txt.plannerTab}
                </div>
                {activeTab === Tab.PLANNER && <ChevronRight size={20} />}
            </button>

            <button
                onClick={() => handleTabChange(Tab.LIBRARY)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-lg transition-all duration-200 border ${
                activeTab === Tab.LIBRARY
                    ? 'bg-brand-accent border-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium bg-white border-transparent text-brand-light/70 hover:bg-stone-50 hover:text-brand-light'
                }`}
            >
                <div className="flex items-center gap-4">
                    <BookOpen size={24} />
                    {txt.libraryTab}
                </div>
                 {activeTab === Tab.LIBRARY && <ChevronRight size={20} />}
            </button>

            <button
                onClick={() => handleTabChange(Tab.FAQ)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-lg transition-all duration-200 border ${
                activeTab === Tab.FAQ
                    ? 'bg-brand-accent border-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium bg-white border-transparent text-brand-light/70 hover:bg-stone-50 hover:text-brand-light'
                }`}
            >
                <div className="flex items-center gap-4">
                    <HelpCircle size={24} />
                    {txt.faqTab}
                </div>
                 {activeTab === Tab.FAQ && <ChevronRight size={20} />}
            </button>

            <button
                onClick={() => handleTabChange(Tab.SOURCES)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-lg transition-all duration-200 border ${
                activeTab === Tab.SOURCES
                    ? 'bg-brand-accent border-brand-accent text-brand-light font-semibold shadow-sm'
                    : 'font-medium bg-white border-transparent text-brand-light/70 hover:bg-stone-50 hover:text-brand-light'
                }`}
            >
                <div className="flex items-center gap-4">
                    <FileText size={24} />
                    {txt.sourcesTab}
                </div>
                 {activeTab === Tab.SOURCES && <ChevronRight size={20} />}
            </button>

            <div className="py-6">
                <div className="h-px bg-brand-border w-full"></div>
            </div>

            <button
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-lg font-medium text-brand-muted hover:bg-stone-50 hover:text-brand-light transition-all"
            >
                <Globe size={24} />
                <span>{language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}</span>
            </button>
        </div>
        
        <div className="p-6 border-t border-brand-border bg-stone-50/50">
            <p className="text-center text-xs text-brand-muted">
                © 2026 2diE4 Live Foods
            </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-light mb-4">
                {activeTab === Tab.PLANNER && txt.plannerHeader}
                {activeTab === Tab.LIBRARY && txt.libraryHeader}
                {activeTab === Tab.FAQ && txt.faqHeader}
                {activeTab === Tab.SOURCES && txt.sourcesHeader}
            </h1>
            <p className="text-xl text-brand-muted max-w-2xl mx-auto">
                {activeTab === Tab.PLANNER && txt.plannerSubHeader}
                {activeTab === Tab.LIBRARY && txt.librarySubHeader}
                {activeTab === Tab.FAQ && txt.faqSubHeader}
                {activeTab === Tab.SOURCES && txt.sourcesSubHeader}
            </p>
        </div>

        <ErrorBoundary language={language}>
          <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent"></div></div>}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === Tab.PLANNER && <Planner language={language} sharedPlan={sharedPlan} sharedPlanNotFound={sharedPlanNotFound} />}
                {activeTab === Tab.LIBRARY && <NutLibrary language={language} />}
                {activeTab === Tab.FAQ && <FAQ language={language} />}
                {activeTab === Tab.SOURCES && <Sources language={language} />}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-brand-border bg-gradient-to-b from-transparent to-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <a
                href={withUtm("https://www.2die4livefoods.com/", 'footer')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://www.2die4livefoods.com/cdn/shop/files/LogoStempel_Vektor_schwarz.png?v=1633334363&width=150"
                  alt="2DiE4 Live Foods"
                  className="h-16 w-16 object-contain mx-auto md:mx-0"
                />
              </a>
              <p className="mt-3 text-sm text-brand-muted max-w-xs mx-auto md:mx-0">
                {language === 'de'
                  ? 'Aktivierte Bio-Nüsse für natürliche Nährstoffversorgung.'
                  : 'Activated organic nuts for natural nutrient supply.'}
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold text-brand-light mb-4">
                {language === 'de' ? 'Schnellzugriff' : 'Quick Links'}
              </h4>
              <nav className="flex flex-col gap-2">
                <a
                  href={withUtm("https://www.2die4livefoods.com/pages/2die4-live-foods-nuss-abo", 'footer')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-brand-light transition-colors"
                >
                  {language === 'de' ? 'Nuss-Abo' : 'Nut Subscription'}
                </a>
                <a
                  href={withUtm("https://www.2die4livefoods.com/de-de/collections/alle-produkte", 'footer')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  {language === 'de' ? 'Zum Shop' : 'Visit Shop'}
                </a>
                <a
                  href={withUtm("https://www.2die4livefoods.com/pages/faq", 'footer')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  {language === 'de' ? 'Häufige Fragen' : 'FAQ'}
                </a>
                <a
                  href={withUtm("https://www.2die4livefoods.com/pages/impressum", 'footer')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  Impressum
                </a>
              </nav>
            </div>

            {/* Contact / Info */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-brand-light mb-4">
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:hello@2die4livefoods.com"
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  hello@2die4livefoods.com
                </a>
                <a
                  href={withUtm("https://www.2die4livefoods.com/", 'footer')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  www.2die4livefoods.com
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border pt-8">
            {/* Disclaimer */}
            <div className="bg-stone-100/80 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-xs text-brand-muted text-center leading-relaxed">
                {txt.footerNote}
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
              <p>{txt.footerDisclaimer}</p>
              <div className="flex items-center gap-2">
                <span>NutriPlan AI</span>
                <span className="text-brand-border">•</span>
                <a
                  href="https://hypeakz.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-accent hover:text-brand-light transition-colors"
                >
                  by HYPEAKZ.IO
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;