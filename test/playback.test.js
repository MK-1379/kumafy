import { describe, expect, it } from "vitest";
import { formatTime, progressPercent, wrapIndex } from "../js/playback.js";

describe("formatTime", () => {
	it("formats seconds as m:ss", () => {
		expect(formatTime(0)).toBe("0:00");
		expect(formatTime(7)).toBe("0:07");
		expect(formatTime(65)).toBe("1:05");
		expect(formatTime(600)).toBe("10:00");
	});

	it("drops the decimals", () => {
		expect(formatTime(59.9)).toBe("0:59");
	});

	it("returns 0:00 for invalid values", () => {
		expect(formatTime(Number.NaN)).toBe("0:00");
		expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
		expect(formatTime(-3)).toBe("0:00");
	});
});

describe("wrapIndex", () => {
	it("moves forward and backward", () => {
		expect(wrapIndex(0, 1, 3)).toBe(1);
		expect(wrapIndex(2, -1, 3)).toBe(1);
	});

	it("wraps around at both ends", () => {
		expect(wrapIndex(2, 1, 3)).toBe(0);
		expect(wrapIndex(0, -1, 3)).toBe(2);
	});

	it("handles steps bigger than the list", () => {
		expect(wrapIndex(0, 7, 3)).toBe(1);
		expect(wrapIndex(0, -7, 3)).toBe(2);
	});

	it("returns 0 for an empty list", () => {
		expect(wrapIndex(0, 1, 0)).toBe(0);
	});
});

describe("progressPercent", () => {
	it("calculates the percentage played", () => {
		expect(progressPercent(30, 120)).toBe(25);
		expect(progressPercent(120, 120)).toBe(100);
	});

	it("returns 0 while the duration is unknown", () => {
		expect(progressPercent(10, Number.NaN)).toBe(0);
		expect(progressPercent(10, 0)).toBe(0);
	});

	it("stays between 0 and 100", () => {
		expect(progressPercent(150, 120)).toBe(100);
		expect(progressPercent(-5, 120)).toBe(0);
	});
});
