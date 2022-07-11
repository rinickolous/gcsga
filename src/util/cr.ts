import { TraitGURPS } from "@item";
import { CR } from "@module/data";

export function adjustment(cr: TraitGURPS["cr"], crAdj: TraitGURPS["crAdj"]): number {
	if (cr == CR.None) return 0;
	switch (crAdj) {
		case "none":
			return 0;
		case "action_penalty":
		case "reaction_penalty":
		case "fright_check_penalty":
		case "fright_check_bonus":
			return Object.values(CR).indexOf(cr) - Object.values(CR).length;
		case "minor_cost_of_living_increase":
			return 5 * Object.values(CR).length - Object.values(CR).indexOf(cr);
		case "major_cost_of_living_increase":
			return 10 * (1 << (Object.values(CR).length - (Object.values(CR).indexOf(cr) + 1)));
		default:
			return adjustment(cr, "none");
	}
}
