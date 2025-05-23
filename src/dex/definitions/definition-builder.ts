import { DatumParameters, DefinitionConstr, DefinitionField } from './types';
import { DatumParameterKey } from './constants';
import _ from 'lodash';
import { datumJsonToCbor } from './utils';
import * as fs from 'fs';

export class DefinitionBuilder {
    private _definition!: DefinitionConstr;

    /**
     * Load a DEX definition file as a template for this builder.
     */
    public async loadDefinition(
        definition: DefinitionConstr
    ): Promise<DefinitionBuilder> {
        this._definition = _.cloneDeepWith(definition, (value: any) => {
            if (value instanceof Function) {
                return value;
            }
        });

        return this;
    }

    /**
     * Push specified parameters to the definition template.
     */
    public pushParameters(parameters: DatumParameters): DefinitionBuilder {
        if (!this._definition) {
            throw new Error(
                `Definition file must be loaded before applying parameters`
            );
        }

        this._definition = this.applyParameters(this._definition, parameters);

        return this;
    }

    /**
     * Pull parameters of a datum using a definition template.
     */
    public pullParameters(
        definedDefinition: DefinitionConstr
    ): DatumParameters {
        if (!this._definition) {
            throw new Error(
                `Definition file must be loaded before pulling parameters`
            );
        }

        return this.extractParameters(definedDefinition, this._definition);
    }

    /**
     * Retrieve the CBOR for the builder.
     */
    public getCbor(): string {
        return datumJsonToCbor(JSON.parse(JSON.stringify(this._definition)));
    }

    /**
     * Recursively set specified parameters.
     */
    private applyParameters(
        field: DefinitionField,
        mappedParameters: DatumParameters
    ): DefinitionConstr {
        if (field instanceof Function) {
            return field(field, mappedParameters, false);
        }

        if ('fields' in field) {
            if (typeof field.constructor === 'string') {
                const parameterValue: any =
                    mappedParameters[
                        field.constructor as keyof typeof DatumParameterKey
                    ];

                if (typeof parameterValue !== 'number') {
                    throw new Error(
                        `Invalid parameter value '${parameterValue}' for constructor value`
                    );
                }

                field.constructor = parameterValue;
            }

            field.fields = field.fields.map(
                (fieldParameter: DefinitionField) => {
                    return this.applyParameters(
                        fieldParameter,
                        mappedParameters
                    );
                }
            );
        }

        if ('list' in field) {
            field.list = (field.list as DefinitionField[])?.map(
                (fieldParameter: DefinitionField) => {
                    return this.applyParameters(
                        fieldParameter,
                        mappedParameters
                    );
                }
            );
        }

        if ('int' in field) {
            let parameterValue: any =
                mappedParameters[field.int as keyof typeof DatumParameterKey];

            if (typeof parameterValue === 'bigint') {
                parameterValue = Number(parameterValue);
            }
            if (typeof parameterValue !== 'number') {
                throw new Error(
                    `Invalid parameter value '${parameterValue}' for type 'int'`
                );
            }

            field.int = parameterValue;
        }

        if ('bytes' in field) {
            const parameterValue: any =
                mappedParameters[
                    field.bytes as keyof typeof DatumParameterKey
                ] ?? '';

            if (typeof parameterValue !== 'string') {
                throw new Error(
                    `Invalid parameter value '${parameterValue}' for type 'bytes'`
                );
            }

            field.bytes = parameterValue;
        }

        if (
            Array.isArray(field) &&
            field.every(
                (item) =>
                    typeof item === 'object' && Object.keys(item).length === 1
            )
        ) {
            field.forEach((value) => {
                return this.applyParameters(value, mappedParameters);
            });
        }

        return field as DefinitionConstr;
    }

    /**
     * Recursively pull parameters from datum using definition template.
     */
    private extractParameters(
        definedDefinition: DefinitionField,
        templateDefinition: DefinitionField,
        foundParameters: DatumParameters = {}
    ): DatumParameters {
        if (!templateDefinition) return foundParameters;

        if (templateDefinition instanceof Function) {
            templateDefinition(definedDefinition, foundParameters);

            return foundParameters;
        }

        if (templateDefinition instanceof Array) {
            (definedDefinition as DefinitionField[])
                .map((fieldParameter: DefinitionField, index: number) => {
                    return this.extractParameters(
                        fieldParameter,
                        templateDefinition[index],
                        foundParameters
                    );
                })
                .forEach((parameters: DatumParameters) => {
                    foundParameters = { ...foundParameters, ...parameters };
                });
        }

        if ('fields' in definedDefinition) {
            if (!('fields' in templateDefinition)) {
                throw new Error(
                    "Template definition does not match with 'fields'"
                );
            }

            if (
                templateDefinition.constructor &&
                typeof templateDefinition.constructor !== 'number'
            ) {
                foundParameters[templateDefinition.constructor] =
                    definedDefinition.constructor;
            } else if (
                templateDefinition.constructor !== definedDefinition.constructor
            ) {
                throw new Error(
                    'Template definition does not match with constructor value'
                );
            }

            definedDefinition.fields
                .map((fieldParameter: DefinitionField, index: number) => {
                    return this.extractParameters(
                        fieldParameter,
                        templateDefinition.fields[index],
                        foundParameters
                    );
                })
                .forEach((parameters: DatumParameters) => {
                    foundParameters = { ...foundParameters, ...parameters };
                });
        }

        if ('list' in definedDefinition) {
            if (
                !('list' in templateDefinition) ||
                !Array.isArray(definedDefinition.list)
            ) {
                throw new Error(
                    "Template definition does not match or 'list' is not an array"
                );
            }

            (definedDefinition.list as DefinitionField[])
                .map((fieldParameter: DefinitionField, index: number) => {
                    // Ensure the template list at index exists before attempting to access it
                    if (templateDefinition.list as DefinitionField[]) {
                        return this.extractParameters(
                            fieldParameter,
                            (templateDefinition.list as DefinitionField[])[
                                index
                            ],
                            foundParameters
                        );
                    } else {
                        throw new Error(
                            `Template definition at index ${index} is undefined`
                        );
                    }
                })
                .forEach((parameters: any) => {
                    foundParameters = { ...foundParameters, ...parameters };
                });
        }

        if ('int' in definedDefinition) {
            if (!('int' in templateDefinition)) {
                throw new Error(
                    "Template definition does not match with 'int'"
                );
            }

            if (typeof templateDefinition.int !== 'number') {
                foundParameters[templateDefinition.int] = definedDefinition.int;
            }
        }

        if ('bytes' in definedDefinition) {
            if (!('bytes' in templateDefinition)) {
                throw new Error(
                    "Template definition does not match with 'bytes'"
                );
            }

            const datumKeys: string[] = Object.values(DatumParameterKey);

            if (datumKeys.includes(templateDefinition.bytes)) {
                foundParameters[templateDefinition.bytes] =
                    definedDefinition.bytes;
            }
        }

        return foundParameters;
    }
}
