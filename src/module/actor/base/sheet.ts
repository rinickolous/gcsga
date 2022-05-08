export class ActorSheetGURPS extends ActorSheet {
	/** @override */
	static get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		options.dragDrop.push(
			{ dragSelector: ".drag-handle" },
			{ dragSelector: ".item[draggable=true]" },
			{ dropSelector: ".item-list" },
			{ dropSelector: ".item" },
		);
		mergeObject(options, {
			classes: ["gcsga"],
		});
		return options;
	}

	protected override _onDragOver(event: DragEvent): void {
		//@ts-ignore
		const target = $(event.currentTarget);
		//@ts-ignore
		// console.log(target.parent());

		//@ts-ignore
		if (target.hasClass("item")) {
			//@ts-ignore
			target.addClass("redline");
		}
	}
	// 	//@ts-ignore
	// 	const $target = $(event.currentTarget);
	// 	//@ts-ignore
	// 	const $itemRef = $target.closest(".item");

	// 	//@ts-ignore
	// 	const targetElement = $target.get(0);
	// 	const previewElement = $itemRef.get(0);
	// 	if (previewElement && targetElement && targetElement !== previewElement) {
	// 		event.dataTransfer?.setDragImage(previewElement, 0, 0);
	// 		//@ts-ignore
	// 		mergeObject(targetElement.dataset, previewElement.dataset);
	// 	}
	// }
}
