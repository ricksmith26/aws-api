
const database = {
	
	host: "gamerdatabase21.cdhxwqpgddxe.eu-west-2.rds.amazonaws.com",
	port: 5432,
	database: "postgres",
	user: "masterUsername",
	password: "gamerpass"
};

const pgp = require("pg-promise")({ promiseLib: Promise });

const db = pgp(database);

const headers = {
	'Access-Control-Allow-Origin': '*',
	// 'Access-Control-Allow-Credentials': true,
}

module.exports = {
    pgp, db, database, headers
};
