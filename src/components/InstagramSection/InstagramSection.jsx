const images = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  },
  {
    id: 5,
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
  },
  {
    id: 6,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  },
];

function InstagramSection() {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {images.map((item) => (
          <a
            key={item.id}
            href="#"
            className="group relative aspect-square overflow-hidden"
          >
            <img
              src={item.image}
              alt="Velora Instagram"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/30">
              <span className="text-2xl text-white opacity-0 transition group-hover:opacity-100">
                ♡
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default InstagramSection;
