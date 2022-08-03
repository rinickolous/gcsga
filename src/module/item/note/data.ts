import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { NoteGURPS } from ".";

export type NoteSource = BaseItemSourceGURPS<"note", NoteSystemData>;

// export class NoteData extends BaseItemDataGURPS<NoteGURPS> {}

export interface NoteData extends Omit<NoteSource, "effects" | "flags">, NoteSystemData {
	readonly type: NoteSource["type"];
	data: NoteSystemData;

	readonly _source: NoteSource;
}

export interface NoteSystemData extends ItemSystemData {
	text: string;
}
