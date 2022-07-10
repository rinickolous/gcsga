import { BaseWeapon, Weapon } from "@module/weapon";

export class WeaponItem {
	data: any;

	get weapons(): Weapon[] {
		const weapons: Weapon[] = [];
		for (const w of this.data.data.weapons) {
			weapons.push(new BaseWeapon(w));
		}
		return weapons;
	}
}
