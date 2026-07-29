import {
  CONTRACEPTION_METHOD,
  CYCLE_MODE,
  type ContraceptionMethod,
  type CycleMode,
} from '@locklune/core';

export const CYCLE_MODES: { value: CycleMode; label: string; hint: string }[] = [
  {
    value: CYCLE_MODE.Tracking,
    label: 'Tracking my cycle',
    hint: 'Period and fertility estimates',
  },
  {
    value: CYCLE_MODE.PeriodOnly,
    label: 'Period tracking only',
    hint: 'Periods only - fertility content hidden',
  },
  { value: CYCLE_MODE.Trying, label: 'Trying to conceive', hint: 'Focus on your fertile window' },
  {
    value: CYCLE_MODE.Contraception,
    label: 'On contraception',
    hint: 'Track bleeds; fertility hidden on hormonal methods',
  },
  { value: CYCLE_MODE.Pregnant, label: 'Pregnant', hint: 'Track pregnancy progress instead' },
];

export const CONTRACEPTION_METHODS: { value: ContraceptionMethod; label: string }[] = [
  { value: CONTRACEPTION_METHOD.None, label: 'None' },
  { value: CONTRACEPTION_METHOD.Pill, label: 'Combined pill' },
  { value: CONTRACEPTION_METHOD.MiniPill, label: 'Mini-pill' },
  { value: CONTRACEPTION_METHOD.Patch, label: 'Patch' },
  { value: CONTRACEPTION_METHOD.Ring, label: 'Ring' },
  { value: CONTRACEPTION_METHOD.Injection, label: 'Injection' },
  { value: CONTRACEPTION_METHOD.Implant, label: 'Implant' },
  { value: CONTRACEPTION_METHOD.HormonalIud, label: 'Hormonal IUD' },
  { value: CONTRACEPTION_METHOD.CopperIud, label: 'Copper IUD' },
  { value: CONTRACEPTION_METHOD.Condoms, label: 'Condoms' },
  { value: CONTRACEPTION_METHOD.Other, label: 'Other' },
];
