"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Star, MapPin, Clock, Users, MessageCircle, Calendar, Award, BookOpen } from "lucide-react"
import BookingCalendar from "./BookingCalendar"
import ReviewsList from "./ReviewsList"
import { mockTeachers } from "../data/mockData"

const TeacherProfile = () => {
  const { id } = useParams()
  const teacher = mockTeachers.find((t) => t.id === Number.parseInt(id))
  const [selectedTab, setSelectedTab] = useState("about")

  if (!teacher) {
    return <div className="container mx-auto px-4 py-8">Teacher not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-semibold text-gray-600 mx-auto md:mx-0">
                {teacher.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{teacher.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{teacher.location}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg text-gray-900">{teacher.rating}</span>
                    <span className="text-gray-600">({teacher.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    {teacher.studentsCount} students
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {teacher.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: "about", label: "About", icon: BookOpen },
                  { id: "reviews", label: "Reviews", icon: Star },
                  { id: "schedule", label: "Schedule", icon: Calendar },
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
              {selectedTab === "about" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                    <BookOpen className="h-5 w-5" />
                    About Me
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{teacher.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Award className="h-4 w-4" />
                        Experience
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 5+ years teaching experience</li>
                        <li>• Certified instructor</li>
                        <li>• 500+ successful sessions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Clock className="h-4 w-4" />
                        Teaching Style
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Patient and encouraging</li>
                        <li>• Hands-on learning approach</li>
                        <li>• Customized lesson plans</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "reviews" && <ReviewsList reviews={teacher.reviews || []} />}
              {selectedTab === "schedule" && <BookingCalendar teacherId={teacher.id} />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">${teacher.hourlyRate}</span>
              <span className="text-lg text-gray-600">/hour</span>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Book a Session
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Response time</span>
                <span className="font-medium text-gray-900">{teacher.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total students</span>
                <span className="font-medium text-gray-900">{teacher.studentsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion rate</span>
                <span className="font-medium text-gray-900">98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Languages</span>
                <span className="font-medium text-gray-900">English, Spanish</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Availability</h3>
            {teacher.availability === "available" ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Available now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                <span className="font-medium">Usually responds in {teacher.responseTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile
