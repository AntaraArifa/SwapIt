"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import FilterSidebar from "./FilterSidebar"
import TeacherCard from "./TeacherCard"
import SkillCategories from "./SkillCategories"
import { mockTeachers, skillCategories } from "../data/mockData"

const SkillsDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filters, setFilters] = useState({
    location: "",
    minRating: 0,
    maxPrice: 1000,
    availability: "any",
  })
  const [filteredTeachers, setFilteredTeachers] = useState(mockTeachers)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = mockTeachers

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
          teacher.bio.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((teacher) => teacher.category === selectedCategory)
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((teacher) => teacher.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((teacher) => teacher.rating >= filters.minRating)
    }

    // Filter by price
    filtered = filtered.filter((teacher) => teacher.hourlyRate <= filters.maxPrice)

    // Filter by availability
    if (filters.availability !== "any") {
      filtered = filtered.filter((teacher) => teacher.availability === filters.availability)
    }

    setFilteredTeachers(filtered)
  }, [searchQuery, selectedCategory, filters])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Teacher</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with skilled teachers for personalized one-on-one learning sessions. Learn at your own pace with real
          people who care about your growth.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search for skills, teachers, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Skill Categories */}
      <SkillCategories
        categories={skillCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <div className="hidden lg:block w-80">
          <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
                <FilterSidebar filters={filters} onFiltersChange={setFilters} />
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{filteredTeachers.length} Teachers Found</h2>
              {selectedCategory !== "all" && (
                <p className="text-gray-600">in {skillCategories.find((cat) => cat.id === selectedCategory)?.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500">
                <option>Rating (High to Low)</option>
                <option>Price (Low to High)</option>
                <option>Price (High to Low)</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>

          {/* No Results */}
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No teachers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillsDiscovery
