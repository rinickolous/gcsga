import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { SpellContainerGURPS } from ".";

export type SpellContainerSource = BaseContainerSource<"spell_container", SpellContainerSystemData>;

// export class SpellContainerData extends BaseContainerData<SpellContainerGURPS> {}

export interface SpellContainerData
	extends Omit<SpellContainerSource, "effects" | "flags" | "items">,
		SpellContainerSystemData {
	readonly type: SpellContainerSource["type"];
	data: SpellContainerSystemData;

	readonly _source: SpellContainerSource;
}

export type SpellContainerSystemData = BaseContainerSystemData;
