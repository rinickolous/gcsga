import { BaseWeapon } from "./base";

class RangedWeapon extends BaseWeapon {
	accuracy = "";
	range = "";
	rate_of_fire = "";
	shots = "";
	bulk = "";
	recoil = "";
}

interface RangedWeapon extends BaseWeapon {
	accuracy: string;
	range: string;
	rate_of_fire: string;
	shots: string;
	bulk: string;
	recoil: string;
}

export { RangedWeapon };
