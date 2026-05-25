import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { useRouter } from 'expo-router';
import { useGetProfileQuery } from '@/features/home/api/home-api';
import { useLogoutMutation, logoutCompleted } from '@/features/auth';
import { clearPersistedSessionArtifacts } from '@/common/storage/secure-session-storage';

export function useProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const userEmail = useAppSelector((state) => state.auth.userEmail);

  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetProfileQuery();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      } else {
        await clearPersistedSessionArtifacts();
        dispatch(logoutCompleted());
      }
    } catch (error) {
      console.error('Logout API failed, clearing session locally:', error);
      await clearPersistedSessionArtifacts();
      dispatch(logoutCompleted());
    } finally {
      router.replace('/login' as any);
    }
  };

  const profile = {
    firstName: profileData?.firstName ?? '',
    lastName: profileData?.lastName ?? '',
    fullName: profileData ? `${profileData.firstName} ${profileData.lastName}` : '',
    email: profileData?.email ?? userEmail ?? '',
    profilePictureUrl: profileData?.profilePictureUrl ?? null,
    jobTitle: profileData?.jobTitle ?? null,
    department: profileData?.department ?? null,
    departmentName: profileData?.departmentName ?? null,
    siteName: profileData?.siteName ?? null,
    contractType: profileData?.contractType ?? null,
    contractStatus: profileData?.contractStatus ?? null,
    contractStartDate: profileData?.contractStartDate ?? null,
    contractEndDate: profileData?.contractEndDate ?? null,
    location: profileData?.location ?? null,
    role: profileData?.role ?? null,
  };

  const isLoading = isLoadingProfile || isLoggingOut;

  return {
    profile,
    isLoading,
    handleLogout,
    refetch,
  };
}
