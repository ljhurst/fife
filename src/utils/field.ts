function createFieldList<T>(fields: readonly (keyof T)[]): typeof fields {
    return fields;
}

export { createFieldList };
