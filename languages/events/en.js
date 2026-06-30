module.exports = {
	// Tu peux custom la langue ici ou direct dans les fichiers de commandes
	autoUpdateThreadInfo: {},
	checkwarn: {
		text: {
			warn: "Membre %1 déjà warn 3 fois et banni du groupe\n- Nom: %1\n- UID: %2\n- Pour débannir, utilise: \"%3warn unban <uid>\"",
			needPermission: "Le bot doit être admin pour kick les bannis"
	}
	},
	leave: {
		text: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",
			leaveType1: "a quitté le groupe",
			leaveType2: "a été kick du groupe"
	}
	},
	logsbot: {
		text: {
			title: "====== Logs Bot ======",
			added: "\n✅\nEvent: bot ajouté dans un nouveau groupe\n- Ajouté par: %1",
			kicked: "\n❌\nEvent: bot kick du groupe\n- Kick par: %1",
			footer: "\n- UID: %1\n- Groupe: %2\n- ID Groupe: %3\n- Heure: %4"
	}
	},
	onEvent: {},
	welcome: {
		text: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",
			welcomeMessage: "Merci de m'avoir ajouté au groupe!\nPréfixe bot: %1\nPour voir les commandes: %1help",
			multiple1: "toi",
			multiple2: "vous tous"
	}
	}
};
