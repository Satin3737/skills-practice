export class CustomError extends Error {
    public status: number = 500;
}

export class BodyTooBigError extends CustomError {
    public constructor(message?: string) {
        super(message ?? 'Request body is too big');
        this.name = 'BodyTooBigError';
        this.status = 413;
    }
}

export class UnhandledError extends CustomError {
    public constructor(message?: string) {
        super(message ?? 'An unhandled error occurred');
        this.name = 'UnhandledError';
        this.status = 500;
    }
}

export class DataBrokenError extends CustomError {
    public constructor(message?: string) {
        super(message ?? 'Data is broken');
        this.name = 'DataBrokenError';
        this.status = 500;
    }
}
