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
}

export interface TraitGURPS {
	readonly data: TraitData;
}
