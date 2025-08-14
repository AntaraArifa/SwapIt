"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Star,
  BookOpen,
  MessageCircle,
  Calendar,
  Award,
  Edit,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import ListingReviews from "./ListingReviews";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import CourseStudents from "./CourseStudents";
import axios from "axios";
import ChatBox from "../pages/Chat/ChatBox";

const SkillDetails = (onMessageClick) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState("notRegistered");
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Fetch review stats for a listing
  const fetchReviewStats = async (listingId) => {
    try {
      const token = getCookie("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.REVIEW.STATS(listingId));
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviewStats({
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
      // Set default values if fetch fails
      setReviewStats({
        averageRating: 0,
        totalReviews: 0
      });
    }
  };

  // Fetch skill details from API
  useEffect(() => {
    const fetchSkillDetails = async () => {
      try {
        setLoading(true);

        // Get token from cookies
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
          return null;
        };

        const token = getCookie("token");

        const headers = {
          "Content-Type": "application/json",
        };

        // Add authorization header if token exists
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const apiUrl = buildApiUrl(API_ENDPOINTS.LISTINGS.BY_ID(id));

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: headers,
          credentials: "include",
        });

        if (!response.ok) {
          // Try to get the error message from the response
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 401) {
            throw new Error(
              "Authentication required. Please sign in to view skill details."
            );
          } else if (response.status === 404) {
            throw new Error(
              "Skill not found. This skill may have been removed or the ID is incorrect."
            );
          } else if (response.status === 403) {
            throw new Error(
              "Access denied. You may not have permission to view this skill."
            );
          } else {
            const errorMessage =
              errorData.message ||
              `Failed to fetch skill details (${response.status})`;
            throw new Error(errorMessage);
          }
        }

        const data = await response.json();

        if (data.success) {
          setSkill(data.listing);
          // Fetch review stats for the listing
          fetchReviewStats(data.listing._id);
        } else {
          throw new Error(data.message || "Failed to fetch skill details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSkillDetails();
    } else {
      setLoading(false);
      setError("No skill ID provided");
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Error Loading Skill
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            {error.includes("Authentication required") && (
              <a
                href="/signin"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Skill not found
  if (!skill) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Skill Not Found
          </h3>
          <p className="text-gray-600">
            The skill you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

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

  const convertTo12Hour = (time24) => {
    // Handle different time formats
    const timeStr = time24.toString().trim();

    // If already in 12-hour format, return as is
    if (
      timeStr.toLowerCase().includes("am") ||
      timeStr.toLowerCase().includes("pm")
    ) {
      return timeStr;
    }

    // Parse 24-hour format (e.g., "09:30", "9:30", "0930", "10:00", "14:00")
    let hours,
      minutes = "00";

    if (timeStr.includes(":")) {
      const parts = timeStr.split(":");
      hours = parts[0];
      minutes = parts[1] || "00";
    } else if (timeStr.length === 4) {
      // Handle format like "0930"
      hours = timeStr.substring(0, 2);
      minutes = timeStr.substring(2, 4);
    } else if (timeStr.length === 1 || timeStr.length === 2) {
      // Handle format like "9" or "14"
      hours = timeStr;
      minutes = "00";
    } else {
      return timeStr; // Return original if format is unrecognized
    }

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Validate hours and minutes
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return timeStr; // Return original if invalid
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Helper function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };
  const handleCloseChat = () => {
    setChatVisible(false);
    setSelectedStudent(null);
  };

  const handleMessageClick = (receiver) => {
    setSelectedInstructor(receiver);
    setChatVisible(true);
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Skill Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Full Card Image with Overlay Content */}
            <div className="relative h-80 bg-gray-200">
              <img
                src={
                  skill.listingImgURL || "/placeholder.svg?height=300&width=600"
                }
                alt={skill.title}
                className="w-full h-full object-cover"
              />

              {/* Dark gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Proficiency Badge on top-right corner */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getProficiencyColor(
                    skill.proficiency
                  )}`}
                >
                  {skill.proficiency}
                </span>
              </div>

              {/* Title and Tags on bottom-left corner */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                      {skill.title}
                    </h1>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {skill.skillID?.tags && skill.skillID.tags.length > 0 ? (
                        skill.skillID.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/90 text-gray-800 text-sm rounded-full backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm rounded-full backdrop-blur-sm">
                          No tags
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating on bottom-right corner */}
                  <div className="flex items-center gap-1 ml-4">
                    {reviewStats.averageRating && reviewStats.averageRating > 0 ? (
                      <>
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                        <span className="font-semibold text-lg text-white drop-shadow-lg">
                          {reviewStats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-white/80 drop-shadow-lg">
                          ({reviewStats.totalReviews} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-white/80 drop-shadow-lg">
                        {reviewStats.totalReviews > 0 ? `${reviewStats.totalReviews} reviews` : "No reviews yet"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
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
                  {/* Course Description */}
                  <div className="mb-8">
                    <MarkdownRenderer
                      content={skill.description}
                      className="text-gray-600 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {selectedTab === "curriculum" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Course Curriculum
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Detailed curriculum will be discussed during the first
                    session based on your learning goals.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        Session 1: Introduction & Basics
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Getting started with fundamentals
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        Session 2-5: Core Concepts
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Deep dive into main topics
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        Session 6+: Advanced Topics & Projects
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Hands-on practice and real projects
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Student Reviews
                  </h3>
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet. Be the first to review this skill!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            {/* Course Students Section - Only visible to course teacher */}
            {user && skill.teacherID._id === user._id && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">
                  Registered Students
                </h3>
                <CourseStudents
                  courseId={skill._id}
                  onMessageClick={handleMessageClick}
                />
              </div>
            )}
          </div>
        </div>
        <ChatBox
          visible={chatVisible}
          onClose={handleCloseChat}
          receiver={selectedStudent}
        />

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">
                Taka {skill.fee}
              </span>
            </div>
            <div className="space-y-3">
              {/* Check if current user is the listing owner */}
              {user && skill.teacherID._id === user._id ? (
                <button
                  onClick={() => navigate(`/edit-listing/${skill._id}`)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Listing
                </button>
              ) : (
                <>
                  {/* Show different buttons based on registration status */}
                  {checkingRegistration ? (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Checking...
                    </button>
                  ) : registrationStatus === "notRegistered" ? (
                    <button
                      onClick={() => navigate(`/skills/register/${skill._id}`)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Register for Course
                    </button>
                  ) : registrationStatus === "pending" ? (
                    <button
                      disabled
                      className="w-full bg-yellow-400 text-yellow-900 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Calendar className="h-4 w-4" />
                      Pending Approval
                    </button>
                  ) : registrationStatus === "registered" ? (
                    <button
                      onClick={() =>
                        navigate(`/book-session/${skill._id}`, {
                          state: { teacherID: skill.teacherID._id },
                        })
                      }
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book a Session
                    </button>
                  ) : registrationStatus === "completed" ? (
                    <button
                      disabled
                      className="w-full bg-green-400 text-green-900 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Calendar className="h-4 w-4" />
                      Course Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/skills/register/${skill._id}`)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Register for Course
                    </button>
                  )}
                </>
              )}

              <button onClick={() => handleMessageClick(skill.teacherID)} className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Instructor
              </button>
            </div>
          </div>

          {/* Skill Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Skill Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Proficiency Level</span>
                <span className="font-medium text-gray-900">
                  {skill.proficiency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {skill.skillID?.tags && skill.skillID.tags.length > 0 ? (
                    skill.skillID.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="font-medium text-gray-900">No tags</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Course Duration</span>
                <span className="font-medium text-gray-900">
                  {skill.duration || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format</span>
                <span className="font-medium text-gray-900">One-on-One</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Slots</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {skill.availableSlots && skill.availableSlots.length > 0 ? (
                    skill.availableSlots.map((slot, index) => (
                      <span
                        key={index}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium"
                      >
                        {convertTo12Hour(slot)}
                      </span>
                    ))
                  ) : (
                    <span className="font-medium text-gray-900">
                      No slots available
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Methods</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {skill.paymentMethods && skill.paymentMethods.length > 0 ? (
                    skill.paymentMethods.map((method, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium"
                      >
                        {method.name}
                      </span>
                    ))
                  ) : (
                    <span className="font-medium text-gray-900">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              About the Instructor
            </h3>
            <div className="flex items-center gap-3 mb-4">
              {skill.teacherID?.profile?.profilePhoto ? (
                <img
                  src={skill.teacherID.profile.profilePhoto}
                  alt={skill.teacherID.fullname || "Instructor"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                  {skill.teacherID?.fullname
                    ? skill.teacherID.fullname
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "??"}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {skill.teacherID?.fullname || "Unknown Instructor"}
                </p>
                <p className="text-sm text-gray-600">Instructor</p>
                {/* <p className="text-xs text-gray-500">{skill.teacherID?.email || 'No email available'}</p> */}
              </div>
            </div>

            {/* Instructor Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Skill</span>
                <span className="text-sm font-medium text-gray-900 break-all">
                  {skill.skillID?.name || "Not available"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Experience</span>
                <span className="text-sm font-medium text-gray-900">
                  {skill.skillID?.experience
                    ? `${skill.skillID.experience} years+`
                    : "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Level</span>
                <span className="text-sm font-medium text-gray-900">
                  {skill.skillID?.level || "Not specified"}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile/" + skill.teacherID._id)}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              View Instructor Profile
            </button>
          </div>
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

export default SkillDetails;
