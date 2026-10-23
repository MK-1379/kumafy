const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),
	openAudioFiles: () => ipcRenderer.invoke("open-audio-files"),
});
