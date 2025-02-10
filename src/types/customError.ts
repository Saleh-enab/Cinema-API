interface BasicError {
    status: number;
    message: string;
}

export class CustomError extends Error implements BasicError {
    type: string
    status: number
    message: string
    constructor(status: number, message: string, type: string) {
        super();
        this.message = message;
        this.status = status;
        this.type = type
    }
}