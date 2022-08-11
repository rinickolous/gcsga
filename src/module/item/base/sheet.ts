import { NumberComparison, StringComparison } from "@module/data";
import { BasePrereq, TraitPrereq } from "@prereq";
import { toArray } from "@util";

export class ItemSheetGURPS extends ItemSheet {
	getData(options?: Partial<ItemSheet.Options>): any {
		const itemData = this.object.toObject(false);
		const sheetData = {
			...super.getData(options),
			...{
				document: this.item,
				item: itemData,
				system: (itemData as any).system,
				config: (CONFIG as any).GURPS,
			},
		};

		return sheetData;
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 600,
			min_width: 600,
			classes: options.classes.concat(["item", "gcsga"]),
		});
		return options;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".prereq .add-child").on("click", event => this._addPrereqChild(event));
		html.find(".prereq .add-list").on("click", event => this._addPrereqList(event));
		html.find(".prereq .remove").on("click", event => this._removePrereq(event));
	}

	protected async _addPrereqChild(event: JQuery.ClickEvent): Promise<any> {
		const path = $(event.currentTarget).data("path");
		const prereqs = toArray(duplicate(getProperty(this.item as any, `${path}.prereqs`)));
		prereqs.push({
			type: "trait_prereq",
			name: { compare: StringComparison.Is, qualifier: "" },
			notes: { compare: StringComparison.None, qualifier: "" },
			level: { compare: NumberComparison.AtLeast, qualifier: 0 },
			has: true,
		});
		const update: any = {};
		update["system.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
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
		update["system.prereqs"] = await this.getPrereqUpdate(`${path}.prereqs`, { ...prereqs });
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
		update["system.prereqs"] = await this.getPrereqUpdate(path, { ...prereqs });
		await this.item.update({ "system.prereqs.-=prereqs": null }, { render: false });
		return this.item.update(update);
	}

	async getPrereqUpdate(path: string, data: any): Promise<any> {
		if (path == "system.prereqs") return data;
		const list = path.split(".");
		const variable: string = list.pop()!;
		const parent = duplicate(getProperty(this.item as any, list.join(".")));
		parent[variable] = data;
		return this.getPrereqUpdate(list.join("."), parent);
	}
}
