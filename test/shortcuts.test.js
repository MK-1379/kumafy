import { describe, expect, it } from "vitest";
import { actionForKey, elementHandlesKey } from "../js/shortcuts.js";

const press = (key, modifiers = {}) => ({
	key,
	ctrlKey: false,
	metaKey: false,
	altKey: false,
	...modifiers,
});

describe("actionForKey", () => {
	it("maps the main shortcuts", () => {
		expect(actionForKey(press(" "))).toBe("togglePlay");
		expect(actionForKey(press("ArrowRight"))).toBe("seekForward");
		expect(actionForKey(press("ArrowDown"))).toBe("volumeDown");
		expect(actionForKey(press("n"))).toBe("next");
		expect(actionForKey(press("o"))).toBe("openFiles");
		expect(actionForKey(press("Escape"))).toBe("closeTrackList");
	});

	it("ignores letter case", () => {
		expect(actionForKey(press("M"))).toBe("mute");
	});

	it("ignores combinations with Ctrl, Alt or Cmd", () => {
		expect(actionForKey(press("r", { ctrlKey: true }))).toBeNull();
		expect(actionForKey(press("n", { altKey: true }))).toBeNull();
		expect(actionForKey(press("s", { metaKey: true }))).toBeNull();
	});

	it("returns null for keys without a shortcut", () => {
		expect(actionForKey(press("x"))).toBeNull();
		expect(actionForKey(press("Tab"))).toBeNull();
	});
});

describe("elementHandlesKey", () => {
	it("lets a select use the arrows and space", () => {
		const select = { tagName: "SELECT" };
		expect(elementHandlesKey(select, "ArrowDown")).toBe(true);
		expect(elementHandlesKey(select, " ")).toBe(true);
		expect(elementHandlesKey(select, "m")).toBe(false);
	});

	it("lets a range input use the arrows", () => {
		const range = { tagName: "INPUT", type: "range" };
		expect(elementHandlesKey(range, "ArrowLeft")).toBe(true);
		expect(elementHandlesKey(range, " ")).toBe(false);
	});

	it("lets a button use space and enter", () => {
		const button = { tagName: "BUTTON" };
		expect(elementHandlesKey(button, " ")).toBe(true);
		expect(elementHandlesKey(button, "Enter")).toBe(true);
		expect(elementHandlesKey(button, "ArrowRight")).toBe(false);
	});

	it("handles nothing on other elements", () => {
		expect(elementHandlesKey({ tagName: "BODY" }, " ")).toBe(false);
		expect(elementHandlesKey(null, " ")).toBe(false);
	});
});
