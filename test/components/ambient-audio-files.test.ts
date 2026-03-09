import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const LIGHT_AUDIO = path.resolve(
	"dashboard/public/tracks/light/assets/ambient-light.mp3",
);
const DARK_AUDIO = path.resolve(
	"dashboard/public/tracks/dark/assets/ambient-dark.mp3",
);

describe("ambient audio files", () => {
	it("light track ambient audio file exists", () => {
		assert.ok(fs.existsSync(LIGHT_AUDIO), "ambient-light.mp3 must exist");
	});

	it("dark track ambient audio file exists", () => {
		assert.ok(fs.existsSync(DARK_AUDIO), "ambient-dark.mp3 must exist");
	});

	// TODO: Enable when real audio files are sourced (T7.6)
	// These tests verify files are actual audio (> 1KB), not placeholders
	it.todo("light audio file is not empty (> 1KB for real audio)");
	it.todo("dark audio file is not empty (> 1KB for real audio)");

	it("light audio file is under 500KB", () => {
		const stats = fs.statSync(LIGHT_AUDIO);
		assert.ok(
			stats.size <= 500 * 1024,
			`ambient-light.mp3 is ${Math.round(stats.size / 1024)}KB — must be ≤ 500KB`,
		);
	});

	it("dark audio file is under 500KB", () => {
		const stats = fs.statSync(DARK_AUDIO);
		assert.ok(
			stats.size <= 500 * 1024,
			`ambient-dark.mp3 is ${Math.round(stats.size / 1024)}KB — must be ≤ 500KB`,
		);
	});
});
