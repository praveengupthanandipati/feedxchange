import { configureStore } from "@reduxjs/toolkit";
import { businessProfilesApi } from "./businessProfilesApi";
import { transportersApi } from "./transportersApi";
import { promotersApi } from "./promotersApi";
import {categoryApi} from "./categoryApi";
//import {contractChangeStatusApi} from "./contractChangeStatusApi";
import { newContractsApi } from "./newContractsApi";
import {pendingContractApi} from "./pendingContractApi";
import {contractsApi} from "./contractApi";
import {productsApi} from "./productsApi";
import { userProfilesCommonApi } from "./userProfilesCommonApi";
import { authApi } from "./authApi";

export const store = configureStore({
  reducer: {
    [businessProfilesApi.reducerPath]: businessProfilesApi.reducer,
    [transportersApi.reducerPath]: transportersApi.reducer,
    [promotersApi.reducerPath]: promotersApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [pendingContractApi.reducerPath]: pendingContractApi.reducer,
    //[contractChangeStatusApi.reducerPath]: contractChangeStatusApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [userProfilesCommonApi.reducerPath]: userProfilesCommonApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [newContractsApi.reducerPath]: newContractsApi.reducer,
    [contractsApi.reducerPath]: contractsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      businessProfilesApi.middleware,
      transportersApi.middleware,
      promotersApi.middleware,
      userProfilesCommonApi.middleware,
      authApi.middleware,
      categoryApi.middleware,
      productsApi.middleware,
      pendingContractApi.middleware,
      //[contractChangeStatusApi.middleware]: contractChangeStatusApi.middleware,
      newContractsApi.middleware,
      contractsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
