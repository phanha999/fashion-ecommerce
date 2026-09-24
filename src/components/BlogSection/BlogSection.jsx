import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const blogs = [
  {
    id: 1,
    title: 'How to Build a Timeless Wardrobe',
    description:
      'Discover the essential pieces every modern wardrobe should have.',
    category: 'Fashion',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
  },
  {
    id: 2,
    title: '5 Easy Ways to Elevate Your Everyday Style',
    description:
      'Simple styling tips to make your everyday outfits look better.',
    category: 'Style Guide',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  },
  {
    id: 3,
    title: 'The Latest Trends You Need to Know',
    description:
      'Explore the latest fashion trends and find your next favorite look.',
    category: 'Trends',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050',
  },
  {
    id: 4,
    title: 'How to Style Your Favorite Pieces',
    description:
      'Easy ideas to create stylish outfits from pieces you already own.',
    category: 'Style Guide',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
  },
  {
    id: 5,
    title: 'The Art of Minimal Fashion',
    description:
      'Learn how to create a clean and effortless wardrobe.',
    category: 'Fashion',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  },
];

function BlogSection() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">

      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          From Our Blog
        </p>

        <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
          Latest Articles
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
          Discover fashion tips, styling inspiration, and the latest
          trends from Velora.
        </p>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
        >
          {blogs.map((blog) => (
            <SwiperSlide key={blog.id}>
              <article className="group pb-10">
                <Link to={`/blog/${blog.id}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="pt-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      {blog.category}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-gray-900">
                      {blog.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {blog.description}
                    </p>

                    <span className="mt-4 inline-block text-sm font-medium text-gray-900 underline underline-offset-4">
                      Read More
                    </span>
                  </div>
                </Link>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default BlogSection;
