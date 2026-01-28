import React, { useState } from 'react';
import { Language } from '../types';
import { ChevronDown, Calculator, Leaf, BookOpen, ExternalLink } from 'lucide-react';

interface FAQProps {
  language: Language;
}

interface FAQItem {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

interface FAQSection {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ReactNode;
  link?: string;
  items: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: 'calculator',
    title: 'Nutri-Planer & Nuss-Rechner',
    titleEn: 'Nutri Planner & Nut Calculator',
    icon: <Calculator className="w-5 h-5" />,
    link: 'https://2die4.hypeakz.io/',
    items: [
      {
        question: 'Was zeigt mir der Nutri-Planer konkret an?',
        questionEn: 'What does the Nutri Planner show me specifically?',
        answer: 'Der Nutri-Planer berechnet auf Basis der ausgewählten Nussart und Menge den Energiegehalt (kcal), die Makronährstoffe Protein, Kohlenhydrate und Fett sowie ausgewählte Mikronährstoffe wie Magnesium, Eisen, Zink, Kalium, Selen und bestimmte B-Vitamine. Zusätzlich wird dargestellt, welchen Anteil diese Mengen an den empfohlenen Tageszufuhren decken. Damit wird sichtbar, welchen realen Beitrag Nüsse zur täglichen Nährstoffversorgung leisten können, statt nur abstrakte Zahlen zu liefern.',
        answerEn: 'The Nutri Planner calculates the energy content (kcal), macronutrients protein, carbohydrates and fat, as well as selected micronutrients such as magnesium, iron, zinc, potassium, selenium and certain B vitamins based on the selected nut type and quantity. Additionally, it shows what proportion of the recommended daily intake these amounts cover. This makes visible the real contribution nuts can make to daily nutrient supply, rather than just providing abstract numbers.'
      },
      {
        question: 'Auf welcher Datenbasis beruhen die Nährwerte?',
        questionEn: 'What data basis are the nutritional values based on?',
        answer: 'Die Berechnungen stützen sich auf international anerkannte Lebensmitteldatenbanken und Referenzwerke, darunter USDA FoodData Central, EuroFIR sowie das Standardwerk Souci–Fachmann–Kraut: Die Zusammensetzung der Lebensmittel. Ergänzend werden wissenschaftliche Übersichtsarbeiten zur gesundheitlichen Bedeutung von Nüssen und Samen herangezogen, insbesondere Nuts and Seeds in Health and Disease Prevention (Preedy & Watson).',
        answerEn: 'The calculations are based on internationally recognized food databases and reference works, including USDA FoodData Central, EuroFIR and the standard work Souci–Fachmann–Kraut: Food Composition Tables. Additionally, scientific reviews on the health significance of nuts and seeds are used, particularly Nuts and Seeds in Health and Disease Prevention (Preedy & Watson).'
      },
      {
        question: 'Beziehen sich die Angaben auf rohe, geröstete oder aktivierte Nüsse?',
        questionEn: 'Do the values refer to raw, roasted or activated nuts?',
        answer: 'Alle Werte beziehen sich auf roh verarbeitete Nüsse. Die Aktivierung verändert den absoluten Nährstoffgehalt nicht wesentlich, kann aber die Verfügbarkeit einzelner Mineralstoffe beeinflussen. Geröstete oder stark erhitzte Nüsse weisen teils veränderte Fettsäure- und Vitaminprofile auf und sind daher nicht Grundlage der Berechnungen.',
        answerEn: 'All values refer to raw processed nuts. Activation does not significantly change the absolute nutrient content but can influence the availability of individual minerals. Roasted or heavily heated nuts have partially altered fatty acid and vitamin profiles and are therefore not the basis for the calculations.'
      },
      {
        question: 'Was bedeutet „% RDA" bzw. „% Tagesbedarf" im Rechner?',
        questionEn: 'What does "% RDA" or "% daily requirement" mean in the calculator?',
        answer: 'Die Prozentangaben beziehen sich auf die empfohlenen Tageszufuhren (Reference Daily Allowance bzw. Dietary Reference Values) für gesunde Erwachsene gemäß EFSA. Sie zeigen, welchen Anteil der Bedarf eines Nährstoffs durch die ausgewählte Menge Nüsse gedeckt wird und erlauben eine realistische Einordnung im Kontext der Gesamternährung.',
        answerEn: 'The percentages refer to the recommended daily intakes (Reference Daily Allowance or Dietary Reference Values) for healthy adults according to EFSA. They show what proportion of a nutrient\'s requirement is covered by the selected amount of nuts and allow a realistic classification in the context of overall nutrition.'
      },
      {
        question: 'Kann der Rechner ein Multivitaminpräparat ersetzen?',
        questionEn: 'Can the calculator replace a multivitamin supplement?',
        answer: 'Der Rechner erhebt nicht den Anspruch, pauschal Multivitaminpräparate zu ersetzen. Er zeigt jedoch, dass Nüsse relevante Mengen vieler Mikronährstoffe liefern, die typischerweise supplementiert werden, etwa Magnesium, Vitamin E, Zink oder Selen. Ob ein Supplement eingespart werden kann, hängt von der restlichen Ernährung und individuellen Bedürfnissen ab.',
        answerEn: 'The calculator does not claim to universally replace multivitamin supplements. However, it shows that nuts provide relevant amounts of many micronutrients that are typically supplemented, such as magnesium, vitamin E, zinc or selenium. Whether a supplement can be saved depends on the rest of the diet and individual needs.'
      },
      {
        question: 'Warum werden nicht alle Vitamine und Spurenelemente angezeigt?',
        questionEn: 'Why are not all vitamins and trace elements displayed?',
        answer: 'Der Fokus liegt auf jenen Nährstoffen, die in Nüssen in ernährungsphysiologisch relevanten und analytisch gut belegten Mengen vorkommen. Vitamine wie Vitamin D oder Vitamin B12 sind in Nüssen nicht in nennenswerten Mengen enthalten und werden daher bewusst nicht dargestellt, um Fehlinterpretationen zu vermeiden.',
        answerEn: 'The focus is on those nutrients that occur in nuts in nutritionally relevant and analytically well-documented amounts. Vitamins such as vitamin D or vitamin B12 are not present in nuts in significant amounts and are therefore deliberately not displayed to avoid misinterpretation.'
      },
      {
        question: 'Was ist der Darm-Benefit-Index?',
        questionEn: 'What is the Gut Benefit Index?',
        answer: 'Der Darm-Benefit-Index ist ein interner Vergleichswert, der Ballaststoffgehalt, Fettzusammensetzung und allgemeine Bekömmlichkeit berücksichtigt. Er dient der Orientierung innerhalb des Rechners und ist kein medizinischer oder klinischer Parameter.',
        answerEn: 'The Gut Benefit Index is an internal comparison value that takes into account fiber content, fat composition and general digestibility. It serves as orientation within the calculator and is not a medical or clinical parameter.'
      },
      {
        question: 'Sind die Berechnungen auch für Kinder gültig?',
        questionEn: 'Are the calculations also valid for children?',
        answer: 'Die zugrunde liegenden Nährstoffdaten sind allgemein gültig. Die dargestellten Prozentwerte beziehen sich jedoch auf Erwachsenen-Referenzwerte. Für Kinder gelten altersabhängige Empfehlungen, weshalb die Mengen im Alltag angepasst werden müssen.',
        answerEn: 'The underlying nutrient data is generally valid. However, the displayed percentage values refer to adult reference values. Age-dependent recommendations apply to children, which is why the amounts must be adjusted in everyday life.'
      },
      {
        question: 'Warum kann ich die Verzehrmenge frei einstellen?',
        questionEn: 'Why can I freely adjust the consumption amount?',
        answer: 'Die freie Mengeneinstellung ermöglicht es, reale Essgewohnheiten abzubilden. So wird sichtbar, wie sich kleine Handvoll-Portionen oder größere Mengen auf Energie- und Nährstoffzufuhr auswirken.',
        answerEn: 'The free quantity setting makes it possible to reflect real eating habits. This shows how small handful portions or larger amounts affect energy and nutrient intake.'
      },
      {
        question: 'Ist der Nutri-Planer ein medizinisches oder therapeutisches Tool?',
        questionEn: 'Is the Nutri Planner a medical or therapeutic tool?',
        answer: 'Nein. Der Nutri-Planer ist ein ernährungsphysiologisches Informations- und Orientierungswerkzeug. Er ersetzt keine medizinische Diagnose oder Therapie und trifft keine Heilversprechen.',
        answerEn: 'No. The Nutri Planner is a nutritional information and orientation tool. It does not replace medical diagnosis or therapy and makes no healing promises.'
      }
    ]
  },
  {
    id: 'activated',
    title: 'Aktivierte Bio-Nüsse',
    titleEn: 'Activated Organic Nuts',
    icon: <Leaf className="w-5 h-5" />,
    link: 'https://www.2die4livefoods.com/pages/faq',
    items: [
      {
        question: 'Was bedeutet „aktiviert" bei Nüssen genau?',
        questionEn: 'What exactly does "activated" mean for nuts?',
        answer: 'Aktivieren bezeichnet das kontrollierte Einweichen roher, keimfähiger Nüsse in Wasser und das anschließende schonende Trocknen bei niedrigen Temperaturen. Dabei werden natürliche Keimprozesse angestoßen und anschließend gestoppt.',
        answerEn: 'Activation refers to the controlled soaking of raw, germinable nuts in water followed by gentle drying at low temperatures. This initiates natural germination processes which are then stopped.'
      },
      {
        question: 'Warum gelten aktivierte Nüsse als besser bekömmlich?',
        questionEn: 'Why are activated nuts considered more digestible?',
        answer: 'Viele Nüsse enthalten antinutritive Stoffe wie Phytinsäure, die Mineralstoffe binden können. Studien zeigen, dass Einweichen und Keimen den Phytatgehalt reduzieren kann, was die Verdauung und Mineralstoffverfügbarkeit positiv beeinflussen kann.',
        answerEn: 'Many nuts contain anti-nutritive substances such as phytic acid that can bind minerals. Studies show that soaking and germination can reduce phytate content, which can positively influence digestion and mineral availability.'
      },
      {
        question: 'Verändert Aktivierung den Nährstoffgehalt der Nüsse?',
        questionEn: 'Does activation change the nutrient content of nuts?',
        answer: 'Der absolute Gehalt an Mineralstoffen und Makronährstoffen bleibt weitgehend gleich. Die Aktivierung kann jedoch enzymatische Prozesse auslösen, die die Verfügbarkeit einzelner Nährstoffe verbessern, ohne die Nuss strukturell zu zerstören.',
        answerEn: 'The absolute content of minerals and macronutrients remains largely the same. However, activation can trigger enzymatic processes that improve the availability of individual nutrients without structurally destroying the nut.'
      },
      {
        question: 'Was bedeutet „lebendige Lebensmittel" im Zusammenhang mit Nüssen?',
        questionEn: 'What does "living foods" mean in relation to nuts?',
        answer: 'Damit ist gemeint, dass die Rohware keimfähig ist und nicht durch hohe Hitze denaturiert wurde. Aktivierte Nüsse nutzen natürliche biologische Prozesse und bleiben möglichst nah am ursprünglichen Lebensmittel.',
        answerEn: 'This means that the raw material is germinable and has not been denatured by high heat. Activated nuts use natural biological processes and remain as close as possible to the original food.'
      },
      {
        question: 'Warum können aktivierte Bio-Nüsse Nahrungsergänzungsmittel ersetzen helfen?',
        questionEn: 'Why can activated organic nuts help replace dietary supplements?',
        answer: 'Nüsse liefern Mikronährstoffe im natürlichen Verbund mit Fettsäuren, Ballaststoffen und sekundären Pflanzenstoffen. Diese Matrix unterscheidet sich grundlegend von isolierten Einzelstoffen in Supplementen und wird in der Ernährungswissenschaft als vorteilhaft beschrieben.',
        answerEn: 'Nuts provide micronutrients in natural combination with fatty acids, fiber and secondary plant compounds. This matrix differs fundamentally from isolated individual substances in supplements and is described as advantageous in nutritional science.'
      }
    ]
  }
];

const INTRO_TEXT = {
  de: 'Der Nutri-Planer und Nuss-Rechner wurde entwickelt, um transparent und nachvollziehbar aufzuzeigen, wie aktivierte Bio-Nüsse zur täglichen Nährstoffversorgung beitragen können. Zahlreiche ernährungswissenschaftliche Arbeiten zeigen, dass Nüsse zu den nährstoffdichtesten Lebensmitteln zählen und relevante Mengen an Mineralstoffen, Vitaminen, hochwertigen Fettsäuren, Ballaststoffen und bioaktiven Pflanzenstoffen liefern. Ziel dieses Rechners ist es, eine praxisnahe Orientierung zu geben, wie durch den regelmäßigen Verzehr solcher echten, möglichst unverarbeiteten Lebensmittel Teile künstlicher Nahrungsergänzungsmittel mit isolierten Einzelstoffen und oft variabler Bioverfügbarkeit eingespart werden können. Gleichzeitig steht der Genuss im Vordergrund: Crunch, Umami und der ursprüngliche Geschmack roher, aktivierter Nüsse. Dieser Ansatz entspricht aktuellen ernährungswissenschaftlichen Empfehlungen, die eine lebensmittelbasierte Nährstoffzufuhr gegenüber isolierten Supplementen bevorzugen, sofern dies möglich ist.',
  en: 'The Nutri Planner and Nut Calculator was developed to transparently and comprehensibly show how activated organic nuts can contribute to daily nutrient supply. Numerous nutritional science studies show that nuts are among the most nutrient-dense foods and provide relevant amounts of minerals, vitamins, high-quality fatty acids, fiber and bioactive plant compounds. The aim of this calculator is to provide practical guidance on how regular consumption of such real, minimally processed foods can save parts of artificial dietary supplements with isolated individual substances and often variable bioavailability. At the same time, enjoyment is at the forefront: crunch, umami and the original taste of raw, activated nuts. This approach corresponds to current nutritional science recommendations that prefer food-based nutrient intake over isolated supplements where possible.'
};

const SOURCES_TEXT = {
  de: {
    title: 'Quellen (Auswahl)',
    sources: [
      'Preedy, V. R., Watson, R. R. (Hrsg.). Nuts and Seeds in Health and Disease Prevention. Academic Press / Elsevier, 2020.',
      'Souci, S. W., Fachmann, W., Kraut, H. Die Zusammensetzung der Lebensmittel. Wissenschaftliche Verlagsgesellschaft.',
      'USDA FoodData Central, U.S. Department of Agriculture.',
      'EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Dietary Reference Values für Vitamine und Mineralstoffe.',
      'FAO/WHO. Food energy – methods of analysis and conversion factors.',
      'Lestienne et al. Effect of soaking and germination on mineral bioavailability. Journal of Food Science.'
    ]
  },
  en: {
    title: 'Sources (Selection)',
    sources: [
      'Preedy, V. R., Watson, R. R. (Eds.). Nuts and Seeds in Health and Disease Prevention. Academic Press / Elsevier, 2020.',
      'Souci, S. W., Fachmann, W., Kraut, H. Food Composition Tables. Scientific Publishing Company.',
      'USDA FoodData Central, U.S. Department of Agriculture.',
      'EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Dietary Reference Values for vitamins and minerals.',
      'FAO/WHO. Food energy – methods of analysis and conversion factors.',
      'Lestienne et al. Effect of soaking and germination on mineral bioavailability. Journal of Food Science.'
    ]
  }
};

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-brand-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-stone-50/50 transition-colors rounded-lg group"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-brand-light pr-4 group-hover:text-brand-accent transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-brand-muted flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-brand-accent' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-brand-muted px-1 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC<FAQProps> = ({ language }) => {
  const isGerman = language === 'de';
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (sectionId: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] === index ? null : index
    }));
  };

  const sourcesData = SOURCES_TEXT[language];

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-br from-brand-accent/5 to-transparent rounded-2xl border border-brand-accent/20 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm hidden sm:block">
            <BookOpen className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-3">
              {isGerman ? 'Einleitung' : 'Introduction'}
            </h2>
            <p className="text-brand-muted leading-relaxed">
              {INTRO_TEXT[language]}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      {FAQ_SECTIONS.map((section) => (
        <div
          key={section.id}
          className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden"
        >
          {/* Section Header */}
          <div className="bg-stone-50/80 px-6 py-4 border-b border-brand-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-input rounded-lg text-brand-accent">
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-brand-light">
                  {isGerman ? section.title : section.titleEn}
                </h2>
              </div>
              {section.link && (
                <a
                  href={section.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  <span className="hidden sm:inline">
                    {isGerman ? 'Mehr erfahren' : 'Learn more'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="px-6 py-2">
            {section.items.map((item, index) => (
              <AccordionItem
                key={index}
                question={isGerman ? item.question : item.questionEn}
                answer={isGerman ? item.answer : item.answerEn}
                isOpen={openItems[section.id] === index}
                onToggle={() => toggleItem(section.id, index)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Sources Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
        <h3 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-accent" />
          {sourcesData.title}
        </h3>
        <ul className="space-y-2">
          {sourcesData.sources.map((source, index) => (
            <li key={index} className="text-sm text-brand-muted pl-4 border-l-2 border-brand-accent/30">
              {source}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FAQ;
