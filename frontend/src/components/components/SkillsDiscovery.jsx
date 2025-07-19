"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import FilterSidebar from "./FilterSidebar"
import SkillCard from "./SkillCard"
import SkillCategories from "./SkillCategories"
import { skillCategories } from "../data/mockData"
import { buildApiUrl, API_ENDPOINTS } from "../../config/api"

const SkillsDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating-desc")
  const [filters, setFilters] = useState({
    location: "",
    minRating: 0,
    maxPrice: 1000,
    proficiency: "any",
  })
  const [allSkills, setAllSkills] = useState([])
  const [filteredSkills, setFilteredSkills] = useState([])
  const [skillTags, setSkillTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch skills and tags from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get token from cookies
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };
        
        const token = getCookie('token');
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const fetchOptions = {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        }

        // Fetch both skills and tags in parallel
        const [skillsResponse, tagsResponse] = await Promise.all([
          fetch(buildApiUrl(API_ENDPOINTS.LISTINGS.ALL), fetchOptions),
          fetch(buildApiUrl(API_ENDPOINTS.LISTINGS.TAGS), fetchOptions)
        ])
        
        if (!skillsResponse.ok) {
          if (skillsResponse.status === 401) {
            throw new Error('Authentication required. Please sign in to view skills.')
          }
          throw new Error('Failed to fetch skills')
        }

        if (!tagsResponse.ok) {
          throw new Error('Failed to fetch tags')
        }
        
        const [skillsData, tagsData] = await Promise.all([
          skillsResponse.json(),
          tagsResponse.json()
        ])
        
        if (skillsData.success) {
          setAllSkills(skillsData.listings)
          setFilteredSkills(skillsData.listings)
        } else {
          throw new Error(skillsData.message || 'Failed to fetch skills')
        }

        if (tagsData.success) {
          setSkillTags(tagsData.tags)
        } else {
          throw new Error(tagsData.message || 'Failed to fetch tags')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort skills
  useEffect(() => {
    let filtered = allSkills

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (skill) =>
          skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.skillID.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.teacherID.fullname.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category (now using tags)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((skill) => 
        skill.skillID.tags && skill.skillID.tags.some(tag => 
          tag.toLowerCase() === selectedCategory.toLowerCase()
        )
      )
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((skill) => skill.avgRating >= filters.minRating)
    }

    // Filter by price
    filtered = filtered.filter((skill) => skill.fee <= filters.maxPrice)

    // Filter by proficiency
    if (filters.proficiency !== "any") {
      filtered = filtered.filter((skill) => skill.proficiency.toLowerCase() === filters.proficiency.toLowerCase())
    }

    // Sort the results
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return b.avgRating - a.avgRating
        case "rating-asc":
          return a.avgRating - b.avgRating
        case "price-asc":
          return a.fee - b.fee
        case "price-desc":
          return b.fee - a.fee
        case "newest":
          // Since we don't have dates, we'll use _id as a proxy for newest
          return b._id.localeCompare(a._id)
        case "popular":
          // For popularity, we'll use rating as a proxy
          return b.avgRating - a.avgRating
        default:
          return 0
      }
    })

    setFilteredSkills(filtered)
  }, [allSkills, searchQuery, selectedCategory, filters, sortBy])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Skills to Learn</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse through hundreds of skill listings and find the perfect course taught by experienced instructors. Learn
          at your own pace with personalized one-on-one sessions.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Error Loading Skills</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            {error.includes('Authentication required') && (
              <a 
                href="/signin" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for skills, courses, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Skill Categories */}
          <SkillCategories
            categories={skillTags}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <div className="hidden lg:block w-80">
              <div className="sticky top-20">
                <FilterSidebar filters={filters} onFiltersChange={setFilters} />
              </div>
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
                  <h2 className="text-2xl font-semibold text-gray-900">{filteredSkills.length} Skills Found</h2>
                  {selectedCategory !== "all" && (
                    <p className="text-gray-600">in {selectedCategory}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating-desc">Rating (High to Low)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSkills.map((skill) => (
                  <SkillCard key={skill._id} skill={skill} />
                ))}
              </div>

              {/* No Results */}
              {filteredSkills.length === 0 && allSkills.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No skills found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SkillsDiscovery
