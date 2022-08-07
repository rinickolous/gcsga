import { Context, DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataGURPS, ItemFlagsGURPS, ItemGURPS, ItemType } from "@item/data";
import { ContainerGURPS } from "@item/container";
import { CharacterGURPS } from "@actor/character";
import { BaseWeapon, Weapon } from "@module/weapon";
import { Feature } from "@feature";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import { BaseItemDataGURPS, BaseItemSourceGURPS } from "./data";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";

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

	protected async _preCreate(data: ItemDataGURPS, options: DocumentModificationOptions, user: BaseUser): Promise<void> {
		//@ts-ignore
		if (this._source.img === foundry.documents.BaseItem.DEFAULT_ICON) this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`;
		await super._preCreate(data, options, user);
	}

	override async update(data?: DeepPartial<ItemDataConstructorData | (ItemDataConstructorData & Record<string, unknown>)>, context?: DocumentModificationContext & foundry.utils.MergeObjectOptions): Promise<this | undefined> {
		console.log(data);
		if (this.parent instanceof BaseItemGURPS) {
			data = foundry.utils.expandObject(data as any);
			data!._id = this.id;
			await this.parent?.updateEmbeddedDocuments("Item", [data!]);
			this.render(false, { action: "update", data: data } as any);
			return this;
		} else return super.update(data, context);
	}

	// Should not be necessary
	override prepareBaseData(): void {
		mergeObject(this.system, this._source.system);
		mergeObject(this.flags, this._source.flags);
	}

	get actor(): CharacterGURPS | null {
		if (this.parent) return this.parent instanceof CharacterGURPS ? this.parent : this.parent.actor;
		return null;
	}

	get enabled(): boolean {
		return true;
	}

	get tags(): string[] {
		return this.system.tags;
	}

	get notes(): string {
		return this.system.notes;
	}

	get reference(): string {
		return this.system.reference;
	}

	get features(): Feature[] {
		return [];
	}

	get weapons(): Map<number, Weapon> {
		if (["modifier", "trait_container", "skill_container", "spell_container", "eqp_modifier", "note", "note_container"].includes(this.type)) return new Map();
		const weapons: Map<number, Weapon> = new Map();
		((this as any).system.weapons ?? []).forEach((w: Weapon, index: number) => {
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
			if (i.includes(this.type) && i.includes(compare.type)) return true;
		}
		return false;
	}
}

//@ts-ignore
interface BaseItemGURPS extends Item {
	parent: CharacterGURPS | ContainerGURPS | null;
	readonly system: BaseItemDataGURPS;
	// temporary
	_id: string;
	_source: BaseItemSourceGURPS;
	flags: ItemFlagsGURPS;
}

export { BaseItemGURPS };
