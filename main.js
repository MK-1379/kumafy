const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 400,
		height: 720,
		resizable: false,
		frame: false,
		icon: path.join(__dirname, "img/icon.png"),
		webPreferences: {
			contextIsolation: true,
			sandbox: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
	win.webContents.on("will-navigate", (event) => event.preventDefault());

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

ipcMain.on("minimize", () => win?.minimize());
ipcMain.on("close", () => win?.close());
