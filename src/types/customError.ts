interface BasicError {
    status: number;
    message: string;
}

export class CustomError extends Error implements BasicError {
    status: number
    message: string
    constructor(status: number, message: string) {
        super();
        this.message = message;
        this.status = status;
    }
}