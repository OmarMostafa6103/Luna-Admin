// import React from 'react';
// import { assets } from '../assets/assets';
// import { useNavigate } from 'react-router-dom'; // استيراد useNavigate للتوجيه

// const Navbar = ({ setToken }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     setToken(''); // تعيين التوكن إلى قيمة فارغة
//     localStorage.removeItem('token'); // إزالة التوكن من localStorage
//     navigate('/login', { replace: true }); // التوجيه إلى صفحة تسجيل الدخول
//   };

//   return (
//     <div className='flex items-center py-2 px-[4%] justify-between'>
//       <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
//       <button
//         onClick={handleLogout}
//         className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default Navbar;














import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // استيراد useNavigate و Link للتوجيه

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(''); // تعيين التوكن إلى قيمة فارغة
    localStorage.removeItem('token'); // إزالة التوكن من localStorage
    navigate('/login', { replace: true }); // التوجيه إلى صفحة تسجيل الدخول
  };

  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
      <Link to="/">
        <h1 className="text-2xl font-bold">
          Luna<span className="text-sm">Helthy</span>
        </h1>
      </Link>
      <button
        onClick={handleLogout}
        className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;