/**
 * BNI 최강챕터 - Main JavaScript Module
 * 페이지 기능 및 UI 상호작용을 담당합니다.
 */

// =====================
// Mobile Menu
// =====================
const MobileMenu = {
  init() {
    this.menuBtn = document.getElementById('mobileMenuBtn');
    this.menu = document.getElementById('mobileMenu');
    this.overlay = document.getElementById('mobileOverlay');
    this.closeBtn = document.getElementById('mobileMenuClose');
    
    if (!this.menuBtn || !this.menu) return;
    
    this.menuBtn.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
  },
  
  open() {
    this.menu.classList.add('active');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  close() {
    this.menu.classList.remove('active');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// =====================
// Banner Slider
// =====================
const BannerSlider = {
  currentIndex: 0,
  autoPlayInterval: null,
  
  async init() {
    this.track = document.getElementById('bannerTrack');
    this.dots = document.getElementById('bannerDots');
    this.prevBtn = document.getElementById('bannerPrev');
    this.nextBtn = document.getElementById('bannerNext');
    
    if (!this.track) return;
    
    // Load advertisements
    const ads = await DataService.getAdvertisements('banner');
    
    if (ads.length === 0) {
      // Default banners if no ads
      this.banners = [
        {
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
          title: '홈페이지 제작 · 앱 개발',
          description: 'SEO 기반 홈페이지 제작 | 앱 · 플랫폼 개발 전문'
        },
        {
          image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
          title: '법률 · 세무 전문가',
          description: '개인회생 · 세무상담 · 법인절세 전문'
        },
        {
          image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
          title: '건축 · 인테리어',
          description: '단독주택 설계 · 인테리어 · 책임시공'
        }
      ];
    } else {
      this.banners = ads;
    }
    
    this.render();
    this.bindEvents();
    this.startAutoPlay();
  },
  
  render() {
    // Render slides
    this.track.innerHTML = this.banners.map((banner, index) => `
      <div class="banner-slide" data-index="${index}">
        <img src="${banner.image_url}" alt="${banner.title || '광고 배너'}">
        <div class="banner-content">
          <h3>${banner.title || ''}</h3>
          <p>${banner.description || ''}</p>
        </div>
      </div>
    `).join('');
    
    // Render dots
    this.dots.innerHTML = this.banners.map((_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
    `).join('');
  },
  
  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
    
    // Dot navigation
    this.dots?.querySelectorAll('.banner-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.goTo(parseInt(dot.dataset.index));
      });
    });
    
    // Touch events for mobile swipe
    let startX = 0;
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      this.stopAutoPlay();
    });
    
    this.track.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
      this.startAutoPlay();
    });
  },
  
  goTo(index) {
    this.currentIndex = index;
    this.track.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    this.dots?.querySelectorAll('.banner-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  },
  
  prev() {
    const newIndex = this.currentIndex === 0 ? this.banners.length - 1 : this.currentIndex - 1;
    this.goTo(newIndex);
  },
  
  next() {
    const newIndex = this.currentIndex === this.banners.length - 1 ? 0 : this.currentIndex + 1;
    this.goTo(newIndex);
  },
  
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), 5000);
  },
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
};

// =====================
// Category Grid
// =====================
const CategoryGrid = {
  async init() {
    this.grid = document.getElementById('categoryGrid');
    if (!this.grid) return;
    
    const categories = await DataService.getCategories();
    this.render(categories);
  },
  
  render(categories) {
    this.grid.innerHTML = categories.map(cat => `
      <a href="category.html?cat=${cat.id}" class="category-card">
        <div class="category-icon">
          <i class="fas ${cat.icon || 'fa-briefcase'}"></i>
        </div>
        <div class="category-name">${cat.name}</div>
      </a>
    `).join('');
  }
};

// =====================
// Member Grid
// =====================
const MemberGrid = {
  currentFilter: 'all',
  searchQuery: '',
  
  async init() {
    this.grid = document.getElementById('memberGrid');
    this.filterTabs = document.getElementById('filterTabs');
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
    
    if (!this.grid) return;
    
    // Load and render members
    await this.loadMembers();
    
    // Bind filter events
    this.filterTabs?.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tab.dataset.filter === 'all') {
          this.currentFilter = 'all';
        } else if (tab.dataset.region) {
          this.currentFilter = tab.dataset.region;
        } else if (tab.dataset.category) {
          this.currentFilter = tab.dataset.category;
        }
        
        this.loadMembers();
      });
    });
    
    // Bind search events
    this.searchInput?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.searchQuery = this.searchInput.value;
        this.loadMembers();
      }
    });
    
    this.searchBtn?.addEventListener('click', () => {
      this.searchQuery = this.searchInput.value;
      this.loadMembers();
    });
  },
  
  async loadMembers() {
    const filters = {};
    
    if (this.currentFilter !== 'all') {
      // Check if it's a region filter
      if (['고양', '일산'].includes(this.currentFilter)) {
        filters.region = this.currentFilter;
      } else {
        filters.categoryId = this.currentFilter;
      }
    }
    
    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }
    
    // On home page, only show featured
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
      filters.featured = true;
    }
    
    const members = await DataService.getMembers(filters);
    this.render(members);
  },
  
  render(members) {
    if (members.length === 0) {
      this.grid.innerHTML = `
        <div class="text-center" style="grid-column: 1/-1; padding: 3rem;">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--color-gray-300); margin-bottom: 1rem;"></i>
          <p style="color: var(--color-gray-500);">검색 결과가 없습니다.</p>
        </div>
      `;
      return;
    }
    
    this.grid.innerHTML = members.map(member => this.createMemberCard(member)).join('');
  },
  
  createMemberCard(member) {
    const categoryName = member.category_id ? this.getCategoryDisplayName(member.category_id) : '';
    const tags = member.tags?.slice(0, 3) || [];
    
    return `
      <div class="member-card" data-id="${member.id}">
        <div class="member-img-wrapper">
          <img src="${member.profile_img || 'https://via.placeholder.com/400x300?text=Profile'}" 
               alt="${member.name}" class="member-img" loading="lazy">
          ${member.is_featured ? '<span class="member-badge">추천</span>' : ''}
        </div>
        <div class="member-body">
          <div class="member-category">${categoryName}</div>
          <h3 class="member-name">${member.name}</h3>
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
  }
};

// =====================
// Subcategory Links
// =====================
const SubcategoryLinks = {
  async init() {
    this.container = document.getElementById('subcategoryLinks');
    if (!this.container) return;
    
    const subcategories = await DataService.getSubcategories();
    this.render(subcategories);
  },
  
  render(subcategories) {
    this.container.innerHTML = subcategories.map(sub => `
      <a href="category.html?sub=${sub.id}" class="filter-tab">${sub.name}</a>
    `).join('');
  }
};

// =====================
// Sidebar Ads
// =====================
const SidebarAds = {
  async init() {
    this.container = document.getElementById('sidebarAds');
    if (!this.container) return;
    
    // Load sidebar ads
    const ads = await DataService.getAdvertisements('sidebar');
    
    if (ads.length === 0) {
      // Show placeholder or default content
      this.renderDefault();
    } else {
      this.render(ads);
    }
  },
  
  render(ads) {
    this.container.innerHTML = ads.map(ad => `
      <a href="${ad.link_url || '#'}" class="sidebar-ad-item" target="_blank">
        <img src="${ad.image_url}" alt="${ad.title}" class="sidebar-ad-image">
        <div class="sidebar-ad-content">
          <h4 class="sidebar-ad-title">${ad.title}</h4>
          ${ad.description ? `<p class="sidebar-ad-description">${ad.description}</p>` : ''}
          <span class="sidebar-ad-badge">광고</span>
        </div>
      </a>
    `).join('');
  },
  
  renderDefault() {
    // Default sidebar content when no ads
    this.container.innerHTML = `
      <div class="sidebar-ad-item" style="cursor: default;">
        <div class="sidebar-ad-content" style="text-align: center; padding: var(--space-8);">
          <i class="fas fa-ad" style="font-size: 3rem; color: var(--color-gray-300); margin-bottom: var(--space-4);"></i>
          <h4 class="sidebar-ad-title">광고 공간</h4>
          <p class="sidebar-ad-description">이 공간에 귀하의 서비스를 홍보하세요!</p>
          <a href="visitor.html" class="btn btn-primary btn-sm" style="margin-top: var(--space-4);">문의하기</a>
        </div>
      </div>
    `;
  }
};

// =====================
// Footer Ads
// =====================
const FooterAds = {
  async init() {
    // Try to find existing container
    this.container = document.getElementById('footerAds');
    this.section = document.getElementById('footerAdsSection');
    
    // If not exists, create before footer
    if (!this.container || !this.section) {
      const footer = document.querySelector('.footer');
      if (footer) {
        this.section = document.createElement('section');
        this.section.className = 'footer-ads-section';
        this.section.id = 'footerAdsSection';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        this.container = document.createElement('div');
        this.container.className = 'footer-ads-grid';
        this.container.id = 'footerAds';
        
        container.appendChild(this.container);
        this.section.appendChild(container);
        footer.parentNode.insertBefore(this.section, footer);
      } else {
        return; // No footer found
      }
    }
    
    // Load footer ads
    const ads = await DataService.getAdvertisements('footer');
    
    if (ads.length === 0) {
      // Hide section if no ads
      this.section.style.display = 'none';
    } else {
      this.render(ads);
    }
  },
  
  render(ads) {
    this.container.innerHTML = ads.map(ad => `
      <a href="${ad.link_url || '#'}" class="footer-ad-item" target="_blank">
        <img src="${ad.image_url}" alt="${ad.title}" class="footer-ad-image">
        <div class="footer-ad-content">
          <h4 class="footer-ad-title">${ad.title}</h4>
          ${ad.description ? `<p class="footer-ad-description">${ad.description}</p>` : ''}
          <span class="footer-ad-badge">광고</span>
        </div>
      </a>
    `).join('');
  }
};

// =====================
// URL Parameters Helper
// =====================
const URLParams = {
  get(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },
  
  set(key, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }
};

// =====================
// Initialize
// =====================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize mobile menu
  MobileMenu.init();
  
  // Initialize click tracking
  if (typeof ClickTracker !== 'undefined') {
    ClickTracker.init();
  }
  
  // Initialize banner slider
  await BannerSlider.init();
  
  // Initialize category grid
  await CategoryGrid.init();
  
  // Initialize member grid
  await MemberGrid.init();
  
  // Initialize subcategory links
  await SubcategoryLinks.init();
  
  // Initialize sidebar ads
  await SidebarAds.init();
  
  // Initialize footer ads
  await FooterAds.init();
  
  console.log('BNI 최강챕터 - 페이지 로드 완료');
});

// Export for use in other modules
window.MobileMenu = MobileMenu;
window.BannerSlider = BannerSlider;
window.CategoryGrid = CategoryGrid;
window.MemberGrid = MemberGrid;
window.SidebarAds = SidebarAds;
window.FooterAds = FooterAds;
window.URLParams = URLParams;
