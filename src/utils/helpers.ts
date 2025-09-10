export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES').format(date);
};

export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
};