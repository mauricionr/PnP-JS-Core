import { Logger, LogLevel, LogEntry } from "../utils/logging";

/**
 * Base class for creating exceptions
 * 
 */
export abstract class Exception extends Error {
    /**
     * @param name The Name given to the Error instance
     * @param message The message contained by the Error instance
     * 
     */
    constructor(name: string, message: string) {
        super(message);
        this.name = name;
    }

    protected getLogEntry(): Promise<LogEntry> {
        return Promise.resolve(<LogEntry>{ data: {}, level: LogLevel.Error, message: this.message });
    }

    protected Log(): Promise<void> {
        return this.getLogEntry().then(e => Logger.log(e));
    }
}

/**
 * Represents an exception with an HttpClient request
 * 
 */
export class ProcessHttpClientResponseException extends Exception {

    constructor(private response: Response) {
        super("ProcessHttpClientResponseException", `Error making HttpClient request in queryable: [${response.status}] ${response.statusText}`);
        this.Log();
    }

    protected getLogEntry(): Promise<LogEntry> {
        return Promise.resolve(<LogEntry>{ data: this.response, level: LogLevel.Error, message: this.message });
    }
}

export class NoCacheAvailableException extends Exception {

    constructor(msg = "Cannot create a caching configuration provider since cache is not available.") {
        super("NoCacheAvailableException", msg);
        this.Log();
    }
}

export class APIUrlException extends Exception {

    constructor(msg = "Unable to determine API url.") {
        super("APIUrlException", msg);
        this.Log();
    }
}

export class AuthUrlException extends Exception {

    constructor(protected data: any, msg = "Auth URL Endpoint could not be determined from data. Data logged.") {
        super("APIUrlException", msg);
        this.Log();
    }

    protected getLogEntry(): Promise<LogEntry> {
        // if any loggers are listening give them the full details
        return Promise.resolve(<LogEntry>{ data: this.data, level: LogLevel.Error, message: this.message });
    }
}

export class NodeFetchClientUnsupportedException extends Exception {

    constructor(msg = "Using NodeFetchClient in the browser is not supported.") {
        super("NodeFetchClientUnsupportedException", msg);
        this.Log();
    }
}

export class SPRequestExecutorUndefinedException extends Exception {

    constructor() {
        let msg = [
            "SP.RequestExecutor is undefined. ",
            "Load the SP.RequestExecutor.js library (/_layouts/15/SP.RequestExecutor.js) before loading the PnP JS Core library.",
        ].join(" ");
        super("SPRequestExecutorUndefinedException", msg);
        this.Log();
    }
}

export class MaxCommentLengthException extends Exception {

    constructor(msg = "The maximum comment length is 1023 characters.") {
        super("MaxCommentLengthException", msg);
        this.Log();
    }
}

export class NotSupportedInBatchException extends Exception {

    constructor(operation = "This operation") {
        super("NotSupportedInBatchException", `${operation} is not supported as part of a batch.`);
        this.Log();
    }
}

export class ODataIdException extends Exception {

    constructor(protected data: any, msg = "Could not extract odata id in object, you may be using nometadata. Object data logged to logger.") {
        super("ODataIdException", msg);
        this.Log();
    }

    protected getLogEntry(): Promise<LogEntry> {
        // if any loggers are listening give them the full details
        return Promise.resolve(<LogEntry>{ data: this.data, level: LogLevel.Error, message: this.message });
    }
}

export class BatchParseException extends Exception {

    constructor(msg: string) {
        super("BatchParseException", msg);
        this.Log();
    }
}

export class AlreadyInBatchException extends Exception {

    constructor(msg = "This query is already part of a batch.") {
        super("AlreadyInBatchException", msg);
        this.Log();
    }
}

export class FunctionExpectedException extends Exception {

    constructor(msg = "This query is already part of a batch.") {
        super("FunctionExpectedException", msg);
        this.Log();
    }
}

export class UrlException extends Exception {

    constructor(msg: string) {
        super("UrlException", msg);
        this.Log();
    }
}
