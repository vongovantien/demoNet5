namespace CommonType {
    export type DataType = 'LINK' | 'BOOLEAN' | 'DATE' | 'CURRENCY';

    export type ACTION_FORM = 'CREATE' | 'UPDATE' | 'COPY';

    export type DIRECTION = 'left' | 'right' | 'center';

    export type SERVICE_TYPE = 'air' | 'sea' | 'logistic';


    export const DATATYPE = {
        LINK: <DataType>'LINK',
        BOOLEAN: <DataType>'BOOLEAN',
        DATE: <DataType>'DATE',
    };

    export const ACTION = {
        CREATE: <ACTION_FORM>'CREATE',
        UPDATE: <ACTION_FORM>'UPDATE',
        COPY: <ACTION_FORM>'COPY',
    };

    export const SERVICE_TYPE = {
        AIR: <SERVICE_TYPE>'air',
        SEA: <SERVICE_TYPE>'sea',
        LOGISTIC: <SERVICE_TYPE>'logistic',
    };


}



