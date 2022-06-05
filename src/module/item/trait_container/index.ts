import { ContainerGURPS } from "../container";
import { TraitContainerData } from "./data";

//@ts-ignore
export class TraitContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitContainerData {
		return TraitContainerData;
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
