import { ContainerGURPS } from "@item/container";
import { RitualMagicSpellGURPS } from "@item/ritual_magic_spell";
import { SpellGURPS } from "@item/spell";
import { SpellContainerData } from "./data";

export class SpellContainerGURPS extends ContainerGURPS {
	// static override get schema(): typeof SpellContainerData {
	// 	return SpellContainerData;
	// }

	// Embedded Items
	get children(): Collection<
		SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS
	> {
		const children: Collection<
			SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS
		> = new Collection();
		this.items.forEach(item => {
			if (
				item instanceof SpellGURPS ||
				item instanceof RitualMagicSpellGURPS ||
				item instanceof SpellContainerGURPS
			)
				children.set(item.id!, item);
		});
		return children;
	}
}

export interface SpellContainerGURPS {
	readonly system: SpellContainerData;
}
