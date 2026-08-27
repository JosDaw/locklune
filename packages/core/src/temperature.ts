/**
 * Basal body temperature helpers. Temperature is stored canonically in Celsius
 * everywhere; these convert to/from the user's chosen display unit and validate
 * entries against a plausible band so a typo can't corrupt the record.
 */
import type { TemperatureUnit } from './types.js';

/**
 * Plausible BBT band in Celsius. Deliberately wide (real BBT sits ~35.5–37.5)
 * so genuine edge readings and fevers aren't rejected, while gross typos like
 * "367" or a value entered in the wrong unit are caught.
 */
export const MIN_BBT_CELSIUS = 34;
export const MAX_BBT_CELSIUS = 43;

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * (5 / 9);
}

/** Convert a stored Celsius value into the given display unit. */
export function fromCelsius(celsius: number, unit: TemperatureUnit): number {
  return unit === 'f' ? celsiusToFahrenheit(celsius) : celsius;
}

/** Convert a value entered in `unit` into canonical Celsius. */
export function toCelsius(value: number, unit: TemperatureUnit): number {
  return unit === 'f' ? fahrenheitToCelsius(value) : value;
}

/** Unit symbol for display, e.g. "°C" / "°F". */
export function temperatureUnitLabel(unit: TemperatureUnit): string {
  return unit === 'f' ? '°F' : '°C';
}

/** Plausible entry range expressed in the given unit (for hints + validation). */
export function bbtRange(unit: TemperatureUnit): { min: number; max: number } {
  if (unit === 'f') {
    return {
      min: Math.round(celsiusToFahrenheit(MIN_BBT_CELSIUS) * 10) / 10,
      max: Math.round(celsiusToFahrenheit(MAX_BBT_CELSIUS) * 10) / 10,
    };
  }
  return { min: MIN_BBT_CELSIUS, max: MAX_BBT_CELSIUS };
}

/**
 * Validate a value entered in `unit` and return canonical Celsius, or null if it
 * is not a finite number within the plausible BBT band.
 */
export function parseBbtToCelsius(value: number, unit: TemperatureUnit): number | null {
  if (!Number.isFinite(value)) return null;
  const celsius = toCelsius(value, unit);
  if (celsius < MIN_BBT_CELSIUS || celsius > MAX_BBT_CELSIUS) return null;
  return celsius;
}

/**
 * Format a stored Celsius value for display in `unit` (no unit suffix). Celsius
 * keeps 2 decimals (0.01 precision), Fahrenheit 1 decimal - both typical for a
 * BBT thermometer.
 */
export function formatBbt(celsius: number, unit: TemperatureUnit): string {
  const value = fromCelsius(celsius, unit);
  return unit === 'f' ? value.toFixed(1) : value.toFixed(2);
}
