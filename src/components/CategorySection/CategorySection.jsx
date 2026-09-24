import { Link } from 'react-router-dom';

function CategorySection() {
  const categories = [
    {
      id: 1,
      name: 'Men',
      image:
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc',
      link: '/shop?category=men',
    },
    {
      id: 2,
      name: 'Women',    
      image:
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
      link: '/shop?category=women',
    },
    {
      id: 3,
      name: 'Shoes',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      link: '/shop?category=shoes',
    },
    {
      id: 4,
      name: 'Accessories',
      image:
        'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561',
      link: '/shop?category=accessories',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
            Explore
          </p>

          <h2 className="text-3xl font-semibold md:text-4xl">
            Shop By Category
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />

              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-xl font-medium text-white md:text-2xl">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;