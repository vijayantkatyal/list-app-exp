const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

// const database = require("./../src/database");

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
	  devTools: true,
	  sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Load from localhost if in development
  // Otherwise load index.html file
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open DevTools if in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Create a new browser window by invoking the createWindow
// function once the Electron application is initialized.
// Install REACT_DEVELOPER_TOOLS as well if isDev
app.whenReady().then(() => {
  if (isDev) {
    // installExtension(REACT_DEVELOPER_TOOLS , { loadExtensionOptions: { allowFileAccess: true } })
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((error) => console.log(`An error occurred: , ${error}`));
  }

  createWindow();
});

// Add a new listener that tries to quit the application when
// it no longer has any open windows. This listener is a no-op
// on macOS due to the operating system's window management behavior.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Add a new listener that creates a new browser window only if
// when the application has no visible windows after being activated.
// For example, after launching the application for the first time,
// or re-launching the already running application.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// var _path = path.join(process.env.APPDATA, "/data/mydb.sqlite");



// var _path = path.join(__dirname, "mydb.sqlite");

var _path = path.join(app.getPath('userData'), 'jetsetter-items.sqlite');
console.log("PATH: "+ _path);

const database = require('knex')({
	client: 'better-sqlite3', // or 'better-sqlite3'
	connection: {
		// filename: "./data/mydb.sqlite"
		filename: _path
	},
	useNullAsDefault: true,
	debug: false
});

app.on("ready", function(){

	// const database = require('knex')({
	// 	client: 'better-sqlite3', // or 'better-sqlite3'
	// 	connection: {
	// 		filename: "./public/mydb.sqlite"
	// 	},
	// 	useNullAsDefault: true,
	// 	debug: false
	// });
	
	// get tables
	database('sqlite_master').where({type: 'table'}).whereNot('name', 'sqlite_sequence').select('name').then(function(data){
		console.log('--------------------------------');
		console.log(data);
		console.log('--------------------------------');
	});

});




ipcMain.on("message", (event, data) => {

	// console.log(data);

	// get all tables
	if(data.query == "get_all_tables")
	{
		database('sqlite_master').where({type: 'table'}).whereNot('name', 'sqlite_sequence').select('name').then(function(res){
			event.returnValue = res;	
		});
	}

	if(data.query == "insert_new_table")
	{
		// create new table
		database.schema.createTable(data.table_name, t => {
			t.increments('id').primary();
			data.columns.forEach(name => {
				t.string(name, 100);
			});
		}).then(function(res) {

			// database(data.table_name).insert(data.data).then(function(){
			// 	event.returnValue = "data created";
			// });

			database.batchInsert(data.table_name, data.data, 500).then(function(){
				event.returnValue = "data_created";
			});

		});
		// create new columns
		// insert data
	}
	
	// get specific table columns
	if(data.query == "get_table_schema")
	{
		database(data.table_name).columnInfo().then(function(res){
			event.returnValue = res;
		});	
	}

	// get specific table data
	if(data.query == "get_table_data")
	{
		database(data.table_name).select().then(function(res){
			event.returnValue = res;
		});	
	}

	// rename specific table data
	if(data.query == "rename_table")
	{
		database.schema.renameTable(data.table_name, data.table_name_new).then(function(res){
			event.returnValue = "renamed";
		})
	}

	// remove duplicates
	if(data.query == "remove_duplicate_table")
	{
		// only unique data

		database(data.table_name).distinct('email').select('first_name', 'last_name', 'email').then(function(res){
			
			var _new_table_only_unique = data.table_name+"_unique";
			var _new_table_only_duplicate = data.table_name+"_duplicate";

			database.schema.createTable(_new_table_only_unique, t => {
				t.increments('id').primary();
				t.string("first_name", 100);
				t.string("last_name", 100);
				t.string("email", 100);
			}).then(function(u_res) {
				database.batchInsert(_new_table_only_unique, res, 500).then(function(){
					database.from(data.table_name).groupBy("email").count('email as email_count').orderBy("email").having("email_count", ">", 1).select("first_name", "last_name", "email").then(function(d_res){
						
						database.schema.createTable(_new_table_only_duplicate, t => {
							t.increments('id').primary();
							t.string("first_name", 100);
							t.string("last_name", 100);
							t.string("email", 100);
						}).then(function(d_t_res) {
							var _n_res = d_res.map(({email_count, ...item}) => item);
							database.batchInsert(_new_table_only_duplicate, _n_res, 500).then(function(){
								event.returnValue = "done";
							});
						});
					});
				});
			});
		});

		// only duplicate data

		// database.from("abc").groupBy("email").count('email as email_count').orderBy("email").having("email_count", ">", 1).select("first_name", "last_name", "email").then(function(res){
		// 	var _n_res = res.map(({email_count, ...item}) => item);
		// 	event.returnValue = _n_res;
		// });
	}

	// removing missing emails data
	if(data.query == "remove_missing_email_from_table")
	{
		database(data.table_name).where("email", null).delete().then(function(res){
			event.returnValue = "done";
		});	
	}

	// remove emails based on filter
	if(data.query == "filter_email_from_table")
	{
		var words = data.words;
		var words_array = words.split(",");

		// database(data.table_name).whereRaw("email NOT LIKE '%@%'").orWhereRaw("email LIKE '%Nelle%'").select().then(function(res){
		// 	event.returnValue = res;
		// });

		// database(data.table_name).whereRaw("email NOT LIKE '%@%'").orWhereRaw("email REGEXP_LIKE '"+ words_array +"'").select().then(function(res){
		// 	event.returnValue = res;
		// });

		var sql = '';

		words_array.forEach((word, index) => {
			var _q = "OR email LIKE '%"+word+"%' ";
			sql += _q;
		});

		database.raw("DELETE FROM abc WHERE email NOT LIKE '%@%' " + sql).then(function(res){
			event.returnValue = "done";
		});

		
	}

	// delete specific table data
	if(data.query == "delete_table")
	{
		database.schema.dropTableIfExists(data.table_name).then(function(res){
			event.returnValue = "deleted";
		})
	}

	// merge tables
	if(data.query == "merge_tables")
	{
		var _first_table = data.tables[0];
		var _tables = data.tables;
		_tables.shift();

		var sql = '';
		_tables.forEach((table_name, index) => {
			var _q = " UNION ALL SELECT first_name, last_name, email FROM " + table_name;
			sql += _q;
		});

		database.raw("SELECT first_name, last_name, email FROM " + _first_table + " " + sql).then(function(table_data){
			database.schema.createTable(data.table_name, t => {
				t.increments('id').primary();
				t.string("first_name", 100);
				t.string("last_name", 100);
				t.string("email", 100);
			}).then(function(res) {
	
				database.batchInsert(data.table_name, table_data, 500).then(function(){
					event.returnValue = "data_created";
				});
	
			});
		});
	}

	// subtract tables
	if(data.query == "subtract_tables")
	{
		var _tables = data.tables;

		var sql = '';
		_tables.forEach((table_name, index) => {
			var _q = " EXCEPT SELECT first_name, last_name, email FROM " + table_name;
			sql += _q;
		});

		database.raw("SELECT first_name, last_name, email FROM " + data.main_table + " " + sql).then(function(table_data){
			database.schema.createTable(data.table_name, t => {
				t.increments('id').primary();
				t.string("first_name", 100);
				t.string("last_name", 100);
				t.string("email", 100);
			}).then(function(res) {
	
				database.batchInsert(data.table_name, table_data, 500).then(function(){
					event.returnValue = "data_created";
				});
	
			});
		});
	}

	// subtract tables
	if(data.query == "unique_tables")
	{
		var _tables = data.tables;

		var sql = '';
		_tables.forEach((table_name, index) => {
			var _q = " INTERSECT SELECT first_name, last_name, email FROM " + table_name;
			sql += _q;
		});

		database.raw("SELECT first_name, last_name, email FROM " + data.main_table + " " + sql).then(function(table_data){
			database.schema.createTable(data.table_name, t => {
				t.increments('id').primary();
				t.string("first_name", 100);
				t.string("last_name", 100);
				t.string("email", 100);
			}).then(function(res) {
	
				database.batchInsert(data.table_name, table_data, 500).then(function(){
					event.returnValue = "data_created";
				});
	
			});
		});
	}

	if(data.query == "split_email_tables")
	{
		var domains = data.domains;

		domains = domains.split(",");

		var _done = 0;

		domains.forEach((domain, index) => {
			database.raw("SELECT first_name, last_name, email FROM "+ data.main_table +" WHERE email LIKE '%"+ domain +"%'").then(function(table_data){

				var _n_table_name = data.main_table + "_" + domain;
				
				database.schema.createTable(_n_table_name, t => {
					t.increments('id').primary();
					t.string("first_name", 100);
					t.string("last_name", 100);
					t.string("email", 100);
				}).then(function(res) {
		
					database.batchInsert(_n_table_name, table_data, 500).then(function(){
						_done += 1;

						if(domains.length == _done)
						{
							event.returnValue = "done";
						}
					});
		
				});
			});
		});
	}

	if(data.query == "split_tables")
	{
		if(data.type == "by_record_count")
		{
			// split by number of records
			database(data.main_table).count({count: '*'}).then(function(count_res){
				var _count = count_res[0].count;

				var _offset_array = [];

				// 40,000 / 10000 = 4
				var _upper_offset_counts = Math.ceil(_count / data.number) + 1;

				for (let index = 0; index < _upper_offset_counts; index++) {
					// const element = array[index];
					var _tmp_offset = index * data.number;
					_offset_array.push(_tmp_offset);
				}

				var _done = 0;

				_offset_array.forEach(function(_tmp_offset_item, index){
					database.select("*").from(data.main_table).orderBy('id').limit(data.number).offset(_tmp_offset_item).then(function(table_data){
					 	// create table with data
						 var _n_table_name = data.main_table + "_list_"+ index;

						database.schema.createTable(_n_table_name, t => {
							t.increments('id').primary();
							t.string("first_name", 100);
							t.string("last_name", 100);
							t.string("email", 100);
						}).then(function(res) {
				
							database.batchInsert(_n_table_name, table_data, 500).then(function(){
								_done += 1;

								if(_offset_array.length == _done)
								{
									event.returnValue = "done";
								}
							});

						});
					});
				});

			});
		}

		if(data.type == "by_number_of_lists")
		{
			// get total count
			database(data.main_table).count({count: '*'}).then(function(count_res){
				var _count = count_res[0].count;
				
				// calculate lists
				// 40,000 / 10 = 4000

				var _limit = Math.ceil(_count / data.number);

				var _offset_array = [];

				// 40,000 / 10000 = 4
				var _upper_offset_counts = Math.ceil(_count / _limit);

				for (let index = 0; index < _upper_offset_counts; index++) {
					// const element = array[index];
					var _tmp_offset = index * _limit;
					_offset_array.push(_tmp_offset);
				}

				var _done = 0;

				_offset_array.forEach(function(_tmp_offset_item, index){
					database.select("*").from(data.main_table).orderBy('id').limit(_limit).offset(_tmp_offset_item).then(function(table_data){
					 	// create table with data
						 var _n_table_name = data.main_table + "_list_"+ index;

						database.schema.createTable(_n_table_name, t => {
							t.increments('id').primary();
							t.string("first_name", 100);
							t.string("last_name", 100);
							t.string("email", 100);
						}).then(function(res) {
				
							database.batchInsert(_n_table_name, table_data, 500).then(function(){
								_done += 1;

								if(_offset_array.length == _done)
								{
									event.returnValue = "done";
								}
							});

						});
					});
				});

			});
		}
	}

	if(data.query == "delete_row")
	{
		database(data.table_name).where('id', data.row_id).delete().then(function(res){
			event.returnValue = "done";
		});
	}

	if(data.query == "delete_rows")
	{
		database(data.table_name).whereIn('id', data.row_ids).delete().then(function(res){
			event.returnValue = "done";
		});
	}

	if(data.query == "edit_row")
	{
		database(data.table_name).where('id', data.row_id).update({
			'first_name': data.first_name,
			'last_name': data.last_name,
			'email': data.email,
		}).then(function(res){
			event.returnValue = "done";
		});
	}

	if(data.query == "insert_new_row")
	{
		database(data.table_name).insert({
			first_name: data.first_name,
			last_name: data.last_name,
			email: data.email
		}).then(function(res){
			event.returnValue = "done";
		});
	}
});

// The code above has been adapted from a starter example in the Electron docs:
// https://www.electronjs.org/docs/tutorial/quick-start#create-the-main-script-file
