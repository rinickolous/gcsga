import { BaseItemGURPS } from "@item/base";
import { TraitModifierData } from "./data";

export class TraitModifierGURPS extends BaseItemGURPS {
	static get schema(): typeof TraitModifierData {
		return TraitModifierData;
	}

	// Getters
	get levels(): number {
		return this.data.data.levels;
	}

	get features() {
		return this.data.data.features;
	}

	get cost_description() {
		return this.data.data.cost;
	}

	get full_description(): string {
		let d = "";
		d += this.name;
		if (this.notes) d += ` (${this.notes})`;
		if (this.actor && this.actor.settings.show_trait_modifier_adj) d += ` [${this.cost_description}]`;
		return d;
	}
}

export interface TraitModifierGURPS {
	readonly data: TraitModifierData;
}
