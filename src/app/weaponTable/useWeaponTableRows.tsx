import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import getWeaponAttack, {
  allAttackPowerTypes,
  allDamageTypes,
  AttackPowerType,
  WeaponType,
  type Attributes,
  type Weapon,
} from "../../calculator/calculator.ts";
import type { OptimizeMode, OptimizationWeights } from "../../calculator/optimization.ts";
import { optimizeWeaponAttributes } from "../../calculator/optimizeAttributes.ts";
import filterWeapons from "../../search/filterWeapons.ts";
import { type WeaponTableRowData, type WeaponTableRowGroup } from "./WeaponTable.tsx";
import { type SortBy, sortWeapons } from "../../search/sortWeapons.ts";
import { type RegulationVersion } from "../regulationVersions.tsx";
import {
  allWeaponTypes,
  weaponTypeLabels,
  maxSpecialUpgradeLevel,
  toSpecialUpgradeLevel,
} from "../uiUtils.ts";
import type { WeaponOption } from "../WeaponPicker.tsx";

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  regulationVersion: RegulationVersion;
  offset: number;
  limit: number;
  sortBy: SortBy;
  reverse: boolean;
  affinityIds: readonly number[];
  weaponTypes: readonly WeaponType[];
  attributes: Attributes;
  freeStatPoints: number;
  optimizeMode: OptimizeMode;
  optimizeAttackPowerType: AttackPowerType;
  optimizationWeights: OptimizationWeights;
  spellScalingWeight: number;
  showOptimizedAttributes: boolean;
  includeDLC: boolean;
  effectiveOnly: boolean;
  twoHanding: boolean;
  upgradeLevel: number;
  groupWeaponTypes: boolean;
  disableWeaponTypeFilter?: boolean;
  selectedWeapons: WeaponOption[];
}

interface WeaponTableRowsResult {
  rowGroups: readonly WeaponTableRowGroup[];

  /** Attack power types included in at least one weapon in the filtered results */
  attackPowerTypes: ReadonlySet<AttackPowerType>;

  /**True if at least one weapon in the filtered results can cast spells */
  spellScaling: boolean;

  total: number;

  /**
   * True while a new optimization run is being calculated. Used to show a loading popup.
   */
  optimizing: boolean;
}

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function applyDisplayWeights({
  attackResult,
  optimizeMode,
  optimizationWeights,
}: {
  attackResult: ReturnType<typeof getWeaponAttack>;
  optimizeMode: OptimizeMode;
  optimizationWeights: OptimizationWeights;
}) {
  if (optimizeMode !== "weighted") {
    return attackResult;
  }

  const weightedAttackPower = { ...attackResult.attackPower };
  for (const type of allDamageTypes) {
    const weight = optimizationWeights[type] ?? 1;
    weightedAttackPower[type] = (weightedAttackPower[type] ?? 0) * weight;
  }

  return {
    ...attackResult,
    attackPower: weightedAttackPower,
    // Intentionally do not apply weighting to spell scaling in the table display/sorting.
    // (Weighted mode uses a fixed, large spell scaling weight for optimization only.)
    spellScaling: attackResult.spellScaling,
  };
}

/**
 * Filter, sort, and paginate the weapon list based on the current selections
 */
const useWeaponTableRows = ({
  weapons,
  regulationVersion,
  offset,
  limit,
  upgradeLevel: regularUpgradeLevel,
  groupWeaponTypes,
  disableWeaponTypeFilter,
  sortBy,
  reverse,
  ...options
}: WeaponTableRowsOptions): WeaponTableRowsResult => {
  // Defer filtering based on app state changes because this can be CPU intensive if done while
  // busy rendering
  const attributes = useDeferredValue(options.attributes);
  const twoHanding = useDeferredValue(options.twoHanding);
  const weaponTypes = useDeferredValue(options.weaponTypes);
  const affinityIds = useDeferredValue(options.affinityIds);
  const effectiveOnly = useDeferredValue(options.effectiveOnly);
  const includeDLC = useDeferredValue(options.includeDLC);
  const selectedWeapons = useDeferredValue(options.selectedWeapons);
  const freeStatPoints = useDeferredValue(options.freeStatPoints);
  const optimizeMode = useDeferredValue(options.optimizeMode);
  const optimizeAttackPowerType = useDeferredValue(options.optimizeAttackPowerType);
  const optimizationWeights = useDeferredValue(options.optimizationWeights);
  const spellScalingWeight = useDeferredValue(options.spellScalingWeight);
  // Note: showOptimizedAttributes only controls UI columns. We always compute/store optimized
  // attributes when optimizing so toggling the checkbox does not trigger a full recomputation.
  // (The optimization results are the same either way.)

  const specialUpgradeLevel = toSpecialUpgradeLevel(regularUpgradeLevel);

  // Determine which weapon types can never be given an affinity. It's convenient for them to
  // show up under both "Standard" and "Unique" filtering options
  const uninfusableWeaponTypes = useMemo(() => {
    const tmp = new Set(allWeaponTypes);
    for (const weapon of weapons) {
      if (weapon.affinityId !== 0 && weapon.affinityId !== -1) {
        tmp.delete(weapon.weaponType);
      }
    }
    return tmp;
  }, [weapons]);

  const [filteredRows, setFilteredRows] = useState<WeaponTableRowData[]>([]);
  const [attackPowerTypes, setAttackPowerTypes] = useState<Set<AttackPowerType>>(new Set());
  const [spellScaling, setSpellScaling] = useState(false);
  const [total, setTotal] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const runId = ++runIdRef.current;

    async function recalc() {
      const shouldOptimize = freeStatPoints > 0 && optimizeMode !== "none";
      setOptimizing(shouldOptimize);

      // Let the UI paint the popup before doing heavy synchronous work.
      if (shouldOptimize) {
        await yieldToBrowser();
      }

      const includedDamageTypes = new Set<AttackPowerType>();
      let includeSpellScaling = false;

      const filteredWeapons = filterWeapons(weapons, {
        weaponTypes: disableWeaponTypeFilter
          ? new Set()
          : new Set(weaponTypes.filter((weaponType) => allWeaponTypes.includes(weaponType))),
        affinityIds: new Set(
          affinityIds.filter((affinityId) => regulationVersion.affinityOptions.has(affinityId)),
        ),
        effectiveWithAttributes: effectiveOnly ? attributes : undefined,
        includeDLC,
        twoHanding,
        uninfusableWeaponTypes,
        selectedWeapons: selectedWeapons.reduce(
          (acc, weapon) => (acc.add(weapon.value), acc),
          new Set<string>(),
        ),
      });

      const rows: WeaponTableRowData[] = [];
      rows.length = filteredWeapons.length;

      for (let idx = 0; idx < filteredWeapons.length; idx++) {
        if (cancelled || runId !== runIdRef.current) {
          return;
        }

        const weapon = filteredWeapons[idx];

        let upgradeLevel = 0;
        if (weapon.attack.length - 1 === maxSpecialUpgradeLevel) {
          upgradeLevel = specialUpgradeLevel;
        } else {
          upgradeLevel = Math.min(regularUpgradeLevel, weapon.attack.length - 1);
        }

        const baseAttackResult = getWeaponAttack({
          weapon,
          attributes,
          twoHanding,
          upgradeLevel,
          disableTwoHandingAttackPowerBonus: regulationVersion.disableTwoHandingAttackPowerBonus,
          ineffectiveAttributePenalty: regulationVersion.ineffectiveAttributePenalty,
        });

        // Determine included damage types from the unweighted values so columns don't disappear when
        // a weight is set to 0.
        for (const type of allAttackPowerTypes) {
          if (baseAttackResult.attackPower[type]) {
            includedDamageTypes.add(type);
          }
        }

        // We'll use this for sorting + display. In weighted mode we apply weights to attack power
        // and spell scaling (but not status buildup).
        let weaponAttackResult = applyDisplayWeights({
          attackResult: baseAttackResult,
          optimizeMode,
          optimizationWeights,
        });

        let optimizedAttributes: Attributes | undefined;
        if (shouldOptimize) {
          const optimized = optimizeWeaponAttributes({
            weapon,
            attributes,
            freeStatPoints,
            twoHanding,
            upgradeLevel,
            disableTwoHandingAttackPowerBonus: regulationVersion.disableTwoHandingAttackPowerBonus,
            ineffectiveAttributePenalty: regulationVersion.ineffectiveAttributePenalty,
            optimizeMode,
            optimizeAttackPowerType,
            weights: optimizationWeights,
            spellScalingWeight,
          });

          // Use the optimized attack result. If we're in weighted mode, apply weights for display/sorting.
          const optimizedAttackResult = optimized.optimizedAttackResult;
          weaponAttackResult = applyDisplayWeights({
            attackResult: optimizedAttackResult,
            optimizeMode,
            optimizationWeights,
          });
          optimizedAttributes = optimized.optimizedAttributes;
        }

        if (weapon.sorceryTool || weapon.incantationTool) {
          includeSpellScaling = true;
        }

        rows[idx] = optimizedAttributes
          ? [weapon, weaponAttackResult, { optimizedAttributes }]
          : [weapon, weaponAttackResult];

        // Yield occasionally to keep the UI responsive during large computations.
        if (shouldOptimize && idx % 25 === 24) {
          await yieldToBrowser();
        }
      }

      if (cancelled || runId !== runIdRef.current) {
        return;
      }

      setFilteredRows(rows);
      setAttackPowerTypes(includedDamageTypes);
      setSpellScaling(includeSpellScaling);
      setTotal(rows.length);
      setOptimizing(false);
    }

    void recalc();

    return () => {
      cancelled = true;
    };
  }, [
    attributes,
    twoHanding,
    weapons,
    regulationVersion,
    regularUpgradeLevel,
    specialUpgradeLevel,
    weaponTypes,
    affinityIds,
    includeDLC,
    effectiveOnly,
    uninfusableWeaponTypes,
    selectedWeapons,
    disableWeaponTypeFilter,
    freeStatPoints,
    optimizeMode,
    optimizeAttackPowerType,
    optimizationWeights,
    spellScalingWeight,
  ]);

  const rowGroups = useMemo<WeaponTableRowGroup[]>(() => {
    if (groupWeaponTypes) {
      const rowsByWeaponType: { [weaponType in WeaponType]?: WeaponTableRowData[] } = {};
      filteredRows.forEach((row) => {
        const [weapon] = row;
        (rowsByWeaponType[weapon.weaponType] ??= []).push(row);
      });

      const rowGroups: WeaponTableRowGroup[] = [];
      allWeaponTypes.forEach((weaponType) => {
        if (weaponType in rowsByWeaponType) {
          rowGroups.push({
            key: weaponType.toString(),
            name: weaponTypeLabels.get(weaponType)!,
            rows: sortWeapons(rowsByWeaponType[weaponType]!, sortBy, reverse),
          });
        }
      });
      return rowGroups;
    }

    return filteredRows.length
      ? [
          {
            key: "allWeapons",
            rows: sortWeapons(filteredRows, sortBy, reverse).slice(offset, limit),
          },
        ]
      : [];
  }, [filteredRows, reverse, sortBy, groupWeaponTypes, offset, limit]);

  return {
    rowGroups,
    attackPowerTypes,
    spellScaling,
    total,
    optimizing,
  };
};

export default useWeaponTableRows;
