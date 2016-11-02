"use strict";

import { Queryable, QueryableInstance, QueryableCollection } from "./queryable";
import {SiteUser, SiteUsers} from "./siteusers";
import { Util } from "../../utils/util";

/**
 * Properties that provide a getter, but no setter.
 *
 */
export interface GroupReadOnlyProperties {
    canCurrentUserEditMembership?: boolean;
    canCurrentUserManageGroup?: boolean;
    canCurrentUserViewMembership?: boolean;
    id?: number;
    isHiddenInUI?: boolean;
    loginName?: string;
    ownerTitle?: string;
    principalType?: PrincipalType;
    users?: SiteUsers;
}

/**
 * Properties that provide both a getter, and a setter.
 *
 */
export interface GroupWriteableProperties {
    allowMembersEditMembership?: boolean;
    allowRequestToJoinLeave?: boolean;
    autoAcceptRequestToJoinLeave?: boolean;
    description?: string;
    onlyAllowMembersViewMembership?: boolean;
    owner?: number | SiteUser | SiteGroup;
    requestToJoinLeaveEmailSetting?: string;
    title?: string;
}

/**
 * Group Properties
 *
 */
export interface GroupProperties extends GroupReadOnlyProperties, GroupWriteableProperties {
    __metadata: { id?: string, url?: string, type?: string };
}

/**
 * Principal Type enum
 *
 */
export enum PrincipalType {
    None = 0,
    User = 1,
    DistributionList = 2,
    SecurityGroup = 4,
    SharePointGroup = 8,
    All = 15
}

/**
 * Result from adding a group.
 *
 */
export interface GroupUpdateResult {
    group: SiteGroup;
    data: any;
}

/**
 * Results from updating a group
 *
 */
export interface GroupAddResult {
    group: SiteGroup;
    data: any;
}


/**
 * Describes a collection of site users
 *
 */
export class SiteGroups extends QueryableCollection {

    /**
     * Creates a new instance of the SiteUsers class
     *
     * @param baseUrl The url or Queryable which forms the parent of this user collection
     */
    constructor(baseUrl: string | Queryable, path = "sitegroups") {
        super(baseUrl, path);
    }

    /**
     * Adds a new group to the site collection
     *
     * @param props The properties to be updated
     */
    public add(properties: GroupWriteableProperties): Promise<GroupAddResult> {
        let postBody = JSON.stringify(Util.extend(
            { "__metadata": { "type": "SP.Group" } }, properties));

        return this.post({ body: postBody }).then((data) => {
            return {
                data: data,
                group: this.getById(data.Id),
            };
        });
    }

    /**
     * Gets a group from the collection by name
     *
     * @param email The name of the group
     */
    public getByName(groupName: string): SiteGroup {
        return new SiteGroup(this, `getByName('${groupName}')`);
    }

    /**
     * Gets a group from the collection by id
     *
     * @param id The id of the group
     */
    public getById(id: number) {
        let sg = new SiteGroup(this);
        sg.concat(`(${id})`);
        return sg;
    }

    /**
     * Removes the group with the specified member ID from the collection.
     *
     * @param id The id of the group to remove
     */
    public removeById(id: number): Promise<void> {
        let g = new SiteGroups(this, `removeById('${id}')`);
        return g.post();
    }

    /**
     * Removes a user from the collection by login name
     *
     * @param loginName The login name of the user
     */
    public removeByLoginName(loginName: string): Promise<any> {
        let g = new SiteGroups(this, `removeByLoginName('${loginName}')`);
        return g.post();
    }
}


/**
 * Describes a single group
 *
 */
export class SiteGroup extends QueryableInstance {
    /**
     * Creates a new instance of the Group class
     *
     * @param baseUrl The url or Queryable which forms the parent of this site group
     * @param path Optional, passes the path to the group
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Get's the users for this group
     *
     */
    public get users() {
        return new SiteUsers(this, "users");
    }

    /**
    * Updates this group instance with the supplied properties
    *
    * @param properties A GroupWriteableProperties object of property names and values to update for the user
    */
    /* tslint:disable no-string-literal */
    public update(properties: GroupWriteableProperties): Promise<GroupUpdateResult> {

        let postBody = Util.extend({ "__metadata": { "type": "SP.Group" } }, properties);

        return this.post({
            body: JSON.stringify(postBody),
            headers: {
                "X-HTTP-Method": "MERGE",
            },
        }).then((data) => {

            let retGroup: SiteGroup = this;

            if (properties.hasOwnProperty("Title")) {
                retGroup = this.getParent(SiteGroup, this.parentUrl, `getByName('${properties["Title"]}')`);
            }

            return {
                data: data,
                group: retGroup,
            };
        });
    }
    /* tslint:enable */
}

export interface SiteGroupAddResult {
    group: SiteGroup;
    data: GroupProperties;
}
