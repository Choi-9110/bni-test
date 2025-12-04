/**
 * BNI 최강챕터 - Data Management Module
 * Supabase RESTful API를 통해 테이블 데이터를 관리합니다.
 */

const DataService = {
  // Supabase API 설정
  // 환경 변수에서 가져오거나, 직접 입력하세요
  getSupabaseUrl() {
    // 환경 변수 우선, 없으면 기본값 (직접 입력 필요)
    const defaultUrl = 'https://YOUR_PROJECT.supabase.co';
    const url = window.SUPABASE_URL || 'https://jhigjfiwjrrpatlagnll.supabase.co';

    // 디버깅: URL이 기본값인지 확인 (실제 URL이 설정되었는지)
    if (url === defaultUrl || url.includes('YOUR_PROJECT')) {
      console.warn('⚠️ Supabase URL이 설정되지 않았습니다!');
      console.warn('config.js 파일에 SUPABASE_URL을 입력하거나, data.js의 기본값을 수정하세요.');
    }

    return url;
  },

  getSupabaseKey() {
    // 환경 변수 우선, 없으면 기본값 (직접 입력 필요)
    const defaultKey = 'YOUR_ANON_KEY';
    const key = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWdqZml3anJycGF0bGFnbmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjkxNDMsImV4cCI6MjA4MDQwNTE0M30.UuAGmFvsFPFZ2q1x2CWCkzb51RPOaQrG8O_Aq5ivpWc';

    // 디버깅: 키가 기본값인지 확인 (실제 키가 설정되었는지)
    if (key === defaultKey || key.includes('YOUR_ANON_KEY')) {
      console.warn('⚠️ Supabase API Key가 설정되지 않았습니다!');
      console.warn('config.js 파일에 SUPABASE_ANON_KEY를 입력하거나, data.js의 기본값을 수정하세요.');
    }

    return key;
  },

  getBaseUrl() {
    return `${this.getSupabaseUrl()}/rest/v1`;
  },

  // API 요청 헤더
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.getSupabaseKey(),
      'Authorization': `Bearer ${this.getSupabaseKey()}`
    };
  },

  // Cache for data
  cache: {
    categories: null,
    subcategories: null,
    members: null,
    advertisements: null
  },

  /**
   * Fetch data from table with pagination
   */
  async fetchTable(tableName, options = {}) {
    const { page = 1, limit = 100, search = '', sort = '' } = options;
    const baseUrl = this.getBaseUrl();

    // Supabase는 offset 기반 페이지네이션 사용
    const offset = (page - 1) * limit;
    let url = `${baseUrl}/${tableName}?limit=${limit}&offset=${offset}`;

    // 정렬 (Supabase 형식: order=column.asc 또는 order=column.desc)
    if (sort) {
      url += `&order=${sort}.asc`;
    } else {
      // 기본 정렬: order 컬럼
      url += `&order=order.asc`;
    }

    // 검색은 클라이언트 사이드에서 처리 (Supabase는 별도 필터 필요)

    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status} for ${tableName}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      // Supabase는 배열을 직접 반환
      const data = await response.json();
      const result = Array.isArray(data) ? data : [];
      
      // 데이터가 없을 때만 로그 (0개는 정상일 수 있음)
      if (result.length === 0) {
        console.log(`ℹ️ ${tableName}: 데이터가 없습니다. (테이블이 비어있거나 RLS 정책 확인 필요)`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Error fetching ${tableName}:`, error);

      // CORS 에러인지 확인
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        console.error('💡 CORS 에러일 수 있습니다. Supabase Dashboard → Settings → API에서 CORS 설정을 확인하세요.');
      }

      return [];
    }
  },

  /**
   * Get single record by ID
   */
  async getById(tableName, id) {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${tableName}?id=eq.${id}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching ${tableName}/${id}:`, error);
      return null;
    }
  },

  /**
   * Create new record
   */
  async create(tableName, data) {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${tableName}`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation' // 생성된 데이터 반환
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      const result = await response.json();
      // Supabase는 배열로 반환
      return Array.isArray(result) && result.length > 0 ? result[0] : result;
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      return null;
    }
  },

  /**
   * Update record
   */
  async update(tableName, id, data) {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${tableName}?id=eq.${id}`, {
        method: 'PATCH', // Supabase는 PATCH 사용
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      const result = await response.json();
      return Array.isArray(result) && result.length > 0 ? result[0] : result;
    } catch (error) {
      console.error(`Error updating ${tableName}/${id}:`, error);
      return null;
    }
  },

  /**
   * Delete record
   */
  async delete(tableName, id) {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${tableName}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error(`Error deleting ${tableName}/${id}:`, error);
      return false;
    }
  },

  // =====================
  // Specialized Methods
  // =====================

  /**
   * Get all categories
   */
  async getCategories() {
    if (this.cache.categories) return this.cache.categories;
    const data = await this.fetchTable('categories', { sort: 'order' });
    this.cache.categories = data.sort((a, b) => (a.order || 0) - (b.order || 0));
    return this.cache.categories;
  },

  /**
   * Get subcategories by category ID
   */
  async getSubcategories(categoryId = null) {
    if (!this.cache.subcategories) {
      const data = await this.fetchTable('subcategories', { sort: 'order' });
      this.cache.subcategories = data.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    if (categoryId) {
      return this.cache.subcategories.filter(sub => sub.category_id === categoryId);
    }
    return this.cache.subcategories;
  },

  /**
   * Get all members with optional filters
   */
  async getMembers(filters = {}) {
    if (!this.cache.members) {
      const data = await this.fetchTable('members', { sort: 'order' });
      this.cache.members = data.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    let members = [...this.cache.members];

    // Apply filters
    if (filters.categoryId) {
      members = members.filter(m => m.category_id === filters.categoryId);
    }
    if (filters.subcategoryId) {
      members = members.filter(m => m.subcategory_id === filters.subcategoryId);
    }
    if (filters.region) {
      members = members.filter(m => m.region && m.region.includes(filters.region));
    }
    if (filters.featured) {
      members = members.filter(m => m.is_featured);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      members = members.filter(m =>
        m.name?.toLowerCase().includes(searchLower) ||
        m.company?.toLowerCase().includes(searchLower) ||
        m.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        m.usp_summary?.toLowerCase().includes(searchLower)
      );
    }

    return members;
  },

  /**
   * Get featured members
   */
  async getFeaturedMembers() {
    return this.getMembers({ featured: true });
  },

  /**
   * Get member by ID
   */
  async getMember(id) {
    const members = await this.getMembers();
    return members.find(m => m.id === id);
  },

  /**
   * Get active advertisements
   */
  async getAdvertisements(position = null) {
    if (!this.cache.advertisements) {
      const data = await this.fetchTable('advertisements', { sort: 'order' });
      this.cache.advertisements = data
        .filter(ad => ad.is_active)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    if (position) {
      return this.cache.advertisements.filter(ad => ad.position === position);
    }
    return this.cache.advertisements;
  },

  /**
   * Submit visitor inquiry
   */
  async submitInquiry(data) {
    const inquiryData = {
      ...data,
      status: 'pending',
      inquiry_type: data.inquiry_type || 'visitor'
    };
    return this.create('visitor_inquiries', inquiryData);
  },

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      categories: null,
      subcategories: null,
      members: null,
      advertisements: null
    };
  },

  /**
   * Get category by ID
   */
  async getCategory(id) {
    const categories = await this.getCategories();
    return categories.find(c => c.id === id);
  },

  /**
   * Get subcategory by ID
   */
  async getSubcategory(id) {
    const subcategories = await this.getSubcategories();
    return subcategories.find(s => s.id === id);
  },

  /**
   * Log click action for analytics
   * @param {string} memberId - Member ID
   * @param {string} actionType - Action type: phone, homepage, sns, kakao, profile_view
   */
  async logClick(memberId, actionType) {
    try {
      const logData = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        member_id: memberId,
        action_type: actionType,
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'direct'
        // timestamp는 Supabase에서 자동으로 설정됨
      };

      // Fire and forget - don't wait for response
      const baseUrl = this.getBaseUrl();
      fetch(`${baseUrl}/click_logs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(logData)
      }).catch(err => console.log('Click log error:', err));

      return true;
    } catch (error) {
      console.log('Click log error:', error);
      return false;
    }
  }
};

// =====================
// Click Tracking Helper
// =====================
const ClickTracker = {
  /**
   * Initialize click tracking on member action buttons
   */
  init() {
    // Use event delegation for dynamic content
    document.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.member-action-btn, .contact-btn');
      if (!actionBtn) return;

      // Get member ID from parent card or page
      let memberId = null;
      const memberCard = actionBtn.closest('.member-card');
      if (memberCard) {
        memberId = memberCard.dataset.id;
      } else {
        // Check URL for member page
        const params = new URLSearchParams(window.location.search);
        memberId = params.get('id');
      }

      if (!memberId) return;

      // Determine action type
      let actionType = 'profile_view';
      if (actionBtn.classList.contains('phone') || actionBtn.href?.startsWith('tel:')) {
        actionType = 'phone';
      } else if (actionBtn.classList.contains('kakao') || actionBtn.href?.includes('kakao')) {
        actionType = 'kakao';
      } else if (actionBtn.classList.contains('web') || actionBtn.classList.contains('homepage')) {
        actionType = 'homepage';
      } else if (actionBtn.classList.contains('sns') || actionBtn.href?.includes('instagram') || actionBtn.href?.includes('facebook')) {
        actionType = 'sns';
      }

      // Log the click
      DataService.logClick(memberId, actionType);
    });
  }
};

// Export for use in other modules
window.DataService = DataService;
window.ClickTracker = ClickTracker;
