import { EquipmentContainerGURPS } from "@item";
import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { EquipmentCostType, EquipmentWeightType } from "@item/equipment_modifier/data";
import { WeightUnits } from "@module/data";
import { ContainedWeightReduction, Feature } from "@module/feature";
import { PrereqList } from "@module/prereq";
import { EquipmentData } from "./data";

//@ts-ignore
export class EquipmentGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof EquipmentData {
		return EquipmentData;
	}

	get enabled(): boolean {
		if (!this.data.data.equipped || this.data.data.other) return false;
		return true;
	}
	set enabled(enabled: boolean) {
		this.data.data.equipped = enabled;
	}
	get equipped(): boolean {
		return this.enabled;
	}
	set equipped(enabled: boolean) {
		this.data.data.equipped = enabled;
	}

	get quantity(): number {
		return this.data.data.quantity;
	}

	get base_value(): number {
		return this.data.data.value;
	}

	get base_weight(): number {
		return parseFloat(this.data.data.weight);
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	adjusted_weight(for_skills: boolean, units: WeightUnits): number {
		if (for_skills && this.data.data.ignore_weight_for_skills) return 0;
		return weightAdjustedForMods(this.base_weight, this.modifiers, units);
	}

	extended_weight(for_skills: boolean, units: WeightUnits): number {
		return extendedWeightAdjustForMods(
			units,
			this.quantity,
			this.base_weight,
			this.modifiers,
			this.features,
			null,
			for_skills,
			this.data.data.ignore_weight_for_skills,
		);
	}

	get adjusted_value(): number {
		let cost = processNonCFStep("to_original_cost", this.base_value, this.modifiers);
		let cf = 0;
		for (const mod of this.modifiers) {
			if (mod.cost_type == "to_base_cost") {
				let t = determineModCostValueTypeFromString(mod.cost_amount);
				cf += extractValue(mod.cost_amount);
				if (t == "multiplier") cf -= 1;
			}
		}
		if (cf != 0) {
			cf = Math.max(cf, -0.8);
			cost *= Math.max(cf, -0.8) + 1;
		}

		cost = processNonCFStep("to_final_base_cost", cost, this.modifiers);
		cost = processNonCFStep("to_final_cost", cost, this.modifiers);

		return Math.max(cost, 0);
	}

	get extended_value(): number {
		if (this.quantity == 0) return 0;
		let value = this.adjusted_value;
		return value * this.quantity;
	}

	get modifiers(): Collection<EquipmentModifierGURPS> {
		let m = this.items.filter((e) => e instanceof EquipmentModifierGURPS) as EquipmentModifierGURPS[];
		return new Collection<EquipmentModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}
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

export function processNonCFStep(
	cost_type: EquipmentCostType,
	value: number,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let cost = value;
	let percentages = 0;
	let additions = 0;
	modifiers.forEach((mod) => {
		if (mod.cost_type == cost_type) {
			let t = determineModCostValueTypeFromString(mod.cost_amount);
			let amt = extractValue(mod.cost_amount);
			if (t == "addition") additions += amt;
			if (t == "percentage") percentages += amt;
			if (t == "multiplier") cost *= amt;
		}
	});
	cost += additions;
	if (percentages != 0) cost += (value * percentages) / 100;

	return cost;
}

export function processMultiplyAddWeightStep(
	type: EquipmentWeightType,
	weight: number,
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let sum = 0;
	modifiers.forEach((mod) => {
		if (mod.weight_type == type) {
			let t = determineModWeightValueTypeFromString(mod.weight_amount);
			let f = extractFraction(mod.weight_amount);
			if (t == "weight_addition") sum += parseFloat(mod.weight_amount);
			else if (t == "weight_percentage_multiplier") weight = (weight * f.numerator) / (f.denominator * 100);
			else if (t == "weight_multiplier") weight = (weight * f.numerator) / f.denominator;
		}
	});
	return weight + sum;
}

type WeightValueType =
	| "weight_addition"
	| "weight_percentage_addition"
	| "weight_percentage_multiplier"
	| "weight_multiplier";

export function determineModWeightValueTypeFromString(s: string): WeightValueType {
	s = s.toLowerCase().trim();
	if (s.endsWith("%")) {
		if (s.startsWith("x")) return "weight_percentage_multiplier";
		return "weight_percentage_addition";
	} else if (s.endsWith("x") || s.startsWith("x")) return "weight_multiplier";
	return "weight_addition";
}

export function extractFraction(s: string): Fraction {
	let v = s.trim();
	while (v.length > 0 && v[-1].match("[0-9]")) {
		v = v.substring(0, v.length - 1);
	}
	let f = v.split("/");
	let fraction: Fraction = { numerator: parseInt(f[0]) || 0, denominator: parseInt(f[1]) || 1 };
	let revised = determineModWeightValueTypeFromString(s);
	if (revised == "weight_percentage_multiplier") {
		if (fraction.numerator <= 0) {
			fraction.numerator = 100;
			fraction.denominator = 1;
		}
	} else if (revised == "weight_multiplier") {
		if (fraction.numerator <= 0) {
			fraction.numerator = 1;
			fraction.denominator = 1;
		}
	}
	return fraction;
}

export function weightAdjustedForMods(
	weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	units: WeightUnits,
): number {
	let percentages = 0;
	let w = weight;

	modifiers.forEach((mod) => {
		if (mod.weight_type == "to_original_weight") {
			let t = determineModWeightValueTypeFromString(mod.weight_amount);
			let f = extractFraction(mod.weight_amount);
			let amt = f.numerator / f.denominator;
			if (t == "weight_addition") {
				w = w + amt;
			} else {
				percentages += amt;
			}
		}
	});
	if (percentages != 0) w += (weight * percentages) / 100;

	w = processMultiplyAddWeightStep("to_base_weight", w, units, modifiers);

	w = processMultiplyAddWeightStep("to_final_base_weight", w, units, modifiers);

	w = processMultiplyAddWeightStep("to_final_weight", w, units, modifiers);

	return w;
}

export function extendedWeightAdjustForMods(
	units: WeightUnits,
	quantity: number,
	base_weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	features: Feature[],
	children: Collection<EquipmentGURPS | EquipmentContainerGURPS> | null,
	for_skills: boolean,
	weight_ignored: boolean,
): number {
	if (quantity <= 0) return 0;
	let base = 0;
	if (!for_skills || !weight_ignored) base = weightAdjustedForMods(base_weight, modifiers, units);
	if (children && children.entries.length != 0) {
		let contained = 0;
		children?.forEach((ch) => {
			contained += ch.extended_weight(for_skills, units);
		});
		let percentage = 0;
		let reduction = 0;
		for (const f of features) {
			if (f instanceof ContainedWeightReduction) {
				if (f.is_percentage_reduction) percentage += parseFloat(f.reduction);
				else reduction += parseFloat(f.reduction);
			}
		}
		modifiers.forEach((mod) => {
			for (const f of mod.features) {
				if (f instanceof ContainedWeightReduction) {
					if (f.is_percentage_reduction) percentage += parseFloat(f.reduction);
					else reduction += parseFloat(f.reduction);
				}
			}
		});
		if (percentage >= 100) contained = 0;
		else if (percentage > 0) contained -= (contained * percentage) / 100;
		base += Math.max(contained - reduction, 0);
	}
	return base * quantity;
}

export interface Fraction {
	numerator: number;
	denominator: number;
}

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
