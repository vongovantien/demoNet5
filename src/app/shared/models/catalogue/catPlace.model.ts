export class CatPlaceModel {
    code: string;
    nameVn: string;
    nameEn: string;
    displayName: string;
    address: string;
    districtId: string;
    provinceId: string;
    countryId: number;
    areaId: string;
    localAreaId: string;
    modeOfTransport: string;
    geoCode: string;
    placeType: number;
    placeTypeId: string;
    note: string;
    userCreated: string;
    datetimeCreated: Date;
    userModified: string;
    datetimeModified: Date;
    active: boolean;
    inactiveOn: Date;
}