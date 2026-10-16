export class CustomError extends Error {
    public status: number = 500;

    public constructor(message?: string, cause?: unknown) {
        super(message, cause !== undefined ? {cause} : undefined);
    }
}

export class BodyTooBigError extends CustomError {
    public constructor(message?: string, cause?: unknown) {
        super(message ?? 'Request body is too big', cause);
        this.name = 'BodyTooBigError';
        this.status = 413;
    }
}

export class UnhandledError extends CustomError {
    public constructor(message?: string, cause?: unknown) {
        super(message ?? 'An unhandled error occurred', cause);
        this.name = 'UnhandledError';
    }
}

export class DataBrokenError extends CustomError {
    public constructor(message?: string, cause?: unknown) {
        super(message ?? 'Data is broken', cause);
        this.name = 'DataBrokenError';
    }
}

export class FileOperationError extends CustomError {
    public constructor(message?: string, cause?: unknown) {
        super(message ?? 'File operation failed', cause);
        this.name = 'FileOperationError';
    }
}
