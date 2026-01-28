import React from 'react';
import { Language } from '../types';
import { BookOpen, FlaskConical, Info } from 'lucide-react';

interface SourcesProps {
  language: Language;
}

interface SourceItem {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  calculation?: string;
  calculationEn?: string;
  sources: string[];
}

const SOURCES_DATA: SourceItem[] = [
  {
    id: 1,
    title: 'Energie (kcal)',
    titleEn: 'Energy (kcal)',
    description: 'Gibt den physiologischen Brennwert an, berechnet aus den Makronährstoffen nach dem Atwater-System.',
    descriptionEn: 'Indicates the physiological calorific value, calculated from macronutrients according to the Atwater system.',
    calculation: 'Protein × 4 kcal + Kohlenhydrate × 4 kcal + Fett × 9 kcal.',
    calculationEn: 'Protein × 4 kcal + Carbohydrates × 4 kcal + Fat × 9 kcal.',
    sources: [
      'FAO/WHO: Food energy – methods of analysis and conversion factors',
      'USDA FoodData Central, Standard Reference'
    ]
  },
  {
    id: 2,
    title: 'Protein (g)',
    titleEn: 'Protein (g)',
    description: 'Gesamtgehalt an pflanzlichem Eiweiß. Enthält alle Aminosäuren, mit artspezifischer Zusammensetzung. Relevant für Muskelerhalt, Enzyme, Hormone und Regeneration.',
    descriptionEn: 'Total plant protein content. Contains all amino acids with species-specific composition. Relevant for muscle maintenance, enzymes, hormones, and regeneration.',
    sources: [
      'USDA FoodData Central',
      'Souci–Fachmann–Kraut: Die Zusammensetzung der Lebensmittel'
    ]
  },
  {
    id: 3,
    title: 'Kohlenhydrate (g)',
    titleEn: 'Carbohydrates (g)',
    description: 'Summe aus Stärke, Zucker und sonstigen verfügbaren Kohlenhydraten. Zucker wird separat ausgewiesen, sofern analytisch verfügbar.',
    descriptionEn: 'Sum of starch, sugar, and other available carbohydrates. Sugar is reported separately when analytically available.',
    sources: [
      'European Food Information Resource (EuroFIR)',
      'Souci–Fachmann–Kraut'
    ]
  },
  {
    id: 4,
    title: 'Fett (g)',
    titleEn: 'Fat (g)',
    description: 'Gesamtfettgehalt inklusive gesättigter, einfach ungesättigter und mehrfach ungesättigter Fettsäuren. Grundlage für Hormonproduktion, Zellmembranen und Energieversorgung.',
    descriptionEn: 'Total fat content including saturated, monounsaturated, and polyunsaturated fatty acids. Basis for hormone production, cell membranes, and energy supply.',
    sources: [
      'USDA FoodData Central',
      'FAO: Fats and fatty acids in human nutrition'
    ]
  },
  {
    id: 5,
    title: 'Gesättigte Fettsäuren (g)',
    titleEn: 'Saturated Fatty Acids (g)',
    description: 'Teilmenge des Gesamtfetts. Wird separat ausgewiesen, da ernährungsphysiologisch relevant.',
    descriptionEn: 'Subset of total fat. Reported separately due to nutritional relevance.',
    sources: [
      'EFSA Journal: Dietary reference values for fats'
    ]
  },
  {
    id: 6,
    title: 'Magnesium (mg / % RDA)',
    titleEn: 'Magnesium (mg / % RDA)',
    description: 'Essentieller Mineralstoff für Muskelfunktion, Nervenleitung und Energiestoffwechsel. %RDA bezieht sich auf die empfohlene Tageszufuhr für Erwachsene laut EU-Referenzwerten.',
    descriptionEn: 'Essential mineral for muscle function, nerve conduction, and energy metabolism. %RDA refers to the recommended daily intake for adults according to EU reference values.',
    sources: [
      'EFSA NDA Panel (2015): Dietary Reference Values for magnesium',
      'Souci–Fachmann–Kraut'
    ]
  },
  {
    id: 7,
    title: 'Kalium (mg / % RDA)',
    titleEn: 'Potassium (mg / % RDA)',
    description: 'Zentral für Elektrolythaushalt, Blutdruckregulation und Muskelkontraktion.',
    descriptionEn: 'Central for electrolyte balance, blood pressure regulation, and muscle contraction.',
    sources: [
      'EFSA NDA Panel (2016): Dietary Reference Values for potassium',
      'USDA FoodData Central'
    ]
  },
  {
    id: 8,
    title: 'Calcium (mg / % RDA)',
    titleEn: 'Calcium (mg / % RDA)',
    description: 'Baustoff für Knochen, Zähne und Signalübertragung in Zellen.',
    descriptionEn: 'Building material for bones, teeth, and cell signaling.',
    sources: [
      'EFSA NDA Panel (2015): Dietary Reference Values for calcium'
    ]
  },
  {
    id: 9,
    title: 'Eisen (mg / % RDA)',
    titleEn: 'Iron (mg / % RDA)',
    description: 'Pflanzliches Nicht-Häm-Eisen, wichtig für Sauerstofftransport und Energiestoffwechsel.',
    descriptionEn: 'Plant-based non-heme iron, important for oxygen transport and energy metabolism.',
    sources: [
      'EFSA NDA Panel (2015): Dietary Reference Values for iron',
      'Souci–Fachmann–Kraut'
    ]
  },
  {
    id: 10,
    title: 'Zink (mg / % RDA)',
    titleEn: 'Zinc (mg / % RDA)',
    description: 'Wichtig für Immunsystem, Hormonfunktion und Enzymaktivität.',
    descriptionEn: 'Important for immune system, hormone function, and enzyme activity.',
    sources: [
      'EFSA NDA Panel (2014): Dietary Reference Values for zinc'
    ]
  },
  {
    id: 11,
    title: 'Selen (µg / % RDA)',
    titleEn: 'Selenium (µg / % RDA)',
    description: 'Spurenelement mit antioxidativer Funktion, relevant für Schilddrüsenenzyme.',
    descriptionEn: 'Trace element with antioxidant function, relevant for thyroid enzymes.',
    sources: [
      'EFSA NDA Panel (2014): Dietary Reference Values for selenium'
    ]
  },
  {
    id: 12,
    title: 'Vitamin B1 (Thiamin, mg / % RDA)',
    titleEn: 'Vitamin B1 (Thiamin, mg / % RDA)',
    description: 'Essentiell für Nervenfunktion und Kohlenhydratstoffwechsel.',
    descriptionEn: 'Essential for nerve function and carbohydrate metabolism.',
    sources: [
      'EFSA NDA Panel (2017): Dietary Reference Values for thiamin',
      'USDA FoodData Central'
    ]
  },
  {
    id: 13,
    title: 'Vitamin B6 (mg / % RDA)',
    titleEn: 'Vitamin B6 (mg / % RDA)',
    description: 'Beteiligt an Aminosäurestoffwechsel, Nervensystem und Immunfunktion.',
    descriptionEn: 'Involved in amino acid metabolism, nervous system, and immune function.',
    sources: [
      'EFSA NDA Panel (2016): Dietary Reference Values for vitamin B6'
    ]
  },
  {
    id: 14,
    title: 'Vitamin E (α-Tocopherol, mg / % RDA)',
    titleEn: 'Vitamin E (α-Tocopherol, mg / % RDA)',
    description: 'Fettlösliches Antioxidans, schützt Zellmembranen vor oxidativem Stress.',
    descriptionEn: 'Fat-soluble antioxidant, protects cell membranes from oxidative stress.',
    sources: [
      'EFSA NDA Panel (2015): Dietary Reference Values for vitamin E'
    ]
  },
  {
    id: 15,
    title: 'Omega-3-Fettsäuren (ALA, g)',
    titleEn: 'Omega-3 Fatty Acids (ALA, g)',
    description: 'Alpha-Linolensäure, essentielle Fettsäure mit Bedeutung für Herz-Kreislauf- und Entzündungsregulation.',
    descriptionEn: 'Alpha-linolenic acid, essential fatty acid important for cardiovascular and inflammation regulation.',
    sources: [
      'EFSA NDA Panel (2010): Scientific Opinion on dietary reference values for fats',
      'USDA FoodData Central'
    ]
  },
  {
    id: 16,
    title: 'Darm-Benefit-Index',
    titleEn: 'Gut Benefit Index',
    description: 'Nicht standardisierter, zusammengesetzter Orientierungswert (Skala 0–10). Berücksichtigt: Ballaststoffgehalt, Fettzusammensetzung, antinutritive Reduktion durch Aktivierung (Phytinsäure-Abbau), sensorische Bekömmlichkeit. Dieser Wert ist kein medizinischer Parameter, sondern ein funktioneller Vergleichswert innerhalb des Rechners.',
    descriptionEn: 'Non-standardized, composite orientation value (scale 0–10). Considers: fiber content, fat composition, anti-nutritive reduction through activation (phytic acid breakdown), sensory digestibility. This value is not a medical parameter but a functional comparison value within the calculator.',
    sources: [
      'Preedy & Watson (2020): Nuts and Seeds in Health and Disease Prevention',
      'Lönnerdal et al., Food Phytates and Mineral Bioavailability, Nutrition Reviews'
    ]
  },
  {
    id: 17,
    title: 'Gesundheitsfokus-Aussagen',
    titleEn: 'Health Focus Statements',
    description: 'Diese Aussagen (z. B. „ersetzt Magnesium-Supplemente") beziehen sich darauf, dass eine übliche Portionsgröße (20–30 g) der jeweiligen Nuss einen signifikanten Anteil (≥15–30 %) der empfohlenen Tageszufuhr liefert. Sie stellen keine Heil- oder Therapieaussagen dar, sondern eine ernährungsphysiologische Einordnung.',
    descriptionEn: 'These statements (e.g., "replaces magnesium supplements") refer to the fact that a typical portion size (20–30 g) of the respective nut provides a significant proportion (≥15–30%) of the recommended daily intake. They do not constitute healing or therapeutic claims but a nutritional classification.',
    sources: [
      'EFSA Health Claims Framework',
      'EU-Verordnung (EG) Nr. 1924/2006'
    ]
  },
  {
    id: 18,
    title: 'Aktivierung & Bioverfügbarkeit',
    titleEn: 'Activation & Bioavailability',
    description: 'Die dargestellten Werte basieren auf Rohware. Die Aktivierung (Einweichen + schonende Trocknung) verändert nicht den absoluten Mineralstoffgehalt, kann jedoch die Verfügbarkeit durch Reduktion von Phytinsäure verbessern.',
    descriptionEn: 'The displayed values are based on raw goods. Activation (soaking + gentle drying) does not change the absolute mineral content but can improve availability by reducing phytic acid.',
    sources: [
      'Lestienne et al., Effect of soaking and germination on mineral bioavailability, Journal of Food Science',
      'Preedy & Watson (2020)'
    ]
  }
];

const SUMMARY_TEXT = {
  de: {
    title: 'Zusammenfassung',
    content: [
      'Alle im Nutri-Rechner dargestellten Werte basieren auf:',
      '• anerkannten Lebensmitteldatenbanken',
      '• europäisch gültigen Referenzwerten',
      '• wissenschaftlicher Fachliteratur',
      '• internen, transparent definierten Rechenmodellen'
    ],
    disclaimer: 'Der Rechner dient der ernährungsphysiologischen Orientierung, nicht der medizinischen Diagnose oder Therapie.'
  },
  en: {
    title: 'Summary',
    content: [
      'All values displayed in the Nutri Calculator are based on:',
      '• recognized food databases',
      '• European reference values',
      '• scientific literature',
      '• internally defined, transparent calculation models'
    ],
    disclaimer: 'The calculator serves as nutritional orientation, not medical diagnosis or therapy.'
  }
};

const Sources: React.FC<SourcesProps> = ({ language }) => {
  const isGerman = language === 'de';
  const summary = SUMMARY_TEXT[language];

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-input rounded-xl">
            <BookOpen className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-2">
              {isGerman ? 'Quellenverweise' : 'Source References'}
            </h2>
            <p className="text-brand-muted">
              {isGerman
                ? 'Hier findest du alle wissenschaftlichen Quellen und Referenzen, die den Berechnungen und Nährwertangaben im Planer und Rechner zugrunde liegen.'
                : 'Here you will find all scientific sources and references underlying the calculations and nutritional information in the planner and calculator.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="grid gap-4">
        {SOURCES_DATA.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-brand-border p-6 hover:border-brand-accent/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-input rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-brand-accent">{item.id}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-brand-light mb-2">
                  {isGerman ? item.title : item.titleEn}
                </h3>
                <p className="text-brand-muted text-sm mb-3">
                  {isGerman ? item.description : item.descriptionEn}
                </p>

                {item.calculation && (
                  <div className="bg-brand-input rounded-lg p-3 mb-3">
                    <p className="text-sm font-mono text-brand-light">
                      <span className="text-brand-muted">{isGerman ? 'Berechnung: ' : 'Calculation: '}</span>
                      {isGerman ? item.calculation : item.calculationEn}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <FlaskConical className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wide mb-1">
                      {isGerman ? 'Quellen' : 'Sources'}
                    </p>
                    <ul className="space-y-1">
                      {item.sources.map((source, idx) => (
                        <li key={idx} className="text-sm text-brand-light">
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 rounded-2xl border border-brand-accent/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Info className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-3">{summary.title}</h2>
            <div className="space-y-2 mb-4">
              {summary.content.map((line, idx) => (
                <p key={idx} className={`text-brand-muted ${idx === 0 ? 'font-medium' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
            <p className="text-sm text-brand-accent font-medium italic">
              {summary.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sources;
