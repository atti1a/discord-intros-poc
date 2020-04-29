'use strict';

const discord = require('discord.js');
const config = require('./config.json')

const client = new discord.Client();

const THIS_SHOULD_BE_A_DATABASE = {};

function getIntroId(user_id) {
    return new Promise((res, rej) => {
        if (user_id in THIS_SHOULD_BE_A_DATABASE) {
            res(THIS_SHOULD_BE_A_DATABASE[user_id]);
        } else {
            rej(`${user_id} does not have an introduction`);
        }
    });
}

function setIntroId(user_id, intro_id) {
    THIS_SHOULD_BE_A_DATABASE[user_id] = intro_id;
    return Promise.resolve()
}

function commandHandler(message) {
    const args = message.content.split(" ");

    switch(args[0]) {
        case "$bti":
            const user = message.mentions.users.first();
            const channel = message.guild.channels.cache.find(
                ch => ch.name === config.intro_channel_name
            );

            return getIntroId(user.id)
                .then(intro_id => channel.messages.fetch(intro_id))
                .then(m => message.channel.send(`Who is ${user.username}: ${m.content}`))

        default:
            return message.reply("You have no power here, but neither do I");
    }
}

function introHandler(message) {
    const guild = message.guild;

    if (!guild.available) {
        return Promise.reject("Guild is unavailable, something is wrong");
    }

    return setIntroId(message.author.id, message.id)
        .then(_ => guild.roles.fetch(config.bti_role_id))
        .then(r => guild.member(message.author).roles.add(r)));
}

function messageHandler(message) {
    let results = []

    if (message.content[0] == "$") {
        results.append(commandHandler(message));
    }

    if (message.channel.name == config.intro_channel_name) {
        results.append(introHandler(message));
    }

    Promise.all(results).catch(console.error)
}

client.on('message', messageHandler);
client.on('ready', () => {
  console.log('I am ready!');
});

client.login(config.token);
