import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Users, Mail, Phone, CreditCard, Clock, CheckCircle, XCircle, User } from 'lucide-react';

const CourseStudents = ({ courseId }) => {
    const { user } = useSelector(store => store.auth);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [approvingId, setApprovingId] = useState(null);
    const [completingId, setCompletingId] = useState(null);

    useEffect(() => {
        if (courseId && user?._id) {
            fetchCourseStudents();
        }
    }, [courseId, user]);

    const fetchCourseStudents = async () => {
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
                'Content-Type': 'application/json',
            };

            // Add authorization header if token exists
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/v1/courses/students/${courseId}`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify({
                    teacherId: user._id
                })
            });

            const data = await response.json();

            if (data.success) {
                setStudents(data.data);
                setCount(data.count);
            } else {
                toast.error(data.message);
                setStudents([]);
                setCount(0);
            }
        } catch (error) {
            console.error('Error fetching course students:', error);
            toast.error('Failed to fetch students');
            setStudents([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRegistration = async (registrationId) => {
        try {
            setApprovingId(registrationId);
            
            // Get token from cookies
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(";").shift();
                return null;
            };

            const token = getCookie("token");

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/v1/courses/status/update`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify({
                    registrationId: registrationId,
                    teacherId: user._id
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'Registration approved successfully!');
                // Refresh the students list to show updated status
                fetchCourseStudents();
            } else {
                toast.error(data.message || 'Failed to approve registration');
            }
        } catch (error) {
            console.error('Error approving registration:', error);
            toast.error('Failed to approve registration');
        } finally {
            setApprovingId(null);
        }
    };

    const handleCompleteRegistration = async (registrationId) => {
        try {
            setCompletingId(registrationId);
            
            // Get token from cookies
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(";").shift();
                return null;
            };

            const token = getCookie("token");

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/v1/courses/status/complete`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify({
                    registrationId: registrationId,
                    teacherId: user._id
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'Course completed successfully!');
                // Refresh the students list to show updated status
                fetchCourseStudents();
            } else {
                toast.error(data.message || 'Failed to complete course');
            }
        } catch (error) {
            console.error('Error completing course:', error);
            toast.error('Failed to complete course');
        } finally {
            setCompletingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                text: 'Pending'
            },
            registered: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                text: 'Registered'
            },
            completed: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: CheckCircle,
                text: 'Completed'
            },
            rejected: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                text: 'Rejected'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const colors = {
            'Bkash': 'bg-pink-100 text-pink-800',
            'Nagad': 'bg-orange-100 text-orange-800',
            'Rocket': 'bg-purple-100 text-purple-800',
            'Bank Transfer': 'bg-blue-100 text-blue-800',
            'Cash': 'bg-green-100 text-green-800'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
                <CreditCard className="w-3 h-3 mr-1" />
                {method}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="w-6 h-6 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Course Students</h1>
                                <p className="text-sm text-gray-500">
                                    {count > 0 ? `${count} student${count > 1 ? 's' : ''} registered` : 'No students registered yet'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                            <span className="text-blue-700 font-medium">{count} Total</span>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="p-6">
                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                            <p className="text-gray-500">Students who register for this course will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {students.map((registration) => (
                                <div key={registration._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        {/* Profile Picture */}
                                        <div className="flex-shrink-0">
                                            {registration.studentId.profile?.profilePhoto ? (
                                                <img
                                                    src={registration.studentId.profile.profilePhoto}
                                                    alt={registration.studentId.fullname}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                                                    <User className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Student Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {registration.studentId.fullname}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {registration.studentId.email}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 mr-1" />
                                                            {registration.contactNo}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {getStatusBadge(registration.courseStatus || registration.status)}
                                                    {/* Action buttons based on status */}
                                                    {(registration.courseStatus === 'pending' || registration.status === 'pending') && (
                                                        <button
                                                            onClick={() => handleApproveRegistration(registration._id)}
                                                            disabled={approvingId === registration._id}
                                                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            {approvingId === registration._id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                    Approving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {(registration.courseStatus === 'registered' || registration.status === 'registered') && (
                                                        <button
                                                            onClick={() => handleCompleteRegistration(registration._id)}
                                                            disabled={completingId === registration._id}
                                                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            {completingId === registration._id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                    Completing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Complete
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment Information */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {getPaymentMethodBadge(registration.paymentMethod)}
                                                        <span className="text-sm text-gray-600">
                                                            Transaction ID: <span className="font-mono font-medium">{registration.transactionID}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseStudents;
