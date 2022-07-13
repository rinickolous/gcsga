import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataGURPS, ItemGURPS, ItemType } from "@item/data";
import { ContainerGURPS } from "@item/container";
import { CharacterGURPS } from "@actor/character";
import { BaseWeapon, Weapon } from "@module/weapon";
import { Feature } from "@feature";

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gcsga?: {
		ready?: boolean;
	};
}

class BaseItemGURPS extends Item {
	//@ts-ignore
	parent: CharacterGURPS | ContainerGURPS | null;

	constructor(data: ItemDataGURPS | any, context: Context<Actor> & ItemConstructionContextGURPS = {}) {
		if (context.gcsga?.ready) {
			super(data, context);
		} else {
			mergeObject(context, {
				gcsga: {
					ready: true,
				},
			});
			const ItemConstructor = (CONFIG as any).GURPS.Item.documentClasses[data.type as ItemType];
			return ItemConstructor ? new ItemConstructor(data, context) : new BaseItemGURPS(data, context);
		}
	}

	get actor(): CharacterGURPS | null {
		if (this.parent) return this.parent instanceof CharacterGURPS ? this.parent : this.parent.actor;
		return null;
	}

	get enabled(): boolean {
		return true;
	}

	get tags(): string[] {
		return this.data.data.tags;
	}

	get notes(): string {
		return this.data.data.notes;
	}

	get reference(): string {
		return this.data.data.reference;
	}

	get features(): Feature[] {
		return [];
	}

	get weapons(): Map<number, Weapon> {
		if (
			[
				"modifier",
				"trait_container",
				"skill_container",
				"spell_container",
				"eqp_modifier",
				"note",
				"note_container",
			].includes(this.type)
		)
			return new Map();
		const weapons: Map<number, Weapon> = new Map();
		((this as any).data.data.weapons ?? []).forEach((w: Weapon, index: number) => {
			weapons.set(index, new BaseWeapon({ ...w, ...{ parent: this, actor: this.actor, id: index } }));
		});
		return weapons;
	}

	get parents(): Array<any> {
		if (!this.parent) return [];
		const grandparents = !(this.parent instanceof CharacterGURPS) ? this.parent.parents : [];
		return [this.parent, ...grandparents];
	}

	get parentCount(): number {
		let i = 0;
		let p: any = this.parent;
		while (p) {
			i++;
			p = p.parent;
		}
		return i;
	}

	sameSection(compare: ItemGURPS): boolean {
		const traits = ["trait", "trait_container"];
		const skills = ["skill", "technique", "skill_container"];
		const spells = ["spell", "ritual_magic_spell", "spell_container"];
		const equipment = ["equipment", "equipment_container"];
		const notes = ["note", "note_container"];
		const sections = [traits, skills, spells, equipment, notes];
		for (const i of sections) {
			if (i.includes(this.data.type) && i.includes(compare.data.type)) return true;
		}
		return false;
	}
}

//@ts-ignore
interface BaseItemGURPS extends Item {
	parent: CharacterGURPS | ContainerGURPS | null;
	readonly data: ItemDataGURPS;
}

export { BaseItemGURPS };
