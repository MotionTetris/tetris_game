export default class UnionFind {
    parent: number[];

    public constructor(count: number) {
        this.parent = [];
        for (let i = 0; i < count; i++) {
            this.parent[i] = i;
        }
    }

    public union(a: number, b: number): void {
        let rootA = this.find(a);
        let rootB = this.find(b);

        if (rootA === rootB) return;

        if (rootA < rootB) {
            if (this.parent[b] !== b) this.union(this.parent[b], a);
            this.parent[b] = this.parent[a];
        } else {
            if (this.parent[a] !== a) this.union(this.parent[a], b);
            this.parent[a] = this.parent[b];
        }
    }

    public find(a: number): number {
        while (this.parent[a] !== a) {
            a = this.parent[a];
        }
        return a;
    }

    public connected(a: number, b: number): boolean {
        return this.find(a) === this.find(b);
    }
}