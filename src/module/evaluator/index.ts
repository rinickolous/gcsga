import { Operator } from "@module/operator";
import { fixedOperators } from "@util/operators";
import { fixedFunctions } from "@util/functions";

class expressionOperand {
	constructor(data?: expressionOperand) {
		if (data) {
			this.value = data.value;
			this.unaryOp = data.unaryOp;
		}
		return this;
	}
}

interface expressionOperand {
	value: string;
	unaryOp: Operator | null;
}

class expressionOperator {
	constructor(data?: expressionOperatorDef) {
		if (data) {
			this.op = data.op;
			this.unaryOp = data.unaryOp;
		}
		return this;
	}
}

interface expressionOperator {
	op: Operator | null;
	unaryOp: Operator | null;
}

interface expressionOperatorDef {
	op: Operator | null;
	unaryOp: Operator | null;
}

class expressionTree {
	constructor(data?: expressionTreeDef) {
		if (data) {
			this.evaluator = data.evaluator;
			this.left = data.left;
			this.right = data.right;
			this.op = data.op ?? null;
			this.unaryOp = data.unaryOp ?? null;
		}
		return this;
	}
}

interface expressionTree {
	evaluator: Evaluator;
	left?: any;
	right?: any;
	op: Operator | null;
	unaryOp: Operator | null;
}

interface expressionTreeDef {
	evaluator: Evaluator;
	left?: any;
	right?: any;
	op?: Operator | null;
	unaryOp?: Operator | null;
}

type eFunction = (evaluator: Evaluator | null, options: string) => [any, Error];

class parsedFunction {
	constructor(data?: parsedFunctionDef) {
		if (data) {
			this.function = data.function;
			this.args = data.args;
			this.unaryOp = data.unaryOp;
		}
		return this;
	}
}

interface parsedFunction {
	function: eFunction;
	args: string;
	unaryOp: Operator | null;
}

interface parsedFunctionDef {
	function: eFunction;
	args: string;
	unaryOp: Operator | null;
}

export interface VariableResolver {
	resolveVariable: (variableName: string) => string;
}

export class VariableResolver {
	constructor(k: any) {
		if (k) return k;
		return this;
	}
}

export function evaluateToNumber(expression: string, resolver: VariableResolver): number {
	console.log("evaluate", expression);
	const [result, err] = new Evaluator({ resolver: resolver }).evaluate(expression);
	console.log("finished evaluate", expression, result, err);
	if (err) {
		console.error(err, `Unable to resolve ${expression}`);
		return 0;
	}
	if (typeof result == "number") return parseFloat(result.toFixed(4));
	else if (typeof parseFloat(result) == "number") return parseFloat(result);
	console.error(`Unable to resolve ${expression} to a number`);
	return 0;
}

const evalOperators = fixedOperators;
const evalFunctions = fixedFunctions;

export interface Evaluator {
	resolver?: VariableResolver;
	operators: Array<Operator>;
	operandStack: any[];
	functions: Map<string, eFunction>;
	operatorStack: expressionOperator[];
}

interface EvaluatorDef {
	resolver: VariableResolver;
	operators?: Array<Operator>;
	functions?: Map<string, eFunction>;
}

export class Evaluator {
	constructor(data?: EvaluatorDef) {
		this.resolver = data?.resolver;
		this.operators = data?.operators ?? evalOperators(true);
		this.functions = data?.functions ?? evalFunctions();
		return this;
	}

	evaluate(expression: string): [any, Error | null] {
		console.log("parse", expression);
		const err = this.parse(expression);
		console.log("parse", expression, err);
		if (err) return [null, err];
		while (this.operatorStack.length != 0) {
			this.processTree();
		}
		if (this.operandStack.length == 0) return ["", null];
		return this.evaluateOperand(this.operandStack[this.operandStack.length - 1]);
	}

	evaluateNew(expression: string): [any, Error | null] {
		const other = new Evaluator({
			resolver: this.resolver,
			operators: this.operators,
			functions: this.functions,
		} as EvaluatorDef);
		return other.evaluate(expression);
	}

	parse(expression: string): Error | null {
		let unaryOp: Operator | null = null;
		let haveOperand = false;
		let haveOperator = false;
		this.operandStack = [];
		this.operatorStack = [];
		let i = 0;
		while (i < expression.length) {
			const ch = expression[i];
			console.log(i, ch, haveOperand, haveOperator, this.operandStack, duplicate(this.operatorStack));
			if ([" ", "\t", "\n", "\r"].includes(ch)) {
				i++;
				continue;
			}
			const [opIndex, op] = this.nextOperator(expression, i, null);
			if (opIndex > i || opIndex == -1) {
				let err: Error | null;
				[i, err] = this.processOperand(expression, i, opIndex, unaryOp);
				if (err) return err;
				haveOperand = true;
				haveOperator = false;
				unaryOp = null;
			}
			if (opIndex == i) {
				if (op && op.evaluateUnary && (haveOperator || i == 0)) {
					i = opIndex + op.symbol.length;
					if (!unaryOp) return new Error(`Consecutive unary operators are not allowed at index ${i}`);
					unaryOp = op;
				} else {
					let err: Error | null;
					[i, err] = this.processOperator(expression, opIndex, op, haveOperand, unaryOp);
					if (err) return err;
					unaryOp = null;
				}
				if (!op || op.symbol != ")") {
					haveOperand = false;
					haveOperator = true;
				}
			}
		}
		return null;
	}

	nextOperator(expression: string, start: number, match: Operator | null): [number, Operator | null] {
		for (let i = start; i < expression.length; i++) {
			if (match) {
				if (match.match(expression, i, expression.length)) return [i, match];
			} else {
				for (const op of this.operators) {
					if (op.match(expression, i, expression.length)) return [i, op];
				}
			}
		}
		return [-1, null];
	}

	processOperand(
		expression: string,
		start: number,
		opIndex: number,
		unaryOp: Operator | null,
	): [number, Error | null] {
		if (opIndex == -1) {
			const text = expression.substring(start).trim();
			if (text == "") return [-1, new Error(`Expression is invalid at index ${start}`)];
			this.operandStack.push(new expressionOperand({ value: text, unaryOp: unaryOp }));
			return [expression.length, null];
		}
		const text = expression.substring(start, opIndex).trim();
		if (text == "") return [-1, new Error(`Expression is invalid at index ${start}`)];
		this.operandStack.push(new expressionOperand({ value: text, unaryOp: unaryOp }));
		return [opIndex, null];
	}

	processOperator(
		expression: string,
		index: number,
		op: Operator | null,
		haveOperand: boolean,
		unaryOp: Operator | null,
	): [number, Error | null] {
		if (haveOperand && op && op.symbol == "(") {
			let err: Error | null;
			[index, op, err] = this.processFunction(expression, index);
			if (err) return [-1, err];
			index += op?.symbol.length || 0;
			let tmp: number;
			[tmp, op] = this.nextOperator(expression, index, null);
			if (!op) return [index, null];
			index = tmp;
		}
		let stackOp: expressionOperator | null = null;
		switch (op!.symbol) {
			case "(":
				this.operatorStack.push(new expressionOperator({ op: op, unaryOp: unaryOp }));
				break;
			case ")":
				if (this.operatorStack.length > 0) stackOp = this.operatorStack[this.operatorStack.length - 1];
				while (stackOp && stackOp.op?.symbol != "(") {
					this.processTree();
					if (this.operatorStack && this.operatorStack.length > 0)
						stackOp = this.operatorStack[this.operatorStack.length - 1];
					else stackOp = null;
				}
				if (this.operatorStack.length == 0) return [-1, new Error(`Invalid expression at index ${index}`)];
				stackOp = this.operatorStack[this.operatorStack.length - 1];
				if (stackOp.op?.symbol != "(") return [-1, new Error(`Invalid expression at index ${index}`)];
				this.operatorStack.pop();
				if (!stackOp?.unaryOp) {
					const left = this.operatorStack.at(-1);
					this.operandStack.pop();
					this.operandStack.push(
						new expressionTree({
							evaluator: this,
							left: left,
							op: null,
							unaryOp: stackOp?.unaryOp,
						}),
					);
				}
				break;
			default:
				if (this.operatorStack.length > 0) {
					stackOp = this.operatorStack[this.operatorStack.length - 1];
					while (!!stackOp?.op?.precedence && !!op?.precedence && stackOp.op.precedence >= op.precedence) {
						this.processTree();
						if (this.operatorStack.length > 0) stackOp = this.operatorStack[this.operatorStack.length - 1];
						else stackOp = null;
					}
				}
				this.operatorStack.push(new expressionOperator({ op: op, unaryOp: unaryOp }));
		}
		return [index + op!.symbol.length, null];
	}

	processFunction(expression: string, opIndex: number): [number, Operator | null, Error | null] {
		let op: Operator | null = null;
		let parens = 1;
		let next = opIndex;
		while (parens > 0) {
			[next, op] = this.nextOperator(expression, next + 1, null);
			if (!op) return [-1, null, new Error(`Function not closed at index ${opIndex}`)];
			switch (op.symbol) {
				case "(":
					parens++;
					break;
				case ")":
					parens--;
					break;
				default:
					break;
			}
		}
		if (this.operandStack.length == 0) return [-1, null, new Error(`Invalid stack at index ${next}`)];
		const operand = this.operandStack[this.operandStack.length - 1];
		if (!operand) return [-1, null, new Error(`Unexpected operand stack value at index ${next}`)];
		this.operandStack.pop();
		const [f, exists] = [operand.value, this.functions.get(operand.value)];
		if (!exists) return [-1, null, new Error(`Function not defined: ${operand.value}`)];
		this.operandStack.push(
			new parsedFunction({
				function: f,
				args: expression.substring(opIndex + 1, next),
				unaryOp: operand.unaryOp,
			}),
		);
		return [next, op, null];
	}

	processTree() {
		let [left, right]: any = [null, null];
		if (this.operandStack.length > 0) right = this.operandStack.pop();
		if (this.operandStack.length > 0) left = this.operandStack.pop();
		const op = this.operatorStack.pop();
		this.operandStack.push(
			new expressionTree({
				evaluator: this,
				left: left,
				right: right,
				op: op!.op,
			}),
		);
	}

	evaluateOperand(operand: any): [any, Error | null] {
		console.log(operand);
		if (operand instanceof expressionTree) {
			let [left, err] = operand.evaluator!.evaluateOperand(operand.left);
			if (err) return [null, err];
			let right: any;
			[right, err] = operand.evaluator!.evaluateOperand(operand.right);
			if (err) return [null, err];
			if (operand.left && operand.right) {
				if (!operand.op?.evaluate) return [null, new Error(`Operator does ot have Evaluate function defined`)];
				let v: any;
				[v, err] = operand.op.evaluate(left, right);
				if (err) return [null, err];
				if (operand.unaryOp && operand.unaryOp.evaluateUnary) return operand.unaryOp.evaluateUnary(v);
				return [v, null];
			}
			let v: any;
			if (operand.right) v = left;
			else v = right;
			if (v) {
				if (operand.unaryOp && operand.unaryOp.evaluateUnary) [v, err] = operand.unaryOp.evaluateUnary(v);
				else if (operand.op && operand.op.evaluateUnary) [v, err] = operand.op.evaluateUnary(v);
				if (err) return [null, err];
			}
			if (!v) return [null, new Error(`Expression is invalid`)];
			return [v, null];
		} else if (operand instanceof expressionOperand) {
			const [v, err] = this.replaceVariables(operand.value);
			if (err) return [null, err];
			if (operand.unaryOp && operand.unaryOp.evaluateUnary) return operand.unaryOp.evaluateUnary(v);
			return [v, null];
		} else if (operand instanceof parsedFunction) {
			let [s, err] = this.replaceVariables(operand.args);
			if (err) return [null, err];
			let v: any;
			[v, err] = operand.function(this, s);
			if (err) return [null, err];
			if (operand.unaryOp && operand.unaryOp.evaluateUnary) return operand.unaryOp.evaluateUnary(v);
			return [v, null];
		} else {
			if (operand) return [null, new Error(`Invalid expression`)];
			return [null, null];
		}
	}

	replaceVariables(expression: string): [string, Error | null] {
		console.log(expression);
		let dollar = expression.indexOf("$");
		if (dollar == -1) return [expression, null];
		if (!this.resolver) return ["", new Error(`No variable resolver, yet variables present at index ${dollar}`)];
		while (dollar >= 0) {
			let last = dollar;
			for (let i = 0; i < expression.substring(dollar + 1).split("").length; i++) {
				const ch = expression.substring(dollar + 1).split("")[i];
				if (ch.match("[a-zA-Z.#]") || (i != 0 && ch.match("[0-9]"))) last = dollar + 1 + i;
				else break;
			}
			if (dollar == last) return ["", new Error(`Invalid variable at index ${dollar}`)];
			const name = expression.substring(dollar + 1, last + 1);
			console.log(this, this.resolver);
			const v = this.resolver.resolveVariable(name);
			if (v.trim() == "") return ["", new Error(`Unable to resolve variable $${name}`)];
			let buffer = "";
			if (dollar > 0) buffer += expression.substring(0, dollar);
			buffer += v;
			if (last + 1 < expression.length) buffer += expression.substring(last + 1);
			expression = buffer;
			dollar = expression.indexOf("$");
		}
		return [expression, null];
	}
}
