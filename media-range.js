function parseRange(header, size) {
	const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? "");
	if (!match || (match[1] === "" && match[2] === "")) return null;
	if (match[1] === "") {
		const suffix = Number(match[2]);
		return { start: Math.max(0, size - suffix), end: size - 1 };
	}
	const start = Number(match[1]);
	const end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
	return start <= end ? { start, end } : null;
}

module.exports = { parseRange };
