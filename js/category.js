/**
 * BNI 최강챕터 - Category Page JavaScript
 * 카테고리 페이지의 기능을 담당합니다.
 */

const CategoryPage = {
  currentCategory: null,
  currentSubcategory: null,
  currentRegion: null,
  searchQuery: '',
  sortBy: 'order',
  members: [],
  
  async init() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    this.currentCategory = params.get('cat');
    this.currentSubcategory = params.get('sub');
    this.currentRegion = params.get('region');
    this.searchQuery = params.get('search') || '';
    
    // Initialize elements
    this.elements = {
      categoryTitle: document.getElementById('categoryTitle'),
      categoryDescription: document.getElementById('categoryDescription'),
      breadcrumbCategory: document.getElementById('breadcrumbCategory'),
      categorySidebar: document.getElementById('categorySidebar'),
      subcategoryTabs: document.getElementById('subcategoryTabs'),
      memberGrid: document.getElementById('memberGrid'),
      resultCount: document.getElementById('resultCount'),
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      sortSelect: document.getElementById('sortSelect')
    };
    
    // Set search input value
    if (this.searchQuery && this.elements.searchInput) {
      this.elements.searchInput.value = this.searchQuery;
    }
    
    // Load and render
    await this.loadCategories();
    await this.loadSubcategories();
    await this.loadMembers();
    
    // Bind events
    this.bindEvents();
    
    // Update page info
    await this.updatePageInfo();
  },
  
  async loadCategories() {
    const categories = await DataService.getCategories();
    
    if (this.elements.categorySidebar) {
      const allActive = !this.currentCategory ? 'active' : '';
      
      let html = `
        <li>
          <a href="category.html" class="sidebar-link ${allActive}" data-cat="">
            <span>전체</span>
          </a>
        </li>
      `;
      
      html += categories.map(cat => {
        const isActive = this.currentCategory === cat.id ? 'active' : '';
        return `
          <li>
            <a href="category.html?cat=${cat.id}" class="sidebar-link ${isActive}" data-cat="${cat.id}">
              <span><i class="fas ${cat.icon} fa-fw"></i> ${cat.name}</span>
            </a>
          </li>
        `;
      }).join('');
      
      this.elements.categorySidebar.innerHTML = html;
    }
    
    // Update region sidebar
    document.querySelectorAll('.sidebar-link[data-region]').forEach(link => {
      const region = link.dataset.region;
      if (region === 'all' && !this.currentRegion) {
        link.classList.add('active');
      } else if (region === this.currentRegion) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },
  
  async loadSubcategories() {
    let subcategories = [];
    
    if (this.currentCategory) {
      subcategories = await DataService.getSubcategories(this.currentCategory);
    } else {
      subcategories = await DataService.getSubcategories();
    }
    
    if (this.elements.subcategoryTabs && subcategories.length > 0) {
      const allActive = !this.currentSubcategory ? 'active' : '';
      
      let html = `<button class="filter-tab ${allActive}" data-sub="">전체</button>`;
      
      html += subcategories.map(sub => {
        const isActive = this.currentSubcategory === sub.id ? 'active' : '';
        return `<button class="filter-tab ${isActive}" data-sub="${sub.id}">${sub.name}</button>`;
      }).join('');
      
      this.elements.subcategoryTabs.innerHTML = html;
      
      // Bind subcategory events
      this.elements.subcategoryTabs.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.currentSubcategory = tab.dataset.sub || null;
          this.updateURL();
          this.loadMembers();
          
          // Update active state
          this.elements.subcategoryTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    } else if (this.elements.subcategoryTabs) {
      this.elements.subcategoryTabs.innerHTML = '';
    }
  },
  
  async loadMembers() {
    const filters = {};
    
    if (this.currentCategory) {
      filters.categoryId = this.currentCategory;
    }
    if (this.currentSubcategory) {
      filters.subcategoryId = this.currentSubcategory;
    }
    if (this.currentRegion && this.currentRegion !== 'all') {
      filters.region = this.currentRegion;
    }
    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }
    
    this.members = await DataService.getMembers(filters);
    
    // Sort members
    this.sortMembers();
    
    // Render
    this.renderMembers();
  },
  
  sortMembers() {
    switch (this.sortBy) {
      case 'name':
        this.members.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'company':
        this.members.sort((a, b) => a.company.localeCompare(b.company, 'ko'));
        break;
      default:
        this.members.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  },
  
  renderMembers() {
    if (!this.elements.memberGrid) return;
    
    // Update count
    if (this.elements.resultCount) {
      this.elements.resultCount.textContent = `총 ${this.members.length}명의 전문가`;
    }
    
    if (this.members.length === 0) {
      this.elements.memberGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어나 필터를 시도해보세요</p>
        </div>
      `;
      return;
    }
    
    this.elements.memberGrid.innerHTML = this.members.map(member => {
      const categoryName = this.getCategoryDisplayName(member.category_id);
      const tags = member.tags?.slice(0, 3) || [];
      
      return `
        <div class="member-card" data-id="${member.id}">
          <a href="member.html?id=${member.id}">
            <div class="member-img-wrapper">
              <img src="${member.profile_img || 'https://via.placeholder.com/400x300?text=Profile'}" 
                   alt="${member.name}" class="member-img" loading="lazy">
              ${member.is_featured ? '<span class="member-badge">추천</span>' : ''}
            </div>
          </a>
          <div class="member-body">
            <div class="member-category">${categoryName}</div>
            <h3 class="member-name">
              <a href="member.html?id=${member.id}">${member.name}</a>
            </h3>
            <p class="member-company">${member.company} · ${member.position}</p>
            <p class="member-usp">${member.usp_summary || ''}</p>
            <div class="member-tags">
              ${tags.map(tag => `<span class="member-tag">${tag}</span>`).join('')}
            </div>
            <div class="member-actions">
              ${member.phone ? `
                <a href="tel:${member.phone}" class="member-action-btn phone">
                  <i class="fas fa-phone"></i>
                </a>
              ` : ''}
              ${member.kakao_url ? `
                <a href="${member.kakao_url}" target="_blank" class="member-action-btn kakao">
                  <i class="fas fa-comment"></i>
                </a>
              ` : ''}
              ${member.homepage ? `
                <a href="${member.homepage}" target="_blank" class="member-action-btn web">
                  <i class="fas fa-globe"></i>
                </a>
              ` : ''}
              ${member.sns_url ? `
                <a href="${member.sns_url}" target="_blank" class="member-action-btn sns">
                  <i class="fab fa-instagram"></i>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  getCategoryDisplayName(categoryId) {
    const categoryNames = {
      'it-dev': 'IT / 개발',
      'marketing': '마케팅 / 광고',
      'legal': '법률',
      'tax': '세무 / 회계',
      'architecture': '건축 / 인테리어',
      'local-business': '지역 비즈니스'
    };
    return categoryNames[categoryId] || categoryId;
  },
  
  async updatePageInfo() {
    let title = '전문가 찾기';
    let description = '고양·일산 지역 각 분야 전문가를 찾아보세요';
    let breadcrumb = '전문가 찾기';
    
    if (this.currentCategory) {
      const category = await DataService.getCategory(this.currentCategory);
      if (category) {
        title = category.name;
        description = category.description;
        breadcrumb = category.name;
      }
    }
    
    if (this.currentSubcategory) {
      const subcategory = await DataService.getSubcategory(this.currentSubcategory);
      if (subcategory) {
        title = subcategory.name;
        description = subcategory.description;
        breadcrumb = subcategory.name;
        
        // Update page title for SEO
        document.title = `${subcategory.seo_title || title} | BNI 최강챕터`;
      }
    }
    
    if (this.elements.categoryTitle) {
      this.elements.categoryTitle.textContent = title;
    }
    if (this.elements.categoryDescription) {
      this.elements.categoryDescription.textContent = description;
    }
    if (this.elements.breadcrumbCategory) {
      this.elements.breadcrumbCategory.textContent = breadcrumb;
    }
  },
  
  bindEvents() {
    // Search
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = this.elements.searchInput.value;
          this.updateURL();
          this.loadMembers();
        }
      });
    }
    
    if (this.elements.searchBtn) {
      this.elements.searchBtn.addEventListener('click', () => {
        this.searchQuery = this.elements.searchInput.value;
        this.updateURL();
        this.loadMembers();
      });
    }
    
    // Sort
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', () => {
        this.sortBy = this.elements.sortSelect.value;
        this.sortMembers();
        this.renderMembers();
      });
    }
    
    // Region sidebar links
    document.querySelectorAll('.sidebar-link[data-region]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const region = link.dataset.region;
        this.currentRegion = region === 'all' ? null : region;
        this.updateURL();
        this.loadMembers();
        
        // Update active state
        document.querySelectorAll('.sidebar-link[data-region]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  },
  
  updateURL() {
    const params = new URLSearchParams();
    
    if (this.currentCategory) params.set('cat', this.currentCategory);
    if (this.currentSubcategory) params.set('sub', this.currentSubcategory);
    if (this.currentRegion) params.set('region', this.currentRegion);
    if (this.searchQuery) params.set('search', this.searchQuery);
    
    const newURL = params.toString() ? `category.html?${params}` : 'category.html';
    window.history.replaceState({}, '', newURL);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  CategoryPage.init();
});
