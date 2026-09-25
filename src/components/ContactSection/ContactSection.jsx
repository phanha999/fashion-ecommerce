import { Link } from 'react-router-dom';

function ContactSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Need Help?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
          Our support team is always here to help you with your
          orders, products, and any questions you may have.
        </p>

        <div className="mx-auto mt-8 h-[280px] max-w-4xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72"
            alt="Customer support team"
            className="h-full w-full object-cover"
          />
        </div>

        <Link
          to="/contact"
          className="mt-8 inline-block bg-gray-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}

export default ContactSection;