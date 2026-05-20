const lettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.'-]+$/;
const digitsRegex = /^\d+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const keepLetters = (value: string) =>
  value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s.'-]/g, '');

export const keepDigits = (value: string) => value.replace(/\D/g, '');

export const isLetters = (value: string, minLength = 3) => {
  const normalized = value.trim();
  return normalized.length >= minLength && lettersRegex.test(normalized);
};

export const isDigits = (value: string, minLength = 5, maxLength = 15) => {
  const normalized = value.trim();
  return (
    normalized.length >= minLength &&
    normalized.length <= maxLength &&
    digitsRegex.test(normalized)
  );
};

export const isPhone = (value: string) => isDigits(value, 7, 12);

export const isEmail = (value: string) => emailRegex.test(value.trim());

export const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayInputValue = () => toDateInputValue(new Date());

export const currentYearEndInputValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-12-31`;
};

export const isDateNotFuture = (value: string) => {
  if (!value) return false;
  return value <= todayInputValue();
};

export const isDateInCurrentYear = (value: string) => {
  if (!value) return false;
  return value.slice(0, 4) === String(new Date().getFullYear());
};

export const isDateWithinCurrentYearFromToday = (value: string) => {
  if (!value) return false;
  return value >= todayInputValue() && value <= currentYearEndInputValue();
};
