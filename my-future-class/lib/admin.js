// @jeonin.gwe.hs.kr 도메인을 사용하는 이메일인지 확인하여 관리자 권한 부여
export function checkIsAdmin(email) {
  if (!email) return false;
  
  // 이메일 주소가 @jeonin.gwe.hs.kr 로 끝나는지 확인
  return email.toLowerCase().endsWith('@jeonin.gwe.hs.kr');
}
