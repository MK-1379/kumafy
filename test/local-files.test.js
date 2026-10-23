import { describe, expect, it } from "vitest";
import { parseFileName, toLocalTracks } from "../js/local-files.js";

describe("parseFileName", () => {
	it("removes the extension", () => {
		expect(parseFileName("Fading Colors.mp3").title).toBe("Fading Colors");
	});

	it("only removes the last extension", () => {
		expect(parseFileName("live.at.home.flac").title).toBe("live.at.home");
	});

	it("turns underscores into spaces", () => {
		expect(parseFileName("my__new_song.wav").title).toBe("my new song");
	});

	it("keeps the original name if nothing is left", () => {
		expect(parseFileName(".mp3").title).toBe(".mp3");
	});

	it("splits artist and title separated by a dash", () => {
		expect(parseFileName("LISA - NEW WOMAN feat. Rosalia.mp3")).toEqual({
			title: "NEW WOMAN feat. Rosalia",
			artist: "LISA",
		});
	});

	it("only splits on the first dash", () => {
		expect(parseFileName("Daft Punk - One More Time - Live.mp3")).toEqual({
			title: "One More Time - Live",
			artist: "Daft Punk",
		});
	});

	it("uses a generic artist when there is no dash", () => {
		expect(parseFileName("Lo-fi beat.mp3")).toEqual({
			title: "Lo-fi beat",
			artist: "Local file",
		});
	});
});

describe("toLocalTracks", () => {
	it("builds tracks from the picked files", () => {
		const files = [{ url: "blob:abc", fileName: "intro_theme.mp3" }];
		expect(toLocalTracks(files)).toEqual([
			{ src: "blob:abc", title: "intro theme", artist: "Local file" },
		]);
	});

	it("returns an empty list when nothing was picked", () => {
		expect(toLocalTracks([])).toEqual([]);
	});
});
