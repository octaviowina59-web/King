module.exports = {
	config: {
		name: "kick",
	version: "1.4",
	author: "NTKhang",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
	role: 1,
		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of chat box",
			fr: "Expulser un membre du groupe"
		},
		category: "box chat",
		guide: {
			vi: " {pn} @tags: dùng để kick những người được tag",
			en: " {pn} @tags: use to kick members who are tagged",
			fr: " {pn} @tag : pour expulser les personnes taguées"
		}
	},

	langs: {
		vi: {
			needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
	},
	en: {
			needAdmin: "Please add admin for bot before using this feature"
	},
	fr: {
			needAdmin: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nLe bot doit être admin du groupe pour utiliser cette commande\n🍓━━━━━━━━🍓`,
			needTag: `🍓━━━━━━━━🍓\n⚠️ 𝗘𝗥𝗘𝗨𝗥\nVeuillez taguer la personne à expulser\n🍓━━━━━━━━🍓`,
			success: `🍓━━━━━━━━🍓\n✅ 𝗘𝗫𝗣𝗨𝗟𝗦𝗜𝗢𝗡\n%1 a été expulsé du groupe\n🍓━━━━━━━━🍓`,
			successMulti: `🍓━━━━━━━━🍓\n✅ 𝗘𝗫𝗣𝗨𝗟𝗦𝗜𝗢𝗡\n%1 personne(s) ont été expulsées du groupe:\n%2\n🍓━━━━━━━━🍓`,
			cantKick: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nImpossible d'expulser %1\n🍓━━━━━━━━🍓`
	}
	},

	onStart: async function ({ message, event, args, threadsData, api, usersData, getLang }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));
		
		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				return "OK";
			}
			catch (e) {
				return "ERROR";
			}
	}

		if (!args[0]) {
			if (!event.messageReply)
				return message.reply(getLang("needTag"));
			const name = await usersData.getName(event.messageReply.senderID);
			const result = await kickAndCheckError(event.messageReply.senderID);
			if (result === "ERROR")
				return message.reply(getLang("cantKick", name));
			return message.reply(getLang("success", name));
	}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.reply(getLang("needTag"));
			
			const kicked = [];
			const failed = [];

			for (const uid of uids) {
				const name = await usersData.getName(uid);
				const result = await kickAndCheckError(uid);
				if (result === "OK")
					kicked.push(`• ${name}`);
				else
					failed.push(`• ${name}`);
			}

			if (kicked.length > 0) {
				if (kicked.length === 1)
					return message.reply(getLang("success", kicked[0].replace('• ', '')));
				else
					return message.reply(getLang("successMulti", kicked.length, kicked.join("\n")));
			}
			if (failed.length > 0)
				return message.reply(getLang("cantKick", failed.join(", ")));
		}
	}
};
