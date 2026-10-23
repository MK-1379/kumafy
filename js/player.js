import { formatTime, progressPercent, wrapIndex } from "./playback.js";
import { GENRES } from "./tracks.js";

const $ = (id) => document.getElementById(id);

const audio = new Audio();
const progress = $("progress");
const currentEl = $("current");
const durationEl = $("duration");
const titleEl = $("title");
const artistEl = $("artist");
const coverEl = $("cover");
const genreSelect = $("genreSelect");

let currentGenre = Object.keys(GENRES)[0];
let index = 0;

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
	$("muteBtn").setAttribute("aria-pressed", String(audio.muted));
}

function changeTrack(step) {
	index = wrapIndex(index, step, GENRES[currentGenre].tracks.length);
	loadTrack();
	play();
}

function updateProgress() {
	const percent = progressPercent(audio.currentTime, audio.duration);
	progress.value = audio.currentTime;
	currentEl.textContent = formatTime(audio.currentTime);
	progress.style.background = `linear-gradient(to right, #ced7d7 ${percent}%, #444 ${percent}%)`;
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
