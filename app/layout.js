export const metadata = {
  title: '미래공학 학급 홈페이지',
  description: '미래공학 학급 홈페이지입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
