import { ItemDataGURPS } from "@item/data";
import { ActorGURPS, CharacterGURPS } from "@actor";
import {
	Context,
	DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemType } from "./data";
import {
	DocumentConstructor,
	ConfiguredDocumentClass,
	PropertiesToSource,
} from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import {
	ItemDataBaseProperties,
	ItemDataConstructorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { DropData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/abstract/client-document";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import { BaseFeature, Feature } from "@module/feature";
import { TraitGURPS } from "@item/trait";
import { TraitContainerGURPS } from "@item/trait_container";
import { SkillGURPS } from "@item/skill";
import { TechniqueGURPS } from "@item/technique";
import { SkillContainerGURPS } from "@item/skill_container";
import { SpellGURPS } from "@item/spell";
import { RitualMagicSpellGURPS } from "@item/ritual_magic_spell";
import { SpellContainerGURPS } from "@item/spell_container";
import { EquipmentGURPS } from "@item/equipment";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { NoteGURPS } from "@item/note";
import { NoteContainerGURPS } from "@item/note_container";

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gcsga?: {
		ready?: boolean;
	};
}

//@ts-ignore
export class ItemGURPS extends Item {
	private initialized?: boolean | undefined;
	// readonly parent!: ActorGURPS | ContainerGURPS | null;

	/** @override */
	constructor(data: ItemDataGURPS, context: ItemConstructionContextGURPS = {}) {
		// console.log("CHECK", data);
		if (context.gcsga?.ready) {
			//@ts-ignore
			super(data, context);
			this.initialized = true;
		} else {
			mergeObject(context, {
				gcsga: {
					ready: true,
				},
			});
			//@ts-ignore
			const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType];
			return ItemConstructor ? new ItemConstructor(data, context) : new ItemGURPS(data, context);
		}
	}

	get features(): Feature[] {
		if (!this.data.data.hasOwnProperty("features")) return [];
		else {
			const features = [];
			//@ts-ignore
			for (let i of this.data.data.features) {
				features.push(new BaseFeature({ ...i, ...{ item: this.name } }));
			}
			return features;
		}
	}

	get enabled(): boolean {
		return true;
	}

	get tags(): string[] {
		return this.data.data.tags;
	}

	get notes() {
		return this.data.data.notes;
	}

	get prereqsEmpty(): boolean {
		if (!this.hasOwnProperty("prereqs")) return false;
		const p = (this as any).prereqs.prereqs.length;
		return p == 0;
	}

	get character(): CharacterGURPS | null {
		let parent = this.parent;
		if (parent instanceof ItemGURPS) parent = parent.character;
		if (parent instanceof CharacterGURPS) return parent;
		return null;
	}

	protected async _preCreate(
		data: ItemDataConstructorData,
		options: DocumentModificationOptions,
		user: BaseUser,
	): Promise<void> {
		if (this.data._source.img === foundry.data.ItemData.DEFAULT_ICON) {
			this.data._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type.replace(
				"_container",
				"",
			)}.svg`;
		}
		await super._preCreate(data, options, user);
	}

	prepareBaseData(): void {
		super.prepareBaseData();

		//@ts-ignore
		this.data.flags.gcsga = mergeObject(this.data.flags.gcsga ?? {}, {});
		//@ts-ignore
		this.data.flags.gcsga.contentsData ??= [];
		//@ts-ignore
		this.data.flags.gcsga.parents ??= [];
	}

	protected _onCreate(
		data: PropertiesToSource<ItemDataBaseProperties>,
		options: DocumentModificationOptions,
		userId: string,
	): void {
		return super._onCreate(data, options, userId);
	}

	/**
	 * @override update function to account for Items contained intside ofther Items.
	 * @param data Differential update data which modifies the existing values of this document data
	 * @param context Additional context which customizes the update workflow
	 * @returns The updated document instance
	 */
	async update(data: Record<string, unknown>, context?: DocumentModificationContext): Promise<this | undefined> {
		if (!(this.parent instanceof Item)) return super.update(data, context);
		data = foundry.utils.expandObject(data);
		data._id = this.id;
		await this.parent.updateEmbeddedDocuments("Item", [data]);
		this.render(false);
	}

	async delete(context?: DocumentModificationContext): Promise<this | undefined> {
		//@ts-ignore
		if (this.parent instanceof ItemGURPS) return this.parent.deleteEmbeddedDocuments("Item", [this.id]);
		return super.delete(context);
	}

	prepareData(): void {
		super.prepareData();
	}

	/** @override */
	static async fromDropData<T extends DocumentConstructor>(
		this: T,
		data: DropData<InstanceType<T>>,
		//@ts-ignore
		options?: FromDropDataOptions | undefined,
	): Promise<InstanceType<ConfiguredDocumentClass<T>> | undefined> {
		//@ts-ignore
		if (data.type !== this.documentName) return null;
		// @ts-ignore
		const collection = CONFIG[this.documentName].collection.instance;
		let document = null;

		// Case 1 - Data explicitly provided
		//@ts-ignore
		if (data.data) {
			//@ts-ignore
			document = options?.importWorld ? await this.create(data.data) : new this(data.data);
		}

		// Case 2 - Import from a Compendium pack
		//@ts-ignore
		else if (data.pack) {
			//@ts-ignore
			const pack = game.packs.get(data.pack);
			//@ts-ignore
			if (pack.documentName !== this.documentName) return null;
			document = options?.importWorld //@ts-ignore
				? await collection.importFromCompendium(pack, data.id) //@ts-ignore
				: await pack.getDocument(data.id);
		}

		// Case 3 - Import from World document
		//@ts-ignore
		else document = collection.get(data.id);

		// Flag the source GUID
		if (document && !document.getFlag("core", "sourceId")) {
			document.data.update({ "flags.core.sourceId": document.uuid });
			document.prepareData();
		}
		return document;
	}

	// async _preUpdate(changed: any, options: object, user: documents.BaseUser) {
	// 	if (!!changed.data?.categories && typeof changed?.data?.categories == "string") {
	// 		changed.data.categories = changed.data.categories.length ? changed.data.categories.split(/,\s*/) : [];
	// 	}
	// }

	get section(): string {
		const sections = {
			traits: [TraitGURPS, TraitContainerGURPS],
			skills: [SkillGURPS, TechniqueGURPS, SkillContainerGURPS],
			spells: [SpellGURPS, RitualMagicSpellGURPS, SpellContainerGURPS],
			equipment: [EquipmentGURPS, EquipmentModifierGURPS],
			notes: [NoteGURPS, NoteContainerGURPS],
		};
		for (const [k, v] of Object.entries(sections)) {
			for (const t of v) {
				if (this instanceof t) return k;
			}
		}
		return "error";
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
export interface ItemGURPS extends Item {
	readonly data: ItemDataGURPS;
	readonly parent: ActorGURPS | ItemGURPS | null;
}
