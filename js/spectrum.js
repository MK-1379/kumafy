export function barHeights(
	frequencies,
	barCount,
	maxHeight,
	usableRatio = 0.7,
) {
	const usable = Math.floor(frequencies.length * usableRatio);
	const binsPerBar = Math.max(1, Math.floor(usable / barCount));
	const heights = [];

	for (let bar = 0; bar < barCount; bar++) {
		const start = bar * binsPerBar;
		let sum = 0;
		for (let i = start; i < start + binsPerBar; i++) sum += frequencies[i] ?? 0;
		heights.push((sum / binsPerBar / 255) * maxHeight);
	}
	return heights;
}

export function smooth(previous, next, factor = 0.6) {
	return next.map((value, i) => {
		const old = previous[i] ?? 0;
		return value >= old ? value : old * factor + value * (1 - factor);
	});
}
