import { describe, expect, it } from "vitest";
import { barHeights, smooth } from "../js/spectrum.js";

describe("barHeights", () => {
	it("returns one height per bar", () => {
		const frequencies = new Uint8Array(128);
		expect(barHeights(frequencies, 32, 70)).toHaveLength(32);
	});

	it("is flat when there is silence", () => {
		const frequencies = new Uint8Array(64);
		expect(barHeights(frequencies, 4, 100)).toEqual([0, 0, 0, 0]);
	});

	it("reaches the maximum height at full volume", () => {
		const frequencies = new Uint8Array(64).fill(255);
		expect(barHeights(frequencies, 4, 100)).toEqual([100, 100, 100, 100]);
	});

	it("averages the frequencies of each group", () => {
		const frequencies = [255, 255, 0, 0, 51, 51, 0, 0];
		expect(barHeights(frequencies, 4, 100, 1)).toEqual([100, 0, 20, 0]);
	});

	it("ignores the highest frequencies", () => {
		const frequencies = [0, 0, 0, 0, 0, 0, 0, 255, 255, 255];
		expect(barHeights(frequencies, 7, 100)).toEqual([0, 0, 0, 0, 0, 0, 0]);
	});
});

describe("smooth", () => {
	it("rises immediately", () => {
		expect(smooth([10, 10], [50, 80])).toEqual([50, 80]);
	});

	it("falls gradually", () => {
		expect(smooth([100], [0], 0.6)).toEqual([60]);
	});

	it("works without previous values", () => {
		expect(smooth([], [30, 0])).toEqual([30, 0]);
	});
});
