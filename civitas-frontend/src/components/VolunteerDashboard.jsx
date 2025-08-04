// src/components/VolunteerDashboard.jsx
import React,{useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import HomeDashboardView from './HomeDashboardView';
import MyComplaintsList from './MyComplaintsList';
import ComplaintForm from './ComplaintForm';
import ProfileEditForm from './ProfileEditForm';
import Leaderboard from './Leaderboard';
import LocalAnnouncements from './LocalAnnouncements';


import styles from './VolunteerDashboard.module.css';

const VolunteerDashboard=()=>{
    const navigate=useNavigate();
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeContent, setActiveContent] = useState('home');
    // NEW STATES for Delete Profile messages
    const [deleteResultMessage, setDeleteResultMessage] = useState(null);
    const [deleteResultError, setDeleteResultError] = useState(null);


    const API_BASE_URL=process.env.REACT_APP_API_BASE_URL||'http://localhost:5000/api';

    useEffect(()=>{
        const fetchUserProfile=async()=>{
            setDeleteResultMessage(null); // Clear delete messages on profile fetch
            setDeleteResultError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            try{
                const res = await fetch(`${API_BASE_URL}/users/profile`,{ // Keeping /users/profile as per your instruction
                    headers:{
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if(!res.ok){
                    if(res.status === 401 || res.status === 403){
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/signin?message=Session expired.Please signin again');
                        return;
                    }
                    throw new Error('Failed to fetch user profile');
                }
                const data = await res.json();
                setUser(data.user);
                setLoading(false);
            }catch(err){
                console.error('Error fetching user profile:',err);
                setError('Failed to load profile data.');
                setLoading(false);
                navigate('/signin?message=Error loading Dashboard');
            }
        };
        fetchUserProfile();
    },[navigate,API_BASE_URL]); // Added delete messages to dependencies, not relevant for this useEffect

    // Callback to update user state after profile edit
    const handleProfileUpdateSuccess = (updatedUser) => {
        setUser(updatedUser); // Update the user state here
        // Optionally clear any existing delete messages if profile was just updated
        setDeleteResultMessage(null);
        setDeleteResultError(null);
        // Navigate back to home dashboard view after update
        setActiveContent('home');
    };

    // NEW FUNCTION: Callback for delete profile results
    const handleProfileDeleteResult = (type, message) => {
        if (type === 'success') {
            setDeleteResultMessage(message);
            setDeleteResultError(null);
        } else {
            setDeleteResultMessage(null);
            setDeleteResultError(message);
        }
        // Messages will clear on next dashboard load or content change
    };

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = (contentKey) => {
      setActiveContent(contentKey);
      setIsSidebarOpen(false); // Close sidebar after selection
      setDeleteResultMessage(null); // Clear delete messages on content change
      setDeleteResultError(null);
    };

    const handleNavigateToContent = (contentKey) => {
        setActiveContent(contentKey);
        setIsSidebarOpen(false);
        setDeleteResultMessage(null); // Clear delete messages on content change
        setDeleteResultError(null);
    };


    if(loading){
        return <div className={styles.loadingContainer}>Loading Dashboard...</div>;
    }
    if(error){
        return <div className={styles.errorContainer}>{error}</div>;
    }
    if(!user){
        return <div className={styles.redirectingContainer}>Redirecting to login...</div>
    }

    return(
        <div className={styles.dashboardLayout}>
            <Navbar
                user={user}
                toggleSidebar={toggleSidebar}
                onProfileUpdateSuccess={handleProfileUpdateSuccess}
                onNavigateToContent={handleNavigateToContent}
                onProfileDeleteResult={handleProfileDeleteResult} // NEW: Pass delete result callback
            />
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onMenuItemClick={handleSidebarClick} />
            <div className={`${styles.mainContentArea} ${isSidebarOpen ? styles.shiftedContent : ''}`}>
                {/* Display delete result messages if any */}
                {deleteResultMessage && <p className={styles.dashboardSuccessMessage}>{deleteResultMessage}</p>}
                {deleteResultError && <p className={styles.dashboardErrorMessage}>{deleteResultError}</p>}

                {typeof activeContent === 'string' && activeContent === 'home' && <HomeDashboardView user={user} />}
                {typeof activeContent === 'string' && activeContent === 'myComplaints' && <MyComplaintsList user={user} />}
                {typeof activeContent === 'object' && activeContent.type === 'reportComplaint' &&
                  <ComplaintForm
                    user={user}
                    category={activeContent.category}
                    subType={activeContent.subType}
                  />
                }
                {typeof activeContent === 'string' && activeContent === 'editProfile' &&
                  <ProfileEditForm user={user} onProfileUpdateSuccess={handleProfileUpdateSuccess} />
                }
                {typeof activeContent === 'string' && activeContent === 'leaderboard' &&
  <Leaderboard user={user} />
}
{typeof activeContent === 'string' && activeContent === 'announcements' &&
  <LocalAnnouncements user={user} />
}

            </div>
        </div>
    );
};

export default VolunteerDashboard;