import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { EquipmentCostType, EquipmentWeightType } from "@item/equipment_modifier/data";
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container";
import { WeightUnits } from "@module/data";
import { determineModWeightValueTypeFromString, extractFraction, floatingMul } from "@util";
import { EquipmentData } from "./data";

export class EquipmentGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	// static override get schema(): typeof EquipmentData {
	// 	return EquipmentData;
	// }

	// Getters
	get other(): boolean {
		return this.system.other;
	}

	get quantity(): number {
		return this.system.quantity;
	}

	get value(): number {
		return this.system.value;
	}

	get weight(): number {
		return parseFloat(this.system.weight);
	}

	get enabled(): boolean {
		return this.equipped;
	}

	get equipped(): boolean {
		return this.system.equipped;
	}

	get techLevel(): string {
		return this.system.tech_level;
	}

	get legalityClass(): string {
		return this.system.legality_class;
	}

	get uses(): number {
		return this.system.uses;
	}

	get maxUses(): number {
		return this.system.max_uses;
	}

	// Embedded Items
	get modifiers(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		const modifiers: Collection<EquipmentModifierGURPS> = new Collection();
		this.items.forEach(item => {
			if (item instanceof EquipmentModifierGURPS) modifiers.set(item.id!, item);
		});
		return modifiers;
	}

	get deepModifiers(): Collection<EquipmentModifierGURPS> {
		const deepModifiers: Array<EquipmentModifierGURPS> = [];
		this.modifiers.forEach(mod => {
			if (mod instanceof EquipmentModifierGURPS) deepModifiers.push(mod);
			else
				mod.deepItems.forEach(e => {
					if (e instanceof EquipmentModifierGURPS) deepModifiers.push(e);
				});
		});
		return new Collection(
			deepModifiers.map(item => {
				return [item.id!, item];
			}),
		);
	}

	get adjustedValue(): number {
		return valueAdjustedForModifiers(this.value, this.deepModifiers);
	}

	// Value Calculator
	get extendedValue(): number {
		if (this.quantity <= 0) return 0;
		let value = this.adjustedValue;
		return floatingMul(value, this.quantity);
	}

	get adjustedWeightFast(): string {
		return this.adjustedWeight(false, "lb").toString() + " lb";
	}

	adjustedWeight(for_skills: boolean, units: WeightUnits): number {
		if (for_skills && this.system.ignore_weight_for_skills) return 0;
		return this.weightAdjustedForMods(units);
	}

	extendedWeight(for_skills: boolean, units: WeightUnits): number {
		return floatingMul(this.adjustedWeight(for_skills, units), this.quantity);
	}

	get extendedWeightFast(): string {
		return this.extendedWeight(false, "lb").toString() + " lb";
	}

	weightAdjustedForMods(units: WeightUnits): number {
		let percentages = 0;
		let w = this.weight;

		this.deepModifiers.forEach(mod => {
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

		w = processMultiplyAddWeightStep("to_base_weight", w, units, this.deepModifiers);

		w = processMultiplyAddWeightStep("to_final_base_weight", w, units, this.deepModifiers);

		w = processMultiplyAddWeightStep("to_final_weight", w, units, this.deepModifiers);

		return Math.max(w, 0);
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

export function processNonCFStep(costType: EquipmentCostType, value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
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

export function processMultiplyAddWeightStep(type: EquipmentWeightType, weight: number, units: WeightUnits, modifiers: Collection<EquipmentModifierGURPS>): number {
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
	readonly system: EquipmentData;
}
