import { ItemGURPS } from "@item";
import { ItemFlagsGURPS, ItemSystemDataGURPS } from "@item/data";
import { DiceGURPS } from "@module/dice";
import { SYSTEM_NAME } from "@module/settings";
import { BasePrereq } from "@prereq";
import { capitalize, i18n, newUUID } from "@util";
import { XMLtoJS } from "@util/xml_js";
import { CharacterGURPS } from ".";
import { CharacterDataGURPS, HitLocationTable } from "./data";
import { CharacterImportedData } from "./import";

export class GCAImporter {
	version: string;
	document: CharacterGURPS;

	constructor(document: CharacterGURPS) {
		this.version = "5.0.189.0";
		this.document = document;
	}

	static import(
		document: CharacterGURPS,
		file: { text: string; name: string; path: string },
	) {
		const importer = new GCAImporter(document);
		importer._import(document, file);
	}

	async _import(
		document: CharacterGURPS,
		file: { text: string; name: string; path: string },
	) {
		const xml = file.text;
		// TODO: change to GCA5 format
		let r: CharacterImportedData | any;
		const errorMessages: string[] = [];
		try {
			r = XMLtoJS(xml)["gca5"]["character"];
		} catch (err) {
			console.error(err);
			errorMessages.push(i18n("gurps.error.import.no_json_detected"));
			return this.throwImportError(errorMessages);
		}
		console.log("raw data:", r);
		let commit: Partial<CharacterDataGURPS> = {};
		const imp = document.importData;
		imp.name = file.name ?? imp.name;
		imp.path = file.path ?? imp.path;
		imp.last_import = new Date().toISOString();
		try {
			const version: any[] | null =
				r.author.version.match(/\d.\d+.\d+.\d+/);
			if (version == null)
				return this.throwImportError([
					...errorMessages,
					i18n("gurps.error.import_gca.version_unknown"),
				]);
			if (version[0] > this.version)
				return this.throwImportError([
					...errorMessages,
					i18n("gurps.error.import_gca.version_new"),
				]);
			if (version[0] < this.version)
				return this.throwImportError([
					...errorMessages,
					i18n("gurps.error.import_gca.version_old"),
				]);
			commit = { ...commit, ...{ "system.import": imp } };
			commit = { ...commit, ...{ name: r.name } };
			commit = { ...commit, ...this.importMiscData(r) };
			commit = { ...commit, ...this.importProfile(r) };
			commit = { ...commit, ...this.importSettings(r) };
			commit = { ...commit, ...this.importAttributes(r) };

			// Begin item impoprt
			const items: Array<ItemGURPS> = [];
			items.push(...this.importItems(r.traits.templates));
			items.push(...this.importItems(r.traits.advantages));
			items.push(...this.importItems(r.traits.disadvantages));
			items.push(...this.importItems(r.traits.perks));
			items.push(...this.importItems(r.traits.quirks));
			items.push(...this.importItems(r.traits.skills));
			items.push(...this.importItems(r.traits.spells));
			items.push(...this.importItems(r.traits.equipment));

			console.log(commit, items);
		} catch (err) {
			console.error(err);
		}
	}

	importMiscData(data: any) {
		return {
			"system.id": "none",
			"system.created_date": new Date(
				data.author.datecreated,
			).toISOString(),
			"system.modified_date": new Date().toISOString(),
			// temporary
			"system.total_points": 0,
		};
	}

	importProfile(data: any) {
		const p: any = {
			"system.profile.player_name": data.player || "",
			"system.profile.name": data.name || this.document.name,
			"system.profile.title": "",
			"system.profile.organization": "",
			"system.profile.age": data.vitals.age || "",
			"system.profile.birthday": "", // !
			"system.profile.eyes": "", // !
			"system.profile.hair": "", // !
			"system.profile.skin": "", // !
			"system.profile.handedness": "",
			"system.profile.height": data.vitals.height || "",
			"system.profile.weight": data.vitals.weight || "",
			"system.profile.SM": 0,
			"system.profile.gender": "",
			"system.profile.tech_level": "",
			"system.profile.religion": "",
		};

		const sizemod = data.traits.attributes.trait.find(
			(e: any) => e["name"] == "Size Modifier",
		);
		if (sizemod) p["system.profile.SM"] = parseInt(sizemod.score);
		const tech_level = data.traits.attributes.trait.find(
			(e: any) => e["name"] == "Tech Level",
		);
		if (tech_level) p["system.profile.tech_level"] = tech_level.score;

		return p;
	}

	importSettings(data: any) {
		const body: Partial<HitLocationTable> = {
			roll: new DiceGURPS("3d"),
			locations: [],
		};
		body.name = data.bodytype || "";
		for (const part of data.hitlocationtable.hitlocationline) {
			let table_name = part.location;
			if (table_name === "Eye") table_name = "Eyes";
			if (table_name === "Hand") table_name = "Hands";
			if (table_name === "Foot") table_name = "Feet";
			console.log(table_name);
			const dr_bonus = parseInt(
				data.body.bodyitem.find((e: any) => e.name == table_name)
					.basedr,
			);
			let id = part.location.toLowerCase();
			if (id.includes("leg")) id = "leg";
			if (id.includes("arm")) id = "leg";
			if (table_name === "Eyes") id = table_name.toLowerCase();
			const choice_name = capitalize(id);
			const hit_penalty = parseInt(part.penalty);
			const rolls = part.roll.split("-");
			let slots = 0;
			if (!!rolls[0] && rolls[1])
				slots = parseInt(rolls[1]) - parseInt(rolls[0]);
			let description = "";
			if (!!part.notes) {
				console.log(part.notes);
				const notes = part.notes.split(",");
				for (const i of notes) {
					if (!!description) description += "\n";
					console.log(i, data.hitlocationtable.hitlocationnote);
					description += data.hitlocationtable.hitlocationnote.find(
						(e: any) => e.key == i,
					).value;
				}
			}
			body.locations?.push({
				id: id,
				choice_name: choice_name,
				table_name: table_name,
				slots: slots,
				hit_penalty: hit_penalty,
				dr_bonus: dr_bonus,
				description: description,
			});
		}
		return {
			"system.settings.body_type": body,
		};
	}

	importAttributes(data: any) {
		const atts: any = {};
		for (const att of data.traits.attributes.trait) {
			if (
				![
					"ST",
					"DX",
					"IQ",
					"HT",
					"Perception",
					"Will",
					"Vision",
					"Hearing",
					"Taste/Smell",
					"Touch",
					"Fright Check",
					"Basic Speed",
					"Basic Move",
					"Hit Points",
					"Fatigue Points",
				].includes(att.name)
			)
				continue;
			let id = att.name.toLowerCase();
			if (id == "fright_check") id = "fright_check";
			if (id == "taste/smell") id = "taste_smell";
			if (id == "basic speed") id = "basic_speed";
			if (id == "basic_move") id = "basic_move;";
			if (id == "hit points") id = "hp";
			if (id == "fatigue points") id = "fp";

			atts[`system.attributes.${id}.adj`] = parseFloat(att.level);
			if (["hp", "fp"].includes(id))
				atts[`system.attributes.${id}.damage`] =
					parseInt(att.attackmodes.attackmode.uses_used) || 0;
		}
		return atts;
	}

	importItems(data: any, context?: { container?: boolean }): ItemGURPS[] {
		const list = data.trait;
		if (!list) return [];
		const items: Array<any> = [];
		for (const item of list) {
			const newItem: Partial<{
				flags: any;
				_id: string;
				system: Partial<ItemSystemDataGURPS> | null;
			}> = {};
			newItem._id = randomID();
			newItem.system = {};
			newItem.system.name = item.name;
			const [itemData, itemFlags]: [
				Partial<ItemSystemDataGURPS> | null,
				ItemFlagsGURPS | null,
			] = this.getItemData(item, data, context);
			newItem.system = itemData;
			newItem.flags = itemFlags;
			items.push(newItem);
		}
		return items;
	}

	getItemData(
		item: any,
		data: any,
		context?: { container?: boolean },
	): [any, any] {
		let itemData: Partial<ItemSystemDataGURPS>;
		const flags: ItemFlagsGURPS = { [SYSTEM_NAME]: { contentsData: [] } };
		switch (item["@type"]) {
			case "Advantages":
			case "Disadvantages":
			case "Perks":
			case "Quirks":
				itemData = this.getTraitData(item);
				// flags[SYSTEM_NAME]!.contentsData = this.getNestedItems(item, data, context);
				return [itemData, flags];
			case "Skills":
			// itemData = this.getSkillData(item);
			// flags[SYSTEM_NAME]!.contentsData = this.getNestedItems(item, data, context);
			// return [itemData, flags];
			case "Spells":
			// itemData = this.getSpellData(item);
			// flags[SYSTEM_NAME]!.contentsData = this.getNestedItems(item, data, context);
			// return [itemData, flags];
			default:
				return [null, null];
		}
	}

	getTraitData(item: any): any {
		// TODO: taboo -> prereq
		let disabled = false;
		// console.log(item, item.extended);
		// if (
		// 	item.extended?.find(
		// 		(e: any) => e.tagname == "inactive" && e.tagvalue == "yes",
		// 	)
		// )
		// 	disabled = true;
		if (
			!!item.extended &&
			!!item.extended.extendedtag &&
			item.extended.extendedtag.tagname == "inactive" &&
			item.extended.extendedtag.tagvalue == "yes"
		)
			disabled = true;
		let [base_points, points_per_level] = [0, 0];
		let strCost = item.calcs.cost;
		if (strCost.includes("/")) {
			const arCost = strCost.split("/");
			base_points = parseInt(arCost[0]);
			points_per_level = parseInt(arCost[1]) - base_points;
		}
		const levels = points_per_level > 0 ? parseInt(item.level) : 0;
		let cr = 0;
		console.log(item, item.modifiers);
		if (item.modifiers.find((e: any) => e.group == "Self-Control"))
			cr = parseInt(item.modifiers.find((e: any) => e.shortname));
		return {
			name: item.name ?? "Trait",
			type: "trait",
			id: newUUID(),
			reference: item.ref.page ?? "",
			notes: "",
			tags: item.cat.split(", ") ?? [],
			prereqs: BasePrereq.list,
			round_down: true,
			disabled: disabled,
			levels: levels,
			base_points: base_points,
			points_per_level: points_per_level,
			cr: cr,
			cr_adj: "none",
		};
	}

	getSkillData(item: any) {
		return {};
	}
	getSpellData(item: any) {
		return {};
	}

	getNestedItems(item: any, data: any, context?: { container?: boolean }) {
		return [];
	}

	async throwImportError(msg: string[]) {
		ui.notifications?.error(msg.join("<br>"));

		await ChatMessage.create({
			content: await renderTemplate(
				`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`,
				{
					lines: msg,
				},
			),
			user: (game as Game).user!.id,
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [(game as Game).user!.id],
		});
		return false;
	}
}
