import { ContainerGURPS } from "../container";
import { AdvantageData } from "./data";

//@ts-ignore
export class AdvantageGURPS extends ContainerGURPS {
	static override get schema(): typeof AdvantageData {
		return AdvantageData;
	}
}

export interface AdvantageGURPS {
	readonly data: AdvantageData;
}
