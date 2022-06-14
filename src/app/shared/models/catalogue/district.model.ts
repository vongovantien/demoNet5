export class DistrictModel {
    id: string;
    code: string;
    name_VN: string;
    name_EN: string;
    provinceID: string;
    provinceNameEN: string;
    provinceNameVN: string;
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