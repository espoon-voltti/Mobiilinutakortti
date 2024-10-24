import { userTypes, userActions, userState } from '../types/userTypes';

const initialState: userState = {
    id: '',
    name: ''
}

const defaultExp = (state = initialState, action: userActions): userState => {
    switch (action.type) {
        case userTypes.GET_SELF_SUCCESS:
            return { ...state, id: action.payload.id, name: action.payload.name };
        default:
            return state;
    }
}

export default defaultExp
