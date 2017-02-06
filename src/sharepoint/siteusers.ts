import { Queryable, QueryableInstance, QueryableCollection } from "./queryable";
import { SiteGroups } from "./sitegroups";
import { Util } from "../utils/util";
import { TypedHash } from "../collections/collections";

/**
 * Properties that provide both a getter, and a setter.
 *
 */
export interface UserUpdateResult {
    user: SiteUser;
    data: any;
}

/**
 * Describes a collection of all site collection users
 *
 */
export class SiteUsers extends QueryableCollection {

    /**
     * Creates a new instance of the Users class
     *
     * @param baseUrl The url or Queryable which forms the parent of this user collection
     */
    constructor(baseUrl: string | Queryable, path = "siteusers") {
        super(baseUrl, path);
    }

    /**
     * Gets a user from the collection by email
     *
     * @param email The email of the user
     */
    public getByEmail(email: string): SiteUser {
        return new SiteUser(this, `getByEmail('${email}')`);
    }

    /**
     * Gets a user from the collection by id
     *
     * @param id The id of the user
     */
    public getById(id: number): SiteUser {
        return new SiteUser(this, `getById(${id})`);
    }

    /**
     * Gets a user from the collection by login name
     *
     * @param loginName The email address of the user
     */
    public getByLoginName(loginName: string): SiteUser {
        let su = new SiteUser(this);
        su.concat("(@v)");
        su.query.add("@v", encodeURIComponent(loginName));
        return su;
    }

    /**
     * Removes a user from the collection by id
     *
     * @param id The id of the user
     */
    public removeById(id: number | Queryable): Promise<any> {
        let o = new SiteUsers(this, `removeById(${id})`);
        return o.post();
    }

    /**
     * Removes a user from the collection by login name
     *
     * @param loginName The login name of the user
     */
    public removeByLoginName(loginName: string): Promise<any> {
        let o = new SiteUsers(this, `removeByLoginName(@v)`);
        o.query.add("@v", encodeURIComponent(loginName));
        return o.post();
    }

    /**
     * Add a user to a group
     * 
     * @param loginName The login name of the user to add to the group
     * 
     */
    public add(loginName: string): Promise<SiteUser> {

        let postBody = JSON.stringify({ "__metadata": { "type": "SP.User" }, LoginName: loginName });

        return this.post({ body: postBody }).then(() => this.getByLoginName(loginName));
    }
}


/**
 * Describes a single user
 *
 */
export class SiteUser extends QueryableInstance {
    /**
     * Creates a new instance of the User class
     *
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     * @param path Optional, passes the path to the user
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Get's the groups for this user.
     *
     */
    public get groups() {
        return new SiteGroups(this, "groups");
    }

    /**
    * Updates this user instance with the supplied properties
    *
    * @param properties A plain object of property names and values to update for the user
    */
    public update(properties: TypedHash<any>): Promise<UserUpdateResult> {

        let postBody = Util.extend({ "__metadata": { "type": "SP.User" } }, properties);

        return this.post({
            body: JSON.stringify(postBody),
            headers: {
                "X-HTTP-Method": "MERGE",
            },
        }).then((data) => {
            return {
                data: data,
                user: this,
            };
        });
    }

    /**
     * Delete this user
     *
     */
    public delete(): Promise<void> {
        return this.post({
            headers: {
                "X-HTTP-Method": "DELETE",
            },
        });
    }
}

/**
 * Represents the current user
 */
export class CurrentUser extends QueryableInstance {

    constructor(baseUrl: string | Queryable, path = "currentuser") {
        super(baseUrl, path);
    }
}
