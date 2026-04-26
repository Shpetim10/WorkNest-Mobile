export type PlatformAccess = 'MOBILE' | 'WEB' | 'BOTH';

export type PlatformRole = 'SUPERADMIN' | 'ADMIN' | 'STAFF' | 'EMPLOYEE';

export interface ApiSuccessEnvelope<TData> {
  success: true;
  message: string;
  data: TData;
  timestamp: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: ApiFieldError[];
}

export interface TenantContext {
  companyId: string;
  companyName: string;
  companySlug: string;
  companyStatus: string;
  logoPath: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string | null;
  dateFormat: string | null;
  onboardingCompletedAt: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
}

export interface AvailableLoginContext {
  companyId: string;
  companyName: string;
  companySlug: string;
  roleAssignmentId: string;
  role: PlatformRole;
  jobTitle: string | null;
  platformAccess: PlatformAccess;
}

export interface LoginRequest {
  email: string;
  password: string;
  platformAccess: 'MOBILE';
}

export interface LoginResponseData {
  authenticated: boolean;
  roleSelectionRequired: boolean;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  activeRoleAssignmentId: string;
  role: PlatformRole;
  platformAccess: PlatformAccess;
  tenantContext: TenantContext;
  availableContexts: AvailableLoginContext[];
  message: string;
}

export interface SelectRoleRequest {
  roleAssignmentId: string;
  platformAccess: 'MOBILE';
}

export interface SelectRoleResponseData {
  activeRoleAssignmentId: string;
  platformRole: PlatformRole;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tenantContext: TenantContext;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
  activeRoleAssignmentId: string;
  platformAccess: PlatformAccess;
  tenantContext: TenantContext;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponseData {
  message: string;
}

export interface ValidateInvitationTokenRequest {
  token: string;
}

export interface InvitationPreflightData {
  maskedEmail: string;
  companyName: string;
  platformRole: PlatformRole;
  invitedJobTitle: string | null;
}

export interface ActivateInvitationRequest {
  token: string;
  password?: string;
  gdprConsent: boolean;
  preferredLanguage?: string;
  profileImageStorageKey?: string;
  profileImageStoragePath?: string;
}

export interface ActivateInvitationResponseData {
  userId: string;
  roleAssignmentId: string;
  role: PlatformRole;
  platformAccess: PlatformAccess;
  status: string;
  message: string;
}
