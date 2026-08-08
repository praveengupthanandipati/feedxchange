import { configureStore } from "@reduxjs/toolkit";
import { businessProfilesApi } from "./businessProfilesApi";
import { transportersApi } from "./transportersApi";
import { promotersApi } from "./promotersApi";
import {categoryApi} from "./categoryApi";
import {pendingContractApi} from "./pendingContractApi";
import {productsApi} from "./productsApi";
import { userProfilesCommonApi } from "./userProfilesCommonApi";
import { authApi } from "./authApi";
import { trucksApi } from "./trucksApi";
import { driversApi } from "./driversApi";
import { truckTripApi } from "./truckTripApi";
import { driverTruckMappingApi } from "./driverTruckMappingApi";

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
    [trucksApi.reducerPath]: trucksApi.reducer,
    [driversApi.reducerPath]: driversApi.reducer,
    [truckTripApi.reducerPath]: truckTripApi.reducer,
    [driverTruckMappingApi.reducerPath]: driverTruckMappingApi.reducer,
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
      trucksApi.middleware,
      driversApi.middleware,
      truckTripApi.middleware,
      driverTruckMappingApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
