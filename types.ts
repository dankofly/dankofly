export type Language = 'de' | 'en';

export interface Nutrients {
  energy: number; // kcal
  protein: number; // g
  carbs: number; // g
  sugar: number; // g
  fat: number; // g
  saturatedFat: number; // g
  magnesium: number; // mg
  calcium: number; // mg
  iron: number; // mg
  zinc: number; // mg
  potassium: number; // mg
  vitaminE: number; // mg
  b1: number; // mg
  b6: number; // mg
  selenium: number; // µg
  omega3: number; // g
}

export interface NutProfile {
  id: string;
  name: string;
  description: string;
  imageColor: string;
  nutrientsPer100g: Nutrients;
  benefits: string;
  gutHealthScore: number; // 0-10 Score indicating gut friendliness/prebiotic value
  shopUrl: string; // Direct link to the product
}

export type DailyIntake = Record<string, number>;

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'diverse';
  lifeStage: 'adult' | 'child';
  goal: 'balance' | 'muscle' | 'energy' | 'immunity' | 'growth_focus' | 'keto';
  weight: number;
  duration: number; // duration in weeks
  language: Language;
}

export interface DayPlan {
  day: string;
  mix: string[];
  focus: string;
  supplement: string;
}

export interface WeeklyPlan {
  title: string;
  strategy: string;
  schedule: DayPlan[];
  summary: string;
}