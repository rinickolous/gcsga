import { ItemGURPS } from "@item";
import { ContainerGURPS } from "../container";
import { TraitContainerData } from "./data";

//@ts-ignore
export class TraitContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitContainerData {
		return TraitContainerData;
	}

	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent?.type == "trait_container") enabled = enabled && (this.parent as ItemGURPS).enabled;
		return enabled;
	}

	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
