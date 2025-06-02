import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StudentProfile from './profile-student';
import ApplicantProfile from './profile-applicant';


const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);



  return (
    <div>
      {user.role === 'student' && <StudentProfile />}
      {user.role === 'applicant' && <ApplicantProfile />}
    </div>
  );
};

export default ProfilePage;
