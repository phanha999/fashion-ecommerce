import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-20 w-full max-w-[1800px] items-center justify-between px-6">

        <Link
          to="/"
          className="text-2xl font-bold tracking-[0.2em] text-gray-900"
        >
          VELORA
        </Link>

        <nav className="hidden items-center md:flex">
          <Link
            to="/"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Home
          </Link>  
     
          <Link
            to="/shop"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Shop
          </Link> 
 
          <Link
            to="/shop?category=men"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Men
          </Link>

          <Link
            to="/shop?category=women"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Women
          </Link>

          <Link
            to="/shop?category=shoes"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Shoes
          </Link>
        </nav>

        <div className="flex items-center">
          <button
            type="button"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Search
          </button>

          <Link
            to="/account"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Account
          </Link>

          <Link
            to="/cart"
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold xl:text-base text-heading xl:px-4 hover:text-[#FF5722] duration-500"
          >
            Cart
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Header;