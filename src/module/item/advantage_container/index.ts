import { ContainerGURPS } from "../container";
import { AdvantageContainerData } from "./data";

//@ts-ignore
export class AdvantageContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof AdvantageContainerData {
		return AdvantageContainerData;
	}
}

export interface AdvantageContainerGURPS {
	readonly data: AdvantageContainerData;
}
