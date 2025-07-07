import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  images: { image: false, image1: false, image2: false, image3: false },
  name: "",
  description: "",
  price: "",
  quantity: "",
  categoryId: "",
};

const productFormSlice = createSlice({
  name: "productForm",
  initialState,
  reducers: {
    setImages: (state, action) => {
      state.images = { ...state.images, ...action.payload };
    },
    clearImage: (state, action) => {
      state.images[action.payload] = false;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
    setQuantity: (state, action) => {
      state.quantity = action.payload;
    },
    setCategoryId: (state, action) => {
      state.categoryId = action.payload;
    },
    clearField: (state, action) => {
      state[action.payload] = initialState[action.payload];
    },
    resetForm: (state) => {
      return initialState;
    },
  },
});

export const {
  setImages,
  clearImage,
  setName,
  setDescription,
  setPrice,
  setQuantity,
  setCategoryId,
  clearField,
  resetForm,
} = productFormSlice.actions;

export default productFormSlice.reducer;
