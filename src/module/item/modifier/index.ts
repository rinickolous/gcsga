import { ItemGURPS } from "../base";
import { TraitModifierData } from "./data";

//@ts-ignore
export class TraitModifierGURPS extends ItemGURPS {
	static get schema(): typeof TraitModifierData {
		return TraitModifierData;
	}
}

export interface TraitModifierGURPS {
	readonly data: TraitModifierData;
}
