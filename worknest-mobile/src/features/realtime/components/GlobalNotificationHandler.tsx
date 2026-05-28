import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useLocalization } from '@/common/localization';
import { authApi } from '@/features/auth';
import { usePersonalNotifications } from '../hooks/use-personal-notifications';
import { RealtimeEventType } from '../types';

export function GlobalNotificationHandler() {
  const dispatch = useDispatch();
  const { t } = useLocalization();

  usePersonalNotifications((envelope) => {
    if (envelope.type === RealtimeEventType.LEAVE_REQUEST_APPROVED) {
      dispatch(authApi.util.invalidateTags(['LeaveBalance', 'LeaveRequests']));
      Alert.alert(t('notifications.leaveApproved'), t('notifications.leaveApprovedMessage'));
    } else if (envelope.type === RealtimeEventType.LEAVE_REQUEST_REJECTED) {
      dispatch(authApi.util.invalidateTags(['LeaveBalance', 'LeaveRequests']));
      const reason = (envelope.payload as { rejectionReason?: string })?.rejectionReason;
      Alert.alert(
        t('notifications.leaveRejected'),
        reason ? `${t('notifications.leaveRejectedReason')}: ${reason}` : t('notifications.leaveRejectedMessage'),
      );
    } else if (
      envelope.type === RealtimeEventType.ATTENDANCE_CHECK_IN ||
      envelope.type === RealtimeEventType.ATTENDANCE_CHECK_OUT ||
      envelope.type === RealtimeEventType.ATTENDANCE_MANUAL_CHECK_IN ||
      envelope.type === RealtimeEventType.ATTENDANCE_MANUAL_CHECK_OUT ||
      envelope.type === RealtimeEventType.ATTENDANCE_EVENT_REVIEWED ||
      envelope.type === RealtimeEventType.ATTENDANCE_DAY_ADJUSTED
    ) {
      // Employees aren't authorized on the company attendance topic, so their own
      // attendance changes arrive on the personal queue — refresh today/month state.
      dispatch(authApi.util.invalidateTags(['AttendanceToday', 'AttendanceMonth']));
    }
  });

  return null;
}
