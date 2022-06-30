export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
	const templatePaths: string[] = [
		// Add paths to "systems/gcsga/templates"
	];

	return loadTemplates(templatePaths);
}
