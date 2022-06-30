import { ActorSheetGURPS } from "@actor/base/sheet";
import { Attribute } from "@module/attribute";
import { SYSTEM_NAME } from "@module/settings";

export class CharacterSheetGURPS extends ActorSheetGURPS {
	editing = true;

	static override get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 820,
			height: 800,
			classes: super.defaultOptions.classes.concat(["character"]),
		});
		return options;
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`;
	}

	getData(
		options?: Partial<ActorSheet.Options> | undefined,
	): ActorSheet.Data<ActorSheet.Options> | Promise<ActorSheet.Data<ActorSheet.Options>> {
		const [primary_attributes, secondary_attributes, point_pools] = this.prepareAttributes(this.actor.attributes);
		const sheetData = {
			...super.getData(options),
			...{
				settings: this.actor.settings,
				editing: this.editing,
			},
		};
		return sheetData;
	}

	prepareAttributes(attributes: Map<string, Attribute>): [Attribute[], Attribute[], Attribute[]] {
		console.log("hey", attributes);
		return [[], [], []];
	}
}

export interface CharacterSheetGURPS extends ActorSheetGURPS {
	editing: boolean;
}
