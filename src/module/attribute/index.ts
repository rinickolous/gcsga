import { CharacterGURPS } from "@actor";
import { gid } from "@module/data";
import { sanitize } from "@util";
import { AttributeDef } from "./attribute_def";
import { PoolThreshold } from "./pool_threshold";

const reservedIds: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten];

export class Attribute {
	actor: CharacterGURPS;
	bonus = 0;
	cost_reduction = 0;
	order: number;
	attr_id: string;
	adj = 0;
	damage?: number;

	constructor(actor: CharacterGURPS, attr_id: string, order: number, data?: any) {
		if (data) Object.assign(this, data);
		this.actor = actor;
		this.attr_id = attr_id;
		this.order = order;
	}

	get id(): string {
		return this.attr_id;
	}
	set id(v: string) {
		this.attr_id = sanitize(v, false, reservedIds);
	}

	get attribute_def(): AttributeDef | any {
		return this.actor?.settings.attributes[this.attr_id];
	}

	get max(): number {
		const def = this.attribute_def;
		if (!def) return 0;
		let max = def.baseValue(this.actor) + this.adj + this.bonus;
		if (def.type != "decimal") {
			max = Math.floor(max);
		}
		return max;
	}
	set max(v: number) {
		if (this.max == v) return;
		const def = this.attribute_def;
		if (def) this.adj = v - (def.baseValue(this.actor) + this.bonus);
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
		if (def.thresholds)
			for (const t of def.thresholds) {
				if (cur <= t.threshold(max)) return t;
			}
		return null;
	}

	get points(): number {
		const def = this.attribute_def;
		if (!def) return 0;
		let sm = 0;
		if (this.actor) sm = this.actor.adjustedSizeModifier;
		return def.computeCost(this.actor, this.adj, this.cost_reduction, sm);
	}
}

export interface Attribute {
	actor: CharacterGURPS;
	bonus: number;
	cost_reduction: number;
	order: number;
	attr_id: string;
	adj: number;
	damage?: number;
	attribute_def: AttributeDef | any; // temporary any
}
