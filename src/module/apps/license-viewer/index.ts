export class LicenseViewer extends Application {
	static override get defaultOptions(): Application.Options {
		return mergeObject(super.defaultOptions, {
			id: "license-viewer",
			title: (game as Game).i18n.localize("gcsga.apps.license_viewer"),
			template: "systems/gcsga/templates/license_viewer.hbs",
			width: 500,
			height: 600,
			resizable: false,
		});
	}
}
