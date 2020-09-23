/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable prefer-const */
/* eslint-disable no-lonely-if */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable curly */
/* eslint-disable no-inline-comments */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */

const { DISCORD_TOKEN, WEBHOOK_ID, WEBHOOK_TOKEN, SPREADSHEET_ID, CLIENT_SECRET } = require('./config');

const Discord = require('discord.js');
const { PREFIX } = require('./constant.json');
const constants = require('./constant.json');

// It is using for log all advertise transaction records (Google Spreadsheet)
// https://developers.google.com/sheets/api/quickstart/nodejs
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

// Configure log file properties
const log4js = require('log4js');
log4js.configure({
	appenders: {
		multi: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log' }
	},
	categories: {
		default: { appenders: ['multi'], level: 'debug' }
	}
});
const logger = log4js.getLogger();

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// REGEX FIELD
// Non-digits
const nonDigits = /\D+/g;
// Digits
const digits = /\d+/g;
// Whitespace
const wSpace = / +/;
// Valid Discord Tag (Test#1234)
const validTag = /([a-zA-Z0-9]+)?[#]([0-9]{4})+/g;

const taggedUser = /<@!\d+>/g;

// Armor Set Stack Type Name
const ARMOR_STACK = {
	NONE: constants.NONE_ARMOR,
	CLOTH: constants.CLOTH_ARMOR,
	LEATHER: constants.LEATHER_ARMOR,
	PLATE: constants.PLATE_ARMOR,
	MAIL: constants.MAIL_ARMOR
};

// PRICE FIELD (AMOUNT)*100
// Pricing Rates & Fees
const BOOSTER_CUT = constants.BOOSTER_CUT;
const ADVERTISER_CUT = constants.ADVERTISER_CUT;

// All icons of ID's
const DONE_ICON = constants.DONE_ICON;
const CANCEL_ICON = constants.CANCEL_ICON;
const FINISH_ICON = constants.FINISH_ICON;
const KEY_ICON = constants.KEY_ICON;
const DPS_ICON = constants.DPS_ICON;
const DPS2_ICON = constants.DPS2_ICON;
const HEALER_ICON = constants.HEALER_ICON;
const TANK_ICON = constants.TANK_ICON;
const GOLD_ICON = constants.GOLD_ICON;
const CLOTH_ICON = constants.CLOTH_ICON;
const LEATHER_ICON = constants.LEATHER_ICON;
const PLATE_ICON = constants.PLATE_ICON;
const MAIL_ICON = constants.MAIL_ICON;

// ROLE FIELD
const NONE_STACK = constants.NONE_STACK;
const CLOTH_STACK = constants.CLOTH_STACK;
const LEATHER_STACK = constants.LEATHER_STACK;
const PLATE_STACK = constants.PLATE_STACK;
const MAIL_STACK = constants.MAIL_STACK;

// CHANNELS ID FIELD
// Webhook messages drops here (channel id)
const WEBHOOK_FROM = constants.WEBHOOK_FROM;
// Routing to booster channel coming webhook
const WEBHOOK_TO = constants.WEBHOOK_TO;
// Command channel
const COMMAND_CH = constants.COMMAND_CH;

try {
	client.login(DISCORD_TOKEN);
}
catch (error) {
	logger.error(`${error}`);
}

class Advertise {
	constructor(message, advertiser, isFull, isCompleted, isCanceled,
		dpsUsers, dpsBoosters,
		tankUsers, tankBoosters,
		healerUsers, healerBoosters,
		dps2Users, dps2Boosters) {
		this._message = message;
		this._advertiser = advertiser;
		this._stack = 'No Armor Stacked';
		this._isFull = isFull;
		this._isCompleted = isCompleted;
		this._isCanceled = isCanceled;

		this._isDpsKey = Boolean(false);
		this._dpsUsers = dpsUsers;
		this._dpsBoosters = dpsBoosters;

		this._isDps2Key = Boolean(false);
		this._dps2Users = dps2Users;
		this._dps2Boosters = dps2Boosters;

		this._isTankKey = Boolean(false);
		this._tankUsers = tankUsers;
		this._tankBoosters = tankBoosters;

		this._isHealerKey = Boolean(false);
		this._healerUsers = healerUsers;
		this._healerBoosters = healerBoosters;
	}
}

class AdvertiseLog {
	constructor(advertise) {
		this._boostId = advertise._message.id;
		this._boostPrice = advertise._message.embeds[0].fields[6].value;
		this._publishedDate = new Date().toLocaleString();
		this._startedDate = 0;
		this._completedDate = 0;
		this._isCompleted = advertise._isCompleted;
		this._isCanceled = advertise._isCanceled;
		this._boostedCustomer = advertise._message.embeds[0].fields[9].value;
		this._advertiserId = advertise._advertiser.id;
		this._advertiseCut = Math.round((parseInt(advertise._message.embeds[0].fields[6].value) * (ADVERTISER_CUT)));
		this._dpsBoosterId = 0;
		this._dpsBoosterCut = 0;
		this._dps2BoosterId = 0;
		this._dps2BoosterCut = 0;
		this._healerBoosterId = 0;
		this._healerBoosterCut = 0;
		this._tankBoosterId = 0;
		this._tankBoosterCut = 0;
	}
}

var MessageList = new Array();
var isAdvertiserDps = Boolean(false);
var isAdvertiserTank = Boolean(false);
var isAdvertiserHealer = Boolean(false);
var isAdvertiserKey = Boolean(false);
var advertiseStack = ARMOR_STACK.NONE;

async function newAdvertise(message, advertiser, isFull, isCompleted, isCanceled) {
	const dpsBoosters = Array();
	const dpsUsers = Array();
	const tankBoosters = Array();
	const tankUsers = Array();
	const healerBoosters = Array();
	const healerUsers = Array();
	const dps2Boosters = Array();
	const dps2Users = Array();

	const adv = new Advertise(message, advertiser, isFull, isCompleted, isCanceled,
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
		.setThumbnail('https://i.ibb.co/1fZjCLz/anka-trans.png')
		.setTimestamp()
		.setFooter('BoostId: ', 'https://i.ibb.co/1fZjCLz/anka-trans.png');


	embed.fields.forEach(function (item, index, arr) {
		if (item.name === 'Discord Tag') {
			const users = client.guilds.cache.map(g => g.members.cache.map(u => u.user));

			// Find advertiser in guild members
			users[0].forEach(u => {
				if (u.tag == item.value)
					newEmbed.addField('Advertiser', `<@${u.id}>`, true);
			});
		}
		else if (item.name === 'Armor Stacked') {
			if (item.value === ARMOR_STACK.CLOTH) {
				advertiseStack = ARMOR_STACK.CLOTH;
			}
			else if (item.value === ARMOR_STACK.LEATHER) {
				advertiseStack = ARMOR_STACK.LEATHER;
			}
			else if (item.value === ARMOR_STACK.PLATE) {
				advertiseStack = ARMOR_STACK.PLATE;
			}
			else if (item.value === ARMOR_STACK.MAIL) {
				advertiseStack = ARMOR_STACK.MAIL;
			}
			newEmbed.addField(item.name, advertiseStack, true);
		}
		else if (item.name === 'Boost Price') {
			newEmbed.addField(item.name, item.value, true);
			newEmbed.addField(`Booster Cut %${BOOSTER_CUT * 100}`, (Math.round(parseInt(item.value) * (BOOSTER_CUT))) + GOLD_ICON, true);
		}
		else if (item.name === 'Are you gonna join the boost?') {
			if (item.value === 'Yes') {
				const next1 = arr[index + 1];
				const next2 = arr[index + 2];
				// Tank/Dps/Healer
				if (next1.name == 'Which class do you wanna join the boost?') {
					if (next1.value == 'Dps') {
						isAdvertiserDps = true;
					}
					else if (next1.value == 'Tank') {
						isAdvertiserTank = true;
					}
					else if (next1.value == 'Healer') {
						isAdvertiserHealer = true;
					}
				}
				if (next2.name === 'Do you have the key?') {
					if (next2.value == 'Yes') {
						isAdvertiserKey = true;
					}
				}
			}
		}// Exclusion filter
		else if (!(item.name === 'Discord Tag')
			&& !(item.name === 'Boost Price')
			&& !(item.name === 'Are you gonna join the boost?')
			&& !(item.name === 'Which class do you wanna join the boost?')
			&& !(item.name === 'Do you have the key?')) {
			newEmbed.addField(item.name, item.value, true);
		}
	});
	// BOOSTER AREA {Empty field}
	newEmbed.addField('BOOSTERS', '\u200B');

	return newEmbed;
}

// Bind datas from Json data serialize to AdvertiseLog(object)
async function modifyAdvertiseLog(advertise, row) {
	row.isCompleted = advertise._isCompleted;
	row.isCanceled = advertise._isCanceled;
	row.AdvertiserId = advertise._advertiser.id;

	if (advertise._isCompleted) {
		const advertiserPrice = Math.round((parseInt(row.BoostPrice) * ADVERTISER_CUT));
		const boosterPrice = Math.round((parseInt(row.BoostPrice) * BOOSTER_CUT));

		row.CompletedDate = new Date().toLocaleString();
		row.AdvertiseCut = advertiserPrice;
		row.DpsBooster = advertise._dpsBoosters[0].id;
		row.DpsBoosterCut = boosterPrice;
		row.Dps2Booster = advertise._dps2Boosters[0].id;
		row.Dps2BoosterCut = boosterPrice;
		row.HealerBooster = advertise._healerBoosters[0].id;
		row.HealerBoosterCut = boosterPrice;
		row.TankBooster = advertise._tankBoosters[0].id;
		row.TankBoosterCut = boosterPrice;
	}

	return row;
}

// When new advertise created add to sheet with new row
async function insertBoostRow(advertise) {
	console.info(`insertBoostRow started at ${new Date().toLocaleString()}`);
	logger.info(`insertBoostRow started ${advertise.id}`);

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[0];

	try {
		const advertiseLog = new AdvertiseLog(advertise);

		await sheet.addRow({
			BoostId: advertiseLog._boostId,
			BoostPrice: advertiseLog._boostPrice,
			PublishedDate: advertiseLog._publishedDate,
			isCompleted: advertiseLog._isCompleted,
			isCanceled: advertiseLog._isCanceled,
			BoostedCustomer: advertiseLog._boostedCustomer,
			AdvertiserId: advertiseLog._advertiserId
		},
		);
	}
	catch (error) {
		console.error(`insertBoostRow ${error}`);
		logger.error(`insertBoostRow ${error}`);
	}

	console.info(`insertBoostRow ended at ${new Date().toLocaleString()}`);
	logger.info('insertBoostRow ended');
}

// Modify inserted advertise after ended boost with new values
async function updateBoostRow(advertise) {
	console.info(`updateBoostRow started at ${new Date().toLocaleString()}`);
	logger.info('updateBoostRow started');

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[0];

	var rows = await sheet.getRows();

	try {
		// Find specific row which is matches with advertiseId
		var advertiseId = advertise._message.id;
		// Search all of rows
		for (let row of rows) {
			// Which row.BoostId match with advertiseId(message id)
			if (advertiseId === row.BoostId) {
				row = await modifyAdvertiseLog(advertise, row);
				await row.save();
				break;
			}
		}
	}
	catch (error) {
		console.error(`updateBoostRow ${error}`);
		logger.error(`updateBoostRow ${error}`);
	}

	console.info(`Spreadsheet update end at ${new Date().toLocaleString()}`);
	logger.info('Spreadsheet update ended');
}

// When new member registered at Booster role insert him to sheet
async function insertBoosterRow(user) {
	console.info(`Spreadsheet insert start at${new Date().toLocaleString()}`);
	logger.info('Spreadsheet update started');

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[1];

	const rows = await sheet.getRows();

	try {
		let isExist = false;
		for (let row of rows) {
			if ((user.id === row.BoosterId)) {
				isExist = true;
				break;
			}
		}

		if (!isExist) {
			await sheet.addRow({
				BoosterId: user.id,
				BoosterTag: user.tag,
				Balance: 0,
				RegisteredAt: new Date().toLocaleString(),
			});
			console.log(`Booster added to sheet ${user.tag}`);
		}
	}
	catch (error) {
		console.error(`insertNewBooster ${error}`);
		logger.error(`insertNewBooster ${error}`);
	}

	console.info(`Spreadsheet insert start at${new Date().toLocaleString()}`);
	logger.info('Spreadsheet update started');
}

// Get current user balance
async function getBoosterBalance(user) {
	console.info(`getBoosterBalance started at ${new Date().toLocaleString()}`);
	logger.info('getBoosterBalance started');

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[1];

	var rows = await sheet.getRows();
	try {
		// Find specific row which is matches with advertiseId
		var boosterId = user.id;
		var balance = 0;
		// Search all of rows
		for (let row of rows) {
			if (boosterId === row.BoosterId) {
				balance = row.Balance;
				break;
			}
		}
	}
	catch (error) {
		console.error(`getBoosterBalance ${error}`);
		logger.error(`getBoosterBalance ${error}`);
	}

	console.info(`getBoosterBalance ended at ${new Date().toLocaleString()}`);
	logger.info('getBoosterBalance ended');
	return balance;
}

// Add money to user balance
async function depositBalance(opUser, user, amount) {
	console.info(`depositBalance started at ${new Date().toLocaleString()}`);
	logger.info('depositBalance started');

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	// Booster Balance
	const sheet = doc.sheetsByIndex[1];

	var rows = await sheet.getRows();

	// Find specific row which is matches with advertiseId
	var userId = user.id;
	// Search all of rows
	try {
		for (let row of rows) {
			if (userId === row.BoosterId) {
				const currentAmount = parseInt(row.Balance);
				const depositAmount = parseInt(amount);

				row.Balance = currentAmount + depositAmount;
				row.UpdatedAt = new Date().toLocaleString();
				await row.save();
				await transactionLog(opUser, user, depositAmount, 'depositBalance');

				console.info(`depositBalance ended at ${new Date().toLocaleString()}`);
				logger.info('depositBalance ended');

				const currentBalance = await getBoosterBalance(user);

				return (`**${depositAmount}** deposit successful to **${user}** balance!\nCurrent Balance: **${currentBalance}**`);
			}
		}
	}
	catch (error) {
		console.error(`depositBalance ${user} - ${error}`);
		logger.error(`depositBalance ${user} - ${error}`);
	}
}

// Withdraw money to user balance
async function withdrawBalance(opUser, user, amount) {
	console.info(`withdrawBalance started at ${new Date().toLocaleString()}`);
	logger.info('withdrawBalance started');

	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	// Booster Balance
	const sheet = doc.sheetsByIndex[1];

	var rows = await sheet.getRows();

	// Find specific row which is matches with advertiseId
	var userId = user.id;
	// Search all of rows
	try {
		for (let row of rows) {
			if (userId === row.BoosterId) {
				const currentAmount = parseInt(row.Balance);
				const withdrawAmount = parseInt(amount);
				if (currentAmount >= withdrawAmount) {
					row.Balance = currentAmount - withdrawAmount;
					row.UpdatedAt = new Date().toLocaleString();
					await row.save();
					// Written amount of price multiplying with minus for represent at spreadsheet
					await transactionLog(opUser, user, withdrawAmount * (-1), 'withdrawBalance');

					console.info(`withdrawBalance ended at ${new Date().toLocaleString()}`);
					logger.info('withdrawBalance ended');

					return (`${withdrawAmount} withdrawals successful from ${user} balance!`);
				}
				else {
					return (`The amount ${withdrawAmount} cannot be higher than ${user} balance!\n${user} Balance: ${currentAmount}`);
				}
			}
		}
	}
	catch (error) {
		console.error(`withdrawBalance ${user} - ${error}`);
		logger.error(`withdrawBalance ${user} - ${error}`);
	}
}

// All deposit and withdraw transactions storing
async function transactionLog(opUser, boosterUser, transAmount, detail) {
	await doc.useServiceAccountAuth(CLIENT_SECRET);
	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[2];

	await sheet.addRow({
		OperatedUserId: opUser.id,
		OperatedUser: opUser.tag,
		BoosterId: boosterUser.id,
		Booster: boosterUser.tag,
		Amount: transAmount,
		TransactionDate: new Date().toLocaleString(),
		Detail: detail,
	});

	logger.info('transactionLog record inserted');
}

// Can be wrapped for making simple and readable
function isNumeric(num) {
	return !isNaN(num);
}

client.on('ready', async () => {
	console.log(`Bot started at ${new Date().toLocaleString()}`);
	logger.info('Bot load started');
	console.time('Cached old messages in');
	// Do some process here
	try {
		// Get details of specific channel
		var channel = await client.channels.cache.get(WEBHOOK_TO).fetch();
		// Get all old messages
		var messages = await channel.messages.fetch().then((msg) => msg.map(m => m));

		// Fetch all of old messages then cache to MessageList
		if (!(messages == null)) {
			// Able to use await functions
			for (const m of messages) {
				if (!(m.embeds[0] == null)) {
					// Advertise title Canceled or Completed dont cache it
					if (m.embeds[0].title == 'Need Dungeon Booster!') {
						// Field modify not possible with const field(try use let)
						for (const field of m.embeds[0].fields) {
							// Fetching ADVERTISER
							if (field.name == 'Advertiser') {
								const regexId = field.value.replace(nonDigits, '');
								// Return user with by ID
								const advertiser = await client.users.fetch(regexId);
								var createdAdvertise = await newAdvertise(m, advertiser, false, false, false);
								console.info(`AdvertiseId: ${m.id} is cached!`);
								logger.info(`AdvertiseId: ${m.id} is cached!`);
							} // Fetching DPS AREA
							else if (field.name === DPS_ICON) {
								let regexUserId = field.value.replace(nonDigits, '');
								const regexResult = field.value.replace(digits, '');

								if (regexResult === '<@><:keys:>') {
									createdAdvertise._isDpsKey = true;
									// Take first 18 digit User Id
									regexUserId = regexUserId.substring(0, 18);
								}

								// Return user with by ID
								const user = await client.users.fetch(regexUserId);
								createdAdvertise._dpsBoosters.push(user);
								createdAdvertise._dpsUsers.push(user);
							} // Fetching DPS2 AREA
							else if (field.name === DPS2_ICON) {
								let regexUserId = field.value.replace(nonDigits, '');
								const regexResult = field.value.replace(digits, '');
								if (regexResult === '<@><:keys:>') {
									createdAdvertise._isDps2Key = true;
									// Take first 18 digit User Id
									regexUserId = regexUserId.substring(0, 18);
								}
								// Return user with by ID
								const user = await client.users.fetch(regexUserId);
								createdAdvertise._dps2Boosters.push(user);
								createdAdvertise._dps2Users.push(user);
							} // Fetching TANK AREA
							else if (field.name === TANK_ICON) {
								let regexUserId = field.value.replace(nonDigits, '');
								const regexResult = field.value.replace(digits, '');
								if (regexResult === '<@><:keys:>') {
									createdAdvertise._isTankKey = true;
									// Take first 18 digit User Id
									regexUserId = regexUserId.substring(0, 18);
								}
								// Return user with by ID
								const user = await client.users.fetch(regexUserId);
								createdAdvertise._tankBoosters.push(user);
								createdAdvertise._tankUsers.push(user);
							} // Fetching HEALER AREA
							else if (field.name === HEALER_ICON) {
								let regexUserId = field.value.replace(nonDigits, '');
								const regexResult = field.value.replace(digits, '');

								if (regexResult === '<@><:keys:>') {
									createdAdvertise._isHealerKey = true;
									// Take first 18 digit User Id
									regexUserId = regexUserId.substring(0, 18);
								}
								// Return user with by ID
								const user = await client.users.fetch(regexUserId);
								createdAdvertise._healerBoosters.push(user);
								createdAdvertise._healerUsers.push(user);
							}
							else if (field.name === 'Armor Stacked') {
								if (!(field.value === ARMOR_STACK.NONE)) {
									if (field.value === ARMOR_STACK.CLOTH) {
										createdAdvertise._stack = ARMOR_STACK.CLOTH;
									}
									else if (field.value === ARMOR_STACK.LEATHER) {
										createdAdvertise._stack = ARMOR_STACK.LEATHER;
									}
									else if (field.value === ARMOR_STACK.PLATE) {
										createdAdvertise._stack = ARMOR_STACK.PLATE;
									}
									else if (field.value === ARMOR_STACK.MAIL) {
										createdAdvertise._stack = ARMOR_STACK.MAIL;
									}
								}
							}
						}
						// TODO old messages reactions must be deleted
					}
					else {
						console.log(`Advertise id: ${m.id}, not available!`);
					}
				}
			}
		}
		else {
			console.warn(`This channel ${channel.id} doesn't have a any advertise`);
			logger.warn(`This channel ${channel.id} doesn't have a any advertise`);
		}
	}
	catch (error) {
		console.error(`ERROR while bot starting fetching old messages: ${error}`);
		logger.error(`ERROR while bot starting fetching old messages: ${error}`);
	}

	console.timeEnd('Cached old messages in');
	console.info(`Bot loaded at ${new Date().toLocaleString()}`);
	logger.info('Bot load completed');
});


client.on('message', async message => {
	// When webhook come get this message, then modify and send WEBHOOK_TO
	if (message.channel.id === WEBHOOK_FROM && message.author.bot) {
		// Is that message comes from webhook
		// Get webhook post
		var msg = (await message.fetch());
		// Get embeds on post
		var embed = new Discord.MessageEmbed(msg.embeds[0]);
		// modify embeds for advertise
		var newEmbed = await modifyWebhook(embed);
		// Send, new modified message to the specific channel
		try {
			await client.channels.cache.get(WEBHOOK_TO).send(newEmbed);
		}
		catch (error) {
			console.log('WEBHOOK POST ERROR: ' + error);
			logger.warn(`${error}`);
		}
	}
	// Modified webhooks, converting to the RichEmbed and filling inside
	if (message.channel.id === WEBHOOK_TO && message.author.bot) {
		if (message.embeds[0].title != null) {
			if (message.embeds[0].title == 'Need Dungeon Booster!') {
				// Add boostId for MessageId
				const tmpEmbed = message.embeds[0].setFooter('BoostId: ' + message.id, 'https://i.ibb.co/1fZjCLz/anka-trans.png');
				await message.edit(tmpEmbed);

				// Get advertiser from posted message with RegEx
				const advertiserId = message.embeds[0].fields[0].value.replace(nonDigits, '');
				// Return user with by ID
				const advertiser = await client.users.fetch(advertiserId);

				await newAdvertise(message, advertiser, false, false, false);

				// Search at MessageList bofere created advertise
				var advertise = await MessageList.find(x => x._message.id == message.id);

				// If advertiser wants to be a booster too check conditions
				if (isAdvertiserDps) {
					// Have a key for DPS
					if (isAdvertiserKey) {
						advertise._isDpsKey = true;
						advertise._dpsUsers.unshift(advertiser);
						await addDps(advertise, advertiser);
					}
					else {
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
					}
					else {
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
					}
					else {
						advertise._tankUsers.push(advertiser);
						addTank(advertise, advertiser);
					}
					isAdvertiserKey = false;
					isAdvertiserTank = false;
				}

				// Check advertise stack type
				if (!(advertiseStack == ARMOR_STACK.NONE)) {
					if (advertiseStack === ARMOR_STACK.CLOTH) {
						advertise._stack = ARMOR_STACK.CLOTH;
					}
					else if (advertiseStack === ARMOR_STACK.LEATHER) {
						advertise._stack = ARMOR_STACK.LEATHER;
					}
					else if (advertiseStack === ARMOR_STACK.PLATE) {
						advertise._stack = ARMOR_STACK.PLATE;
					}
					else if (advertiseStack === ARMOR_STACK.MAIL) {
						advertise._stack = ARMOR_STACK.MAIL;
					}
				}
				// Reset Advertise stack type
				advertiseStack = ARMOR_STACK.NONE;

				await insertBoostRow(advertise);

				// Add reacts to the message with Promise
				await message.react('734394556371697794') // DPS
					.then(() => message.react('734394557684383775')) // TANK
					.then(() => message.react('734394557294182520')) // HEALER
					.then(() => message.react('734394556744728628')) // DPS-2
					.then(() => message.react('734119765173600331')) // KEY
					.then(() => message.react('734368776908177468')) // EMPTY
					.then(() => message.react('734367159152541727')) // DONE
					.then(() => message.react('734367159148347392')) // CANCEL
					.catch('Problems while adding reactions!');

				// Notice all members after created advertise
				const newMsg = new Discord.MessageEmbed();
				newMsg.setDescription('**New boost created!\nBoost Id' + '```' + `${message.id}` + '```' + '\n<@&734454074467942903> <@&734454021343019159> <@&734453923665936394>**');

				await client.channels.cache.get(WEBHOOK_TO).send(newMsg);
			}
		}
	}
	// Commands available channel
	if (message.channel.id === COMMAND_CH && !message.author.bot) {
		// Take all parameters which are those sliced with whitespace
		const args = message.content.slice(PREFIX.length).trim().split(wSpace);
		const command = args.shift().toLowerCase();
		const opUser = message.author;

		/*  ex: -help
		*   Bot Commands */
		if (command === 'help') {
			message.author.send('For help commands about bot, please type to bot "-help"');
		}
		/*  ex: -balance {returns that user balance}
			ex: -balance @discord#1234 {returns tagged user balance}
		*   Checkout amount balance from specific user */
		else if (command === 'balance') {
			if (taggedUser.test(args[0])) {
				// Return user with by ID
				const user = await client.users.fetch(args[0].replace(nonDigits, ''));
				const balance = await getBoosterBalance(user);
				message.author.send(`${user} balance: **${balance}** ${GOLD_ICON}.\nIf you're think any wrong info, please contact support team.`);
			}
			else {
				const balance = await getBoosterBalance(message.author);
				message.author.send(`Your balance: **${balance}** ${GOLD_ICON}.\nIf you're think any wrong info, please contact support team.`);
			}
		}
		/*  ex: -withdraw @discord#1234 3152
		*   Checkout amount balance from specific user */
		else if (command === 'withdraw') {
			if ((!args[0] || !args[1]) == '') {
				// Return user with by ID
				const user = await client.users.fetch(args[0].replace(nonDigits, ''));
				const isNum = isNumeric(args[1]);

				if (user && isNum) {
					const transactionMsg = await withdrawBalance(opUser, user, args[1]);
					if (transactionMsg) {
						message.author.send(`${transactionMsg}`);
					}
				}
				else {
					message.author.send('Amount must be digits, not include comma, dot etc.');
				}
			}
			else {
				message.author.send(`ex: ${PREFIX}${command} @user#1234 30100`);
			}
		}
		/*  ex: -deposit @discord#1234 3152
		*   Add amount to balance specific user */
		else if (command === 'deposit') {
			if ((!args[0] || !args[1]) == '') {
				// Return user with by ID
				const user = await client.users.fetch(args[0].replace(nonDigits, ''));
				const isNum = isNumeric(args[1]);

				if (user && isNum) {
					const transactionMsg = await depositBalance(opUser, user, args[1]);
					if (transactionMsg) {
						message.author.send(`${transactionMsg}`);
					}
					else {
						message.author.send(`${user} doesn't Booster role/doesn't exits in sheet!`);
					}
				}
				else {
					message.author.send('Amount must be digits, not include comma, dot etc.\nex: -deposit user#1234 400');
				}
			}
			else {
				message.author.send(`ex: ${PREFIX}${command} @user#1234 30100`);
			}
		}
	}
	// When the user pm(private message) to Bot, returns all help commands to user.
	if (message.channel.type == 'dm') {
		const args = message.content.slice(PREFIX.length).trim().split(wSpace);
		const command = args.shift().toLowerCase();

		if (command === 'help') {
			// TODO @spyland8k
			message.author.send('-balance : Get your balance');
		}
	}
});


// Guild member role changed
client.on('guildMemberUpdate', async member => {
	// Specific role which user get this role
	const boosterRoleId = '735230459650506772';

	// if member in specific role take it otherwise skip
	const res = member.guild.roles.cache.get(boosterRoleId).members.get(member.id);

	if (res) {
		// which member takes a booster role then add him to sheet
		await insertBoosterRow(member.user);
	}
});


function addMessageField(advertise, user, role) {
	const tmpMsg = advertise._message.embeds[0];
	const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

	// Modified embed message
	if (role == 'dps') {
		if (advertise._isDpsKey) {
			tmpEmbed.fields.push({ name: DPS_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			tmpEmbed.fields.push({ name: DPS_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'dps2') {
		if (advertise._isDps2Key) {
			tmpEmbed.fields.push({ name: DPS2_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			tmpEmbed.fields.push({ name: DPS2_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'healer') {
		if (advertise._isHealerKey) {
			tmpEmbed.fields.push({ name: HEALER_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			tmpEmbed.fields.push({ name: HEALER_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'tank') {
		if (advertise._isTankKey) {
			tmpEmbed.fields.push({ name: TANK_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			tmpEmbed.fields.push({ name: TANK_ICON, value: `${user}`, inline: true });
		}
	}

	return tmpEmbed;
}

async function addDps(advertise, user) {
	if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
		if (advertise._dpsBoosters.length == 0) {
			// Get first user in dpsUsers
			advertise._dpsBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'dps');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
	else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
		if (advertise._dpsBoosters.length == 0) {
			// Get first user in dpsUsers
			advertise._dpsBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'dps');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
}

async function addTank(advertise, user) {
	if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dps2Users.includes(user)) {
		if (advertise._tankBoosters.length == 0) {
			// Get first user in tankBoosters
			advertise._tankBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'tank');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
	else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
		if (advertise._tankBoosters.length == 0) {
			// Get first user in tankBoosters
			advertise._tankBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'tank');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
}

async function addHealer(advertise, user) {
	if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user) && !advertise._dps2Users.includes(user)) {
		if (advertise._healerBoosters.length == 0) {
			// Get first user in healerBoosters
			advertise._healerBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'healer');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
	else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
		if (advertise._healerBoosters.length == 0) {
			// Get first user in healerBoosters
			advertise._healerBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'healer');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
	else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
		if (advertise._healerBoosters.length == 0) {
			// Get first user in healerBoosters
			advertise._healerBoosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'healer');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
}

async function addDps2(advertise, user) {
	if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dpsUsers.includes(user)) {
		if (advertise._dps2Boosters.length == 0) {
			// Get first user in dpsUsers
			advertise._dps2Boosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'dps2');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
	else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
		if (advertise._dps2Boosters.length == 0) {
			// Get first user in dpsUsers
			advertise._dps2Boosters.push(user);

			const tmpEmbed = addMessageField(advertise, user, 'dps2');

			// Send modified embed message
			await advertise._message.edit(tmpEmbed);
		}
	}
}

function removeMessageField(advertise, user, role) {
	const tmpMsg = advertise._message.embeds[0];
	const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

	// Which message field will be deleting
	const temp = new Discord.MessageEmbed().fields;

	if (role == 'dps') {
		if (advertise._isDpsKey) {
			temp.push({ name: DPS_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			temp.push({ name: DPS_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'dps2') {
		if (advertise._isDps2Key) {
			temp.push({ name: DPS2_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			temp.push({ name: DPS2_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'healer') {
		if (advertise._isHealerKey) {
			temp.push({ name: HEALER_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			temp.push({ name: HEALER_ICON, value: `${user}`, inline: true });
		}
	}
	else if (role == 'tank') {
		if (advertise._isTankKey) {
			temp.push({ name: TANK_ICON, value: `${user}${KEY_ICON}`, inline: true });
		}
		else {
			temp.push({ name: TANK_ICON, value: `${user}`, inline: true });
		}
	}

	// Remove field(temp) from current message
	for (let i = 9; i < tmpEmbed.fields.length; i++) {
		if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
			tmpEmbed.fields.splice(i, 1);
			i--;
		}
	}

	return tmpEmbed;
}

async function removeDps(advertise, user) {
	if (advertise._dpsUsers.includes(user)) {
		if (advertise._dpsBoosters.length >= 1) {
			const tmpEmbed = removeMessageField(advertise, user, 'dps');

			// New modified message
			await advertise._message.edit(tmpEmbed);

			// Remove user from dpsBooster
			var tmpUser = advertise._dpsBoosters.shift();
			// Remove user from dpsUsers
			// Find in healer user shifted healer booster
			// Delete tmpUser from dpsUsers
			const idx = advertise._dpsUsers.indexOf(tmpUser);
			if (idx > -1) {
				advertise._dpsUsers.splice(idx, 1);
			}

			// Who comes after him, avoid to add him with key (like reset)
			advertise._isDpsKey = false;

			// Add first user at dpsUser queue
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
		}
	}
}

async function removeTank(advertise, user) {
	if (advertise._tankUsers.includes(user)) {
		if (advertise._tankBoosters.length >= 1) {
			const tmpEmbed = removeMessageField(advertise, user, 'tank');

			// New modified message
			await advertise._message.edit(tmpEmbed);

			// Remove user from tankBooster
			const tmpUser = advertise._tankBoosters.shift();
			// Remove user from tankBooster
			// Find in healer user shifted healer booster
			// Delete tmpUser from tankUsers
			const idx = advertise._tankUsers.indexOf(tmpUser);
			if (idx > -1) {
				advertise._tankUsers.splice(idx, 1);
			}

			// Who comes after him, avoid to add him with key (like reset)
			advertise._isTankKey = false;

			// Add first user at tankUser queue
			if (advertise._tankUsers.length > 0) {
				await addTank(advertise, advertise._tankUsers[0]);
			}

			// User select DPS or DPS2
			if (advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)) {
				// Also selected 3rd HEALER
				if (advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0) {
					await addHealer(advertise, user);
				}

				// Which one is closer to the queue
				// Select one of them DPS-DPS2
				if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
					await addDps(advertise, user);
				}
				else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
					await addDps2(advertise, user);
				}
			}

			// User select DPS AND DPS2
			if (advertise._dpsUsers.includes(user) && advertise._dps2Users.includes(user)) {
				if (advertise._dpsUsers.indexOf(user) <= advertise._dps2Users.indexOf(user)) {
					if (advertise._dpsBoosters.length == 0)
						await addDps(advertise, user);
				}
				else if (advertise._dps2Boosters.length == 0) {
					await addDps2(advertise, user);
				}
			}
			else if (advertise._healerUsers.includes(user)) {
				if (advertise._healerBoosters.length == 0) {
					await addHealer(advertise, user);
				}
			}
		}
	}
}

async function removeHealer(advertise, user) {
	if (advertise._healerUsers.includes(user)) {
		if (advertise._healerBoosters.length >= 1) {
			const tmpEmbed = removeMessageField(advertise, user, 'healer');

			// New modified message
			await advertise._message.edit(tmpEmbed);

			// Remove user from healerBooster
			const tmpUser = advertise._healerBoosters.shift();
			// Remove user from healerUsers
			// Find in healer user shifted healer booster
			// Delete tmpUser from healerusers
			const idx = advertise._healerUsers.indexOf(tmpUser);
			if (idx > -1) {
				advertise._healerUsers.splice(idx, 1);
			}

			// Who comes after him, avoid to add him with key (like reset)
			advertise._isHealerKey = false;

			// Add first user at healerUser waiting at queue
			if (advertise._healerUsers.length > 0) {
				await addHealer(advertise, advertise._healerUsers[0]);
			}

			// If user select TANK
			if (advertise._tankUsers.includes(user)) {
				// If user select TANK AND DPS/DPS2 prefer DPS/DPS2
				if (advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)) {
					if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
						await addDps(advertise, user);
					}
					else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
						await addDps2(advertise, user);
					}
				}
				else if (!advertise._dpsUsers.includes(user) || !advertise._dps2Users.includes(user)) {
					if (advertise._tankBoosters.length == 0 && advertise._dpsBoosters.length == 0 && advertise._dps2Boosters.length == 0) {
						await addTank(advertise, user);
					}
					else {
						await addTank(advertise, user);
					}
				}
			}// If user not select TANK
			else if (!advertise._tankUsers.includes(user)) {
				// Which one is better select DPS/DPS2
				if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
					await addDps(advertise, user);
				}
				else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
					await addDps2(advertise, user);
				}
			}
		}
	}
}

async function removeDps2(advertise, user) {
	if (advertise._dps2Users.includes(user)) {
		if (advertise._dps2Boosters.length >= 1) {
			const tmpEmbed = removeMessageField(advertise, user, 'dps2');

			// New modified message
			await advertise._message.edit(tmpEmbed);

			// Remove user from dpsBooster
			const tmpUser = advertise._dps2Boosters.shift();
			// Remove user from dpsUsers
			// Find in healer user shifted healer booster
			// Delete tmpUser from dpsUsers
			const idx = advertise._dps2Users.indexOf(tmpUser);
			if (idx > -1) {
				advertise._dps2Users.splice(idx, 1);
			}

			// Who comes after him, avoid to add him with key (like reset)
			advertise._isDps2Key = false;

			// Add first user at dpsUser queue
			if (advertise._dps2Users.length > 0) {
				await addDps2(advertise, advertise._dpsUsers[0]);
			}

			if (advertise._tankUsers.includes(user)) {
				if (advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)) {
					if (advertise._healerBoosters.length == 0)
						await addHealer(advertise, user);
				}
				else if (advertise._dpsUsers.includes(user)) {
					if (advertise._dpsBoosters.length == 0)
						await addDps(advertise, user);
				}
				else if (advertise._tankBoosters.length == 0)
					await addTank(advertise, user);
			}
			else if (!advertise._tankUsers.includes(user)) {
				if (advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)) {
					if (advertise._healerBoosters.length == 0)
						await addHealer(advertise, user);
				}// TODO DPS/DPS2 reaction doesnt work perfectly
				else if (advertise._dpsUsers.includes(user)) {
					if (advertise._dpsBoosters.length == 0)
						await addDps(advertise, user);
				}
				else if (advertise._healerUsers.includes(user)) {
					if (advertise._healerBoosters.length == 0)
						await addHealer(advertise, user);
				}
			}
		}
	}
}

function replaceMessageField(advertise, user, role) {
	const tmpMsg = advertise._message.embeds[0];
	const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

	if (role == 'dps') {
		for (let i = 10; i < tmpEmbed.fields.length; i++) {
			if (tmpEmbed.fields[i].value == `${user}`) {
				tmpEmbed.fields.splice(i, 1, { name: DPS_ICON, value: `${user}${KEY_ICON}`, inline: true });
				i--;
			}
		}
	}
	else if (role == 'dps2') {
		for (let i = 10; i < tmpEmbed.fields.length; i++) {
			if (tmpEmbed.fields[i].value == `${user}`) {
				tmpEmbed.fields.splice(i, 1, { name: DPS2_ICON, value: `${user}${KEY_ICON}`, inline: true });
				i--;
			}
		}
	}
	else if (role == 'healer') {
		for (let i = 10; i < tmpEmbed.fields.length; i++) {
			if (tmpEmbed.fields[i].value == `${user}`) {
				tmpEmbed.fields.splice(i, 1, { name: HEALER_ICON, value: `${user}${KEY_ICON}`, inline: true });
				i--;
			}
		}
	}
	else if (role == 'tank') {
		for (let i = 10; i < tmpEmbed.fields.length; i++) {
			if (tmpEmbed.fields[i].value == `${user}`) {
				tmpEmbed.fields.splice(i, 1, { name: TANK_ICON, value: `${user}${KEY_ICON}`, inline: true });
				i--;
			}
		}
	}

	return tmpEmbed;
}

async function dpsReplace(advertise, user) {
	if (advertise._dpsUsers.includes(user) && !advertise._isDpsKey) {
		const tmpMsg = advertise._message.embeds[0];
		const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

		// Remove user from dpsBooster
		const tempUser = advertise._dpsBoosters.shift();

		// Which message will be deleting
		const temp = new Discord.MessageEmbed().fields;
		temp.push({ name: DPS_ICON, value: `<@${tempUser.id}>`, inline: true });

		// Search message fields and delete it
		for (let i = 0; i < tmpEmbed.fields.length; i++) {
			if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
				tmpEmbed.fields.splice(i, 1);
				i--;
			}
		}
		// New modified message
		await advertise._message.edit(tmpEmbed);

		// Delete tempUser from dpsUsers
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
	else if (advertise._dpsUsers.includes(user) && advertise._isDpsKey) {
		// Then add user 2nd place
		if (advertise._dpsUsers.length == 0) {
			advertise._dpsUsers.push(user);
		}
		console.log(`UserId: ${advertise.dpsBoosters[0].id} is already have a key! ${user.id} is coming after him.`);
	}
}

async function dps2Replace(advertise, user) {
	if (advertise._dps2Users.includes(user) && !advertise._isDps2Key) {
		const tmpMsg = advertise._message.embeds[0];
		const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

		// Remove user from dps2Booster
		const tempUser = advertise._dps2Boosters.shift();

		// Which message will be deleting
		const temp = new Discord.MessageEmbed().fields;
		temp.push({ name: DPS2_ICON, value: `<@${tempUser.id}>`, inline: true });

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
		console.log(`UserId: ${advertise.dps2Boosters[0].id} is already have a key! ${user.id} is coming after him.`);
	}
}

async function tankReplace(advertise, user) {
	if (advertise._tankUsers.includes(user) && !advertise._isTankKey) {
		const tmpMsg = advertise._message.embeds[0];
		const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

		// Remove user from tankBoosters
		const tempUser = advertise._tankBoosters.shift();

		// Which message will be deleting
		const temp = new Discord.MessageEmbed().fields;
		temp.push({ name: TANK_ICON, value: `<@${tempUser.id}>`, inline: true });

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
		console.log(`UserId: ${advertise._tankBoosters[0].id} is already have a key! ${user.id} is coming after him.`);
	}
}

async function healerReplace(advertise, user) {
	if (advertise._healerUsers.includes(user) && !advertise._isHealerKey) {
		const tmpMsg = advertise._message.embeds[0];
		const tmpEmbed = new Discord.MessageEmbed(tmpMsg);

		// Remove user from healerBoosters
		const tempUser = advertise._healerBoosters.shift();

		// Which message will be deleting
		const temp = new Discord.MessageEmbed().fields;
		temp.push({ name: HEALER_ICON, value: `<@${tempUser.id}>`, inline: true });

		// Search message content and delete it
		for (let i = 0; i < tmpEmbed.fields.length; i++) {
			if ((tmpEmbed.fields[i].value == temp[0].value) && (tmpEmbed.fields[i].name == temp[0].name)) {
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
		console.log(`UserId: ${advertise._healerUsers[0].id} is already have a key! ${user.id} is coming after him.`);
	}
}

client.on('messageReactionAdd', async (reaction, user) => {
	var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);

	if ((!user.bot && currAdv) && (reaction.message.channel.id == WEBHOOK_TO)) {
		// Find which advertise reacted
		if (currAdv) {
			// If reacted user is a Advertiser, then access
			if (currAdv._advertiser == user) {
				let boosterSize = currAdv._dpsBoosters.length;
				boosterSize += currAdv._dps2Boosters.length;
				boosterSize += currAdv._tankBoosters.length;
				boosterSize += currAdv._healerBoosters.length;

				// Advertise should be 4 boosters
				// When DONE button reacted,
				// Remove all role emojis and change adv. FULL=true
				if (reaction.emoji.id === DONE_ICON.replace(nonDigits, '') && !currAdv._isFull && (boosterSize == 4)) {
					currAdv._isFull = true;

					// edit message content
					const tempMsg = currAdv._message.embeds[0];
					tempMsg.setColor('#00e600');
					tempMsg.setTitle('Boosting Started!');
					tempMsg.setThumbnail('https://i.ibb.co/6PwpzFd/big-done.png');
					tempMsg.setDescription(`**The boosting has been started by ${user} at ${new Date().toLocaleString()}!**`);
					await currAdv._message.edit(tempMsg);

					// Update related row at sheet
					await updateBoostRow(currAdv);

					const reactions = await currAdv._message.reactions;
					const rec = await reactions.cache.map(reac => reac);

					await rec.forEach(r => {
						// Don't delete Done, RunFinish and Cancel Emojis
						if (!(r.emoji.id == DONE_ICON.replace(nonDigits, '')) && !(r.emoji.id == FINISH_ICON.replace(nonDigits, '')) && !(r.emoji.id == CANCEL_ICON.replace(nonDigits, ''))) {
							r.remove();
						}
					});
					currAdv._message.react(FINISH_ICON.replace(nonDigits, ''));
					const newMsg = new Discord.MessageEmbed();

					newMsg.setDescription(`<@${currAdv._advertiser.id}> owner of boosting started, Good luck!
                        ${DPS_ICON}<@${currAdv._dpsBoosters[0].id}>, ${DPS2_ICON}<@${currAdv._dps2Boosters[0].id}>, ${HEALER_ICON}<@${currAdv._healerBoosters[0].id}>, ${TANK_ICON}<@${currAdv._tankBoosters[0].id}>`
						+ '```\\w ' + currAdv._message.embeds[0].field[9].value + ' inv```');

					await client.channels.cache.get(WEBHOOK_TO).send(newMsg);
				}
				// When CANCELED button reacted, Change advertise content then
				// Remove all another emojis and change adv. status CANCELED=true
				if (reaction.emoji.id === CANCEL_ICON.replace(nonDigits, '') && !currAdv._isCanceled) {
					currAdv._isCanceled = true;

					// Update related row at sheet
					await updateBoostRow(currAdv);

					// edit message content
					const tempMsg = currAdv._message.embeds[0];
					tempMsg.fields = [];
					tempMsg.setColor('#ff0000');
					tempMsg.setTitle('Boosting Canceled!');
					tempMsg.setThumbnail('https://i.ibb.co/gyXFgmC/big-cancel.png');
					tempMsg.setDescription(`The boosting has been canceled by ${user}`);
					await currAdv._message.edit(tempMsg);

					const reactions = await currAdv._message.reactions;
					const rec = await reactions.cache.map(reac => reac);
					await rec.forEach(r => {
						// Don't delete Cancel Emoji
						if (!(r.emoji.id == CANCEL_ICON.replace(nonDigits, ''))) {
							r.remove();
						}
					});
				}
				// When FINISHED button reacted,
				// Remove all another emojis and change adv. status COMPLETED=true
				if (reaction.emoji.id === FINISH_ICON.replace(nonDigits, '') && !currAdv._isCompleted) {
					currAdv._isCompleted = true;

					// Update related row at sheet
					await updateBoostRow(currAdv);

					// Balances added to the booster users
					const total = currAdv._message.embeds[0].fields[6].value;
					const advertiserPrice = Math.round((parseInt(total) * ADVERTISER_CUT));
					const boosterPrice = Math.round((parseInt(total) * BOOSTER_CUT));

					// Advertise Cut
					await depositBalance(currAdv._advertiser, advertiserPrice);
					// Booster Cuts
					await depositBalance(currAdv._dpsBoosters[0], boosterPrice);
					await depositBalance(currAdv._dps2Boosters[0], boosterPrice);
					await depositBalance(currAdv._healerBoosters[0], boosterPrice);
					await depositBalance(currAdv._tankBoosters[0], boosterPrice);

					// Edit message content
					const tempMsg = currAdv._message.embeds[0];
					tempMsg.setColor('#03fcad');
					tempMsg.setTitle('Boosting Completed!');
					tempMsg.setThumbnail('https://i.ibb.co/d6q1b40/runfinish.png');
					tempMsg.setDescription(`The boosting has been completed, approved by ${user} at ${new Date().toLocaleString()}`);
					await currAdv._message.edit(tempMsg);

					const reactions = await currAdv._message.reactions;
					const rec = await reactions.cache.map(reac => reac);

					await rec.forEach(r => {
						if (!(r.emoji.id == FINISH_ICON.replace(nonDigits, ''))) {
							r.remove();
						}
					});

					console.info(`${currAdv._message.id} is completed, balances will be added soon. You can check your balance`);
					logger.info(`${currAdv._message.id} is completed, balances will be added soon. You can check your balance`);
				}
			}
			// If is advertise isnt full then catch reactions
			// Boosters can react those
			if (!currAdv._isFull && !currAdv._isCanceled && !currAdv.isComplete) {
				try {
					var role, hasRole;
					if (currAdv._stack == ARMOR_STACK.NONE) {
						// Accepts everyone
						hasRole = true;
					}
					else if (currAdv._stack == ARMOR_STACK.CLOTH) {
						// Search advertise armor stack type for all armor stack Roles in server
						role = reaction.message.guild.roles.cache.find(r => r.name == CLOTH_STACK.replace(nonDigits, ''));
						if (role) {
							// Is that role belongs with this user
							hasRole = role.members.find(m => m.id == user.id);
						}
					}
					else if (currAdv._stack == ARMOR_STACK.LEATHER) {
						role = reaction.message.guild.roles.cache.find(r => r.name == LEATHER_STACK.replace(nonDigits, ''));
						if (role) {
							// Is that role belongs with this user
							hasRole = role.members.find(m => m.id == user.id);
						}
					}
					else if (currAdv._stack == ARMOR_STACK.PLATE) {
						role = reaction.message.guild.roles.cache.find(r => r.id == PLATE_STACK.replace(nonDigits, ''));
						if (role) {
							// Is that role belongs with this user
							hasRole = role.members.find(m => m.id == user.id);
						}
					}
					else if (currAdv._stack == ARMOR_STACK.MAIL) {
						role = reaction.message.guild.roles.cache.find(r => r.name == MAIL_STACK.replace(nonDigits, ''));
						if (role) {
							// Is that role belongs with this user
							hasRole = role.members.find(m => m.id == user.id);
						}
					}
				}
				catch (error) {
					console.error(`Error while in a search at advertise armor stack roles of member: ${error}`);
					logger.error(`Error while in a search at advertise armor stack roles of member: ${error}`);
				}

				if (hasRole) {
					// Dps Queue
					if (reaction.emoji.id === DPS_ICON.replace(nonDigits, '')) {
						// If reacted user does not exist in dpsUsers, avoid clone
						if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
							// If booster is already take the any role boost, put new user front of him
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
					else if (reaction.emoji.id === DPS2_ICON.replace(nonDigits, '')) {
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
					else if (reaction.emoji.id === TANK_ICON.replace(nonDigits, '')) {
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
					else if (reaction.emoji.id === HEALER_ICON.replace(nonDigits, '')) {
						if (!currAdv._healerUsers.includes(user)) {
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
					else if (reaction.emoji.id === KEY_ICON.replace(nonDigits, '')) {
						// REPLACE HEALER
						if (currAdv._healerUsers.includes(user) || currAdv._healerBoosters.includes(user)) {
							// User is already in HEALER, change the Key status
							if (currAdv._healerUsers.includes(user) && currAdv._healerBoosters.includes(user)) {
								currAdv._isHealerKey = true;

								const tmpEmbed = replaceMessageField(currAdv, user, 'healer');

								// Send modified embed message
								await currAdv._message.edit(tmpEmbed);
							}
							// User is waiting at queue add him instantly to the HEALER
							else if (currAdv._healerUsers.includes(user) && !currAdv._healerBoosters.includes(user) && currAdv._isHealerKey) {
								// Remove user if doesnt have key, put 2nd place dps queue
								await healerReplace(currAdv, user);
							}
						}// REPLACE DPS
						else if (currAdv._dpsUsers.includes(user) || currAdv._dpsBoosters.includes(user)) {
							// User is already in DPS, change the Key status
							if (currAdv._dpsUsers.includes(user) && currAdv._dpsBoosters.includes(user)) {
								currAdv._isDpsKey = true;

								const tmpEmbed = replaceMessageField(currAdv, user, 'dps');

								// Send modified embed message
								await currAdv._message.edit(tmpEmbed);
							}
							// User is waiting at queue add him instantly to the DPS
							else if (currAdv._dpsUsers.includes(user) && !currAdv._dpsBoosters.includes(user) && currAdv._isDpsKey) {
								// Remove user if doesnt have key, put 2nd place dps queue
								await dpsReplace(currAdv, user);
							}
						}// REPLACE DPS2
						else if (currAdv._dps2Users.includes(user) || currAdv._dps2Boosters.includes(user)) {
							// User is already in DPS2, change the Key status
							if (currAdv._dps2Users.includes(user) && currAdv._dps2Boosters.includes(user)) {
								currAdv._isDps2Key = true;

								const tmpEmbed = replaceMessageField(currAdv, user, 'dps2');

								// Send modified embed message
								await currAdv._message.edit(tmpEmbed);
							}
							// User is waiting at queue add him instantly to the DPS2
							else if (currAdv._dps2Users.includes(user) && !currAdv._dps2Boosters.includes(user) && currAdv._isDps2Key) {
								// Remove user if doesnt have key, put 2nd place dps queue
								await dps2Replace(currAdv, user);
							}
						}// REPLACE TANK
						else if (currAdv._tankUsers.includes(user) || currAdv._tankBoosters.includes(user)) {
							// User is already in TANK, change the Key status
							if (currAdv._tankUsers.includes(user) && currAdv._tankBoosters.includes(user)) {
								currAdv._isTankKey = true;

								const tmpEmbed = replaceMessageField(currAdv, user, 'tank');

								// Send modified embed message
								await currAdv._message.edit(tmpEmbed);
							}
							// User is waiting at queue add him instantly to the TANK
							else if (currAdv._tankUsers.includes(user) && !currAdv._tankBoosters.includes(user) && currAdv._isTankKey) {
								// Remove user if doesnt have key, put 2nd place dps queue
								await tankReplace(currAdv, user);
							}
						}
						else {
							user.send(`Advertise: **${currAdv._message.id}** you have to select any role before the click **'KEY'** React!`);
							console.warn(`${user.tag}, you have to select any role before the click KEY React!`);
							logger.warn(`${user.tag}, you have to select any role before the click KEY React!`);
						}
					}
				}
				else {
					user.send(`You cannot take booster at **${currAdv._message.id}**, Advertiser wants **(${currAdv._stack})** stack!`);
				}
			}
			else {
				console.info('Advertise not available.');
				logger.info(`${currAdv._message.id} Advertise not available.`);
			}
		}
		else {
			reaction.message.reply('Advertise not registered! Please contact' + '```' + `${reaction.message.id}` + '```');
			logger.info('Advertise not registered! Please contact' + '```' + `${reaction.message.id}` + '```');
		}
	}
});


client.on('messageReactionRemove', async (reaction, user) => {
	var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);

	// Find which advertise reacted
	if (currAdv && (reaction.message.id == currAdv._message.id)) {
		// Advertise status available
		if (!currAdv._isFull && !currAdv._isCanceled && !currAdv._isCompleted) {
			// DPS Boosters
			if (reaction.emoji.id === DPS_ICON.replace(nonDigits, '')) {
				if (currAdv._dpsBoosters.includes(user)) {
					await removeDps(currAdv, user);
				}
				else {
					// User is waiting in Queue, release him before assign booster
					if (currAdv._dpsUsers.length > 0) {
						currAdv._dpsUsers.forEach(function (item, index, object) {
							if (item === user) {
								object.splice(index, 1);
							}
						});
					}
				}
			}// DPS2 Boosters
			else if (reaction.emoji.id === DPS2_ICON.replace(nonDigits, '')) {
				if (currAdv._dps2Boosters.includes(user)) {
					await removeDps2(currAdv, user);
				}
				else {
					// User is waiting in Queue, release him before assign booster
					if (currAdv._dps2Users.length > 0) {
						currAdv._dps2Users.forEach(function (item, index, object) {
							if (item === user) {
								object.splice(index, 1);
							}
						});
					}
				}
			} // Tank Boosters
			else if (reaction.emoji.id === TANK_ICON.replace(nonDigits, '')) {
				if (currAdv._tankBoosters.includes(user)) {
					await removeTank(currAdv, user);
				}
				else {
					// User is waiting in Queue, release him before assign booster
					if (currAdv._tankUsers.length > 0) {
						currAdv._tankUsers.forEach(function (item, index, object) {
							if (item === user) {
								object.splice(index, 1);
							}
						});
					}
				}
			} // Healer Boosters
			else if (reaction.emoji.id === HEALER_ICON.replace(nonDigits, '')) {
				if (currAdv._healerBoosters.includes(user)) {
					await removeHealer(currAdv, user);
				}
				else {
					// User is waiting in Queue, release him before assign booster
					if (currAdv._healerUsers.length > 0) {
						currAdv._healerUsers.forEach(function (item, index, object) {
							if (item === user) {
								object.splice(index, 1);
							}
						});
					}
				}
			} // Key Emote
			else if (reaction.emoji.id === KEY_ICON.replace(nonDigits, '')) {
				// Key remove event already did from replace
				// Disabled reaction avoid griefing role assignment
			}
		}
		else {
			console.log(`Advertise id: ${reaction.message.id} cannot available`);
		}
	}
});