const fs = require('fs');
const { get_text: gt } = require("../../lang/lang_helper")
const s = "commands.reload"
const commands_path = "./commands"

module.exports = {
    name: 'reload',
    description: async function (msg) { return await gt(msg, "help", s) },
    aliases: ['reloads', 'r'],
    args_needed: true,
    args_min_length: 1,
    usage: async function (msg) { return await gt(msg, "usage", s) },
    admin_only: true,
    async execute(msg, args) {
        const commandName = args[0].toLowerCase();
        const command = msg.client.commands.get(commandName)
            || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            return msg.channel.send(`${await gt(msg, "invalid_command", s)} \`${commandName}\`, ${msg.author}!`);
        }

        const commandFolders = fs.readdirSync(commands_path);
        const folderName = commandFolders.find(folder => fs.readdirSync(`${commands_path}/${folder}`).includes(`${commandName}.js`));

        delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

        try {
            const newCommand = require(`../${folderName}/${command.name}.js`);
            msg.client.commands.set(newCommand.name, newCommand);
            msg.channel.send(`\`${newCommand.name}\` ${await gt(msg, "success", s)}`);
        } catch (error) {
            console.error(error);
            msg.channel.send(`${await gt(msg, "fail", s)} \`${command.name}\`:\n\`${error.message}\``);
        }
    },
};