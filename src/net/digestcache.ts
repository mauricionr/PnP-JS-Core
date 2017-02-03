import { Dictionary } from "../collections/collections";
import { HttpClient } from "./httpclient";
import { Util } from "../utils/util";
import { ODataDefaultParser } from "../sharepoint/odata";

export class CachedDigest {
    public expiration: Date;
    public value: string;
}

export class DigestCache {

    constructor(private _httpClient: HttpClient, private _digests: Dictionary<CachedDigest> = new Dictionary<CachedDigest>()) { }

    public getDigest(webUrl: string): Promise<string> {

        let cachedDigest: CachedDigest = this._digests.get(webUrl);
        if (cachedDigest !== null) {
            let now = new Date();
            if (now < cachedDigest.expiration) {
                return Promise.resolve(cachedDigest.value);
            }
        }

        let url = Util.combinePaths(webUrl, "/_api/contextinfo");

        return this._httpClient.fetchRaw(url, {
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-type": "application/json;odata=verbose;charset=utf-8",
            },
            method: "POST",
        }).then((response) => {
            let parser = new ODataDefaultParser();
            return parser.parse(response).then((d: any) => d.GetContextWebInformation);
        }).then((data: any) => {
            let newCachedDigest = new CachedDigest();
            newCachedDigest.value = data.FormDigestValue;
            let seconds = data.FormDigestTimeoutSeconds;
            let expiration = new Date();
            expiration.setTime(expiration.getTime() + 1000 * seconds);
            newCachedDigest.expiration = expiration;
            this._digests.add(webUrl, newCachedDigest);
            return newCachedDigest.value;
        });
    }

    public clear() {
        this._digests.clear();
    }
}

