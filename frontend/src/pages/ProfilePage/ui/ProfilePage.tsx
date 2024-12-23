import { useSelector } from 'react-redux';
import { getUserAuthData } from '@/entities/User';
import { UserRole } from '@/entities/User';
import { Navigate } from 'react-router-dom';
import PatientProfile from './PatientProfile/PatientProfile';
import DoctorProfile from './DoctorProfile/DoctorProfile';
import ManagerProfile from './ManagerProfile/ManagerProfile';
import AdminProfile from './AdminProfile/AdminProfile';

const ProfilePage = () => {
  const auth = useSelector(getUserAuthData);

  switch (auth?.role) {
    case UserRole.PATIENT:
      return <PatientProfile />;
    case UserRole.DOCTOR:
      return <DoctorProfile />;
    case UserRole.MANAGER:
      return <ManagerProfile />;
    case UserRole.ADMIN:
      return <AdminProfile />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default ProfilePage; 