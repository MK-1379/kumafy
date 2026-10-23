const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");
const { parseRange } = require("./media-range.js");

const MEDIA_SCHEME = "kumafy-media";
const AUDIO_TYPES = {
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".ogg": "audio/ogg",
	".flac": "audio/flac",
	".m4a": "audio/mp4",
	".aac": "audio/aac",
};
const allowedFiles = new Map();
let nextFileId = 1;
let win;

protocol.registerSchemesAsPrivileged([
	{
		scheme: MEDIA_SCHEME,
		privileges: { stream: true, supportFetchAPI: true, corsEnabled: true },
	},
]);

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

async function serveAllowedFile(request) {
	const id = new URL(request.url).pathname.slice(1);
	const filePath = allowedFiles.get(id);
	if (!filePath) return new Response("Not found", { status: 404 });

	let size;
	try {
		({ size } = await fs.promises.stat(filePath));
	} catch {
		return new Response("Not found", { status: 404 });
	}
	const requested = parseRange(request.headers.get("Range"), size);
	const range = requested ?? { start: 0, end: size - 1 };
	const stream = fs.createReadStream(filePath, range);
	const headers = {
		"Content-Type": AUDIO_TYPES[path.extname(filePath).toLowerCase()],
		"Content-Length": String(range.end - range.start + 1),
		"Accept-Ranges": "bytes",
		"Access-Control-Allow-Origin": "*",
	};
	const partial = requested !== null;
	if (partial)
		headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;

	return new Response(Readable.toWeb(stream), {
		status: partial ? 206 : 200,
		headers,
	});
}

async function openAudioFiles() {
	const result = await dialog.showOpenDialog(win, {
		title: "Open audio files",
		properties: ["openFile", "multiSelections"],
		filters: [
			{
				name: "Audio",
				extensions: Object.keys(AUDIO_TYPES).map((ext) => ext.slice(1)),
			},
		],
	});
	if (result.canceled) return [];

	return result.filePaths.map((filePath) => {
		const id = String(nextFileId++);
		allowedFiles.set(id, filePath);
		return {
			url: `${MEDIA_SCHEME}://file/${id}`,
			fileName: path.basename(filePath),
		};
	});
}

app.whenReady().then(() => {
	protocol.handle(MEDIA_SCHEME, serveAllowedFile);
	createWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("minimize", () => win?.minimize());
ipcMain.on("close", () => win?.close());
ipcMain.handle("open-audio-files", openAudioFiles);
