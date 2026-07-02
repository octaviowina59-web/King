Cmd install push.js const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "push",
    aliases: ["file", "explore", "folder", "f"],
    version: "1.3",
    author: "Camille Uchiha",
    countDown: 3,
    role: 2, // 2 = Administrateurs du Bot
    description: {
      en: "Explore, view, or delete bot system files and directories from the chat",
      fr: "Explorer, lire ou supprimer des fichiers et dossiers du système du bot depuis le chat"
    },
    category: "admin",
    guide: {
      en: "Use:\n{pn} : List root files\n{pn} view [filename] : View file content\n{pn} delete [filename] : Delete a file",
      fr: "Utilisation :\n{pn} : Lister la racine du serveur\n{pn} view [nom_fichier] : Lire le contenu d'un fichier\n{pn} delete [nom_fichier] : Supprimer un fichier"
    }
  },

  onStart: async function ({ message, args }) {
    const rootPath = path.resolve("./");
    let action = args[0];

    // --- ACTION : LIRE UN FICHIER ---
    if (action === "view" || action === "read") {
      const target = args.slice(1).join(" ");
      if (!target) return message.reply("⚠️ Spécifiez le nom ou le chemin du fichier à lire.");
      const filePath = path.join(rootPath, target);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        return message.reply("❌ Fichier introuvable ou il s'agit d'un dossier.");
      }

      try {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.length > 3900) {
          const tempPath = path.join(rootPath, "scripts", "cmds", "cache", `view_${path.basename(filePath)}.txt`);
          fs.ensureDirSync(path.dirname(tempPath));
          fs.writeFileSync(tempPath, content);
          return message.reply({
            body: `📄 Le fichier \`${target}\` est trop long. Voici son contenu :`,
            attachment: fs.createReadStream(tempPath)
          }, () => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          });
        }
        return message.reply(`📄 **[ CONTENU : ${target} ]**\n━━━━━━━━━━━━━━━\n\`\`\`text\n${content}\n\`\`\``);
      } catch (e) {
        return message.reply(`❌ Erreur lors de la lecture : ${e.message}`);
      }
    }

    // --- ACTION : SUPPRIMER UN FICHIER ---
    if (action === "delete" || action === "del") {
      const target = args.slice(1).join(" ");
      if (!target) return message.reply("⚠️ Spécifiez le fichier ou dossier à supprimer.");
      const filePath = path.join(rootPath, target);

      if (!fs.existsSync(filePath)) return message.reply("❌ Fichier ou dossier introuvable.");
      
      if (target === "index.js" || target === "package.json" || target === "config.json") {
        return message.reply("🚫 Action refusée : Ce fichier est vital pour la survie du bot.");
      }

      try {
        fs.removeSync(filePath);
        return message.reply(`🗑️ **Succès** : \`${target}\` a été supprimé définitivement.`);
      } catch (e) {
        return message.reply(`❌ Impossible de supprimer : ${e.message}`);
      }
    }

    // --- 🟢 LOGIQUE D'EXPLORATION ET REDIRECTION AUTO ---
    const fullPathInput = args.join(" ");
    let currentDir = fullPathInput ? path.join(rootPath, fullPathInput) : rootPath;

    // Redirection intelligente : Si l'utilisateur saisit un fichier sans le mot-clé "view" (ex: push scripts/cmds/out)
    if (fs.existsSync(currentDir) && fs.statSync(currentDir).isFile()) {
      args.unshift("view"); // On ajoute "view" au début des arguments
      return this.onStart({ message, args }); // On relance la fonction
    }

    // Si l'utilisateur a tapé un nom sans l'extension .js (ex: push scripts/cmds/out)
    if (!fs.existsSync(currentDir) && fs.existsSync(currentDir + ".js")) {
      args[args.length - 1] = args[args.length - 1] + ".js"; // On corrige l'argument
      args.unshift("view");
      return this.onStart({ message, args });
    }

    if (!fs.existsSync(currentDir) || !fs.statSync(currentDir).isDirectory()) {
      return message.reply(`❌ Dossier introuvable.\n💡 Rappel : Pour voir les commandes, tape : \`push scripts/cmds\``);
    }

    try {
      const items = fs.readdirSync(currentDir);
      if (items.length === 0) return message.reply("📁 Ce dossier est vide.");

      let msg = `📂 **[ EXPLORATEUR : ${fullPathInput || "RACINE"} ]**\n━━━━━━━━━━━━━━━━━━━━\n`;
      const folders = [];
      const files = [];

      items.forEach(item => {
        const isDir = fs.statSync(path.join(currentDir, item)).isDirectory();
        if (isDir) folders.push(`📁 ${item}`);
        else files.push(`📄 ${item}`);
      });

      msg += [...folders, ...files].join("\n");
      msg += `\n━━━━━━━━━━━━━━━━━━━━\n💡 *Aide : Taper \`push view [chemin]\` pour lire un fichier.*`;
      return message.reply(msg);
    } catch (e) {
      return message.reply(`❌ Erreur d'exploration : ${e.message}`);
    }
  }
};
