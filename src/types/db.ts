import { InviteState } from "./invite";

export type DbInvitationStatus = "pending" | "opened" | "accepted" | "declined";

export interface QuizAnswerEntry {
  question: string;
  answer: string;
}

export interface GuestAnswers {
  selectedActivities?: string[];
  customActivityIdea?: string;
  claimedCoupons?: string[];
  quizAnswers?: QuizAnswerEntry[];
  chosenDate?: string;
  chosenTime?: string;
  noAttemptsCount?: number;
  acceptedAt?: string;
  guestNote?: string;
  guestReactionEmoji?: string;
  stage?: string;
}

export type InviteConfigSnapshot = Pick<
  InviteState,
  | "general"
  | "confirmation"
  | "noButton"
  | "activitiesConfig"
  | "activities"
  | "dateTime"
  | "audio"
  | "finalScreen"
  | "quiz"
  | "coupons"
  | "telegramNotification"
>;

export interface DbInvitation {
  id: string; // UUID
  user_id: string | null;
  config: InviteConfigSnapshot | Record<string, unknown>;
  is_paid: boolean;
  status: DbInvitationStatus;
  views_count?: number;
  first_opened_at?: string | null;
  last_opened_at?: string | null;
  guest_answers: GuestAnswers | Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftRequest {
  id?: string;
  userId?: string | null;
  config: Record<string, unknown>;
  isPaid?: boolean;
}

export interface SaveDraftResponse {
  success: boolean;
  invitation: DbInvitation;
  shareUrl: string;
  storageProvider?: string;
  message?: string;
}
