import { ItemSheetGURPS } from "@item/base/sheet";
import { SkillGURPS } from ".";

export class SkillSheet extends ItemSheetGURPS {
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["skill"]),
		});
		return options;
	}

	getData(options?: Partial<DocumentSheetOptions> | undefined) {
		const sheetData = {
			...super.getData(options),
			...{
				attributes: {
					...{ 10: "10" },
					...super.getData(options).attributes,
				},
			},
		};
		console.log(sheetData);
		return sheetData;
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
	}

	protected _updateObject(event: Event, formData: any): Promise<unknown> {
		console.log("foobar", event, formData);
		console.trace();
		const checkem: any = {};
		const attribute = formData["attribute"] ?? (this.item as SkillGURPS).attribute;
		const difficulty = formData["difficulty"] ?? (this.item as SkillGURPS).difficulty;
		formData["system.difficulty"] = `${attribute}/${difficulty}`;
		formData["test"] = 1;
		formData["test2"] = 0;
		checkem["test3"] = 1;
		checkem["system.encumbrance_penalty_multiplier"] = 0;
		console.log(formData);
		console.log(checkem);
		const newFormData = { ...formData, ...checkem };
		console.log(newFormData);
		delete formData["attribute"];
		delete formData["difficulty"];
		return super._updateObject(event, formData);
	}
}
