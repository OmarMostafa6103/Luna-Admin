// //? ========= START API ===========
// //? ========= START API ===========

// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   setImages,
//   clearImage,
//   setName,
//   setDescription,
//   setPrice,
//   setQuantity,
//   setCategoryId,
//   resetForm,
// } from '../redux/productFormSlice';
// import { assets } from '../assets/assets';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';

// // أيقونة الحذف (SVG)
// const DeleteIcon = () => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="h-5 w-5 text-red-500"
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M6 18L18 6M6 6l12 12"
//       />
//     </svg>
//   );
// };

// const Add = ({ token }) => {
//   const dispatch = useDispatch();

//   const productForm = useSelector((state) => {
//     return state?.productForm ?? {
//       images: { image: false, image1: false, image2: false, image3: false },
//       name: '',
//       description: '',
//       price: '',
//       quantity: '',
//       categoryId: '',
//     };
//   });

//   const { images, name, description, price, quantity, categoryId } = productForm;

//   const [categories, setCategories] = React.useState([]);
//   const [isLoading, setIsLoading] = React.useState(false);

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`${backendUrl}/api/categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.data.status === 200) {
//         if (!response.data.data) {
//           throw new Error('البنية غير صالحة: بيانات الفئات غير موجودة');
//         }
//         const formattedCategories = response.data.data.map((category) => ({
//           id: category.category_id,
//           name: category.category_name,
//           slugs: category.category_slugs,
//         }));
//         setCategories(formattedCategories);
//       } else {
//         throw new Error(response.data.message || 'فشل في جلب الفئات');
//       }
//     } catch (error) {
//       console.error('خطأ في جلب الفئات:', error); // تسجيل الخطأ
//       console.error('تفاصيل الخطأ:', error.response); // تسجيل تفاصيل إضافية
//       toast.error(error.response?.data?.message || 'فشل في جلب الفئات');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Refresh products
//   const refreshProducts = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.get(`${backendUrl}/api/products?page=1&limit=25`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });
//     } catch (error) {
//       console.error('خطأ في تحديث المنتجات:', error);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // Handle multiple image uploads with a limit of 4
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);

//     if (files.length > 4) {
//       toast.error('لا يمكنك تحديد أكثر من 4 صور!');
//       return;
//     }

//     const imageKeys = ['image', 'image1', 'image2', 'image3'];
//     const newImages = { ...images };

//     files.forEach((file, index) => {
//       newImages[imageKeys[index]] = file;
//     });

//     for (let i = files.length; i < imageKeys.length; i++) {
//       newImages[imageKeys[i]] = false;
//     }

//     dispatch(setImages(newImages));
//   };

//   // Handle image deletion
//   const handleImageDelete = (imageKey) => {
//     dispatch(clearImage(imageKey));
//   };

//   // Handle form submission
//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       if (!images.image) {
//         throw new Error('الصورة الرئيسية مطلوبة');
//       }
//       if (!categoryId) {
//         throw new Error('يرجى اختيار فئة');
//       }
//       const productData = new FormData();
//       productData.append('name', name);
//       productData.append('description', description);
//       productData.append('price', Number(price));
//       productData.append('quantity', Number(quantity));
//       productData.append('category_id', Number(categoryId));
//       if (images.image) productData.append('image', images.image);
//       if (images.image1) productData.append('image1', images.image1);
//       if (images.image2) productData.append('image2', images.image2);
//       if (images.image3) productData.append('image3', images.image3);

//       const response = await axios.post(`${backendUrl}/api/products`, productData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       if (response.data.status === 200) {
//         toast.success(response.data.message);
//         dispatch(resetForm()); // Reset all fields in Redux
//         await refreshProducts();
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       if (error.response?.status === 422) {
//         const validationErrors = error.response.data.errors || {};
//         const errorMessages = Object.values(validationErrors).flat().join(', ');
//         toast.error(errorMessages || 'أخطاء في التحقق');
//       } else {
//         toast.error(error.response?.data?.message || error.message);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Helper function to safely get image source
//   const getImageSrc = (image) => {
//     try {
//       if (image && image instanceof File) {
//         return URL.createObjectURL(image);
//       }
//       return assets.upload_area;
//     } catch (error) {
//       console.error('خطأ في عرض الصورة:', error);
//       return assets.upload_area;
//     }
//   };

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
//       <div>
//         <p className='mb-2'>رفع الصور</p>
//         <div className='flex gap-4 flex-wrap'>
//           <label htmlFor='images' className='flex flex-col items-center'>
//             <img
//               className='w-20 h-20 object-cover'
//               src={assets.upload_area}
//               alt='رفع الصور'
//             />
//             <span className='text-sm text-gray-600 mt-1'>رفع الصور (حتى 4)</span>
//             <input
//               onChange={handleImageChange}
//               type='file'
//               id='images'
//               multiple
//               accept='image/*'
//               hidden
//             />
//           </label>
//           <div className='relative'>
//             <label className='flex flex-col items-center'>
//               <img
//                 className='w-20 h-20 object-cover'
//                 src={getImageSrc(images.image)}
//                 alt='الصورة الرئيسية'
//               />
//               <span className='text-sm text-gray-600 mt-1'>الصورة الرئيسية</span>
//             </label>
//             {images.image && (
//               <button
//                 type='button'
//                 className='absolute top-0 right-0 p-1 bg-white rounded-full'
//                 onClick={() => handleImageDelete('image')}
//               >
//                 <DeleteIcon />
//               </button>
//             )}
//           </div>
//           <div className='relative'>
//             <label className='flex flex-col items-center'>
//               <img
//                 className='w-20 h-20 object-cover'
//                 src={getImageSrc(images.image1)}
//                 alt='الصورة الإضافية 1'
//               />
//               <span className='text-sm text-gray-600 mt-1'>الصورة 1 (اختياري)</span>
//             </label>
//             {images.image1 && (
//               <button
//                 type='button'
//                 className='absolute top-0 right-0 p-1 bg-white rounded-full'
//                 onClick={() => handleImageDelete('image1')}
//               >
//                 <DeleteIcon />
//               </button>
//             )}
//           </div>
//           <div className='relative'>
//             <label className='flex flex-col items-center'>
//               <img
//                 className='w-20 h-20 object-cover'
//                 src={getImageSrc(images.image2)}
//                 alt='الصورة الإضافية 2'
//               />
//               <span className='text-sm text-gray-600 mt-1'>الصورة 2 (اختياري)</span>
//             </label>
//             {images.image2 && (
//               <button
//                 type='button'
//                 className='absolute top-0 right-0 p1 bg-white rounded-full'
//                 onClick={() => handleImageDelete('image2')}
//               >
//                 <DeleteIcon />
//               </button>
//             )}
//           </div>
//           <div className='relative'>
//             <label className='flex flex-col items-center'>
//               <img
//                 className='w-20 h-20 object-cover'
//                 src={getImageSrc(images.image3)}
//                 alt='الصورة الإضافية 3'
//               />
//               <span className='text-sm text-gray-600 mt-1'>الصورة 3 (اختياري)</span>
//             </label>
//             {images.image3 && (
//               <button
//                 type='button'
//                 className='absolute top-0 right-0 p-1 bg-white rounded-full'
//                 onClick={() => handleImageDelete('image3')}
//               >
//                 <DeleteIcon />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>اسم المنتج</p>
//         <input
//           onChange={(e) => dispatch(setName(e.target.value))}
//           value={name}
//           className='w-full max-w-[500px] px-3 py-2'
//           type='text'
//           placeholder='اكتب هنا'
//           required
//         />
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>وصف المنتج</p>
//         <textarea
//           onChange={(e) => dispatch(setDescription(e.target.value))}
//           value={description}
//           className='w-full max-w-[500px] px-3 py-2'
//           placeholder='اكتب الوصف هنا'
//           required
//         />
//       </div>

//       <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
//         <div>
//           <p className='mb-2'>الفئة</p>
//           <select
//             onChange={(e) => dispatch(setCategoryId(e.target.value))}
//             value={categoryId}
//             className='w-full px-3 py-2 border border-gray-300 rounded-md'
//             required
//           >
//             <option value=''>اختر الفئة</option>
//             {categories.length > 0 ? (
//               categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))
//             ) : (
//               <option value='' disabled>جاري تحميل الفئات...</option>
//             )}
//           </select>
//         </div>

//         <div>
//           <p className='mb-2'>سعر المنتج</p>
//           <input
//             onChange={(e) => dispatch(setPrice(e.target.value))}
//             value={price}
//             className='w-full px-3 py-2 sm:w-[120px]'
//             type='number'
//             placeholder='25'
//             required
//           />
//         </div>

//         <div>
//           <p className='mb-2'>الكمية</p>
//           <input
//             onChange={(e) => dispatch(setQuantity(e.target.value))}
//             value={quantity}
//             className='w-full px-3 py-2 sm:w-[120px]'
//             type='number'
//             placeholder='10'
//             required
//           />
//         </div>
//       </div>

//       <button
//         type='submit'
//         className='w-28 py-3 mt-4 bg-black text-white'
//         disabled={isLoading}
//       >
//         {isLoading ? 'جاري الإضافة...' : 'إضافة'}
//       </button>
//     </form>
//   );
// };

// export default Add;

// //? ========= end API ===========
// //? ========= end API ===========

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setImages,
  clearImage,
  setName,
  setDescription,
  setPrice,
  setQuantity,
  setCategoryId,
  resetForm,
} from "../redux/productFormSlice";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

// أيقونة الحذف (SVG)
const DeleteIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

// Spinner صغير
const Spinner = () => (
  <svg className="inline w-4 h-4 ml-2 animate-spin text-gray-500" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Add = ({ token }) => {
  const dispatch = useDispatch();

  const productForm = useSelector((state) => {
    return (
      state?.productForm ?? {
        images: { image: false, image1: false, image2: false, image3: false },
        name: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
      }
    );
  });

  const { images, name, description, price, quantity, categoryId } =
    productForm;

  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [parentCategoryId, setParentCategoryId] = React.useState("");
  const [subCategoryId, setSubCategoryId] = React.useState("");
  const [isCategoriesLoading, setIsCategoriesLoading] = React.useState(false); // لتحميل الكاتيجوري فقط

  // Fetch categories with localStorage cache
  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      setIsLoading(true);
      // جلب من الكاش أولاً
      const cached = localStorage.getItem("categories_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setCategories(parsed);
        } catch {}
      }
      // ثم جلب من السيرفر
      const response = await axios.get(
        `${backendUrl}/api/categories?limit=40`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === 200) {
        let categoriesArray = [];
        if (Array.isArray(response.data.data)) {
          categoriesArray = response.data.data;
        } else if (
          response.data.data &&
          Array.isArray(response.data.data.categories)
        ) {
          categoriesArray = response.data.data.categories;
        } else {
          throw new Error("البنية غير صالحة: بيانات الفئات غير موجودة");
        }
        const formattedCategories = categoriesArray.map((category) => ({
          id: category.category_id,
          name: category.category_name,
          parent: category.parent,
          slugs: category.category_slugs,
        }));
        setCategories(formattedCategories);
        // حفظ في الكاش
        localStorage.setItem("categories_cache", JSON.stringify(formattedCategories));
      } else {
        throw new Error(response.data.message || "فشل في جلب الفئات");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل في جلب الفئات");
    } finally {
      setIsLoading(false);
      setIsCategoriesLoading(false);
    }
  };

  // Refresh products
  const refreshProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${backendUrl}/api/products?page=1&limit=25`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // تصفية الكاتيجوري الرئيسية (الأب)
  const parentCategories = categories.filter((cat) => !cat.parent);
  // تصفية الكاتيجوري الفرعية بناءً على الأب المختار
  const subCategories = categories.filter(
    (cat) => cat.parent && cat.parent.id === Number(parentCategoryId)
  );

  // Handle multiple image uploads with a limit of 4
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 4) {
      toast.error("You cannot select more than 4 images!");
      return;
    }

    const imageKeys = ["image", "image1", "image2", "image3"];
    const newImages = { ...images };

    files.forEach((file, index) => {
      newImages[imageKeys[index]] = file;
    });

    for (let i = files.length; i < imageKeys.length; i++) {
      newImages[imageKeys[i]] = false;
    }

    dispatch(setImages(newImages));
  };

  // Handle image deletion
  const handleImageDelete = (imageKey) => {
    dispatch(clearImage(imageKey));
  };

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!images.image) {
        throw new Error("Main image is required");
      }
      if (!subCategoryId) {
        throw new Error("Please select a subcategory");
      }
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", Number(price));
      productData.append("quantity", Number(quantity));
      productData.append("category_id", Number(subCategoryId));
      if (images.image) productData.append("image", images.image);
      if (images.image1) productData.append("image1", images.image1);
      if (images.image2) productData.append("image2", images.image2);
      if (images.image3) productData.append("image3", images.image3);

      const response = await axios.post(
        `${backendUrl}/api/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(response.data.message || "تمت إضافة المنتج بنجاح");
        dispatch(resetForm());
        await refreshProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        toast.error(errorMessages || "Validation errors");
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely get image source
  const getImageSrc = (image) => {
    try {
      if (image && image instanceof File) {
        return URL.createObjectURL(image);
      }
      return assets.upload_area;
    } catch (error) {
      return assets.upload_area;
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-4 flex-wrap">
          <label htmlFor="images" className="flex flex-col items-center">
            <img
              className="w-20 h-20 object-cover"
              src={assets.upload_area}
              alt="Upload images"
            />
            <span className="text-sm text-gray-600 mt-1">
              Upload Images (up to 4)
            </span>
            <input
              onChange={handleImageChange}
              type="file"
              id="images"
              multiple
              accept="image/*"
              hidden
            />
          </label>
          <div className="relative">
            <label className="flex flex-col items-center">
              <img
                className="w-20 h-20 object-cover"
                src={getImageSrc(images.image)}
                alt="Main image"
              />
              <span className="text-sm text-gray-600 mt-1">Main Image</span>
            </label>
            {images.image && (
              <button
                type="button"
                className="absolute top-0 right-0 p-1 bg-white rounded-full"
                onClick={() => handleImageDelete("image")}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
          <div className="relative">
            <label className="flex flex-col items-center">
              <img
                className="w-20 h-20 object-cover"
                src={getImageSrc(images.image1)}
                alt="Additional image 1"
              />
              <span className="text-sm text-gray-600 mt-1">
                Image 1 (Optional)
              </span>
            </label>
            {images.image1 && (
              <button
                type="button"
                className="absolute top-0 right-0 p-1 bg-white rounded-full"
                onClick={() => handleImageDelete("image1")}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
          <div className="relative">
            <label className="flex flex-col items-center">
              <img
                className="w-20 h-20 object-cover"
                src={getImageSrc(images.image2)}
                alt="Additional image 2"
              />
              <span className="text-sm text-gray-600 mt-1">
                Image 2 (Optional)
              </span>
            </label>
            {images.image2 && (
              <button
                type="button"
                className="absolute top-0 right-0 p-1 bg-white rounded-full"
                onClick={() => handleImageDelete("image2")}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
          <div className="relative">
            <label className="flex flex-col items-center">
              <img
                className="w-20 h-20 object-cover"
                src={getImageSrc(images.image3)}
                alt="Additional image 3"
              />
              <span className="text-sm text-gray-600 mt-1">
                Image 3 (Optional)
              </span>
            </label>
            {images.image3 && (
              <button
                type="button"
                className="absolute top-0 right-0 p-1 bg-white rounded-full"
                onClick={() => handleImageDelete("image3")}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => dispatch(setName(e.target.value))}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => dispatch(setDescription(e.target.value))}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write description here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">الفئة الرئيسية</p>
          <div className="flex items-center">
            <select
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                setSubCategoryId("");
              }}
              value={parentCategoryId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">اختر الفئة الرئيسية</option>
              {parentCategories.length > 0 ? (
                parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  جاري تحميل الفئات...
                </option>
              )}
            </select>
            {isCategoriesLoading && <Spinner />}
          </div>
        </div>

        <div>
          <p className="mb-2">الفئة الفرعية</p>
          <select
            onChange={(e) => setSubCategoryId(e.target.value)}
            value={subCategoryId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            disabled={!parentCategoryId}
          >
            <option value="">
              {parentCategoryId
                ? "اختر الفئة الفرعية"
                : "اختر الفئة الرئيسية أولاً"}
            </option>
            {subCategories.length > 0
              ? subCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              : parentCategoryId && (
                  <option value="" disabled>
                    لا توجد فئات فرعية لهذا الأب. يرجى اختيار فئة رئيسية أخرى.
                  </option>
                )}
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => dispatch(setPrice(e.target.value))}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="25"
            required
          />
        </div>

        <div>
          <p className="mb-2">Quantity</p>
          <input
            onChange={(e) => dispatch(setQuantity(e.target.value))}
            value={quantity}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="10"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-28 py-3 mt-4 bg-black text-white"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add"}
      </button>
    </form>
  );
};

export default Add;
