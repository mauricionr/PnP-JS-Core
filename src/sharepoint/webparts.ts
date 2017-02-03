import { Queryable, QueryableInstance, QueryableCollection } from "./queryable";

export class LimitedWebPartManager extends Queryable {

    /**
     * Creates a new instance of the LimitedWebPartManager class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     * @param path Optional, if supplied will be appended to the supplied baseUrl
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Gets the set of web part definitions contained by this web part manager
     * 
     */
    public get webparts(): WebPartDefinitions {
        return new WebPartDefinitions(this, "webparts");
    }

    /**
     * Exports a webpart definition
     * 
     * @param id the GUID id of the definition to export
     */
    public export(id: string): Promise<string> {

        let exporter = new LimitedWebPartManager(this, "ExportWebPart");
        return exporter.post({
            body: JSON.stringify({ webPartId: id }),
        });
    }

    /**
     * Imports a webpart
     * 
     * @param xml webpart definition which must be valid XML in the .dwp or .webpart format
     */
    public import(xml: string): Promise<any> {

        let importer = new LimitedWebPartManager(this, "ImportWebPart");
        return importer.post({
            body: JSON.stringify({ webPartXml: xml }),
        });
    }
}

export class WebPartDefinitions extends QueryableCollection {

    /**
     * Creates a new instance of the WebPartDefinitions class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     * @param path Optional, if supplied will be appended to the supplied baseUrl
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Gets a web part definition from the collection by id
     * 
     * @param id GUID id of the web part definition to get
     */
    public getById(id: string): WebPartDefinition {

        return new WebPartDefinition(this, `getbyid('${id}')`);
    }
}

export class WebPartDefinition extends QueryableInstance {

    /**
     * Creates a new instance of the WebPartDefinition class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     * @param path Optional, if supplied will be appended to the supplied baseUrl
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Gets the webpart information associated with this definition
     */
    public get webpart(): WebPart {
        return new WebPart(this);
    }

    /**
     * Removes a webpart from a page, all settings will be lost
     */
    public delete(): Promise<void> {

        let deleter = new WebPartDefinition(this, "DeleteWebPart");
        return deleter.post();
    }
}

export class WebPart extends QueryableInstance {

    /**
     * Creates a new instance of the WebPart class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     * @param path Optional, if supplied will be appended to the supplied baseUrl
     */
    constructor(baseUrl: string | Queryable, path = "webpart") {
        super(baseUrl, path);
    }
}
