const KEY_ACTIONS = {
	" ": "togglePlay",
	k: "togglePlay",
	ArrowRight: "seekForward",
	ArrowLeft: "seekBackward",
	ArrowUp: "volumeUp",
	ArrowDown: "volumeDown",
	n: "next",
	p: "previous",
	m: "mute",
	s: "shuffle",
	r: "repeat",
	l: "trackList",
	Escape: "closeTrackList",
};

const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

export function actionForKey({ key, ctrlKey, metaKey, altKey }) {
	if (ctrlKey || metaKey || altKey) return null;
	const normalized = key.length === 1 ? key.toLowerCase() : key;
	return KEY_ACTIONS[normalized] ?? null;
}

export function elementHandlesKey(element, key) {
	const tag = element?.tagName;
	if (tag === "SELECT") return ARROWS.includes(key) || key === " ";
	if (tag === "INPUT" && element.type === "range") return ARROWS.includes(key);
	if (tag === "BUTTON") return key === " " || key === "Enter";
	return false;
}
