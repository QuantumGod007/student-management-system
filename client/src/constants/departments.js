export const DEPARTMENTS = [
  { value: "CSE", label: "Computer Engineering (CSE)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "AIDS", label: "AI & Data Science (AI&DS)" },
  { value: "ECE", label: "Electronics & Telecommunication (E&TC)" },
  { value: "EEE", label: "Electrical Engineering (EEE)" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
];

export const DEPARTMENT_LABELS = DEPARTMENTS.reduce((labels, department) => {
  labels[department.value] = department.label;
  return labels;
}, {});

export const YEARS = [1, 2, 3, 4];

export const DIVISIONS = ["A", "B", "C", "D"];

export const getDepartmentLabel = (value) => {
  if (!value) return "—";
  return DEPARTMENT_LABELS[value] || value;
};

export const formatYear = (year) => (year ? `Year ${year}` : "—");
