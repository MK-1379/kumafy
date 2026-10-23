import {
	createOrder,
	formatTime,
	nextRepeatMode,
	positionAfterEnd,
	progressPercent,
	wrapIndex,
} from "./playback.js";
import { loadState, saveState } from "./storage.js";
import { GENRES } from "./tracks.js";

const $ = (id) => document.getElementById(id);

const audio = new Audio();
const progress = $("progress");
const volume = $("volume");
const currentEl = $("current");
const durationEl = $("duration");
const titleEl = $("title");
const artistEl = $("artist");
const coverEl = $("cover");
const genreSelect = $("genreSelect");
const playBtn = $("playBtn");
const muteBtn = $("muteBtn");
const shuffleBtn = $("shuffleBtn");
const repeatBtn = $("repeatBtn");
const listBtn = $("listBtn");
const trackPanel = $("trackPanel");
const trackList = $("trackList");

const REPEAT_LABELS = {
	off: "Repeat: off",
	all: "Repeat: all",
	one: "Repeat: one",
};

const state = loadState(localStorage, GENRES);
let order = [];
let position = 0;

function currentTracks() {
	return GENRES[state.genre].tracks;
}

function persist() {
	saveState(localStorage, state);
}

function paintRange(input, percent) {
	input.style.background = `linear-gradient(to right, #ced7d7 ${percent}%, #444 ${percent}%)`;
}

function rebuildOrder() {
	order = createOrder(currentTracks().length, state.shuffle, state.index);
	position = order.indexOf(state.index);
}

function loadTrack() {
	const genre = GENRES[state.genre];
	const track = genre.tracks[state.index];
	audio.src = `audio/${track.file}`;
	titleEl.textContent = track.title;
	artistEl.textContent = track.artist;
	coverEl.src = genre.cover;
	highlightCurrentTrack();
	persist();
}

function goTo(newPosition) {
	position = newPosition;
	state.index = order[position];
	loadTrack();
}

function play() {
	audio.play().catch((err) => console.warn("Playback failed:", err));
}

function togglePlay() {
	if (audio.paused) play();
	else audio.pause();
}

function stop() {
	audio.pause();
	audio.currentTime = 0;
}

function changeTrack(step) {
	goTo(wrapIndex(position, step, order.length));
	play();
}

function handleEnded() {
	const next = positionAfterEnd(position, order.length, state.repeat);
	goTo(next.position);
	if (next.autoplay) play();
}

function selectTrack(index) {
	state.index = index;
	rebuildOrder();
	loadTrack();
	play();
}

function renderPlayButton() {
	const playing = !audio.paused;
	playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
	playBtn.querySelector("img").src = playing
		? "img/PauseAN.png"
		: "img/PlayAN.png";
}

function renderVolume() {
	audio.volume = state.volume;
	audio.muted = state.muted;
	volume.value = state.volume;
	paintRange(volume, state.muted ? 0 : state.volume * 100);
	muteBtn.setAttribute("aria-pressed", String(state.muted));
	muteBtn.querySelector("img").src = state.muted
		? "img/MuteAN.png"
		: "img/VolumeAN.svg";
}

function renderModes() {
	shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
	repeatBtn.setAttribute("aria-pressed", String(state.repeat !== "off"));
	repeatBtn.setAttribute("aria-label", REPEAT_LABELS[state.repeat]);
	repeatBtn.querySelector("img").src =
		state.repeat === "one" ? "img/RepeatOneAN.svg" : "img/RepeatAN.svg";
}

function renderTrackList() {
	trackList.replaceChildren();
	currentTracks().forEach((track, index) => {
		const item = document.createElement("li");
		const button = document.createElement("button");
		const title = document.createElement("span");
		const artist = document.createElement("span");
		button.type = "button";
		button.dataset.index = index;
		title.className = "track-title";
		title.textContent = track.title;
		artist.className = "track-artist";
		artist.textContent = track.artist;
		button.append(title, artist);
		button.addEventListener("click", () => selectTrack(index));
		item.append(button);
		trackList.append(item);
	});
}

function highlightCurrentTrack() {
	for (const button of trackList.querySelectorAll("button")) {
		if (Number(button.dataset.index) === state.index)
			button.setAttribute("aria-current", "true");
		else button.removeAttribute("aria-current");
	}
}

function toggleTrackList() {
	const open = trackPanel.hidden;
	trackPanel.hidden = !open;
	listBtn.setAttribute("aria-expanded", String(open));
}

function updateProgress() {
	progress.value = audio.currentTime;
	currentEl.textContent = formatTime(audio.currentTime);
	paintRange(progress, progressPercent(audio.currentTime, audio.duration));
}

for (const [key, genre] of Object.entries(GENRES)) {
	const option = document.createElement("option");
	option.value = key;
	option.textContent = genre.label;
	genreSelect.appendChild(option);
}

genreSelect.addEventListener("change", (e) => {
	const wasPlaying = !audio.paused;
	state.genre = e.target.value;
	state.index = 0;
	rebuildOrder();
	renderTrackList();
	loadTrack();
	if (wasPlaying) play();
});

playBtn.addEventListener("click", togglePlay);
$("stopBtn").addEventListener("click", stop);
$("nextBtn").addEventListener("click", () => changeTrack(1));
$("prevBtn").addEventListener("click", () => changeTrack(-1));
listBtn.addEventListener("click", toggleTrackList);

muteBtn.addEventListener("click", () => {
	state.muted = !state.muted;
	renderVolume();
	persist();
});

volume.addEventListener("input", () => {
	state.volume = Number(volume.value);
	if (state.volume > 0) state.muted = false;
	renderVolume();
	persist();
});

shuffleBtn.addEventListener("click", () => {
	state.shuffle = !state.shuffle;
	rebuildOrder();
	renderModes();
	persist();
});

repeatBtn.addEventListener("click", () => {
	state.repeat = nextRepeatMode(state.repeat);
	renderModes();
	persist();
});

audio.addEventListener("loadedmetadata", () => {
	progress.max = audio.duration;
	durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", handleEnded);
audio.addEventListener("play", renderPlayButton);
audio.addEventListener("pause", renderPlayButton);
progress.addEventListener("input", () => {
	audio.currentTime = progress.value;
});

$("minBtn").addEventListener("click", () => window.api?.minimize());
$("closeBtn").addEventListener("click", () => window.api?.close());

genreSelect.value = state.genre;
rebuildOrder();
renderTrackList();
renderVolume();
renderModes();
renderPlayButton();
loadTrack();
