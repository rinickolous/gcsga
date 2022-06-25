import { ItemGURPS } from "@item/base";
import { RitualMagicSpellData } from "./data";

//@ts-ignore
export class RitualMagicSpellGURPS extends ItemGURPS {
	points?: number;
	static get schema(): typeof RitualMagicSpellData {
		return RitualMagicSpellData;
	}
}

export interface RitualMagicSpellGURPS {
	readonly data: RitualMagicSpellData;
}
