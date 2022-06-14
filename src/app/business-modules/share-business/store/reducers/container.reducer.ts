import { Container } from "src/app/shared/models/document/container.model";
import { ContainerActionTypes, ContainerAction } from "../actions/container.action";


export interface IContainerState {
    containers: Container[];
}

export const initialContainerState: IContainerState = {
    containers: new Array<Container>()
};

export function ContainerReducer(state = initialContainerState, action: ContainerAction): IContainerState {
    switch (action.type) {
        case ContainerActionTypes.INIT_CONTAINER: {
            return {
                containers: action.payload
            };
        }

        case ContainerActionTypes.GET_CONTAINER_SUCESS: {
            return {
                containers: action.payload,
            };
        }

        case ContainerActionTypes.ADD_CONTAINER: {
            return {
                containers: [...state.containers, action.payload],
            };
        }

        case ContainerActionTypes.ADD_CONTAINERS: {
            return {
                containers: [...state.containers, ...action.payload]
            };
        }

        case ContainerActionTypes.DELETE_CONTAINER: {
            // return { ...state, ...state.containers.splice(action.payload, 1) };
            return { ...state, containers: [...state.containers.slice(0, action.payload), ...state.containers.slice(action.payload + 1)] };
        }

        case ContainerActionTypes.SAVE_CONTAINER: {
            return {
                containers: action.payload,
            };
        }

        case ContainerActionTypes.CLEAR_CONTAINER: {
            return {
                containers: []
            };
        }

        default: {
            return state;
        }
    }
}

