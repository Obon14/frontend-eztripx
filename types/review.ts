export type ReviewStatus = "pending" | "published" | "rejected";

export type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  displayName: string;
  travelerRole: string | null;
};

export type AdminReview = PublicReview & {
  status: ReviewStatus;
  documentGuideId: string;
  createdAt: string;
  userEmail?: string;
  guideTitle?: string;
};
