/**
 * Input validation utility with regex patterns
 * Provides sanitization and validation for all form inputs
 */

// Regex patterns for validation
export const PATTERNS = {
  // Names: Allows letters, spaces, hyphens (French characters supported)
  NAME: /^[a-zA-Zàâäæçéèêëïîôöœùûüœñ\s\-']{1,100}$/,
  
  // Email
  EMAIL: /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/,
  
  // Phone (international format with + or just digits)
  PHONE: /^[\d\s\+\-\(\)]{7,20}$/,
  
  // Alphanumeric only
  ALPHANUMERIC: /^[a-zA-Z0-9\s\-]{1,100}$/,
  
  // Digits only
  DIGITS_ONLY: /^\d+$/,
  
  // Decimal (for prices)
  DECIMAL: /^\d+(\.\d{1,2})?$/,
  
  // Date (YYYY-MM-DD)
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  
  // Time (HH:MM)
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // URL (basic)
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  
  // Username (alphanumeric and underscore)
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  
  // Strong password (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Address (letters, numbers, spaces, hyphens, commas)
  ADDRESS: /^[a-zA-Z0-9àâäæçéèêëïîôöœùûüœñ\s\-,\.]{1,200}$/,
  
  // CIN/ID number (9 digits for Moroccan CIN)
  CIN: /^[A-Z]{0,2}\d{6,8}[A-Z0-9]?$/,
  
  // Medical/Treatment description
  TEXT_EXTENDED: /^[a-zA-Z0-9àâäæçéèêëïîôöœùûüœñ\s\-,.\(\)!?']*$/,
};

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  return String(input)
    .trim()
    .replace(/[<>\"']/g, '') // Remove dangerous characters
    .substring(0, 500); // Limit length
}

/**
 * Sanitize for database operations
 */
export function sanitizeForDb(input: any): any {
  if (typeof input === 'string') {
    return sanitizeInput(input);
  }
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (input === null || input === undefined) {
    return null;
  }
  return input;
}

/**
 * Validate name field
 */
export function validateName(name: string | null | undefined, fieldName = 'Nom'): ValidationError | null {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  
  if (sanitized.length < 2) {
    return { field: fieldName, message: `${fieldName} doit contenir au moins 2 caractères` };
  }
  
  if (!PATTERNS.NAME.test(sanitized)) {
    return { field: fieldName, message: `${fieldName} contient des caractères invalides` };
  }
  
  return null;
}

/**
 * Validate email
 */
export function validateEmail(email: string | null | undefined): ValidationError | null {
  const sanitized = sanitizeInput(email);
  
  if (!sanitized) {
    return { field: 'email', message: 'Email est requis' };
  }
  
  if (!PATTERNS.EMAIL.test(sanitized)) {
    return { field: 'email', message: 'Email invalide' };
  }
  
  return null;
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string | null | undefined): ValidationError | null {
  const sanitized = sanitizeInput(phone);
  
  if (!sanitized) {
    return { field: 'phone', message: 'Téléphone est requis' };
  }
  
  if (!PATTERNS.PHONE.test(sanitized)) {
    return { field: 'phone', message: 'Téléphone invalide (format: 7-20 caractères)' };
  }
  
  return null;
}

/**
 * Validate decimal number (price)
 */
export function validatePrice(price: string | number | null | undefined, fieldName = 'Prix'): ValidationError | null {
  const sanitized = sanitizeInput(String(price));
  
  if (!sanitized) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  
  if (!PATTERNS.DECIMAL.test(sanitized)) {
    return { field: fieldName, message: `${fieldName} doit être un nombre valide (ex: 199.99)` };
  }
  
  const num = parseFloat(sanitized);
  if (num < 0) {
    return { field: fieldName, message: `${fieldName} ne peut pas être négatif` };
  }
  
  if (num > 999999.99) {
    return { field: fieldName, message: `${fieldName} est trop élevé` };
  }
  
  return null;
}

/**
 * Validate date
 */
export function validateDate(date: string | null | undefined, fieldName = 'Date'): ValidationError | null {
  const sanitized = sanitizeInput(date);
  
  if (!sanitized) {
    return { field: fieldName, message: `${fieldName} est requise` };
  }
  
  if (!PATTERNS.DATE.test(sanitized)) {
    return { field: fieldName, message: `${fieldName} invalide (format: YYYY-MM-DD)` };
  }
  
  const dateObj = new Date(sanitized);
  if (isNaN(dateObj.getTime())) {
    return { field: fieldName, message: `${fieldName} invalide` };
  }
  
  return null;
}

/**
 * Validate time
 */
export function validateTime(time: string | null | undefined, fieldName = 'Heure'): ValidationError | null {
  const sanitized = sanitizeInput(time);
  
  if (!sanitized) {
    return { field: fieldName, message: `${fieldName} est requise` };
  }
  
  if (!PATTERNS.TIME.test(sanitized)) {
    return { field: fieldName, message: `${fieldName} invalide (format: HH:MM)` };
  }
  
  return null;
}

/**
 * Validate text description
 */
export function validateDescription(text: string | null | undefined, fieldName = 'Description', minLength = 0, maxLength = 1000): ValidationError | null {
  const sanitized = sanitizeInput(text);
  
  if (minLength > 0 && !sanitized) {
    return { field: fieldName, message: `${fieldName} est requise` };
  }
  
  if (sanitized.length < minLength) {
    return { field: fieldName, message: `${fieldName} doit contenir au moins ${minLength} caractères` };
  }
  
  if (sanitized.length > maxLength) {
    return { field: fieldName, message: `${fieldName} ne doit pas dépasser ${maxLength} caractères` };
  }
  
  if (!PATTERNS.TEXT_EXTENDED.test(sanitized)) {
    return { field: fieldName, message: `${fieldName} contient des caractères invalides` };
  }
  
  return null;
}

/**
 * Validate required ID field
 */
export function validateRequiredId(id: string | number | null | undefined, fieldName = 'ID'): ValidationError | null {
  if (!id) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  
  if (typeof id === 'string' && !PATTERNS.DIGITS_ONLY.test(id)) {
    return { field: fieldName, message: `${fieldName} invalide` };
  }
  
  return null;
}

/**
 * Validate required select field
 */
export function validateRequiredSelect(value: string | null | undefined, fieldName = 'Champ'): ValidationError | null {
  if (!value) {
    return { field: fieldName, message: `Veuillez sélectionner ${fieldName}` };
  }
  
  return null;
}

/**
 * Validate CIN (Moroccan ID)
 */
export function validateCIN(cin: string | null | undefined): ValidationError | null {
  const sanitized = sanitizeInput(cin);
  
  if (!sanitized) {
    return null; // CIN is optional in some cases
  }
  
  if (!PATTERNS.CIN.test(sanitized.toUpperCase())) {
    return { field: 'cin', message: 'CIN invalide (format: 6-8 chiffres)' };
  }
  
  return null;
}

/**
 * Validate multiple fields and return all errors
 */
export function validateForm(data: Record<string, any>, rules: Record<string, (value: any) => ValidationError | null>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

/**
 * Get first error message
 */
export function getFirstError(errors: ValidationError[]): string {
  return errors[0]?.message || '';
}
