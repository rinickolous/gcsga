import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { EquipmentCostType, EquipmentWeightType } from "@item/equipment_modifier/data";
import { WeightUnits } from "@module/data";
import { PrereqList } from "@prereq/prereq_list";
import { determineModWeightValueTypeFromString, extractFraction } from "@util";
import { EquipmentData } from "./data";

export class EquipmentGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof EquipmentData {
		return EquipmentData;
	}

	// Getters
	get other(): boolean {
		return this.data.data.other;
	}

	get quantity(): number {
		return this.data.data.quantity;
	}

	get value(): number {
		return this.data.data.value;
	}

	get weight(): number {
		return parseFloat(this.data.data.weight);
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return new PrereqList(this.data.data.prereqs);
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	get equipped(): boolean {
		return this.data.data.equipped;
	}

	get techLevel(): string {
		return this.data.data.tech_level;
	}

	get legalityClass(): string {
		return this.data.data.legality_class;
	}

	get uses(): number {
		return this.data.data.uses;
	}

	get maxUses(): number {
		return this.data.data.max_uses;
	}

	// Embedded Items
	get modifiers(): Collection<EquipmentModifierGURPS> {
		const modifiers: Collection<EquipmentModifierGURPS> = new Collection();
		this.items.forEach(item => {
			if (item instanceof EquipmentModifierGURPS) modifiers.set(item.data._id!, item);
		});
		return modifiers;
	}

	get adjustedValue(): number {
		return valueAdjustedForModifiers(this.value, this.modifiers);
	}

	// Value Calculator
	get extendedValue(): number {
		if (this.quantity <= 0) return 0;
		let value = this.adjustedValue;
		return value * this.quantity;
	}

	get adjustedWeightFast(): string {
		return this.adjustedWeight(false, "lb").toString() + " lb";
	}

	adjustedWeight(for_skills: boolean, units: WeightUnits): number {
		if (for_skills && this.data.data.ignore_weight_for_skills) return 0;
		return this.weightAdjustedForMods(units);
	}

	extendedWeight(for_skills: boolean, units: WeightUnits): number {
		return this.adjustedWeight(for_skills, units);
	}

	get extendedWeightFast(): string {
		return this.extendedWeight(false, "lb").toString() + " lb";
	}

	weightAdjustedForMods(units: WeightUnits): number {
		let percentages = 0;
		let w = this.weight;

		this.modifiers.forEach(mod => {
			if (mod.weightType == "to_original_weight") {
				const t = determineModWeightValueTypeFromString(mod.weightAmount);
				const f = extractFraction(mod.weightAmount);
				const amt = f.numerator / f.denominator;
				if (t == "weight_addition") {
					w = w + amt;
				} else {
					percentages += amt;
				}
			}
		});
		if (percentages != 0) w += (this.weight * percentages) / 100;

		w = processMultiplyAddWeightStep("to_base_weight", w, units, this.modifiers);

		w = processMultiplyAddWeightStep("to_final_base_weight", w, units, this.modifiers);

		w = processMultiplyAddWeightStep("to_final_weight", w, units, this.modifiers);

		return w;
	}
}

export function valueAdjustedForModifiers(value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let cost = processNonCFStep("to_original_cost", value, modifiers);

	let cf = 0;
	modifiers.forEach(mod => {
		if (mod.costType == "to_base_cost") {
			let t = determineModCostValueTypeFromString(mod.costAmount);
			cf += extractValue(mod.costAmount);
			if (t == "multiplier") cf -= 1;
		}
	});
	if (cf != 0) {
		cf = Math.max(cf, -0.8);
		cost *= Math.max(cf, -0.8) + 1;
	}
	cost = processNonCFStep("to_final_base_cost", cost, modifiers);
	cost = processNonCFStep("to_final_cost", cost, modifiers);

	return Math.max(cost, 0);
}

export function processNonCFStep(
	costType: EquipmentCostType,
	value: number,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let cost = value;
	let percentages = 0;
	let additions = 0;
	modifiers.forEach(mod => {
		if (mod.costType == costType) {
			let t = determineModCostValueTypeFromString(mod.costAmount);
			let amt = extractValue(mod.costAmount);
			if (t == "addition") additions += amt;
			if (t == "percentage") percentages += amt;
			if (t == "multiplier") cost *= amt;
		}
	});
	cost += additions;
	if (percentages != 0) cost += (value * percentages) / 100;

	return cost;
}

type CostValueType = "addition" | "percentage" | "multiplier";

export function determineModCostValueTypeFromString(v: string): CostValueType {
	const s = v.toLowerCase().trim();
	if (s.endsWith("cf")) return "addition";
	else if (s.endsWith("%")) return "percentage";
	else if (s.startsWith("x") || s.endsWith("x")) return "multiplier";
	return "addition";
}

export function extractValue(s: string): number {
	let v = extract(s.trim());
	if (determineModCostValueTypeFromString(s) == "multiplier" && v <= 0) v = 1;
	return v;
}

export function extract(s: string): number {
	let last = 0;
	let max = s.length;
	if (last < max && s[last] == " ") last++;
	if (last >= max) return 0;
	let ch = s[last];
	let found = false;
	let decimal = false;
	let start = last;
	while ((start == last && ["+", "-"].includes(ch)) || (!decimal && ch == ".") || ch.match("[0-9]")) {
		if (ch.match("[0-9]")) found = true;
		if (ch == ".") decimal = true;
		last++;
		if (last >= max) break;
		ch = s[last];
	}
	if (!found) return 0;
	let value = parseFloat(s.substring(start, last));
	if (isNaN(value)) return 0;
	return value;
}

export function processMultiplyAddWeightStep(
	type: EquipmentWeightType,
	weight: number,
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let sum = 0;
	modifiers.forEach(mod => {
		if (mod.weightType == type) {
			const t = determineModWeightValueTypeFromString(mod.weightAmount);
			const f = extractFraction(mod.weightAmount);
			if (t == "weight_addition") sum += parseFloat(mod.weightAmount);
			else if (t == "weight_percentage_multiplier") weight = (weight * f.numerator) / (f.denominator * 100);
			else if (t == "weight_multiplier") weight = (weight * f.numerator) / f.denominator;
		}
	});
	return weight + sum;
}

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
