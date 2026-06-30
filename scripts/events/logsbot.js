const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
	version: "1.5",
	author: "NTKhang + Camille Uchiha",
		envConfig: {
			allow: true
	},
		category: "events"
	},

	langs: {
	vi: { ... },
	en: { ... },
	fr: {
			title: "====== Logs Bot ======",
			added: "\n✅\nEvent: bot ajouté dans un nouveau groupe\n- Ajouté par: %1",
			kicked: "\n❌\nEvent: bot kick du groupe\n- Kick par: %1",
			footer: "\n- UID: %1\n- Groupe: %2\n- ID Groupe: %3\n- Heure: %4"
	}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		if (
			(event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
			|| (event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == api.getCurrentUserID())
	) return async function () {
			let msg = getLang("title");
			const { author, threadID } = event;
			if (author == api.getCurrentUserID())
				return;
			let threadName;
			const { config } = global.GoatBot;

			if (event.logMessageType == "log:subscribe") {
				if (!event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
					return;
				threadName = (await api.getThreadInfo(threadID)).threadName;
				const authorName = await usersData.getName(author);
				msg += getLang("added", authorName);
			}
			else if (event.logMessageType == "log:unsubscribe") {
				if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID())
					return;
				const authorName = await usersData.getName(author);
				const threadData = await threadsData.get(threadID);
				threadName = threadData.threadName;
				msg += getLang("kicked", authorName);
			}
			const time = getTime("DD/MM/YYYY HH:mm:ss");
			msg += getLang("footer", author, threadName, threadID, time);

			for (const adminID of config.adminBot)
				api.sendMessage(msg, adminID);
	};
	}
};
