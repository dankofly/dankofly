import { UserProfile } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates UserProfile input against business constraints
 */
export const validateUserProfile = (profile: UserProfile): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Age validation: 5-100 years
  if (typeof profile.age !== 'number' || profile.age < 5 || profile.age > 120) {
    errors.push({
      field: 'age',
      message: 'Age must be between 5 and 120 years'
    });
  }

  // Gender validation
  if (!['male', 'female', 'diverse'].includes(profile.gender)) {
    errors.push({
      field: 'gender',
      message: 'Invalid gender selection'
    });
  }

  // Life stage validation
  if (!['adult', 'child'].includes(profile.lifeStage)) {
    errors.push({
      field: 'lifeStage',
      message: 'Invalid life stage'
    });
  }

  // Child/Adult age consistency
  if (profile.lifeStage === 'child' && profile.age >= 18) {
    errors.push({
      field: 'lifeStage',
      message: 'Life stage "child" is only valid for ages < 18'
    });
  }
  if (profile.lifeStage === 'adult' && profile.age < 18) {
    errors.push({
      field: 'lifeStage',
      message: 'Life stage "adult" is only valid for ages >= 18'
    });
  }

  // Goal validation
  const validGoals = ['balance', 'muscle', 'energy', 'immunity', 'growth_focus', 'keto', 'concentration', 'diet'];
  if (!validGoals.includes(profile.goal)) {
    errors.push({
      field: 'goal',
      message: `Goal must be one of: ${validGoals.join(', ')}`
    });
  }

  // Weight validation: 5kg - 300kg
  if (typeof profile.weight !== 'number' || profile.weight < 5 || profile.weight > 300) {
    errors.push({
      field: 'weight',
      message: 'Weight must be between 5kg and 300kg'
    });
  }

  // Duration validation: 1-52 weeks
  if (typeof profile.duration !== 'number' || profile.duration < 1 || profile.duration > 52) {
    errors.push({
      field: 'duration',
      message: 'Duration must be between 1 and 52 weeks'
    });
  }

  // Language validation
  if (!['de', 'en'].includes(profile.language)) {
    errors.push({
      field: 'language',
      message: 'Language must be either "de" or "en"'
    });
  }

  return errors;
};

/**
 * Sanitizes UserProfile to ensure all fields are valid types
 */
export const sanitizeUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  return {
    age: Math.max(5, Math.min(120, Number(profile.age) || 30)),
    gender: (['male', 'female', 'diverse'].includes(profile.gender as string) 
      ? profile.gender as UserProfile['gender'] 
      : 'female'),
    lifeStage: (['adult', 'child'].includes(profile.lifeStage as string)
      ? profile.lifeStage as UserProfile['lifeStage']
      : 'adult'),
    goal: (['balance', 'muscle', 'energy', 'immunity', 'growth_focus', 'keto', 'concentration', 'diet'].includes(profile.goal as string)
      ? profile.goal as UserProfile['goal']
      : 'balance'),
    weight: Math.max(5, Math.min(300, Number(profile.weight) || 70)),
    duration: Math.max(1, Math.min(52, Math.floor(Number(profile.duration) || 4))),
    language: (['de', 'en'].includes(profile.language as string)
      ? profile.language as UserProfile['language']
      : 'de')
  };
};
