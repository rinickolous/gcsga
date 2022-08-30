import { ContainerGURPS } from "@item/container";
import { TraitModifierGURPS } from "@item/trait_modifier";
import { TechniqueGURPS } from "@item/technique";
import { TraitModifierContainerData } from "./data";

export class TraitModifierContainerGURPS extends ContainerGURPS {
	// Embedded Items
	get children(): Collection<
		TraitModifierGURPS | TechniqueGURPS | TraitModifierContainerGURPS
	> {
		const children: Collection<
			TraitModifierGURPS | TechniqueGURPS | TraitModifierContainerGURPS
		> = new Collection();
		this.items.forEach(item => {
			if (
				item instanceof TraitModifierGURPS ||
				item instanceof TechniqueGURPS ||
				item instanceof TraitModifierContainerGURPS
			)
				children.set(item.id!, item);
		});
		return children;
	}
}

export interface TraitModifierContainerGURPS {
	readonly system: TraitModifierContainerData;
}
