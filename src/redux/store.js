import { configureStore } from "@reduxjs/toolkit";
import productFormReducer from "./productFormSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["productForm"], // Only persist the productForm slice
};

const persistedReducer = persistReducer(persistConfig, productFormReducer);

export const store = configureStore({
  reducer: {
    productForm: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // Ignore redux-persist actions
      },
    }),
});

export const persistor = persistStore(store);
