type CategoriesScrollProps = {
  categories: string[];
};

export const CategoriesScroll = ({ categories }: CategoriesScrollProps) => {
  // remove duplicates if they exist
  categories = [...new Set(categories)];

  return (
    <div className="flex-cols flex h-fit w-fit justify-around gap-x-2 overflow-x-scroll">
      {categories.map((category) => (
        <div
          key={category}
          className="w-fit rounded-full bg-[#f6f5ff] px-4 py-1 text-xs text-[#adabd2]"
        >
          {category}
        </div>
      ))}
    </div>
  );
};
