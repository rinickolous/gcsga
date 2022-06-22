import { ItemGURPS } from "@item";
import { ContainerGURPS } from "../container";
import { TraitData } from "./data";

//@ts-ignore
export class TraitGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitData {
		return TraitData;
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

	get levels(): number {
		return parseFloat(this.data.data.levels);
	}
}

export interface TraitGURPS {
	readonly data: TraitData;
}
