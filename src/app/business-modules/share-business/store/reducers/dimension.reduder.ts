import { DIM } from "@models";
import { DimensionActionTypes, DimensionActions } from "../actions";


export interface IDimensionState {
    dims: DIM[];
    isLoading?: boolean;
    isLoaded?: boolean;
}

const initialDimensionState: IDimensionState = {
    dims: [],
    isLoaded: false,
    isLoading: false
};

export function DimensionReducer(state = initialDimensionState, action: DimensionActions): IDimensionState {
    switch (action.type) {
        case DimensionActionTypes.INIT_DIMENSION: {
            return { ...state, dims: action.payload };
        }

        case DimensionActionTypes.GET_DIMENSION: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case DimensionActionTypes.GET_DIMENSION_HBL: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case DimensionActionTypes.GET_DIMENSION_SUCESS: {
            return { ...state, dims: action.payload, isLoaded: false, isLoading: true };
        }

        case DimensionActionTypes.GET_DIMENSION_HBL_SUCCESS: {
            return { ...state, dims: action.payload, isLoaded: false, isLoading: true };
        }

        default: {
            return state;
        }
    }
}
