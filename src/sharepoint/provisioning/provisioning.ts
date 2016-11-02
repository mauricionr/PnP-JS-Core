"use strict";

import { ProvisioningStep } from "./provisioningstep";
import { ObjectNavigation } from "./objecthandlers/objectnavigation";
import { ObjectPropertyBagEntries } from "./objecthandlers/objectpropertybagentries";
import { ObjectFeatures } from "./objecthandlers/objectfeatures";
import { ObjectWebSettings } from "./objecthandlers/objectwebsettings";
import { ObjectComposedLook } from "./objecthandlers/objectcomposedlook";
import { ObjectCustomActions } from "./objecthandlers/objectcustomactions";
import { ObjectFiles } from "./objecthandlers/objectfiles";
import { ObjectLists } from "./objecthandlers/objectlists";
import { Util } from "./util";
import { Logger, LogLevel } from "../../utils/logging";
import { SiteSchema } from "./schema/ISiteSchema";
import { HttpClient } from "../../net/httpclient";

/**
 * Root class of Provisioning 
 */
export class Provisioning {
    private handlers;
    private httpClient: HttpClient;
    private startTime;
    private queueItems: Array<ProvisioningStep>;

    /**
     * Creates a new instance of the Provisioning class
     */
    constructor() {
        this.handlers = {
            "Navigation": ObjectNavigation,
            "PropertyBagEntries": ObjectPropertyBagEntries,
            "Features": ObjectFeatures,
            "WebSettings": ObjectWebSettings,
            "ComposedLook": ObjectComposedLook,
            "CustomActions": ObjectCustomActions,
            "Files": ObjectFiles,
            "Lists": ObjectLists,
        };
        this.httpClient = new HttpClient();
    }

    /**
     * Applies a JSON template to the current web
     * 
     * @param path URL to the template file
     */
    public applyTemplate(path: string): Promise<any> {
        const url = Util.replaceUrlTokens(path);

        return new Promise((resolve, reject) => {
            this.httpClient.get(url).then((response) => {
                if (response.ok) {
                    response.json().then((template: SiteSchema) => {
                        this.start(template, Object.keys(template)).then(resolve, reject);
                    });
                } else {
                    reject(response.statusText);
                }
            }, (error) => {
                Logger.write("Provisioning: The provided template is invalid", LogLevel.Error);
            });
        });
    }

    /**
     * Starts the provisioning
     * 
     * @param json The parsed template in JSON format
     * @param queue Array of Object Handlers to run
     */
    private start(json: SiteSchema, queue: Array<string>) {
        return new Promise((resolve, reject) => {
            this.startTime = new Date().getTime();
            this.queueItems = [];

            queue.forEach((q, index) => {
                if (!this.handlers[q]) {
                    return;
                }
                this.queueItems.push(new ProvisioningStep(q, index, json[q], json.Parameters, this.handlers[q]));
            });

            let promises = [];
            promises.push(new Promise((res) => {
                Logger.write("Provisioning: Code execution scope started", LogLevel.Info);
                res();
            }));
            let index = 1;
            while (this.queueItems[index - 1] !== undefined) {
                let i = promises.length - 1;
                promises.push(this.queueItems[index - 1].execute(promises[i]));
                index++;
            };

            Promise.all(promises).then((value) => {
                Logger.write("Provisioning: Code execution scope ended", LogLevel.Info);
                resolve(value);
            }, (error) => {
                Logger.write("Provisioning: Code execution scope ended" + JSON.stringify(error), LogLevel.Error);
                reject(error);
            });
        });
    }
}
