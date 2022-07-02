import { ContainerGURPS } from "@item/container";
import { RitualMagicSpellGURPS } from "@item/ritual_magic_spell";
import { SpellGURPS } from "@item/spell";
import { SpellContainerData } from "./data";

export class SpellContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof SpellContainerData {
		return SpellContainerData;
	}

	// Embedded Items
	get children(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.items
				.filter(
					(item) =>
						item instanceof SpellGURPS ||
						item instanceof RitualMagicSpellGURPS ||
						item instanceof SpellContainerGURPS,
				)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}
}

export interface SpellContainerGURPS {
	readonly data: SpellContainerData;
}
