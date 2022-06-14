import { formatDate } from "@angular/common";

export class JobConstants {
    public static readonly Overdued: string = "Overdued";
    public static readonly Processing: string = "Processing";
    public static readonly InSchedule: string = "InSchedule";
    public static readonly Pending = "Pending";
    public static readonly Finish: string = "Finish";
    public static readonly Canceled: string = "Canceled";
    public static readonly Warning: string = "Warning";

    public static COMMON_DATA = {
        FREIGHTTERMS: <string[]>['Collect', 'Prepaid'],

        SHIPMENTTYPES: <string[]>['Freehand', 'Nominated'],

        BILLOFLADINGS: <string[]>['Copy', 'Original', 'Sea Waybill', 'Surrendered'],

        SERVICETYPES: <string[]>['FCL/FCL', 'LCL/LCL', 'FCL/LCL', 'CY/CFS', 'CY/CY', 'CFS/CY', 'CFS/CFS', 'CY/DR', 'DR/CY', 'DR/DR', 'DR/CFS', 'CFS/DR'],

        TYPEOFMOVES: <string[]>['FCL/FCL-CY/CY', 'LCL/LCL-CY/CY', 'LCL/LCL-CFS/CFS', 'LCL/FCL-CFS/CY', 'FCL/LCL-CY/CFS'],

        BLNUMBERS: <CommonInterface.INg2Select[]>[
            { id: '0', text: 'Zero (0)' },
            { id: 1, text: 'One (1)' },
            { id: 2, text: 'Two (2)' },
            { id: 3, text: 'Three (3)' }
        ],
        RCLASS: <string[]>['M', 'N', 'Q'],

        WT: <string[]>['PP', 'CLL'],

        SHIPMENTMODES: <string[]>['Internal', 'External'],

        SERVICEMODES: <string[]>['Export', 'Import'],

        PRODUCTSERVICE: <string[]>['Sea FCL', 'Sea LCL', 'Air', 'Sea', 'Trucking', 'Cross border', 'Warehouse', 'Railway', 'Express', 'Bonded Warehouse', 'Other'],

        ROUTES: <string[]>['Red', 'Green', 'Yellow'],

        LINKFEESEARCHS: <string[]>['All', 'Have Linked', 'Not Link'],

        AIRLIGHTCODEMAPPING: <CommonInterface.INg2Select[]>[
            { id: '235', text: 'TURKISH CARGO' },
            { id: '180', text: 'KOREAN AIR' },
            { id: '205', text: `ALL NIPPON AIRWAYS CO.,LTD\n3-5-10 HANEDA AIRPORT  OOTA-KU` },
            { id: '176', text: `EMIRATES AIRLINES\nGROUP HDQ AIRPORT ROAD\nP.O.BOX: 686 DEIRA DUBAI\nUNITED ARAB EMIRATE` },
            { id: '157', text: 'QATAR CARGO' },
            { id: '828', text: 'HONGKONG AIR CARGO' },
            { id: '988', text: `CABLE ADDRESS: ASIANA AIRLINES\nAsiana Town, #47 Osoe-Dong, Gangseo-Gu, Seoul, Korea` },
            { id: '230', text: 'COPA AIRLINES' },
            { id: '125', text: 'BRITISH AIRWAYS WORLD CARGO' },
            { id: '014', text: 'AIR CANADA CARGO' },
            { id: '876', text: 'SICHUAN AIRLINES' },
        ]
    };

    public static readonly CONFIG = {
        COMBOGRID_PARTNER: <CommonInterface.IComboGridDisplayField[]>[
            { field: 'accountNo', label: 'Partner Code' },
            { field: 'shortName', label: 'Name ABBR' },
            { field: 'partnerNameEn', label: 'Name EN' },
        ],
        COMBOGRID_PORT: <CommonInterface.IComboGridDisplayField[]>[
            { field: 'code', label: 'Port Code' },
            { field: 'nameEn', label: 'Port Name' },
            { field: 'countryNameEN', label: 'Country' },
        ],
        COMBOGRID_COUNTRY: <CommonInterface.IComboGridDisplayField[]>[
            { field: 'code', label: 'Country Code' },
            { field: 'nameEn', label: 'Name EN' },
        ],
        COMBOGRID_CITY_PROVINCE: <CommonInterface.IComboGridDisplayField[]>[
            { field: 'code', label: 'City Code' },
            { field: 'name_EN', label: 'Name En' },
        ]
    };

    // * 60 days -> current day
    public static readonly DEFAULT_RANGE_DATE_SEARCH = {
        fromDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 2, new Date().getDate()), 'yyyy-MM-dd', 'en'),
        toDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
    };

    public static readonly DEFAULT_HANDLING_TURKISH_CARGO = "SPX‎/‎X‎- ‎RAY USED";

}
