import type { ContraceptionMethod, CycleMode } from '@locklune/core';

export const CYCLE_MODES: { value: CycleMode; label: string; hint: string }[] = [
  { value: 'tracking', label: 'Tracking my cycle', hint: 'Period and fertility estimates' },
  {
    value: 'period_only',
    label: 'Period tracking only',
    hint: 'Periods only - fertility content hidden',
  },
  { value: 'trying', label: 'Trying to conceive', hint: 'Focus on your fertile window' },
  {
    value: 'contraception',
    label: 'On contraception',
    hint: 'Track bleeds; fertility hidden on hormonal methods',
  },
  { value: 'pregnant', label: 'Pregnant', hint: 'Track pregnancy progress instead' },
];

export const CONTRACEPTION_METHODS: { value: ContraceptionMethod; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pill', label: 'Combined pill' },
  { value: 'mini_pill', label: 'Mini-pill' },
  { value: 'patch', label: 'Patch' },
  { value: 'ring', label: 'Ring' },
  { value: 'injection', label: 'Injection' },
  { value: 'implant', label: 'Implant' },
  { value: 'hormonal_iud', label: 'Hormonal IUD' },
  { value: 'copper_iud', label: 'Copper IUD' },
  { value: 'condoms', label: 'Condoms' },
  { value: 'other', label: 'Other' },
];

export function modeLabel(mode: CycleMode): string {
  return CYCLE_MODES.find((m) => m.value === mode)?.label ?? 'Tracking my cycle';
}
