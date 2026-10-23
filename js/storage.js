import { REPEAT_MODES } from "./playback.js";

export const STORAGE_KEY = "kumafy:state";

export function sanitizeState(raw, genres) {
	const data = raw && typeof raw === "object" ? raw : {};
	const genre = Object.hasOwn(genres, data.genre)
		? data.genre
		: Object.keys(genres)[0];
	const total = genres[genre].tracks.length;
	const validIndex =
		Number.isInteger(data.index) && data.index >= 0 && data.index < total;
	const validVolume =
		typeof data.volume === "number" && data.volume >= 0 && data.volume <= 1;

	return {
		genre,
		index: validIndex ? data.index : 0,
		volume: validVolume ? data.volume : 1,
		muted: data.muted === true,
		shuffle: data.shuffle === true,
		repeat: REPEAT_MODES.includes(data.repeat) ? data.repeat : "off",
	};
}

export function loadState(storage, genres) {
	try {
		return sanitizeState(JSON.parse(storage.getItem(STORAGE_KEY)), genres);
	} catch {
		return sanitizeState(null, genres);
	}
}

export function saveState(storage, state) {
	try {
		storage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.warn("Could not save state:", error);
	}
}
