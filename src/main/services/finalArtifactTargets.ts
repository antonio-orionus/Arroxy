export class FinalArtifactTargets {
	private readonly itemIdsByJobId = new Map<string, string>()

	constructor(private readonly limit = 500) {}

	remember(jobId: string, itemId: string): void {
		if (this.itemIdsByJobId.has(jobId)) return
		this.itemIdsByJobId.set(jobId, itemId)
		const oldest = this.itemIdsByJobId.keys().next().value
		if (this.itemIdsByJobId.size > this.limit && oldest) this.itemIdsByJobId.delete(oldest)
	}

	get(jobId: string): string | undefined {
		return this.itemIdsByJobId.get(jobId)
	}
}
