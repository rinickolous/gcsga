import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { SkillContainerGURPS } from ".";

export type SkillContainerSource = BaseContainerSource<"skill_container", SkillContainerSystemData>;

// export class SkillContainerData extends BaseContainerData<SkillContainerGURPS> {}

export interface SkillContainerData
	extends Omit<SkillContainerSource, "effects" | "flags" | "items">,
		SkillContainerSystemData {
	readonly type: SkillContainerSource["type"];
	data: SkillContainerSystemData;
	readonly _source: SkillContainerSource;
}

export type SkillContainerSystemData = BaseContainerSystemData;
