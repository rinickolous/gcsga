import { ActorGURPS } from "@actor";
import { RollType } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { toWord } from "./misc";

export async function handleRoll(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): Promise<void> {
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
	if (data.type == RollType.Modifier) addModifier(user, actor, data);
}

function addModifier(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }) {
	if (!user) return;
	throw new Error("Function not implemented.");
}

async function rollSkill(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): Promise<void> {
	// const formula = "3d6";
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

async function rollAttack(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): Promise<void> {
	console.log("rollAttack", user, actor, data);
	const formula = "3d6";
	const roll = Roll.create(formula);
	await roll.evaluate({ async: true });
	let rollTotal = roll.total!;
	const speaker = ChatMessage.getSpeaker({ actor: actor });

	const level = data.weapon.skillLevel(false);
	const rolls = roll.dice[0].results.map(e => {
		return { result: e.result, word: toWord(e.result) };
	});
	console.log("rolls", rolls);

	// Set up Chat Data
	const chatData: { [key: string]: any } = {
		name: `${data.weapon.name}${data.weapon.usage ? " - " + data.weapon.usage : ""}`,
		success: getSuccess(level, rollTotal),
		total: rollTotal,
		level: level,
		margin: Math.abs(level - rollTotal),
		actor: actor,
		item: data.item,
		weapon: data.weapon,
		rolls: rolls,
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

function rollDamage(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): void {
	throw new Error("Function not implemented.");
}

// TODO: change from string to enum
function getSuccess(level: number, rollTotal: number): string {
	if (rollTotal == 18) return "critical_failure";
	if (rollTotal <= 4) return "critical_success";
	if (level >= 15 && rollTotal <= 5) return "critical_success";
	if (level >= 16 && rollTotal <= 6) return "critical_success";
	if (level <= 15 && rollTotal == 17) return "critical_failure";
	if (rollTotal - level >= 10) return "critical_failure";
	if (level >= rollTotal) return "success";
	return "failure";
}
