/**
 * BNI 최강챕터 - Supabase 설정
 * 
 * 사용 방법:
 * 1. Supabase Dashboard에서 Project URL과 anon key를 복사
 * 2. 아래 값들을 수정
 * 3. 또는 환경 변수 사용 (Vercel 등)
 */

// Supabase 설정
// 방법 1: 직접 입력 (GitHub Pages 등 환경 변수 미지원 시)
window.SUPABASE_URL = 'https://jhigjfiwjrrpatlagnll.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWdqZml3anJycGF0bGFnbmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjkxNDMsImV4cCI6MjA4MDQwNTE0M30.UuAGmFvsFPFZ2q1x2CWCkzb51RPOaQrG8O_Aq5ivpWc';

// 방법 2: 환경 변수 사용 (Vercel 등)
// Vercel에서는 자동으로 환경 변수가 window 객체에 주입됩니다
if (typeof window !== 'undefined') {
  // 환경 변수가 있으면 사용, 없으면 위의 기본값 사용
  if (window.SUPABASE_URL && window.SUPABASE_URL !== 'https://jhigjfiwjrrpatlagnll.supabase.co') {
    // 이미 설정됨
  } else if (process && process.env && process.env.SUPABASE_URL) {
    window.SUPABASE_URL = process.env.SUPABASE_URL;
    window.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  }
}

