"use strict";

/**
 * Descibes a Sequencer
 */
export class Sequencer {
    /**
     * Creates a new instance of the Sequencer class, and declare private variables
     */
    constructor(private functions: Array<any>, private parameter: any, private scope: any) {
    }

    /**
     * Executes the functions in sequence using DeferredObject
     */
    public execute(progressFunction?: (s: Sequencer, index: number, functions: any[]) => void): Promise<void> {

        let promiseSequence = Promise.resolve(); // empty promise to chain on

        this.functions.forEach((sequenceFunction, functionNr) => {

            promiseSequence = promiseSequence.then(() => { // Chain function call onto the sequence

                return sequenceFunction.call(this.scope, this.parameter);

            }).then((result) => { // Resolve for each function call

                if (progressFunction) {
                    progressFunction.call(this, functionNr, this.functions);
                }
            });

        }, this);

        return promiseSequence; // This will resolve after the entire chain is resolved
    }
}
