import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../../redux/authSlice';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Edit3, Star, MessageSquare } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    bio: '',
    skills: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills ? user.profile.skills.join(', ') : '',
      });
      
      // Fetch average rating if user is a teacher
      if (user.role === 'teacher') {
        fetchAverageRating();
      }
    }
  }, [user]);

  const fetchAverageRating = async () => {
    if (!user || user.role !== 'teacher') return;
    
    setLoadingRating(true);
    try {
      const token = localStorage.getItem('token') || user?.token;
      const response = await fetch(buildApiUrl(`/ratings/teacher/${user._id}/average`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAverageRating(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setProfilePhoto(file);
    } else {
      showToast('Invalid image file (max 5MB)', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.fullname.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullname', formData.fullname);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('bio', formData.bio);
      if (profilePhoto) data.append('profilePhoto', profilePhoto);

      const res = await fetch(buildApiUrl(API_ENDPOINTS.USER.UPDATE), {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      const result = await res.json();

      if (result.success) {
        dispatch(setUser(result.user));
        showToast('Profile updated successfully');
        setIsEditing(false);
        setProfilePhoto(null);
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.message.includes('404')) {
        showToast('API endpoint not found. Please check your server setup.', 'error');
      } else if (err.message.includes('Failed to fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      } else if (err.message.includes('JSON')) {
        showToast('Server response error. Please try again.', 'error');
      } else {
        showToast('Something went wrong! Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: user?.fullname || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber ? user.phoneNumber.toString() : '',
      bio: user?.profile?.bio || '',
      skills: user?.profile?.skills ? user.profile.skills.join(', ') : '',
    });
    setProfilePhoto(null);
    setIsEditing(false);
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded text-white shadow z-50 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'N/A';
      return parsedDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <div className="flex items-center gap-3">
            {/* Ratings & Reviews Button for Learners */}
            {user.role === "learner" && (
              <button
                onClick={() => navigate('/profile/ratings-reviews')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                <Star size={16} />
                <MessageSquare size={16} />
                Ratings & Reviews
              </button>
            )}
            
            {/* Reviews Button for Teachers */}
            {user.role === "teacher" && (
              <button
                onClick={() => navigate('/profile/reviews')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <MessageSquare size={16} />
                My Reviews
              </button>
            )}
            
            {/* Edit Profile Button */}
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:underline flex items-center">
                <Edit3 size={16} className="mr-1" /> Edit
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  <Save size={16} className="inline mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >Cancel</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 text-center">
            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-gray-200 relative">
              {profilePhoto ? (
                <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
              ) : user.profile?.profilePhoto ? (
                <img src={user.profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="mx-auto text-gray-400 mt-8" />
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{formData.fullname}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{formData.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Account Type</label>
              <p className="mt-1 font-medium capitalize">{user.role}</p>
            </div>

            {/* Average Rating Display for Teachers */}
            {user.role === 'teacher' && (
              <div>
                <label className="text-sm text-gray-600">Average Rating</label>
                {loadingRating ? (
                  <p className="mt-1 text-gray-500">Loading...</p>
                ) : averageRating ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">
                        {averageRating.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({averageRating.totalRatings} {averageRating.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500">No ratings yet</p>
                )}
              </div>
            )}

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                ></textarea>
              ) : (
                <p className="mt-1 font-medium text-gray-700">{formData.bio || 'No bio yet.'}</p>
              )}
            </div>

            {/* <div className="col-span-2">
              <label className="text-sm text-gray-600">Skills</label>
              {isEditing ? (
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                  placeholder="React, Node.js, MongoDB"
                />
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.profile?.skills?.map((skill, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div> */}

            <div className="col-span-2 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-2" size={16} />
                  <span>Member since: {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;