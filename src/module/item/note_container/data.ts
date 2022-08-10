import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data";
import { NoteContainerGURPS } from ".";

export type NoteContainerSource = BaseContainerSource<"note_container", NoteContainerSystemData>;

// export class NoteContainerData extends BaseContainerData<NoteContainerGURPS> {}

export interface NoteContainerData extends Omit<NoteContainerSource, "effects" | "flags" | "items">, NoteContainerSystemData {
	readonly type: NoteContainerSource["type"];
	data: NoteContainerSystemData;

	readonly _source: NoteContainerSource;
}

export interface NoteContainerSystemData extends BaseContainerSystemData {
	text: string;
}
