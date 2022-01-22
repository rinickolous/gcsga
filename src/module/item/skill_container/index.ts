import { ContainerGURPS } from "@item/container";
import { SkillContainerData } from "./data";

//@ts-ignore
export class SkillContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof SkillContainerData {
		return SkillContainerData;
	}
}

export interface SkillContainerGURPS {
	readonly data: SkillContainerData;
}
