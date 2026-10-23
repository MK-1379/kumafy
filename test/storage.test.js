import { describe, expect, it } from "vitest";
import {
	loadState,
	STORAGE_KEY,
	sanitizeState,
	saveState,
} from "../js/storage.js";

const GENRES = {
	piano: { tracks: [{}, {}, {}] },
	rock: { tracks: [{}, {}] },
};

const DEFAULTS = {
	genre: "piano",
	index: 0,
	volume: 1,
	muted: false,
	shuffle: false,
	repeat: "off",
};

function fakeStorage(initial = {}) {
	const data = { ...initial };
	return {
		getItem: (key) => data[key] ?? null,
		setItem: (key, value) => {
			data[key] = value;
		},
	};
}

describe("sanitizeState", () => {
	it("keeps a valid state", () => {
		const state = {
			genre: "rock",
			index: 1,
			volume: 0.4,
			muted: true,
			shuffle: true,
			repeat: "one",
		};
		expect(sanitizeState(state, GENRES)).toEqual(state);
	});

	it("uses the defaults when there is nothing saved", () => {
		expect(sanitizeState(null, GENRES)).toEqual(DEFAULTS);
	});

	it("replaces invalid values with the defaults", () => {
		const state = {
			genre: "jazz",
			index: 7,
			volume: 3,
			muted: "yes",
			repeat: "forever",
		};
		expect(sanitizeState(state, GENRES)).toEqual(DEFAULTS);
	});

	it("checks the index against the saved genre", () => {
		expect(sanitizeState({ genre: "rock", index: 2 }, GENRES).index).toBe(0);
	});
});

describe("loadState and saveState", () => {
	it("saves and loads the same state", () => {
		const storage = fakeStorage();
		const state = { ...DEFAULTS, genre: "rock", volume: 0.5 };
		saveState(storage, state);
		expect(loadState(storage, GENRES)).toEqual(state);
	});

	it("survives broken JSON", () => {
		const storage = fakeStorage({ [STORAGE_KEY]: "{not json" });
		expect(loadState(storage, GENRES)).toEqual(DEFAULTS);
	});
});
