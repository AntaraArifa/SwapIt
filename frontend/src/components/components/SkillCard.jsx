import { Link } from "react-router-dom";
import { Star, MessageCircle } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useState } from "react";
import ChatBox from "../pages/Chat/ChatBox";


const SkillCard = ({ skill, onMessageClick }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const getProficiencyColor = (proficiency) => {
    switch (proficiency.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const truncateToWords = (text, wordLimit = 50) => {
    if (!text) return "";

    // Remove headers (lines starting with #) but keep everything else
    const lines = text.split("\n");
    const contentWithoutHeaders = lines
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n")
      .trim();

    if (!contentWithoutHeaders) return "";

    // Truncate to word limit
    const words = contentWithoutHeaders.split(/\s+/);
    if (words.length <= wordLimit) return contentWithoutHeaders;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Skill Image */}
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        <img
          src={skill.listingImgURL || "/placeholder.svg?height=200&width=400"}
          alt={skill.title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(
            skill.proficiency
          )}`}
        >
          {skill.proficiency}
        </span>
      </div>

      <div className="p-6">
        {/* Skill Header */}
        <div className="mb-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-gray-900 text-left line-clamp-2">
              {skill.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-wrap gap-1">
              {skill.skillID.tags &&
                skill.skillID.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              {skill.skillID.tags && skill.skillID.tags.length > 4 && (
                <span className="px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded-full">
                  +{skill.skillID.tags.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mb-3">
            {skill.avgRating > 0 ? (
              <>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">
                  {skill.avgRating}
                </span>
                <span className="text-sm text-gray-500">(0 reviews)</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No reviews yet</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <MarkdownRenderer
            content={truncateToWords(skill.description, 50)}
            className="text-sm text-gray-600 leading-relaxed line-clamp-3 text-justify [&>div]:text-sm [&_*]:text-sm [&_*]:text-gray-600 [&_*]:leading-relaxed [&_*]:mb-1 [&_strong]:font-medium"
          />
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {skill.teacherID.profile?.profilePhoto ? (
              <img
                src={skill.teacherID.profile.profilePhoto}
                alt={skill.teacherID.fullname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                {skill.teacherID.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {skill.teacherID.fullname}
            </p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ৳{skill.fee}
            </span>
            <span className="text-sm text-gray-500">/session</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/skills/${skill._id}`}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 text-center"
          >
            View Details
          </Link>
          <button
            onClick={() => onMessageClick(skill.teacherID)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Contact
          </button>
        </div>
      </div>
      <ChatBox
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        receiver={selectedInstructor}
      />
    </div>
  );
};

export default SkillCard;
