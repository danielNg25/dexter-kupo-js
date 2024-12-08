export const handleError = (error: unknown): Error => {
    return new Error(`An error occurred: ${error}`);
};
