export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^(01[0-9]|0[2-9][0-9]?)-\d{3,4}-\d{4}$/.test(phone);
}

export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

export function hasRequiredInstructorFields(form) {
  return (
    form.name &&
    form.email &&
    form.phone &&
    form.region &&
    form.main_topic
  );
}
