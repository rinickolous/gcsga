import { ContainerGURPS } from "@item/container";
import { SkillGURPS } from "@item/skill";
import { TechniqueGURPS } from "@item/technique";
import { SkillContainerData } from "./data";

export class SkillContainerGURPS extends ContainerGURPS {
	// static override get schema(): typeof SkillContainerData {
	// 	return SkillContainerData;
	// }

	// Embedded Items
	get children(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		const children: Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> = new Collection();
		this.items.forEach(item => {
			if (item instanceof SkillGURPS || item instanceof TechniqueGURPS || item instanceof SkillContainerGURPS) children.set(item.id!, item);
		});
		return children;
	}
}

export interface SkillContainerGURPS {
	readonly system: SkillContainerData;
}
