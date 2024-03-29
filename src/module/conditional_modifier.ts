export class CondMod {
	constructor(source: string, from: string, amount: number) {
		this.from = from
		this.amounts = [amount]
		this.sources = [source]
	}

	add(source: string, amount: number): void {
		this.amounts.push(amount)
		this.sources.push(source)
	}

	get total(): number {
		return this.amounts.reduce((partialSum, a) => partialSum + a, 0)
	}
}

export interface CondMod {
	from: string
	amounts: number[]
	sources: string[]
}
