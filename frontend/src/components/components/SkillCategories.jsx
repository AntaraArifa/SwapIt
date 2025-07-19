"use client"

const SkillCategories = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Browse by Category</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategorySelect("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category.id
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SkillCategories
