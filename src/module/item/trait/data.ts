import { BaseContainerData, BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { CR, CRAdjustment, ObjArray, Weapon } from "@module/data";
import { Feature } from "@module/feature";
import { Prereq } from "@module/prereq";
import { TraitGURPS } from ".";

export type TraitSource = BaseContainerSource<"trait", TraitSystemData>;

export class TraitData extends BaseContainerData<TraitGURPS> {}

export interface TraitData extends Omit<TraitSource, "effects" | "flags" | "items"> {
	readonly type: TraitSource["type"];
	data: TraitSystemData;
	readonly _source: TraitSource;
}

export interface TraitSystemData extends Omit<BaseContainerSystemData, "open"> {
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
	features: Feature[];
	weapons: ObjArray<Weapon>;
	modifiers: Array<any>;
}
