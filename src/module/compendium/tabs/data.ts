export type SortDirection = "asc" | "desc";

export interface OrderData {
	by: string;
	direction: SortDirection;
	/** The key must be present as an index key in the database */
	options: Record<string, string>;
}

export interface BaseFilterData {
	order: OrderData;
	search: {
		text: string;
	};
}
