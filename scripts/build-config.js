/**
 * Vercel 배포 시 환경 변수를 config.js에 주입하는 스크립트
 * 
 * 사용 방법:
 * 1. Vercel Dashboard에서 환경 변수 설정
 * 2. package.json에 build 스크립트 추가
 * 3. Vercel이 배포 시 자동 실행
 */

const fs = require('fs');
const path = require('path');

// 환경 변수에서 가져오기
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// config.js 내용 생성
const configContent = `/**
 * BNI 최강챕터 - Supabase 설정
 * 
 * ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
 * Vercel 환경 변수에서 자동으로 주입됩니다.
 */

// Supabase 설정 (Vercel 환경 변수에서 주입)
window.SUPABASE_URL = '${SUPABASE_URL}';
window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
`;

// config.js 파일 경로
const configPath = path.join(__dirname, '..', 'config.js');

// 파일 작성
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js generated successfully');
console.log(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

