import { barHeights, smooth } from "./spectrum.js";

const BAR_COUNT = 32;
const BAR_GAP = 3;

export function createVisualizer(audio, canvas) {
	const context2d = canvas.getContext("2d");
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let audioContext = null;
	let analyser = null;
	let frequencies = null;
	let heights = [];
	let frameId = null;

	function connect() {
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = 0.75;
		audioContext.createMediaElementSource(audio).connect(analyser);
		analyser.connect(audioContext.destination);
		frequencies = new Uint8Array(analyser.frequencyBinCount);
	}

	function resize() {
		const ratio = window.devicePixelRatio || 1;
		canvas.width = canvas.clientWidth * ratio;
		canvas.height = canvas.clientHeight * ratio;
		context2d.setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	function draw() {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

		context2d.clearRect(0, 0, width, height);
		context2d.fillStyle = "rgba(206, 215, 215, 0.7)";
		heights.forEach((barHeight, i) => {
			const x = i * (barWidth + BAR_GAP);
			context2d.beginPath();
			context2d.roundRect(
				x,
				height - barHeight,
				barWidth,
				barHeight,
				[2, 2, 0, 0],
			);
			context2d.fill();
		});
	}

	function tick() {
		analyser.getByteFrequencyData(frequencies);
		heights = smooth(
			heights,
			barHeights(frequencies, BAR_COUNT, canvas.clientHeight),
		);
		draw();
		frameId = requestAnimationFrame(tick);
	}

	function fadeOut() {
		heights = heights.map((value) => value * 0.85);
		draw();
		if (heights.some((value) => value > 0.5)) {
			frameId = requestAnimationFrame(fadeOut);
		} else {
			heights = [];
			draw();
		}
	}

	function start() {
		if (!audioContext) connect();
		audioContext.resume();
		if (reducedMotion.matches) return;
		cancelAnimationFrame(frameId);
		resize();
		tick();
	}

	function stop() {
		cancelAnimationFrame(frameId);
		fadeOut();
	}

	return { start, stop };
}
