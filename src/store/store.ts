import { configureStore } from "@reduxjs/toolkit";
import { businessProfilesApi } from "./businessProfilesApi";
import { transportersApi } from "./transportersApi";
import { promotersApi } from "./promotersApi";
import {categoryApi} from "./categoryApi";
import {pendingContractApi} from "./pendingContractApi";
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
    [productsApi.reducerPath]: productsApi.reducer,
    [userProfilesCommonApi.reducerPath]: userProfilesCommonApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
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
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
