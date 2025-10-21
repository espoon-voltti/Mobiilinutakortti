import { createStore, Store, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions'
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import { authActions, authTypes } from "../types/authTypes";
import { LangActions, LangTypes} from "../types/langTypes";
import { userActions, userTypes } from "../types/userTypes";
import {Language} from "../customizations/types";

export const history = createBrowserHistory();

const token: string = localStorage.getItem('token') ?? '';
const lang: string = localStorage.getItem('lang') ?? 'fi';
const loggedIn: boolean = (token !== null);


const persistedState = {
    auth: {
        loggingIn: false,
        loggedIn,
        token: token ?? '',
        error: false,
        message: null as "authFail" | "linkRequestSuccess" | "linkRequestFail" | null,
    }
}

export function configureStore(): Store<AppState> {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducer(),
        persistedState,
        compose(applyMiddleware(sagaMiddleware))
    );

    sagaMiddleware.run(rootSaga);
    store.dispatch({ type: LangTypes.SET_LANG, lang: lang as Language })

    if (loggedIn) {
      store.dispatch({ type: userTypes.GET_USER, payload: token })
    } else {
      store.dispatch({ type: authTypes.AUTH_WITH_CACHE })
    }

    return store;
}

export type AppDispatch = (action: authActions | LangActions | userActions) => void
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
