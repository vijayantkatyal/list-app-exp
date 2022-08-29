import 'better-sqlite3';
import knex from 'knex';

const path = require('path');

const database = require('knex')({
	client: 'better-sqlite3',
	connection: {
	  filename: "./mydb.sqlite"
	},
	useNullAsDefault: true
});

export default database;