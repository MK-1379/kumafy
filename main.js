const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 400,
		height: 720,
		resizable: false,
		frame: false, // custom title bar, see index.html
		icon: path.join(__dirname, "img/icon.png"),
		webPreferences: {
			contextIsolation: true, // required to use the preload script safely
			preload: path.join(__dirname, "preload.js")
		}
	});

	win.loadFile("index.html");
	win.removeMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Window control buttons
ipcMain.on("minimize", () => win?.minimize());
ipcMain.on("close", () => win?.close());