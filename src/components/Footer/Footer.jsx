import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from 'react-icons/fa';

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">

      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16 py-16">
        <div className="grid gap-4 sm:gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Follow Us
            </h3>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Follow Velora and discover our latest collections,
              trends, and inspirations.
            </p>

            <div className="mt-5 flex gap-4 sm:gap-[30px]">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                <FaInstagram size={14} />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                <FaPinterestP size={14} />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                <FaYoutube size={14} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>123 Fashion Street</li>
              <li>New York, NY 10001</li>
              <li>+1 234 567 890</li>
              <li>hello@velora.com</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              About
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Customer Care
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Our Information
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Payment Methods
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Top Categories
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Women
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Men
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Shoes
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-gray-900">
                  Accessories
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16 flex flex-col items-center justify-between gap-4 sm:gap-[30px] px-6 py-6 text-sm text-gray-500 md:flex-row">

          <p>
            © 2026 Velora. All rights reserved.
          </p>

          <div className="flex items-center gap-4 sm:gap-[30px]">
            <span>We Accept</span>

            <div className="flex items-center">
              <span className="border border-gray-200 px-3 py-1 text-xs font-medium">
                VISA
              </span>

              <span className="border border-gray-200 px-3 py-1 text-xs font-medium">
                MC
              </span>

              <span className="border border-gray-200 px-3 py-1 text-xs font-medium">
                AMEX
              </span>

              <span className="border border-gray-200 px-3 py-1 text-xs font-medium">
                PayPal
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
