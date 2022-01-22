import { ItemGURPS } from "../base";
import { SkillData } from "./data";

//@ts-ignore
export class SkillGURPS extends ItemGURPS {
	static get schema(): typeof SkillData {
		return SkillData;
	}
}

export interface SkillGURPS {
	readonly data: SkillData;
}
