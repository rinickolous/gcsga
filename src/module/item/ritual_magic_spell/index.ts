import { ItemGURPS } from "@item/base";
import { RitualMagicSpellData } from "./data";

//@ts-ignore
export class RitualMagicSpellGURPS extends ItemGURPS {
	static get schema(): typeof RitualMagicSpellData {
		return RitualMagicSpellData;
	}
}

export interface RitualMagicSpellGURPS {
	readonly data: RitualMagicSpellData;
}
