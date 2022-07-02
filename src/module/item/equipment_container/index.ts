import { ContainedWeightReduction } from "@feature/contained_weight_reduction";
import { ContainerGURPS } from "@item/container";
import { EquipmentGURPS, processMultiplyAddWeightStep, valueAdjustedForModifiers } from "@item/equipment";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { WeightUnits } from "@module/data";
import { PrereqList } from "@prereq/prereq_list";
import { determineModWeightValueTypeFromString, extractFraction } from "@util";
import { EquipmentContainerData } from "./data";

export class EquipmentContainerGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof EquipmentContainerData {
		return EquipmentContainerData;
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
	get children(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		const children: Collection<EquipmentGURPS | EquipmentContainerGURPS> = new Collection();
		this.items.forEach(item => {
			if (item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)
				children.set(item.data._id!, item);
		});
		return children;
	}
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
		this.children.forEach(ch => {
			value += ch.extendedValue;
		});
		return value * this.quantity;
	}

	adjustedWeight(for_skills: boolean, units: WeightUnits): number {
		if (for_skills && this.data.data.ignore_weight_for_skills) return 0;
		return this.weightAdjustedForMods(units);
	}

	get adjustedWeightFast(): string {
		return this.adjustedWeight(false, "lb").toString() + " lb";
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

	extendedWeight(for_skills: boolean, units: WeightUnits): number {
		return this.extendedWeightAdjustForMods(units, for_skills);
	}

	get extendedWeightFast(): string {
		return this.extendedWeight(false, "lb").toString() + " lb";
	}

	extendedWeightAdjustForMods(units: WeightUnits, for_skills: boolean): number {
		if (this.quantity <= 0) return 0;
		let base = 0;
		if (!for_skills || !this.data.data.ignore_weight_for_skills) base = this.weightAdjustedForMods(units);
		if (this.children && this.children.entries.length != 0) {
			let contained = 0;
			this.children?.forEach(ch => {
				contained += ch.extendedWeight(for_skills, units);
			});
			let percentage = 0;
			let reduction = 0;
			for (const f of this.features) {
				if (f instanceof ContainedWeightReduction) {
					if (f.is_percentage_reduction) percentage += parseFloat(f.reduction);
					else reduction += parseFloat(f.reduction);
				}
			}
			this.modifiers.forEach(mod => {
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
		return base * this.quantity;
	}
}

export interface EquipmentContainerGURPS {
	readonly data: EquipmentContainerData;
}
