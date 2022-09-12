const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

// const database = require("./../src/database");

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
	  devTools: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenuBarVisibility(false);
  // mainWindow.webContents.openDevTools();

  // Load from localhost if in development
  // Otherwise load index.html file
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open DevTools if in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

// Create a new browser window by invoking the createWindow
// function once the Electron application is initialized.
// Install REACT_DEVELOPER_TOOLS as well if isDev
app.whenReady().then(() => {
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
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

const database = require('knex')({
	client: 'better-sqlite3', // or 'better-sqlite3'
	connection: {
		filename: "./public/mydb.sqlite"
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
	

	// get specific table data
	if(data.query == "get_table_data")
	{
		database(data.table_name).select().then(function(res){
			event.returnValue = res;
		});	
	}
});

// The code above has been adapted from a starter example in the Electron docs:
// https://www.electronjs.org/docs/tutorial/quick-start#create-the-main-script-file
