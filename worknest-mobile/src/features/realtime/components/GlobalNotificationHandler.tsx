import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { authApi } from '@/features/auth';
import { usePersonalNotifications } from '../hooks/use-personal-notifications';
import { RealtimeEventType } from '../types';

export function GlobalNotificationHandler() {
  const dispatch = useDispatch();

  usePersonalNotifications((envelope) => {
    if (envelope.type === RealtimeEventType.LEAVE_REQUEST_APPROVED) {
      dispatch(authApi.util.invalidateTags(['LeaveBalance', 'LeaveRequests']));
      Alert.alert('Leave Approved', 'Your leave request has been approved.');
    } else if (envelope.type === RealtimeEventType.LEAVE_REQUEST_REJECTED) {
      dispatch(authApi.util.invalidateTags(['LeaveBalance', 'LeaveRequests']));
      const reason = (envelope.payload as { rejectionReason?: string })?.rejectionReason;
      Alert.alert(
        'Leave Rejected',
        reason ? `Reason: ${reason}` : 'Your leave request has been rejected.',
      );
    }
  });

  return null;
}
