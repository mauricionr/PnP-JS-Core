import { Queryable, QueryableInstance, QueryableCollection } from "./queryable";

/**
 * Describes a collection of List objects
 *
 */
export class Features extends QueryableCollection {

    /**
     * Creates a new instance of the Lists class
     *
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     */
    constructor(baseUrl: string | Queryable, path = "features") {
        super(baseUrl, path);
    }

    /**
     * Gets a list from the collection by guid id
     *
     * @param id The Id of the feature (GUID)
     */
    public getById(id: string): Feature {
        let feature = new Feature(this);
        feature.concat(`('${id}')`);
        return feature;
    }

    /**
     * Adds a new list to the collection
     *
     * @param id The Id of the feature (GUID)
     * @param force If true the feature activation will be forced
     */
    public add(id: string, force = false): Promise<FeatureAddResult> {

        let adder = new Features(this, "add");
        return adder.post({
            body: JSON.stringify({
                featdefScope: 0,
                featureId: id,
                force: force,
            }),
        }).then(data => {
            return {
                data: data,
                feature: this.getById(id),
            };
        });
    }

    /**
     * Removes (deactivates) a feature from the collection
     * 
     * @param id The Id of the feature (GUID)
     * @param force If true the feature deactivation will be forced
     */
    public remove(id: string, force = false): Promise<any> {

        let remover = new Features(this, "remove");
        return remover.post({
            body: JSON.stringify({
                featureId: id,
                force: force,
            }),
        });
    }
}

export class Feature extends QueryableInstance {

    /**
     * Creates a new instance of the Lists class
     *
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Removes (deactivates) a feature from the collection
     * 
     * @param force If true the feature deactivation will be forced
     */
    public deactivate(force = false): Promise<any> {

        let removeDependency = this.addBatchDependency();

        let idGet = new Feature(this).select("DefinitionId");

        return idGet.getAs<{ DefinitionId: string }>().then(feature => {

            let promise = this.getParent(Features, this.parentUrl, "").remove(feature.DefinitionId, force);

            removeDependency();

            return promise;
        });
    }
}

export interface FeatureAddResult {
    data: any;
    feature: Feature;
}
