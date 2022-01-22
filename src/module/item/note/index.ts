import { ItemGURPS } from "@item/base";
import { NoteData } from "./data";

//@ts-ignore
export class NoteGURPS extends ItemGURPS {
	static get schema(): typeof NoteData {
		return NoteData;
	}
}

export interface NoteGURPS {
	readonly data: NoteData;
}
