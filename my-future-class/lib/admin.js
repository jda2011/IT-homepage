// 관리자로 지정할 이메일 주소를 배열에 적어줍니다.
export const ADMIN_EMAILS = [
  'teacher@example.com', // 👈 본인의 실제 이메일 주소로 변경하세요!
];

export function checkIsAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
