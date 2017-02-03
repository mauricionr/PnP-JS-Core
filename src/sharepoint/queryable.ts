import { Util } from "../utils/util";
import { Dictionary } from "../collections/collections";
import { FetchOptions, HttpClient } from "../net/httpclient";
import { ODataParser, ODataDefaultParser, ODataBatch } from "./odata";
import { ICachingOptions, CachingParserWrapper, CachingOptions } from "./caching";
import { RuntimeConfig } from "../configuration/pnplibconfig";
import { AlreadyInBatchException } from "../utils/exceptions";
import { Logger, LogLevel } from "../utils/logging";

export interface QueryableConstructor<T> {
    new (baseUrl: string | Queryable, path?: string): T;
}

interface RequestContext {
    isBatched: boolean;
    requestAbsoluteUrl: string;
    requestId: string;
}

/**
 * Queryable Base Class
 *
 */
export class Queryable {

    /**
     * Tracks the query parts of the url
     */
    protected _query: Dictionary<string>;

    /**
     * Tracks the batch of which this query may be part
     */
    private _batch: ODataBatch;

    /**
     * Tracks the url as it is built
     */
    private _url: string;

    /**
     * Stores the parent url used to create this instance, for recursing back up the tree if needed
     */
    private _parentUrl: string;

    /**
     * Explicitly tracks if we are using caching for this request
     */
    private _useCaching: boolean;

    /**
     * Any options that were supplied when caching was enabled
     */
    private _cachingOptions: ICachingOptions;

    /**
     * Directly concatonates the supplied string to the current url, not normalizing "/" chars
     *
     * @param pathPart The string to concatonate to the url
     */
    public concat(pathPart: string) {
        this._url += pathPart;
    }

    /**
     * Appends the given string and normalizes "/" chars
     *
     * @param pathPart The string to append
     */
    protected append(pathPart: string) {
        this._url = Util.combinePaths(this._url, pathPart);
    }

    /**
     * Blocks a batch call from occuring, MUST be cleared by calling the returned function
     */
    protected addBatchDependency(): () => void {
        if (this.hasBatch) {
            return this._batch.addBatchDependency();
        }

        return () => null;
    }

    /**
     * Indicates if the current query has a batch associated
     *
     */
    protected get hasBatch(): boolean {
        return this._batch !== null;
    }

    /**
     * Gets the parent url used when creating this instance
     *
     */
    protected get parentUrl(): string {
        return this._parentUrl;
    }

    /**
     * Provides access to the query builder for this url
     *
     */
    public get query(): Dictionary<string> {
        return this._query;
    }

    /**
     * Creates a new instance of the Queryable class
     *
     * @constructor
     * @param baseUrl A string or Queryable that should form the base part of the url
     *
     */
    constructor(baseUrl: string | Queryable, path?: string) {

        this._query = new Dictionary<string>();
        this._batch = null;

        if (typeof baseUrl === "string") {
            // we need to do some extra parsing to get the parent url correct if we are
            // being created from just a string.

            let urlStr = baseUrl as string;
            if (Util.isUrlAbsolute(urlStr) || urlStr.lastIndexOf("/") < 0) {
                this._parentUrl = urlStr;
                this._url = Util.combinePaths(urlStr, path);
            } else if (urlStr.lastIndexOf("/") > urlStr.lastIndexOf("(")) {
                // .../items(19)/fields
                let index = urlStr.lastIndexOf("/");
                this._parentUrl = urlStr.slice(0, index);
                path = Util.combinePaths(urlStr.slice(index), path);
                this._url = Util.combinePaths(this._parentUrl, path);
            } else {
                // .../items(19)
                let index = urlStr.lastIndexOf("(");
                this._parentUrl = urlStr.slice(0, index);
                this._url = Util.combinePaths(urlStr, path);
            }
        } else {
            let q = baseUrl as Queryable;
            this._parentUrl = q._url;
            let target = q._query.get("@target");
            if (target !== null) {
                this._query.add("@target", target);
            }
            this._url = Util.combinePaths(this._parentUrl, path);
        }
    }

    /**
     * Adds this query to the supplied batch
     * 
     * @example 
     * ```
     * 
     * let b = pnp.sp.createBatch(); 
     * pnp.sp.web.inBatch(b).get().then(...);
     * b.execute().then(...)
     * ```
     */
    public inBatch(batch: ODataBatch): this {

        if (this._batch !== null) {
            throw new AlreadyInBatchException();
        }

        this._batch = batch;

        return this;
    }

    /**
     * Enables caching for this request
     * 
     * @param options Defines the options used when caching this request
     */
    public usingCaching(options?: ICachingOptions): this {
        if (!RuntimeConfig.globalCacheDisable) {
            this._useCaching = true;
            this._cachingOptions = options;
        }
        return this;
    }

    /**
     * Gets the currentl url, made absolute based on the availability of the _spPageContextInfo object
     *
     */
    public toUrl(): string {
        return this._url;
    }

    /**
     * Gets the full url with query information
     *
     */
    public toUrlAndQuery(): string {

        let url = this.toUrl();

        if (this._query.count() > 0) {
            url += `?${this._query.getKeys().map(key => `${key}=${this._query.get(key)}`).join("&")}`;
        }

        return url;
    }

    /**
     * Gets a parent for this instance as specified
     *
     * @param factory The contructor for the class to create
     */
    protected getParent<T extends Queryable>(
        factory: QueryableConstructor<T>,
        baseUrl: string | Queryable = this.parentUrl,
        path?: string): T {

        let parent = new factory(baseUrl, path);
        let target = this.query.get("@target");
        if (target !== null) {
            parent.query.add("@target", target);
        }
        return parent;
    }

    /**
     * Executes the currently built request
     *
     * @param parser Allows you to specify a parser to handle the result
     * @param getOptions The options used for this request
     */
    public get(parser: ODataParser<any> = new ODataDefaultParser(), getOptions: FetchOptions = {}): Promise<any> {
        return this.requestImpl("GET", getOptions, parser);
    }

    public getAs<T>(parser: ODataParser<T> = new ODataDefaultParser(), getOptions: FetchOptions = {}): Promise<T> {
        return this.requestImpl("GET", getOptions, parser);
    }

    protected post(postOptions: FetchOptions = {}, parser: ODataParser<any> = new ODataDefaultParser()): Promise<any> {
        return this.requestImpl("POST", postOptions, parser);
    }

    protected postAs<T>(postOptions: FetchOptions = {}, parser: ODataParser<T> = new ODataDefaultParser()): Promise<T> {
        return this.requestImpl("POST", postOptions, parser);
    }

    protected patch(patchOptions: FetchOptions = {}, parser: ODataParser<any> = new ODataDefaultParser()): Promise<any> {
        return this.requestImpl("PATCH", patchOptions, parser);
    }

    protected delete(deleteOptions: FetchOptions = {}, parser: ODataParser<any> = new ODataDefaultParser()): Promise<any> {
        return this.requestImpl("DELETE", deleteOptions, parser);
    }

    /**
     * Sends the actual request
     * 
     */
    private requestImpl<T>(verb: string, options: FetchOptions = {}, parser: ODataParser<T>): Promise<T> {

        let dependencyRemover = this.hasBatch ? this.addBatchDependency() : () => {};

        return new Promise<T>((resolve) => {

            this.preRequest().then((context: RequestContext) => {

                if (verb === "GET" && this._useCaching) {
                    let cacheOptions = new CachingOptions(context.requestAbsoluteUrl.toLowerCase());
                    if (typeof this._cachingOptions !== "undefined") {
                        cacheOptions = Util.extend(cacheOptions, this._cachingOptions);
                    }

                    // we may not have a valid store, i.e. on node
                    if (cacheOptions.store !== null) {
                        // check if we have the data in cache and if so return a resolved promise
                        let data = cacheOptions.store.get(cacheOptions.key);
                        if (data !== null) {
                            dependencyRemover();
                            return resolve(data);
                        }
                    }

                    // if we don't then wrap the supplied parser in the caching parser wrapper
                    // and send things on their way
                    parser = new CachingParserWrapper(parser, cacheOptions);
                }

                if (!this.hasBatch) {

                    // we are not part of a batch, so proceed as normal
                    let client = new HttpClient();

                    let opts = Util.extend(options, { method: verb });
                    client.fetch(context.requestAbsoluteUrl, opts).then(response => resolve(parser.parse(response)));

                } else {

                    let p = this._batch.add(context.requestAbsoluteUrl, verb, options, parser);
                    dependencyRemover();
                    resolve(p);
                }
            });
        });
    }

    // .then(result => this.postRequest(result));

    private preRequest(): Promise<RequestContext> {

        return Util.toAbsoluteUrl(this.toUrl()).then(url => {

            let requestContext = {
                isBatched: this.hasBatch,
                requestAbsoluteUrl: url,
                requestId: Util.getGUID(),
            };

            Logger.log({
                data: requestContext,
                level: LogLevel.Verbose,
                message: `Beginning request to ${requestContext.requestAbsoluteUrl}`,
            });

            return requestContext;
        });
    }

    // private postRequest<T>(result: T): Promise<T> {

    //     // do we want to do logging or something here???

    //     return Promise.resolve(result);
    // }
}

/**
 * Represents a REST collection which can be filtered, paged, and selected
 *
 */
export class QueryableCollection extends Queryable {

    /**
     * Filters the returned collection (https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#bk_supported)
     * 
     * @param filter The string representing the filter query
     */
    public filter(filter: string): this {
        this._query.add("$filter", filter);
        return this;
    }

    /**
     * Choose which fields to return
     * 
     * @param selects One or more fields to return
     */
    public select(...selects: string[]): this {
        this._query.add("$select", selects.join(","));
        return this;
    }

    /**
     * Expands fields such as lookups to get additional data
     * 
     * @param expands The Fields for which to expand the values
     */
    public expand(...expands: string[]): this {
        this._query.add("$expand", expands.join(","));
        return this;
    }

    /**
     * Orders based on the supplied fields ascending
     * 
     * @param orderby The name of the field to sort on
     * @param ascending If false DESC is appended, otherwise ASC (default)
     */
    public orderBy(orderBy: string, ascending = true): this {
        let keys = this._query.getKeys();
        let query: string[] = [];
        let asc = ascending ? " asc" : " desc";
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === "$orderby") {
                query.push(this._query.get("$orderby"));
                break;
            }
        }
        query.push(`${orderBy}${asc}`);

        this._query.add("$orderby", query.join(","));

        return this;
    }

    /**
     * Skips the specified number of items
     * 
     * @param skip The number of items to skip
     */
    public skip(skip: number): this {
        this._query.add("$skip", skip.toString());
        return this;
    }

    /**
     * Limits the query to only return the specified number of items
     * 
     * @param top The query row limit
     */
    public top(top: number): this {
        this._query.add("$top", top.toString());
        return this;
    }
}


/**
 * Represents an instance that can be selected
 *
 */
export class QueryableInstance extends Queryable {

    /**
     * Choose which fields to return
     * 
     * @param selects One or more fields to return
     */
    public select(...selects: string[]): this {
        this._query.add("$select", selects.join(","));
        return this;
    }

    /**
     * Expands fields such as lookups to get additional data
     * 
     * @param expands The Fields for which to expand the values
     */
    public expand(...expands: string[]): this {
        this._query.add("$expand", expands.join(","));
        return this;
    }
}
