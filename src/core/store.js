/** In-memory key-value store for the catalog client: lives as long as the server process (or the Studio tab). */
export class MemoryStore {
	constructor(entries) {
		this.data = new Map(entries);
	}

	async get(key) {
		return this.data.has(key) ? this.data.get(key) : null;
	}

	async set(key, value) {
		this.data.set(key, value);
	}

	async delete(key) {
		return this.data.delete(key);
	}

	async list(prefix = "") {
		const out = [];
		for (const [key, value] of this.data) if (key.startsWith(prefix)) out.push({ key, value });
		return out;
	}
}
