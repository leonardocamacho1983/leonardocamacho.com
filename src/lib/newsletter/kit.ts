import type { LocaleKey } from "@/lib/locales";

type KitCustomFieldValue = string | number | boolean | null | undefined;
type KitSubscriberState = "active" | "inactive" | "bounced" | "cancelled";

interface SubscribeInput {
  email: string;
  locale: LocaleKey;
  source: string;
  path: string;
  consentTimestamp: string;
  consentPolicyVersion: string;
}

interface ProfileInput {
  email: string;
  position?: string;
  company?: string;
  companyWebsite?: string;
  teamSize?: string;
  customerImpactMonthly?: string;
  strategicQuestion?: string;
}

class KitApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "KitApiError";
    this.status = status;
  }
}

const getConfig = () => {
  const apiKey = import.meta.env.KIT_API_KEY || "";
  const formId = import.meta.env.KIT_FORM_ID || "";
  const rawBase = import.meta.env.KIT_API_BASE_URL || "https://api.kit.com/v4";
  const baseUrl = rawBase.replace(/\/+$/, "");
  return { apiKey, formId, baseUrl };
};

export const isKitConfigured = (): boolean => {
  const { apiKey, formId } = getConfig();
  return Boolean(apiKey && formId);
};

const compactFields = (
  fields: Record<string, KitCustomFieldValue>,
): Record<string, string | number | boolean> =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== null && value !== undefined && String(value).trim() !== "",
    ),
  ) as Record<string, string | number | boolean>;

const kitRequest = async (
  path: string,
  payload: unknown,
  method: "POST" | "PUT" = "POST",
): Promise<void> => {
  const { apiKey, baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  let details = `${response.status}`;
  try {
    const body = await response.json();
    details = JSON.stringify(body);
  } catch {
    details = `${response.status} ${response.statusText}`.trim();
  }

  throw new KitApiError(`Kit API request failed: ${details}`, response.status);
};

const upsertSubscriberFields = async (
  email: string,
  fields: Record<string, KitCustomFieldValue>,
  options?: { state?: KitSubscriberState },
): Promise<void> => {
  const filteredFields = compactFields(fields);
  const payload: Record<string, unknown> = {
    email_address: email,
    fields: filteredFields,
  };
  if (options?.state) {
    payload.state = options.state;
  }
  await kitRequest("/subscribers", payload);
};

const addSubscriberToForm = async (email: string, referrerPath: string): Promise<void> => {
  const { formId } = getConfig();
  try {
    await kitRequest(`/forms/${formId}/subscribers`, {
      email_address: email,
      referrer: referrerPath || "/",
    });
  } catch (error) {
    if (error instanceof KitApiError && (error.status === 409 || error.status === 422)) {
      return;
    }
    throw error;
  }
};

export const subscribeToKit = async (input: SubscribeInput): Promise<void> => {
  // Create/update the subscriber as inactive first so Kit can send DOI/incentive email
  // when adding the subscriber to the form.
  await upsertSubscriberFields(input.email, {
    locale: input.locale,
    Locale: input.locale,
    signup_source: input.source,
    signup_path: input.path,
    consent_ts: input.consentTimestamp,
    consent_policy_version: input.consentPolicyVersion,
    member_status: "free",
  }, { state: "inactive" });

  await addSubscriberToForm(input.email, input.path);
};

export const updateKitProfile = async (input: ProfileInput): Promise<void> => {
  await upsertSubscriberFields(input.email, {
    position: input.position,
    Position: input.position,
    company: input.company,
    Company: input.company,
    company_website: input.companyWebsite,
    "Company website": input.companyWebsite,
    team_size: input.teamSize,
    "Team size": input.teamSize,
    customer_impact_monthly: input.customerImpactMonthly,
    strategic_question: input.strategicQuestion,
    "Strategic question": input.strategicQuestion,
    survey_completed_at: new Date().toISOString(),
  });
};

export const updateKitProfileBySubscriberId = async (
  subscriberId: string,
  input: Omit<ProfileInput, "email">,
): Promise<void> => {
  await kitRequest(
    `/subscribers/${subscriberId}`,
    {
      fields: compactFields({
        position: input.position,
        Position: input.position,
        company: input.company,
        Company: input.company,
        company_website: input.companyWebsite,
        "Company website": input.companyWebsite,
        team_size: input.teamSize,
        "Team size": input.teamSize,
        customer_impact_monthly: input.customerImpactMonthly,
        strategic_question: input.strategicQuestion,
        "Strategic question": input.strategicQuestion,
        survey_completed_at: new Date().toISOString(),
      }),
    },
    "PUT",
  );
};
