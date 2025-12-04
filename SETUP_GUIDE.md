# 🚀 BNI 최강챕터 - 완전 설정 가이드

이 문서는 프로젝트의 아키텍처와 설정 방법을 한 번에 설명합니다.

---

## 📋 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [빠른 시작 (5분 설정)](#2-빠른-시작-5분-설정)
3. [상세 설정 가이드](#3-상세-설정-가이드)
4. [배포 및 환경 변수 설정](#4-배포-및-환경-변수-설정)
   - [Vercel 배포](#vercel-배포)
   - [GitHub Pages 배포](#github-pages-배포)
   - [커스텀 도메인 연결](#커스텀-도메인-연결)
5. [문제 해결](#5-문제-해결)

---

## 1. 아키텍처 개요

### 1-1. 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    사용자 브라우저                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  정적 파일 (HTML/CSS/JS)                          │  │
│  │  - index.html, category.html, member.html 등     │  │
│  │  - js/data.js (Supabase API 호출)                │  │
│  │  - config.js (환경 변수)                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ fetch() API
┌─────────────────────────────────────────────────────────┐
│              Supabase 클라우드 서버                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  RESTful API (PostgREST)                         │  │
│  │  - /rest/v1/members                              │  │
│  │  - /rest/v1/categories                           │  │
│  │  - /rest/v1/advertisements                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PostgreSQL 데이터베이스                          │  │
│  │  - 6개 테이블 (members, categories 등)            │  │
│  │  - Row Level Security (RLS)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1-2. 아키텍처 특징

**프론트엔드 (정적 사이트)**
- 위치: Vercel 또는 GitHub Pages
- 파일: HTML, CSS, JavaScript (순수 정적 파일)
- 서버 없음: 정적 파일만 호스팅
- 크기: ~170KB (매우 가벼움)

**백엔드/데이터베이스 (Supabase)**
- 위치: Supabase 클라우드 서버
- 역할: PostgreSQL 데이터베이스 + RESTful API
- 서버리스: 별도 서버 관리 불필요
- 무료 티어: 충분한 용량 제공

**통신 방식**
- JavaScript `fetch()` API 사용
- 브라우저에서 직접 Supabase REST API 호출
- CORS: Supabase가 자동 처리

### 1-3. 데이터 흐름 예시

**멤버 추가 시:**
```
1. 사용자 → 관리자 페이지에서 "멤버 추가" 클릭
2. JavaScript → 폼 데이터 수집
3. fetch() → POST https://xxx.supabase.co/rest/v1/members
4. Supabase → PostgreSQL에 데이터 저장
5. 응답 → JavaScript가 UI 업데이트
```

**멤버 조회 시:**
```
1. 사용자 → 홈페이지 접속
2. JavaScript → GET https://xxx.supabase.co/rest/v1/members
3. Supabase → PostgreSQL에서 데이터 조회
4. 응답 → JavaScript가 화면에 렌더링
```

---

## 2. 빠른 시작 (5분 설정)

### 2-1. Supabase 프로젝트 생성 (2분)

1. https://supabase.com 접속 → "Start your project"
2. 새 프로젝트 생성:
   - **Name**: `bni-goyang`
   - **Region**: **Northeast Asia (Seoul)** ⭐
   - **Password**: 강력한 비밀번호 설정 (⚠️ 저장 필수!)
   - **Pricing Plan**: Free
3. 프로젝트 생성 완료 대기 (~2분)

### 2-2. 데이터베이스 테이블 생성 (1분)

1. Supabase Dashboard → **SQL Editor** 클릭
2. 아래 SQL 전체 복사하여 실행:

```sql
-- ============================================
-- BNI 최강챕터 데이터베이스 스키마
-- ============================================

-- 1. categories 테이블
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. subcategories 테이블
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT,
  seo_title TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. members 테이블
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  phone TEXT,
  homepage TEXT,
  sns_url TEXT,
  kakao_url TEXT,
  profile_img TEXT,
  usp_img TEXT,
  usp_summary TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  region TEXT,
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. advertisements 테이블
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  description TEXT,
  position TEXT CHECK (position IN ('banner', 'sidebar', 'footer')),
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  price INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. visitor_inquiries 테이블
CREATE TABLE IF NOT EXISTS visitor_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  interest_category TEXT,
  message TEXT,
  inquiry_type TEXT DEFAULT 'visitor',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. click_logs 테이블
CREATE TABLE IF NOT EXISTS click_logs (
  id TEXT PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('phone', 'homepage', 'sns', 'kakao', 'profile_view')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_category ON members(category_id);
CREATE INDEX IF NOT EXISTS idx_members_subcategory ON members(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_members_featured ON members(is_featured);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_click_logs_member ON click_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_timestamp ON click_logs(timestamp);
```

3. **Table Editor**에서 6개 테이블 생성 확인

### 2-3. RLS 정책 설정 (30초)

SQL Editor에서 아래 SQL 실행:

```sql
-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_logs ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (공개)
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON members FOR SELECT USING (true);
CREATE POLICY "Public read access" ON advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Public insert access" ON visitor_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON click_logs FOR INSERT WITH CHECK (true);

-- 쓰기 정책 (모든 사용자 - 운영 시 관리자 인증 추가 필요)
CREATE POLICY "Public insert access" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON advertisements FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON categories FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON subcategories FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON members FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON advertisements FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON visitor_inquiries FOR UPDATE USING (true);

CREATE POLICY "Public delete access" ON categories FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON subcategories FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON members FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON advertisements FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON visitor_inquiries FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON click_logs FOR DELETE USING (true);

CREATE POLICY "Public select access" ON click_logs FOR SELECT USING (true);
```

> 💡 **참고**: `FIX_RLS_POLICIES.sql` 파일을 사용하면 기존 정책을 삭제하고 새로 생성합니다.

### 2-4. API 키 확인 (30초)

1. Settings → **API** 탭 → **Project URL** 복사
   - 예: `https://jhigjfiwjrrpatlagnll.supabase.co`
2. Settings → **API Keys** 탭 → **anon public** 키 복사
   - 👁️ 아이콘 클릭하여 표시 후 복사

### 2-5. 코드에 Supabase 정보 입력 (1분)

**방법 1: config.js 사용 (GitHub Pages 권장)**

1. `config.js` 파일 열기
2. Supabase 정보 입력:
   ```javascript
   window.SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   window.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
3. 모든 HTML 파일에 이미 추가되어 있음:
   ```html
   <script src="config.js"></script>
   <script src="js/data.js"></script>
   ```

**방법 2: data.js 직접 수정**

1. `js/data.js` 파일 열기
2. `getSupabaseUrl()` 메서드의 기본값 수정
3. `getSupabaseKey()` 메서드의 기본값 수정
4. `admin/js/admin.js`도 동일하게 수정

### 2-6. 테스트 (30초)

1. 브라우저에서 `index.html` 열기
2. 개발자 도구(F12) → Console 확인
3. 에러 없으면 성공! ✅

---

## 3. 상세 설정 가이드

### 3-1. Supabase 프로젝트 생성 (상세)

#### 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (또는 이메일 가입)

#### 프로젝트 생성
1. Dashboard에서 **"New Project"** 클릭
2. 프로젝트 정보 입력:
   - **Name**: `bni-goyang` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정
     - ⚠️ **반드시 저장해두세요!** (복구 불가능)
   - **Region**: **Northeast Asia (Seoul)** 선택
     - 한국 속도 최적화
   - **Pricing Plan**: Free 선택
3. **"Create new project"** 클릭
4. 프로젝트 생성 완료까지 약 2분 대기

### 3-2. 데이터베이스 테이블 생성 (상세)

#### SQL Editor 접속
1. Supabase Dashboard 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 클릭

#### 테이블 생성
위의 "2-2. 데이터베이스 테이블 생성" 섹션의 SQL을 실행하세요.

#### 테이블 확인
1. 왼쪽 메뉴에서 **"Table Editor"** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ categories
   - ✅ subcategories
   - ✅ members
   - ✅ advertisements
   - ✅ visitor_inquiries
   - ✅ click_logs

### 3-3. Row Level Security (RLS) 설정 (상세)

#### RLS 활성화
위의 "2-3. RLS 정책 설정" 섹션의 SQL을 실행하세요.

#### 정책 확인
1. Supabase Dashboard → **Authentication** → **Policies**
2. 각 테이블에 정책이 생성되었는지 확인

### 3-4. API 키 확인 (상세)

#### Project URL 확인
1. Supabase Dashboard → **Settings** → **API** 탭
2. **"Project URL"** 섹션에서 URL 복사
   - 예: `https://jhigjfiwjrrpatlagnll.supabase.co`
   - **"Copy"** 버튼 클릭

#### anon public key 확인
1. Supabase Dashboard → **Settings** → **API Keys** 탭
   - ⚠️ "API"가 아니라 **"API Keys"**입니다!
2. **anon public** 키 확인:
   - 👁️ 아이콘 클릭하여 키 표시
   - **"Copy"** 버튼으로 복사

> ⚠️ **중요**: 
> - `anon public` 키는 공개되어도 괜찮습니다 (프론트엔드에서 사용)
> - `service_role` 키는 **절대 공개하지 마세요!** (서버 사이드 전용)

---

## 4. 배포 및 환경 변수 설정

### 4-1. 아키텍처별 배포 방법

#### Vercel 배포

**특징:**
- 환경 변수 지원 ✅
- 자동 배포 (Git 연동)
- 커스텀 도메인 지원
- CDN 자동 설정

**환경 변수 설정:**
1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. 다음 변수 추가:
   - **Name**: `SUPABASE_URL`
   - **Value**: Supabase Project URL
   - **Environment**: Production, Preview, Development 모두 선택
4. 다음 변수 추가:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Supabase anon key
   - **Environment**: Production, Preview, Development 모두 선택

**환경 변수 인식 방법:**
- Vercel은 빌드 시 환경 변수를 `process.env`에 주입
- 하지만 **순수 정적 사이트는 빌드 과정이 없음**
- 따라서 환경 변수를 사용하려면 빌드 스크립트 필요

**해결 방법:**

**옵션 A: config.js 사용 (간단)**
- `config.js` 파일에 직접 입력
- Git에 커밋 (공개 저장소면 키 노출 주의)

**옵션 B: 빌드 스크립트 사용 (권장)**
- `package.json` 생성:
  ```json
  {
    "scripts": {
      "build": "node build.js"
    }
  }
  ```
- `build.js`에서 환경 변수를 `config.js`에 주입
- Vercel이 빌드 시 자동 실행

#### GitHub Pages 배포

**특징:**
- 환경 변수 미지원 ❌
- 정적 파일만 배포
- 무료 호스팅
- **커스텀 도메인 지원** ✅

**배포 방법:**

**1단계: GitHub 저장소 생성**
1. GitHub에 **자신의 계정**으로 새 저장소 생성 (예: `bni-goyang`)
   - ⚠️ **중요**: 다른 사람의 저장소가 아닌 **본인 계정**으로 생성해야 합니다!
2. 로컬 프로젝트를 Git 저장소로 초기화:
   ```bash
   # 이미 git init이 되어 있다면 생략 가능
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   
   # 기존 원격 저장소가 있다면 제거
   git remote remove origin
   
   # 본인 계정의 새 저장소 연결
   git remote add origin https://github.com/YOUR_USERNAME/bni-goyang.git
   git push -u origin main
   ```
   
   > 💡 **권한 오류 발생 시**: 
   > - `403 Permission denied` 에러가 나면 다른 사람의 저장소에 push하려는 것입니다
   > - 본인 계정으로 새 저장소를 만들고 다시 시도하세요

**2단계: GitHub Pages 활성화**
1. GitHub 저장소 → **Settings** 탭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source** 선택:
   - **Deploy from a branch** 선택
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
4. **Save** 클릭
5. 몇 분 후 `https://YOUR_USERNAME.github.io/bni-goyang/` 접속 가능 

**3단계: Supabase 설정 (config.js 수정)**
1. `config.js` 파일 열기
2. Supabase 정보 입력:
   ```javascript
   window.SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   window.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
3. Git에 커밋 및 푸시:
   ```bash
   git add config.js
   git commit -m "Add Supabase configuration"
   git push
   ```
4. ⚠️ **공개 저장소면 키가 노출됩니다!** (anon key는 공개되어도 괜찮지만 주의)

**4단계: 커스텀 도메인 연결 (선택)**

**도메인 준비:**
- 도메인 구매 (예: `bni-goyang.com`)
- DNS 관리 권한 필요

**GitHub Pages 도메인 설정:**
1. GitHub 저장소 → **Settings** → **Pages**
2. **Custom domain** 섹션에서 도메인 입력:
   - 예: `bni-goyang.com` 또는 `www.bni-goyang.com`
3. **Save** 클릭
4. GitHub가 자동으로 `CNAME` 파일 생성

**DNS 설정 (도메인 제공업체에서):**

**옵션 A: 서브도메인 사용 (www)**
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
TTL: 3600
```

**옵션 B: 루트 도메인 사용 (apex)**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600
```

**옵션 C: ALIAS/ANAME 레코드 (지원되는 경우)**
```
Type: ALIAS (또는 ANAME)
Name: @
Value: YOUR_USERNAME.github.io
TTL: 3600
```

**DNS 전파 대기:**
- 보통 5분~24시간 소요
- https://dnschecker.org 에서 확인 가능

**HTTPS 자동 활성화:**
- GitHub Pages가 자동으로 Let's Encrypt 인증서 발급
- 몇 분~1시간 소요
- **Enforce HTTPS** 옵션 체크 (Settings → Pages)

**환경 변수 인식 방법:**
- GitHub Pages는 환경 변수를 지원하지 않음
- `config.js` 파일을 직접 수정해야 함
- 또는 `js/data.js`와 `admin/js/admin.js`의 기본값 직접 수정

### 4-2. 환경 변수 처리 방식 (중요!)

#### 🔍 핵심 질문: 배포 시 env/config.js는 어떻게 인식되나요?

**답변:**
- **`.env` 파일**: 브라우저에서 직접 읽을 수 없음 ❌
- **`config.js` 파일**: 브라우저가 JavaScript로 실행하여 인식 ✅

#### 현재 코드 구조

**HTML 파일 (예: index.html):**
```html
<script src="config.js"></script>  <!-- 1. 먼저 로드 -->
<script src="js/data.js"></script>  <!-- 2. 그 다음 로드 -->
```

**config.js:**
```javascript
// 브라우저에서 실행되는 JavaScript
window.SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

**js/data.js:**
```javascript
getSupabaseUrl() {
  // 1순위: window.SUPABASE_URL (config.js에서 설정)
  // 2순위: 기본값 (직접 수정)
  return window.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
}
```

#### 배포 시 인식 순서

**1. 브라우저가 HTML 로드**
```
index.html
  ↓
<script src="config.js"></script> 실행
  ↓
window.SUPABASE_URL = '...' 설정
window.SUPABASE_ANON_KEY = '...' 설정
  ↓
<script src="js/data.js"></script> 실행
  ↓
getSupabaseUrl() → window.SUPABASE_URL 읽기 ✅
```

#### Vercel 배포 시 환경 변수 처리

**문제:**
- Vercel은 환경 변수를 `process.env`에 주입
- 하지만 **브라우저는 `process.env`를 읽을 수 없음**
- 순수 정적 사이트는 빌드 과정이 없음

**해결: 빌드 스크립트 사용**

**1. Vercel 환경 변수 설정:**
- Dashboard → Settings → Environment Variables
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` 추가

**2. 빌드 스크립트 실행:**
- Vercel이 배포 시 `npm run build` 자동 실행
- `scripts/build-config.js`가 환경 변수를 읽음
- `config.js` 파일을 자동 생성

**3. 생성된 config.js:**
```javascript
// Vercel 빌드 시 자동 생성됨
window.SUPABASE_URL = 'https://xxx.supabase.co';  // 환경 변수에서 주입
window.SUPABASE_ANON_KEY = 'eyJhbGc...';          // 환경 변수에서 주입
```

**4. 브라우저에서 실행:**
- HTML이 `config.js` 로드
- `window.SUPABASE_URL` 설정됨
- `data.js`가 `window.SUPABASE_URL` 읽기 ✅

#### GitHub Pages 배포 시

**특징:**
- 환경 변수 미지원 ❌
- 빌드 과정 없음
- 정적 파일만 배포

**해결 방법:**

**방법 1: config.js 직접 수정 (간단)**
1. `config.js` 파일에 Supabase 정보 직접 입력
2. Git에 커밋
3. GitHub Pages가 자동 배포
4. ⚠️ **공개 저장소면 키가 노출됨!**

**방법 2: .gitignore 사용 (권장)**
1. `config.js`를 `.gitignore`에 추가
2. 로컬에서만 `config.js` 수정
3. GitHub Actions로 배포 시 `config.js` 생성
4. 또는 `js/data.js`의 기본값 직접 수정

**방법 3: js/data.js 직접 수정 (가장 안전)**
1. `js/data.js`의 `getSupabaseUrl()`, `getSupabaseKey()` 기본값 수정
2. `admin/js/admin.js`도 동일하게 수정
3. Git에 커밋 (코드에 직접 포함)
4. ⚠️ **공개 저장소면 키가 노출됨!**

#### 요약: 환경 변수 인식 방법

| 배포 플랫폼 | 환경 변수 지원 | 처리 방법 | config.js 생성 |
|------------|--------------|----------|---------------|
| **Vercel** | ✅ 지원 | 빌드 스크립트로 자동 생성 | ✅ 자동 |
| **GitHub Pages** | ❌ 미지원 | 직접 수정 필요 | ❌ 수동 |

**공통점:**
- 브라우저는 `config.js`를 JavaScript로 실행
- `window.SUPABASE_URL`이 설정되면 `data.js`가 읽음
- `.env` 파일은 브라우저에서 읽을 수 없음 (Node.js 전용)

#### 🔑 핵심 정리

**Q: `.env` 파일은 왜 안 되나요?**
- A: `.env`는 Node.js 서버에서만 읽을 수 있음
- 브라우저는 서버가 아니므로 `.env`를 읽을 수 없음
- 따라서 `config.js` (JavaScript 파일)로 변환 필요

**Q: Vercel에서 환경 변수는 어떻게 작동하나요?**
- A: 
  1. Vercel Dashboard에서 환경 변수 설정
  2. 배포 시 `process.env`에 주입
  3. 빌드 스크립트가 `process.env` 읽기
  4. `config.js` 파일 생성
  5. 브라우저가 `config.js` 실행

**Q: GitHub Pages는 왜 환경 변수를 지원하지 않나요?**
- A: GitHub Pages는 순수 정적 파일만 호스팅
- 서버 사이드 빌드 과정이 없음
- 따라서 환경 변수를 주입할 방법이 없음
- `config.js`를 직접 수정해야 함

**Q: 빌드 스크립트는 이미 준비되어 있나요?**
- A: ✅ 네! 이미 준비되어 있습니다:
  - `package.json` - 빌드 스크립트 정의
  - `scripts/build-config.js` - 환경 변수 주입 스크립트
  - Vercel 배포 시 자동 실행됨

### 4-3. 배포 체크리스트

#### 배포 전 확인
- [ ] Supabase 프로젝트 생성 완료
- [ ] 모든 테이블 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] API 키 확인 완료
- [ ] `config.js`에 Supabase 정보 입력 (또는 환경 변수 설정)
- [ ] 로컬 테스트 성공

#### 배포 후 확인
- [ ] 모든 페이지 접속 확인
- [ ] 관리자 로그인 확인
- [ ] 데이터 조회/추가 테스트
- [ ] 모바일 반응형 확인

---

## 5. 문제 해결

### 5-1. "Failed to fetch" 에러

**원인 1: Supabase URL/Key 미설정**

**확인:**
- 브라우저 콘솔에 `⚠️ Supabase URL이 설정되지 않았습니다!` 메시지

**해결:**
- `config.js`에 Supabase 정보 입력
- 또는 `js/data.js`의 기본값 수정

**원인 2: CORS 에러**

**확인:**
- `Access to fetch at '...' has been blocked by CORS policy`

**해결:**
- Supabase는 기본적으로 모든 origin 허용
- 다른 원인 확인 (네트워크, 방화벽 등)

**원인 3: 테이블 없음**

**확인:**
- `404 Not Found` 또는 `relation "members" does not exist`

**해결:**
- Supabase Dashboard → Table Editor에서 테이블 확인
- 테이블 생성 SQL 재실행

### 5-2. RLS 정책 에러

**증상:**
- `401 Unauthorized` 또는 `permission denied`
- `new row violates row-level security policy`

**해결:**
1. `FIX_RLS_POLICIES.sql` 파일 실행
2. 또는 "2-3. RLS 정책 설정" SQL 재실행

### 5-3. order 컬럼 에러

**증상:**
- `column click_logs.order does not exist`

**해결:**
- 이미 수정됨 ✅
- `admin.js`가 `order` 컬럼이 없는 테이블은 다른 컬럼으로 정렬

### 5-4. 디버깅 방법

**1. 콘솔 로그 확인**
- 개발자 도구(F12) → Console
- 에러 메시지 확인

**2. Network 탭 확인**
- 개발자 도구(F12) → Network
- `/rest/v1/` 요청 상태 확인
- Status: 200 (성공), 401 (인증 실패), 404 (찾을 수 없음)

**3. Supabase Dashboard 확인**
- Logs → API Logs
- 최근 요청 및 에러 확인

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase REST API 가이드](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)

---

## 📝 파일 구조

### 설정 관련 파일

```
bni-goyang/
├── SETUP_GUIDE.md          # 이 파일 (통합 설정 가이드)
├── README.md               # 프로젝트 개요
├── FIX_RLS_POLICIES.sql    # RLS 정책 수정 SQL
├── config.js               # Supabase 설정 (로컬/GitHub Pages)
├── package.json            # 빌드 스크립트 (Vercel용)
├── scripts/
│   └── build-config.js    # 환경 변수 주입 스크립트 (Vercel용)
└── .gitignore              # config.js 제외 설정
```

### 코드 파일

```
bni-goyang/
├── js/
│   ├── data.js             # Supabase API 연동 (사용자)
│   ├── main.js             # 메인 JavaScript
│   ├── category.js          # 카테고리 페이지
│   └── member.js           # 멤버 페이지
└── admin/
    └── js/
        └── admin.js        # Supabase API 연동 (관리자)
```

---

## ✅ 완료 체크리스트

### 초기 설정
- [ ] Supabase 프로젝트 생성 완료
- [ ] 테이블 6개 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] API 키 확인 완료
- [ ] 코드에 Supabase 정보 입력 완료
- [ ] 로컬 테스트 성공

### 배포 준비
- [ ] 환경 변수 설정 완료 (Vercel) 또는 config.js 수정 완료 (GitHub Pages)
- [ ] 관리자 비밀번호 변경
- [ ] 모든 페이지 테스트 완료

### 운영 준비
- [ ] 멤버 데이터 등록
- [ ] 광고 슬롯 등록
- [ ] 조찬모임 정보 업데이트

---

**설정 완료! 이제 데이터베이스가 정상적으로 작동합니다.** 🎉

