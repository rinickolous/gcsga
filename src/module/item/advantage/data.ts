import { BaseContainerData, BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { CR, CRAdjustment, Feature, ObjArray, Prereq, Weapon } from "@module/data";
import { AdvantageGURPS } from ".";

export type AdvantageSource = BaseContainerSource<"advantage", AdvantageSystemData>;

export class AdvantageData extends BaseContainerData<AdvantageGURPS> {}

export interface AdvantageData extends Omit<AdvantageSource, "effects" | "flags" | "items"> {
	readonly type: AdvantageSource["type"];
	data: AdvantageSystemData;
	readonly _source: AdvantageSource;
}

export interface AdvantageSystemData extends Omit<BaseContainerSystemData, "open"> {
	prereqs: Prereq;
	round_down: boolean;
	allow_half_levels: boolean;
	disabled: boolean;
	mental: boolean;
	physical: boolean;
	social: boolean;
	exotic: boolean;
	supernatural: boolean;
	levels: string;
	base_points: number;
	points_per_level: number;
	calc: {
		points: number;
	};
	cr: CR;
	cr_adj: CRAdjustment;
	features: ObjArray<Feature>;
	weapons: ObjArray<Weapon>;
	modifiers: Array<any>;
}
