import { configureStore } from "@reduxjs/toolkit";
import { businessProfilesApi } from "./businessProfilesApi";
import { transportersApi } from "./transportersApi";
import { promotersApi } from "./promotersApi";
import {categoryApi} from "./categoryApi";
import { userProfilesCommonApi } from "./userProfilesCommonApi";
import { authApi } from "./authApi";

export const store = configureStore({
  reducer: {
    [businessProfilesApi.reducerPath]: businessProfilesApi.reducer,
    [transportersApi.reducerPath]: transportersApi.reducer,
    [promotersApi.reducerPath]: promotersApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
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
      categoryApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
