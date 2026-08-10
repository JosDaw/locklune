import {
  CONTRACEPTION_METHOD,
  CYCLE_MODE,
  type ContraceptionMethod,
  type CycleMode,
} from '@locklune/core';

// Labels/hints are i18n keys (see i18n catalogues `data.mode` / `data.contraception`);
// consumers translate with `t()` at render so they follow the active locale.
export const CYCLE_MODES: { value: CycleMode; labelKey: string; hintKey: string }[] = [
  {
    value: CYCLE_MODE.Tracking,
    labelKey: 'data.mode.tracking.label',
    hintKey: 'data.mode.tracking.hint',
  },
  {
    value: CYCLE_MODE.PeriodOnly,
    labelKey: 'data.mode.periodOnly.label',
    hintKey: 'data.mode.periodOnly.hint',
  },
  {
    value: CYCLE_MODE.Trying,
    labelKey: 'data.mode.trying.label',
    hintKey: 'data.mode.trying.hint',
  },
  {
    value: CYCLE_MODE.Contraception,
    labelKey: 'data.mode.contraception.label',
    hintKey: 'data.mode.contraception.hint',
  },
  {
    value: CYCLE_MODE.Pregnant,
    labelKey: 'data.mode.pregnant.label',
    hintKey: 'data.mode.pregnant.hint',
  },
];

export const CONTRACEPTION_METHODS: { value: ContraceptionMethod; labelKey: string }[] = [
  { value: CONTRACEPTION_METHOD.None, labelKey: 'data.contraception.none' },
  { value: CONTRACEPTION_METHOD.Pill, labelKey: 'data.contraception.pill' },
  { value: CONTRACEPTION_METHOD.MiniPill, labelKey: 'data.contraception.miniPill' },
  { value: CONTRACEPTION_METHOD.Patch, labelKey: 'data.contraception.patch' },
  { value: CONTRACEPTION_METHOD.Ring, labelKey: 'data.contraception.ring' },
  { value: CONTRACEPTION_METHOD.Injection, labelKey: 'data.contraception.injection' },
  { value: CONTRACEPTION_METHOD.Implant, labelKey: 'data.contraception.implant' },
  { value: CONTRACEPTION_METHOD.HormonalIud, labelKey: 'data.contraception.hormonalIud' },
  { value: CONTRACEPTION_METHOD.CopperIud, labelKey: 'data.contraception.copperIud' },
  { value: CONTRACEPTION_METHOD.Condoms, labelKey: 'data.contraception.condoms' },
  { value: CONTRACEPTION_METHOD.Other, labelKey: 'data.contraception.other' },
];
