import { authReducer } from '@/features/auth/store/auth-slice';
import {
  forgotPasswordSubmitted,
  forgotPasswordSubmitting,
  invitationActivationStarted,
  invitationActivationSucceeded,
  invitationValidationStarted,
  invitationValidationSucceeded,
  resetPasswordSubmitting,
  resetPasswordSucceeded,
} from '@/features/auth/store/auth-slice';

import { assertEqual } from './test-helpers';

(() => {
  let state = authReducer(undefined, { type: '@@INIT' });

  state = authReducer(state, forgotPasswordSubmitting({ email: 'user@example.com' }));
  assertEqual(state.forgotPassword.submitting, true, 'forgotPassword should enter submitting state');
  state = authReducer(state, forgotPasswordSubmitted());
  assertEqual(state.forgotPassword.submitted, true, 'forgotPassword should mark as submitted');

  state = authReducer(state, resetPasswordSubmitting({ tokenSource: 'manual' }));
  assertEqual(state.resetPassword.submitting, true, 'resetPassword should enter submitting state');
  state = authReducer(state, resetPasswordSucceeded());
  assertEqual(state.resetPassword.succeeded, true, 'resetPassword should mark success');

  state = authReducer(state, invitationValidationStarted());
  assertEqual(state.invitation.validateStatus, 'loading', 'invitation validation should be loading');
  state = authReducer(
    state,
    invitationValidationSucceeded({
      companyName: 'Acme',
      maskedEmail: 'u***@mail.com',
      platformRole: 'EMPLOYEE',
      invitedJobTitle: 'HR',
    })
  );
  assertEqual(state.invitation.validateStatus, 'valid', 'invitation validation should be valid');

  state = authReducer(state, invitationActivationStarted());
  assertEqual(state.invitation.activateSubmitting, true, 'invitation activation should be submitting');
  state = authReducer(
    state,
    invitationActivationSucceeded({
      userId: 'u-1',
      roleAssignmentId: 'ra-1',
      role: 'EMPLOYEE',
      platformAccess: 'MOBILE',
      status: 'ACTIVE',
      message: 'Activated',
    })
  );
  assertEqual(state.invitation.activateSucceeded, true, 'invitation activation should succeed');
})();

