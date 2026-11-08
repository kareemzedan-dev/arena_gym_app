import * as S from "@arena/shared";
import { z } from "zod";
export type FormField = {
  key: string;
  en: string;
  ar: string;
  type?:
    | "text"
    | "number"
    | "decimal"
    | "date"
    | "time"
    | "password"
    | "textarea"
    | "boolean"
    | "select"
    | "multi";
  endpoint?: string;
  options?: string[];
  required?: boolean;
};
export type EditorConfig = {
  en: string;
  ar: string;
  fields: FormField[];
  request: z.ZodTypeAny;
  update?: z.ZodTypeAny;
  response: z.ZodTypeAny;
  list?: z.ZodTypeAny;
  defaults?: Record<string, unknown>;
};
const field = (
  key: string,
  en: string,
  ar: string,
  type: FormField["type"] = "text",
  required = false,
): FormField => ({ key, en, ar, type, required });
const ref = (
  key: string,
  en: string,
  ar: string,
  endpoint: string,
  required = false,
  type: FormField["type"] = "text",
): FormField => ({ ...field(key, en, ar, type, required), endpoint });
const identity = [
  field("fullName", "Full name", "الاسم بالكامل", "text", true),
  field("username", "Username", "اسم المستخدم", "text", true),
  field(
    "password",
    "Password (8+ characters)",
    "كلمة المرور (٨ أحرف على الأقل)",
    "password",
    true,
  ),
  field("mobile", "Mobile", "الهاتف المحمول"),
  field("email", "Email", "البريد الإلكتروني"),
  ref("branchId", "Branch", "الفرع", "/branches/active", true),
];
export const configs: Record<string, EditorConfig> = {
  members: {
    en: "Member",
    ar: "العضو",
    request: S.MemberRequest,
    update: S.MemberUpdateRequest,
    response: S.MemberResponse,
    list: S.MemberListResponse,
    fields: [
      ...identity,
      ref("coachId", "Coach", "المدرب", "/coaches"),
      {
        ...field("gender", "Gender", "النوع", "select"),
        options: ["MALE", "FEMALE"],
      },
      field(
        "birthDate",
        "Date of birth · YYYY-MM-DD",
        "تاريخ الميلاد · YYYY-MM-DD",
        "date",
      ),
      field("address", "Address", "العنوان"),
      field("healthNotes", "Health notes", "ملاحظات صحية", "textarea"),
      field("notes", "Notes", "ملاحظات", "textarea"),
    ],
  },
  staff: {
    en: "Coach / staff",
    ar: "المدرب / الفريق",
    request: S.StaffRequest,
    update: S.StaffUpdateRequest,
    response: S.StaffResponse,
    list: S.StaffListResponse,
    defaults: { role: "STAFF_MEMBER", availableForPt: true },
    fields: [
      ...identity,
      {
        ...field("role", "Role", "الدور", "select", true),
        options: S.StaffRole.options,
      },
      field(
        "availableForPt",
        "Available for personal training",
        "متاح للتدريب الشخصي",
        "boolean",
      ),
      field("specialty", "Specialty", "التخصص"),
      field("yearsExperience", "Years of experience", "سنوات الخبرة", "number"),
      field("certifications", "Certifications", "الشهادات", "textarea"),
      field(
        "photoUrl",
        "Profile image URL · https://",
        "رابط صورة المدرب · https://",
      ),
    ],
  },
  "plan-categories": {
    en: "Plan category",
    ar: "تصنيف الاشتراك",
    request: S.PlanCategoryRequest,
    response: S.PlanCategoryResponse,
    list: S.PlanCategoryListResponse,
    defaults: { isActive: true },
    fields: [
      field("name", "Name", "الاسم", "text", true),
      field("isActive", "Active", "نشط", "boolean"),
    ],
  },
  plans: {
    en: "Membership plan",
    ar: "خطة الاشتراك",
    request: S.PlanRequest,
    response: S.PlanResponse,
    list: S.PlanListResponse,
    defaults: {
      scope: "GYM",
      durationDays: 30,
      ptSessions: 1,
      signupFee: "0",
      isActive: true,
    },
    fields: [
      field("name", "Name", "الاسم", "text", true),
      ref("categoryId", "Category", "التصنيف", "/plan-categories", true),
      field("price", "Price · OMR", "السعر · ر.ع.", "decimal", true),
      field("durationDays", "Duration · days", "المدة بالأيام", "number", true),
      {
        ...field("scope", "Plan type", "نوع الاشتراك", "select", true),
        options: ["GYM", "PT", "BUNDLE"],
      },
      field("ptSessions", "PT sessions", "جلسات التدريب الشخصي", "number"),
      field(
        "ptValidityDays",
        "PT validity · days",
        "صلاحية التدريب بالأيام",
        "number",
      ),
      field(
        "gymAccessDays",
        "Gym validity · days",
        "صلاحية النادي بالأيام",
        "number",
      ),
      field("signupFee", "Signup fee · OMR", "رسوم التسجيل · ر.ع.", "decimal"),
      field("description", "Description", "الوصف", "textarea"),
      field("isActive", "Active", "نشط", "boolean"),
    ],
  },
  classes: {
    en: "Class",
    ar: "الحصة",
    request: S.ClassRequest,
    update: S.ClassUpdateRequest,
    response: S.ClassResponse,
    list: S.ClassListResponse,
    defaults: {
      weekDays: [0, 2, 4],
      planIds: [],
      capacity: 15,
      bookingEnabled: true,
    },
    fields: [
      field("name", "Name", "الاسم", "text", true),
      ref("coachId", "Coach", "المدرب", "/coaches", true),
      ref("branchId", "Branch", "الفرع", "/branches/active", true),
      ref("planIds", "Memberships", "الاشتراكات", "/plans", true, "multi"),
      {
        ...field(
          "weekDays",
          "Weekdays (0=Sun … 6=Sat)",
          "أيام الأسبوع (٠=الأحد … ٦=السبت)",
          "multi",
          true,
        ),
        options: ["0", "1", "2", "3", "4", "5", "6"],
      },
      field("startTime", "Starts · HH:mm", "البداية · HH:mm", "time", true),
      field("endTime", "Ends · HH:mm", "النهاية · HH:mm", "time", true),
      field(
        "startDate",
        "Start date · YYYY-MM-DD",
        "تاريخ البداية · YYYY-MM-DD",
        "date",
        true,
      ),
      field(
        "endDate",
        "End date · YYYY-MM-DD",
        "تاريخ النهاية · YYYY-MM-DD",
        "date",
        true,
      ),
      field("capacity", "Capacity", "السعة", "number", true),
      field("bookingEnabled", "Booking enabled", "الحجز متاح", "boolean"),
    ],
  },
  exercises: {
    en: "Exercise",
    ar: "التمرين",
    request: S.ExerciseRequest,
    response: S.ExerciseResponse,
    list: S.ExerciseListResponse,
    fields: [
      field("name", "Name", "الاسم", "text", true),
      field(
        "videoUrl",
        "Video URL · https://",
        "رابط فيديو التمرين · https://",
      ),
    ],
  },
  "workout-plans": {
    en: "Workout plan",
    ar: "خطة التمرين",
    request: S.WorkoutRequest,
    response: S.WorkoutResponse,
    list: S.WorkoutListResponse,
    fields: [field("name", "Plan name", "اسم الخطة", "text", true)],
    defaults: { items: [] },
  },
  "nutrition-plans": {
    en: "Nutrition plan",
    ar: "خطة التغذية",
    request: S.NutritionRequest,
    response: S.NutritionResponse,
    list: S.NutritionListResponse,
    fields: [
      field("name", "Plan name", "اسم الخطة", "text", true),
      ref("memberId", "Member", "العضو", "/members", true),
      field(
        "startDate",
        "Start date · YYYY-MM-DD",
        "تاريخ البداية · YYYY-MM-DD",
        "date",
      ),
      field(
        "endDate",
        "End date · YYYY-MM-DD",
        "تاريخ النهاية · YYYY-MM-DD",
        "date",
      ),
    ],
    defaults: { meals: [] },
  },
  measurements: {
    en: "Measurements",
    ar: "القياسات",
    request: S.MeasurementRequest,
    response: S.MeasurementResponse,
    fields: [
      field(
        "measuredOn",
        "Measured on · YYYY-MM-DD",
        "تاريخ القياس · YYYY-MM-DD",
        "date",
        true,
      ),
      ...S.measurementFields.map((k) => field(k, k, k, "decimal")),
    ],
  },
  assignments: {
    en: "Assign workout",
    ar: "إسناد تمرين",
    request: S.AssignmentRequest,
    response: S.AssignmentResponse,
    fields: [
      ref(
        "workoutPlanId",
        "Workout plan",
        "خطة التمرين",
        "/workout-plans",
        true,
      ),
      field(
        "startDate",
        "Start date · YYYY-MM-DD",
        "تاريخ البداية · YYYY-MM-DD",
        "date",
        true,
      ),
      field(
        "endDate",
        "End date · YYYY-MM-DD",
        "تاريخ النهاية · YYYY-MM-DD",
        "date",
      ),
    ],
  },
  attendance: {
    en: "Attendance",
    ar: "الحضور",
    request: S.AttendanceRequest,
    response: S.AttendanceResponse,
    defaults: { type: "GYM" },
    fields: [
      ref("memberId", "Member", "العضو", "/members", true),
      field(
        "attendedOn",
        "Date · YYYY-MM-DD",
        "التاريخ · YYYY-MM-DD",
        "date",
        true,
      ),
      {
        ...field("type", "Type", "نوع الحضور", "select", true),
        options: ["GYM", "PT", "CLASS"],
      },
      ref("classId", "Class", "الحصة", "/classes"),
    ],
  },
};
