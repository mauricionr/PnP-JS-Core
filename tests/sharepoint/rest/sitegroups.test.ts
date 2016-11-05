"use strict";

import { expect } from "chai";
import { SiteGroup, SiteGroups } from "../../../src/sharepoint/rest/siteGroups";
import { toMatchEndRegex } from "../../testutils";

describe("SiteGroups", () => {
    it("Should be an object", () => {
        let siteGroups = new SiteGroups("_api/web");
        expect(siteGroups).to.be.a("object");
    });

    describe("url", () => {
        it("Should return _api/web/sitegroups", () => {
            let siteGroups = new SiteGroups("_api/web");
            expect(siteGroups.toUrl()).to.match(toMatchEndRegex("_api/web/sitegroups"));
        });
    });

    describe("getById", () => {
        it("Should return _api/web/sitegroups(12)", () => {
            let group = new SiteGroups("_api/web").getById(12);
            expect(group.toUrl()).to.match(toMatchEndRegex("_api/web/sitegroups(12)"));
        });
    });

    describe("getByName", () => {
        it("Should return _api/web/sitegroups/getByName('Group Name')", () => {
            let group = new SiteGroups("_api/web").getByName("Group Name");
            expect(group.toUrl()).to.match(toMatchEndRegex("_api/web/sitegroups/getByName('Group Name')"));
        });
    });
});

describe("SiteGroup", () => {

    let group: SiteGroup;

    beforeEach(() => {
        group = new SiteGroups("_api/web").getById(1);
    });

    it("Should be an object", () => {
        expect(group).to.be.a("object");
    });

    describe("url", () => {
        it("Should return _api/web/sitegroups(1)", () => {
            expect(group.toUrl()).to.match(toMatchEndRegex("_api/web/sitegroups(1)"));
        });
    });

    describe("users", () => {
        it("Should return _api/web/sitegroups", () => {
            expect(group.users.toUrl()).to.match(toMatchEndRegex("_api/web/sitegroups(1)/users"));
        });
    });
});
