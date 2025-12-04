-- ============================================
-- RLS 정책 수정 SQL
-- ============================================
-- 이 파일은 Supabase SQL Editor에서 실행하세요
-- 기존 정책을 삭제하고 새로 생성합니다

-- 기존 정책 삭제 (모든 가능한 정책 이름)
DROP POLICY IF EXISTS "Public write access" ON categories;
DROP POLICY IF EXISTS "Public write access" ON subcategories;
DROP POLICY IF EXISTS "Public write access" ON members;
DROP POLICY IF EXISTS "Public write access" ON advertisements;
DROP POLICY IF EXISTS "Public write access" ON visitor_inquiries;
DROP POLICY IF EXISTS "Public write access" ON click_logs;

-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Public insert access" ON categories;
DROP POLICY IF EXISTS "Public insert access" ON subcategories;
DROP POLICY IF EXISTS "Public insert access" ON members;
DROP POLICY IF EXISTS "Public insert access" ON advertisements;
DROP POLICY IF EXISTS "Public insert access" ON visitor_inquiries;
DROP POLICY IF EXISTS "Public insert access" ON click_logs;

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Public update access" ON categories;
DROP POLICY IF EXISTS "Public update access" ON subcategories;
DROP POLICY IF EXISTS "Public update access" ON members;
DROP POLICY IF EXISTS "Public update access" ON advertisements;
DROP POLICY IF EXISTS "Public update access" ON visitor_inquiries;

-- 기존 DELETE 정책 삭제
DROP POLICY IF EXISTS "Public delete access" ON categories;
DROP POLICY IF EXISTS "Public delete access" ON subcategories;
DROP POLICY IF EXISTS "Public delete access" ON members;
DROP POLICY IF EXISTS "Public delete access" ON advertisements;
DROP POLICY IF EXISTS "Public delete access" ON visitor_inquiries;
DROP POLICY IF EXISTS "Public delete access" ON click_logs;

-- 기존 SELECT 정책 삭제 (click_logs)
DROP POLICY IF EXISTS "Public select access" ON click_logs;

-- INSERT 정책 생성
CREATE POLICY "Public insert access" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON advertisements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON visitor_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON click_logs FOR INSERT WITH CHECK (true);

-- UPDATE 정책 생성
CREATE POLICY "Public update access" ON categories FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON subcategories FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON members FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON advertisements FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON visitor_inquiries FOR UPDATE USING (true);

-- DELETE 정책 생성
CREATE POLICY "Public delete access" ON categories FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON subcategories FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON members FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON advertisements FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON visitor_inquiries FOR DELETE USING (true);
CREATE POLICY "Public delete access" ON click_logs FOR DELETE USING (true);

-- SELECT 정책 (click_logs는 관리자용)
CREATE POLICY "Public select access" ON click_logs FOR SELECT USING (true);

