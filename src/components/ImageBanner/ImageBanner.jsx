import { Link } from 'react-router-dom';

function ImageBanner() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16 py-20">
        <div className="relative h-[420px] overflow-hidden sm:h-[500px] lg:h-[600px]">
            <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
                alt="Discover the new collection"
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
                <div>
                <p className="text-sm uppercase tracking-[0.3em]">
                    The New Collection
                </p>

                <h2 className="mt-4 text-3xl font-bold sm:text-4xl md:text-6xl">
                    Effortless Style
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm text-white/90 md:text-base">
                    Discover timeless pieces designed for your everyday wardrobe.
                </p>

                <Link
                    to="/shop"
                    className="mt-8 inline-block bg-white px-8 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                    Shop Collection
                </Link>
                </div>
            </div>
        </div>
    </section>
  );
}

export default ImageBanner;
