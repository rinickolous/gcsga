import { CharacterGURPS } from "@actor";

const GURPSCONFIG: any = CONFIG;
GURPSCONFIG.Item.documentClasses = {};
GURPSCONFIG.Actor.documentClasses = {
	character: CharacterGURPS,
};
export { GURPSCONFIG };
