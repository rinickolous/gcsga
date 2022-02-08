import { ContainerGURPS } from "../container";
import { AdvantageData } from "./data";

//@ts-ignore
export class AdvantageGURPS extends ContainerGURPS {
	static override get schema(): typeof AdvantageData {
		return AdvantageData;
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

export interface AdvantageGURPS {
	readonly data: AdvantageData;
}
