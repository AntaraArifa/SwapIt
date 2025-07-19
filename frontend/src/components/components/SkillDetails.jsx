"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Star, BookOpen, MessageCircle, Calendar, Award } from "lucide-react"
import { mockSkillListings } from "../data/mockData"

const SkillDetails = () => {
  const { id } = useParams()
  const skill = mockSkillListings.find((s) => s._id === id)
  const [selectedTab, setSelectedTab] = useState("overview")

  if (!skill) {
    return <div className="container mx-auto px-4 py-8">Skill not found</div>
  }

  const getProficiencyColor = (proficiency) => {
    switch (proficiency.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Skill Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{skill.title}</h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getProficiencyColor(skill.proficiency)}`}
                >
                  {skill.proficiency}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{skill.skillID.name}</span>
                <div className="flex items-center gap-1">
                  {skill.avgRating > 0 ? (
                    <>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg text-gray-900">{skill.avgRating}</span>
                      <span className="text-gray-600">(0 reviews)</span>
                    </>
                  ) : (
                    <span className="text-gray-600">No reviews yet</span>
                  )}
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                  {skill.teacherID.fullname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{skill.teacherID.fullname}</p>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="text-xs text-gray-500">{skill.teacherID.email}</p>
                </div>
              </div>
            </div>

            {/* Skill Image */}
            <div className="h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img
                src={skill.listingImgURL || "/placeholder.svg?height=300&width=600"}
                alt={skill.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "curriculum", label: "Curriculum", icon: Award },
                  { id: "reviews", label: "Reviews", icon: Star },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                      selectedTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === "overview" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Course Description</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{skill.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900">What You'll Learn</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Master the fundamentals and advanced concepts</li>
                        <li>• Build real-world projects</li>
                        <li>• Get personalized feedback and guidance</li>
                        <li>• Access to learning resources and materials</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900">Prerequisites</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Basic computer skills</li>
                        <li>• Enthusiasm to learn</li>
                        <li>• No prior experience required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "curriculum" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Course Curriculum</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed curriculum will be discussed during the first session based on your learning goals.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Session 1: Introduction & Basics</h4>
                      <p className="text-sm text-gray-600 mt-1">Getting started with fundamentals</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Session 2-5: Core Concepts</h4>
                      <p className="text-sm text-gray-600 mt-1">Deep dive into main topics</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Session 6+: Advanced Topics & Projects</h4>
                      <p className="text-sm text-gray-600 mt-1">Hands-on practice and real projects</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Student Reviews</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet. Be the first to review this skill!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">${skill.fee}</span>
              <span className="text-lg text-gray-600">/session</span>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Book a Session
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Instructor
              </button>
            </div>
          </div>

          {/* Skill Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Skill Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Proficiency Level</span>
                <span className="font-medium text-gray-900">{skill.proficiency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium text-gray-900">{skill.skillID.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Duration</span>
                <span className="font-medium text-gray-900">1 hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format</span>
                <span className="font-medium text-gray-900">One-on-One</span>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">About the Instructor</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                {skill.teacherID.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{skill.teacherID.fullname}</p>
                <p className="text-sm text-gray-600">Experienced Instructor</p>
              </div>
            </div>
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50">
              View Instructor Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillDetails
