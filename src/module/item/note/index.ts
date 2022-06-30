import { BaseItemGURPS } from "@item/base";
import { NoteData } from "./data";

export class NoteGURPS extends BaseItemGURPS {
	static get schema(): typeof NoteData {
		return NoteData;
	}
}

export interface NoteGURPS {
	readonly data: NoteData;
}
