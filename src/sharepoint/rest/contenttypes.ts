"use strict";

import { Queryable, QueryableCollection, QueryableInstance } from "./queryable";

/**
 * Describes a collection of content types
 * 
 */
export class ContentTypes extends QueryableCollection {

    /**
     * Creates a new instance of the ContentTypes class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this content types collection
     */
    constructor(baseUrl: string | Queryable, path = "contenttypes") {
        super(baseUrl, path);
    }

    /**
     * Gets a ContentType by content type id
     */
    public getById(id: string): ContentType {
        let ct: ContentType = new ContentType(this);
        ct.concat(`('${id}')`);
        return ct;
    }
}

/**
 * Describes a single ContentType instance
 * 
 */
export class ContentType extends QueryableInstance {

    /**
     * Creates a new instance of the ContentType class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this content type instance
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Gets the column (also known as field) references in the content type.
    */
    public get fieldLinks(): Queryable {
        return new Queryable(this, "fieldLinks");
    }

    /**
     * Gets a value that specifies the collection of fields for the content type.
     */
    public get fields(): Queryable {
        return new Queryable(this, "fields");
    }

    /**
     * Gets the parent content type of the content type.
     */
    public get parent(): ContentType {
        return new ContentType(this, "parent");
    }

    /**
     * Gets a value that specifies the collection of workflow associations for the content type.
     */
    public get workflowAssociations(): Queryable {
        return new Queryable(this, "workflowAssociations");
    }
}
