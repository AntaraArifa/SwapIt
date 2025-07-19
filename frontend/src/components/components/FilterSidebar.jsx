"use client"
import { MapPin, DollarSign, Star, Clock } from "lucide-react"

const FilterSidebar = ({ filters, onFiltersChange }) => {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
          <MapPin className="h-4 w-4" />
          Location
        </h3>
        <input
          type="text"
          placeholder="Enter city or country"
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
          <DollarSign className="h-4 w-4" />
          Price Range
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Up to ${filters.maxPrice}/hour</label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", Number.parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>$5</span>
            <span>$200+</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
          <Star className="h-4 w-4" />
          Minimum Rating
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1, 0].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.minRating === rating}
                onChange={() => updateFilter("minRating", rating)}
                className="text-blue-600"
              />
              <span className="flex items-center gap-1 text-sm">
                {rating > 0 ? (
                  <>
                    {rating}+ <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </>
                ) : (
                  "Any rating"
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
          <Clock className="h-4 w-4" />
          Availability
        </h3>
        <div className="space-y-2">
          {[
            { value: "any", label: "Any time" },
            { value: "available", label: "Available now" },
            { value: "today", label: "Available today" },
            { value: "week", label: "Available this week" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={filters.availability === option.value}
                onChange={() => updateFilter("availability", option.value)}
                className="text-blue-600"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar
