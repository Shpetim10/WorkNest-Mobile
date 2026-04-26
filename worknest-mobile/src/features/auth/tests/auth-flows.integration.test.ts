import { authReducer } from '@/features/auth/store/auth-slice';
import {
  invitationValidationFailed,
  invitationValidationSucceeded,
  loginSucceeded,
  logoutCompleted,
  refreshSucceeded,
  resetPasswordSucceeded,
  roleSelectionSucceeded,
  setInvitationToken,
} from '@/features/auth/store/auth-slice';
import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';

import { assert, assertEqual } from './test-helpers';

(() => {
  // Login with multiple contexts -> requires role selection.
  let state = authReducer(undefined, { type: '@@INIT' });
  state = authReducer(
    state,
    loginSucceeded({
      userEmail: 'a@worknest.com',
      payload: {
        authenticated: true,
        roleSelectionRequired: true,
        accessToken: 'access-1',
        accessTokenExpiresAt: new Date(Date.now() + 300000).toISOString(),
        refreshToken: 'refresh-1',
        refreshTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
        activeRoleAssignmentId: 'ra-1',
        role: 'EMPLOYEE',
        platformAccess: 'MOBILE',
        tenantContext: {
          companyId: 'c-1',
          companyName: 'WorkNest',
          companySlug: 'worknest',
          companyStatus: 'ACTIVE',
          logoPath: null,
          timezone: null,
          locale: null,
          currency: null,
          dateFormat: null,
          onboardingCompletedAt: null,
          subscriptionPlan: null,
          subscriptionStatus: null,
        },
        availableContexts: [
          {
            companyId: 'c-1',
            companyName: 'WorkNest',
            companySlug: 'worknest',
            roleAssignmentId: 'ra-1',
            role: 'EMPLOYEE',
            jobTitle: 'Ops',
            platformAccess: 'MOBILE',
          },
        ],
        message: 'ok',
      },
    })
  );
  assertEqual(state.requiresRoleSelection, true, 'Role selection should be required after login');

  // Select role -> role selection resolved and context replaced.
  state = authReducer(
    state,
    roleSelectionSucceeded({
      activeRoleAssignmentId: 'ra-2',
      platformRole: 'STAFF',
      accessToken: 'access-2',
      accessTokenExpiresAt: new Date(Date.now() + 300000).toISOString(),
      refreshToken: 'refresh-2',
      refreshTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
      tenantContext: {
        companyId: 'c-2',
        companyName: 'Branch',
        companySlug: 'branch',
        companyStatus: 'ACTIVE',
        logoPath: null,
        timezone: null,
        locale: null,
        currency: null,
        dateFormat: null,
        onboardingCompletedAt: null,
        subscriptionPlan: null,
        subscriptionStatus: null,
      },
    })
  );
  assertEqual(state.activeRoleAssignmentId, 'ra-2', 'Role assignment should switch after select-role');
  assertEqual(state.requiresRoleSelection, false, 'Role selection should be cleared');

  // Refresh rotates tokens while preserving role assignment context.
  state = authReducer(
    state,
    refreshSucceeded({
      accessToken: 'access-3',
      refreshToken: 'refresh-3',
      activeRoleAssignmentId: 'ra-2',
      platformAccess: 'MOBILE',
      tenantContext: state.tenantContext!,
      accessTokenExpiresAt: new Date(Date.now() + 300000).toISOString(),
      refreshTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
    })
  );
  assertEqual(state.refreshToken, 'refresh-3', 'Refresh token should rotate');
  assertEqual(state.activeRoleAssignmentId, 'ra-2', 'Role assignment should remain stable on refresh');

  // Reset-password success should force logout flow state.
  state = authReducer(state, resetPasswordSucceeded());
  state = authReducer(state, logoutCompleted());
  assertEqual(state.isAuthenticated, false, 'Reset flow should end in logged-out state');

  // Invitation validate and activate error/success paths.
  state = authReducer(state, setInvitationToken('invite-token'));
  state = authReducer(
    state,
    invitationValidationSucceeded({
      maskedEmail: 'm***@mail.com',
      companyName: 'Acme',
      platformRole: 'EMPLOYEE',
      invitedJobTitle: 'Analyst',
    })
  );
  assertEqual(state.invitation.validateStatus, 'valid', 'Invitation validate success should be stored');
  state = authReducer(state, invitationValidationFailed());
  assertEqual(state.invitation.validateStatus, 'invalid', 'Invitation validate failure should be stored');

  // Deep-link token parsing integration.
  const resetToken = sanitizeAuthFlowToken(' reset%2Dtoken ');
  const inviteToken = sanitizeAuthFlowToken(' invite%2Dtoken ');
  assert(resetToken === 'reset-token' && inviteToken === 'invite-token', 'Deep-link tokens should sanitize');
})();

