require('dotenv').config();

module.exports = {
	// Google SpreadsheetAPI Credentials (.env)
	CLIENT_SECRET: {
		type: process.env.type,
		project_id: process.env.project_id,
		private_key_id: process.env.private_key_id,
		// https://github.com/auth0/node-jsonwebtoken/issues/642
		private_key: process.env.private_key.replace(/\\n/gm, '\n'),
		client_email: process.env.client_email,
		client_id: process.env.client_id,
		auth_uri: process.env.auth_uri,
		token_uri: process.env.token_uri,
		auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
		client_x509_cert_url: process.env.client_x509_cert_url,
	},
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	WEBHOOK_ID: process.env.WEBHOOK_ID,
	WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN,
	SPREADSHEET_ID: process.env.SPREADSHEET_ID,
};