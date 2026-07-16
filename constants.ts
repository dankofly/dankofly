
import { NutProfile, Nutrients, Language } from './types';

// Recommended Daily Allowances (RDA) basierend auf DGE/Referenzwerten
export const RDA: Nutrients = {
  energy: 2000, 
  protein: 50, 
  carbs: 260, 
  sugar: 50, 
  fat: 70, 
  saturatedFat: 20, 
  magnesium: 375, // Standard EU NRV
  calcium: 1000, 
  iron: 14, 
  zinc: 10, 
  potassium: 4000, 
  vitaminE: 12, 
  b1: 1.1, 
  b6: 1.4, 
  selenium: 70, // µg
  omega3: 2.0, // g (ALA)
};

const NUT_DATA_BASE = [
    {
        id: 'cashew',
        imageColor: 'bg-orange-100',
        gutHealthScore: 7.5,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-cashew-nusse',
        nutrientsPer100g: {
            energy: 616, protein: 18.0, carbs: 26.3, sugar: 4.8, fat: 47.3, saturatedFat: 8.1,
            magnesium: 270, calcium: 37, iron: 2.8, zinc: 2.08, potassium: 660, vitaminE: 0.9, b1: 0.63, b6: 0.42, selenium: 19, omega3: 0.1,
        }
    },
    {
        id: 'almond',
        imageColor: 'bg-amber-200',
        gutHealthScore: 9.5,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-mandeln',
        nutrientsPer100g: {
            energy: 598, protein: 24.0, carbs: 21.0, sugar: 4.8, fat: 54.7, saturatedFat: 3.7,
            magnesium: 218, calcium: 85, iron: 3.11, zinc: 3.1, potassium: 676, vitaminE: 25.0, b1: 0.22, b6: 0.1, selenium: 4, omega3: 0,
        }
    },
    {
        id: 'hazelnut',
        imageColor: 'bg-amber-700',
        gutHealthScore: 8.5,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-haselnusse',
        nutrientsPer100g: {
            energy: 643, protein: 14.8, carbs: 5.1, sugar: 1.2, fat: 61.4, saturatedFat: 2.7,
            magnesium: 163, calcium: 114, iron: 3.43, zinc: 2.5, potassium: 745, vitaminE: 24.5, b1: 0.46, b6: 0.66, selenium: 5, omega3: 0.1,
        }
    },
    {
        id: 'walnut',
        imageColor: 'bg-stone-600',
        gutHealthScore: 8.0,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-walnusse',
        nutrientsPer100g: {
            energy: 694, protein: 16.0, carbs: 13.7, sugar: 3.0, fat: 69.2, saturatedFat: 4.4,
            magnesium: 140, calcium: 98, iron: 2.78, zinc: 2.64, potassium: 444, vitaminE: 25.5, b1: 0.34, b6: 0.60, selenium: 4.9, omega3: 10.2,
        }
    },
    {
        id: 'pistachio',
        imageColor: 'bg-green-200',
        gutHealthScore: 9.0,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-pistazien',
        nutrientsPer100g: {
            energy: 607, protein: 21.0, carbs: 15.1, sugar: 5.9, fat: 50.6, saturatedFat: 5.8,
            magnesium: 109, calcium: 105, iron: 4.0, zinc: 2.3, potassium: 1010, vitaminE: 2.8, b1: 0.87, b6: 1.1, selenium: 10, omega3: 0.3,
        }
    },
    {
        id: 'brazil',
        imageColor: 'bg-stone-300',
        gutHealthScore: 6.5,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-paranusse',
        nutrientsPer100g: {
            energy: 689, protein: 14.4, carbs: 12.0, sugar: 2.4, fat: 68.5, saturatedFat: 14.8,
            magnesium: 160, calcium: 130, iron: 3.4, zinc: 4.0, potassium: 645, vitaminE: 7.1, b1: 1.0, b6: 0.11, selenium: 1917, omega3: 0.05,
        }
    },
    {
        id: 'pecan',
        imageColor: 'bg-amber-900',
        gutHealthScore: 7.5,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-pekannusse',
        nutrientsPer100g: {
            energy: 710, protein: 9.8, carbs: 13.5, sugar: 4.3, fat: 71.9, saturatedFat: 4.5,
            magnesium: 140, calcium: 55, iron: 2.4, zinc: 5.3, potassium: 500, vitaminE: 1.4, b1: 0.86, b6: 0.2, selenium: 3, omega3: 1.0,
        }
    },
    {
        id: 'pumpkin',
        imageColor: 'bg-emerald-800',
        gutHealthScore: 9.8,
        shopUrl: 'https://www.2die4livefoods.com/de-de/products/aktivierte-bio-kurbiskerne',
        nutrientsPer100g: {
            energy: 562, protein: 30.0, carbs: 10.7, sugar: 1.6, fat: 48.0, saturatedFat: 10.0,
            magnesium: 592, calcium: 46, iron: 8.8, zinc: 7.8, potassium: 809, vitaminE: 2.2, b1: 0.3, b6: 0.14, selenium: 9, omega3: 0.1,
        }
    }
];

const NUT_TEXT = {
    de: {
        cashew: { name: 'Cashewkerne', description: 'Nerven & Energiestoffwechsel (B1, B6, Mg)', benefits: 'Ersetzt Magnesium-Supplemente, unterstützt Nervenfunktion' },
        almond: { name: 'Mandeln', description: 'Zellschutz & Vitamin-E Champion', benefits: 'Ersetzt Vitamin E Supplemente, starkes Antioxidans' },
        hazelnut: { name: 'Haselnüsse', description: 'Haut & Immunsystem (E, B6, Folat)', benefits: 'Ersetzt Vitamin E und Folsäure-Supplemente' },
        walnut: { name: 'Walnüsse', description: 'Omega-3 (ALA) & Biotin Booster', benefits: 'Ersetzt Omega-3 Kapseln & Biotin-Tabletten' },
        pistachio: { name: 'Pistazien', description: 'Kalium & Blutbildung (K, Fe, B6)', benefits: 'Ersetzt Kalium- und Vitamin B6-Supplemente' },
        brazil: { name: 'Paranüsse', description: 'Der natürliche Selen-Ersatz', benefits: 'Ersetzt Selen-Tabletten vollständig (1-2 Nüsse/Tag)' },
        pecan: { name: 'Pekannüsse', description: 'Zink & Energiestoffwechsel (Zn, B1)', benefits: 'Ersetzt Zink-Supplemente, gut für Haut & Immunsystem' },
        pumpkin: { name: 'Kürbiskerne', description: 'Protein, Magnesium & Eisen-Kraftwerk', benefits: 'Ersetzt Magnesium-, Eisen- und Zink-Supplemente' }
    },
    en: {
        cashew: { name: 'Cashews', description: 'Nerve & Energy metabolism (B1, B6, Mg)', benefits: 'Replaces Magnesium supplements' },
        almond: { name: 'Almonds', description: 'Cell protection & Vitamin-E Champion', benefits: 'Replaces Vitamin E supplements' },
        hazelnut: { name: 'Hazelnuts', description: 'Skin & Immune support (E, B6, Folate)', benefits: 'Replaces Vitamin E & Folate supplements' },
        walnut: { name: 'Walnuts', description: 'Omega-3 (ALA) & Biotin Booster', benefits: 'Replaces Omega-3 capsules & Biotin tablets' },
        pistachio: { name: 'Pistachios', description: 'Potassium & Blood formation', benefits: 'Replaces Potassium & Vitamin B6 supplements' },
        brazil: { name: 'Brazil Nuts', description: 'The natural Selenium replacement', benefits: 'Replaces Selenium tablets completely' },
        pecan: { name: 'Pecans', description: 'Zinc & Energy metabolism', benefits: 'Replaces Zinc supplements' },
        pumpkin: { name: 'Pumpkin Seeds', description: 'Protein, Magnesium & Iron Powerhouse', benefits: 'Replaces Magnesium & Iron supplements' }
    }
};

export const getNutData = (lang: Language): NutProfile[] => {
    return NUT_DATA_BASE.map(nut => ({
        ...nut,
        ...NUT_TEXT[lang][nut.id as keyof typeof NUT_TEXT.de]
    }));
};

// Shopify-Varianten-IDs pro Nuss (100g/250g) für Cart-Permalinks.
// Quelle: https://www.2die4livefoods.com/products/<handle>.js (Stand 2026-07-15).
// Achtung: Werden Produkte im Shop neu angelegt, ändern sich die IDs;
// dann liefert der Warenkorb-Link einen Fehler und die Map muss neu befüllt werden.
export const SHOP_VARIANTS: Record<string, { variant100g?: string; variant250g?: string }> = {
    cashew:    { variant100g: '44739868590344', variant250g: '44739868623112' },
    almond:    { variant100g: '41476276191452', variant250g: '41476276224220' },
    hazelnut:  { variant100g: '41476274946268', variant250g: '41476274979036' },
    walnut:    { variant100g: '41476279959772', variant250g: '41476279992540' },
    pistachio: { variant100g: '41476279501020', variant250g: '41476279533788' },
    brazil:    { variant100g: '41476276420828', variant250g: '41476276453596' },
    pecan:     { variant100g: '41476276551900', variant250g: '41476276584668' },
    pumpkin:   { variant100g: '41475804463324', variant250g: '41475804496092' },
};

export const NUT_DATA = getNutData('de');

export const NUTRIENT_LABELS = {
    de: {
        energy: 'Energie (kcal)',
        saturatedFat: 'Ges. Fettsäuren',
        sugar: 'Zucker',
        selenium: 'Selen', magnesium: 'Magnesium', omega3: 'Omega-3', protein: 'Protein', fat: 'Fett', carbs: 'Kohlenhydrate', calcium: 'Calcium', iron: 'Eisen', zinc: 'Zink', potassium: 'Kalium', vitaminE: 'Vitamin E', b1: 'Vitamin B1', b6: 'Vitamin B6'
    },
    en: {
        energy: 'Energy (kcal)',
        saturatedFat: 'Sat. Fats',
        sugar: 'Sugar',
        selenium: 'Selenium', magnesium: 'Magnesium', omega3: 'Omega-3', protein: 'Protein', fat: 'Fat', carbs: 'Carbohydrates', calcium: 'Calcium', iron: 'Iron', zinc: 'Zinc', potassium: 'Potassium', vitaminE: 'Vitamin E', b1: 'Vitamin B1', b6: 'Vitamin B6'
    }
};

export const APP_CONTENT = {
  de: {
    general: {
      plannerTab: "Nuss Nutri Planer",
      libraryTab: "Nuss Nährstoffe Rechner",
      faqTab: "FAQ's",
      sourcesTab: "Quellen",
      plannerHeader: "Dein natürlicher Nährstoff-Plan",
      plannerSubHeader: "Dein 7-Tage-Plan mit aktivierten Bio-Nüssen. Natürliche Nährstoffe statt synthetischer Präparate, fertig in 30 Sekunden.",
      libraryHeader: "Was steckt in den aktivierten Bio Nüssen von 2DiE4?",
      librarySubHeader: "Erfahre alles über die Nährstoffe und gesundheitlichen Vorteile unserer aktivierten Nüsse",
      faqHeader: "Häufig gestellte Fragen",
      faqSubHeader: "Alles Wissenswerte zum Nutri-Planer, Nuss-Rechner und aktivierten Bio-Nüssen",
      sourcesHeader: "Wissenschaftliche Quellen",
      sourcesSubHeader: "Quellenverweise für alle Nährwertdaten und Berechnungen im Planer und Rechner",
      footerDisclaimer: "© 2026 2DiE4 Live Foods. Nährwerte können natürlichen Schwankungen unterliegen.",
      footerNote: "Diese App dient zur Information und ersetzt keine ärztliche Beratung - Alle Angaben ohne Gewähr.",
      metaTitle: "Nutriplaner by 2DiE4 Live Foods - Dein Nuss-Wochenplan",
      metaDescription: "Dein 7-Tage-Plan mit aktivierten Bio-Nüssen: personalisierte Tagesmischungen, Nährwert-Analyse und Einkaufsliste. Kostenlos, fertig in 30 Sekunden."
    },
    nutLibrary: {
      selectionTitle: "Auswahl",
      shopLinkText: "Im 2DiE4 Nuss-Shop ansehen",
      calcTitle: "Menge berechnen",
      calcSubtitle: "Schiebe den Regler",
      powerValuesTitle: "Top Power-Werte & Makros",
      gutHealthTitle: "Darm-Benefit-Index",
      healthFocusTitle: "Gesundheitlicher Fokus",
      whyActivated: {
        title: "Warum aktiviert?",
        intro: "Alle rohen Nüsse enthalten natürliche Abwehrstoffe. Diese sogenannten Antinährstoffe – wie Phytinsäure oder Lektine – schützen die Nuss in der Natur, behindern aber deine Verdauung. Sie blockieren Mineralien wie Eisen, Zink oder Magnesium und machen sie für deinen Körper schwerer verfügbar.",
        processBox: "Unser zweistufiger Fermentationsprozess verändert das.",
        processDescription: "Beim Wässern in Quellwasser mit naturbelassenem Meersalz wird die Keimung aktiviert. Die Nuss beginnt „aufzuwachen“. Während der schonenden Trocknung bei niedriger Temperatur über Tage wird dieser Prozess gestoppt, aber nicht zerstört.",
        resultTitle: "Das Ergebnis:",
        benefitsList: [
          'Leichter verdaulich', 
          'Mehr Bioverfügbarkeit', 
          'Besser für deinen Darm',
          'Langanhaltende Energie',
          'Natürlicher Umami-Geschmack',
          'Perfekter Crunch'
        ],
        quote: "\"Unsere aktivierten Bio-Nüsse tun dir einfach gut. Du schmeckst und spürst den Unterschied.\""
      },
      gutHealthLevels: {
        excellent: 'Ein Superfood für dein Mikrobiom. Maximaler Ballaststoffgehalt & präbiotische Power.',
        veryGood: 'Hervorragend verträglich. Unterstützt aktiv eine gesunde Darmflora.',
        good: 'Sehr gut verträglich. Durch die Aktivierung besonders schonend zur Verdauung.',
        standard: 'Gut verträglich. Aktivierung reduziert das Blähbauch-Risiko.'
      },
      chartTitle: "Detailliertes Nährstoffprofil",
    },
    planner: {
      title: "Nuss Nutri Planer",
      subtitle: "Vier Angaben, und die KI baut deinen Wochenplan. Mit eigenen Profilen für Kinder.",
      form: {
        lifeStage: "Lebensphase",
        goal: "Dein Ziel",
        gender: "Geschlecht",
        age: "Alter",
        weight: "Gewicht (kg)",
        duration: "Vorrat für",
        buttonLoading: "Analysiere Nährstoffbedarf...",
        buttonDefault: "Optimierten Plan generieren",
        options: {
            adult: 'Erwachsener',
            child: 'Kind',
            female: 'Weiblich',
            male: 'Männlich',
            diverse: 'Divers',
            goals: {
                balance: "Ausgewogene Ernährung",
                energy: "Mehr Energie & Fokus",
                muscle: "Muskelaufbau & Regeneration",
                immunity: "Starkes Immunsystem",
                keto: "Keto-freundlich (Low Carb / High Fat)",
                diet: "Diät & Abnehmen (kalorienarm)",
                growth_focus: "Wachstum & Knochen",
                concentration: "Konzentration & Schule",
            }
        }
      },
      aboBox: {
          recommendationTitle: "Empfohlen: Starter-Paket",
          bundleName: "2DiE4 ALL-IN-ONE SET",
          bundleDesc: "Das Set enthält alle unserer Bestseller und die restlichen Nüsse im Nuss-Mix.",
          shippingBonus: "Sofort-Bonus: Dieses Set kommt versandkostenfrei zu dir (DE/AT)!",
          priceOnly: "€ 49,90",
          priceOld: "€ 64,30",
          smartSaveTitle: "Meistgewählte Option",
          aboTitle: "Mach es zur Routine",
          aboDesc: "Kein Nachbestellen nötig. Deine Gesundheit kommt automatisch zu dir.",
          buttonText: "Zum Set",
          aboButtonText: "Jetzt 15% Rabatt sichern",
          cancelAnytime: "Jederzeit pausierbar & kündbar",
          oneTime: "Einmalige Lieferung"
      },
      results: {
          title: "Natürliche Nährstoff-Strategie",
          childSuffix: "für Kinder",
          createdFor: "Erstellt für",
          weeks: "Wochen Programm",
          goal: "Tipp",
          shoppingList: "Dein Einkaufszettel & Empfehlung",
          weekSupply: "Wochen-Bedarf",
          packRec: "Empfehlung",
          summaryTitle: "Optimierungs-Zusammenfassung",
          disclaimer: "Hinweis: KI-generierter Vorschlag basierend auf Durchschnittswerten. Keine medizinische Beratung.",
          addAllToCart: "Alles in den Warenkorb",
          cartMissingNote: "Nicht im Warenkorb-Link enthalten, bitte über die Einzel-Buttons bestellen",
          showMore: "Mehr anzeigen",
          showLess: "Weniger anzeigen",
          years: "Jahre"
      },
      blogArticles: {
          sectionTitle: "Passende Artikel aus unserem Blog",
          readMore: "Weiterlesen",
      },
      share: {
          teaser: "Mein persönlicher Nuss-Wochenplan von Nutriplaner by 2DiE4 Live Foods",
          linkLabel: "Plan ansehen",
      },
      sharedPlan: {
          notFound: "Dieser geteilte Plan wurde nicht gefunden. Erstell dir hier in 30 Sekunden deinen eigenen.",
      },
      emailCapture: {
          title: "Plan per E-Mail + Rabattcode sichern",
          subtitle: "Wir schicken dir den Link zu deinem Plan und einen Rabattcode für deine erste Bestellung im 2DiE4-Shop.",
          placeholder: "deine@email.com",
          button: "Plan + Code senden",
          buttonLoading: "Wird gesendet...",
          preparingLink: "Dein Plan-Link wird noch vorbereitet, einen Moment...",
          successTitle: "Fast geschafft!",
          successBody: "Bitte bestätige kurz die E-Mail in deinem Postfach. Danach bekommst du deinen Plan-Link und den Rabattcode zugeschickt.",
          errorInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
          errorGeneric: "Das hat gerade nicht geklappt. Bitte versuch es in einem Moment nochmal.",
          consentHint: "Mit dem Absenden meldest du dich für den 2DiE4-Newsletter an (Bestätigung per Double-Opt-in, jederzeit abmeldbar). Deine E-Mail wird nur dafür verwendet und nicht in dieser App gespeichert. Details:",
          privacyLinkText: "Datenschutzerklärung",
      }
    }
  },
  en: {
    general: {
      plannerTab: "Nut Nutri Planner",
      libraryTab: "Nut Nutrient Calculator",
      faqTab: "FAQ's",
      sourcesTab: "Sources",
      plannerHeader: "Your Natural Nutrient Plan",
      plannerSubHeader: "Your 7-day plan with activated organic nuts. Natural nutrients instead of synthetic supplements, ready in 30 seconds.",
      libraryHeader: "What's inside 2DiE4 Activated Organic Nuts?",
      librarySubHeader: "Learn all about the nutrients and health benefits of our activated nuts.",
      faqHeader: "Frequently Asked Questions",
      faqSubHeader: "Everything you need to know about the Nutri Planner, Nut Calculator and activated organic nuts",
      sourcesHeader: "Scientific Sources",
      sourcesSubHeader: "Source references for all nutritional data and calculations in the planner and calculator",
      footerDisclaimer: "© 2026 2DiE4 Live Foods. Nutritional values may vary naturally.",
      footerNote: "This app is for information purposes only and does not replace medical advice.",
      metaTitle: "Nutriplaner by 2DiE4 Live Foods - Your Nut Week Plan",
      metaDescription: "Your 7-day plan with activated organic nuts: personalised daily mixes, nutrient analysis and shopping list. Free, ready in 30 seconds."
    },
    nutLibrary: {
      selectionTitle: "Selection",
      shopLinkText: "View in 2DiE4 Shop",
      calcTitle: "Calculate Amount",
      calcSubtitle: "Slide the control",
      powerValuesTitle: "Top Power Values & Macros",
      gutHealthTitle: "Gut Health Index",
      healthFocusTitle: "Health Focus",
      whyActivated: {
        title: "Why Activated?",
        intro: "All raw nuts contain natural defense mechanisms. These so-called anti-nutrients – such as phytic acid or lectins – protect the nut in nature but hinder your digestion. They block minerals like iron, zinc, or magnesium, making them less available to your body.",
        processBox: "Our two-stage fermentation process changes that.",
        processDescription: "Soaking in spring water with natural sea salt activates germination. The nut begins to 'wake up'. During gentle drying at low temperatures over several days, this process is halted but not destroyed.",
        resultTitle: "The Result:",
        benefitsList: [
          'Easier to digest', 
          'Higher bioavailability', 
          'Better for your gut',
          'Long-lasting energy',
          'Natural Umami flavour',
          'Perfect Crunch'
        ],
        quote: "\"Our activated organic nuts simply do you good. You can taste and feel the difference.\""
      },
      gutHealthLevels: {
        excellent: 'A superfood for your microbiome. Maximum fibre content & prebiotic power.',
        veryGood: 'Excellently tolerated. Actively supports a healthy gut flora.',
        good: 'Very well tolerated. Particularly gentle on digestion due to activation.',
        standard: 'Well tolerated. Activation reduces the risk of bloating.'
      },
      chartTitle: "Detailed Nutrient Profile",
    },
    planner: {
      title: "Nut Nutri Planner",
      subtitle: "Four answers and the AI builds your weekly plan. With dedicated profiles for kids.",
      form: {
        lifeStage: "Life Stage",
        goal: "Your Goal",
        gender: "Gender",
        age: "Age",
        weight: "Weight (kg)",
        duration: "Supply for",
        buttonLoading: "Analysing nutrient needs...",
        buttonDefault: "Generate Optimised Plan",
        options: {
            adult: 'Adult',
            child: 'Child',
            female: 'Female',
            male: 'Male',
            diverse: 'Diverse',
            goals: {
                balance: "Balanced Diet",
                energy: "More Energy & Focus",
                muscle: "Muscle Building & Recovery",
                immunity: "Strong Immune System",
                keto: "Keto-friendly (Low Carb / High Fat)",
                diet: "Diet & Weight Loss (low calorie)",
                growth_focus: "Growth & Bones",
                concentration: "Concentration & School",
            }
        }
      },
      aboBox: {
          recommendationTitle: "Recommended: Starter-Bundle",
          bundleName: "2DiE4 ALL-IN-ONE SET",
          bundleDesc: "The set contains all our bestsellers and the remaining nuts in the nut mix.",
          shippingBonus: "Instant Bonus: Free shipping for this set (DE/AT)!",
          priceOnly: "€ 49.90",
          priceOld: "€ 64.30",
          smartSaveTitle: "Most Popular Choice",
          aboTitle: "Make it a routine",
          aboDesc: "No re-ordering needed. Your health delivered automatically.",
          buttonText: "Go to Set",
          aboButtonText: "Secure 15% Discount Now",
          cancelAnytime: "Pause or cancel anytime",
          oneTime: "One-time delivery"
      },
      results: {
          title: "Natural Nutrient Strategy",
          childSuffix: "for Children",
          createdFor: "Created for",
          weeks: "Week Programme",
          goal: "Tip",
          shoppingList: "Your Shopping List & Recommendation",
          weekSupply: "-Week-Supply",
          packRec: "Recommendation",
          summaryTitle: "Optimisation Summary",
          disclaimer: "Note: AI-generated suggestion based on average values. No medical advice.",
          addAllToCart: "Add all to cart",
          cartMissingNote: "Not included in the cart link, please order via the individual buttons",
          showMore: "Show more",
          showLess: "Show less",
          years: "years"
      },
      blogArticles: {
          sectionTitle: "Related Articles from Our Blog",
          readMore: "Read more",
      },
      share: {
          teaser: "My personal nut week plan from Nutriplaner by 2DiE4 Live Foods",
          linkLabel: "View plan",
      },
      sharedPlan: {
          notFound: "This shared plan could not be found. Create your own here in 30 seconds.",
      },
      emailCapture: {
          title: "Get your plan by email + discount code",
          subtitle: "We'll send you the link to your plan plus a discount code for your first order in the 2DiE4 shop.",
          placeholder: "your@email.com",
          button: "Send plan + code",
          buttonLoading: "Sending...",
          preparingLink: "Your plan link is being prepared, one moment...",
          successTitle: "Almost there!",
          successBody: "Please confirm the email in your inbox. After that you'll receive your plan link and the discount code.",
          errorInvalid: "Please enter a valid email address.",
          errorGeneric: "That didn't work just now. Please try again in a moment.",
          consentHint: "By submitting you sign up for the 2DiE4 newsletter (double opt-in confirmation, unsubscribe anytime). Your email is only used for this and never stored in this app. Details:",
          privacyLinkText: "Privacy Policy",
      }
    }
  }
};
