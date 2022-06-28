import { CharacterGURPS } from "@actor";
import { PoolThreshold } from "./pool_threshold";
import { gid } from "@module/gid";
import { AttributeDef, AttributeType } from "./attribute_def";
import { sanitize } from "@util";

const reserved_ids: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten];

export { AttributeDef, AttributeSettingDef } from "./attribute_def";

export class Attribute {
	character: CharacterGURPS;
	bonus = 0;
	cost_reduction = 0;
	order: number;
	attr_id: string;
	adj = 0;
	damage?: number;

	constructor(character: CharacterGURPS, attr_id: string, order: number, data?: any) {
		if (data) Object.assign(this, data);
		this.character = character;
		this.attr_id = attr_id;
		this.order = order;
	}

	get id(): string {
		return this.attr_id;
	}
	set id(v: string) {
		this.attr_id = sanitize(v, false, reserved_ids);
	}

	get attribute_def(): AttributeDef {
		return this.character?.settings.attributes[this.attr_id];
	}

	get max(): number {
		const def = this.attribute_def;
		if (!def) return 0;
		let max = def.baseValue(this.character) + this.adj + this.bonus;
		if (def.type != "decimal") {
			max = Math.floor(max);
		}
		return max;
	}
	set max(v: number) {
		if (this.max == v) return;
		const def = this.attribute_def;
		if (def) this.adj = v - (def.baseValue(this.character) + this.bonus);
	}

	get current(): number {
		const max = this.max;
		const def = this.attribute_def;
		if (!def || def.type != "pool") {
			return max;
		}
		return max - (this.damage ?? 0);
	}

	get current_threshold(): PoolThreshold | null {
		const def = this.attribute_def;
		if (!def) return null;
		const max = this.max;
		const cur = this.current;
		if (def.thresholds) for (const t of def.thresholds) {
			if (cur <= t.threshold(max)) return t;
		}
		return null;
	}

	get points(): number {
		const def = this.attribute_def;
		if (!def) return 0;
		let sm = 0;
		if (this.character) sm = this.character.adjusted_size_modifier;
		return def.computeCost(this.character, this.adj, this.cost_reduction, sm);
	}
}

export function resolveAttributeName(character: CharacterGURPS, attribute: string): string {
	const def = character.settings.attributes[attribute];
	if (def) return def.name;
	return attribute;
}

// export class Attribute {
// 	id: string;
// 	type: AttributeType;
// 	name: string;
// 	full_name: string;
// 	attribute_base: string;
// 	cost_per_point: number;
// 	cost_adj_percent_per_sm: number;
// 	thresholds?: PoolThreshold[];
//
// 	constructor(data: AttributeDef & AttributeSettingDef) {
// 		this.id = data.id;
// 		this.type = data.type;
// 		this.name = data.name;
// 		this.full_name = data.full_name;
// 		this.attribute_base = data.attribute_base;
// 		this.cost_per_point = data.cost_per_point;
// 		this.cost_adj_percent_per_sm = data.cost_adj_percent_per_sm;
// 		this.thresholds = data.thresholds;
// 	}
//
// 	get priamry() {
// 		return this.attribute_base == parseFloat(this.attribute_base).toString();
// 	}
//
// 	BaseValue(k: any): number {
// 		const vr = new VariableResolver(k);
// 		return evaluateToNumber(this.attribute_base, vr);
// 	}
// }
// export interface AttributeDef {
// 	attr_id: string;
// 	adj: number;
// 	damage?: number;
// 	calc: {
// 		value: number;
// 		current?: number;
// 		points: number;
// 	};
// }
//
// export interface AttributeSettingDef {
// 	id: string;
// 	type: AttributeType;
// 	name: string;
// 	full_name: string;
// 	attribute_base: string;
// 	cost_per_point: number;
// 	cost_adj_percent_per_sm: number;
// 	thresholds?: Array<PoolThreshold>;
// 	order: number;
// }
//
// export type AttributeType = "integer" | "decimal" | "pool";
//
// export type PoolThresholdOp = "halve_move" | "halve_dodge" | "halve_st";
//
// export interface PoolThreshold {
// 	state: string;
// 	explanation: string;
// 	multiplier: number;
// 	divisor: number;
// 	addition: number;
// 	ops: PoolThresholdOp[];
// }
