// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const boosterCut = 20;
// webhook messages drops here (channel id)
const webhookFromChannelId = "731543421340221521";
// routing to booster channel
const webhookToChannelId = "731523810662154311";

client.login(process.env.DISCORD_TOKEN);

var MessageList = Array();
var isAdvertiserDps = Boolean(false);
var isAdvertiserTank = Boolean(false);
var isAdvertiserHealer = Boolean(false);
var isAdvertiserKey = Boolean(false);

class Advertise {
    _message;
    _advertiser;

    // when advertise full
    _isFull = Boolean(false);
    // when advertise done
    _isCompleted = Boolean(false);
    // when advertise canceled
    _isCanceled = Boolean(false);

    _isDpsKey = Boolean(false);
    _dpsUsers;
    _dpsBoosters;

    _isDps2Key = Boolean(false);
    _dps2Users;
    _dps2Boosters;

    _isTankKey = Boolean(false);
    _tankUsers;
    _tankBoosters;

    _isHealerKey = Boolean(false);
    _healerUsers;
    _healerBoosters;

    constructor(message, advertiser, isFull, isCompleted, isCanceled, 
             dpsUsers, dpsBoosters, 
             tankUsers, tankBoosters, 
             healerUsers, healerBoosters, 
             dps2Users, dps2Boosters) {
        this._message = message
        this._advertiser = advertiser;
        this._isFull = isFull;
        this._isCompleted = isCompleted;
        this._isCanceled = isCanceled;
        
        //this._isDpsKey = isDpsKey;
        this._dpsUsers = dpsUsers;
        this._dpsBoosters = dpsBoosters;

        //this._isDps2Key = isDps2Key;
        this._dps2Users = dps2Users;
        this._dps2Boosters = dps2Boosters;

        //this._isTankKey = isTankKey;
        this._tankUsers = tankUsers;
        this._tankBoosters = tankBoosters;

        //this._isHealerKey = isHealerKey;
        this._healerUsers = healerUsers;
        this._healerBoosters = healerBoosters;
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

async function newAdvertise(message, advertiser, isFull, isCompleted, isCanceled) {
    let dpsBoosters = Array();
    let dpsUsers = Array();
    let tankBoosters = Array();
    let tankUsers = Array();
    let healerBoosters = Array();
    let healerUsers = Array();
    let dps2Boosters = Array();
    let dps2Users = Array();

    let adv = new Advertise(message, advertiser, isFull, isCompleted, isCanceled, 
        dpsUsers, dpsBoosters, 
        tankUsers, tankBoosters, 
        healerUsers, healerBoosters, 
        dps2Users, dps2Boosters);

    MessageList.push(adv);    
    return adv;
}

async function modifyWebhook(embed) {
    // Modify hooked message from webhook channel
    var newEmbed = new Discord.MessageEmbed()
        .setColor('#f5da42')
        .setTitle(embed.title)
        //.setDescription('Some description here')
        .setThumbnail('https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png')
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('BoostId: ', 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
    
        
    embed.fields.forEach(function(item, index, arr) {
        if(item.name === 'Discord Tag'){
            let users = client.guilds.cache.map(g => g.members.cache.map(u => u.user));

            // Find advertiser in guild members
            users[0].forEach( u => {
                if(u.tag == item.value)
                    newEmbed.addField('Advertiser', `<@${u.id}>`, true);
            });
        }
        else if(item.name === 'Boost Price'){
            newEmbed.addField(item.name, item.value, true);
            newEmbed.addField(`Booster Cut %${boosterCut}`, (Math.round(parseInt(item.value)/boosterCut)), true);
        }
        else if (item.name === 'Are you gonna join the boost?'){
            if (item.value === 'Yes'){
                let next1 = arr[index + 1];
                let next2 = arr[index + 2];
                // Tank/Dps/Healer
                if (next1.name == 'Which class do you wanna join the boost?') {
                    if (next1.value == 'Dps'){
                        isAdvertiserDps = true;
                    }else if(next1.value == 'Tank'){
                        isAdvertiserTank = true;
                    }else if(next1.value == 'Healer'){
                        isAdvertiserHealer = true;
                    }
                }
                if (next2.name === 'Do you have the key?'){
                    if(next2.value == 'Yes'){
                        isAdvertiserKey = true;
                    }
                }
            }
        }// Exclusion filter
        else if (!(item.name === 'Discord Tag') 
                && !(item.name === 'Boost Price') 
                && !(item.name === 'Are you gonna join the boost?')
                && !(item.name === 'Which class do you wanna join the boost?')
                && !(item.name === 'Do you have the key?')){
            newEmbed.addField(item.name, item.value, true);
        }
    })
    // BOOSTER AREA
    newEmbed.addField('BOOSTERS', '\u200B');

    return newEmbed
}

client.on('ready', async () => {
    console.log(`Bot started NOW! - ${new Date().toLocaleString()}`);
    try {
        // Get specific channel informations
        //var channel = await client.channels.cache.get(webhookToChannelId).fetch().then((msg) => msg.map( m => m));
        var channel = await client.channels.cache.get(webhookToChannelId).fetch();
        // Get all old messages
        var messages = await channel.messages.fetch().then((msg) => msg.map(m => m));

        //var guild = await client.guilds.cache.get('731232364826722395');
        //var guildUsers = guild.members.cache.get();


        // Fetch all of old messages cache at MessageList
        if( !(messages == null) ){
            // Able to use await functions
            for (const m of messages) {
                if (!(m.embeds[0] == null)){
                    // If advertise removed dont store
                    if (!(m.embeds[0].title == 'Boosting Canceled!')) {

                        for (const field of m.embeds[0].fields) {
                            if (field.name == 'Advertiser') {
                                //let addUser = m.guild.members.cache.get(regexId);
                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let advertiser = await client.users.fetch(regexId);
                                var createdAdvertise = await newAdvertise(m, advertiser, false, false, false);
                                console.log(`Advertise id: ${m.id} not in cache, then cached!`);
                            } else if (field.name === '<:dps:734394556371697794>') {
                                //if (field.name === '<:dps:734394556371697794><:keys:734119765173600331>'){
                                //    createdAdvertise._isDpsKey = true;
                                //}
                                //let addUser = m.guild.members.cache.get(regexId);
                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let user = await client.users.fetch(regexId);
                                createdAdvertise._dpsBoosters.push(user);
                                createdAdvertise._dpsUsers.push(user);
                            } else if (field.name === '<:dps2:734394556744728628>') {
                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let user = await client.users.fetch(regexId);
                                createdAdvertise._dps2Boosters.push(user);
                                createdAdvertise._dps2Users.push(user);
                            } else if (field.name === '<:tank:734394557684383775>') {
                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let user = await client.users.fetch(regexId);
                                createdAdvertise._tankBoosters.push(user);
                                createdAdvertise._tankUsers.push(user);
                            } else if (field.name === '<:healer:734394557294182520>') {
                                //if (field.name === '<:healer:734394557294182520><:keys:734119765173600331>'){
                                //    createdAdvertise._isHealerKey = true;
                                //}
                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let user = await client.users.fetch(regexId);
                                createdAdvertise._healerBoosters.push(user);
                                createdAdvertise._healerUsers.push(user);
                            }
                        }
                        // TODO old messages reactions must be deleted
                        //m.reactions.remove(message.author.id);
                    } else {
                        console.log(`Advertise id: ${m.id} status canceled or started, then skipped!`);
                    }
                } 
                
            }
        }
        else{
            console.log(`This channel doesn't have a any advertise`);
        }
    } catch (error) {
        console.log(`ERROR while bot starting fetching old messages: ${error}`);
    }

    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', async message => {
    // When webhook come get this message, then modify and send webhookToChannelId
    if (message.channel.id === webhookFromChannelId && message.author.bot) {
        // Is that message comes from webhook
        // Get webhook post
        var msg = (await message.fetch());
        // Get embeds on post
        var embed = new Discord.MessageEmbed(msg.embeds[0]);
        // modify embeds for advertise
        var newEmbed = await modifyWebhook(embed);
        // Send, new modified message to the specific channel
        try {
            /*
            const editEmbed = new Discord.MessageEmbed().addField()
                .setDescription('this is the old description')
                .addField({});

            client.channels.cache.get(webhookToChannelId)
                            .send(newEmbed).then((m) =>
                                m.edit(newEmbed.setTitle(`NABERRR`)));*/
            await client.channels.cache.get(webhookToChannelId).send(newEmbed);         
        } catch (error) {
            console.log("WEBHOOK POST ERROR: " + error);
        }
    }
    // Modified webhooks, converting to the RichEmbed and filling inside
    if(message.channel.id === webhookToChannelId && message.author.bot){
        if(message.embeds[0].title != null){
            if (message.embeds[0].title == 'Need Dungeon Booster!') {
                // Add boostId for MessageId 
                //message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
                tmpEmbed = message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
                await message.edit(tmpEmbed);

                // Get advertiser from posted message with RegEx
                let advertiserId = message.embeds[0].fields[0].value.replace(/\D/g, "");
                // Return user with by ID
                let advertiser = await client.users.fetch(advertiserId);

                var adv = await newAdvertise(message, advertiser, false, false, false);

                // Add to the list new created advertise
                //MessageList.unshift(adv);

                // Search at MessageList bofere created advertise
                var advertise = await MessageList.find(x => x._message.id == message.id);

                // If advertiser wants to be a booster too check conditions
                if (isAdvertiserDps) {
                    // Have a key for DPS
                    if (isAdvertiserKey) {
                        advertise._isDpsKey = true;
                        advertise._dpsUsers.unshift(advertiser);
                        await addDps(advertise, advertiser);
                    } else {
                        advertise._dpsUsers.push(advertiser);
                        await addDps(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserDps = false;
                }
                else if (isAdvertiserHealer) {
                    // Have a key for HEALER
                    if (isAdvertiserKey) {
                        advertise._isHealerKey = true;
                        advertise._healerUsers.unshift(advertiser);
                        await addHealer(advertise, advertiser);
                    } else {
                        advertise._healerUsers.push(advertiser);
                        await addHealer(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserHealer = false;
                }
                else if (isAdvertiserTank) {
                    // Have a key for TANK
                    if (isAdvertiserKey) {
                        advertise._isTankKey = true;
                        advertise._tankUsers.unshift(advertiser);
                        addTank(advertise, advertiser);
                    } else {
                        advertise._tankUsers.push(advertiser);
                        addTank(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserTank = false;
                }

                // Add reacts to the message
                await message.react('734394556371697794') // DPS
                    .then(() => message.react('734394557684383775')) // TANK
                    .then(() => message.react('734394557294182520')) // HEALER
                    .then(() => message.react('734394556744728628')) // DPS-2
                    .then(() => message.react('734119765173600331')) // KEY
                    .then(() => message.react('734368776908177468')) // EMPTY
                    .then(() => message.react('734367159152541727')) // DONE
                    .then(() => message.react('734367159148347392')) // CANCEL
                    .catch(`Problems while adding reactions!`);

                // Notice all members after created advertise
                let newMsg = new Discord.MessageEmbed();
                newMsg.setDescription(`New boost created!\nAdvertiseId: ${message.id} <@&734454074467942903> <@&734454021343019159> <@&734453923665936394>`);
            }
        }
    }  
});


async function addDps(advertise, user) {
    //var user = advertise._dpsUsers[0];
    var message = advertise._message;

    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // TODO Add icon to message if user react key
            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
            
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addTank(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addHealer(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addDps2(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dpsUsers.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function removeDps(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._dpsUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dpsBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });

            for (let i = 0; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

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
                await addDps(advertise, advertise._dpsUsers[0]);
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

            advertise._isDpsKey = false;
        }
    }
}

async function removeTank(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._tankUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._tankBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:tank:734394556371697794>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

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
                await addTank(advertise, advertise._tankUsers[0]);
            }

            // User select DPS or DPS2
            if(advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)){
                // Also selected 3rd HEALER
                if(advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0){
                    await addHealer(advertise, user);
                }

                // Which one is closer to the queue
                // Select one of them DPS-DPS2
                if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0){
                    await addDps(advertise, user);
                } else if(advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0){
                    await addDps2(advertise, user);
                } 
            }// User select DPS AND DPS2
            if (advertise._dpsUsers.includes(user) && advertise._dps2Users.includes(user)) {
                if (advertise._dpsUsers.indexOf(user) <= advertise._dps2Users.indexOf(user)) {
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                } else {
                    if (advertise._dps2Boosters.length == 0){
                        await addDps2(advertise, user);
                        //advertise._message.reaction.remove(user);
                    }
                        
                }
            }
            else if (advertise._healerUsers.includes(user)){
                if (advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }

            advertise._isTankKey = false;
        }
    }
}

async function removeHealer(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._healerUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._healerBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });

            for (let i = 9; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

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
                await addHealer(advertise, advertise._healerUsers[0]);
            }

            // If user select TANK
            if(advertise._tankUsers.includes(user)){
                // If user select TANK AND DPS/DPS2 prefer DPS/DPS2
                if(advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)){
                    if(advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0){
                        await addDps(advertise, user);
                    }
                    else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
                        await addDps2(advertise, user);
                    }
                }
                else {
                    if (!advertise._dpsUsers.includes(user) || !advertise._dps2Users.includes(user)) {
                        if (advertise._tankBoosters.length == 0 && advertise._dpsBoosters.length == 0 && advertise._dps2Boosters.length == 0) {
                            await addTank(advertise, user);
                        } else{
                            await addTank(advertise, user);
                        }
                    }
                } 
            }// If user not select TANK
            else if (!advertise._tankUsers.includes(user)){
                // Which one is better select DPS/DPS2
                if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
                    await addDps(advertise, user);
                }
                else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
                    await addDps2(advertise, user);
                }
            }

            advertise._isHealerKey = false;
        }
        
    }
}

async function removeDps2(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._dps2Users.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dps2Boosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

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
            // TODO Send who is waiting dps2 queue
            if (advertise._dps2Users.length > 0) {
                await addDps2(advertise, advertise._dpsUsers[0]);
            }
                       
            if(advertise._tankUsers.includes(user)){
                if(advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)){
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }
                else if(advertise._dpsUsers.includes(user)){
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                }
                else{
                    if(advertise._tankBoosters.length == 0)
                        await addTank(advertise, user);
                }
            }
            else if (!advertise._tankUsers.includes(user)) {
                if (advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)) {
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }// TODO DPS/DPS2 reaction doesnt work perfectly
                else if (advertise._dpsUsers.includes(user)) {
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                } else if (advertise._healerUsers.includes(user)){
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }
            }

            advertise._isDps2Key = false;
        }
    }
}

async function dpsReplace(advertise, user){
    if (advertise._dpsUsers.includes(user) && !advertise._isDpsKey){
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from dpsBooster
        let tempUser = advertise._dpsBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:dps:734394556371697794>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tepUser from dpsUsers
        let idx = advertise._dpsUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._dpsUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._dpsUsers.unshift(tempUser);
        
        idx = advertise._dpsUsers.indexOf(user);
        if (idx > -1) {
            advertise._dpsUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isDpsKey = true;
        advertise._dpsUsers.unshift(user);

        await addDps(advertise, advertise._dpsUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._dpsUsers.includes(user)  && advertise._isDpsKey){
        // Then add user 2nd place
        if (advertise._dpsUsers.length == 0){
            advertise._dpsUsers.push(user);
        }
        console.log(`UserId: ${advertise.dpsBoosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function dps2Replace(advertise, user) {
    if (advertise._dps2Users.includes(user) && !advertise._isDps2Key) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from dps2Booster
        let tempUser = advertise._dps2Boosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:dps2:734394556744728628>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from dps2Users
        let idx = advertise._dps2Users.indexOf(tempUser);
        if (idx > -1) {
            advertise._dps2Users.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._dps2Users.unshift(tempUser);

        idx = advertise._dps2Users.indexOf(user);
        if (idx > -1) {
            advertise._dps2Users.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isDps2Key = true;
        advertise._dps2Users.unshift(user);

        await addDps2(advertise, advertise._dps2Users[0]);
    } // If anyone have a boosting already with key
    else if (advertise._dps2Users.includes(user) && advertise._isDps2Key) {
        // Then add user 2nd place
        if (advertise._dps2Users.length == 0) {
            advertise._dps2Users.push(user);
        }
        console.log(`UserId: ${advertise.dps2Boosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function tankReplace(advertise, user) {
    if (advertise._tankUsers.includes(user) && !advertise._isTankKey) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from tankBoosters
        let tempUser = advertise._tankBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:tank:734394557684383775>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from tankUsers
        let idx = advertise._tankUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._tankUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._tankUsers.unshift(tempUser);

        idx = advertise._tankUsers.indexOf(user);
        if (idx > -1) {
            advertise._tankUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isTankKey = true;
        advertise._tankUsers.unshift(user);

        await addTank(advertise, advertise._tankUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._tankUsers.includes(user) && advertise._isTankKey) {
        // Then add user 2nd place
        if (advertise._tankUsers.length == 0) {
            advertise._tankUsers.push(user);
        }
        console.log(`UserId: ${advertise._tankBoosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function healerReplace(advertise, user) {
    if (advertise._healerUsers.includes(user) && !advertise._isHealerKey) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from healerBoosters
        let tempUser = advertise._healerBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:tank:734394557684383775>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from healerUsers
        let idx = advertise._healerUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._healerUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._healerUsers.unshift(tempUser);

        idx = advertise._healerUsers.indexOf(user);
        if (idx > -1) {
            advertise._healerUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isTankKey = true;
        advertise._healerUsers.unshift(user);

        await addHealer(advertise, advertise._healerUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._healerUsers.includes(user) && advertise._isHealerKey) {
        // Then add user 2nd place
        if (advertise._healerUsers.length == 0) {
            advertise._healerUsers.push(user);
        }
        console.log(`UserId: ${advertise._healerUsers[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.bot){
        
    }
    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
    if (!user.bot && currAdv) {
        // Find which advertise reacted
        //let advertiser = currAdv._advertiser;
        if (currAdv) {
            // Dps Queue
            //If is advertise isnt full then catch reactions
            if(!currAdv._isFull && !currAdv._isCanceled && !currAdv.isComplete){
                if (reaction.emoji.id === '734394556371697794') {
                    // if reacted user does not exist in dpsUsers, avoid clone
                    if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
                        // if booster is already take the any role boost, put new user front of him
                        if ((currAdv._dpsBoosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._dpsBoosters[0] == currAdv._healerBoosters[0]) ||
                            (currAdv._dpsBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._dpsUsers.unshift(user);
                        }
                        else {
                            await currAdv._dpsUsers.push(user);
                        }
                        if (currAdv._dpsBoosters.length == 0) {
                            await addDps(currAdv, currAdv._dpsUsers[0]);
                        }
                    }
                }// Dps 2 Queue
                else if (reaction.emoji.id === '734394556744728628') {
                    // if reacted user does not exist in healerUsers, avoid clone
                    if (!currAdv._dps2Users.includes(user) && !currAdv._dpsUsers.includes(user)) {
                        if ((currAdv._dps2Boosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._dps2Boosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._dps2Boosters[0] == currAdv._healerBoosters[0])) {
                            await currAdv._dps2Users.unshift(user);
                        }
                        else {
                            await currAdv._dps2Users.push(user);
                        }
                        if (currAdv._dps2Boosters.length == 0) {
                            await addDps2(currAdv, currAdv._dps2Users[0]);
                        }
                    }
                }// Tank Queue
                else if (reaction.emoji.id === '734394557684383775') {
                    // if reacted user does not exist in tankUsers, avoid clone
                    if (!currAdv._tankUsers.includes(user)) {
                        if ((currAdv._tankBoosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._tankBoosters[0] == currAdv._healerBoosters[0]) ||
                            (currAdv._tankBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._tankUsers.unshift(user);
                        }
                        else {
                            await currAdv._tankUsers.push(user);
                        }
                        if (currAdv._tankBoosters.length == 0 && !currAdv._dpsBoosters.includes(user) && !currAdv._dps2Boosters.includes(user) && !currAdv._healerBoosters.includes(user)) {
                            await addTank(currAdv, currAdv._tankUsers[0]);
                        }
                    }
                }// Healer Queue
                else if (reaction.emoji.id === '734394557294182520') {
                    // if reacted user does not exist in healerUsers, avoid clone
                    if (!currAdv._healerUsers.includes(user)) {
                        // TODO If user already registered at any booster go front of him
                        if ((currAdv._healerBoosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._healerBoosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._healerBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._healerUsers.unshift(user);
                        }
                        else {
                            await currAdv._healerUsers.push(user);
                        }
                        if (currAdv._healerBoosters.length == 0 && !currAdv._dpsBoosters.includes(user) && !currAdv._dps2Boosters.includes(user) && !currAdv._tankBoosters.includes(user)) {
                            await addHealer(currAdv, currAdv._healerUsers[0]);
                        }
                    }
                }// Key Button
                else if (reaction.emoji.id === '734119765173600331') {

                    if (currAdv._dpsUsers.includes(user) || currAdv._dpsBoosters.includes(user)) {
                        // User is already in DPS, change the Key status
                        if (currAdv._dpsUsers.includes(user) && currAdv._dpsBoosters.includes(user)) {
                            currAdv._isDpsKey = true;
                        }
                        // User is waiting at queue add him instantly to the DPS
                        else if (currAdv._dpsUsers.includes(user) && !currAdv._dpsBoosters.includes(user) && !currAdv._isDpsKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await dpsReplace(currAdv, user);
                        }
                    }
                    else if (currAdv._dps2Users.includes(user) || currAdv._dps2Boosters.includes(user)) {
                        // User is already in DPS2, change the Key status
                        if (currAdv._dps2Users.includes(user) && currAdv._dps2Boosters.includes(user)) {
                            currAdv._isDps2Key = true;
                        }
                        // User is waiting at queue add him instantly to the DPS2
                        else if (currAdv._dps2Users.includes(user) && !currAdv._dps2Boosters.includes(user) && !currAdv._isDps2Key) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await dps2Replace(currAdv, user);
                        }
                    }
                    else if (currAdv._tankUsers.includes(user) || currAdv._tankBoosters.includes(user)) {
                        // User is already in TANK, change the Key status
                        if (currAdv._tankUsers.includes(user) && currAdv._tankBoosters.includes(user)) {
                            currAdv._isTankKey = true;
                        }
                        // User is waiting at queue add him instantly to the TANK
                        else if (currAdv._tankUsers.includes(user) && !currAdv._tankBoosters.includes(user) && !currAdv._isTankKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await tankReplace(currAdv, user);
                        }
                    }
                    else if (currAdv._healerUsers.includes(user) || currAdv._healerBoosters.includes(user)) {
                        // User is already in HEALER, change the Key status
                        if (currAdv._healerUsers.includes(user) && currAdv._healerBoosters.includes(user)) {
                            currAdv._isHealerKey = true;
                        }
                        // User is waiting at queue add him instantly to the HEALER
                        else if (currAdv._healerUsers.includes(user) && !currAdv._healerBoosters.includes(user) && !currAdv._isHealerKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await healerReplace(currAdv, user);
                        }
                    } else {
                        console.log(`${user.tag} have to select ant role before click KEY!`);
                    }
                }
            
            }
            else {
                console.log(`Advertise cannot reactable! It can be Full, Canceled or Completed!`);
            }

            if (currAdv._advertiser == user) {
                let boosterSize = currAdv._dpsBoosters.length;
                boosterSize = boosterSize + currAdv._dps2Boosters.length;
                boosterSize = boosterSize + currAdv._tankBoosters.length;
                boosterSize = boosterSize + currAdv._healerBoosters.length;

                // Advertise should be 4 boosters
                // When DONE button reacted, 
                // Remove all role emojis and change adv. FULL=true
                if (reaction.emoji.id === '734367159152541727' && !currAdv._isFull && (boosterSize == 4)) {
                    currAdv._isFull = true;

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];

                    tempMsg.setColor('#00e600');
                    tempMsg.setTitle('Boosting Started!');
                    tempMsg.setThumbnail('https://i.ibb.co/6PwpzFd/big-done.png');
                    tempMsg.setDescription(`The boosting has been started by <@${user.id}> at ${new Date().toLocaleString()}!`);

                    await currAdv._message.edit(tempMsg);

                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);

                    await rec.forEach(r => {
                        // Don't delete Done, RunFinish and Cancel Emojis
                        if (!(r.emoji.id == '734367159152541727') && !(r.emoji.id == '734367159148347392') && !(r.emoji.id == '734372934902218802')) {
                            r.remove();
                        }
                    });
                    currAdv._message.react('734372934902218802');
                    let newMsg = new Discord.MessageEmbed();
                    newMsg.setDescription(`\n<@${currAdv._advertiser[0].id}> owner of boosting started, Good luck!\n`
                        `<:dps:734394556371697794><@${currAdv._dpsBoosters[0].id}> - ${currAdv._dpsBoosters[0].tag}\n`
                        `<:dps2:734394556744728628><@${currAdv._dps2Boosters[0].id}> - ${currAdv._dps2Boosters[0].tag}\n`
                        `<:healer:734394557294182520><@${currAdv._healerBoosters[0].id}> - ${currAdv._healerBoosters[0].tag}\n`
                        `<:tank:734394557684383775><@${currAdv._tankBoosters[0].id}> - ${currAdv._tankBoosters[0].tag}\n`);
                    
                    //currAdv._message.reply(`\nGood luck; <:dps:734394556371697794><@${currAdv._dpsBoosters[0].id}> | ${currAdv._dpsBoosters[0].id}`);
                    await client.channels.cache.get(webhookToChannelId).send(newMsg); 
                    
                }
                // When CANCELED button reacted, Change advertise content then
                // Remove all another emojis and change adv. status CANCELED=true
                else if (reaction.emoji.id === '734367159148347392' && !currAdv._isCanceled) {
                    currAdv._isCanceled = true;

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];

                    tempMsg.fields = [];
                    tempMsg.setColor('#ff0000');
                    tempMsg.setTitle('Boosting Canceled!');
                    tempMsg.setThumbnail('https://i.ibb.co/gyXFgmC/big-cancel.png');
                    tempMsg.setDescription(`The boosting has been canceled by <@${user.id}>`);
                    
                    await currAdv._message.edit(tempMsg);

                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);
                    await rec.forEach(r => {
                        // Don't delete Cancel Emoji
                        if (!(r.emoji.id == '734367159148347392')) {
                            r.remove();
                        }
                    });
                }
                // When FINISHED button reacted, 
                // Remove all another emojis and change adv. status COMPLETED=true
                else if (reaction.emoji.id === '734372934902218802' && !currAdv._isCompleted) {
                    currAdv._isCompleted = true;

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];

                    tempMsg.fields = [];
                    tempMsg.setColor('#03fcad');
                    tempMsg.setTitle('Boosting Completed!');
                    tempMsg.setThumbnail('https://i.ibb.co/d6q1b40/runfinish.png');
                    tempMsg.setDescription(`The boosting has been completed, approved by <@${user.id}> at ${new Date().toLocaleString()}`);

                    await currAdv._message.edit(tempMsg);

                    // Balances added to the booster users
                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);

                    await rec.forEach(r => {
                        if (!(r.emoji.id == '734372934902218802')) {
                            r.remove();
                        }
                    });

                    // TODO Add balances who are boosters
                    console.log(`${currAdv._message.id} is completed, balances will be added soon to boosters`);
                }
            } 
            else {
                console.log(`You're NOT a Advertiser! ${user.tag}`);
            } 
            
        } else {
            console.log(`Advertise not registered! Please contact`)
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    
    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
    
    // Find which advertise reacted
    if (currAdv) {
        // DPS Boosters
        if (reaction.emoji.id === '734394556371697794') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._dpsBoosters.includes(user)) {
                    await removeDps(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._dpsUsers.length > 0) {
                        currAdv._dpsUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        }// DPS2 Boosters
        else if (reaction.emoji.id === '734394556744728628') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._dps2Boosters.includes(user)) {
                    await removeDps2(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._dps2Users.length > 0) {
                        currAdv._dps2Users.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Tank Boosters
        else if (reaction.emoji.id === '734394557684383775') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._tankBoosters.includes(user)) {
                    await removeTank(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._tankUsers.length > 0) {
                        currAdv._tankUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Healer Boosters
        else if (reaction.emoji.id === '734394557294182520') {
            if (reaction.message.id == currAdv._message.id) {
                if(currAdv._healerBoosters.includes(user)){
                    await removeHealer(currAdv, user);
                }else{
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._healerUsers.length > 0) {
                        currAdv._healerUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Key Emote 
        else if (reaction.emoji.id === '734119765173600331') {
            // Key remove event already did from replace
        }
    }
});