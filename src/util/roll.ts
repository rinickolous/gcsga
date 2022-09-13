import { ActorGURPS } from "@actor";
import { RollModifier, RollType, UserFlags } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { toWord } from "./misc";

/**
 * Master function to handle various types of roll
 * @param {StoredDocument<User>} user
 * @param {ActorGURPS} actor
 */
export async function handleRoll(
	user: StoredDocument<User> | null,
	actor: ActorGURPS,
	data: { [key: string]: any }
): Promise<void> {
	console.log(user, actor, data);
	switch (data.type) {
		case RollType.Modifier:
			return addModifier(user, actor, data);
		case RollType.Skill:
			return rollSkill(user, actor, data);
		case RollType.SkillRelative:
		case RollType.Spell:
		case RollType.SpellRelative:
		case RollType.Attack:
			return rollAttack(user, actor, data);
		case RollType.Damage:
			return rollDamage(user, actor, data);
	}
	if (data.type === RollType.Modifier) addModifier(user, actor, data);
}

/**
 * Handle adding modifiers via OTF
 * @param {StoredDocument<User>} user
 * @param {ActorGURPS} actor
 */
function addModifier(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }) {
	if (!user) return;
	throw new Error("Function not implemented.");
}

/**
 * Handles Skill Rolls
 * @param {StoredDocument<User>} user
 * @param {ActorGURPS} actor
 */
async function rollSkill(
	user: StoredDocument<User> | null,
	actor: ActorGURPS,
	data: { [key: string]: any }
): Promise<void> {
	// Const formula = "3d6";
	// const roll = Roll.create(formula);
	// console.log(user, actor, data);
	// await roll.evaluate({ async: true });
	// let rollTotal = roll.total;
	// const speaker = ChatMessage.getSpeaker({ actor: actor as any });
	// // Set up Chat Data
	// const chatData: { [key: string]: any } = {};
	// chatData.text = `<b>${data.item.name}</b> - ${item.skillLevel}/${item.relativeLevel}`;
	// chatData.success = "";
	// chatData.total = rollTotal;
	// chatData.margin = rollTotal;
	// console.log("chatData", chatData);
	// const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/skill-roll.hbs`, chatData);
	// console.log(roll.dice[0].results);
	// const messageData = {
	// 	user: user,
	// 	speaker: speaker,
	// 	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
	// 	content: message,
	// 	roll: JSON.stringify(roll),
	// 	sound: CONFIG.sounds.dice,
	// };
	// ChatMessage.create(messageData, {});
}

/**
 * Handle Attack Rolls.
 * @param {StoredDocument<User>} user
 * @param {ActorGURPS} actor
 */
async function rollAttack(
	user: StoredDocument<User> | null,
	actor: ActorGURPS,
	data: { [key: string]: any }
): Promise<void> {
	console.log("rollAttack", user, actor, data);
	const formula = "3d6";
	const roll = Roll.create(formula);
	await roll.evaluate({ async: true });
	let rollTotal = roll.total!;
	const speaker = ChatMessage.getSpeaker({ actor: actor });
	const level = data.weapon.skillLevel(false);
	const modifiers: Array<RollModifier & { class?: string }> = [
		...(user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]),
	];
	modifiers.forEach(m => {
		m.class = "zero";
		if (m.modifier > 0) m.class = "pos";
		if (m.modifier < 0) m.class = "neg";
	});
	const effectiveLevel = applyMods(level, user);
	const rolls = roll.dice[0].results.map(e => {
		return { result: e.result, word: toWord(e.result) };
	});
	console.log("rolls", rolls);

	// Set up Chat Data
	const chatData: { [key: string]: any } = {
		name: `${data.weapon.name}${data.weapon.usage ? ` - ${data.weapon.usage}` : ""}`,
		success: getSuccess(effectiveLevel, rollTotal),
		total: rollTotal,
		level: level,
		effectiveLevel: effectiveLevel,
		margin: Math.abs(level - rollTotal),
		actor: actor,
		item: data.item,
		weapon: data.weapon,
		rolls: rolls,
		modifiers: modifiers,
		// Modifier: modifier,
	};

	console.log("chatData", chatData);

	const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/attack-roll.hbs`, chatData);

	const messageData = {
		user: user,
		speaker: speaker,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		content: message,
		roll: JSON.stringify(roll),
		sound: CONFIG.sounds.dice,
	};
	ChatMessage.create(messageData, {});
}

/**
 * Handle Damage Rolls.
 * @param {StoredDocument<User>} user
 * @param {ActorGURPS} actor
 */
function rollDamage(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): void {
	throw new Error("Function not implemented.");
}

enum RollSuccess {
	Success = "success",
	Failure = "failure",
	CriticalSuccess = "critical_success",
	CriticalFailure = "critical_failure",
}

/**
 * Apply all modifiers to the level to get the effective level
 * @param {number} level
 * @param {StoredDocument<User>} user
 * @returns {number}
 */
function applyMods(level: number, user: StoredDocument<User> | null): number {
	const modStack: RollModifier[] = (user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? [];
	let effectiveLevel = level;
	modStack.forEach(m => {
		effectiveLevel += m.modifier;
	});
	return effectiveLevel;
}

// TODO: change from string to enum
/**
 * Check to see if the roll succeeded, and return the type of success/failure (normal/critical).
 * @param {number} level
 * @param {number} rollTotal
 * @returns {RollSuccess}
 */
function getSuccess(level: number, rollTotal: number): RollSuccess {
	if (rollTotal === 18) return RollSuccess.CriticalFailure;
	if (rollTotal <= 4) return RollSuccess.CriticalSuccess;
	if (level >= 15 && rollTotal <= 5) return RollSuccess.CriticalSuccess;
	if (level >= 16 && rollTotal <= 6) return RollSuccess.CriticalSuccess;
	if (level <= 15 && rollTotal === 17) return RollSuccess.CriticalFailure;
	if (rollTotal - level >= 10) return RollSuccess.CriticalFailure;
	if (level >= rollTotal) return RollSuccess.Success;
	return RollSuccess.Failure;
}
