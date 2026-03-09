import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const LIGHT_AUDIO = path.resolve("dashboard/public/tracks/light/assets/ambient-light.mp3");
const DARK_AUDIO = path.resolve("dashboard/public/tracks/dark/assets/ambient-dark.mp3");

describe("ambient audio files", () => {
	it("light track ambient audio file exists", () => {
		assert.ok(fs.existsSync(LIGHT_AUDIO), "ambient-light.mp3 must exist");
	});

	it("dark track ambient audio file exists", () => {
		assert.ok(fs.existsSync(DARK_AUDIO), "ambient-dark.mp3 must exist");
	});

	it("light audio file is real audio (not a placeholder)", () => {
		const stats = fs.statSync(LIGHT_AUDIO);
		assert.ok(
			stats.size > 1024,
			`ambient-light.mp3 is ${stats.size} bytes — must be > 1KB (not a placeholder)`,
		);
	});

	it("dark audio file is real audio (not a placeholder)", () => {
		const stats = fs.statSync(DARK_AUDIO);
		assert.ok(
			stats.size > 1024,
			`ambient-dark.mp3 is ${stats.size} bytes — must be > 1KB (not a placeholder)`,
		);
	});
});
