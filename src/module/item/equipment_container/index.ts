import { EquipmentModifierGURPS } from "@item";
import { ContainerGURPS } from "@item/container";
import {
	determineModCostValueTypeFromString,
	EquipmentGURPS,
	extendedWeightAdjustForMods,
	extractValue,
	weightAdjustedForMods,
} from "@item/equipment";
import { EquipmentCostType } from "@item/equipment_modifier/data";
import { WeightUnits } from "@module/data";
import { PrereqList } from "@module/prereq";
import { EquipmentContainerData } from "./data";

//@ts-ignore
export class EquipmentContainerGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof EquipmentContainerData {
		return EquipmentContainerData;
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

	get base_value(): number {
		return this.data.data.value;
	}

	get adjusted_value(): number {
		let cost = this.processNonCFStep("to_original_cost", this.base_value, this.modifiers);
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

		cost = this.processNonCFStep("to_final_base_cost", cost, this.modifiers);
		cost = this.processNonCFStep("to_final_cost", cost, this.modifiers);

		return Math.max(cost, 0);
	}

	get quantity(): number {
		return this.data.data.quantity;
	}

	get extended_value(): number {
		if (this.quantity == 0) return 0;
		let value = this.adjusted_value;
		for (const ch of this.children) {
			value += ch.extended_value;
		}
		return value * this.quantity;
	}

	get children(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		let m = this.items.filter((e) => !(e instanceof EquipmentModifierGURPS)) as Array<
			EquipmentGURPS | EquipmentContainerGURPS
		>;
		return new Collection<EquipmentGURPS | EquipmentContainerGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get modifiers(): Collection<EquipmentModifierGURPS> {
		let m = this.items.filter((e) => e instanceof EquipmentModifierGURPS) as EquipmentModifierGURPS[];
		return new Collection<EquipmentModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	processNonCFStep(
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
}

export interface EquipmentContainerGURPS {
	readonly data: EquipmentContainerData;
}
