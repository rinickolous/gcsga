import { BaseContainerData, BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { ObjArray, Weapon } from "@module/data";
import { Feature } from "@module/feature";
import { Prereq } from "@module/prereq";
import { EquipmentContainerGURPS } from ".";

export type EquipmentContainerSource = BaseContainerSource<"equipment_container", EquipmentContainerSystemData>;

export class EquipmentContainerData extends BaseContainerData<EquipmentContainerGURPS> {}

export interface EquipmentContainerData extends Omit<EquipmentContainerSource, "effects" | "flags" | "items"> {
	readonly type: EquipmentContainerSource["type"];
	data: EquipmentContainerSystemData;

	readonly _source: EquipmentContainerSource;
}

export interface EquipmentContainerSystemData extends BaseContainerSystemData {
	description: string;
	prereqs: Prereq;
	equipped: boolean;
	quantity: number;
	tech_level: string;
	legality_class: string;
	value: number;
	ignore_weight_for_skills: boolean;
	weight: string;
	uses: number;
	max_uses: number;
	weapons: ObjArray<Weapon>;
	features: Feature[];
	calc: {
		extended_value: string;
		extended_weight: string;
		extended_weight_for_skills: string;
	};
	modifiers: Array<any>;
	other: boolean;
}
