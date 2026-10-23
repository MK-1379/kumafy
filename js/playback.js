export function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const min = Math.floor(seconds / 60);
	const sec = Math.floor(seconds % 60)
		.toString()
		.padStart(2, "0");
	return `${min}:${sec}`;
}

export function wrapIndex(index, step, total) {
	if (total <= 0) return 0;
	return (((index + step) % total) + total) % total;
}

export function progressPercent(currentTime, duration) {
	if (!Number.isFinite(duration) || duration <= 0) return 0;
	const percent = (currentTime / duration) * 100;
	return Math.min(100, Math.max(0, percent));
}

export function createOrder(
	total,
	shuffle,
	firstIndex = 0,
	random = Math.random,
) {
	const order = Array.from({ length: total }, (_, i) => i);
	if (!shuffle || total <= 1) return order;

	const rest = order.filter((i) => i !== firstIndex);
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[rest[i], rest[j]] = [rest[j], rest[i]];
	}
	return [firstIndex, ...rest];
}

export const REPEAT_MODES = ["off", "all", "one"];

export function nextRepeatMode(mode) {
	const current = REPEAT_MODES.indexOf(mode);
	return REPEAT_MODES[(current + 1) % REPEAT_MODES.length];
}

export function positionAfterEnd(position, total, repeat) {
	if (repeat === "one") return { position, autoplay: true };
	if (position < total - 1) return { position: position + 1, autoplay: true };
	return { position: 0, autoplay: repeat === "all" };
}

export function stepVolume(volume, delta) {
	const next = Math.round((volume + delta) * 100) / 100;
	return Math.min(1, Math.max(0, next));
}
