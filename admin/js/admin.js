/**
 * BNI 최강챕터 - Admin Dashboard JavaScript
 * 관리자 대시보드 기능을 담당합니다.
 */

// =====================
// Admin Data Service (Supabase API)
// =====================
const AdminService = {
  // Supabase API 설정
  getSupabaseUrl() {
    return window.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
  },
  
  getSupabaseKey() {
    return window.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
  },
  
  getBaseUrl() {
    return `${this.getSupabaseUrl()}/rest/v1`;
  },
  
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.getSupabaseKey(),
      'Authorization': `Bearer ${this.getSupabaseKey()}`
    };
  },
  
  // Get all data from a table
  async getAll(tableName) {
    try {
      const baseUrl = this.getBaseUrl();
      
      // order 컬럼이 없는 테이블 목록
      const tablesWithoutOrder = ['click_logs', 'visitor_inquiries'];
      
      // 정렬 파라미터 설정
      let url = `${baseUrl}/${tableName}?limit=1000`;
      if (tablesWithoutOrder.includes(tableName)) {
        // order 컬럼이 없으면 created_at 또는 timestamp로 정렬
        if (tableName === 'click_logs') {
          url += '&order=timestamp.desc';
        } else if (tableName === 'visitor_inquiries') {
          url += '&order=created_at.desc';
        }
      } else {
        // order 컬럼이 있으면 order로 정렬
        url += '&order=order.asc';
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${errorText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  },
  
  // Create record
  async create(tableName, data) {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${tableName}`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create: ${errorText}`);
      }
      const result = await response.json();
      return Array.isArray(result) && result.length > 0 ? result[0] : result;
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      return null;
    }
  },
  
  // Update record
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
        throw new Error(`Failed to update: ${errorText}`);
      }
      const result = await response.json();
      return Array.isArray(result) && result.length > 0 ? result[0] : result;
    } catch (error) {
      console.error(`Error updating ${tableName}/${id}:`, error);
      return null;
    }
  },
  
  // Delete record
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
  
  // Log click
  async logClick(memberId, actionType) {
    return this.create('click_logs', {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      member_id: memberId,
      action_type: actionType,
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct'
      // timestamp는 Supabase에서 자동으로 설정됨
    });
  }
};

// =====================
// Auth Module
// =====================
const Auth = {
  ADMIN_PASSWORD: 'admin123', // 기본 비밀번호 (실제 운영시 변경 필요)
  SESSION_KEY: 'bni_admin_session',
  
  isLoggedIn() {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  },
  
  login(password) {
    if (password === this.ADMIN_PASSWORD) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return true;
    }
    return false;
  },
  
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
};

// =====================
// Toast Notifications
// =====================
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fa-check',
      error: 'fa-times',
      info: 'fa-info'
    };
    
    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  info(message) { this.show(message, 'info'); }
};

// =====================
// Modal Module
// =====================
const Modal = {
  element: null,
  titleEl: null,
  bodyEl: null,
  
  init() {
    this.element = document.getElementById('modal');
    this.titleEl = document.getElementById('modalTitle');
    this.bodyEl = document.getElementById('modalBody');
    
    document.getElementById('modalClose').addEventListener('click', () => this.close());
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });
  },
  
  open(title, content) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = content;
    this.element.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  close() {
    this.element.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// =====================
// Navigation
// =====================
const Navigation = {
  currentPage: 'dashboard',
  
  init() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(item.dataset.page);
      });
    });
    
    // Handle hash navigation
    if (window.location.hash) {
      const page = window.location.hash.replace('#', '');
      this.navigate(page);
    }
  },
  
  navigate(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    // Show target page
    const targetPage = document.getElementById(`${page}Page`);
    if (targetPage) {
      targetPage.style.display = 'block';
      this.currentPage = page;
      
      // Update nav active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
          item.classList.add('active');
        }
      });
      
      // Update page title
      const titles = {
        dashboard: '대시보드',
        members: '멤버 관리',
        categories: '카테고리 관리',
        ads: '광고 관리',
        inquiries: '문의 관리',
        analytics: '통계'
      };
      document.getElementById('pageTitle').textContent = titles[page] || page;
      
      // Load page data
      this.loadPageData(page);
      
      // Update URL hash
      window.location.hash = page;
    }
  },
  
  async loadPageData(page) {
    switch (page) {
      case 'dashboard':
        await Dashboard.load();
        break;
      case 'members':
        await MembersPage.load();
        break;
      case 'categories':
        await CategoriesPage.load();
        break;
      case 'ads':
        await AdsPage.load();
        break;
      case 'inquiries':
        await InquiriesPage.load();
        break;
      case 'analytics':
        await AnalyticsPage.load();
        break;
    }
  }
};

// =====================
// Dashboard
// =====================
const Dashboard = {
  async load() {
    // Load stats
    const [members, categories, inquiries, clicks] = await Promise.all([
      AdminService.getAll('members'),
      AdminService.getAll('categories'),
      AdminService.getAll('visitor_inquiries'),
      AdminService.getAll('click_logs')
    ]);
    
    // Update stat cards
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('pendingInquiries').textContent = 
      inquiries.filter(i => i.status === 'pending').length;
    document.getElementById('totalClicks').textContent = clicks.length;
    
    // Load recent inquiries
    const recentInquiries = inquiries
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    const inquiriesHtml = recentInquiries.length > 0 
      ? recentInquiries.map(i => `
        <tr>
          <td>${i.name || '-'}</td>
          <td>${i.phone || '-'}</td>
          <td>${this.getCategoryName(i.interest_category)}</td>
          <td><span class="status-badge status-${i.status || 'pending'}">${this.getStatusText(i.status)}</span></td>
          <td>${this.formatDate(i.created_at)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" class="text-center text-muted">문의가 없습니다</td></tr>';
    
    document.getElementById('recentInquiries').innerHTML = inquiriesHtml;
    
    // Load click stats
    const phoneClicks = clicks.filter(c => c.action_type === 'phone').length;
    const homepageClicks = clicks.filter(c => c.action_type === 'homepage').length;
    const kakaoClicks = clicks.filter(c => c.action_type === 'kakao').length;
    const snsClicks = clicks.filter(c => c.action_type === 'sns').length;
    
    document.getElementById('phoneClicks').textContent = phoneClicks;
    document.getElementById('homepageClicks').textContent = homepageClicks;
    document.getElementById('kakaoClicks').textContent = kakaoClicks;
    document.getElementById('snsClicks').textContent = snsClicks;
  },
  
  getCategoryName(id) {
    const names = {
      'it-dev': 'IT/개발',
      'marketing': '마케팅',
      'legal': '법률',
      'tax': '세무',
      'architecture': '건축'
    };
    return names[id] || id || '-';
  },
  
  getStatusText(status) {
    const texts = {
      pending: '대기 중',
      contacted: '연락 완료',
      completed: '처리 완료'
    };
    return texts[status] || '대기 중';
  },
  
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

// =====================
// Members Page
// =====================
const MembersPage = {
  members: [],
  categories: [],
  subcategories: [],
  
  async load() {
    [this.members, this.categories, this.subcategories] = await Promise.all([
      AdminService.getAll('members'),
      AdminService.getAll('categories'),
      AdminService.getAll('subcategories')
    ]);
    
    this.render();
    this.bindEvents();
  },
  
  render(searchQuery = '') {
    let filtered = this.members;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = this.members.filter(m => 
        m.name?.toLowerCase().includes(query) ||
        m.company?.toLowerCase().includes(query)
      );
    }
    
    const html = filtered.length > 0
      ? filtered.map(m => `
        <tr>
          <td><img src="${m.profile_img || 'https://via.placeholder.com/40'}" alt="${m.name}"></td>
          <td>${m.name || '-'}</td>
          <td>${m.company || '-'}</td>
          <td>${this.getCategoryName(m.category_id)}</td>
          <td>${m.region || '-'}</td>
          <td>
            <label class="toggle-switch">
              <input type="checkbox" ${m.is_featured ? 'checked' : ''} 
                     onchange="MembersPage.toggleFeatured('${m.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" onclick="MembersPage.edit('${m.id}')" title="수정">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" onclick="MembersPage.delete('${m.id}')" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('')
      : '<tr><td colspan="7" class="text-center text-muted">멤버가 없습니다</td></tr>';
    
    document.getElementById('membersList').innerHTML = html;
  },
  
  bindEvents() {
    document.getElementById('addMemberBtn').onclick = () => this.showForm();
    document.getElementById('memberSearch').oninput = (e) => this.render(e.target.value);
  },
  
  getCategoryName(id) {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '-';
  },
  
  showForm(member = null) {
    const isEdit = !!member;
    const title = isEdit ? '멤버 수정' : '멤버 추가';
    
    const categoryOptions = this.categories.map(c => 
      `<option value="${c.id}" ${member?.category_id === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    const subcategoryOptions = this.subcategories.map(s => 
      `<option value="${s.id}" ${member?.subcategory_id === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    const content = `
      <form id="memberForm">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">이름 <span class="form-required">*</span></label>
            <input type="text" class="form-input" name="name" value="${member?.name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">회사명 <span class="form-required">*</span></label>
            <input type="text" class="form-input" name="company" value="${member?.company || ''}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">직함</label>
            <input type="text" class="form-input" name="position" value="${member?.position || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">지역</label>
            <select class="form-select" name="region">
              <option value="">선택</option>
              <option value="고양" ${member?.region === '고양' ? 'selected' : ''}>고양</option>
              <option value="일산" ${member?.region === '일산' ? 'selected' : ''}>일산</option>
              <option value="고양·일산" ${member?.region === '고양·일산' ? 'selected' : ''}>고양·일산</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">대분류</label>
            <select class="form-select" name="category_id">
              <option value="">선택</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">소분류</label>
            <select class="form-select" name="subcategory_id">
              <option value="">선택</option>
              ${subcategoryOptions}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">전화번호</label>
            <input type="tel" class="form-input" name="phone" value="${member?.phone || ''}" placeholder="010-0000-0000">
          </div>
          <div class="form-group">
            <label class="form-label">홈페이지</label>
            <input type="url" class="form-input" name="homepage" value="${member?.homepage || ''}" placeholder="https://...">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">SNS URL</label>
            <input type="url" class="form-input" name="sns_url" value="${member?.sns_url || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">카카오 채널 URL</label>
            <input type="url" class="form-input" name="kakao_url" value="${member?.kakao_url || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">프로필 이미지 URL</label>
          <input type="url" class="form-input" name="profile_img" value="${member?.profile_img || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">USP 이미지 URL</label>
          <input type="url" class="form-input" name="usp_img" value="${member?.usp_img || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">USP 요약</label>
          <textarea class="form-textarea" name="usp_summary" placeholder="서비스1 | 서비스2 | 서비스3">${member?.usp_summary || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">태그 (쉼표로 구분)</label>
          <input type="text" class="form-input" name="tags" value="${(member?.tags || []).join(', ')}" placeholder="태그1, 태그2, 태그3">
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" name="is_featured" ${member?.is_featured ? 'checked' : ''}> 추천 멤버로 표시
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">취소</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
        </div>
      </form>
    `;
    
    Modal.open(title, content);
    
    document.getElementById('memberForm').onsubmit = async (e) => {
      e.preventDefault();
      await this.save(new FormData(e.target), member?.id);
    };
  },
  
  async save(formData, id = null) {
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      position: formData.get('position'),
      region: formData.get('region'),
      category_id: formData.get('category_id'),
      subcategory_id: formData.get('subcategory_id'),
      phone: formData.get('phone'),
      homepage: formData.get('homepage'),
      sns_url: formData.get('sns_url'),
      kakao_url: formData.get('kakao_url'),
      profile_img: formData.get('profile_img'),
      usp_img: formData.get('usp_img'),
      usp_summary: formData.get('usp_summary'),
      tags: formData.get('tags').split(',').map(t => t.trim()).filter(Boolean),
      is_featured: formData.get('is_featured') === 'on'
    };
    
    let result;
    if (id) {
      result = await AdminService.update('members', id, data);
    } else {
      data.id = 'member-' + Date.now();
      data.order = this.members.length + 1;
      result = await AdminService.create('members', data);
    }
    
    if (result) {
      Toast.success(id ? '멤버가 수정되었습니다' : '멤버가 추가되었습니다');
      Modal.close();
      await this.load();
    } else {
      Toast.error('저장 중 오류가 발생했습니다');
    }
  },
  
  async edit(id) {
    const member = this.members.find(m => m.id === id);
    if (member) {
      this.showForm(member);
    }
  },
  
  async delete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const result = await AdminService.delete('members', id);
    if (result) {
      Toast.success('멤버가 삭제되었습니다');
      await this.load();
    } else {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  },
  
  async toggleFeatured(id, featured) {
    const member = this.members.find(m => m.id === id);
    if (member) {
      await AdminService.update('members', id, { ...member, is_featured: featured });
      Toast.success(featured ? '추천 멤버로 설정되었습니다' : '추천 멤버 해제되었습니다');
    }
  }
};

// =====================
// Categories Page
// =====================
const CategoriesPage = {
  categories: [],
  subcategories: [],
  
  async load() {
    [this.categories, this.subcategories] = await Promise.all([
      AdminService.getAll('categories'),
      AdminService.getAll('subcategories')
    ]);
    
    this.render();
    this.bindEvents();
  },
  
  render() {
    // Categories
    const catHtml = this.categories.length > 0
      ? this.categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => `
        <tr>
          <td><i class="fas ${c.icon || 'fa-folder'}"></i></td>
          <td>${c.name}</td>
          <td>${c.order || 0}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" onclick="CategoriesPage.editCategory('${c.id}')" title="수정">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" onclick="CategoriesPage.deleteCategory('${c.id}')" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" class="text-center text-muted">카테고리가 없습니다</td></tr>';
    
    document.getElementById('categoriesList').innerHTML = catHtml;
    
    // Subcategories
    const subHtml = this.subcategories.length > 0
      ? this.subcategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => {
        const parent = this.categories.find(c => c.id === s.category_id);
        return `
          <tr>
            <td>${s.name}</td>
            <td>${parent?.name || '-'}</td>
            <td>${s.order || 0}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" onclick="CategoriesPage.editSubcategory('${s.id}')" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="CategoriesPage.deleteSubcategory('${s.id}')" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="4" class="text-center text-muted">소카테고리가 없습니다</td></tr>';
    
    document.getElementById('subcategoriesList').innerHTML = subHtml;
  },
  
  bindEvents() {
    document.getElementById('addCategoryBtn').onclick = () => this.showCategoryForm();
    document.getElementById('addSubcategoryBtn').onclick = () => this.showSubcategoryForm();
  },
  
  showCategoryForm(category = null) {
    const isEdit = !!category;
    const title = isEdit ? '카테고리 수정' : '카테고리 추가';
    
    const content = `
      <form id="categoryForm">
        <div class="form-group">
          <label class="form-label">카테고리명 <span class="form-required">*</span></label>
          <input type="text" class="form-input" name="name" value="${category?.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">아이콘 (Font Awesome)</label>
          <input type="text" class="form-input" name="icon" value="${category?.icon || ''}" placeholder="fa-folder">
        </div>
        <div class="form-group">
          <label class="form-label">설명</label>
          <textarea class="form-textarea" name="description">${category?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">순서</label>
          <input type="number" class="form-input" name="order" value="${category?.order || 0}">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">취소</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
        </div>
      </form>
    `;
    
    Modal.open(title, content);
    
    document.getElementById('categoryForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        icon: formData.get('icon'),
        description: formData.get('description'),
        order: parseInt(formData.get('order')) || 0
      };
      
      let result;
      if (category?.id) {
        result = await AdminService.update('categories', category.id, data);
      } else {
        data.id = formData.get('name').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        result = await AdminService.create('categories', data);
      }
      
      if (result) {
        Toast.success(isEdit ? '카테고리가 수정되었습니다' : '카테고리가 추가되었습니다');
        Modal.close();
        await this.load();
      } else {
        Toast.error('저장 중 오류가 발생했습니다');
      }
    };
  },
  
  showSubcategoryForm(subcategory = null) {
    const isEdit = !!subcategory;
    const title = isEdit ? '소카테고리 수정' : '소카테고리 추가';
    
    const categoryOptions = this.categories.map(c => 
      `<option value="${c.id}" ${subcategory?.category_id === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    const content = `
      <form id="subcategoryForm">
        <div class="form-group">
          <label class="form-label">소카테고리명 <span class="form-required">*</span></label>
          <input type="text" class="form-input" name="name" value="${subcategory?.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">상위 카테고리 <span class="form-required">*</span></label>
          <select class="form-select" name="category_id" required>
            <option value="">선택</option>
            ${categoryOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">SEO 슬러그</label>
          <input type="text" class="form-input" name="slug" value="${subcategory?.slug || ''}" placeholder="예: 고양시-홈페이지-제작">
        </div>
        <div class="form-group">
          <label class="form-label">SEO 타이틀</label>
          <input type="text" class="form-input" name="seo_title" value="${subcategory?.seo_title || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">설명</label>
          <textarea class="form-textarea" name="description">${subcategory?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">순서</label>
          <input type="number" class="form-input" name="order" value="${subcategory?.order || 0}">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">취소</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
        </div>
      </form>
    `;
    
    Modal.open(title, content);
    
    document.getElementById('subcategoryForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        category_id: formData.get('category_id'),
        slug: formData.get('slug'),
        seo_title: formData.get('seo_title'),
        description: formData.get('description'),
        order: parseInt(formData.get('order')) || 0
      };
      
      let result;
      if (subcategory?.id) {
        result = await AdminService.update('subcategories', subcategory.id, data);
      } else {
        data.id = formData.get('name').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-가-힣]/g, '');
        result = await AdminService.create('subcategories', data);
      }
      
      if (result) {
        Toast.success(isEdit ? '소카테고리가 수정되었습니다' : '소카테고리가 추가되었습니다');
        Modal.close();
        await this.load();
      } else {
        Toast.error('저장 중 오류가 발생했습니다');
      }
    };
  },
  
  editCategory(id) {
    const category = this.categories.find(c => c.id === id);
    if (category) this.showCategoryForm(category);
  },
  
  editSubcategory(id) {
    const subcategory = this.subcategories.find(s => s.id === id);
    if (subcategory) this.showSubcategoryForm(subcategory);
  },
  
  async deleteCategory(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const result = await AdminService.delete('categories', id);
    if (result) {
      Toast.success('카테고리가 삭제되었습니다');
      await this.load();
    } else {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  },
  
  async deleteSubcategory(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const result = await AdminService.delete('subcategories', id);
    if (result) {
      Toast.success('소카테고리가 삭제되었습니다');
      await this.load();
    } else {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  }
};

// =====================
// Ads Page
// =====================
const AdsPage = {
  ads: [],
  members: [],
  
  async load() {
    [this.ads, this.members] = await Promise.all([
      AdminService.getAll('advertisements'),
      AdminService.getAll('members')
    ]);
    
    this.render();
    this.bindEvents();
  },
  
  render() {
    const html = this.ads.length > 0
      ? this.ads.map(ad => {
        const member = this.members.find(m => m.id === ad.member_id);
        const isActive = ad.is_active && new Date(ad.end_date) > new Date();
        return `
          <tr>
            <td><img src="${ad.image_url || 'https://via.placeholder.com/40'}" alt="${ad.title}"></td>
            <td>${ad.title}</td>
            <td>${ad.position}</td>
            <td>${this.formatDateRange(ad.start_date, ad.end_date)}</td>
            <td><span class="status-badge status-${isActive ? 'active' : 'inactive'}">${isActive ? '활성' : '비활성'}</span></td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" onclick="AdsPage.edit('${ad.id}')" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="AdsPage.delete('${ad.id}')" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="6" class="text-center text-muted">광고가 없습니다</td></tr>';
    
    document.getElementById('adsList').innerHTML = html;
  },
  
  bindEvents() {
    document.getElementById('addAdBtn').onclick = () => this.showForm();
  },
  
  formatDateRange(start, end) {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getMonth()+1}/${s.getDate()} ~ ${e.getMonth()+1}/${e.getDate()}`;
  },
  
  showForm(ad = null) {
    const isEdit = !!ad;
    const title = isEdit ? '광고 수정' : '광고 추가';
    
    const memberOptions = this.members.map(m => 
      `<option value="${m.id}" ${ad?.member_id === m.id ? 'selected' : ''}>${m.name} (${m.company})</option>`
    ).join('');
    
    const content = `
      <form id="adForm">
        <div class="form-group">
          <label class="form-label">광고 제목 <span class="form-required">*</span></label>
          <input type="text" class="form-input" name="title" value="${ad?.title || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">이미지 URL <span class="form-required">*</span></label>
          <input type="url" class="form-input" name="image_url" value="${ad?.image_url || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">링크 URL</label>
          <input type="url" class="form-input" name="link_url" value="${ad?.link_url || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">설명 (사이드바 광고용)</label>
          <textarea class="form-textarea" name="description" placeholder="사이드바 광고에 표시될 설명을 입력하세요" style="min-height: 80px;">${ad?.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">위치</label>
            <select class="form-select" name="position">
              <option value="banner" ${ad?.position === 'banner' ? 'selected' : ''}>배너</option>
              <option value="sidebar" ${ad?.position === 'sidebar' ? 'selected' : ''}>사이드바</option>
              <option value="footer" ${ad?.position === 'footer' ? 'selected' : ''}>푸터</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">광고주 멤버</label>
            <select class="form-select" name="member_id">
              <option value="">선택</option>
              ${memberOptions}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">시작일</label>
            <input type="date" class="form-input" name="start_date" value="${ad?.start_date?.split('T')[0] || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">종료일</label>
            <input type="date" class="form-input" name="end_date" value="${ad?.end_date?.split('T')[0] || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">광고비 (원)</label>
            <input type="number" class="form-input" name="price" value="${ad?.price || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">순서</label>
            <input type="number" class="form-input" name="order" value="${ad?.order || 0}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" name="is_active" ${ad?.is_active !== false ? 'checked' : ''}> 활성화
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">취소</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
        </div>
      </form>
    `;
    
    Modal.open(title, content);
    
    document.getElementById('adForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        title: formData.get('title'),
        image_url: formData.get('image_url'),
        link_url: formData.get('link_url'),
        description: formData.get('description'),
        position: formData.get('position'),
        member_id: formData.get('member_id'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        price: parseInt(formData.get('price')) || 0,
        order: parseInt(formData.get('order')) || 0,
        is_active: formData.get('is_active') === 'on'
      };
      
      let result;
      if (ad?.id) {
        result = await AdminService.update('advertisements', ad.id, data);
      } else {
        data.id = 'ad-' + Date.now();
        result = await AdminService.create('advertisements', data);
      }
      
      if (result) {
        Toast.success(isEdit ? '광고가 수정되었습니다' : '광고가 추가되었습니다');
        Modal.close();
        await this.load();
      } else {
        Toast.error('저장 중 오류가 발생했습니다');
      }
    };
  },
  
  edit(id) {
    const ad = this.ads.find(a => a.id === id);
    if (ad) this.showForm(ad);
  },
  
  async delete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const result = await AdminService.delete('advertisements', id);
    if (result) {
      Toast.success('광고가 삭제되었습니다');
      await this.load();
    } else {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  }
};

// =====================
// Inquiries Page
// =====================
const InquiriesPage = {
  inquiries: [],
  
  async load() {
    this.inquiries = await AdminService.getAll('visitor_inquiries');
    this.render();
    this.bindEvents();
  },
  
  render(filter = '') {
    let filtered = this.inquiries;
    if (filter) {
      filtered = this.inquiries.filter(i => i.status === filter);
    }
    
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const html = filtered.length > 0
      ? filtered.map(i => `
        <tr>
          <td>${i.name || '-'}</td>
          <td>${i.phone || '-'}</td>
          <td>${i.company || '-'}</td>
          <td>${this.getCategoryName(i.interest_category)}</td>
          <td>${this.getTypeText(i.inquiry_type)}</td>
          <td><span class="status-badge status-${i.status || 'pending'}">${this.getStatusText(i.status)}</span></td>
          <td>${this.formatDate(i.created_at)}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn view" onclick="InquiriesPage.view('${i.id}')" title="상세보기">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn edit" onclick="InquiriesPage.updateStatus('${i.id}')" title="상태변경">
                <i class="fas fa-check"></i>
              </button>
              <button class="action-btn delete" onclick="InquiriesPage.delete('${i.id}')" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('')
      : '<tr><td colspan="8" class="text-center text-muted">문의가 없습니다</td></tr>';
    
    document.getElementById('inquiriesList').innerHTML = html;
  },
  
  bindEvents() {
    document.getElementById('inquiryFilter').onchange = (e) => this.render(e.target.value);
  },
  
  getCategoryName(id) {
    const names = {
      'it-dev': 'IT/개발',
      'marketing': '마케팅',
      'legal': '법률',
      'tax': '세무',
      'architecture': '건축'
    };
    return names[id] || id || '-';
  },
  
  getTypeText(type) {
    const texts = {
      visitor: '비지터',
      general: '일반문의',
      member: '멤버문의'
    };
    return texts[type] || '비지터';
  },
  
  getStatusText(status) {
    const texts = {
      pending: '대기 중',
      contacted: '연락 완료',
      completed: '처리 완료'
    };
    return texts[status] || '대기 중';
  },
  
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  },
  
  view(id) {
    const inquiry = this.inquiries.find(i => i.id === id);
    if (!inquiry) return;
    
    const content = `
      <div style="line-height: 2;">
        <p><strong>이름:</strong> ${inquiry.name || '-'}</p>
        <p><strong>연락처:</strong> ${inquiry.phone || '-'}</p>
        <p><strong>이메일:</strong> ${inquiry.email || '-'}</p>
        <p><strong>회사:</strong> ${inquiry.company || '-'}</p>
        <p><strong>관심 업종:</strong> ${this.getCategoryName(inquiry.interest_category)}</p>
        <p><strong>문의 유형:</strong> ${this.getTypeText(inquiry.inquiry_type)}</p>
        <p><strong>상태:</strong> <span class="status-badge status-${inquiry.status || 'pending'}">${this.getStatusText(inquiry.status)}</span></p>
        <p><strong>접수일:</strong> ${this.formatDate(inquiry.created_at)}</p>
        <hr style="margin: 16px 0;">
        <p><strong>문의 내용:</strong></p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px;">${inquiry.message || '(내용 없음)'}</p>
      </div>
    `;
    
    Modal.open('문의 상세', content);
  },
  
  async updateStatus(id) {
    const inquiry = this.inquiries.find(i => i.id === id);
    if (!inquiry) return;
    
    const statuses = ['pending', 'contacted', 'completed'];
    const currentIndex = statuses.indexOf(inquiry.status || 'pending');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const result = await AdminService.update('visitor_inquiries', id, { ...inquiry, status: nextStatus });
    if (result) {
      Toast.success('상태가 변경되었습니다');
      await this.load();
    } else {
      Toast.error('상태 변경 중 오류가 발생했습니다');
    }
  },
  
  async delete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const result = await AdminService.delete('visitor_inquiries', id);
    if (result) {
      Toast.success('문의가 삭제되었습니다');
      await this.load();
    } else {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  }
};

// =====================
// Analytics Page
// =====================
const AnalyticsPage = {
  async load() {
    const [clicks, members] = await Promise.all([
      AdminService.getAll('click_logs'),
      AdminService.getAll('members')
    ]);
    
    // Total stats
    const phoneClicks = clicks.filter(c => c.action_type === 'phone').length;
    const homepageClicks = clicks.filter(c => c.action_type === 'homepage').length;
    const kakaoClicks = clicks.filter(c => c.action_type === 'kakao').length;
    const snsClicks = clicks.filter(c => c.action_type === 'sns').length;
    
    document.getElementById('totalPhoneClicks').textContent = phoneClicks;
    document.getElementById('totalHomepageClicks').textContent = homepageClicks;
    document.getElementById('totalKakaoClicks').textContent = kakaoClicks;
    document.getElementById('totalSnsClicks').textContent = snsClicks;
    
    // Member stats
    const memberStats = members.map(m => {
      const memberClicks = clicks.filter(c => c.member_id === m.id);
      return {
        name: m.name,
        company: m.company,
        phone: memberClicks.filter(c => c.action_type === 'phone').length,
        homepage: memberClicks.filter(c => c.action_type === 'homepage').length,
        kakao: memberClicks.filter(c => c.action_type === 'kakao').length,
        sns: memberClicks.filter(c => c.action_type === 'sns').length,
        total: memberClicks.length
      };
    }).sort((a, b) => b.total - a.total);
    
    const memberStatsHtml = memberStats.length > 0
      ? memberStats.map(s => `
        <tr>
          <td>${s.name} (${s.company})</td>
          <td>${s.phone}</td>
          <td>${s.homepage}</td>
          <td>${s.kakao}</td>
          <td>${s.sns}</td>
          <td><strong>${s.total}</strong></td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" class="text-center text-muted">데이터가 없습니다</td></tr>';
    
    document.getElementById('memberClickStats').innerHTML = memberStatsHtml;
    
    // Recent logs
    const recentLogs = clicks
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    
    const logsHtml = recentLogs.length > 0
      ? recentLogs.map(log => {
        const member = members.find(m => m.id === log.member_id);
        return `
          <tr>
            <td>${member?.name || log.member_id}</td>
            <td>${this.getActionText(log.action_type)}</td>
            <td>${this.formatDateTime(log.timestamp)}</td>
            <td>${log.referrer || 'direct'}</td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="4" class="text-center text-muted">로그가 없습니다</td></tr>';
    
    document.getElementById('recentClickLogs').innerHTML = logsHtml;
  },
  
  getActionText(action) {
    const texts = {
      phone: '전화',
      homepage: '홈페이지',
      kakao: '카카오',
      sns: 'SNS',
      profile_view: '프로필 조회'
    };
    return texts[action] || action;
  },
  
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

// =====================
// Initialize
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('loginScreen');
  const adminLayout = document.getElementById('adminLayout');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileToggle = document.getElementById('mobileToggle');
  const sidebar = document.querySelector('.sidebar');
  
  // Check auth
  if (Auth.isLoggedIn()) {
    loginScreen.style.display = 'none';
    adminLayout.style.display = 'flex';
    Modal.init();
    Navigation.init();
    Navigation.navigate('dashboard');
  }
  
  // Login form
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (Auth.login(password)) {
      loginScreen.style.display = 'none';
      adminLayout.style.display = 'flex';
      Modal.init();
      Navigation.init();
      Navigation.navigate('dashboard');
      Toast.success('로그인되었습니다');
    } else {
      Toast.error('비밀번호가 올바르지 않습니다');
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', () => {
    Auth.logout();
    loginScreen.style.display = 'flex';
    adminLayout.style.display = 'none';
    Toast.info('로그아웃되었습니다');
  });
  
  // Mobile toggle
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
});

// Export for global access
window.AdminService = AdminService;
window.MembersPage = MembersPage;
window.CategoriesPage = CategoriesPage;
window.AdsPage = AdsPage;
window.InquiriesPage = InquiriesPage;
window.AnalyticsPage = AnalyticsPage;
window.Modal = Modal;
window.Toast = Toast;
