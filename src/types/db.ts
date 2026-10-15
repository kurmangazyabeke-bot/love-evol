import { InviteState } from "./invite";

export type DbInvitationStatus = "pending" | "accepted" | "declined";

export interface GuestAnswers {
  selectedActivities?: string[];
  chosenDate?: string;
  chosenTime?: string;
  noAttemptsCount?: number;
  acceptedAt?: string;
  guestNote?: string;
}

export type InviteConfigSnapshot = Omit<
  InviteState,
  | "currentStep"
  | "setCurrentStep"
  | "updateGeneral"
  | "updateConfirmation"
  | "updateNoButton"
  | "updateActivitiesConfig"
  | "setActivities"
  | "toggleActivity"
  | "updateActivity"
  | "addActivity"
  | "removeActivity"
  | "updateDateTime"
  | "updateFinalScreen"
  | "addPhotosToAlbum"
  | "removePhotoFromAlbum"
  | "resetToDefaults"
>;

export interface DbInvitation {
  id: string; // UUID
  user_id: string | null;
  config: InviteConfigSnapshot | Record<string, unknown>;
  is_paid: boolean;
  status: DbInvitationStatus;
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
  message?: string;
}
