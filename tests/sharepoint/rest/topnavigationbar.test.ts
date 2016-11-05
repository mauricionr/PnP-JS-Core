"use strict";

import { expect } from "chai";
import { TopNavigationBar } from "../../../src/sharepoint/rest/topNavigationBar";
import { toMatchEndRegex } from "../../testutils";

describe("TopNavigationBar", () => {
    it("Should be an object", () => {
        let topNavigationBar = new TopNavigationBar("_api/web/Navigation");
        expect(topNavigationBar).to.be.a("object");
    });
    describe("url", () => {
        it("Should return _api/web/Navigation/TopNavigationBar", () => {
            let topNavigationBar = new TopNavigationBar("_api/web/Navigation");
            expect(topNavigationBar.toUrl()).to.match(toMatchEndRegex("_api/web/Navigation/TopNavigationBar"));
        });
    });
});
