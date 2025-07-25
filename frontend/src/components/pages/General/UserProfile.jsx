import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../redux/authSlice';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Edit3 } from 'lucide-react';

const BACKEND_URL = "http://localhost:3000/api/v1"; // ✅ Backend API root

const Profile = ({ userId }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    bio: '',
    skills: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        // Fetch user by provided ID
        try {
          const token = localStorage.getItem('token') || user?.token;
          const response = await fetch(`${BACKEND_URL}/user/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            console.log('Fetched user:', data.user); // Debug log
            setProfileUser(data.user);
            // Set form data for the fetched user (for display purposes)
            setFormData({
              fullname: data.user.fullname || '',
              email: data.user.email || '',
              phoneNumber: data.user.phoneNumber ? data.user.phoneNumber.toString() : '',
              bio: data.user.profile?.bio || '',
              skills: data.user.profile?.skills ? data.user.profile.skills.join(', ') : '',
            });
          } else {
            showToast(data.message || 'User not found', 'error');
          }
        } catch (error) {
          console.error('Fetch user error:', error);
          showToast('Failed to load user profile', 'error');
        }
      } else {
        // Show current user's profile
        setProfileUser(user);
        if (user) {
          setFormData({
            fullname: user.fullname || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : '',
            bio: user.profile?.bio || '',
            skills: user.profile?.skills ? user.profile.skills.join(', ') : '',
          });
        }
      }
    };

    fetchUserProfile();
  }, [user, userId]);

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
      data.append('skills', formData.skills);
      if (profilePhoto) data.append('profilePhoto', profilePhoto);

      const res = await fetch(`${BACKEND_URL}/user/profile/update`, {
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

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const isOwnProfile = !userId || (userId === user?._id) || (userId === user?._id?.toString());
  const currentDisplayUser = profileUser;

  console.log('Debug Info:', { 
    userId, 
    currentUser: user?._id, 
    isOwnProfile, 
    profileUser: profileUser?._id,
    currentDisplayUser: currentDisplayUser?.fullname 
  }); // Debug log

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Please log in to view profiles.</div>;
  }

  if (!currentDisplayUser) {
    return <div className="text-center mt-10 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isOwnProfile ? 'My Profile' : `${currentDisplayUser?.fullname || 'User'}'s Profile`}
          </h2>
          {isOwnProfile && !isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:underline flex items-center">
              <Edit3 size={16} className="mr-1" /> Edit
            </button>
          ) : isOwnProfile && isEditing ? (
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
          ) : null}
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 text-center">
            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-gray-200 relative">
              {profilePhoto && isOwnProfile ? (
                <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
              ) : currentDisplayUser?.profile?.profilePhoto ? (
                <img src={currentDisplayUser.profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="mx-auto text-gray-400 mt-8" />
              )}
              {isEditing && isOwnProfile && (
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
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{currentDisplayUser?.fullname || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              {isEditing && isOwnProfile ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{currentDisplayUser?.email || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{currentDisplayUser?.phoneNumber || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Account Type</label>
              <p className="mt-1 font-medium capitalize">{currentDisplayUser?.role || 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Bio</label>
              {isEditing && isOwnProfile ? (
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded mt-1"
                ></textarea>
              ) : (
                <p className="mt-1 font-medium text-gray-700">{currentDisplayUser?.profile?.bio || 'No bio yet.'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Skills</label>
              {isEditing && isOwnProfile ? (
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
                  {currentDisplayUser?.profile?.skills?.length > 0 ? (
                    currentDisplayUser.profile.skills.map((skill, i) => (
                      <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No skills listed</span>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-2 text-sm text-gray-500 mt-4">
              <p><Calendar className="inline mr-1" size={16} /> Member since: {currentDisplayUser?.createdAt ? formatDate(currentDisplayUser.createdAt) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;