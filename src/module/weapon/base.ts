import { DiceGURPS } from "@module/dice";
import { SkillDefault } from "@module/skill-default";
import { WeaponType } from ".";

class BaseWeapon {
	type: WeaponType = "melee_weapon";
	damage = new WeaponDamage();
	strength = "";
	usage = "";
	usage_notes = "";
	defaults: SkillDefault[] = [];

	constructor(data?: BaseWeapon | any) {
		if (data) Object.assign(this, data);
	}
}

interface BaseWeapon {
	type: WeaponType;
	damage: WeaponDamage;
	strength: string;
	usage: string;
	usage_notes: string;
	reach: string;
	parry: string;
	block: string;
	accuracy: string;
	range: string;
	rate_of_fire: string;
	shots: string;
	bulk: string;
	recoil: string;
	defaults: SkillDefault[];
}

export { BaseWeapon };

export class WeaponDamage {
	type = "";
	st: StrengthDamage = "none";
	base = new DiceGURPS();
	armor_divisor = 1;
	fragmentation = new DiceGURPS();
	fragmentation_armor_divisor = 1;
	fragmentation_type = "";
	modifier_per_die = 0;
}

export interface WeaponDamage {
	type: string;
	st: StrengthDamage;
	base: DiceGURPS;
	armor_divisor: number;
	fragmentation: DiceGURPS;
	fragmentation_armor_divisor: number;
	fragmentation_type: string;
	modifier_per_die: number;
}

export type StrengthDamage = "none" | "thr" | "thr_leveled" | "sw" | "sw_leveled";
