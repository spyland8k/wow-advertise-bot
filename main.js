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

class Advertise{
    _reaction;
    _message;
    _user;
    // when full advertise
    _isFull = Boolean(false);
    // when boost done
    _isComplete = Boolean(false);
    _dpsUsers = Array();
    _dpsBoosters = Array();
    _dps2Users = Array();
    _dps2Boosters = Array();
    _tankUsers = Array();
    _tankBoosters = Array();
    _healerUsers = Array();
    _healerBoosters = Array();
    _boosterList = Array();

    constructor(reaction, message, user, isFull, isComplete, dpsUsers, dpsBoosters, tankUsers, tankBoosters, healerUsers, healerBoosters, dps2Users, dps2Boosters, boosterList){
        this._reaction = reaction;
        this._message = message;
        this._user = user;
        this._isFull = isFull;
        this._isComplete = isComplete;
        this._dpsUsers = dpsUsers;
        this._dpsBoosters = dpsBoosters;
        this._dps2Users = dps2Users;
        this._dps2Boosters = dps2Boosters;
        this._tankUsers = tankUsers;
        this._tankBoosters = tankBoosters; 
        this._healerUsers = healerUsers;
        this._healerBoosters = healerBoosters;
        this._boosterList = boosterList;
    }
}

var MessageList = Array();



function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
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
    // Catch webhooks from webhook-1 channel
    if (message.channel.id === hookForm) {
        // Is that message comes from webhook
        if (message.webhookID) {
            // Get webhook post
            var msg = (await message.fetch());
            // Get embeds on post
            var embed = new Discord.MessageEmbed(msg.embeds[0]);
            // modify embeds for advertise
            var newEmbed = modifyEmbed(embed);
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
client.on('message', async message => {
    // Add react only specific channel
    if (message.channel.id === webhookToChannelId) {
        // Modify footer of message for boostId
        message.edit(message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png'));

        // Add react to the message
        message.react('✅').then(() =>
            message.react('732689305805520919'), // DPS -2
            message.react('731617839290515516'), // DPS
            message.react('731617839596961832'), // TANK
            message.react('731617839370469446'));// HEALER
    }
});

async function addDps(advertise, user) {
    //var user = advertise._dpsUsers[0];
    var reaction = advertise._reaction;

    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addDpsQueue(advertise, user){
    // get first place of dpsUser
    //let user = advertise._dpsUsers[0];
    let reaction = advertise._reaction;

    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addTank(advertise, user) {
    //var user = advertise._user;
    var reaction = advertise._reaction;
    if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addTankQueue(advertise, user) {
    // get first place of tankUser
    //let user = advertise._tankUsers[0];
    let reaction = advertise._reaction;

    if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addHealer(advertise, user) {
    var user = advertise._user;
    var reaction = advertise._reaction;
    if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addHealerQueue(advertise, user) {
    // get first place of tankUser
    //let user = advertise._healerUsers[0];
    let reaction = advertise._reaction;

    if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addDps2(advertise, user){
    //var user = advertise._user;
    var reaction = advertise._reaction;
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function addDps2Queue(advertise, user) {
    //var user = advertise._dps2Users[0];
    var reaction = advertise._reaction;
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._reaction.message.edit(tmpEmbed);
        }
    }
}

async function removeDps(advertise, user) {
    //user = advertise._user;
    reaction = advertise._reaction;

    if (advertise._dpsUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dpsBoosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._reaction.message.edit(tmpEmbed);

            // Remove user from dpsBooster
            let tmpUser = advertise._dpsBoosters.shift();
            // Remove user from dpsUsers
            // Find in healer user shifted healer booster
            // Delete tmpUser from dpsUsers
            let idx = advertise._dpsUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._dpsUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at dpsUser queue
            // TODO Send who is waiting dps queue
            if (advertise._dpsUsers.length > 0) {
                await addDpsQueue(advertise, advertise._dpsUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (advertise._tankUsers.includes(user) && advertise._tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._healerUsers.includes(user)) {
                    await addTank(advertise, user);
                }
            }
            // If user choosed another reactions when release healer then add to him

            if (advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._tankUsers.includes(user)) {
                    await addHealer(advertise, user);
                }
            }

            if (advertise._tankUsers.includes(user) && advertise._healerUsers.includes(user)) {
                if (advertise._tankBoosters.length == 0 && advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._dpsUsers.length > 0) {
            advertise._dpsUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeTank(advertise, user) {
    //user = advertise._user;
    reaction = advertise._reaction;

    if (advertise._tankUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._tankBoosters.length == 1) {
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
            await advertise._reaction.message.edit(tmpEmbed);

            // Remove user from tankBooster
            let tmpUser = advertise._tankBoosters.shift();
            // Remove user from tankBooster 
            // Find in healer user shifted healer booster
            // Delete tmpUser from tankUsers
            let idx = advertise._tankUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._tankUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at tankUser queue
            if (advertise._tankUsers.length > 0) {
                await addTankQueue(advertise, advertise._tankUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._healerUsers.includes(user)) {
                    await addDps(advertise, user);
                }
            }
            // If user choosed another reactions when release healer then add to him
            if (advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._dpsUsers.includes(user)) {
                    await addHealer(advertise, user);
                }
            }

            // When user select more than two react, prefer healer
            if (advertise._dpsUsers.includes(user) && advertise._healerUsers.includes(user)) {
                if (advertise._dpsBoosters.length == 0 && advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }
        }
        // User is waiting in Queue, release him before assign booster
        if (advertise._tankUsers.length > 0) {
            advertise._tankUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeHealer(advertise, user) {
    //user = advertise._user;
    reaction = advertise._reaction;

    if (advertise._healerUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._healerBoosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._reaction.message.edit(tmpEmbed);

            // Remove user from healerBooster
            let tmpUser = advertise._healerBoosters.shift();
            // Remove user from healerUsers 
            // Find in healer user shifted healer booster
            // Delete tmpUser from healerusers
            let idx = advertise._healerUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._healerUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = boosterList.indexOf(tmpUser);
            if (idx > -1) {
                boosterList.splice(idx, 1);
            }*/

            // Add first user at healerUser waiting at queue
            if (advertise._healerUsers.length > 0) {
                await addHealerQueue(advertise, advertise._healerUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._tankUsers.includes(user)) {
                    await addDps(advertise, user);
                }
            }

            // If user choosed another reactions when release tank then add to him
            if (advertise._tankUsers.includes(user) && advertise._tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._dpsUsers.includes(user)) {
                    await addTank(advertise, user);
                }
            }

            // When user select more than two react, prefer dps
            if (advertise._tankUsers.includes(user) && advertise._dpsUsers.includes(user)) {
                if (advertise._tankBoosters.length == 0 && advertise._dpsBoosters.length == 0) {
                    await addDps(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._healerUsers.length > 0) {
            advertise._healerUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeDps2(advertise, user) {
    //user = advertise._user;
    reaction = advertise._reaction;

    if (advertise._dps2Users.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dps2Boosters.length == 1) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._reaction.message.edit(tmpEmbed);

            // Remove user from dpsBooster
            let tmpUser = advertise._dps2Boosters.shift();
            // Remove user from dpsUsers
            // Find in healer user shifted healer booster
            // Delete tmpUser from dpsUsers
            let idx = advertise._dps2Users.indexOf(tmpUser);
            if (idx > -1) {
                advertise._dps2Users.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at dpsUser queue
            // TODO Send who is waiting dps queue
            if (advertise._dps2Users.length > 0) {
                await addDps2Queue(advertise, advertise._dpsUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (advertise._tankUsers.includes(user) && advertise._tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._healerUsers.includes(user)) {
                    await addTank(advertise, user);
                }
            }
            // If user choosed another reactions when release healer then add to him

            if (advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._tankUsers.includes(user)) {
                    await addHealer(advertise, user);
                }
            }

            if (advertise._tankUsers.includes(user) && advertise._healerUsers.includes(user)) {
                if (advertise._tankBoosters.length == 0 && advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._dps2Users.length > 0) {
            advertise._dps2Users.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if(!user.bot){
        // Is advertise created before, if not go inside
        if (!await MessageList.find(x => x._message.id == reaction.message.id)) {
            let dpsBoosters = Array();
            let dpsUsers = Array();
            let tankBoosters = Array();
            let tankUsers = Array();
            let healerBoosters = Array();
            let healerUsers = Array();
            let dps2Boosters = Array();
            let dps2Users = Array();
            let boosterList = Array();
            let isFull = false;
            let isComplete = false;
            let adv = new Advertise(reaction, reaction.message, user, isFull, isComplete, 
                dpsUsers, dpsBoosters, tankUsers, tankBoosters, healerUsers, healerBoosters, dps2Users, dps2Boosters, 
                boosterList);

            MessageList.push(adv);
        }
        
        // find which advertise reacted
        var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
        // change the user
        currAdv._user = user;

        if (currAdv) {
            if (reaction.emoji.id === '731617839290515516') {

                // if reacted user does not exist in dpsUsers, avoid clone
                if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
                    if ((currAdv._dpsBoosters[0] == currAdv._healerUsers[0]) || (currAdv._dpsBoosters[0] == currAdv._healerUsers[0])) {
                        currAdv._dpsUsers.unshift(user);
                    }
                    else {
                        currAdv._dpsUsers.push(user);
                    }
                    await addDps(currAdv, currAdv._dpsUsers[0]);
                }
            }   // Tank Queue
            else if (reaction.emoji.id === '731617839596961832') {
                // if reacted user does not exist in tankUsers, avoid clone
                if (!currAdv._tankUsers.includes(user)) {
                    if ((currAdv._dpsBoosters[0] == currAdv._tankUsers[0]) || (currAdv._dpsBoosters[0] == currAdv._healerUsers[0])) {
                        currAdv._tankUsers.unshift(user);
                    }
                    else {
                        currAdv._tankUsers.push(user);
                    }
                    await addTank(currAdv, currAdv._tankUsers[0]);
                }
            }  // Healer Queue
            else if (reaction.emoji.id === '731617839370469446') {
                // if reacted user does not exist in healerUsers, avoid clone
                if (!currAdv._healerUsers.includes(user)) {
                    if ((currAdv._dpsBoosters[0] == currAdv._healerUsers[0]) || (currAdv._dpsBoosters[0] == currAdv._tankUsers[0])) {
                        currAdv._healerUsers.unshift(user);
                    } else {
                        currAdv._healerUsers.push(user);
                    }
                    await addHealer(currAdv, currAdv._healerUsers[0]);
                }
            }
            // Dps 2 Queue
            else if (reaction.emoji.id === '732689305805520919') {
                // if reacted user does not exist in healerUsers, avoid clone
                if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
                    if ((currAdv._dps2Boosters[0] == currAdv._healerUsers[0]) || (currAdv._dps2Boosters[0] == currAdv._healerUsers[0])) {
                        currAdv._dps2Users.unshift(user);
                    }
                    else {
                        currAdv._dps2Users.push(user);
                    }
                    await addDps2(currAdv, currAdv._dps2Users[0]);
                }
            }
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    // find which advertise reacted
    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);

    if (currAdv) {
        // DPS Boosters
        if (reaction.emoji.id === '731617839290515516' && !user.bot) {
            if(reaction.message.id == currAdv._message.id){
                await removeDps(currAdv, user);
            }
        } // Tank Boosters
        else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
            if (reaction.message.id == currAdv._message.id) {
                await removeTank(currAdv, user);
            }
        } // Healer Boosters
        else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
            if (reaction.message.id == currAdv._message.id) {
                await removeHealer(currAdv, user);
            }
        } 
        else if (reaction.emoji.id === '732689305805520919' && !user.bot) {
            if (reaction.message.id == currAdv._message.id) {
                await removeDps2(currAdv, user);
            }
        }
    }
    else{
        console.log(`Advertise doesn't exits, cannot delete!`);
    }
});