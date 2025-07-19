import { Link } from "react-router-dom"
import { Star, MapPin, Clock, Users, MessageCircle } from "lucide-react"

const TeacherCard = ({ teacher }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Teacher Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
            {teacher.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">{teacher.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
              <MapPin className="h-3 w-3" />
              {teacher.location}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{teacher.rating}</span>
              <span className="text-sm text-gray-500">({teacher.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {teacher.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {teacher.skills.length > 3 && (
              <span className="px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded-full">
                +{teacher.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{teacher.bio}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {teacher.studentsCount} students
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {teacher.responseTime}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">${teacher.hourlyRate}</span>
            <span className="text-sm text-gray-500">/hour</span>
          </div>
        </div>

        {/* Action Buttons - Fixed positioning */}
        <div className="flex gap-2">
          <Link
            to={`/teachers/${teacher.id}`}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 text-center"
          >
            View Profile
          </Link>
          <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center justify-center gap-1">
            <MessageCircle className="h-4 w-4" />
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherCard
