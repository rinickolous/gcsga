import {
	DocumentModificationOptions,
	Metadata,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { SYSTEM_NAME } from "@module/settings";
import { gid } from "@module/gid";
import { ActorConstructorContextGURPS, ActorGURPS } from "../base";
import { CharacterData, CharacterSource } from "./data";
import { CharacterImporter } from "./import";
import { Attribute, AttributeDef, AttributeSettingDef } from "./attribute";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { Feature, DRBonus, AttributeBonus, CostReduction } from "@module/feature";

//@ts-ignore
export class CharacterGURPS extends ActorGURPS {
	variableResolverExclusions: Map<string, boolean> = new Map();
	featureStack!: Feature[];

	static get schema(): typeof CharacterData {
		return CharacterData;
	}

	constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
		if (!context.gcsga?.ready) {
			// mergeObject(data, expandObject(CHARACTER_DEFAULTS));
			// mergeObject(context, { gcsga: { initialized: true } });
		}
		super(data, context);
	}

	get settings() {
		return this.data.data.settings;
	}

	get attributes() {
		return this.data.data.attributes;
	}

	get calc() {
		return this.data.data.calc;
	}

	// Get Items
	get traits() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "traits")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get skills() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "skills")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get spells() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "spells")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get carried_equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment" && !(i as any).data.data.other)
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get other_equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment" && (i as any).data.data.other)
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get notes() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "notes")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	/** @override */
	protected _preUpdate(
		changed: DeepPartial<ActorDataConstructorData>,
		options: DocumentModificationOptions,
		user: BaseUser,
	): Promise<void> {
		console.log(changed, options);
		if ((changed.data as any).attributes)
			for (let [k, v] of Object.entries((changed.data as any).attributes)) {
				(v as any).adj =
					Math.round(((v as any).calc.value - this.resolveAttributeDef(k) - this.getAttBonus(k)) * 10000) /
					10000;
			}
		return super._preUpdate(changed, options, user);
	}

	/** @override */
	update(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & foundry.utils.MergeObjectOptions,
	): Promise<this | undefined> {
		return super.update(data, context);
	}

	/** @override */
	prepareBaseData() {
		super.prepareBaseData();
	}

	/** @override */
	prepareData() {
		super.prepareData();
	}

	/** @override */
	prepareEmbeddedDocuments() {
		super.prepareEmbeddedDocuments();
		this.featureStack = [];
		this.deepItems.forEach((item) => {
			if (item.features.length && item.enabled)
				item.features.forEach((f) => {
					if (f.per_level && ["trait", "modifier"].includes(item.type)) f.levels = (item as any).levels;
					this.featureStack?.push(f);
				});
		});
		this.prepareAttributes();
		this.prepareDR();
	}

	prepareAttributes() {
		const attributes = this.data.data.attributes;
		if (!attributes) return;
		const defs = this.settings.attributes;
		for (let [k, att] of Object.entries(attributes)) {
			att.calc.value = this.resolveAttributeDef(k) + att.adj;
			att.calc.value += this.getAttBonus(k);
			const cost_multiplier = 1 - this.getAttCostReduction(k) * Math.max(this.data.data.profile.SM, 0);
			att.calc.points = att.adj * (defs[k].cost_per_point * cost_multiplier);
		}
	}

	getAttBonus(att: string): number {
		let bonus = 0;
		for (const feature of this.featureStack.filter((f) => f.type == "attribute_bonus") as AttributeBonus[]) {
			if (feature.attribute == att) bonus += feature.amount * (feature.per_level ? feature.levels || 0 : 1);
		}
		return bonus;
	}

	getAttCostReduction(att: string): number {
		let reduction = 0;
		reduction += this.settings.attributes[att].cost_adj_percent_per_sm ?? 0;
		for (const feature of this.featureStack.filter((f) => f.type == "cost_reduction") as CostReduction[]) {
			if (feature.attribute == att) reduction += feature.amount * (feature.per_level ? feature.levels || 0 : 1);
		}
		reduction *= 0.01;
		return Math.min(reduction, 0.8);
	}

	prepareDR() {
		const hit_locations = this.data.data.settings.hit_locations;
		if (!hit_locations) return;
		for (const location of hit_locations.locations) {
			location.calc.dr = { all: location.dr_bonus };
		}
		for (const feature of this.featureStack.filter((f) => f.type == "dr_bonus") as DRBonus[]) {
			for (const location of hit_locations.locations.filter((e) => e.id == feature.location)) {
				const spec = feature.specialization ?? "all";
				if (!location.calc.dr[spec]) location.calc.dr[spec] = 0;
				location.calc.dr[spec] += feature.amount * (feature.per_level ? feature.levels || 0 : 1);
			}
		}
		console.log("done", this.data.data.settings.hit_locations, hit_locations);
	}

	/** @override */
	prepareDerivedData() {
		super.prepareDerivedData();
		// console.log(this.traits);
		// if (this.attributes)
		// 	for (const [k, a] of Object.entries(this.attributes)) {
		// 		a.calc.value = this.resolveAttributeDef(k) + a.adj;
		// 		a.calc.points = Math.ceil(a.adj * this.settings.attributes[k].cost_per_point);
		// 	}
		// const st = this.attributes.st.calc.value;
		// this.calc.basic_lift = `${st >= Math.sqrt(50) ? Math.round(st ** 2 / 5) : st ** 2 / 5} lb`;
	}

	/** @override */
	updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Record<string, unknown>[] | undefined,
		context?: DocumentModificationContext | undefined,
	): Promise<Document<any, any, Metadata<any>>[]> {
		return super.updateEmbeddedDocuments(embeddedName, updates, context);
	}

	async importCharacter() {
		const import_path = this.getData().import.path;
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/);
		if (!!import_name) {
			const file_path = import_name[1].replace(/\\/g, "/");
			const request = new XMLHttpRequest();
			request.open("GET", file_path);

			new Promise((resolve) => {
				request.onload = () => {
					if (request.status === 200) {
						const text = request.response;
						CharacterImporter.import(this, { text: text, name: import_name[1], path: import_path });
					} else this._openImportDialog();
					resolve(this);
				};
			});
			request.send(null);
		} else this._openImportDialog();
	}

	_openImportDialog() {
		setTimeout(async () => {
			new Dialog(
				{
					title: `Import character data for: ${this.name}`,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import.hbs`, {
						name: `"${this.name}"`,
					}),
					buttons: {
						import: {
							icon: `<i class="fas fa-file-import"></i>`,
							label: `Import`,
							callback: (html) => {
								const form = $(html).find("form")[0];
								const files = form.data.files;
								if (!files.length) {
									return ui.notifications?.error("You did not upload a data file!");
								} else {
									const file = files[0];
									readTextFromFile(file).then((text) =>
										CharacterImporter.import(this, {
											text: text,
											name: file.name,
											path: file.path,
										}),
									);
								}
							},
						},
						no: {
							icon: `<i class="fas fa-times"></i>`,
							label: `Cancel`,
						},
					},
					default: "import",
				},
				{
					width: 400,
				},
			).render(true);
		}, 200);
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions.get(variableName)) {
			console.warn(`Attempt to resolve variable via itself: $${variableName}`);
			return "";
		}
		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map();
		this.variableResolverExclusions.set(variableName, true);
		if (gid.SizeModifier == variableName) return this.getData().profile.SM.signedString();
		const parts = variableName.split("."); // TODO check
		const attr = this.getData().attributes[parts[0]];
		if (!attr) {
			console.warn(`No such variable: $${variableName}`);
			return "";
		}
		const def = this.getData().settings.attributes[attr.attr_id];
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`);
			return "";
		}
		if (def.type == "pool" && parts.length > 1) {
			switch (parts[1]) {
				case "current":
					return attr.calc.current!.toString();
				case "maximum":
					return attr.calc.value.toString();
				default:
					console.warn(`No such variable: $${variableName}`);
					return "";
			}
		}
		this.variableResolverExclusions = new Map();
		return attr.calc.value!.toString();
	}

	resolveAttributeDef(attrID: string): any {
		const systemData = this.data.data;
		if (systemData.attributes[attrID]) this.variableResolverExclusions = new Map();
		return new Attribute(systemData.settings.attributes[attrID] as AttributeDef & AttributeSettingDef).BaseValue(
			this,
		);
	}
}

export interface CharacterGURPS {
	readonly data: CharacterData;
}
