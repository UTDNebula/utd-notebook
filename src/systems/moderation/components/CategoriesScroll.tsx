

type CategoriesScrollProps = {
    categories: string[],
};

export const CategoriesScroll = ({ categories }: CategoriesScrollProps) => {
    // remove duplicates if they exist
    categories = [...new Set(categories)];

    return (
        <div className="flex flex-cols gap-x-2 justify-around h-fit w-fit overflow-x-scroll">
            {categories.map((category) =>
                <div key={category} className="rounded-full w-fit px-4 py-1 bg-blue-100 text-blue-500 text-xs">
                    {category}
                </div>
            )}
        </div>
    );
};
