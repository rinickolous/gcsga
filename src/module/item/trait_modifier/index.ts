import { BaseItemGURPS } from "@item/base";
import { TraitModifierAffects, TraitModifierCostType, TraitModifierData } from "./data";

export class TraitModifierGURPS extends BaseItemGURPS {
	// static get schema(): typeof TraitModifierData {
	// 	return TraitModifierData;
	// }

	// Getters
	get levels(): number {
		return this.system.levels;
	}

	get features() {
		return this.system.features;
	}

	get costDescription() {
		return this.system.cost;
	}

	get enabled(): boolean {
		return !this.system.disabled;
	}

	get costType(): TraitModifierCostType {
		return this.system.cost_type;
	}

	get affects(): TraitModifierAffects {
		return this.system.affects;
	}

	get cost(): number {
		return this.system.cost;
	}

	get costModifier(): number {
		if (this.levels > 0) return this.cost * this.levels;
		return this.cost;
	}

	get fullDescription(): string {
		let d = "";
		d += this.name;
		if (this.notes) d += ` (${this.notes})`;
		if (this.actor && this.actor.settings.show_trait_modifier_adj) d += ` [${this.costDescription}]`;
		return d;
	}
}
export interface TraitModifierGURPS {
	readonly system: TraitModifierData;
}
