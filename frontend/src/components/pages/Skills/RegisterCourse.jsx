"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CreditCard,
  Phone,
  User,
  BookOpen,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Award,
  Star,
} from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";

const RegisterCourse = () => {
  const { id } = useParams(); // Course/Listing ID
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // State for course details
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    contactNo: "",
    paymentMethod: "",
    transactionID: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Get payment methods from API or fallback to default
  const getPaymentMethods = () => {
    if (course?.paymentMethods && course.paymentMethods.length > 0) {
      return course.paymentMethods.map(method => ({
        value: method.name,
        label: method.name,
        accountNumber: method.accountNumber
      }));
    }
    
    // Fallback to default payment methods if none from API
    return [
      { value: "bKash", label: "bKash" },
      { value: "Nagad", label: "Nagad" },
      { value: "Rocket", label: "Rocket" },
      { value: "Bank Transfer", label: "Bank Transfer" },
      { value: "Cash", label: "Cash" },
    ];
  };

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setError("No course ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          buildApiUrl(API_ENDPOINTS.LISTINGS.BY_ID(id)),
          {
            method: "GET",
            headers: headers,
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to register for courses");
          } else if (response.status === 404) {
            throw new Error("Course not found");
          }
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();

        if (data.success) {
          setCourse(data.listing);
        } else {
          throw new Error(data.message || "Failed to fetch course details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Initialize contact number from user data
  useEffect(() => {
    if (user && user.phone) {
      setFormData((prev) => ({
        ...prev,
        contactNo: user.phone,
      }));
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.contactNo.trim()) {
      errors.contactNo = "Contact number is required";
    } else if (!/^[+]?[\d\s\-()]{10,}$/.test(formData.contactNo.trim())) {
      errors.contactNo = "Please enter a valid contact number";
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    if (!formData.transactionID.trim()) {
      errors.transactionID = "Transaction ID is required";
    } else if (formData.transactionID.trim().length < 5) {
      errors.transactionID = "Transaction ID must be at least 5 characters";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user || !course) {
      setError("Missing user or course information");
      return;
    }

    setIsSubmitting(true);

    try {
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

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const requestBody = {
        studentId: user._id,
        courseId: course._id,
        contactNo: formData.contactNo.trim(),
        paymentMethod: formData.paymentMethod,
        transactionID: formData.transactionID.trim(),
      };

      const response = await fetch(buildApiUrl(API_ENDPOINTS.COURSES.REGISTER), {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRegistrationSuccess(true);
        // Navigate to course details or dashboard after a delay
        setTimeout(() => {
          navigate(`/skills/${course._id}`);
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to register for course");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get proficiency color
  const getProficiencyColor = (proficiency) => {
    switch (proficiency?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      case "expert":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Error Loading Course
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/skills")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Skills
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Successful! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You have successfully registered for{" "}
              <span className="font-semibold text-gray-900">
                {course?.title}
              </span>
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">
                What's Next?
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Your instructor will contact you soon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  You can now book sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Check your registered courses in your profile
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate(`/skills/${course._id}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Course Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register for Course
          </h1>
          <p className="text-gray-600">
            Complete your registration to start learning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Course Details
            </h2>

            {/* Course Image */}
            {course?.listingImgURL && (
              <div className="mb-4">
                <img
                  src={course.listingImgURL}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {course?.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {course?.description?.substring(0, 150)}...
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getProficiencyColor(
                    course?.proficiency
                  )}`}
                >
                  <Award className="h-3 w-3 inline mr-1" />
                  {course?.proficiency}
                </span>
                {course?.avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {course.avgRating}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>৳{course?.fee}/session</span>
                </div>
                {course?.duration && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                <div className="flex items-center gap-3">
                  {course?.teacherID?.profile?.profilePhoto ? (
                    <img
                      src={course.teacherID.profile.profilePhoto}
                      alt={course.teacherID.fullname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {course?.teacherID?.fullname}
                    </p>
                    <p className="text-sm text-gray-600">Instructor</p>
                  </div>
                </div>
              </div>

              {/* Available Payment Methods */}
              {course?.paymentMethods && course.paymentMethods.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Instructor's Payment Methods
                  </h4>
                  <div className="space-y-2">
                    {course.paymentMethods.map((method, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {method.accountNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use these payment methods for registration
                  </p>
                </div>
              )}

              {/* Available Time Slots */}
              {course?.availableSlots && course.availableSlots.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Available Time Slots
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.availableSlots.map((slot, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Registration Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Student Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">{user?.fullname}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium">{user?.email}</span>
                  </p>
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  placeholder="e.g., +8801712345678"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.contactNo
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.contactNo && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.contactNo}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method *
                </label>
                
                {/* Payment methods from API */}
                <div className="space-y-2">
                  {getPaymentMethods().map((method, index) => (
                    <label
                      key={`payment-${index}`}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="text-blue-600 mr-3 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div  style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', textAlign: 'justify', marginTop: '0.5rem'}}>
                          <span className="font-medium text-gray-900">
                            {method.label}
                          </span>
                          {method.accountNumber && (
                          <div className="text-xs text-gray-600 mt-1">
                            Account: {method.accountNumber}
                          </div>
                        )}
                        </div>
                        
                      </div>
                    </label>
                  ))}
                </div>
                
                {formErrors.paymentMethod && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.paymentMethod}
                  </div>
                )}
                
                {course?.paymentMethods && course.paymentMethods.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Payment methods with account numbers are preferred by the instructor
                  </p>
                )}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="h-4 w-4" />
                  Transaction ID *
                </label>
                <input
                  type="text"
                  name="transactionID"
                  value={formData.transactionID}
                  onChange={handleInputChange}
                  placeholder="Enter your transaction ID"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.transactionID
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.transactionID && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.transactionID}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Please provide the transaction ID from your payment
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Register for Course
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Registration Terms
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Complete payment to instructor's account before registration</li>
                <li>• Provide valid transaction ID for verification</li>
                <li>• You can book sessions after successful registration</li>
                <li>• Available time slots: {course?.availableSlots?.join(", ") || "To be discussed"}</li>
                <li>• Course duration: {course?.duration || "As per curriculum"}</li>
                <li>• Cancellation policy applies as per instructor terms</li>
                <li>• Contact the instructor for any queries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCourse;
