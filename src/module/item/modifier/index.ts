import { ItemGURPS } from "../base";
import { TraitModifierData } from "./data";

//@ts-ignore
export class TraitModifierGURPS extends ItemGURPS {
	static get schema(): typeof TraitModifierData {
		return TraitModifierData;
	}

	get levels(): number {
		return this.data.data.levels;
	}

	get cost_description() {
		return this.data.data.cost;
	}

	get full_description(): string {
		let d = "";
		d += this.name;
		if (this.notes) d += ` (${this.notes})`;
		if (this.character && this.character.settings.show_trait_modifier_adj) d += ` [${this.cost_description}]`;
		return d;
	}
}

export interface TraitModifierGURPS {
	readonly data: TraitModifierData;
}
