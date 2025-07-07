// import React, { useEffect, useState, useMemo } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { backendUrl } from '../App';

// const Orders = ({ token }) => {
//   const [orders, setOrders] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('date');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [expandedAccounts, setExpandedAccounts] = useState({});
//   const accountsPerPage = 10;

//   // جلب جميع الأوردرات من الـ API عبر الصفحات
//   const fetchAllOrders = async () => {
//     if (!token) {
//       toast.error('يرجى تسجيل الدخول كمسؤول لعرض الأوردرات');
//       return;
//     }

//     let allOrders = [];
//     let page = 1;
//     let hasMoreOrders = true;

//     try {
//       while (hasMoreOrders) {
//         const response = await axios.get(`${backendUrl}/api/order?page=${page}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log(`استجابة الـ API للصفحة ${page}:`, response.data);

//         if (response.data.status === 200) {
//           // التعامل مع البيانات مباشرة من response.data.data إذا كانت مصفوفة
//           const newOrders = Array.isArray(response.data.data)
//             ? response.data.data.map((order) => {
//               console.log('بيانات الأوردر:', order);
//               return {
//                 _id: order.order_id.toString(),
//                 items: order.order_item.map((item) => ({
//                   name: item.product_name || 'غير معروف',
//                   quantity: item.quantity || 1,
//                   price: item.total_price && item.quantity ? item.total_price / item.quantity : 0,
//                 })),
//                 address: {
//                   firstName: order.user_first_name || '',
//                   lastName: order.user_last_name || '',
//                   street: order.address || '',
//                   city: order.city || '',
//                   state: order.governorate || '',
//                   country: order.country || '',
//                   zipcode: order.postal_code || '',
//                   phone: order.phone || '',
//                 },
//                 email: order.email || 'غير متوفر',
//                 paymentMethod: order.payment_method || 'Unknown',
//                 payment: order.payment_status || false,
//                 date: order.order_date === '2 weeks'
//                   ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
//                   : order.order_date || new Date().toISOString().split('T')[0],
//                 amount: order.order_item.reduce((acc, item) => acc + (item.total_price || 0), 0),
//                 status: order.order_status
//                   ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)
//                   : 'Pending',
//               };
//             })
//             : [];

//           allOrders = [...allOrders, ...newOrders];

//           // إذا كانت الصفحة تحتوي على أوردرات أقل من الحد الأقصى (افتراضًا 10)، فهذه هي الصفحة الأخيرة
//           if (newOrders.length === 0 || newOrders.length < 10) {
//             hasMoreOrders = false;
//           } else {
//             page += 1;
//           }
//         } else {
//           throw new Error(response.data.message || 'فشل في جلب الأوردرات');
//         }
//       }

//       console.log('جميع الأوردرات المحولة:', allOrders);
//       setOrders(allOrders);

//       if (allOrders.length === 0) {
//         toast.info('لا توجد أوردرات متاحة');
//       }
//     } catch (error) {
//       console.error('خطأ في جلب الأوردرات:', error, error.response);
//       if (error.response?.status === 401) {
//         toast.error('انتهت جلسة الدخول، يرجى تسجيل الدخول مرة أخرى');
//         localStorage.removeItem('token');
//         window.location.href = '/login';
//       } else {
//         toast.error(`فشل في جلب الأوردرات: ${error.response?.data?.message || error.message}`);
//       }
//     }
//   };

//   // تحديث حالة الأوردر
//   const statusHandler = async (event, orderId) => {
//     const newStatus = event.target.value;
//     try {
//       const updatedOrders = orders.map((order) =>
//         order._id === orderId ? { ...order, status: newStatus } : order
//       );
//       setOrders(updatedOrders);

//       let formattedStatus;
//       switch (newStatus) {
//         case 'Pending':
//           formattedStatus = 'pending';
//           break;
//         case 'Packing':
//           formattedStatus = 'packing';
//           break;
//         case 'Shipped':
//           formattedStatus = 'shipped';
//           break;
//         case 'Out for delivery':
//           formattedStatus = 'out for delivery';
//           break;
//         case 'Delivered':
//           formattedStatus = 'delivered';
//           break;
//         default:
//           formattedStatus = newStatus.toLowerCase();
//       }

//       const response = await axios.put(
//         `${backendUrl}/api/order/${orderId}?_method=PUT`,
//         { status: formattedStatus },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.data.status === 200) {
//         toast.success('تم تحديث الحالة بنجاح!');
//       } else {
//         throw new Error(response.data.message || 'فشل في تحديث الحالة');
//       }
//     } catch (error) {
//       console.error('خطأ في تحديث الحالة:', error.response?.data || error.message);
//       toast.error(`فشل في تحديث الحالة: ${error.response?.data?.message || 'خطأ في التحقق'}`);
//       const revertedOrders = orders.map((order) =>
//         order._id === orderId ? { ...order, status: order.status } : order
//       );
//       setOrders(revertedOrders);
//     }
//   };

//   // تجميع الأوردرات حسب الإيميل
//   const groupOrdersByAccount = (ordersToGroup) => {
//     const grouped = {};
//     ordersToGroup.forEach((order) => {
//       const accountEmail = order.email;
//       if (!grouped[accountEmail]) {
//         grouped[accountEmail] = [];
//       }
//       grouped[accountEmail].push(order);
//     });
//     return grouped;
//   };

//   // تصفية وترتيب الأوردرات
//   const filteredAndSortedOrders = useMemo(() => {
//     let filteredOrders = [...orders];

//     if (searchTerm) {
//       filteredOrders = filteredOrders.filter((order) =>
//         order.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (sortBy === 'date') {
//       filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
//     } else if (sortBy === 'status') {
//       filteredOrders.sort((a, b) => a.status.localeCompare(b.status));
//     } else if (sortBy === 'amount') {
//       filteredOrders.sort((a, b) => b.amount - a.amount);
//     }

//     console.log('الأوردرات بعد التصفية والترتيب:', filteredOrders);
//     return filteredOrders;
//   }, [orders, searchTerm, sortBy]);

//   // تقسيم الحسابات إلى صفحات
//   const paginateAccounts = (groupedOrders) => {
//     const accountEmails = Object.keys(groupedOrders);
//     const startIndex = (currentPage - 1) * accountsPerPage;
//     const endIndex = startIndex + accountsPerPage;
//     const paginatedAccountEmails = accountEmails.slice(startIndex, endIndex);
//     const paginatedOrders = {};
//     paginatedAccountEmails.forEach((email) => {
//       paginatedOrders[email] = groupedOrders[email];
//     });
//     console.log('الأوردرات المقسمة للصفحة:', paginatedOrders);
//     return paginatedOrders;
//   };

//   // تبديل عرض الحسابات
//   const toggleAccount = (accountEmail) => {
//     setExpandedAccounts((prev) => ({
//       ...prev,
//       [accountEmail]: !prev[accountEmail],
//     }));
//   };

//   useEffect(() => {
//     fetchAllOrders();
//   }, [token]);

//   const groupedOrders = groupOrdersByAccount(filteredAndSortedOrders);
//   const paginatedOrders = paginateAccounts(groupedOrders);
//   const totalPages = Math.ceil(Object.keys(groupedOrders).length / accountsPerPage);

//   return (
//     <div className="p-4">
//       <h3 className="text-xl font-semibold mb-4">صفحة الأوردرات</h3>
//       <div className="mb-6 flex flex-col sm:flex-row gap-4">
//         <input
//           type="text"
//           placeholder="البحث بالإيميل..."
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="p-2 border rounded w-full sm:w-1/3"
//         />
//         <select
//           value={sortBy}
//           onChange={(e) => {
//             setSortBy(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="p-2 border rounded"
//         >
//           <option value="date">ترتيب حسب التاريخ (الأحدث أولاً)</option>
//           <option value="status">ترتيب حسب الحالة</option>
//           <option value="amount">ترتيب حسب المبلغ (الأعلى أولاً)</option>
//         </select>
//       </div>
//       <div className="order-list transition-opacity duration-300">
//         {orders.length === 0 ? (
//           <p className="text-gray-500">لا توجد أوردرات متاحة.</p>
//         ) : Object.keys(paginatedOrders).length > 0 ? (
//           Object.keys(paginatedOrders).map((accountEmail) => (
//             <div key={accountEmail} className="mb-4 border-b-2 pb-4">
//               <div
//                 className="flex items-center cursor-pointer"
//                 onClick={() => toggleAccount(accountEmail)}
//               >
//                 <span className="mr-2 text-lg">
//                   {expandedAccounts[accountEmail] ? '▼' : '▶'}
//                 </span>
//                 <h4 className="font-bold text-lg">{accountEmail}</h4>
//               </div>
//               {expandedAccounts[accountEmail] && (
//                 <div className="mt-3">
//                   {paginatedOrders[accountEmail].map((order, index) => (
//                     <div
//                       className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
//                       key={index}
//                     >
//                       <div>
//                         <div>
//                           {order.items.map((item, idx) => (
//                             <p className="py-0.5" key={idx}>
//                               {item.name} x {item.quantity}
//                             </p>
//                           ))}
//                         </div>
//                         <p className="mt-3 mb-2 font-medium">
//                           {order.address.firstName + ' ' + order.address.lastName}
//                         </p>
//                         <div>
//                           <p>{order.address.street + ','}</p>
//                           <p>
//                             {order.address.city +
//                               ', ' +
//                               order.address.state +
//                               ', ' +
//                               order.address.country +
//                               ', ' +
//                               order.address.zipcode}
//                           </p>
//                           <p>{order.address.phone}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-sm sm:text-[15px]">عدد العناصر: {order.items.length}</p>
//                         <p className="mt-3">طريقة الدفع: {order.paymentMethod}</p>
//                         <p>الدفع: {order.payment ? 'تم' : 'معلق'}</p>
//                         <p>التاريخ: {isNaN(new Date(order.date).getTime()) ? order.date : new Date(order.date).toLocaleDateString()}</p>
//                       </div>
//                       <p className="text-sm sm:text-[15px]">{order.amount} جنيه مصري</p>
//                       <select
//                         onChange={(event) => statusHandler(event, order._id)}
//                         value={order.status}
//                         className="p-2 font-semibold border rounded"
//                       >
//                         <option value="Pending">معلق</option>
//                         <option value="Packing">التعبئة</option>
//                         <option value="Shipped">تم الشحن</option>
//                         <option value="Out for delivery">في الطريق</option>
//                         <option value="Delivered">تم التوصيل</option>
//                       </select>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500">لا توجد حسابات مطابقة لمعاييرك.</p>
//         )}
//       </div>
//       {totalPages > 1 && (
//         <div className="mt-6 flex justify-center gap-2">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             السابق
//           </button>
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => setCurrentPage(page)}
//               className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
//                 }`}
//             >
//               {page}
//             </button>
//           ))}
//           <button
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             التالي
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;
















import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const accountsPerPage = 10;

  // جلب جميع الأوردرات من الـ API عبر الصفحات
  const fetchAllOrders = async () => {
    if (!token) {
      toast.error('Please log in as an admin to view orders');
      return;
    }

    let allOrders = [];
    let page = 1;
    let hasMoreOrders = true;

    try {
      while (hasMoreOrders) {
        const response = await axios.get(`${backendUrl}/api/order?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 200) {
          const newOrders = Array.isArray(response.data.data)
            ? response.data.data.map((order) => {
              return {
                _id: order.order_id.toString(),
                items: order.order_item.map((item) => ({
                  name: item.product_name || 'Unknown',
                  quantity: item.quantity || 1,
                  price: item.total_price && item.quantity ? item.total_price / item.quantity : 0,
                })),
                address: {
                  firstName: order.user_first_name || '',
                  lastName: order.user_last_name || '',
                  street: order.address || '',
                  city: order.city || '',
                  state: order.governorate || '',
                  country: order.country || '',
                  zipcode: order.postal_code || '',
                  phone: order.phone || '',
                },
                email: order.email || 'Not available',
                paymentMethod: order.payment_method || 'Unknown',
                payment: order.payment_status || false,
                date: order.order_date === '2 weeks'
                  ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
                  : order.order_date || new Date().toISOString().split('T')[0],
                amount: order.order_item.reduce((acc, item) => acc + (item.total_price || 0), 0),
                status: order.order_status
                  ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)
                  : 'Pending',
              };
            })
            : [];

          allOrders = [...allOrders, ...newOrders];

          if (newOrders.length === 0 || newOrders.length < 10) {
            hasMoreOrders = false;
          } else {
            page += 1;
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch orders');
        }
      }

      setOrders(allOrders);

      if (allOrders.length === 0) {
        toast.info('No orders available');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired, please log in again');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(`Failed to fetch orders: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // تحديث حالة الأوردر
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);

      let formattedStatus;
      switch (newStatus) {
        case 'Pending':
          formattedStatus = 'pending';
          break;
        case 'Packing':
          formattedStatus = 'packing';
          break;
        case 'Shipped':
          formattedStatus = 'shipped';
          break;
        case 'Out for delivery':
          formattedStatus = 'out for delivery';
          break;
        case 'Delivered':
          formattedStatus = 'delivered';
          break;
        default:
          formattedStatus = newStatus.toLowerCase();
      }

      const response = await axios.put(
        `${backendUrl}/api/order/${orderId}?_method=PUT`,
        { status: formattedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 200) {
        toast.success('Status updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(`Failed to update status: ${error.response?.data?.message || 'Validation error'}`);
      const revertedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: order.status } : order
      );
      setOrders(revertedOrders);
    }
  };

  // تجميع الأوردرات حسب الإيميل
  const groupOrdersByAccount = (ordersToGroup) => {
    const grouped = {};
    ordersToGroup.forEach((order) => {
      const accountEmail = order.email;
      if (!grouped[accountEmail]) {
        grouped[accountEmail] = [];
      }
      grouped[accountEmail].push(order);
    });
    return grouped;
  };

  // تصفية وترتيب الأوردرات
  const filteredAndSortedOrders = useMemo(() => {
    let filteredOrders = [...orders];

    if (searchTerm) {
      filteredOrders = filteredOrders.filter((order) =>
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'date') {
      filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'status') {
      filteredOrders.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === 'amount') {
      filteredOrders.sort((a, b) => b.amount - a.amount);
    }

    return filteredOrders;
  }, [orders, searchTerm, sortBy]);

  // تقسيم الحسابات إلى صفحات
  const paginateAccounts = (groupedOrders) => {
    const accountEmails = Object.keys(groupedOrders);
    const startIndex = (currentPage - 1) * accountsPerPage;
    const endIndex = startIndex + accountsPerPage;
    const paginatedAccountEmails = accountEmails.slice(startIndex, endIndex);
    const paginatedOrders = {};
    paginatedAccountEmails.forEach((email) => {
      paginatedOrders[email] = groupedOrders[email];
    });
    return paginatedOrders;
  };

  // تبديل عرض الحسابات
  const toggleAccount = (accountEmail) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accountEmail]: !prev[accountEmail],
    }));
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const groupedOrders = groupOrdersByAccount(filteredAndSortedOrders);
  const paginatedOrders = paginateAccounts(groupedOrders);
  const totalPages = Math.ceil(Object.keys(groupedOrders).length / accountsPerPage);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Orders Page</h3>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded w-full sm:w-1/3"
        />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded"
        >
          <option value="date">Sort by Date (Newest First)</option>
          <option value="status">Sort by Status</option>
          <option value="amount">Sort by Amount (Highest First)</option>
        </select>
      </div>
      <div className="order-list transition-opacity duration-300">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders available.</p>
        ) : Object.keys(paginatedOrders).length > 0 ? (
          Object.keys(paginatedOrders).map((accountEmail) => (
            <div key={accountEmail} className="mb-4 border-b-2 pb-4">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleAccount(accountEmail)}
              >
                <span className="mr-2 text-lg">
                  {expandedAccounts[accountEmail] ? '▼' : '▶'}
                </span>
                <h4 className="font-bold text-lg">{accountEmail}</h4>
              </div>
              {expandedAccounts[accountEmail] && (
                <div className="mt-3">
                  {paginatedOrders[accountEmail].map((order, index) => (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
                      key={index}
                    >
                      <div>
                        <div>
                          {order.items.map((item, idx) => (
                            <p className="py-0.5" key={idx}>
                              {item.name} x {item.quantity}
                            </p>
                          ))}
                        </div>
                        <p className="mt-3 mb-2 font-medium">
                          {order.address.firstName + ' ' + order.address.lastName}
                        </p>
                        <div>
                          <p>{order.address.street + ','}</p>
                          <p>
                            {order.address.city +
                              ', ' +
                              order.address.state +
                              ', ' +
                              order.address.country +
                              ', ' +
                              order.address.zipcode}
                          </p>
                          <p>{order.address.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm sm:text-[15px]">Number of Items: {order.items.length}</p>
                        <p className="mt-3">Payment Method: {order.paymentMethod}</p>
                        <p>Payment: {order.payment ? 'Completed' : 'Pending'}</p>
                        <p>Date: {isNaN(new Date(order.date).getTime()) ? order.date : new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm sm:text-[15px]">{order.amount} EGP</p>
                      <select
                        onChange={(event) => statusHandler(event, order._id)}
                        value={order.status}
                        className="p-2 font-semibold border rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No accounts match your criteria.</p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
