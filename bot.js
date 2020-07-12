// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const boosterCut = 20;
// webhook messages drops here (channel id)
const hookForm = "731543421340221521";
// routing to booster channel
const webhookToChannelId = "731523810662154311";

client.login(process.env.DISCORD_TOKEN);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getChannelbyId(channelId) {
    return client.channels.cache.get(channelId);
}

function modifyEmbed(embed) {
    /*// What are those coming from webhook
    console.log(embed.title + " embed message");
    let i = 0;
    embed.fields.forEach(element => {
        console.log(i + "- " + element.name + " " + element.value);
        i++;
    });*/

    // Modify hooked message from webhook channel
    var newEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(embed.title)
        //.setDescription('Some description here')
        .setThumbnail('https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png')
        // TODO Generic list
        .addFields(
            // Discord Tag
            //{ name: embed.fields[0].name, value: embed.fields[0].value, inline: true },
            // Faction
            { name: embed.fields[1].name, value: embed.fields[1].value, inline: true },
            // Keystone Level
            { name: embed.fields[2].name, value: embed.fields[2].value, inline: true },
            // Dungeon Key
            { name: embed.fields[3].name, value: embed.fields[3].value, inline: true },
            // Armor Stacked
            { name: embed.fields[4].name, value: embed.fields[4].value, inline: true },
            // Number Of Boost
            { name: embed.fields[5].name, value: embed.fields[5].value, inline: true },
            // Boost Price
            { name: embed.fields[6].name, value: embed.fields[6].value, inline: true },
            // TODO Booster Cut
            { name: "Booster Cut", value: toString(parseFloat(embed.fields[6].value) / boosterCut), inline: true },
            // Realm
            { name: embed.fields[7].name, value: embed.fields[7].value, inline: true },
            // Char to Whisper /w %nick
            { name: embed.fields[8].name, value: embed.fields[8].value, inline: true },
            // Note
            { name: embed.fields[11].name, value: embed.fields[11].value, inline: true }
        )
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('BoostId: ', 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
    return newEmbed
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Webhook to embed message
client.on('message', async message => {
    // webhook-1 channel
    if (message.channel.id === hookForm) {
        // Is that message comes from webhook
        if (message.webhookID) {
            // Get webhook post
            var msg = (await message.fetch());
            // Get embeds on post
            var embed = new Discord.MessageEmbed(msg.embeds[0]);
            // modify embeds for advertise
            var newEmbed = modifyEmbed(embed);
            // Get channel with by Id
            //var messageToChannel = getChannelbyId(webhookToChannelId);
            // Send, new modified message to the specific channel
            try {
                //messageToChannel.send(newEmbed);
                client.channels.cache.get(webhookToChannelId).send(newEmbed);
            } catch (error) {
                console.log(newEmbed + " " + error);
            }
        }
    }
});

// Add react to Embed Message
client.on('message', message => {
    // Add react only specific channel
    if (message.channel.id === webhookToChannelId) {
        // Modify footer of message for boostId
        message.edit(message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png'));
        // Add react to the message
        message.react('✅').then(() =>
            message.react('731617839370469446'),
            message.react('731617839290515516'),
            message.react('731617839596961832'));
    }
});

// ReactionAdd Event Listener
client.on('messageReactionAdd', async (reaction, user) => {
    const filter = (reaction, user) => {
        return ['731617839370469446', '731617839290515516', '731617839596961832']
            .includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (reaction.partial) {
        console.log(`Reaction is partial: ${reaction.partial}`);
        // If the message this reaction belongs to was removed the fetching 
        // might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // Now the message has been cached and is fully available
    if(reaction.count > 1){
        //var tmpUser = (await reaction.users.fetch()).get(1);
        //var tmpUser2 = (await reaction.users.fetch());
        //console.log("***tmpUser2: " + tmpUser2.map(u => u.toString()));
        //console.log("***tmpUser3: " + tmpUser3.username); 
        var tmpUser = (await reaction.users.fetch(10, 1, 20)).first();
        
        // DPS Boosters
        if (reaction.emoji.id === '731617839370469446'){
            console.log(`DONE! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        } // Tank Boosters
        else if (reaction.emoji.id === '731617839290515516'){
            console.log(`DONE! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        } // Healer Boosters
        else if (reaction.emoji.id === '731617839596961832') {
            console.log(`DONE! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        } 
        else if (reaction.emoji.name === '✅') {
            console.log(`ADVERTISE ${reaction.message.id} CLOSED! `)
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        console.log(`Reaction is partial: ${reaction.partial}`);
        // If the message this reaction belongs to was removed the fetching 
        // might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }
    /*
    // Now the message has been cached and is fully available
    if (reaction.count >= 1) {
        //var tmpUser = (await reaction.users.fetch()).get(1);
        //var tmpUser2 = (await reaction.users.fetch());
        //console.log("***tmpUser2: " + tmpUser2.map(u => u.toString()));
        //console.log("***tmpUser3: " + tmpUser3.username); 
        var tmpUser = (await reaction.users.fetch(10, 1, 20)).first();

        // DPS Boosters
        if (reaction.emoji.id === '731617839370469446') {
            console.log(`REMOVED! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        } // Tank Boosters
        else if (reaction.emoji.id === '731617839290515516') {
            console.log(`REMOVED! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        } // Healer Boosters
        else if (reaction.emoji.id === '731617839596961832') {
            console.log(`REMOVED! BoostId= ${reaction.message.id} - @${tmpUser.username}#${tmpUser.discriminator} user got ${reaction.emoji.name} job!`);
        }
        else if (reaction.emoji.name === '✅') {
            console.log(`ADVERTISE ${reaction.message.id} CLOSED! `)
        }
    }*/
});