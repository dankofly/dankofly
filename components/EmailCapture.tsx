import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { APP_CONTENT } from '../constants';
import { subscribeService } from '../services/subscribeService';
import { Mail, Loader2, CheckCircle2, AlertTriangle, Gift } from 'lucide-react';

interface EmailCaptureProps {
    language: Language;
    planId: number | null;
    goal: UserProfile['goal'];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const EmailCapture: React.FC<EmailCaptureProps> = ({ language, planId, goal }) => {
  const txt = APP_CONTENT[language].planner.emailCapture;
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg(txt.errorInvalid);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg(null);
    const result = await subscribeService.subscribe({
      email: trimmed,
      language,
      planId,
      goal,
      website,
    });

    if (result.ok) {
      setStatus('success');
    } else {
      setErrorMsg(result.status === 400 ? txt.errorInvalid : txt.errorGeneric);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xl print:hidden">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={28} />
          <div>
            <h3 className="text-xl font-black text-emerald-800 mb-2">{txt.successTitle}</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">{txt.successBody}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-brand-accent/30 p-6 sm:p-8 shadow-xl print:hidden relative overflow-hidden">
      <div className="absolute top-0 right-0 w-28 h-28 bg-brand-accent/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-accent/10 p-2 rounded-xl">
            <Gift className="text-brand-accent" size={22} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-brand-light">{txt.title}</h3>
        </div>
        <p className="text-sm sm:text-base text-stone-600 mb-5 font-medium max-w-2xl">{txt.subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl" noValidate>
          {/* Honeypot: visuell versteckt, nicht display:none */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder={txt.placeholder}
            aria-label={txt.placeholder}
            required
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4 text-brand-light font-bold focus:ring-2 focus:ring-brand-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading' || planId === null}
            className="whimsy-cta bg-brand-accent hover:bg-brand-accent/90 text-white font-black py-3 sm:py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
            {status === 'loading' ? txt.buttonLoading : txt.button}
          </button>
        </form>

        {planId === null && (
          <p className="text-xs text-stone-400 mt-2 font-medium">{txt.preparingLink}</p>
        )}

        {status === 'error' && errorMsg && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-2 font-medium">
            <AlertTriangle size={14} /> {errorMsg}
          </p>
        )}

        <p className="text-[11px] text-stone-400 mt-4 leading-relaxed max-w-2xl">
          {txt.consentHint}{' '}
          <a
            href="https://www.2die4livefoods.com/policies/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-accent"
          >
            {txt.privacyLinkText}
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmailCapture;
