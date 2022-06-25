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
}

export interface TraitModifierGURPS {
	readonly data: TraitModifierData;
}
