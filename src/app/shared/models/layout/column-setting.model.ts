export class ColumnSetting {
    primaryKey: string;
    header?: string;
    format?: string;
    dataType?: string;
    alternativeKeys?: string[];
    isShow?: boolean = false;
    allowSearch?: boolean = false;
    required?:boolean;
    lookup?: string;
}