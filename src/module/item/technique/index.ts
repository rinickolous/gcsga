import { ItemGURPS } from "@item/base";
import { TechniqueData } from "./data";

//@ts-ignore
export class TechniqueGURPS extends ItemGURPS {
	static get schema(): typeof TechniqueData {
		return TechniqueData;
	}
}

export interface TechniqueGURPS {
	readonly data: TechniqueData;
}
