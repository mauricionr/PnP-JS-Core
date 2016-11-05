"use strict";

import { HttpClientImpl } from "./httpclient";

/**
 * This module is substituted for the NodeFetchClient.ts during the packaging process. This helps to reduce the pnp.js file size by
 * not including all of the node dependencies
 */
export class NodeFetchClient implements HttpClientImpl {

    constructor(public siteUrl: string, private _clientId: string, private _clientSecret: string, private _realm = "") {}

    /**
     * Always throws an error that NodeFetchClient is not supported for use in the browser
     */
    public fetch(url: string, options: any): Promise<Response> {
        throw new Error("Using NodeFetchClient in the browser is not supported.");
    }
}
