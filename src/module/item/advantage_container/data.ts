import { AdvantageModifierGURPS } from "@item";
import { BaseContainerData, BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { CR, CRAdjustment } from "@module/data";
import { AdvantageContainerGURPS } from ".";

export type AdvantageContainerSource = BaseContainerSource<"advantage_container", AdvantageContainerSystemData>;

export class AdvantageContainerData extends BaseContainerData<AdvantageContainerGURPS> {}

export interface AdvantageContainerData extends Omit<AdvantageContainerSource, "effects" | "flags" | "items"> {
	readonly type: AdvantageContainerSource["type"];
	data: AdvantageContainerSystemData;
	readonly _source: AdvantageContainerSource;
}

export interface AdvantageContainerSystemData extends BaseContainerSystemData {
	modifiers: Array<any>;
	container_type: AdvantageContainerType;
	calc: {
		points: number;
	};
	cr: CR;
	cr_adj: CRAdjustment;
}

export type AdvantageContainerType = "group" | "meta_trait" | "race" | "alternative_abilities";
