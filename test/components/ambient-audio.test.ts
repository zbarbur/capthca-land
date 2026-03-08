import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("AmbientAudio component", () => {
	const componentSrc = fs.readFileSync("dashboard/app/components/AmbientAudio.tsx", "utf-8");

	it("component file exists and exports AmbientAudio", () => {
		assert.ok(
			componentSrc.includes("export function AmbientAudio"),
			"Should export AmbientAudio function",
		);
	});

	it("renders a toggle button", () => {
		assert.ok(componentSrc.includes("<button"), "Should render a button element");
		assert.ok(
			componentSrc.includes('type="button"'),
			'Should have type="button" to prevent form submission',
		);
	});

	it("has aria-label for accessibility", () => {
		assert.ok(componentSrc.includes("aria-label"), "Should include aria-label for screen readers");
		assert.ok(componentSrc.includes("Unmute ambient audio"), "Should have unmute label");
		assert.ok(componentSrc.includes("Mute ambient audio"), "Should have mute label");
	});

	it("uses localStorage for mute persistence", () => {
		assert.ok(
			componentSrc.includes("capthca-audio-muted"),
			"Should use capthca-audio-muted localStorage key",
		);
		assert.ok(componentSrc.includes("localStorage.getItem"), "Should read from localStorage");
		assert.ok(componentSrc.includes("localStorage.setItem"), "Should write to localStorage");
	});

	it("does not autoplay — requires user interaction", () => {
		assert.ok(
			componentSrc.includes("hasInteracted"),
			"Should track user interaction before playing",
		);
		assert.ok(componentSrc.includes("onClick"), "Should respond to click events");
	});

	it("uses HTMLAudioElement with loop", () => {
		assert.ok(componentSrc.includes("new Audio()"), "Should create HTMLAudioElement");
		assert.ok(componentSrc.includes("audio.loop = true"), "Should set loop to true");
	});

	it("references correct audio file paths per track", () => {
		assert.ok(
			componentSrc.includes("/tracks/dark/assets/ambient-dark.mp3"),
			"Should reference dark track audio",
		);
		assert.ok(
			componentSrc.includes("/tracks/light/assets/ambient-light.mp3"),
			"Should reference light track audio",
		);
	});

	it("accepts theme prop for dark and light", () => {
		assert.ok(
			componentSrc.includes('"light" | "dark"'),
			"Should accept light and dark theme values",
		);
	});

	it("has track-specific styling classes", () => {
		assert.ok(componentSrc.includes("ambient-audio-dark"), "Should apply dark track CSS class");
		assert.ok(componentSrc.includes("ambient-audio-light"), "Should apply light track CSS class");
	});
});

describe("AmbientAudio integration", () => {
	it("TrackLayout imports and renders AmbientAudio", () => {
		const layout = fs.readFileSync("dashboard/app/components/TrackLayout.tsx", "utf-8");
		assert.ok(layout.includes("AmbientAudio"), "TrackLayout should import AmbientAudio");
		assert.ok(layout.includes("<AmbientAudio"), "TrackLayout should render AmbientAudio component");
	});

	it("TrackLayout passes theme prop to AmbientAudio", () => {
		const layout = fs.readFileSync("dashboard/app/components/TrackLayout.tsx", "utf-8");
		assert.ok(layout.includes("theme={theme}"), "Should pass theme prop to AmbientAudio");
	});

	it("audio toggle CSS exists in globals.css", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		assert.ok(css.includes(".ambient-audio-toggle"), "Should have toggle base CSS");
		assert.ok(css.includes(".ambient-audio-dark"), "Should have dark track toggle CSS");
		assert.ok(css.includes(".ambient-audio-light"), "Should have light track toggle CSS");
	});

	it("placeholder audio files exist", () => {
		assert.ok(
			fs.existsSync("dashboard/public/tracks/dark/assets/ambient-dark.mp3"),
			"Dark ambient audio file should exist",
		);
		assert.ok(
			fs.existsSync("dashboard/public/tracks/light/assets/ambient-light.mp3"),
			"Light ambient audio file should exist",
		);
	});
});
