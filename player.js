const $ = (id) => document.getElementById(id);

const audio = $("audio");
const progress = $("progress");
const currentEl = $("current");
const durationEl = $("duration");
const titleEl = $("title");
const artistEl = $("artist");
const coverEl = $("cover");
const genreSelect = $("genreSelect");

let currentGenre = Object.keys(GENRES)[0];
let index = 0;

function formatTime(time) {
	if (!Number.isFinite(time)) return "0:00";
	const min = Math.floor(time / 60);
	const sec = Math.floor(time % 60).toString().padStart(2, "0");
	return `${min}:${sec}`;
}

function loadTrack() {
	const genre = GENRES[currentGenre];
	const track = genre.tracks[index];
	audio.src = `audio/${track.file}`;
	titleEl.textContent = track.title;
	artistEl.textContent = track.artist;
	coverEl.src = genre.cover;
}

function play() {
	audio.play().catch((err) => console.warn("Playback failed:", err));
}

function pause() {
	audio.pause();
}

function stop() {
	audio.pause();
	audio.currentTime = 0;
}

function toggleMute() {
	audio.muted = !audio.muted;
}

function changeTrack(step) {
	const total = GENRES[currentGenre].tracks.length;
	index = (index + step + total) % total;
	loadTrack();
	play();
}

function updateProgress() {
	const duration = audio.duration;
	progress.value = audio.currentTime;
	currentEl.textContent = formatTime(audio.currentTime);
	const percent = Number.isFinite(duration) && duration > 0
		? (audio.currentTime / duration) * 100
		: 0;
	progress.style.background =
		`linear-gradient(to right, #ced7d7 ${percent}%, #444 ${percent}%)`;
}

for (const [key, genre] of Object.entries(GENRES)) {
	const option = document.createElement("option");
	option.value = key;
	option.textContent = genre.label;
	genreSelect.appendChild(option);
}

genreSelect.addEventListener("change", (e) => {
	const wasPlaying = !audio.paused;
	currentGenre = e.target.value;
	index = 0;
	loadTrack();
	if (wasPlaying) play();
});

$("playBtn").addEventListener("click", play);
$("pauseBtn").addEventListener("click", pause);
$("stopBtn").addEventListener("click", stop);
$("muteBtn").addEventListener("click", toggleMute);
$("nextBtn").addEventListener("click", () => changeTrack(1));
$("prevBtn").addEventListener("click", () => changeTrack(-1));

audio.addEventListener("loadedmetadata", () => {
	progress.max = audio.duration;
	durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", () => changeTrack(1));
progress.addEventListener("input", () => {
	audio.currentTime = progress.value;
});

$("minBtn").addEventListener("click", () => window.api?.minimize());
$("closeBtn").addEventListener("click", () => window.api?.close());

loadTrack();