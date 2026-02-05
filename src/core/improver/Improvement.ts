export interface ImprovementResult {
    score: number;
    issues: string[];
    improved: string;
    improvements: string[];
}

export class Improvement {
    private readonly score: number;
    private readonly issues: Array<string>;
    private readonly improved: string;
    private readonly improvements: Array<string>;

    constructor(score: number, issues: Array<string>, improved: string, improvements: Array<string>) {
        this.score = score;
        this.issues = issues;
        this.improved = improved;
        this.improvements = improvements;
    }

    static fromResult(result: ImprovementResult): Improvement {
        return new Improvement(
            result.score,
            result.issues,
            result.improved,
            result.improvements
        );
    }

    getScore(): number {
        return this.score;
    }

    getIssues(): string[] {
        return this.issues;
    }

    getImproved(): string {
        return this.improved;
    }

    getImprovements(): string[] {
        return this.improvements;
    }
}