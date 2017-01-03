

import { expect } from "chai";
import { QuickLaunch } from "../../src/sharepoint/quicklaunch";
import { toMatchEndRegex } from "../testutils";

describe("QuickLaunch", () => {
    it("Should be an object", () => {
        let quickLaunch = new QuickLaunch("_api/web/Navigation");
        expect(quickLaunch).to.be.a("object");
    });
    describe("url", () => {
        it("Should return _api/web/Navigation/QuickLaunch", () => {
            let quickLaunch = new QuickLaunch("_api/web/Navigation");
            expect(quickLaunch.toUrl()).to.match(toMatchEndRegex("_api/web/Navigation/QuickLaunch"));
        });
    });
});
