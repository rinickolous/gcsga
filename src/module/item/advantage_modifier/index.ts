import { ItemGURPS } from "../base";
import { AdvantageModifierData } from "./data";

//@ts-ignore
export class AdvantageModifierGURPS extends ItemGURPS {
	static get schema(): typeof AdvantageModifierData {
		return AdvantageModifierData;
	}
}

export interface AdvantageModifierGURPS {
	readonly data: AdvantageModifierData;
}
