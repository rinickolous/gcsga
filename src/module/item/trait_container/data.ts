import { BaseContainerData, BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { CR, CRAdjustment } from "@module/data";
import { TraitContainerGURPS } from ".";

export type TraitContainerSource = BaseContainerSource<"trait_container", TraitContainerSystemData>;

export class TraitContainerData extends BaseContainerData<TraitContainerGURPS> {}

export interface TraitContainerData extends Omit<TraitContainerSource, "effects" | "flags" | "items"> {
	readonly type: TraitContainerSource["type"];
	data: TraitContainerSystemData;
	readonly _source: TraitContainerSource;
}

export interface TraitContainerSystemData extends BaseContainerSystemData {
	// modifiers: Array<any>;
	disabled: boolean;
	container_type: TraitContainerType;
	// calc: {
	// 	points: number;
	// };
	cr: number;
	cr_adj: CRAdjustment;
}

export type TraitContainerType = "group" | "meta_trait" | "race" | "alternative_abilities";
