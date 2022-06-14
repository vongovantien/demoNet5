export class ProviceModel {
    id: string;
    code: string;
    name_EN: string;
    name_VN: string;
    areaID: string;
    countryID: number;
    countryNameVN: string;
    countryNameEN: string;
    note: string;
    userCreated: string;
    datetimeCreated?: Date;
    userModified: string;
    datetimeModified?: Date;
    active?: boolean;
    inactiveOn?: Date;
}