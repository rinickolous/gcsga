import { CharacterGURPS } from "@actor";
import { FeatureType } from "@feature/base";
import { Attribute } from "@module/attribute";
import { NumberComparison, StringComparison } from "@module/data";
import { MeleeWeapon } from "@module/weapon";
import { WeaponSheet } from "@module/weapon/sheet";
import { PrereqType } from "@prereq";
import { i18n, toArray } from "@util";
import { BaseItemGURPS } from ".";

export class ItemSheetGURPS extends ItemSheet {
	getData(options?: Partial<ItemSheet.Options>): any {
		const itemData = this.object.toObject(false);

		const attributes: Record<string, string> = {};
		const locations: Record<string, string> = {};
		if (this.item.actor) {
			(this.item.actor as unknown as CharacterGURPS).attributes.forEach((e: Attribute) => {
				attributes[e.attr_id] = e.attribute_def.name;
			});
			(this.item.actor as unknown as CharacterGURPS).system.settings.body_type.locations.forEach(e => {
				locations[e.id] = e.choice_name;
			});
		} else {
			mergeObject(attributes, {
				st: "ST",
				dx: "DX",
				iq: "IQ",
				ht: "HT",
				will: "Will",
				fright_check: "Fright Check",
				per: "Perception",
				vision: "Vision",
				hearing: "Hearing",
				taste_smell: "Taste & Smell",
				touch: "Touch",
				basic_speed: "Basic Speed",
				basic_move: "Basic Move",
				fp: "FP",
				hp: "HP",
			});
			mergeObject(locations, {
				eyes: "Eyes",
				skull: "Skull",
				face: "Face",
				leg: "Leg",
				arm: "Arm",
				torso: "Torso",
				groin: "Groin",
				hand: "Hand",
				foot: "Foot",
				neck: "Neck",
				vitals: "Vitals",
			});
		}
		attributes["dodge"] = i18n("gcsga.attributes.dodge");
		attributes["parry"] = i18n("gcsga.attributes.parry");
		attributes["block"] = i18n("gcsga.attributes.block");
		const item = this.item as BaseItemGURPS;
		const meleeWeapons = [...item.meleeWeapons].map(e => mergeObject(e[1], { index: e[0] }));
		const rangedWeapons = [...item.rangedWeapons].map(e => mergeObject(e[1], { index: e[0] }));

		const sheetData = {
			...super.getData(options),
			...{
				document: item,
				meleeWeapons: meleeWeapons,
				rangedWeapons: rangedWeapons,
				item: itemData,
				system: (itemData as any).system,
				config: (CONFIG as any).GURPS,
				attributes: attributes,
				locations: locations,
			},
		};

		return sheetData;
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 620,
			min_width: 620,
			height: 800,
			classes: options.classes.concat(["item", "gcsga"]),
		});
		return options;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".prereq .add-child").on("click", event => this._addPrereqChild(event));
		html.find(".prereq .add-list").on("click", event => this._addPrereqList(event));
		html.find(".prereq .remove").on("click", event => this._removePrereq(event));
		html.find(".prereq .type").on("change", event => this._onPrereqTypeChange(event));
		html.find("#features .add").on("click", event => this._addFeature(event));
		html.find(".feature .remove").on("click", event => this._removeFeature(event));
		html.find(".feature .type").on("change", event => this._onFeatureTypeChange(event));
		html.find(".weapon-list > :not(.header)").on("dblclick", event => this._onWeaponEdit(event));

		html.find("span.input").on("blur", event => this._onSubmit(event as any));
	}

	protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		if (formData["system.tags"] && typeof formData["system.tags"] == "string") {
			const tags = formData["system.tags"].split(",").map(e => e.trim());
			formData["system.tags"] = tags;
		}
		if (formData["system.college"] && typeof formData["system.college"] == "string") {
			const college = formData["system.college"].split(",").map(e => e.trim());
			formData["system.college"] = college;
		}
		for (const [key, value] of Object.entries(formData)) {
			if (typeof value == "string" && value.includes("<div>")) {
				formData[key] = value
					.replace(/(<\/div>)?<div>/g, "\n")
					.replace("<br></div>", "")
					.replace("<br>", "\n");
			}
			if (value == "\n") formData[key] = "";
		}
		return super._updateObject(event, formData);
	}

	protected async _addPrereqChild(event: JQuery.ClickEvent): Promise<any> {
		const path = $(event.currentTarget).data("path");
		console.log(path);
		const prereqs = toArray(duplicate(getProperty(this.item as any, `${path}.prereqs`)));
		prereqs.push({
			type: "trait_prereq",
			name: { compare: StringComparison.Is, qualifier: "" },
			notes: { compare: StringComparison.None, qualifier: "" },
			level: { compare: NumberComparison.AtLeast, qualifier: 0 },
			has: true,
		});
		const update: any = {};
		// update["system.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
		update["system.prereqs.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
		// await this.item.update({ "system.-=prereqs": null }, { render: false });
		return this.item.update(update);
	}

	protected async _addPrereqList(event: JQuery.ClickEvent): Promise<any> {
		const path = $(event.currentTarget).data("path");
		const prereqs = toArray(duplicate(getProperty(this.item as any, `${path}.prereqs`)));
		prereqs.push({
			type: "prereq_list",
			prereqs: [],
			when_tl: { compare: NumberComparison.None },
		});
		const update: any = {};
		// update["system.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
		// update["system.prereqs.prereqs"] = await this.getPrereqUpdate(path, { ...prereqs });
		update["system.prereqs.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
		// await this.item.update({ "system.-=prereqs": null }, { render: false });
		return this.item.update(update);
	}

	protected async _removePrereq(event: JQuery.ClickEvent): Promise<any> {
		// path = system.prereqs.prereqs.0
		let path = $(event.currentTarget).data("path");
		const items = path.split(".");
		const index = items.pop();
		path = items.join(".");
		const prereqs = toArray(duplicate(getProperty(this.item as any, path)));
		prereqs.splice(index, 1);
		const update: any = {};
		// update["system.prereqs"] = await this.getPrereqUpdate(path, { ...prereqs });
		update["system.prereqs.prereqs"] = await this.getPrereqUpdate(path, { ...prereqs });
		// await this.item.update({ "system.prereqs.-=prereqs": null }, { render: false });
		return this.item.update(update);
	}

	protected async _onPrereqTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		const value = event.currentTarget.value;
		const PrereqConstructor = (CONFIG as any).GURPS.Prereq.classes[value as PrereqType];
		let path = $(event.currentTarget).data("path");
		const items = path.split(".");
		const index = items.pop();
		path = items.join(".");
		const prereqs = toArray(duplicate(getProperty(this.item as any, path)));
		prereqs[index] = {
			type: value,
			...PrereqConstructor.defaults,
			has: prereqs[index].has,
		};
		const update: any = {};
		// update["system.prereqs"] = await this.getPrereqUpdate(path, { ...prereqs });
		update["system.prereqs.prereqs"] = await this.getPrereqUpdate(path, prereqs);
		// await this.item.update({ "system.prereqs.-=prereqs": null }, { render: false });
		return this.item.update(update);
	}

	async getPrereqUpdate(path: string, data: any): Promise<any> {
		// console.log(path);
		// if (path == "system.prereqs") return data;
		if (path == "system.prereqs.prereqs") return toArray(data);
		const list = path.split(".");
		const variable: string = list.pop()!;
		const parent = duplicate(getProperty(this.item as any, list.join(".")));
		parent[variable] = data;
		return this.getPrereqUpdate(list.join("."), parent);
	}

	protected async _addFeature(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault();
		console.log("checkem");
		const features = toArray(duplicate(getProperty(this.item as any, "system.features")));
		features.push({
			type: "attribute_bonus",
			attribute: "st",
			limitation: "none",
			amount: 1,
			per_level: false,
			levels: 0,
		});
		const update: any = {};
		update["system.features"] = features;
		console.log(update);
		return this.item.update(update);
	}

	protected async _removeFeature(event: JQuery.ClickEvent): Promise<any> {
		const index = $(event.currentTarget).data("index");
		const features = toArray(duplicate(getProperty(this.item as any, "system.features")));
		features.splice(index, 1);
		const update: any = {};
		// update["system.features"] = { ...features };
		update["system.features"] = features;
		// await this.item.update({ "system.-=features": null }, { render: false });
		return this.item.update(update);
	}

	protected async _onFeatureTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		const value = event.currentTarget.value;
		const index = $(event.currentTarget).data("index");
		const FeatureConstructor = (CONFIG as any).GURPS.Feature.classes[value as FeatureType];
		const features = toArray(duplicate(getProperty(this.item as any, "system.features")));
		features[index] = {
			type: value,
			...FeatureConstructor.defaults,
		};
		const preUpdate: any = {};
		const update: any = {};
		// update["system.features"] = { ...features };
		preUpdate[`system.features.${index}`] = {};
		update["system.features"] = features;
		// await this.item.update({ "system.-=features": null }, { render: false });
		await this.item.update(preUpdate, { render: false });
		return this.item.update(update);
	}

	protected async _onWeaponEdit(event: JQuery.DoubleClickEvent): Promise<any> {
		event.preventDefault();
		const index = $(event.currentTarget).data("index");
		new WeaponSheet(
			{ weapon: (this.item as BaseItemGURPS).weapons.get(index) as MeleeWeapon, index: index },
			{
				top: this.position.top! + 40,
				left: this.position.left! + (this.position.width! - DocumentSheet.defaultOptions.width!) / 2,
			},
		).render(true);
	}
}
