import { EquipmentModifierGURPS } from "@item";
import { ContainerGURPS } from "@item/container";
import { EquipmentWeightType } from "@item/equipment_modifier/data";
import { WeightUnits } from "@module/data";
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

	get weight(): number {
		return parseFloat(this.data.data.weight);
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	// Embedded Items
	get modifiers(): Collection<EquipmentModifierGURPS> {
		//@ts-ignore
		return new Collection(
			this.items
				.filter((item) => item instanceof EquipmentModifierGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	// Value Calculator
	adjustedWeight(for_skills: boolean, units: WeightUnits): number {
		if (for_skills && this.data.data.ignore_weight_for_skills) return 0;
		return this.weightAdjustedForMods(units);
	}

	extendedWeight(for_skills: boolean, units: WeightUnits): number {
		return this.adjustedWeight(for_skills, units);
	}

	weightAdjustedForMods(units: WeightUnits): number {
		let percentages = 0;
		let w = this.weight;

		this.modifiers.forEach((mod) => {
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

export function processMultiplyAddWeightStep(
	type: EquipmentWeightType,
	weight: number,
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let sum = 0;
	modifiers.forEach((mod) => {
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
