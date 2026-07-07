const fs = require("fs-extra");
const { config, commands } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "role",
		aliases: ["setrole", "permission", "perm"],
	version: "1.2",
	author: "Camille Uchiha",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
		role: 4, // 4 = Strictement réservé aux Développeurs du bot
		description: {
			en: "Change the required role level of a specific command",
			fr: "Modifier le niveau de rôle requis pour une commande spécifique"
		},
		category: "owner",
	guide: {
			en: "Use: {pn} [cmdName] [0 | 1 | 2 | 3 | 4]\nRoles:\n0: All\n1: Group Admins\n2: Bot Admins\n3: Bot Owners\n4: Developers",
			fr: "Utilisation : {pn} [NomCommande] [0 | 1 | 2 | 3 | 4]\nRôles :\n0 : Tout le monde\n1 : Admins groupe\n2 : Admins bot\n3 : Owners bot\n4 : Développeurs"
	}
	},

	onStart: async function ({ message, args }) {
		if (!args[0] ||!args[1]) {
			return message.reply(`🍓━━━━━━━━🍓\n⚠️ 𝗘𝗥𝗘𝗨𝗥\nFormat incorrect.\n\n𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗶𝗼𝗻 : \`${this.config.name} [nom_commande] [0-4]\`\n\n𝗘𝘅𝗲𝗺𝗽𝗹𝗲 : \`${this.config.name} slots 1\`\n🍓━━━━━━━━🍓`);
	}

		const targetCmdName = args[0].toLowerCase();
		const newRole = parseInt(args[1]);

	// Validation du niveau de rôle entré
		if (isNaN(newRole) || newRole < 0 || newRole > 4) {
			return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nRôle invalide. Le rôle doit être entre 0 et 4.\n\n0: Tout le monde\n1: Admin Groupe\n2: Admin Bot\n3: Owner\n4: Dev\n🍓━━━━━━━━🍓`);
	}

	// Recherche de la commande
		let command = commands.get(targetCmdName);
		
		// Si non trouvé par le nom, recherche par alias
		if (!command) {
			for (const [name, cmd] of commands.entries()) {
				if (cmd.config.aliases && cmd.config.aliases.includes(targetCmdName)) {
					command = cmd;
					break;
				}
			}
	}

		if (!command) {
			return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nLa commande \`${targetCmdName}\` n'existe pas ou n'est pas chargée.\n🍓━━━━━━━━🍓`);
		}

		// Sécurité : Empêcher de modifier cette commande ou la gestion des privilèges dev
		if (command.config.name === "role" || command.config.name === "developer" || command.config.name === "dev") {
			return message.reply(`🍓━━━━━━━━🍓\n🚫 𝗦𝗘́𝗖𝗨𝗥𝗜𝗧𝗘́\nVous ne pouvez pas modifier le rôle des commandes de gestion des droits fondamentaux.\n🍓━━━━━━━━🍓`);
		}

		// 1. Surcharge immédiate du rôle en mémoire vive
		command.config.role = newRole;

		// 2. Préparation de la sauvegarde persistante
		if (!config.commandRoles) {
			config.commandRoles = {};
		}
		
		config.commandRoles[command.config.name] = newRole;

		try {
			fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
			
			const roleNames = [
				"🌐 Tout le monde (0)",
				"👑 Admins de groupe (1)",
				"🤖 Admins du bot (2)",
				"💎 Owners du bot (3)",
				"🍓 Développeurs uniques (4)"
			];
			return message.reply(`🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗖𝗘̀𝗦\n⚙️ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝗲 : \`${command.config.name}\`\n🔐 𝗔𝗰𝗰𝗲̀𝘀 𝗿𝗲𝗾𝘂𝗶𝘀 : ${roleNames[newRole]}\n🍓━━━━━━━━🍓`);
		} catch (error) {
			console.error(error);
			return message.reply(`🍓━━━━━━━━🍓\n⚠️ 𝗔𝗩𝗘𝗥𝗧𝗜𝗦𝗘𝗠𝗘𝗡𝗧\nLe rôle a été changé en mémoire, mais erreur lors de la sauvegarde du fichier config.\n🍓━━━━━━━━🍓`);
		}
	}
};
