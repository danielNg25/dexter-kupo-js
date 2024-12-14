import { DefinitionBuilder } from '../definitions/definition-builder';
import { cborToDatumJson } from '../definitions/utils';
export class BaseDex {
    constructor(kupoApi) {
        this.kupoApi = kupoApi;
    }
    async _parseOrderDatum(datum, order) {
        try {
            let jsonDatum = cborToDatumJson(datum);
            const builder = await new DefinitionBuilder().loadDefinition(order);
            const parameters = builder.pullParameters(jsonDatum);
            return parameters;
        }
        catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }
}
