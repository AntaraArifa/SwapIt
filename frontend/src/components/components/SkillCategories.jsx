"use client"

const SkillCategories = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Browse by Tags</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategorySelect("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          All Skills
        </button>
        {categories.map((category) => (
          <button
            key={category.tag}
            onClick={() => onCategorySelect(category.tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category.tag
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{category.tag}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              selectedCategory === category.tag
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SkillCategories
