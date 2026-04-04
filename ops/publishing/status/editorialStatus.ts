export type EditorialStatus =
  | "draft_unpublished"
  | "draft_pending_publish"
  | "published_live"
  | "missing";

export type EditorialNextAction =
  | "publish_first_version"
  | "review_pending_changes"
  | "revise_if_needed"
  | "investigate_missing_content";

export interface EditorialStatusSnapshot {
  status: EditorialStatus;
  nextAction: EditorialNextAction;
  hasDraft: boolean;
  hasPublished: boolean;
}

export const deriveEditorialStatus = (input: {
  hasDraft: boolean;
  hasPublished: boolean;
}): EditorialStatusSnapshot => {
  if (input.hasDraft && input.hasPublished) {
    return {
      status: "draft_pending_publish",
      nextAction: "review_pending_changes",
      hasDraft: true,
      hasPublished: true,
    };
  }

  if (input.hasDraft) {
    return {
      status: "draft_unpublished",
      nextAction: "publish_first_version",
      hasDraft: true,
      hasPublished: false,
    };
  }

  if (input.hasPublished) {
    return {
      status: "published_live",
      nextAction: "revise_if_needed",
      hasDraft: false,
      hasPublished: true,
    };
  }

  return {
    status: "missing",
    nextAction: "investigate_missing_content",
    hasDraft: false,
    hasPublished: false,
  };
};

