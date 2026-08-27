import { describe, expect, it } from 'vitest';
import {
  bbtRange,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatBbt,
  fromCelsius,
  parseBbtToCelsius,
  temperatureUnitLabel,
} from './temperature.js';

describe('temperature', () => {
  it('converts between Celsius and Fahrenheit', () => {
    expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 5);
    expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37, 5);
    // round trip
    expect(fahrenheitToCelsius(celsiusToFahrenheit(36.7))).toBeCloseTo(36.7, 5);
  });

  it('validates a plausible entry and returns canonical Celsius', () => {
    expect(parseBbtToCelsius(36.7, 'c')).toBeCloseTo(36.7, 5);
    expect(parseBbtToCelsius(98.6, 'f')).toBeCloseTo(37, 5);
  });

  it('rejects implausible values (typos / wrong unit)', () => {
    expect(parseBbtToCelsius(367, 'c')).toBeNull(); // missing decimal
    expect(parseBbtToCelsius(98.6, 'c')).toBeNull(); // Fahrenheit typed as Celsius
    expect(parseBbtToCelsius(37, 'f')).toBeNull(); // Celsius typed as Fahrenheit
    expect(parseBbtToCelsius(Number.NaN, 'c')).toBeNull();
  });

  it('exposes the plausible range in the requested unit', () => {
    expect(bbtRange('c')).toEqual({ min: 34, max: 43 });
    const f = bbtRange('f');
    expect(f.min).toBeCloseTo(93.2, 1);
    expect(f.max).toBeCloseTo(109.4, 1);
  });

  it('formats stored Celsius for display in each unit', () => {
    expect(formatBbt(36.7, 'c')).toBe('36.70');
    expect(formatBbt(37, 'f')).toBe('98.6');
    expect(fromCelsius(37, 'f')).toBeCloseTo(98.6, 5);
    expect(temperatureUnitLabel('c')).toBe('°C');
    expect(temperatureUnitLabel('f')).toBe('°F');
  });
});
