export async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T | undefined> {
	for (let i = 0; i < retries; i++) {
			try {
					return await fn();
			} catch (error) {
					if (i === retries - 1) throw error;
					await new Promise(res => setTimeout(res, delay));
			}
	}
	return undefined;
}