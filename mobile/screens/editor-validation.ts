import { configs } from "./editor-config";

export type EditorValues = Record<string, any>;
export type EditorContext = { editing?: boolean; memberId?: string };

export function editorFields(
  kind: string,
  values: EditorValues,
  context: EditorContext = {},
) {
  return configs[kind].fields
    .filter(
      (f) =>
        !(context.editing && f.key === "password") &&
        !(context.memberId && f.key === "memberId") &&
        !(
          kind === "plans" &&
          ((f.key === "ptSessions" && values.scope === "GYM") ||
            (["ptValidityDays", "gymAccessDays"].includes(f.key) &&
              values.scope !== "BUNDLE"))
        ) &&
        !(
          kind === "attendance" &&
          f.key === "classId" &&
          values.type !== "CLASS"
        ),
    )
    .map((f) =>
      kind === "attendance" && f.key === "classId"
        ? { ...f, required: true }
        : f,
    );
}

/** Use the same normalized payload for live validation and submission. */
export function validateEditor(
  kind: string,
  values: EditorValues,
  context: EditorContext = {},
) {
  const config = configs[kind];
  const v = { ...values };
  for (const f of config.fields) {
    if (v[f.key] === "" && !f.required) v[f.key] = null;
  }
  if (context.editing) delete v.password;
  if (kind === "plans") {
    if (v.scope !== "BUNDLE") {
      v.ptValidityDays = null;
      v.gymAccessDays = null;
    }
    if (v.scope === "GYM") v.ptSessions = 0;
  }
  if (kind === "staff" && v.role !== "STAFF_MEMBER") {
    for (const key of [
      "fullName",
      "availableForPt",
      "specialty",
      "yearsExperience",
      "certifications",
      "photoUrl",
    ])
      delete v[key];
  }
  if (kind === "attendance") {
    if (v.type !== "CLASS") delete v.classId;
    // The optional API ID accepts omission, not null or an empty picker value.
    if (v.subscriptionId == null || v.subscriptionId === "")
      delete v.subscriptionId;
  }
  if (kind === "measurements" || kind === "assignments") delete v.memberId;
  const schema = context.editing
    ? config.update || config.request
    : config.request;
  const result = schema.safeParse(v);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues)
      errors[issue.path.join(".")] = issue.message;
  }
  // The mobile form requires an explicit date even though the API can default it.
  for (const f of kind === "attendance"
    ? editorFields(kind, values, context)
    : []) {
    const value = values[f.key];
    if (
      f.required &&
      (value == null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && !value.length))
    ) {
      errors[f.key] = "Required";
    }
  }
  return {
    data: result.success ? result.data : undefined,
    errors,
    valid: result.success && !Object.keys(errors).length,
  };
}

export function editorErrors(
  validation: ReturnType<typeof validateEditor>,
  attempted: boolean,
) {
  return attempted ? validation.errors : {};
}
