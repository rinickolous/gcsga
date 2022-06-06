import { ItemGURPS } from "@item";
import { TraitSystemData } from "@item/trait/data";
import { TraitContainerSystemData } from "@item/trait_container/data";
import { TraitModifierSystemData } from "@item/modifier/data";
import { ItemSystemData, ItemType } from "@item/base/data";
import { ContainerGURPS } from "@item/container";
import { EquipmentSystemData } from "@item/equipment/data";
import { EquipmentContainerSystemData } from "@item/equipment_container/data";
import { EquipmentModifierSystemData } from "@item/equipment_modifier/data";
import { NoteSystemData } from "@item/note/data";
import { NoteContainerSystemData } from "@item/note_container/data";
import { RitualMagicSpellSystemData } from "@item/ritual_magic_spell/data";
import { SkillSystemData } from "@item/skill/data";
import { SkillContainerSystemData } from "@item/skill_container/data";
import { SpellSystemData } from "@item/spell/data";
import { SpellContainerSystemData } from "@item/spell_container/data";
import { TechniqueSystemData } from "@item/technique/data";
import { Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { Default, Feature, ObjArray, Prereq, Weapon } from "@module/data";
import { getPointTotal, i18n, i18n_f } from "@util";
import { ActorConstructorContextGURPS, ActorGURPS } from "../base";
import { Attribute, AttributeSetting, CharacterData, CharacterSource, HitLocationTable, ImportedData } from "./data";
import { CharacterImporter } from "./import";

//@ts-ignore
export class CharacterGURPS extends ActorGURPS {
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
	prepareDerivedData() {
		super.prepareDerivedData();
	}

	/** @override */
	prepareEmbeddedDocuments() {
		super.prepareEmbeddedDocuments();
	}

	/** @override */
	updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Record<string, unknown>[] | undefined,
		context?: DocumentModificationContext | undefined,
	): Promise<Document<any, any, Metadata<any>>[]> {
		return super.updateEmbeddedDocuments(embeddedName, updates, context);
	}

	// async importCharacter() {
	// 	const importpath = this.getData().import.path;
	// 	const importname = importpath.match(/.*[/\\]Data[/\\](.*)/);
	// 	if (!!importname) {
	// 		const file = importname[1].replace(/\\/g, "/");
	// 		const request = new XMLHttpRequest();
	// 		request.open("GET", file);

	// 		new Promise((resolve) => {
	// 			request.onload = () => {
	// 				if (request.status === 200) {
	// 					const json = request.response;
	// 					CharacterImporter.import(this, json);
	// 					// this.importCharacterFromGCS(json, importname[1], importpath);
	// 				} else this._openImportDialog();
	// 				resolve(this);
	// 			};
	// 		});
	// 		request.send(null);
	// 	} else this._openImportDialog();
	// }

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
					content: await renderTemplate("systems/gcsga/templates/actor/import.hbs", {
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

	// async importCharacterFromGCS(json: string, filename: string, filepath: string) {
	// 	let r: ImportedData;
	// 	const msg: string[] = [];
	// 	try {
	// 		r = JSON.parse(json);
	// 	} catch (err) {
	// 		msg.push(i18n("gcsga.actor.import.no_json_detected"));
	// 		return this.throwImportError(msg);
	// 	}

	// 	let commit: any = {};
	// 	const imp = this.getData().import;
	// 	imp.name = filename || imp.name;
	// 	imp.path = filepath || imp.path;
	// 	imp.last_import = new Date().toString().split(" ").splice(1, 4).join(" ");
	// 	try {
	// 		commit = { ...commit, ...{ "data.import": imp } };
	// 		commit = { ...commit, ...{ name: r.profile.name } };
	// 		commit = { ...commit, ...this.importData(r) };
	// 		commit = { ...commit, ...(await this.importProfile(r.profile)) };
	// 		commit = { ...commit, ...this.importSettings(r.settings) };
	// 		commit = { ...commit, ...this.importAttributes(r.attributes) };

	// 		// Item Import
	// 		let items: Array<ItemGURPS | ContainerGURPS> = [];
	// 		//@ts-ignore
	// 		items = items.concat(this.importItems(r.advantages));
	// 		items = items.concat(this.importItems(r.skills));
	// 		items = items.concat(this.importItems(r.spells));
	// 		items = items.concat(this.importItems(r.equipment));
	// 		items = items.concat(this.importItems(r.other_equipment, { other_equipment: true }));
	// 		items = items.concat(this.importItems(r.notes));
	// 		commit = { ...commit, ...{ items: items } };

	// 		const point_totals = {
	// 			total: r.total_points,
	// 			attributes: commit["data.points.attributes"],
	// 			race: 0,
	// 			advantages: 0,
	// 			disadvantages: 0,
	// 			quirks: 0,
	// 			skills: 0,
	// 			spells: 0,
	// 			unspent: 0,
	// 		};
	// 		items.forEach((item) => {
	// 			//@ts-ignore
	// 			if (["trait", "trait_container"].includes(item.type) && !item.data.data.disabled) {
	// 				const itemData = item.data.data as TraitContainerSystemData;
	// 				if (itemData.container_type == "race") point_totals.race += itemData.calc.points;
	// 				else if (itemData.calc.points == -1) point_totals.quirks += itemData.calc.points;
	// 				else if (itemData.calc.points < 0) point_totals.disadvantages += itemData.calc.points;
	// 				else point_totals.advantages += itemData.calc.points;
	// 			} else if (["skill", "technique", "skill_container"].includes(item.type)) {
	// 				const itemData = item.data.data as SkillSystemData;
	// 				point_totals.skills += itemData.calc.points;
	// 			} else if (["spell", "ritual_magic_spell", "spell_container"].includes(item.type)) {
	// 				const itemData = item.data.data as SpellSystemData;
	// 				point_totals.spells += itemData.calc.points;
	// 			}
	// 		});
	// 		point_totals.unspent =
	// 			point_totals.total -
	// 			(point_totals.attributes +
	// 				point_totals.race +
	// 				point_totals.advantages +
	// 				point_totals.disadvantages +
	// 				point_totals.quirks +
	// 				point_totals.skills +
	// 				point_totals.spells);
	// 		commit = {
	// 			...commit,
	// 			...{
	// 				"data.points.total": point_totals.total,
	// 				"data.points.unspent": point_totals.unspent,
	// 				"data.points.race": point_totals.race,
	// 				"data.points.advantages": point_totals.advantages,
	// 				"data.points.disadvantages": point_totals.disadvantages,
	// 				"data.points.quirks": point_totals.quirks,
	// 				"data.points.skills": point_totals.skills,
	// 				"data.points.spells": point_totals.spells,
	// 			},
	// 		};
	// 	} catch (err: unknown) {
	// 		if (!(err instanceof Error)) return;
	// 		console.error(err.stack);
	// 		msg.push(
	// 			i18n_f("gcsga.actor.import.generic_error", {
	// 				name: r.profile.name,
	// 				message: err.message,
	// 			}),
	// 		);
	// 		return this.throwImportError(msg);
	// 	}

	// 	try {
	// 		await this.update(
	// 			{
	// 				"data.settings.attributes": null,
	// 				"data.settings.hit_locations": null,
	// 				"data.attributes": null,
	// 			},
	// 			{ diff: true, recursive: false, render: false },
	// 		);
	// 		await this.update(commit, { diff: false, recursive: false });
	// 	} catch (err: unknown) {
	// 		if (!(err instanceof Error)) return;
	// 		console.error(err.stack);
	// 		msg.push(
	// 			i18n_f("gcsga.actor.import.generic_error", {
	// 				name: r.profile.name,
	// 				message: err.message,
	// 			}),
	// 		);
	// 		return this.throwImportError(msg);
	// 	}

	// 	return true;
	// }

	// async throwImportError(msg: string[]) {
	// 	ui.notifications?.error(msg.join("<br>"));
	// 	//@ts-ignore
	// 	ChatMessage.create({
	// 		content: await renderTemplate("systems/gcsga/templates/chat/import-character-error.hbs", {
	// 			lines: msg,
	// 		}),
	// 		//@ts-ignore game
	// 		user: game.user.id,
	// 		type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
	// 		//@ts-ignore game
	// 		whisper: [game.user.id],
	// 	});
	// 	return false;
	// }

	// importData(data: ImportedData) {
	// 	return {
	// 		"data.version": data.version,
	// 		"data.id": data.id,
	// 		"data.created_date": data.created_date,
	// 		"data.modified_date": data.modified_date,
	// 		"data.calc": data.calc,
	// 	};
	// }

	// async importProfile(profile: ImportedData["profile"]) {
	// 	let img = "";
	// 	if (!!profile.portrait) {
	// 		//@ts-ignore
	// 		const path = CONFIG.GURPS.portrait_path;
	// 		const filename = `${profile.name || this.name || this.id}_portrait.png`;
	// 		img = encodeURIComponent(`${path}${filename}`);
	// 		const url = `data:image/png;base64,${profile.portrait}`;
	// 		await fetch(url)
	// 			.then((res) => res.blob())
	// 			.then((img_blob) => {
	// 				const file = new File([img_blob], filename);
	// 				//@ts-ignore
	// 				FilePicker.upload("data", path, file, {}, { notify: false });
	// 			});
	// 	}
	// 	return {
	// 		"data.profile.player_name": profile.player_name || "",
	// 		name: profile.name || this.name,
	// 		"data.profile.name": profile.name || this.name,
	// 		"data.profile.title": profile.title || "",
	// 		"data.profile.organization": profile.organization || "",
	// 		"data.profile.age": profile.age || "",
	// 		"data.profile.birthday": profile.birthday || "",
	// 		"data.profile.eyes": profile.eyes || "",
	// 		"data.profile.hair": profile.hair || "",
	// 		"data.profile.skin": profile.skin || "",
	// 		"data.profile.handedness": profile.handedness || "",
	// 		"data.profile.height": profile.height || "",
	// 		"data.profile.weight": profile.weight || "",
	// 		"data.profile.SM": profile.SM || 0,
	// 		"data.profile.gender": profile.gender || "",
	// 		"data.profile.tech_level": profile.tech_level || "",
	// 		"data.profile.religion": profile.religion || "",
	// 		img: img,
	// 	};
	// }

	// importSettings(settings: ImportedData["settings"]) {
	// 	const attributes: Record<string, AttributeSetting> = {};
	// 	for (const att of settings.attributes) {
	// 		attributes[att.id] = att;
	// 	}
	// 	return {
	// 		"data.settings.default_length_units": settings.default_length_units,
	// 		"data.settings.default_weight_units": settings.default_weight_units,
	// 		"data.settings.user_description_display": settings.user_description_display,
	// 		"data.settings.modifiers_display": settings.modifiers_display,
	// 		"data.settings.notes_display": settings.notes_display,
	// 		"data.settings.skill_level_adj_display": settings.skill_level_adj_display,
	// 		"data.settings.use_multiplicative_modifiers": settings.use_multiplicative_modifiers,
	// 		"data.settings.use_modifying_dice_plus_adds": settings.use_modifying_dice_plus_adds,
	// 		"data.settings.damage_progression": settings.damage_progression,
	// 		"data.settings.use_simple_metric_conversions": settings.use_simple_metric_conversions,
	// 		"data.settings.show_college_in_sheet_spells": settings.show_college_in_sheet_spells,
	// 		"data.settings.show_difficulty": settings.show_difficulty,
	// 		"data.settings.show_advantage_modifier_adj": settings.show_advantage_modifier_adj,
	// 		"data.settings.show_equipment_modifier_adj": settings.show_equipment_modifier_adj,
	// 		"data.settings.show_spell_adj": settings.show_spell_adj,
	// 		"data.settings.use_title_in_footer": settings.use_title_in_footer,
	// 		"data.settings.page": settings.page,
	// 		"data.settings.block_layout": settings.block_layout,
	// 		"data.settings.attributes": attributes,
	// 		"data.settings.hit_locations": new HitLocationTable(settings.hit_locations),
	// 		// 'data.settings.hit_locations': new HitLocationTable(settings.hit_locations),
	// 	};
	// }

	// importAttributes(attributes: Array<Attribute>) {
	// 	const atts: any = {};
	// 	let points = 0;
	// 	for (const i of attributes) {
	// 		atts[i.attr_id] = i;
	// 		points += i.calc.points;
	// 	}
	// 	return {
	// 		"data.attributes": atts,
	// 		"data.points.attributes": points,
	// 	};
	// }

	// importItems(
	// 	list: Array<ItemSystemData>,
	// 	context: { container?: string | null; other_equipment?: boolean } = { container: null, other_equipment: false },
	// ): Array<any> {
	// 	if (!list) return [];
	// 	const items: Array<any> = [];
	// 	for (const i of list) {
	// 		let data: any = {};
	// 		const id = randomID();
	// 		const flags: any = { gcsga: { contentsData: [], parents: [] } };
	// 		flags.gcsga.parents.push(this.id);
	// 		//@ts-ignore
	// 		const j = i as ItemSystemData;
	// 		switch (i.type) {
	// 			case "advantage":
	// 				data = this.getTraitData(j as TraitSystemData);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData
	// 					.concat
	// 					// this.importItems((j as TraitSystemData).modifiers as TraitModifierSystemData[], {
	// 					// 	container: id,
	// 					// }),
	// 					();
	// 				break;
	// 			case "advantage_container":
	// 				data = this.getTraitContainerData(j as TraitContainerSystemData);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData
	// 					.concat
	// 					// this.importItems((j as TraitContainerSystemData).modifiers, {
	// 					// 	container: id,
	// 					// }) as Array<ItemGURPS>,
	// 					();
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData.concat(
	// 					this.importItems((j as TraitContainerSystemData).children, {
	// 						container: id,
	// 					}) as Array<ItemGURPS>,
	// 				);
	// 				break;
	// 			case "modifier":
	// 				data = this.getTraitModifierData(j as TraitModifierSystemData);
	// 				break;
	// 			case "skill":
	// 				data = this.getSkillData(j as SkillSystemData);
	// 				break;
	// 			case "technique":
	// 				data = this.getTechniqueData(j as TechniqueSystemData);
	// 				break;
	// 			case "skill_container":
	// 				data = this.getSkillContainerData(j as SkillContainerSystemData);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData.concat(
	// 					this.importItems((j as SkillContainerSystemData).children, {
	// 						container: id,
	// 					}) as Array<ItemGURPS>,
	// 				);
	// 				//@ts-ignore
	// 				data.calc.points = getPointTotal({ data: data }, flags.gcsga.contentsData);
	// 				break;
	// 			case "spell":
	// 				data = this.getSpellData(j as SpellSystemData);
	// 				break;
	// 			case "ritual_magic_spell":
	// 				data = this.getRitualMagicSpellData(j as RitualMagicSpellSystemData);
	// 				break;
	// 			case "spell_container":
	// 				data = this.getSpellContainerData(j as SpellContainerSystemData);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData.concat(
	// 					this.importItems((j as SpellContainerSystemData).children, {
	// 						container: id,
	// 					}) as Array<ItemGURPS>,
	// 				);
	// 				//@ts-ignore
	// 				data.calc.points = getPointTotal({ data: data }, flags.gcsga.contentsData);
	// 				break;
	// 			case "equipment":
	// 				(i as any).name = (j as EquipmentSystemData).description;
	// 				// || or shouldn't be necessary, learn how to fix
	// 				data = this.getEquipmentData(j as EquipmentSystemData, context.other_equipment || false);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData
	// 					.concat
	// 					// this.importItems((j as EquipmentSystemData).modifiers, { container: true }) as Array<ItemGURPS>,
	// 					();
	// 				break;
	// 			case "equipment_container":
	// 				(i as any).name = (j as EquipmentContainerSystemData).description;
	// 				data = this.getEquipmentContainerData(
	// 					j as EquipmentContainerSystemData,
	// 					context.other_equipment || false,
	// 				);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData
	// 					.concat
	// 					// this.importItems((j as EquipmentContainerSystemData).modifiers, {
	// 					// 	container: id,
	// 					// }) as Array<ItemGURPS>,
	// 					();
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData.concat(
	// 					this.importItems((j as EquipmentContainerSystemData).children, {
	// 						container: id,
	// 					}) as Array<ItemGURPS>,
	// 				);
	// 				break;
	// 			case "eqp_modifier":
	// 				data = this.getEquipmentModifierData(j as EquipmentModifierSystemData);
	// 				break;
	// 			case "note":
	// 				data = this.getNoteData(j as NoteSystemData);
	// 				break;
	// 			case "note_container":
	// 				data = this.getNoteContainerData(j as NoteContainerSystemData);
	// 				flags.gcsga.contentsData = [];
	// 				flags.gcsga.contentsData = flags.gcsga.contentsData.concat(
	// 					this.importItems((j as NoteContainerSystemData).children, {
	// 						container: id,
	// 					}) as Array<ItemGURPS>,
	// 				);
	// 				break;
	// 		}
	// 		if (context.container) flags.gcsga.parents.push(context.container);
	// 		//@ts-ignore
	// 		const item = new ItemGURPS({
	// 			name: i.name || "ERROR",
	// 			type: i.type,
	// 			//@ts-ignore
	// 			data: data,
	// 			flags: flags,
	// 			_id: id,
	// 		});
	// 		if (context.container) {
	// 			// containedItems.push({
	// 			items.push({
	// 				name: item.name || i.name || "ERROR",
	// 				data: item.data,
	// 				// effects: item.effects || [],
	// 				effects: [],
	// 				flags: flags,
	// 				folder: item.folder as Folder,
	// 				img: item.img || "",
	// 				permission: item.permission,
	// 				type: item.type as ItemType,
	// 				_id: id,
	// 			});
	// 		} else {
	// 			items.push(item);
	// 		}
	// 	}
	// 	// if (context.container) {
	// 	//     return containedItems;
	// 	// } else {
	// 	//     return items;
	// 	// }
	// 	return items;
	// }

	// getItemID(data: { id?: string }): string {
	// 	for (const i of this.data.items) {
	// 		if (data.id === (i.data.data as ItemSystemData).id && i.id) return i.id;
	// 	}
	// 	return randomID();
	// }

	// getTraitData(data: TraitSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		round_down: data.round_down || false,
	// 		allow_half_levels: data.allow_half_levels || false,
	// 		disabled: data.disabled || false,
	// 		mental: data.mental || false,
	// 		physical: data.physical || false,
	// 		social: data.social || false,
	// 		exotic: data.exotic || false,
	// 		supernatural: data.supernatural || false,
	// 		levels: data.levels || "0",
	// 		base_points: data.base_points || 0,
	// 		points_per_level: data.points_per_level || 0,
	// 		calc: {
	// 			points: data.calc?.points || 0,
	// 		},
	// 		cr: !!data.cr ? data.cr : -1,
	// 		cr_adj: data.cr_adj || "none",
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 	};
	// }

	// getTraitContainerData(data: TraitContainerSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		disabled: data.disabled || false,
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		container_type: data.container_type || "group",
	// 		calc: {
	// 			points: data.calc?.points || 0,
	// 		},
	// 		cr: data.cr || -1,
	// 		cr_adj: data.cr_adj || "none",
	// 		open: data.open || false,
	// 	};
	// }

	// getTraitModifierData(data: TraitModifierSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		disabled: data.disabled || false,
	// 		cost_type: data.cost_type || "percentage",
	// 		cost: data.cost || 0,
	// 		levels: data.levels || 0,
	// 		affects: data.affects || "total",
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 	};
	// }

	// getSkillData(data: SkillSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		specialization: data.specialization || "",
	// 		tech_level: data.tech_level || "",
	// 		encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier || 0,
	// 		difficulty: data.difficulty || "dx/a",
	// 		points: data.points || 0,
	// 		defaulted_from: data.defaulted_from || {},
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		defaults: new ObjArray<Default>((data.defaults as Default[]) || []),
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 		calc: {
	// 			level: data.calc?.level || 0,
	// 			rsl: data.calc?.rsl || "",
	// 			points: data.points || 0,
	// 		},
	// 	};
	// }

	// getTechniqueData(data: TechniqueSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		specialization: data.specialization || "",
	// 		tech_level: data.tech_level || "",
	// 		encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier || 0,
	// 		difficulty: data.difficulty || "",
	// 		points: data.points || 0,
	// 		default: data.default || {},
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 		calc: {
	// 			level: data.calc?.level || 0,
	// 			rsl: data.calc?.rsl || "",
	// 			points: data.points || 0,
	// 		},
	// 	};
	// }

	// getSkillContainerData(data: SkillContainerSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		open: data.open || false,
	// 		calc: {
	// 			points: 0,
	// 		},
	// 	};
	// }

	// getSpellData(data: SpellSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		difficulty: data.difficulty || "iq/h",
	// 		tech_level: data.tech_level || "",
	// 		college: data.college || [],
	// 		power_source: data.power_source || "",
	// 		spell_class: data.spell_class || "",
	// 		resist: data.resist || "",
	// 		casting_cost: data.casting_cost || "",
	// 		maintenance_cost: data.maintenance_cost || "",
	// 		casting_time: data.casting_time || "",
	// 		duration: data.duration || "",
	// 		points: data.points || 0,
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		calc: {
	// 			level: data.calc?.level || 0,
	// 			rsl: data.calc?.rsl || "",
	// 			points: data.points || 0,
	// 		},
	// 	};
	// }

	// getRitualMagicSpellData(data: RitualMagicSpellSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		difficulty: data.difficulty || "iq/h",
	// 		tech_level: data.tech_level || "",
	// 		college: data.college || [],
	// 		power_source: data.power_source || "",
	// 		spell_class: data.spell_class || "",
	// 		resist: data.resist || "",
	// 		casting_cost: data.casting_cost || "",
	// 		maintenance_cost: data.maintenance_cost || "",
	// 		casting_time: data.casting_time || "",
	// 		duration: data.duration || "",
	// 		points: data.points || 0,
	// 		base_skill: data.base_skill || "",
	// 		prereq_count: data.prereq_count || 0,
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		calc: {
	// 			level: data.calc?.level || 0,
	// 			rsl: data.calc?.rsl || "",
	// 			points: data.points || 0,
	// 		},
	// 	};
	// }

	// getSpellContainerData(data: SpellContainerSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		open: data.open || false,
	// 		calc: {
	// 			points: 0,
	// 		},
	// 	};
	// }

	// getEquipmentData(data: EquipmentSystemData, other: boolean) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		equipped: data.equipped || false,
	// 		quantity: data.quantity || 0,
	// 		tech_level: data.tech_level || "",
	// 		legality_class: data.legality_class || "",
	// 		value: data.value || "",
	// 		ignore_weight_for_skills: data.ignore_weight_for_skills || false,
	// 		weight: data.weight || "",
	// 		uses: data.uses || 0,
	// 		max_uses: data.max_uses || 0,
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 		calc: {
	// 			extended_value: data.calc?.extended_value || "",
	// 			extended_weight: data.calc?.extended_weight || "",
	// 			extended_weight_for_skills: data.calc?.extended_weight_for_skills || "",
	// 		},
	// 		other: other,
	// 	};
	// }

	// getEquipmentModifierData(data: EquipmentModifierSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		cost_type: data.cost_type || "",
	// 		cost: data.cost || "",
	// 		weight_type: data.weight_type || "",
	// 		weight: data.weight || "",
	// 		tech_level: data.tech_level || "",
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 	};
	// }

	// getEquipmentContainerData(data: EquipmentContainerSystemData, other: boolean) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		prereqs: this.importPrereq(data.prereqs),
	// 		open: data.open || false,
	// 		equipped: data.equipped || false,
	// 		tech_level: data.tech_level || "",
	// 		legality_class: data.legality_class || "",
	// 		value: data.value || "",
	// 		ignore_weight_for_skills: data.ignore_weight_for_skills || false,
	// 		weight: data.weight || "",
	// 		uses: data.uses || 0,
	// 		max_uses: data.max_uses || 0,
	// 		weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
	// 		features: new ObjArray<Feature>((data.features as Feature[]) || []),
	// 		calc: {
	// 			extended_value: data.calc?.extended_value || "",
	// 			extended_weight: data.calc?.extended_weight || "",
	// 			extended_weight_for_skills: data.calc?.extended_weight_for_skills || "",
	// 		},
	// 		other: other,
	// 	};
	// }

	// getNoteData(data: NoteSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		text: data.text || "",
	// 	};
	// }

	// getNoteContainerData(data: NoteContainerSystemData) {
	// 	return {
	// 		id: data.id || "",
	// 		reference: data.reference || "",
	// 		notes: data.notes || "",
	// 		categories: data.categories || [],
	// 		open: data.open || false,
	// 		text: data.text || "",
	// 	};
	// }

	// // TO DO LATER
	// importPrereq(prereq: Prereq) {
	// 	return prereq;
	// }
}

export interface CharacterGURPS {
	readonly data: CharacterData;
}
