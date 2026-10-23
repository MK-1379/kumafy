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
