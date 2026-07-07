const axios = require("axios");
const fs = require("fs");

module.exports = {
	config: {
		name: "approve",
	aliases: ["pending", "pend", "pe"],
		version: "2.1.0",
	author: "Neoaz 🐊",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
		role: 2,
		shortDescription: "Gérer les demandes en attente",
		longDescription: "Approuver ou rejeter les demandes d'utilisateurs ou de groupes avec une interface propre.",
		category: "utility",
	guide: {
			fr: "{pn} user : Voir les utilisateurs en attente\n{pn} thread : Voir les groupes en attente\n{pn} all : Voir tout"
		}
	},

	onReply: async function ({ message, api, event, Reply }) {
		const { author, pending, messageID } = Reply;
		if (String(event.senderID)!== String(author)) return;

		const { body, threadID } = event;

		if (body.trim().toLowerCase() === "c") {
			api.unsendMessage(messageID);
			return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗔𝗡𝗡𝗨𝗟𝗘́\nOpération annulée!\n🍓━━━━━━━━🍓`);
		}

		const indexes = body.split(/\s+/).map(Number);
		if (isNaN(indexes[0])) return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nEntrée invalide! Entrez des numéros valides.\n🍓━━━━━━━━🍓`);

		let count = 0;
		const prefix = global.GoatBot.config.prefix || "/";

		for (const idx of indexes) {
			if (idx <= 0 || idx > pending.length) continue;

			const target = pending[idx - 1];
			try {
				await api.sendMessage(
					`🍓━━━━━━━━🍓\n『 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 』\n🍓━━━━━━━━🍓\n\n✅ Votre demande a été approuvée par l'Admin!\n\nTapez ${prefix}help pour voir toutes les commandes.\n\nBon usage du Bot!\n🍓━━━━━━━━🍓`,
					target.threadID
				);

				await api.changeNickname(
					`${global.GoatBot.config.nickNameBot || "Bot"}`,
					target.threadID,
					api.getCurrentUserID()
				);
				count++;
			} catch (err) {
				count++;
			}
		}

		return message.reply(`🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗖𝗖𝗘̀𝗦\n${count} ${count > 1? "demande(s) approuvée(s)" : "demande approuvée"}!\n🍓━━━━━━━━🍓`);
	},

	onStart: async function ({ message, api, event, args, usersData }) {
		const { threadID, messageID } = event;
		const type = args[0]?.toLowerCase();

		if (!type ||!["user", "thread", "all"].some(t => type.startsWith(t))) {
			return message.reply(`🍓━━━━━━━━🍓\n📖 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡\n\n${this.config.name} user : Approuver des utilisateurs\n${this.config.name} thread : Approuver des groupes\n${this.config.name} all : Approuver tout\n🍓━━━━━━━━🍓`);
		}

		try {
			const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
			const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
			const list = [...spam,...pending];

			let filteredList = [];
			if (type.startsWith("u")) filteredList = list.filter((t) =>!t.isGroup);
			else if (type.startsWith("t")) filteredList = list.filter((t) => t.isGroup);
			else filteredList = list;

			if (filteredList.length === 0) return message.reply(`🍓━━━━━━━━🍓\n⚠️ 𝗜𝗡𝗙𝗢\nAucune demande en attente dans cette catégorie.\n🍓━━━━━━━━🍓`);

			let msg = `🍓━━━━━━━━🍓\n『 𝗗𝗘𝗠𝗔𝗡𝗗𝗘𝗦 𝗘𝗡 𝗔𝗧𝗘𝗡𝗧𝗘 』\n🍓━━━━━━━━🍓\n\n`;

			for (let i = 0; i < filteredList.length; i++) {
				const name = filteredList[i].name || (await usersData.getName(filteredList[i].threadID)) || "Utilisateur Inconnu";
				msg += `[ ${i + 1} ] ${name}\n`;
			}

			msg += `\n🍓━━━━━━━━🍓\n➥ Répondez avec les numéros (ex: 1 2)\n➥ Répondez "c" pour Annuler.\n🍓━━━━━━━━🍓`;

			return api.sendMessage(msg, threadID, (error, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					pending: filteredList,
				});
			}, messageID);

		} catch (error) {
			return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nÉchec de récupération de la liste en attente.\n🍓━━━━━━━━🍓`);
		}
	},
};
