import { describe, expect, it } from "vitest";
import { parseRange } from "../media-range.js";

describe("parseRange", () => {
	it("reads a range with start and end", () => {
		expect(parseRange("bytes=0-99", 1000)).toEqual({ start: 0, end: 99 });
	});

	it("reads an open range until the end of the file", () => {
		expect(parseRange("bytes=500-", 1000)).toEqual({ start: 500, end: 999 });
	});

	it("reads a suffix range with the last bytes", () => {
		expect(parseRange("bytes=-200", 1000)).toEqual({ start: 800, end: 999 });
	});

	it("limits the end to the size of the file", () => {
		expect(parseRange("bytes=900-5000", 1000)).toEqual({
			start: 900,
			end: 999,
		});
	});

	it("returns null without a valid header", () => {
		expect(parseRange(null, 1000)).toBeNull();
		expect(parseRange("bytes=-", 1000)).toBeNull();
		expect(parseRange("items=0-10", 1000)).toBeNull();
		expect(parseRange("bytes=700-100", 1000)).toBeNull();
	});
});
