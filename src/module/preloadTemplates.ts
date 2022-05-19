export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
	const templatePaths: string[] = [
		// Add paths to "systems/gcsga/templates"
		"systems/gcsga/templates/actor/gcs/sections/gcs_dropdown_open.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_dropdown_closed.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_portrait.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_identity.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_miscellaneous.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_description.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_points.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_primary_attributes.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_secondary_attributes.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_pool_attributes.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_encumbrance.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_lifting.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_hit_location.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_reactions.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_conditional_modifiers.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_melee_attacks.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_ranged_attacks.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_advantage.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_skill.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_spell.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_equipment.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_other_equipment.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_note.hbs",
		"systems/gcsga/templates/actor/default/sections/def_portrait.hbs",
		"systems/gcsga/templates/actor/default/sections/def_portrait.hbs",
		"systems/gcsga/templates/actor/default/sections/def_primary_attributes.hbs",
		"systems/gcsga/templates/actor/default/sections/def_secondary_attributes.hbs",
		"systems/gcsga/templates/actor/default/sections/def_pool_attributes.hbs",
		"systems/gcsga/templates/actor/default/sections/def_header.hbs",
		"systems/gcsga/templates/actor/default/sections/def_maneuver.hbs",
		"systems/gcsga/templates/actor/import.hbs",
		"systems/gcsga/templates/actor/gcs/sections/gcs_item_notes.hbs",

		"systems/gcsga/templates/item/sections/input_text.hbs",

		"systems/gcsga/templates/chat/import-character-error.hbs",
	];
	templatePaths.forEach((filename) => {
		const match = filename.match(`.*/(.*).hbs`);
		const name = match ? match[1] : "";
		fetch(filename)
			.then((it) => it.text())
			.then(async (text) => {
				if (!!name) Handlebars.registerPartial(name, text);
			});
	});
	return loadTemplates(templatePaths);
}
