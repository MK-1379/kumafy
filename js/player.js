import {
	createOrder,
	formatTime,
	nextRepeatMode,
	positionAfterEnd,
	progressPercent,
	stepVolume,
	wrapIndex,
} from "./playback.js";
import { actionForKey, elementHandlesKey } from "./shortcuts.js";
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

const SEEK_STEP = 5;
const VOLUME_STEP = 0.05;
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
	updateMediaMetadata(track, genre);
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

function setTrackListOpen(open) {
	trackPanel.hidden = !open;
	listBtn.setAttribute("aria-expanded", String(open));
}

function toggleTrackList() {
	setTrackListOpen(trackPanel.hidden);
}

function toggleMute() {
	state.muted = !state.muted;
	renderVolume();
	persist();
}

function setVolume(value) {
	state.volume = value;
	if (state.volume > 0) state.muted = false;
	renderVolume();
	persist();
}

function toggleShuffle() {
	state.shuffle = !state.shuffle;
	rebuildOrder();
	renderModes();
	persist();
}

function cycleRepeat() {
	state.repeat = nextRepeatMode(state.repeat);
	renderModes();
	persist();
}

function seekTo(seconds) {
	if (!Number.isFinite(audio.duration)) return;
	audio.currentTime = Math.min(audio.duration, Math.max(0, seconds));
}

function seekBy(seconds) {
	seekTo(audio.currentTime + seconds);
}

const shortcutActions = {
	togglePlay,
	seekForward: () => seekBy(SEEK_STEP),
	seekBackward: () => seekBy(-SEEK_STEP),
	volumeUp: () => setVolume(stepVolume(state.volume, VOLUME_STEP)),
	volumeDown: () => setVolume(stepVolume(state.volume, -VOLUME_STEP)),
	next: () => changeTrack(1),
	previous: () => changeTrack(-1),
	mute: toggleMute,
	shuffle: toggleShuffle,
	repeat: cycleRepeat,
	trackList: toggleTrackList,
	closeTrackList: () => setTrackListOpen(false),
};

function handleKeydown(event) {
	if (elementHandlesKey(event.target, event.key)) return;
	const action = actionForKey(event);
	if (!action) return;
	event.preventDefault();
	shortcutActions[action]();
}

const hasMediaSession = "mediaSession" in navigator;

function updateMediaMetadata(track, genre) {
	if (!hasMediaSession) return;
	navigator.mediaSession.metadata = new MediaMetadata({
		title: track.title,
		artist: track.artist,
		album: genre.label,
		artwork: [
			{
				src: new URL(genre.cover, location.href).href,
				sizes: "600x600",
				type: "image/jpeg",
			},
		],
	});
}

function updatePositionState() {
	if (!hasMediaSession || !Number.isFinite(audio.duration)) return;
	navigator.mediaSession.setPositionState({
		duration: audio.duration,
		playbackRate: audio.playbackRate,
		position: Math.min(audio.currentTime, audio.duration),
	});
}

function setupMediaSession() {
	if (!hasMediaSession) return;
	const handlers = {
		play,
		pause: () => audio.pause(),
		stop,
		previoustrack: () => changeTrack(-1),
		nexttrack: () => changeTrack(1),
		seekbackward: (details) => seekBy(-(details.seekOffset ?? SEEK_STEP)),
		seekforward: (details) => seekBy(details.seekOffset ?? SEEK_STEP),
		seekto: (details) => seekTo(details.seekTime),
	};
	for (const [action, handler] of Object.entries(handlers)) {
		try {
			navigator.mediaSession.setActionHandler(action, handler);
		} catch {
			console.warn(`Media Session action not supported: ${action}`);
		}
	}
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

muteBtn.addEventListener("click", toggleMute);
volume.addEventListener("input", () => setVolume(Number(volume.value)));
shuffleBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", cycleRepeat);
document.addEventListener("keydown", handleKeydown);

audio.addEventListener("loadedmetadata", () => {
	progress.max = audio.duration;
	durationEl.textContent = formatTime(audio.duration);
	updatePositionState();
});
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", handleEnded);
audio.addEventListener("play", renderPlayButton);
audio.addEventListener("pause", renderPlayButton);
audio.addEventListener("seeked", updatePositionState);
progress.addEventListener("input", () => {
	audio.currentTime = progress.value;
});

$("minBtn").addEventListener("click", () => window.api?.minimize());
$("closeBtn").addEventListener("click", () => window.api?.close());

genreSelect.value = state.genre;
setupMediaSession();
rebuildOrder();
renderTrackList();
renderVolume();
renderModes();
renderPlayButton();
loadTrack();
