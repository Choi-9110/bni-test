# BNI 최강챕터 - 고양·일산 비즈니스 네트워크 플랫폼

BNI 고양지역 최강챕터 멤버들의 전문 서비스 홍보, 리퍼럴 활동 강화, 비지터 초대 간소화, 지역 비즈니스 연결 활성화를 목표로 하는 웹 플랫폼입니다.

## 🎯 프로젝트 목표

- **멤버 전문 서비스 홍보**: 업종별 구조화된 페이지 제공
- **리퍼럴 활동 촉진**: 전화·홈페이지·SNS·카카오 버튼으로 즉시 연결
- **비지터 초대 편의성**: 간단 문의 → 담당자 자동 연결
- **SEO 강화**: 업종명·지역명 기반 최적화된 구조 제공
- **지역 비즈니스 활성화**: 고양/일산 중심 네트워크 플랫폼
- **광고 수익 구조**: 배너/사이드바/푸터 광고 슬롯 운영

## ✅ 구현 완료 기능

### 사용자 기능 (프론트엔드)
- [x] **홈 화면**: 광고 배너 슬라이더, 업종 카테고리 바로가기, 추천 멤버 카드
- [x] **배너 광고**: 상단 메인 슬라이더 광고 (자동 재생)
- [x] **사이드바 광고**: 우측 사이드바 광고 영역 (데스크톱 1024px 이상)
- [x] **푸터 광고**: 푸터 상단 3단 광고 영역 (모든 페이지 자동 삽입)
- [x] **전문가 찾기**: 카테고리/소카테고리별 멤버 검색 및 필터링
- [x] **멤버 상세 페이지**: USP 정보, 연락처 버튼 (전화/SNS/카카오/홈페이지)
- [x] **멤버 전체보기**: 전체 멤버 리스트, 지역/업종별 필터링
- [x] **비지터 초대 폼**: 조찬모임 참석 신청 양식
- [x] **BNI 소개**: BNI 시스템 및 최강챕터 소개
- [x] **검색 기능**: 회사명, 이름, 업종 검색
- [x] **지역 필터**: 고양/일산 지역별 필터링
- [x] **모바일 반응형**: 모바일 우선 설계
- [x] **클릭 추적**: 전화/홈페이지/SNS/카카오 클릭 자동 로깅

### 관리자 기능 (백엔드)
- [x] **관리자 대시보드**: 통계 요약, 최근 문의, 클릭 통계
- [x] **멤버 관리 (CRUD)**: 멤버 추가/수정/삭제, 추천 멤버 설정
- [x] **카테고리 관리**: 대분류/소분류 카테고리 관리
- [x] **광고 관리**: 배너/사이드바/푸터 광고 등록/수정/삭제
- [x] **문의 관리**: 비지터 문의 조회, 상태 변경, 삭제
- [x] **통계/분석**: 멤버별 클릭 통계, 클릭 로그 조회
- [x] **관리자 인증**: 비밀번호 기반 세션 인증

## 📁 프로젝트 구조

```
/
├── index.html              # 메인 홈페이지
├── category.html           # 전문가 찾기 (카테고리별)
├── member.html             # 멤버 상세 페이지
├── members.html            # 멤버 전체보기
├── visitor.html            # 비지터 초대 (조찬모임 신청)
├── about.html              # BNI 소개
├── css/
│   └── style.css           # 메인 스타일시트 (디자인 시스템)
├── js/
│   ├── data.js             # 데이터 서비스 (RESTful API + 클릭 추적)
│   ├── main.js             # 메인 JavaScript (공통 기능 + 광고)
│   ├── category.js         # 카테고리 페이지 기능
│   └── member.js           # 멤버 상세 페이지 기능
├── admin/                  # 관리자 페이지
│   ├── index.html          # 관리자 대시보드
│   ├── css/
│   │   └── admin.css       # 관리자 스타일시트
│   └── js/
│       └── admin.js        # 관리자 JavaScript (CRUD + 통계)
└── README.md               # 프로젝트 문서
```

## 🔗 주요 페이지 URI

### 사용자 페이지
| 페이지 | 경로 | 파라미터 |
|--------|------|----------|
| 홈 | `/index.html` | - |
| 전문가 찾기 | `/category.html` | `?cat={category_id}`, `?sub={subcategory_id}`, `?region={지역}` |
| 멤버 상세 | `/member.html` | `?id={member_id}` |
| 멤버 전체보기 | `/members.html` | - |
| 비지터 초대 | `/visitor.html` | - |
| BNI 소개 | `/about.html` | `#system`, `#chapter` |

### 관리자 페이지
| 페이지 | 경로 | 설명 |
|--------|------|------|
| 관리자 대시보드 | `/admin/index.html` | 기본 비밀번호: `admin123` |
| 멤버 관리 | `/admin/index.html#members` | 멤버 CRUD |
| 카테고리 관리 | `/admin/index.html#categories` | 카테고리 CRUD |
| 광고 관리 | `/admin/index.html#ads` | 광고 CRUD |
| 문의 관리 | `/admin/index.html#inquiries` | 문의 관리 |
| 통계 | `/admin/index.html#analytics` | 클릭 통계 |

## 📊 데이터 모델

### advertisements (광고) ⭐
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 광고 ID |
| title | text | 광고 제목 |
| image_url | text | 광고 이미지 URL |
| link_url | text | 클릭 시 이동 URL |
| description | text | 광고 설명 (사이드바/푸터용) |
| position | text | 광고 위치 (banner/sidebar/footer) |
| member_id | text | 광고주 멤버 ID |
| start_date | datetime | 시작일 |
| end_date | datetime | 종료일 |
| price | number | 광고비 (원) |
| is_active | bool | 활성화 여부 |
| order | number | 정렬 순서 |

### members (멤버)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 멤버 ID |
| name | text | 이름 |
| company | text | 회사명 |
| position | text | 직함 |
| category_id | text | 대카테고리 ID |
| subcategory_id | text | 소카테고리 ID |
| phone | text | 전화번호 |
| homepage | text | 홈페이지 URL |
| sns_url | text | SNS URL |
| kakao_url | text | 카카오 채널 URL |
| profile_img | text | 프로필 이미지 URL |
| usp_img | text | USP 전단지 이미지 URL |
| usp_summary | text | USP 요약 |
| tags | array | 검색 태그 |
| region | text | 지역 (고양/일산) |
| is_featured | bool | 추천 멤버 여부 |

### click_logs (클릭 로그)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 로그 ID |
| member_id | text | 멤버 ID |
| action_type | text | 액션 유형 (phone/homepage/sns/kakao/profile_view) |
| timestamp | datetime | 클릭 시간 |
| user_agent | text | 브라우저 정보 |
| referrer | text | 유입 경로 |

## 📢 광고 시스템

### 💡 광고 사용 방법

**1. 배너 광고 (메인 슬라이더)**
- `/admin/index.html#ads` 접속 → "광고 추가"
- 위치: **배너** 선택
- 권장 이미지: 1200x300px
- 표시 위치: 홈 페이지 상단 슬라이더
- 자동 재생 (5초 간격)

**2. 사이드바 광고 (우측 사이드)**
- 위치: **사이드바** 선택
- 권장 이미지: 400x200px
- **설명 필드 필수 입력**
- 표시 위치: 홈 페이지 우측 (데스크톱 1024px 이상)

**3. 푸터 광고 (하단 3단)**
- 위치: **푸터** 선택
- 권장 이미지: 600x150px
- 설명 필드 선택 입력
- 표시 위치: **모든 페이지** 푸터 상단 (자동 삽입)

### 📊 광고 슬롯 요금표

| 위치 | 권장 이미지 크기 | 월 광고비 | 노출 페이지 | 특징 |
|------|-----------------|----------|------------|------|
| 배너 | 1200x300px | 10만원 | 홈 페이지 | 상단 슬라이더, 최대 노출 |
| 사이드바 | 400x200px | 5만원 | 홈 페이지 | 우측 고정, 스크롤 가능 |
| 푸터 | 600x150px | 3만원 | 전체 페이지 | 모든 페이지 자동 노출 |

## 🔧 RESTful API

### 광고 조회
```javascript
// 배너 광고
await DataService.getAdvertisements('banner');

// 사이드바 광고
await DataService.getAdvertisements('sidebar');

// 푸터 광고
await DataService.getAdvertisements('footer');
```

### 클릭 로그
```javascript
// 자동 클릭 추적 (ClickTracker.init()으로 활성화됨)
// 또는 수동 로깅
await DataService.logClick('member-001', 'phone');
```

## 🎨 디자인 시스템

### 컬러 팔레트
- Primary: `#D6001C` (BNI Red)
- Primary Dark: `#A40014`
- Gray 900: `#1A1A1A`
- Gray 200: `#E5E5E5`
- White: `#FFFFFF`

### 광고 카드 스타일
- White Background
- Border Radius: 12px
- Shadow: 0 4px 6px rgba(0, 0, 0, 0.07)
- Hover: translateY(-4px) + 더 진한 그림자

## 📱 반응형 브레이크포인트

- Mobile: < 640px (사이드바 광고 숨김)
- Tablet: 640px - 1024px
- Desktop: > 1024px (사이드바 광고 표시)

## 🛠 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: CSS Variables, Flexbox, Grid
- **JavaScript (ES6+)**: 모듈 패턴, async/await
- **Font**: Noto Sans KR (Google Fonts)
- **Icons**: Font Awesome 6
- **Backend**: Supabase (PostgreSQL + RESTful API)

> 📚 **Supabase 설정**: `SUPABASE_SETUP.md` 파일을 참고하세요.

## 🔐 관리자 접속

1. `/admin/index.html` 접속
2. 비밀번호 입력: `admin123` (기본값)
3. 대시보드에서 각 메뉴 접근

> ⚠️ **보안 주의**: 실제 운영 시 비밀번호를 변경하세요. (`admin/js/admin.js`의 `Auth.ADMIN_PASSWORD`)

## 🚀 배포 및 운영

### 배포 방법
상단의 "Publish" 탭을 클릭하여 웹사이트를 배포하세요.

### 운영 체크리스트
1. ✅ 관리자 비밀번호 변경
2. ✅ 실제 멤버 데이터 등록 (관리자 → 멤버 관리)
3. ✅ 광고 이미지 및 링크 설정 (관리자 → 광고 관리)
4. ✅ 조찬모임 장소 및 연락처 정보 업데이트
5. ✅ SEO 메타 태그 업데이트
6. ✅ 광고 슬롯 판매 시작

## 📞 연락처 버튼 동작

- **전화**: `tel:` 프로토콜로 직접 연결 + 클릭 로깅
- **카카오**: 카카오톡 채널 URL로 이동 + 클릭 로깅
- **홈페이지**: 새 탭에서 열기 + 클릭 로깅
- **SNS**: 새 탭에서 열기 + 클릭 로깅

---

**BNI 최강챕터** - 고양·일산 지역 대표 비즈니스 네트워크 플랫폼

© 2024 BNI 최강챕터. All rights reserved.
