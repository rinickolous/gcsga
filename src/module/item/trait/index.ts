import { ItemGURPS } from "@item";
import { ContainerGURPS } from "../container";
import { TraitData } from "./data";

//@ts-ignore
export class TraitGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitData {
		return TraitData;
	}

	isLeveled(): boolean {
		//@ts-ignore
		const levels = this.getData().levels;
		return levels >= 0 && levels != "";
	}

	getLevels(): number {
		//@ts-ignore
		return parseFloat(this.getData().levels);
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

export interface TraitGURPS {
	readonly data: TraitData;
}
