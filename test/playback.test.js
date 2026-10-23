import { describe, expect, it } from "vitest";
import {
	createOrder,
	formatTime,
	nextRepeatMode,
	positionAfterEnd,
	progressPercent,
	stepVolume,
	wrapIndex,
} from "../js/playback.js";

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

describe("createOrder", () => {
	it("keeps the original order when shuffle is off", () => {
		expect(createOrder(4, false, 2)).toEqual([0, 1, 2, 3]);
	});

	it("starts with the chosen track when shuffle is on", () => {
		const order = createOrder(5, true, 3);
		expect(order[0]).toBe(3);
	});

	it("contains every track exactly once", () => {
		const order = createOrder(9, true, 4);
		expect([...order].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	});

	it("uses the random function it receives", () => {
		expect(createOrder(4, true, 0, () => 0)).toEqual([0, 2, 3, 1]);
	});

	it("handles lists with one or zero tracks", () => {
		expect(createOrder(1, true, 0)).toEqual([0]);
		expect(createOrder(0, true, 0)).toEqual([]);
	});
});

describe("nextRepeatMode", () => {
	it("cycles off, all, one and back to off", () => {
		expect(nextRepeatMode("off")).toBe("all");
		expect(nextRepeatMode("all")).toBe("one");
		expect(nextRepeatMode("one")).toBe("off");
	});
});

describe("positionAfterEnd", () => {
	it("goes to the next track and keeps playing", () => {
		expect(positionAfterEnd(0, 3, "off")).toEqual({
			position: 1,
			autoplay: true,
		});
	});

	it("repeats the same track in repeat one", () => {
		expect(positionAfterEnd(2, 3, "one")).toEqual({
			position: 2,
			autoplay: true,
		});
	});

	it("goes back to the start and keeps playing in repeat all", () => {
		expect(positionAfterEnd(2, 3, "all")).toEqual({
			position: 0,
			autoplay: true,
		});
	});

	it("goes back to the start and stops when repeat is off", () => {
		expect(positionAfterEnd(2, 3, "off")).toEqual({
			position: 0,
			autoplay: false,
		});
	});
});

describe("stepVolume", () => {
	it("raises and lowers the volume", () => {
		expect(stepVolume(0.5, 0.05)).toBe(0.55);
		expect(stepVolume(0.5, -0.05)).toBe(0.45);
	});

	it("avoids floating point leftovers", () => {
		expect(stepVolume(0.1, 0.2)).toBe(0.3);
	});

	it("stays between 0 and 1", () => {
		expect(stepVolume(0.98, 0.05)).toBe(1);
		expect(stepVolume(0.02, -0.05)).toBe(0);
	});
});
