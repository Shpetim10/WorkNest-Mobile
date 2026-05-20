import { useEffect, useState } from 'react';
import { useGetDashboardQuery, useGetProfileQuery } from '../api/home-api';

export function useHomeScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useGetDashboardQuery();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setCurrentDay(days[now.getDay()]);

      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const profile = {
    firstName: profileData?.firstName ?? 'Sarah',
    lastName: profileData?.lastName ?? '',
    profilePictureUrl: profileData?.profilePictureUrl ?? null,
    hasNotifications: (dashboardData?.announcementUnreadCount ?? 0) > 0,
  };

  const attendance = {
    checkedIn: dashboardData?.checkInTime !== null && dashboardData?.checkInTime !== undefined,
    checkInTime: dashboardData?.checkInTime ?? null,
  };

  const leaveBalances = dashboardData?.leaveBalances ?? [];

  const latestPayroll = {
    period: dashboardData?.latestPayrollMonth ?? null,
    amount: dashboardData?.latestPayrollNetPay !== null && dashboardData?.latestPayrollNetPay !== undefined
      ? `$${dashboardData.latestPayrollNetPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null,
  };

  const announcements = {
    unreadCount: dashboardData?.announcementUnreadCount ?? 0,
    latestTitle: dashboardData?.latestAnnouncementTitle ?? 'No announcements today',
  };

  const refetchList = async () => {
    await Promise.all([refetchDashboard(), refetchProfile()]);
  };

  const isLoading = isLoadingDashboard || isLoadingProfile;

  return {
    isLoading,
    profile,
    currentDay,
    currentTime,
    attendance,
    leaveBalances,
    latestPayroll,
    announcements,
    refetchList,
  };
}
