import { ContainerGURPS } from "@item/container";
import { NoteContainerData } from "./data";

export class NoteContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof NoteContainerData {
		return NoteContainerData;
	}
}

export interface NoteContainerGURPS {
	readonly data: NoteContainerData;
}
