import { ContainerGURPS, ItemGURPS, TraitGURPS } from "@item";
import { ItemSystemData, ItemType } from "@item/base/data";
import { ItemDataGURPS } from "@item/data";
import { EquipmentSystemData } from "@item/equipment/data";
import { EquipmentContainerSystemData } from "@item/equipment_container/data";
import { EquipmentModifierSystemData } from "@item/equipment_modifier/data";
import { TraitModifierSystemData } from "@item/modifier/data";
import { NoteSystemData } from "@item/note/data";
import { NoteContainerSystemData } from "@item/note_container/data";
import { RitualMagicSpellSystemData } from "@item/ritual_magic_spell/data";
import { SkillSystemData } from "@item/skill/data";
import { SkillContainerSystemData } from "@item/skill_container/data";
import { SpellSystemData } from "@item/spell/data";
import { SpellContainerSystemData } from "@item/spell_container/data";
import { TechniqueSystemData } from "@item/technique/data";
import { TraitSystemData } from "@item/trait/data";
import { TraitContainerSystemData } from "@item/trait_container/data";
// TODO change
import { Default, ObjArray, Weapon } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { Prereq, BasePrereq } from "@module/prereq";
import { getPointTotal, i18n, i18n_f, sheetSection } from "@util";
import { CharacterGURPS } from ".";
import { CharacterData, HitLocationTable, ImportedData } from "./data";
import { AttributeDef, AttributeSettingDef } from "./attribute";
import { Feature, BaseFeature } from "@module/feature";

export class CharacterImporter {
	version: number;
	document: CharacterGURPS;
	constructor(document: CharacterGURPS) {
		this.version = 4;
		this.document = document;
	}

	static import(document: CharacterGURPS, file: { text: string; name: string; path: string }) {
		const importer = new CharacterImporter(document);
		importer._import(document, file);
	}

	//TODO FileWithPath instead of File
	async _import(document: CharacterGURPS, file: { text: string; name: string; path: string }) {
		const json = file.text;
		let r: ImportedData;
		const msg: string[] = [];
		try {
			r = JSON.parse(json);
		} catch (err) {
			msg.push(i18n("gcsga.actor.import.no_json_detected"));
			return this.throwImportError(msg);
		}

		//TODO get rid of any
		let commit: CharacterData | any = {};
		const imp = document.getData().import;
		imp.name = file.name || imp.name;
		imp.path = file.path || imp.path;
		imp.last_import = new Date().toString().split(" ").splice(1, 5).join(" ");
		try {
			// Disallow importing file formats other than the current version
			if (r.version < this.version)
				return this.throwImportError(msg.concat(i18n("gcsga.actor.import.format_old")));
			else if (r.version > this.version)
				return this.throwImportError(msg.concat(i18n("gcsga.actor.import.format_new")));
			commit = { ...commit, ...{ "data.import": imp } };
			commit = { ...commit, ...{ name: r.profile.name } };
			commit = { ...commit, ...this.importMiscData(r) };
			commit = { ...commit, ...(await this.importProfile(r.profile)) };
			commit = { ...commit, ...this.importSettings(r.settings) };
			commit = { ...commit, ...this.importAttributes(r.attributes) };

			// Begin Item Import
			const items: Array<ItemGURPS | ContainerGURPS> = [];
			items.push(...this.importItems(r.traits));
			items.push(...this.importItems(r.skills));
			items.push(...this.importItems(r.spells));
			items.push(...this.importItems(r.equipment));
			items.push(...this.importItems(r.other_equipment, { other_equipment: true }));
			items.push(...this.importItems(r.notes));
			commit = { ...commit, ...{ items: items } };

			const point_totals = {
				total: r.total_points,
				attributes: commit["data.points.attributes"],
				race: 0,
				advantages: 0,
				disadvantages: 0,
				quirks: 0,
				skills: 0,
				spells: 0,
				unspent: 0,
			};
			items.forEach((item) => {
				if (sheetSection(item, "traits") && !(item as TraitGURPS).data.data.disabled) {
					const itemData = item.data.data as TraitContainerSystemData;
					if (itemData.container_type == "race") point_totals.race += itemData.calc.points;
					else if (itemData.calc.points == -1) point_totals.quirks += itemData.calc.points;
					else if (itemData.calc.points < 0) point_totals.disadvantages += itemData.calc.points;
					else point_totals.advantages += itemData.calc.points;
				} else if (sheetSection(item, "skills")) {
					const itemData = item.data.data as SkillSystemData;
					point_totals.skills += itemData.calc.points;
				} else if (sheetSection(item, "spells")) {
					const itemData = item.data.data as SpellSystemData;
					point_totals.spells += itemData.calc.points;
				}
			});
			point_totals.unspent =
				point_totals.total -
				(point_totals.attributes +
					point_totals.race +
					point_totals.advantages +
					point_totals.disadvantages +
					point_totals.quirks +
					point_totals.skills +
					point_totals.spells);
			commit = { ...commit, ...{ "data.points": point_totals } };
		} catch (err: Error | unknown) {
			if (!(err instanceof Error)) return;
			console.error((err as Error).stack);
			msg.push(
				i18n_f("gcsga.actor.import.generic.error", {
					name: r.profile.name,
					message: err.message,
				}),
			);
			return this.throwImportError(msg);
		}

		try {
			await this.document.update(
				{
					"data.settings.attributes": null,
					// "data.settings.hit_locations": null,
					"data.attributes": null,
				},
				{ diff: true, recursive: false, render: false },
			);
			await this.document.update(commit, { diff: false, recursive: false });
		} catch (err: Error | unknown) {
			if (!(err instanceof Error)) return;
			console.error(err.stack);
			msg.push(
				i18n_f("gcsga.actor.import.generic_error", {
					name: r.profile.name,
					message: err.message,
				}),
			);
			return this.throwImportError(msg);
		}
		return true;
	}

	importMiscData(data: ImportedData) {
		return {
			"data.version": data.version,
			"data.id": data.id,
			"data.created_date": data.created_date,
			"data.modified_date": data.modified_date,
			"data.calc": data.calc,
		};
	}

	async importProfile(profile: ImportedData["profile"]) {
		const p: any = {
			name: profile.name || this.document.name || "",
			"data.profile.player_name": profile.player_name || "",
			"data.profile.name": profile.name || this.document.name,
			"data.profile.title": profile.title || "",
			"data.profile.organization": profile.organization || "",
			"data.profile.age": profile.age || "",
			"data.profile.birthday": profile.birthday || "",
			"data.profile.eyes": profile.eyes || "",
			"data.profile.hair": profile.hair || "",
			"data.profile.skin": profile.skin || "",
			"data.profile.handedness": profile.handedness || "",
			"data.profile.height": profile.height || "",
			"data.profile.weight": profile.weight || "",
			"data.profile.SM": profile.SM || 0,
			"data.profile.gender": profile.gender || "",
			"data.profile.tech_level": profile.tech_level || "",
			"data.profile.religion": profile.religion || "",
		};
		if (!!profile.portrait) {
			//TODO ensure string type
			//@ts-ignore
			const path = this.getPortraitPath();
			let currentDir = "";
			for (let i = 0; i < path.split("/").length; i++) {
				try {
					currentDir += path.split("/")[i] + "/";
					await FilePicker.createDirectory("data", currentDir);
				} catch (err) {
					continue;
				}
				// FilePicker.createDirectory("data", path.split("/")[i]);
			}
			const filename = `${profile.name}_${this.document.id}_portrait.png`.replace(" ", "_");
			const url = `data:image/png;base64,${profile.portrait}`;
			await fetch(url)
				.then((res) => res.blob())
				.then((blob) => {
					const file = new File([blob], filename);
					// TODO remove when dep updates
					//@ts-ignore
					FilePicker.upload("data", path, file, {}, { notify: false });
				});
			p.img = (path + "/" + filename).replace(" ", "_");
		}
		return p;
	}

	getPortraitPath(): string {
		if ((game as Game).settings.get(SYSTEM_NAME, "portrait_path") == "global") return "images/portraits/";
		return `worlds/${(game as Game).world.id}/images/portraits`;
	}

	importSettings(settings: ImportedData["settings"]) {
		const attributes: Record<string, AttributeSettingDef> = {};
		for (const att of settings.attributes) {
			attributes[att.id] = att;
		}
		return {
			"data.settings.default_length_units": settings.default_length_units,
			"data.settings.default_weight_units": settings.default_weight_units,
			"data.settings.user_description_display": settings.user_description_display,
			"data.settings.modifiers_display": settings.modifiers_display,
			"data.settings.notes_display": settings.notes_display,
			"data.settings.skill_level_adj_display": settings.skill_level_adj_display,
			"data.settings.use_multiplicative_modifiers": settings.use_multiplicative_modifiers,
			"data.settings.use_modifying_dice_plus_adds": settings.use_modifying_dice_plus_adds,
			"data.settings.damage_progression": settings.damage_progression,
			"data.settings.use_simple_metric_conversions": settings.use_simple_metric_conversions,
			"data.settings.show_college_in_sheet_spells": settings.show_college_in_sheet_spells,
			"data.settings.show_difficulty": settings.show_difficulty,
			"data.settings.show_trait_modifier_adj": settings.show_trait_modifier_adj,
			"data.settings.show_equipment_modifier_adj": settings.show_equipment_modifier_adj,
			"data.settings.show_spell_adj": settings.show_spell_adj,
			"data.settings.use_title_in_footer": settings.use_title_in_footer,
			"data.settings.page": settings.page,
			"data.settings.block_layout": settings.block_layout,
			"data.settings.attributes": attributes,
			"data.settings.hit_locations": new HitLocationTable(settings.hit_locations),
		};
	}

	importAttributes(attributes: Array<AttributeDef>) {
		const atts: Record<string, AttributeDef> = {};
		let points = 0;
		attributes.forEach((a) => {
			atts[a.attr_id] = a as AttributeDef;
			points += a.calc.points;
		});
		return {
			"data.attributes": atts,
			"data.points.attributes": points,
		};
	}

	importItems(
		list: Array<ItemSystemData>,
		context: { container?: string | null; other_equipment?: boolean } = { container: null, other_equipment: false },
	): Array<any> {
		const items: Array<any> = [];
		if (!list) return items;
		for (const i of list) {
			let data: any;
			const id = randomID();
			const flags: ItemDataGURPS["flags"] = { gcsga: { contentsData: [], parents: [] } };
			flags.gcsga?.parents.push(this.document.id!);
			const j = i as ItemSystemData;
			switch (i.type) {
				case "trait":
					data = this.getTraitData(j as TraitSystemData);
					// flags.gcsga!.contentsData = [];
					// flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
					// 	this.importItems((j as TraitSystemData).modifiers),
					// );
					break;
				case "trait_container":
					data = this.getTraitContainerData(j as TraitContainerSystemData);
					flags.gcsga!.contentsData = [];
					flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
						this.importItems((j as TraitContainerSystemData).children, { container: id }),
						// this.importItems((j as TraitContainerSystemData).modifiers, { container: id }),
					);
					break;
				case "modifier":
					data = this.getTraitModifierData(j as TraitModifierSystemData);
					break;
				case "skill":
					data = this.getSkillData(j as SkillSystemData);
					break;
				case "technique":
					data = this.getTechniqueData(j as TechniqueSystemData);
					break;
				case "skill_container":
					data = this.getSkillContainerData(j as SkillContainerSystemData);
					flags.gcsga!.contentsData = [];
					flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
						this.importItems((j as SkillContainerSystemData).children, { container: id }),
					);
					(data as SkillContainerSystemData).calc.points = getPointTotal(
						{ data: data as SkillContainerSystemData },
						flags.gcsga?.contentsData,
					);
					break;
				case "spell":
					data = this.getSpellData(j as SpellSystemData);
					break;
				case "ritual_magic_spell":
					data = this.getRitualMagicSpellData(j as RitualMagicSpellSystemData);
					break;
				case "spell_container":
					data = this.getSpellContainerData(j as SpellContainerSystemData);
					flags.gcsga!.contentsData = [];
					flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
						this.importItems((j as SpellContainerSystemData).children, { container: id }),
					);
					(data as SpellContainerSystemData).calc.points = getPointTotal(
						{ data: data as SpellContainerSystemData },
						flags.gcsga?.contentsData,
					);
					break;
				case "equipment":
					i.name = (j as EquipmentSystemData).description;
					data = this.getEquipmentData(j as EquipmentSystemData, context.other_equipment!);
					// flags.gcsga!.contentsData = [];
					// flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
					// 	this.importItems((j as EquipmentSystemData).modifiers, { container: id }),
					// );
					break;
				case "equipment_container":
					i.name = (j as EquipmentContainerSystemData).description;
					data = this.getEquipmentContainerData(j as EquipmentContainerSystemData, context.other_equipment!);
					flags.gcsga!.contentsData = [];
					flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
						// this.importItems((j as EquipmentContainerSystemData).modifiers, { container: id }),
						this.importItems((j as EquipmentContainerSystemData).children, { container: id }),
					);
					break;
				case "eqp_modifier":
					data = this.getEquipmentModifierData(j as EquipmentModifierSystemData);
					break;
				case "note":
					data = this.getNoteData(j as NoteSystemData);
					break;
				case "note_container":
					data = this.getNoteContainerData(j as NoteContainerSystemData);
					flags.gcsga!.contentsData = [];
					flags.gcsga!.contentsData = flags.gcsga?.contentsData.concat(
						this.importItems((j as NoteContainerSystemData).children, { container: id }),
					);
					break;
			}
			if (context.container) flags.gcsga?.parents.push(context.container);
			// TODO find how to fix this
			//@ts-ignore
			const item = new ItemGURPS({
				name: i.name || "ERROR",
				type: i.type,
				data: data,
				flags: flags,
				_id: id,
			});
			if (context.container) {
				items.push({
					name: item.name,
					data: item.data,
					effects: [],
					flags: flags,
					folder: item.folder as Folder,
					img: item.img || "",
					permission: item.permission,
					type: item.type as ItemType,
					_id: id,
				});
			} else {
				items.push(item);
			}
		}
		return items;
	}

	getTraitData(data: TraitSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			round_down: data.round_down || false,
			allow_half_levels: data.allow_half_levels || false,
			disabled: data.disabled || false,
			mental: data.mental || false,
			physical: data.physical || false,
			social: data.social || false,
			exotic: data.exotic || false,
			supernatural: data.supernatural || false,
			levels: data.levels || "0",
			base_points: data.base_points || 0,
			points_per_level: data.points_per_level || 0,
			calc: {
				points: data.calc?.points || 0,
			},
			cr: !!data.cr ? data.cr : -1,
			cr_adj: data.cr_adj || "none",
			features: this.importFeatures(`${data.name}${data.levels ? " " + data.levels : ""}`, data.features ?? []),
			// features: new ObjArray<Feature>((data.features as Feature[]) || []),
			// weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
		};
	}

	getTraitContainerData(data: TraitContainerSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			disabled: data.disabled || false,
			notes: data.notes || "",
			tags: data.tags || [],
			container_type: data.container_type || "group",
			calc: {
				points: data.calc?.points || 0,
			},
			cr: data.cr || -1,
			cr_adj: data.cr_adj || "none",
			open: data.open || false,
		};
	}

	getTraitModifierData(data: TraitModifierSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			disabled: data.disabled || false,
			cost_type: data.cost_type || "percentage",
			cost: data.cost || 0,
			levels: data.levels || 0,
			affects: data.affects || "total",
			features: this.importFeatures(data.name!, data.features ?? []),
		};
	}

	getSkillData(data: SkillSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			specialization: data.specialization || "",
			tech_level: data.tech_level || "",
			encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier || 0,
			difficulty: data.difficulty || "dx/a",
			points: data.points || 0,
			defaulted_from: data.defaulted_from || {},
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			defaults: new ObjArray<Default>((data.defaults as Default[]) || []),
			features: this.importFeatures(
				`${data.name}${data.specialization ? " (" + data.specialization + ")" : ""}`,
				data.features ?? [],
			),
			calc: {
				level: data.calc?.level || 0,
				rsl: data.calc?.rsl || "",
				points: data.points || 0,
			},
		};
	}

	getTechniqueData(data: TechniqueSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			specialization: data.specialization || "",
			tech_level: data.tech_level || "",
			encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier || 0,
			difficulty: data.difficulty || "",
			points: data.points || 0,
			default: data.default || {},
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			features: this.importFeatures(data.name!, data.features ?? []),
			calc: {
				level: data.calc?.level || 0,
				rsl: data.calc?.rsl || "",
				points: data.points || 0,
			},
		};
	}

	getSkillContainerData(data: SkillContainerSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			open: data.open || false,
			calc: {
				points: 0,
			},
		};
	}

	getSpellData(data: SpellSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			difficulty: data.difficulty || "iq/h",
			tech_level: data.tech_level || "",
			college: data.college || [],
			power_source: data.power_source || "",
			spell_class: data.spell_class || "",
			resist: data.resist || "",
			casting_cost: data.casting_cost || "",
			maintenance_cost: data.maintenance_cost || "",
			casting_time: data.casting_time || "",
			duration: data.duration || "",
			points: data.points || 0,
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			calc: {
				level: data.calc?.level || 0,
				rsl: data.calc?.rsl || "",
				points: data.points || 0,
			},
		};
	}

	getRitualMagicSpellData(data: RitualMagicSpellSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			difficulty: data.difficulty || "iq/h",
			tech_level: data.tech_level || "",
			college: data.college || [],
			power_source: data.power_source || "",
			spell_class: data.spell_class || "",
			resist: data.resist || "",
			casting_cost: data.casting_cost || "",
			maintenance_cost: data.maintenance_cost || "",
			casting_time: data.casting_time || "",
			duration: data.duration || "",
			points: data.points || 0,
			base_skill: data.base_skill || "",
			prereq_count: data.prereq_count || 0,
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			calc: {
				level: data.calc?.level || 0,
				rsl: data.calc?.rsl || "",
				points: data.points || 0,
			},
		};
	}

	getSpellContainerData(data: SpellContainerSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			open: data.open || false,
			calc: {
				points: 0,
			},
		};
	}

	getEquipmentData(data: EquipmentSystemData, other: boolean) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			equipped: data.equipped || false,
			quantity: data.quantity || 0,
			tech_level: data.tech_level || "",
			legality_class: data.legality_class || "",
			value: data.value || "",
			ignore_weight_for_skills: data.ignore_weight_for_skills || false,
			weight: data.weight || "",
			uses: data.uses || 0,
			max_uses: data.max_uses || 0,
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			features: this.importFeatures(data.description, data.features ?? []),
			calc: {
				extended_value: data.calc?.extended_value || "",
				extended_weight: data.calc?.extended_weight || "",
				extended_weight_for_skills: data.calc?.extended_weight_for_skills || "",
			},
			other: other,
		};
	}

	getEquipmentModifierData(data: EquipmentModifierSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			cost_type: data.cost_type || "",
			cost: data.cost || "",
			weight_type: data.weight_type || "",
			weight: data.weight || "",
			tech_level: data.tech_level || "",
			features: this.importFeatures(data.name!, data.features ?? []),
		};
	}

	getEquipmentContainerData(data: EquipmentContainerSystemData, other: boolean) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			prereqs: data.prereqs ? this.importPrereq(data.prereqs) : BasePrereq.default,
			open: data.open || false,
			equipped: data.equipped || false,
			tech_level: data.tech_level || "",
			legality_class: data.legality_class || "",
			value: data.value || "",
			ignore_weight_for_skills: data.ignore_weight_for_skills || false,
			weight: data.weight || "",
			uses: data.uses || 0,
			max_uses: data.max_uses || 0,
			weapons: new ObjArray<Weapon>((data.weapons as Weapon[]) || []),
			features: this.importFeatures(data.description, data.features ?? []),
			calc: {
				extended_value: data.calc?.extended_value || "",
				extended_weight: data.calc?.extended_weight || "",
				extended_weight_for_skills: data.calc?.extended_weight_for_skills || "",
			},
			other: other,
		};
	}

	getNoteData(data: NoteSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			text: data.text || "",
		};
	}

	getNoteContainerData(data: NoteContainerSystemData) {
		return {
			id: data.id || "",
			reference: data.reference || "",
			notes: data.notes || "",
			tags: data.tags || [],
			open: data.open || false,
			text: data.text || "",
		};
	}

	importPrereq(prereq: Prereq) {
		const p = new BasePrereq(prereq);
		return p;
	}

	importFeatures(item: string, features: BaseFeature[]): Feature[] {
		const list: Feature[] = [];
		features.forEach((f) => {
			list.push(new BaseFeature({ ...f, ...{ item: item } }));
		});
		return list;
	}

	async throwImportError(msg: string[]) {
		ui.notifications?.error(msg.join("<br>"));

		//@ts-ignore ChatMessage.create
		await ChatMessage.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: msg,
			}),
			user: (game as Game).user!.id,
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [(game as Game).user!.id],
		});
		return false;
	}
}
