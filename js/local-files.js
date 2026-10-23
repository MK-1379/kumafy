export const LOCAL_GENRE = "local";
export const AUDIO_ACCEPT = ".mp3,.wav,.ogg,.flac,.m4a,.aac";

export function parseFileName(fileName) {
	const withoutExtension = fileName.replace(/\.[^.]+$/, "");
	const clean = withoutExtension.replace(/[_]+/g, " ").trim();
	const separator = clean.indexOf(" - ");

	if (separator > 0) {
		const artist = clean.slice(0, separator).trim();
		const title = clean.slice(separator + 3).trim();
		if (artist && title) return { title, artist };
	}
	return { title: clean || fileName, artist: "Local file" };
}

export function toLocalTracks(files) {
	return files.map(({ url, fileName }) => ({
		src: url,
		...parseFileName(fileName),
	}));
}

function pickWithInput() {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = AUDIO_ACCEPT;
		input.multiple = true;
		input.addEventListener("change", () => {
			resolve(
				[...input.files].map((file) => ({
					url: URL.createObjectURL(file),
					fileName: file.name,
				})),
			);
		});
		input.addEventListener("cancel", () => resolve([]));
		input.click();
	});
}

export async function pickLocalFiles() {
	const files = window.api?.openAudioFiles
		? await window.api.openAudioFiles()
		: await pickWithInput();
	return toLocalTracks(files);
}
