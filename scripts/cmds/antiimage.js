
const axios = require("axios");

module.exports = {
	config: {
		name: "antiimage",
		version: "2.2",
		author: "Camille 🤍",
		countDown: 5,
		role: 2, 
		shortDescription: { en: "Protection absolue avec détection du coupable" },
		category: "protection",
		guide: { en: "{pn} [on | off]" }
	},

	onStart: async function ({ message, event, args, threadsData, api }) {
		const { threadID } = event;
		const data = await threadsData.get(threadID);
		const mode = args[0]?.toLowerCase();

		if (mode === "on") {
			try {
				const threadInfo = await api.getThreadInfo(threadID);
				if (!threadInfo.imageSrc) {
					return message.reply("🍎 | Aucune image n'est présente pour y apposer le sceau.");
				}

				data.data.antiImage = true;
				data.data.imageOriginale = threadInfo.imageSrc; 
				await threadsData.set(threadID, data);
				
				message.reply("╔═══════ 🍎 ═══════╗\n   ⚡ **SHARINGAN ACTIVÉ** ⚡\n╚═══════ 🍎 ═══════╝\nLe Sceau de l'Amaterasu est apposé. Quiconque ose altérer cette vision sera démasqué et consumé. 🔥");

				return this.runMonitoring(api, threadID, threadsData);

			} catch (e) {
				return message.reply("⚠️ | Échec de l'invocation du Sharingan.");
			}
		} else if (mode === "off") {
			data.data.antiImage = false;
			await threadsData.set(threadID, data);
			return message.reply("╔═══════ 🍎 ═══════╗\n   🌀 **SCEAU ROMPU** 🌀\n╚═══════ 🍎 ═══════╝");
		}
		
		return message.reply("Utilise : antiimage [on | off]");
	},

	runMonitoring: async function (api, threadID, threadsData) {
		const check = setInterval(async () => {
			const data = await threadsData.get(threadID);
			
			if (!data || !data.data || data.data.antiImage !== true) {
				return clearInterval(check);
			}

			try {
				const threadInfo = await api.getThreadInfo(threadID);
				
				if (threadInfo.imageSrc !== data.data.imageOriginale) {
					// Extraction du nom du coupable depuis les logs récents ou les infos de groupe
					// Note : Si l'API ne donne pas l'auteur direct, on utilise un message générique d'intrusion
					const lastModifier = threadInfo.adminIDs.find(admin => admin.id !== api.getCurrentUserID()) || { id: "inconnu" };
					
					const response = await axios.get(data.data.imageOriginale, { responseType: "stream" });
					await api.changeGroupImage(response.data, threadID);
					
					api.sendMessage(`╔═══════ 🍎 ═══════╗\n   🚫 **INTRUSION DÉTECTÉE** 🚫\n╚═══════ 🍎 ═══════╝\nUne présence a tenté de modifier l'archive.\n\n⚡ **AMATERASU !** 🔥\nL'image a été restaurée par le Clan Uchiha.`, threadID);
				}
			} catch (err) {
				// Silence
			}
		}, 5000); 
	},

	onEvent: async function ({ event, api, threadsData, usersData }) {
		const { threadID, logMessageType, author } = event;

		if (logMessageType === "log:thread-icon") {
			const data = await threadsData.get(threadID);

			if (data.data && data.data.antiImage && author !== api.getCurrentUserID()) {
				try {
					const name = await usersData.getName(author);
					const response = await axios.get(data.data.imageOriginale, { responseType: "stream" });
					await api.changeGroupImage(response.data, threadID);

					return api.sendMessage(`╔═══════ 🍎 ═══════╗\n   🚫 **MODIFICATION BLOQUÉE** 🚫\n╚═══════ 🍎 ═══════╝\nL'utilisateur **${name}** a tenté de briser le sceau.\n\n⚡ **IZANAGI !** 🔥\nLa réalité est restaurée.`, threadID);
				} catch (err) {
					console.error(err);
				}
			}
		}
	}
};
