export class MaxToolIterationsError extends Error {
    public constructor() {
        super('Maximum iterations reached while processing tool loop');
        this.name = 'MaxToolIterationsError';
    }
}
