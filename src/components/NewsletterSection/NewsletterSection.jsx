function NewsletterSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Stay Updated
        </p>

        <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
          Subscribe to Our Newsletter
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
          Subscribe to receive the latest collections, exclusive offers,
          and fashion inspiration from Velora.
        </p>

        <form className="mx-auto mt-8 flex max-w-xl flex-col sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email address"
            className="min-w-0 flex-1 border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
          />

          <button
            type="submit"
            className="shrink-0 bg-gray-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
