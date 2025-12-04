/**
 * BNI 최강챕터 - Member Detail Page JavaScript
 * 멤버 상세 페이지의 기능을 담당합니다.
 */

const MemberPage = {
  member: null,
  
  async init() {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get('id');
    
    if (!memberId) {
      this.showError('멤버 정보를 찾을 수 없습니다.');
      return;
    }
    
    await this.loadMember(memberId);
  },
  
  async loadMember(id) {
    const memberDetail = document.getElementById('memberDetail');
    
    try {
      this.member = await DataService.getMember(id);
      
      if (!this.member) {
        this.showError('멤버 정보를 찾을 수 없습니다.');
        return;
      }
      
      // Update page title for SEO
      const seoTitle = `${this.member.region || '고양'} ${this.getCategoryName(this.member.category_id)} - ${this.member.company} ${this.member.name}`;
      document.title = `${seoTitle} | BNI 최강챕터`;
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = this.member.usp_summary || `${this.member.company} ${this.member.name} - BNI 최강챕터 멤버`;
      }
      
      // Update breadcrumb
      const breadcrumb = document.getElementById('breadcrumbName');
      if (breadcrumb) {
        breadcrumb.textContent = this.member.name;
      }
      
      // Render member detail
      this.render();
      
      // Load related members
      await this.loadRelatedMembers();
      
    } catch (error) {
      console.error('Error loading member:', error);
      this.showError('멤버 정보를 불러오는 중 오류가 발생했습니다.');
    }
  },
  
  render() {
    const memberDetail = document.getElementById('memberDetail');
    const categoryName = this.getCategoryName(this.member.category_id);
    const tags = this.member.tags || [];
    
    // Parse USP summary into list items
    const uspItems = this.member.usp_summary?.split('|').map(item => item.trim()).filter(Boolean) || [];
    
    memberDetail.innerHTML = `
      <!-- Profile Card -->
      <div class="member-profile-card">
        <img src="${this.member.profile_img || 'https://via.placeholder.com/400x300?text=Profile'}" 
             alt="${this.member.name}" class="profile-image">
        <div class="profile-info">
          <div class="profile-category">${categoryName}</div>
          <h1 class="profile-name">${this.member.name}</h1>
          <p class="profile-company">${this.member.company} · ${this.member.position}</p>
          
          ${this.member.region ? `
            <div class="profile-region">
              <i class="fas fa-map-marker-alt"></i>
              <span>${this.member.region}</span>
            </div>
          ` : ''}
          
          <div class="contact-buttons">
            ${this.member.phone ? `
              <a href="tel:${this.member.phone}" class="contact-btn phone">
                <i class="fas fa-phone"></i>
                <span>전화 연결</span>
              </a>
            ` : ''}
            
            ${this.member.kakao_url ? `
              <a href="${this.member.kakao_url}" target="_blank" class="contact-btn kakao">
                <i class="fas fa-comment"></i>
                <span>카카오톡 문의</span>
              </a>
            ` : ''}
            
            ${this.member.homepage ? `
              <a href="${this.member.homepage}" target="_blank" class="contact-btn web">
                <i class="fas fa-globe"></i>
                <span>홈페이지 방문</span>
              </a>
            ` : ''}
            
            ${this.member.sns_url ? `
              <a href="${this.member.sns_url}" target="_blank" class="contact-btn sns">
                <i class="fab fa-instagram"></i>
                <span>SNS 방문</span>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="member-content">
        <!-- USP Section -->
        <div class="content-section">
          <h2 class="content-title">전문 서비스</h2>
          ${uspItems.length > 0 ? `
            <ul class="usp-list">
              ${uspItems.map(item => `
                <li>
                  <i class="fas fa-check-circle"></i>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          ` : `
            <p class="usp-summary">${this.member.usp_summary || '상세 정보가 없습니다.'}</p>
          `}
          
          ${this.member.usp_img ? `
            <img src="${this.member.usp_img}" alt="${this.member.name} USP" class="usp-image">
            <div style="margin-top: var(--space-4);">
              <a href="${this.member.usp_img}" download class="btn btn-secondary">
                <i class="fas fa-download"></i> USP 이미지 다운로드
              </a>
            </div>
          ` : ''}
        </div>
        
        <!-- Tags Section -->
        ${tags.length > 0 ? `
          <div class="content-section">
            <h2 class="content-title">전문 분야 태그</h2>
            <div class="tags-list">
              ${tags.map(tag => `<span class="tag-item">#${tag}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Contact Info Section -->
        <div class="content-section">
          <h2 class="content-title">연락처 정보</h2>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${this.member.phone ? `
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <i class="fas fa-phone" style="color: var(--color-primary); width: 20px;"></i>
                <a href="tel:${this.member.phone}">${this.member.phone}</a>
              </div>
            ` : ''}
            ${this.member.homepage ? `
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <i class="fas fa-globe" style="color: var(--color-primary); width: 20px;"></i>
                <a href="${this.member.homepage}" target="_blank">${this.member.homepage}</a>
              </div>
            ` : ''}
            ${this.member.sns_url ? `
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <i class="fab fa-instagram" style="color: var(--color-primary); width: 20px;"></i>
                <a href="${this.member.sns_url}" target="_blank">SNS 방문하기</a>
              </div>
            ` : ''}
            ${this.member.kakao_url ? `
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <i class="fas fa-comment" style="color: var(--color-primary); width: 20px;"></i>
                <a href="${this.member.kakao_url}" target="_blank">카카오톡 채널</a>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  async loadRelatedMembers() {
    const relatedContainer = document.getElementById('relatedMembers');
    if (!relatedContainer || !this.member) return;
    
    const allMembers = await DataService.getMembers({ categoryId: this.member.category_id });
    const relatedMembers = allMembers.filter(m => m.id !== this.member.id).slice(0, 3);
    
    if (relatedMembers.length === 0) {
      relatedContainer.innerHTML = '<p style="color: var(--color-gray-500);">같은 분야의 다른 전문가가 없습니다.</p>';
      return;
    }
    
    relatedContainer.innerHTML = relatedMembers.map(member => `
      <div class="member-card">
        <a href="member.html?id=${member.id}">
          <div class="member-img-wrapper">
            <img src="${member.profile_img || 'https://via.placeholder.com/400x300?text=Profile'}" 
                 alt="${member.name}" class="member-img" loading="lazy">
          </div>
        </a>
        <div class="member-body">
          <h3 class="member-name">
            <a href="member.html?id=${member.id}">${member.name}</a>
          </h3>
          <p class="member-company">${member.company} · ${member.position}</p>
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
          </div>
        </div>
      </div>
    `).join('');
  },
  
  getCategoryName(categoryId) {
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
  
  showError(message) {
    const memberDetail = document.getElementById('memberDetail');
    memberDetail.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <i class="fas fa-exclamation-circle"></i>
        <h3>${message}</h3>
        <p><a href="members.html">멤버 전체보기로 돌아가기</a></p>
      </div>
    `;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  MemberPage.init();
});
