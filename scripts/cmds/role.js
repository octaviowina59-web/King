const fs = require("fs-extra");
const { config, commands } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "role",
    aliases: ["setrole", "permission", "perm"],
    version: "1.1",
    author: "Camille Uchiha",
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
    if (!args[0] || !args[1]) {
      return message.reply("⚠️ Format incorrect.\nUtilisation : `role [nom_commande] [0-4]`\nExemple : `role slots 1` (pour restreindre slots aux admins).");
    }

    const targetCmdName = args[0].toLowerCase();
    const newRole = parseInt(args[1]);

    // Validation du niveau de rôle entré
    if (isNaN(newRole) || newRole < 0 || newRole > 4) {
      return message.reply("❌ Rôle invalide. Le rôle doit être un nombre entre 0 et 4.\n0: Tout le monde | 1: Admin Groupe | 2: Admin Bot | 3: Owner | 4: Dev");
    }

    // 🟢 Correction : Recherche de la commande dans l'arborescence correcte de GoatBot
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
      return message.reply(`❌ La commande "${targetCmdName}" n'existe pas ou n'est pas chargée.`);
    }

    // Sécurité : Empêcher de modifier cette commande ou la gestion des privilèges dev
    if (command.config.name === "role" || command.config.name === "developer" || command.config.name === "dev") {
      return message.reply("🚫 Sécurité : Vous ne pouvez pas modifier le rôle des commandes de gestion des droits fondamentaux.");
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
        "Tout le monde (0)", 
        "Admins de groupe (1)", 
        "Admins du bot (2)", 
        "Owners du bot (3)", 
        "Développeurs uniques (4)"
      ];
      return message.reply(`✅ Restriction appliquée !\n⚙️ Commande : \`${command.config.name}\`\n🔐 Niveau d'accès requis : ${roleNames[newRole]}`);
    } catch (error) {
      console.error(error);
      return message.reply("⚠️ Le rôle a été changé en mémoire, mais une erreur est survenue lors de la mise à jour de votre fichier de configuration.");
    }
  }
};


