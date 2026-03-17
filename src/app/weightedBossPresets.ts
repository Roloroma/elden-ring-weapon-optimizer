import { AttackPowerType } from "../calculator/calculator.ts";
import type { OptimizationWeights } from "../calculator/optimization.ts";

export type WeightedBossPresetId =
  | "custom"
  | "default"
  | "godrick"
  | "radahn"
  | "renalla"
  | "rykard"
  | "morgott"
  | "mohg"
  | "malenia";

export interface WeightedBossPreset {
  id: WeightedBossPresetId;
  label: string;
  weights: OptimizationWeights;
  spellScalingWeight: number;
}

const makeWeights = (w: {
  physical: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
  poison: number;
  scarletRot: number;
  bleed: number;
  frost: number;
  sleep: number;
  madness: number;
  deathBlight: number;
}): OptimizationWeights => ({
  [AttackPowerType.PHYSICAL]: w.physical,
  [AttackPowerType.MAGIC]: w.magic,
  [AttackPowerType.FIRE]: w.fire,
  [AttackPowerType.LIGHTNING]: w.lightning,
  [AttackPowerType.HOLY]: w.holy,
  [AttackPowerType.POISON]: w.poison,
  [AttackPowerType.SCARLET_ROT]: w.scarletRot,
  [AttackPowerType.BLEED]: w.bleed,
  [AttackPowerType.FROST]: w.frost,
  [AttackPowerType.SLEEP]: w.sleep,
  [AttackPowerType.MADNESS]: w.madness,
  [AttackPowerType.DEATH_BLIGHT]: w.deathBlight,
});

export const weightedBossPresets: readonly WeightedBossPreset[] = [
  {
    id: "custom",
    label: "Custom",
    weights: {},
    spellScalingWeight: 1000,
  },
  {
    id: "default",
    label: "Default",
    weights: makeWeights({
      physical: 1,
      magic: 1,
      fire: 1,
      lightning: 1,
      holy: 1,
      poison: 20 / 500,
      scarletRot: 20 / 500,
      bleed: 20 / 500,
      frost: 20 / 500,
      sleep: 20 / 500,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "godrick",
    label: "Godrick",
    weights: makeWeights({
      physical: 1.0,
      magic: 0.8,
      fire: 0.8,
      lightning: 0.8,
      holy: 0.6,
      poison: 0.0627,
      scarletRot: 0.0627,
      bleed: 0.0627,
      frost: 0.0627,
      sleep: 0.0627,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "radahn",
    label: "Radahn",
    weights: makeWeights({
      physical: 0.9,
      magic: 0.8,
      fire: 0.8,
      lightning: 0.8,
      holy: 0.6,
      poison: 0.0597,
      scarletRot: 0.0821,
      bleed: 0.0597,
      frost: 0.0597,
      sleep: 0.0365,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "renalla",
    label: "Rennala",
    weights: makeWeights({
      physical: 1.1,
      magic: 0.2,
      fire: 0.8,
      lightning: 0.8,
      holy: 0.8,
      poison: 0.0612,
      scarletRot: 0.0612,
      bleed: 0.0612,
      frost: 0.0612,
      sleep: 0,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "rykard",
    label: "Rykard",
    weights: makeWeights({
      physical: 0.9,
      magic: 0.6,
      fire: 0.2,
      lightning: 0.8,
      holy: 0.6,
      poison: 0.036,
      scarletRot: 0.036,
      bleed: 0.036,
      frost: 0.081,
      sleep: 0.036,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "morgott",
    label: "Morgott",
    weights: makeWeights({
      physical: 1.0,
      magic: 1.0,
      fire: 1.0,
      lightning: 1.0,
      holy: 0.6,
      poison: 0.0592,
      scarletRot: 0.0592,
      bleed: 0.0592,
      frost: 0.0592,
      sleep: 0.0362,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "mohg",
    label: "Mohg",
    weights: makeWeights({
      physical: 0.9,
      magic: 0.6,
      fire: 0.2,
      lightning: 0.6,
      holy: 0.6,
      poison: 0.0306,
      scarletRot: 0.0306,
      bleed: 0.0688,
      frost: 0.0306,
      sleep: 0.0142,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
  {
    id: "malenia",
    label: "Malenia",
    weights: makeWeights({
      physical: 0.9,
      magic: 0.8,
      fire: 1.0,
      lightning: 0.8,
      holy: 0.6,
      poison: 0.0135,
      scarletRot: 0.0135,
      bleed: 0.0475,
      frost: 0.0653,
      sleep: 0.029,
      madness: 0,
      deathBlight: 0,
    }),
    spellScalingWeight: 1000,
  },
] as const;

const presetIds = new Set(weightedBossPresets.map((p) => p.id));

export function isWeightedBossPresetId(value: unknown): value is WeightedBossPresetId {
  return typeof value === "string" && presetIds.has(value as WeightedBossPresetId);
}

export function getWeightedBossPreset(id: WeightedBossPresetId): WeightedBossPreset {
  return weightedBossPresets.find((p) => p.id === id) ?? weightedBossPresets[0];
}
