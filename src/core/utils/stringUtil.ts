export const isNotEmpty = (str: string): boolean => !isNotEmpty(str);

export const isEmpty = (str: any): boolean => {
    return str === undefined || str === null || str.trim().length === 0;
};
