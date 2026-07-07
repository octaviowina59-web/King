const axios = require('axios');
const defaultEmojiTranslate = "🍓";

module.exports = {
	config: {
		name: "translate",
	aliases: ["trans"],
		version: "1.6",
		author: "NTKhang",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
	role: 0,
		description: {
			vi: "Dịch văn bản sang ngôn ngữ mong muốn",
			en: "Translate text to the desired language",
			fr: "Traduire un texte dans la langue souhaitée"
	},
		category: "utility",
	guide: {
			vi: " {pn} <văn bản>: Dịch văn bản sang ngôn ngữ của box chat bạn hoặc ngôn ngữ mặc định của bot"
				+ "\n {pn} <văn bản> -> <ISO 639-1>: Dịch văn bản sang ngôn ngữ mong muốn",
			en: " {pn} <text>: Translate text to the language of your chat box or the default language of the bot"
				+ "\n {pn} <text> -> <ISO 639-1>: Translate text to the desired language",
			fr: " {pn} <texte>: Traduire le texte dans la langue du groupe ou par défaut"
				+ "\n {pn} <texte> -> <ISO 639-1>: Traduire dans la langue souhaitée"
				+ "\n Répondre à un message pour traduire son contenu"
				+ "\n 𝗘𝘅𝗲𝗺𝗽𝗹𝗲:"
				+ "\n {pn} hello -> fr"
				+ "\n {pn} -r [on | off]: Activer/désactiver la traduction par réaction"
				+ "\n {pn} -r set <emoji>: Définir l'emoji de traduction"
	}
	},

	langs: {
	vi: {
			translateTo: "🌐 Dịch từ %1 sang %2",
			invalidArgument: "✗ Sai cú pháp, vui lòng chọn on hoặc off",
			turnOnTransWhenReaction: `✓ Đã bật tính năng dịch tin nhắn khi thả cảm xúc, thử thả cảm xúc \"${defaultEmojiTranslate}\" vào tin nhắn bắt kỳ để dịch nó`,
			turnOffTransWhenReaction: "✓ Đã tắt tính năng dịch tin nhắn khi thả cảm xúc",
			inputEmoji: "🌀 Hãy thả cảm xúc vào tin nhắn này để đặt emoji đó làm emoji dịch tin nhắn",
			emojiSet: "✓ Đã đặt emoji dịch tin nhắn là %1"
	},
	en: {
			translateTo: "🌐 Translate from %1 to %2",
			invalidArgument: "✗ Invalid argument, please choose on or off",
			turnOnTransWhenReaction: `✓ Turn on translate message when reaction, try to react \"${defaultEmojiTranslate}\" to any message to translate it`,
			turnOffTransWhenReaction: "✓ Turn off translate message when reaction",
			inputEmoji: "🌀 Please react to this message to set that emoji as emoji to translate message",
			emojiSet: "✓ Emoji to translate message is set to %1"
	},
	fr: {
			translateTo: `🍓━━━━━━━━🍓\n🌐 𝗧𝗥𝗔𝗗𝗨𝗖𝗧𝗜𝗢𝗡\nDe %1 vers %2\n🍓━━━━━━━━🍓`,
			invalidArgument: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nArgument invalide. Utilisez: on ou off\n🍓━━━━━━━━🍓`,
			turnOnTransWhenReaction: `🍓━━━━━━━━🍓\n✅ 𝗔𝗖𝗧𝗜𝗩𝗘́\nTraduction par réaction activée!\n\nRéagis avec \"${defaultEmojiTranslate}\" sur un message pour le traduire\n🍓━━━━━━━━🍓`,
			turnOffTransWhenReaction: `🍓━━━━━━━━🍓\n❌ 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́\nTraduction par réaction désactivée\n🍓━━━━━━━━🍓`,
			inputEmoji: `🍓━━━━━━━━🍓\n🌀 𝗖𝗢𝗡𝗙𝗜𝗚\nRéagis à ce message avec l'emoji que tu veux utiliser pour traduire\n🍓━━━━━━━━🍓`,
			emojiSet: `🍓━━━━━━━━🍓\n✅ 𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗘́\nEmoji de traduction défini sur: %1\n🍓━━━━━━━━🍓`
	}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, commandName }) {
		if (["-r", "-react", "-reaction"].includes(args[0])) {
			if (args[1] == "set") {
				return message.reply(getLang("inputEmoji"), (err, info) =>
					global.GoatBot.onReaction.set(info.messageID, {
						type: "setEmoji",
						commandName,
						messageID: info.messageID,
						authorID: event.senderID
					})
				);
			}
			const isEnable = args[1] == "on"? true : args[1] == "off"? false : null;
			if (isEnable == null)
				return message.reply(getLang("invalidArgument"));
			await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
			return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
		}
		const { body = "" } = event;
		let content;
		let langCodeTrans;
		const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

		if (event.messageReply) {
			content = event.messageReply.body;
			let lastIndexSeparator = body.lastIndexOf("->");
			if (lastIndexSeparator == -1)
				lastIndexSeparator = body.lastIndexOf("=>");

			if (lastIndexSeparator != -1 && (body.length - lastIndexSeparator == 4 || body.length - lastIndexSeparator == 5))
				langCodeTrans = body.slice(lastIndexSeparator + 2);
			else if ((args[0] || "").match(/\w{2,3}/))
				langCodeTrans = args[0].match(/\w{2,3}/)[0];
			else
				langCodeTrans = langOfThread;
		}
		else {
			content = event.body;
			let lastIndexSeparator = content.lastIndexOf("->");
			if (lastIndexSeparator == -1)
				lastIndexSeparator = content.lastIndexOf("=>");

			if (lastIndexSeparator != -1 && (content.length - lastIndexSeparator == 4 || content.length - lastIndexSeparator == 5)) {
				langCodeTrans = content.slice(lastIndexSeparator + 2);
				content = content.slice(content.indexOf(args[0]), lastIndexSeparator);
			}
			else
				langCodeTrans = langOfThread;
		}

		if (!content)
			return message.SyntaxError();
		translateAndSendMessage(content, langCodeTrans, message, getLang);
	},

	onChat: async ({ event, threadsData }) => {
		if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction"))
			return;
		global.GoatBot.onReaction.set(event.messageID, {
			commandName: 'translate',
			messageID: event.messageID,
			body: event.body,
			type: "translate"
		});
	},

	onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
		switch (Reaction.type) {
			case "setEmoji": {
				if (event.userID != Reaction.authorID)
					return;
				const emoji = event.reaction;
				if (!emoji)
					return;
				await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
				return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
			}
			case "translate": {
				const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🍓";
				if (event.reaction == emojiTrans) {
					const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
					const content = Reaction.body;
					Reaction.delete();
					translateAndSendMessage(content, langCodeTrans, message, getLang);
				}
			}
		}
	}
};

async function translate(text, langCode) {
	const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
	return {
		text: res.data[0].map(item => item[0]).join(''),
	lang: res.data[2]
	};
}

async function translateAndSendMessage(content, langCodeTrans, message, getLang) {
	const { text, lang } = await translate(content.trim(), langCodeTrans.trim());
	return message.reply(`${text}\n\n${getLang("translateTo", lang, langCodeTrans)}`);
}
