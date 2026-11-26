import { configureStore } from "@reduxjs/toolkit";
import { businessProfilesApi } from "./businessProfilesApi";
import { transportersApi } from "./transportersApi";
import { promotersApi } from "./promotersApi";
import {categoryApi} from "./categoryApi";
import {contractsApi} from "./contractsApi";
import { contractTrucksApi } from "./contractTrucksApi";
import {productsApi} from "./productsApi";
import { userProfilesCommonApi } from "./userProfilesCommonApi";
import { authApi } from "./authApi";
import { trucksApi } from "./trucksApi";
import { driversApi } from "./driversApi";
import { truckTripApi } from "./truckTripApi";
import { driverTruckMappingApi } from "./driverTruckMappingApi";
import { roleAccessApi } from "./roleAccessApi";
import { userAccessApi } from "./userAccessApi";
import { sellerInvoiceApi } from "./sellerInvoiceApi";
import { paymentAdviceApi } from "./paymentAdviceApi";
import { notificationsApi } from "./notificationsApi";
import { notificationTemplatesApi } from "./notificationTemplatesApi";
import { notificationPreferencesApi } from "./notificationPreferencesApi";
import { bannersApi } from "./bannersApi";
import { registrationDetailsApi } from "./registrationDetailsApi";
import { bloggersApi } from "./bloggersApi";
import { businessDashboardApi } from "./businessDashboardApi";
import { transporterDashboardApi } from "./transporterDashboardApi";
import { truckDeliveryOrdersApi } from "./truckDeliveryOrdersApi";

export const store = configureStore({
  reducer: {
    [businessProfilesApi.reducerPath]: businessProfilesApi.reducer,
    [transportersApi.reducerPath]: transportersApi.reducer,
    [promotersApi.reducerPath]: promotersApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [userProfilesCommonApi.reducerPath]: userProfilesCommonApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [contractsApi.reducerPath]: contractsApi.reducer,
    [contractTrucksApi.reducerPath]: contractTrucksApi.reducer,
    [trucksApi.reducerPath]: trucksApi.reducer,
    [driversApi.reducerPath]: driversApi.reducer,
    [truckTripApi.reducerPath]: truckTripApi.reducer,
    [driverTruckMappingApi.reducerPath]: driverTruckMappingApi.reducer,
    [roleAccessApi.reducerPath]: roleAccessApi.reducer,
    [userAccessApi.reducerPath]: userAccessApi.reducer,
    [sellerInvoiceApi.reducerPath]: sellerInvoiceApi.reducer,
    [paymentAdviceApi.reducerPath]: paymentAdviceApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [notificationTemplatesApi.reducerPath]: notificationTemplatesApi.reducer,
    [notificationPreferencesApi.reducerPath]: notificationPreferencesApi.reducer,
    [bannersApi.reducerPath]: bannersApi.reducer,
    [registrationDetailsApi.reducerPath]: registrationDetailsApi.reducer,
    [bloggersApi.reducerPath]: bloggersApi.reducer,
    [businessDashboardApi.reducerPath]: businessDashboardApi.reducer,
    [transporterDashboardApi.reducerPath]: transporterDashboardApi.reducer,
    [truckDeliveryOrdersApi.reducerPath]: truckDeliveryOrdersApi.reducer,
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
      contractsApi.middleware,
      contractTrucksApi.middleware,
      trucksApi.middleware,
      driversApi.middleware,
      truckTripApi.middleware,
      driverTruckMappingApi.middleware,
      roleAccessApi.middleware,
      userAccessApi.middleware,
      sellerInvoiceApi.middleware,
      paymentAdviceApi.middleware,
      notificationsApi.middleware,
      notificationTemplatesApi.middleware,
      notificationPreferencesApi.middleware,
      bannersApi.middleware,
      registrationDetailsApi.middleware,
      bloggersApi.middleware,
      businessDashboardApi.middleware,
      transporterDashboardApi.middleware,
      truckDeliveryOrdersApi.middleware,
    ),
});

/** Every API slice in the store, so their caches can be dropped together. */
const apiSlices = [
  businessProfilesApi, transportersApi, promotersApi, categoryApi, productsApi, userProfilesCommonApi, authApi, contractsApi,
  contractTrucksApi, trucksApi, driversApi, truckTripApi, driverTruckMappingApi, roleAccessApi, userAccessApi, sellerInvoiceApi,
  paymentAdviceApi, notificationsApi, notificationTemplatesApi, notificationPreferencesApi, bannersApi, registrationDetailsApi,
  bloggersApi, businessDashboardApi, transporterDashboardApi, truckDeliveryOrdersApi,
];

/**
 * Forgets every cached API answer. Called when the user signs out and whenever a different user signs in: the server
 * limits data to the signed-in user (a business sees only its own and linked businesses), so a cached answer fetched for
 * one user (e.g. Super Admin's list of every business) must never be shown to the next.
 */
export const resetApiCaches = () => {
  apiSlices.forEach((api) => store.dispatch(api.util.resetApiState()));
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
