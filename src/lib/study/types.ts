export type StudyView = "overview" | "subjects" | "assignments" | "exams" | "sessions";
export type Subject = {
  id: string; name: string; professor: string; schedule_notes: string;
  semester: string; priority: number; active: boolean;
};
export type Assignment = {
  id: string; subject_id: string; title: string; details: string;
  due_date: string; status: "pending" | "in_progress" | "completed"; priority: number;
};
export type Exam = {
  id: string; subject_id: string; title: string; exam_date: string; notes: string;
  exam_type: "exam" | "quiz" | "presentation" | "other";
  status: "scheduled" | "completed" | "cancelled";
};
export type StudySession = {
  id: string; subject_id: string; study_date: string; topic: string;
  duration_minutes: number; notes: string;
};
