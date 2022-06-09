import { Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { SYSTEM_NAME } from "@module/settings";
import { ActorConstructorContextGURPS, ActorGURPS } from "../base";
import { CharacterData, CharacterSource } from "./data";
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
}

export interface CharacterGURPS {
	readonly data: CharacterData;
}
