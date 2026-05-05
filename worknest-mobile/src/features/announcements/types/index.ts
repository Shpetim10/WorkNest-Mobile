export type AnnouncementAudience = 'ALL_EMPLOYEES' | 'DEPARTMENT' | 'SPECIFIC_USERS';
export type AnnouncementPriority = 'NORMAL' | 'IMPORTANT';

export interface MobileAnnouncementListItem {
  id: string;
  title: string;
  contentPreview: string;
  priority: AnnouncementPriority;
  createdAt: string;
  read: boolean;
}

export interface MobileAnnouncementDetail {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
  read: boolean;
}

export interface UnreadCountResponse {
  count: number;
}