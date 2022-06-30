import { ContainerGURPS } from "@item/container";
import { SpellContainerData } from "./data";

export class SpellContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof SpellContainerData {
		return SpellContainerData;
	}
}

export interface SpellContainerGURPS {
	readonly data: SpellContainerData;
}
