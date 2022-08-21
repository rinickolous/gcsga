import { Context, DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataGURPS, ItemFlagsGURPS, ItemGURPS, ItemType } from "@item/data";
import { CharacterGURPS } from "@actor/character";
import { BaseWeapon, MeleeWeapon, RangedWeapon, Weapon } from "@module/weapon";
import { Feature } from "@feature";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import { BaseItemSourceGURPS, ItemSystemData } from "./data";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { toArray } from "@util";
import { BaseFeature } from "@feature/base";
import { PrereqList } from "@prereq";
import { MergeObjectOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/utils/helpers.mjs";
import { ContainerGURPS } from "@item/container";

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
		const type = data.type.replace("_container", "");
		// TODO remove any
		if (this._source.img === (foundry.documents.BaseItem as any).DEFAULT_ICON) this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`;
		await super._preCreate(data, options, user);
	}

	override async update(data: DeepPartial<ItemDataConstructorData | (ItemDataConstructorData & Record<string, unknown>)>, context?: (DocumentModificationContext & MergeObjectOptions) | undefined): Promise<this | undefined> {
		// console.log("update()", this.name, data);
		if (!(this.parent instanceof Item)) return super.update(data, context);
		data = expandObject(data);
		data._id = this.id;
		await this.parent.updateEmbeddedDocuments("Item", [data]);
		//@ts-ignore
		this.render(false, { action: "update", data: data });
	}

	override delete(context?: DocumentModificationContext | undefined): Promise<any> {
		if (!(this.parent instanceof Item)) return super.delete(context);
		return this.parent.deleteEmbeddedDocuments("Item", [this.id!]);
	}

	// Should not be necessary
	override prepareBaseData(): void {
		mergeObject(this.system, this._source.system);
		mergeObject(this.flags, this._source.flags);
		setProperty(this, "name", this._source.name);
		setProperty(this, "sort", this._source.sort);
		if (getProperty(this, "system.features")) setProperty(this, "system.features", { ...getProperty(this, "system.features") });
		if (getProperty(this, "system.prereqs.prereqs")) setProperty(this, "system.prereqs.prereqs", { ...getProperty(this, "system.prereqs.prereqs") });
	}

	get actor(): CharacterGURPS | null {
		if (this.parent) return this.parent instanceof CharacterGURPS ? this.parent : this.parent.actor;
		return null;
	}

	get enabled(): boolean | undefined {
		return undefined;
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
		if (this.system.hasOwnProperty("features")) {
			const features: Feature[] = [];
			const list = toArray((this.system as any).features);
			for (const f of list ?? []) {
				features.push(new BaseFeature(f));
			}
			return features;
		}
		return [];
	}

	get prereqs() {
		if (!(this.system as any).prereqs) return new PrereqList();
		return new PrereqList((this.system as any).prereqs);
	}

	get prereqsEmpty(): boolean {
		if (!(this.system as any).prereqs.prereqs) return true;
		return this.prereqs?.prereqs.length == 0;
	}

	get meleeWeapons(): Map<number, MeleeWeapon> {
		return new Map([...this.weapons].filter(([k, v]) => v instanceof MeleeWeapon)) as Map<number, MeleeWeapon>;
	}

	get rangedWeapons(): Map<number, RangedWeapon> {
		return new Map([...this.weapons].filter(([k, v]) => v instanceof RangedWeapon)) as Map<number, RangedWeapon>;
	}

	get weapons(): Map<number, Weapon> {
		if (!["trait", "skill", "technique", "spell", "ritual_magic_spell", "equipment", "equipment_container"].includes(this.type)) return new Map();
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
	system: ItemSystemData;
	// temporary
	_id: string;
	_source: BaseItemSourceGURPS;
	flags: ItemFlagsGURPS;
}

export { BaseItemGURPS };
