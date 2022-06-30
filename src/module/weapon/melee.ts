import { BaseWeapon } from "./base";

class MeleeWeapon extends BaseWeapon {
	reach = "";
	parry = "";
	block = "";
}

interface MeleeWeapon extends BaseWeapon {
	reach: string;
	parry: string;
	block: string;
}

export { MeleeWeapon };
