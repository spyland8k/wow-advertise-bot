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
            { name: embed.fields[11].name, value: embed.fields[11].value, inline: true },
            // EMPTY AREA
            { name: 'BOOSTERS', value: '\u200B' }
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
            message.react('731617839290515516'), // DPS
            message.react('731617839596961832'), // TANK
            message.react('731617839370469446'));// HEALER
    }
});

var dpsBoosters = Array();
var dpsUsers = Array();
var tankBoosters = Array();
var tankUsers = Array();
var healerBoosters = Array();
var healerUsers = Array();

async function addDps(reaction, user) {
    if (!tankUsers.includes(user) && !healerUsers.includes(user)) {
        if (dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            dpsBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    }
    else if (!healerUsers.includes(user) && !dpsBoosters.includes(user) && !tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            dpsBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    }
}

async function addTank(reaction, user) {
    if (!dpsUsers.includes(user) && !healerUsers.includes(user)) {
        if (tankBoosters.length == 0) {
            // Get first user in tankBoosters
            tankBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    } 
    else if (!tankUsers.includes(user) && !dpsBoosters.includes(user) && !healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (tankBoosters.length == 0) {
            // Get first user in tankBoosters
            tankBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    }
}

async function addHealer(reaction, user) {
    if (!dpsUsers.includes(user) && !tankUsers.includes(user)) {
        if (healerBoosters.length == 0) {
            // Get first user in healerBoosters
            healerBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    }
    else if (!tankUsers.includes(user) && !dpsBoosters.includes(user) && !healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (healerBoosters.length == 0) {
            // Get first user in healerBoosters
            healerBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    } 
    else if (!dpsUsers.includes(user) && !tankBoosters.includes(user) && !healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (healerBoosters.length == 0) {
            // Get first user in healerBoosters
            healerBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await reaction.message.edit(tmpEmbed);
        }
    }
}

async function removeDps(reaction, user) {
    if (dpsUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (dpsBoosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await reaction.message.edit(tmpEmbed);

            // Remove user from dpsBooster
            dpsBoosters.shift();
            // Remove user from dpsUsers
            dpsUsers.shift();

            // Add first user at dpsUser queue
            if (dpsUsers.length > 0) {
                await addDps(reaction, dpsUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (tankUsers.includes(user) && tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!healerUsers.includes(user)) {
                    await addTank(reaction, user);
                }
            }
            // If user choosed another reactions when release healer then add to him
            
            if (healerUsers.includes(user) && healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!tankUsers.includes(user)) {
                    await addHealer(reaction, user);
                }
            }

            if (tankUsers.includes(user) && healerUsers.includes(user)) {
                if (tankBoosters.length == 0 && healerBoosters.length == 0) {
                    await addHealer(reaction, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (dpsUsers.length > 0) {
            dpsUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeTank(reaction, user) {
    if (tankUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (tankBoosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:tank:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await reaction.message.edit(tmpEmbed);

            // Remove user from tankBooster
            tankBoosters.shift();
            // Remove user from tankUsers
            tankUsers.shift();

            // Add first user at tankUser queue
            if (tankUsers.length > 0) {
                await addTank(reaction, tankUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (dpsUsers.includes(user) && dpsBoosters.length == 0) {
                // Check the user is in another emote
                if (!healerUsers.includes(user)) {
                    await addDps(reaction, user);
                }
            }
            // If user choosed another reactions when release healer then add to him
            if (healerUsers.includes(user) && healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!dpsUsers.includes(user)) {
                    await addHealer(reaction, user);
                }
            }

            // When user select more than two react, prefer healer
            if (dpsUsers.includes(user) && healerUsers.includes(user)) {
                if (dpsBoosters.length == 0 && healerBoosters.length == 0) {
                    await addHealer(reaction, user);
                }
            }
        }
        // User is waiting in Queue, release him before assign booster
        if (tankUsers.length > 0) {
            tankUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeHealer(reaction, user) {
    if (healerUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (healerBoosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await reaction.message.edit(tmpEmbed);

            // Remove user from healerBooster
            healerBoosters.shift();
            // Remove user from healerUsers
            healerUsers.shift();

            // Add first user at healerUser queue
            if (healerUsers.length > 0) {
                await addHealer(reaction, healerUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (dpsUsers.includes(user) && dpsBoosters.length == 0) {
                // Check the user is in another emote
                if (!tankUsers.includes(user)) {
                    await addDps(reaction, user);
                }
            }
            
            // If user choosed another reactions when release tank then add to him
            if (tankUsers.includes(user) && tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!dpsUsers.includes(user)) {
                    await addTank(reaction, user);
                }
            }

            // When user select more than two react, prefer dps
            if (tankUsers.includes(user) && dpsUsers.includes(user)) {
                if (tankBoosters.length == 0 && dpsBoosters.length == 0) {
                    await addDps(reaction, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (healerUsers.length > 0) {
            healerUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
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

    // tıklanan emotedaki users[0] herhangi bir boost rolü almışsa,
    // yeni user'ı o emote users arrayine unshift et!

    // DPS Queue
    if (reaction.emoji.id === '731617839290515516' && !user.bot) {
        // if reacted user does not exist in dpsUsers, avoid clone
        if (!dpsUsers.includes(user)) {
            let x = dpsBoosters;
            dpsUsers.push(user);
            await addDps(reaction, dpsUsers[0]);
        }
    }   // Tank Queue
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        // if reacted user does not exist in tankUsers, avoid clone
        if (!tankUsers.includes(user)) {
            let y = tankBoosters;
            tankUsers.push(user);
            await addTank(reaction, tankUsers[0]);
        }
    }  // Healer Queue
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        // if reacted user does not exist in healerUsers, avoid clone
        if (!healerUsers.includes(user)) {
            let z = healerBoosters;
            healerUsers.push(user);
            await addHealer(reaction, healerUsers[0]);
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

    // DPS Boosters
    if (reaction.emoji.id === '731617839290515516' && !user.bot) {
        await removeDps(reaction, user);
    } // Tank Boosters
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        await removeTank(reaction, user);
    } // Healer Boosters
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        await removeHealer(reaction, user);
    }
});