import { Link } from 'react-router-dom';

function AppBanner() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="relative overflow-hidden bg-gray-100">
        <div className="grid lg:min-h-[700px] lg:grid-cols-2">
          
          <div className="relative min-h-[350px] overflow-hidden lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
              alt="Velora mobile app"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="flex items-center px-8 py-12 md:px-14 lg:px-16">
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                Velora App
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Fashion at Your Fingertips
              </h2>

              <p className="mt-5 text-sm leading-6 text-gray-600 md:text-base">
                Discover new collections, exclusive offers and
                effortless shopping wherever you go.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  to="#"
                  className="flex items-center gap-2 bg-black px-5 py-3 text-white transition hover:bg-gray-800"
                >
                  <span className="text-xl"></span>

                  <span className="text-left">
                    <span className="block text-[10px] uppercase text-gray-400">
                      Download on the
                    </span>

                    <span className="block text-sm font-medium">
                      App Store
                    </span>
                  </span>
                </Link>

                <Link
                  to="#"
                  className="flex items-center gap-2 bg-black px-5 py-3 text-white transition hover:bg-gray-800"
                >
                  <span className="text-xl">▶</span>

                  <span className="text-left">
                    <span className="block text-[10px] uppercase text-gray-400">
                      Get it on
                    </span>

                    <span className="block text-sm font-medium">
                      Google Play
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AppBanner;
