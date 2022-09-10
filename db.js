// connect
const database = require('knex')({
	client: 'better-sqlite3', // or 'better-sqlite3'
	connection: {
		filename: "./public/mydb.sqlite"
	},
	useNullAsDefault: true,
	debug: false
});

// create table
database.schema.hasTable('books').then(exists => {
	if(!exists) {
		console.log("not exists");
		return database.schema.createTable('books', t => {
			t.increments('id').primary();
			t.string('value', 100);
			t.boolean('packed');
		});
	}
	else {
		console.log("exists");
	}
});

// add
database('books').insert(
	{
		value: 'name B',packed: false
	}
).then(function(){
	console.log("done");
});

// fetch
var _data = database('books').select().then(function(data){
	console.log(data);
	// return data;
});