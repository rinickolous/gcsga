import { SYSTEM_NAME } from "./settings";

export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
	const templatePaths: string[] = [
		// Add paths to "systems/gcsga/templates"

		"actor/character/sections/trait",
		"actor/character/sections/basic-damage",
		"actor/character/sections/conditional-modifier",
		"actor/character/sections/description",
		"actor/character/sections/dropdown-closed",
		"actor/character/sections/dropdown-open",
		"actor/character/sections/encumbrance",
		"actor/character/sections/equipment",
		"actor/character/sections/hit-location",
		"actor/character/sections/identity",
		"actor/character/sections/input-text",
		"actor/character/sections/item-notes",
		"actor/character/sections/lifting",
		"actor/character/sections/melee-attack",
		"actor/character/sections/miscellaneous",
		"actor/character/sections/note",
		"actor/character/sections/other-equipment",
		"actor/character/sections/points",
		"actor/character/sections/pool-attributes",
		"actor/character/sections/portrait",
		"actor/character/sections/primary-attributes",
		"actor/character/sections/ranged-attack",
		"actor/character/sections/reaction",
		"actor/character/sections/secondary-attributes",
		"actor/character/sections/skill",
		"actor/character/sections/spell",

		"actor/character/sections/error",
		"actor/drag-image",

		"sections/svg",

		"actor/import",

		"item/sections/prerequisites",
		"item/sections/prereq",

		"chat/import-character-error",
	];
	const formattedPaths: string[] = [];
	templatePaths.forEach((filename) => {
		filename = `systems/${SYSTEM_NAME}/templates/${filename}.hbs`;
		console.log(filename);
		const match = filename.match(`.*/(.*).hbs`);
		const name = match ? match[1] : "";
		fetch(filename)
			.then((it) => it.text())
			.then(async (text) => {
				if (!!name) Handlebars.registerPartial(name, text);
				formattedPaths.push(name);
			});
	});
	return loadTemplates(formattedPaths);
}
