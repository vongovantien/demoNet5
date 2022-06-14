import { CatalogueActionTypes, CatalogueActions } from "../actions/catalogue.action";
import { PortIndex, Customer, Unit, Commodity, CountryModel, Currency, Warehouse, CommodityGroup, Bank } from "@models";


export interface ICatalogueState {
    ports: PortIndex[];
    warehouses: Warehouse[];
    carriers: Customer[];
    agents: Customer[];
    units: Unit[];
    packages: Unit[];
    customers: Customer[];
    countries: CountryModel[];
    commodities: Commodity[];
    commodityGroups: CommodityGroup[];
    currencies: Currency[];
    banks: Bank[],
    isLoading: boolean;

}

const initialState: ICatalogueState = {
    ports: [],
    warehouses: [],
    carriers: [],
    agents: [],
    units: [],
    packages: [],
    customers: [],
    commodities: [],
    commodityGroups: [],
    countries: [],
    currencies: [],
    banks: [],
    isLoading: false
};


export function catalogueReducer(state = initialState, action: CatalogueActions): ICatalogueState {
    switch (action.type) {
        case CatalogueActionTypes.GET_PARTNER: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_PORT: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_PORT_SUCCESS: {
            return { ...state, isLoading: false, ports: action.payload };
        }
        case CatalogueActionTypes.GET_PORT_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_WAREHOUSE: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_WAREHOUSE_SUCCESS: {
            return { ...state, isLoading: false, warehouses: action.payload };
        }
        case CatalogueActionTypes.GET_WAREHOUSE_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_CARRIER: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_CARRIER_SUCCESS: {
            return { ...state, isLoading: false, carriers: action.payload };
        }
        case CatalogueActionTypes.GET_CARRIER_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_AGENT: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_AGENT_SUCCESS: {
            return { ...state, isLoading: false, agents: action.payload };
        }
        case CatalogueActionTypes.GET_AGENT_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_UNIT: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_UNIT_SUCCESS: {
            return { ...state, isLoading: false, units: action.payload };
        }
        case CatalogueActionTypes.GET_UNIT_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_PACKAGE: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_PACKAGE_SUCCESS: {
            return { ...state, isLoading: false, packages: action.payload };
        }
        case CatalogueActionTypes.GET_PACKAGE_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_COMMODITY: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_COMMODITY_SUCCESS: {
            return { ...state, isLoading: false, commodities: action.payload };
        }
        case CatalogueActionTypes.GET_COMMODITY_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_COMMODITYGROUP: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_COMMODITYGROUP_SUCCESS: {
            return { ...state, isLoading: false, commodityGroups: action.payload };
        }
        case CatalogueActionTypes.GET_COMMODITYGROUP_FAIL: {
            return { ...state, isLoading: false, };
        }


        case CatalogueActionTypes.GET_COUNTRY: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_COUNTRY_SUCCESS: {
            return { ...state, isLoading: false, countries: action.payload };
        }
        case CatalogueActionTypes.GET_COUNTRY_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_CURRENCY: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_CURRENCY_SUCCESS: {
            return { ...state, isLoading: false, currencies: action.payload };
        }
        case CatalogueActionTypes.GET_CURRENCY_FAIL: {
            return { ...state, isLoading: false, };
        }

        case CatalogueActionTypes.GET_BANK: {
            return { ...state, isLoading: true };
        }
        case CatalogueActionTypes.GET_BANK_SUCCESS: {
            return { ...state, isLoading: false, banks: action.payload };
        }
        case CatalogueActionTypes.GET_BANK_FAIL: {
            return { ...state, isLoading: false, };
        }
        default: {
            return state;
        }
    }
}
