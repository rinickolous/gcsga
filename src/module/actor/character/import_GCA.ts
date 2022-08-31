import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import { XMLtoJS } from "@util/xml_js";
import { CharacterGURPS } from ".";
import { CharacterImportedData } from "./import";

export class GCAImporter {
	version: number;
	document: CharacterGURPS;

	constructor(document: CharacterGURPS) {
		this.version = 4;
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
		let r: CharacterImportedData | any;
		const errorMessages: string[] = [];
		try {
			r = XMLtoJS(xml);
		} catch (err) {
			console.error(err);
			errorMessages.push(i18n("gurps.error.import.no_json_detected"));
			return this.throwImportError(errorMessages);
		}
		console.log(r);
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
