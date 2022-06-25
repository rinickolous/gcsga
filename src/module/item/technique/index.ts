import { ItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { TechniqueData } from "./data";

//@ts-ignore
export class TechniqueGURPS extends ItemGURPS {
	points?: number;
	level?: SkillLevel;

	static get schema(): typeof TechniqueData {
		return TechniqueData;
	}
}

export interface TechniqueGURPS {
	readonly data: TechniqueData;
}
