import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 sm:gap-[30px] px-4 py-3 md:h-20 md:flex-nowrap md:px-8 md:py-0 2xl:px-16">

        <Link
          to="/"
          className="text-2xl font-bold tracking-[0.2em] text-gray-900"
        >
          VELORA
        </Link>

        <nav className="order-3 flex w-full items-center justify-start gap-4 overflow-x-auto sm:justify-center sm:gap-[30px] md:order-none md:w-auto">
          <Link
            to="/"
            className="relative inline-flex shrink-0 items-center py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:text-sm xl:text-base"
          >
            Home
          </Link>  
     
          <Link
            to="/shop"
            className="relative inline-flex shrink-0 items-center py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:text-sm xl:text-base"
          >
            Shop
          </Link> 
 
          <Link
            to="/shop?category=men"
            className="relative inline-flex shrink-0 items-center py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:text-sm xl:text-base"
          >
            Men
          </Link>

          <Link
            to="/shop?category=women"
            className="relative inline-flex shrink-0 items-center py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:text-sm xl:text-base"
          >
            Women
          </Link>

          <Link
            to="/shop?category=shoes"
            className="relative inline-flex shrink-0 items-center py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:text-sm xl:text-base"
          >
            Shoes
          </Link>
        </nav>

        <div className="flex items-center">
          <button
            type="button"
            aria-label="Search"
            className="relative inline-flex items-center px-1.5 py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:px-2 sm:text-sm xl:px-4 xl:text-base"
          >
            <svg className="svg-search" focusable="false" width="18" height="18" viewBox="0 0 18 18">
              <path d="M12.336 12.336c2.634-2.635 2.682-6.859.106-9.435-2.576-2.576-6.8-2.528-9.435.106C.373 5.642.325 9.866 2.901 12.442c2.576 2.576 6.8 2.528 9.435-.106zm0 0L17 17" fill="none" stroke="currentColor" strokeWidth="1.8"></path>
            </svg>
          </button>

          <Link
            to="/account"
            aria-label="Account"
            className="relative inline-flex items-center px-1.5 py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:px-2 sm:text-sm xl:px-4 xl:text-base"
          >
            <svg focusable="false" width="18" height="17" className="svg-user" viewBox="0 0 18 17">
              <circle cx="9" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"></circle>
              <path d="M1 17v0a4 4 0 014-4h8a4 4 0 014 4v0" fill="none" stroke="currentColor" strokeWidth="1.8"></path>
            </svg>
          </Link>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex items-center px-1.5 py-2 text-xs font-semibold text-heading duration-500 hover:text-[#FF5722] sm:px-2 sm:text-sm xl:px-4 xl:text-base"
          >
            <svg focusable="false" width="20" height="18" className="svg-cart" viewBox="0 0 20 18">
              <path d="M3 1h14l1 16H2L3 1z" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <path d="M7 4v0a3 3 0 003 3v0a3 3 0 003-3v0" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Header;
