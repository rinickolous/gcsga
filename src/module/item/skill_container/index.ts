import { ContainerGURPS } from "@item/container";
import { SkillGURPS } from "@item/skill";
import { TechniqueGURPS } from "@item/technique";
import { SkillContainerData } from "./data";

export class SkillContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof SkillContainerData {
		return SkillContainerData;
	}

	// Embedded Items
	get children(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.items
				.filter(
					(item) =>
						item instanceof SkillGURPS ||
						item instanceof TechniqueGURPS ||
						item instanceof SkillContainerGURPS,
				)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}
}

export interface SkillContainerGURPS {
	readonly data: SkillContainerData;
}
