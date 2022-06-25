import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { EquipmentCostType } from "@item/equipment_modifier/data";
import { EquipmentData } from "./data";

//@ts-ignore
export class EquipmentGURPS extends ContainerGURPS {
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

	get extended_value(): number {
		if (this.quantity == 0) return 0;
		let value = this.adjusted_value;
		return value * this.quantity;
	}

	get modifiers(): Collection<EquipmentModifierGURPS> {
		let m = this.items.filter(e => e instanceof EquipmentModifierGURPS) as EquipmentModifierGURPS[];
		return new Collection<EquipmentModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	processNonCFStep(cost_type: EquipmentCostType, value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
		let cost = value;
		let percentages = 0;
		let additions = 0;
		modifiers.forEach(mod => {
			if (mod.cost_type == cost_type) {
				let t = determineModCostValueTypeFromString(mod.cost_amount);
				let amt = extractValue(mod.cost_amount);
				if (t == "addition") additions += amt;
				if (t == "percentage") percentages += amt;
				if (t == "multiplier") cost *= amt;
			}
		});
		cost += additions;
		if (percentages != 0) cost += value * percentages / 100;

		return cost;
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
	while ((start == last && ["+","-"].includes(ch)) || (!decimal && ch == ".") || ch.match("[0-9]")) {
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

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
