import { ItemGURPS } from "@item/base";
import { SpellData } from "./data";

//@ts-ignore
export class SpellGURPS extends ItemGURPS {
	points?: number;
	static get schema(): typeof SpellData {
		return SpellData;
	}
}

export interface SpellGURPS {
	readonly data: SpellData;
}
