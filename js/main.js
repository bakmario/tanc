document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar active link on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // ===== Close mobile menu on link click =====
  const navCollapse = document.getElementById('navbarNav');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(navCollapse)?.hide();
      }
    });
  });

  // ===== Fade-in on scroll =====
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));

  // ===== Load Testimonials =====
  loadTestimonials();

  // ===== Load Photographers =====
  loadPhotographers();

  // ===== Gallery =====
  initGallery();

  // ===== Contact Form =====
  initContactForm();

  // ===== Live Event Popup =====
  initEventPopup();
});

// ===== Testimonials from JSON =====
async function loadTestimonials() {
  try {
    const res = await fetch('data/testimonials.json');
    const data = await res.json();
    const inner = document.getElementById('testimonialCarouselInner');
    const indicators = document.getElementById('testimonialIndicators');
    if (!inner) return;

    inner.innerHTML = '';
    indicators.innerHTML = '';

    data.forEach((item, i) => {
      // Indicator
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#testimonialCarousel');
      indicator.setAttribute('data-bs-slide-to', i);
      if (i === 0) indicator.classList.add('active');
      indicator.setAttribute('aria-label', `Slide ${i + 1}`);
      indicators.appendChild(indicator);

      // Slide
      const slide = document.createElement('div');
      slide.className = `carousel-item${i === 0 ? ' active' : ''}`;
      slide.innerHTML = `
        <div class="testimonial-card mx-auto" style="max-width:650px;">
          <div class="testimonial-header">
            <span class="testimonial-name testimonial-name-left">${item.name_left || ''}</span>
            ${item.image ? `<img src="${item.image}" alt="Vélemény" class="testimonial-img" onerror="this.style.display='none'">` : ''}
            <span class="testimonial-name testimonial-name-right">${item.name_right || ''}</span>
          </div>
          <div class="testimonial-text">${item.text}</div>
          <div class="testimonial-venue"><i class="fas fa-map-marker-alt me-1"></i>${item.venue}</div>
          ${item.photo_credit ? `<div class="testimonial-photo-credit"><i class="fas fa-camera me-1"></i>${item.photo_credit}</div>` : ''}
          ${item.tags ? `<div class="testimonial-tags">${item.tags.map(t => `<span>${t}</span>`).join(' ')}</div>` : ''}
        </div>
      `;
      inner.appendChild(slide);
    });
  } catch (e) {
    console.error('Testimonials load error:', e);
  }
}

// ===== Photographers from JSON =====
async function loadPhotographers() {
  let photographersData = [];

  try {
    const res = await fetch('data/photographers.json');
    photographersData = await res.json();
  } catch (e) {
    console.error('Photographers load error:', e);
    return;
  }

  const container = document.getElementById('photographersList');
  const filterBtns = document.querySelectorAll('#photographers .gallery-filters .btn');
  if (!container) return;

  function renderPhotographers(filter) {
    const filtered = photographersData.filter(item => item.category === filter);
    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted">
          <p>Hamarosan...</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-10 col-sm-8 col-md-5 col-lg-5 mb-4';
      col.innerHTML = `
        <div class="photographer-card">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Fotós'">
          <div class="card-body">
            <h5>${item.name}</h5>
            <p>${item.description}</p>
            <a href="${item.link}" target="_blank" class="btn btn-outline-custom btn-sm">
              <i class="fas fa-external-link-alt me-1"></i>Megnézem
            </a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPhotographers(btn.dataset.filter);
    });
  });

  // Render default (first filter - fotos)
  renderPhotographers('helyszin');
}

// ===== Gallery with filtering & lightbox =====
async function initGallery() {
  let galleryItems = [];

  try {
    const res = await fetch('data/gallery.json');
    galleryItems = await res.json();
  } catch (e) {
    console.error('Gallery JSON load error:', e);
  }

  const grid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filters .btn');
  let currentFilter = 'all';
  let currentItems = [];
  let lightboxIndex = 0;

  // allItems: full ordered list for lightbox; featuredItems: shown in grid
  let allItems = [];

  function renderGallery(filter) {
    currentFilter = filter;
    allItems = filter === 'all' ? [...galleryItems] : galleryItems.filter(i => i.type === filter);
    const featuredItems = allItems.filter(i => i.featured);
    grid.innerHTML = '';

    if (allItems.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Feltöltés alatt...</p>
        </div>
      `;
      return;
    }

    featuredItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = `gallery-item${item.type === 'video' ? ' video-item' : ''}`;
      div.innerHTML = `
        <img src="${item.src}" alt="${item.label || 'Galéria'}" loading="lazy">
        <div class="gallery-overlay"><i class="fas ${item.type === 'video' ? 'fa-play-circle' : 'fa-search-plus'}"></i></div>
      `;
      const fullIndex = allItems.indexOf(item);
      div.addEventListener('click', () => openLightbox(fullIndex));
      grid.appendChild(div);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.filter);
    });
  });

  // Lightbox
  const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
  const lightboxBody = document.getElementById('lightboxBody');

  function openLightbox(index) {
    lightboxIndex = index;
    showLightboxContent();
    lightboxModal.show();
  }

  function showLightboxContent() {
    const item = allItems[lightboxIndex];
    if (item.type === 'video') {
      lightboxBody.innerHTML = `<iframe src="${item.src}" allowfullscreen></iframe>`;
    } else {
      lightboxBody.innerHTML = `
        <img src="${item.src}" alt="${item.label || 'Galéria'}">
        ${item.label ? `<div class="lightbox-label">${item.label}</div>` : ''}
      `;
    }
  }

  document.querySelector('.lightbox-prev')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + allItems.length) % allItems.length;
    showLightboxContent();
  });

  document.querySelector('.lightbox-next')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % allItems.length;
    showLightboxContent();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('lightboxModal');
    if (!modal.classList.contains('show')) return;
    if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + allItems.length) % allItems.length;
      showLightboxContent();
    } else if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % allItems.length;
      showLightboxContent();
    }
  });

  // Touch swipe for lightbox
  let touchStartX = 0;
  let touchEndX = 0;
  const lightboxEl = document.getElementById('lightboxModal');

  lightboxEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxEl.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left → next
        lightboxIndex = (lightboxIndex + 1) % allItems.length;
      } else {
        // Swipe right → prev
        lightboxIndex = (lightboxIndex - 1 + allItems.length) % allItems.length;
      }
      showLightboxContent();
    }
  }, { passive: true });

  renderGallery('all');
}

// ===== Contact Form → mailto =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('senderName').value.trim();
    const email = document.getElementById('senderEmail').value.trim();
    const date = document.getElementById('weddingDate').value;
    const weddingLocation = document.getElementById('weddingLocation').value.trim();
    const rehearsalLocation = document.getElementById('rehearsalLocation').value.trim();
    const printerRental = document.getElementById('printerRental').checked;
    const message = document.getElementById('messageText').value.trim();

    if (!name || !email || !message) {
      alert('Kérlek, töltsd ki az összes kötelező mezőt!');
      return;
    }

    const subject = encodeURIComponent(`Esküvői nyitótánc érdeklődés - ${name}`);
    const body = encodeURIComponent(
      `Feladó neve: ${name}\n` +
      `Feladó e-mail: ${email}\n` +
      `Esküvő dátuma: ${date || 'Még nem tudom'}\n` +
      `Esküvő helyszíne: ${weddingLocation || 'Nincs megadva'}\n` +
      `Próba helyszíne: ${rehearsalLocation || 'Nincs megadva'}\n` +
      `Fotónyomtató bérlés: ${printerRental ? 'Igen, érdekel' : 'Nem'}\n` +
      `\nÜzenet:\n${message}`
    );

    window.location.href = `mailto:feher.norbert.dance@gmail.com?subject=${subject}&body=${body}`;

    // Show success feedback
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check me-2"></i>Megnyitom az email klienst...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  });
}

// ===== Live Event Popup =====
async function initEventPopup() {
  try {
    const res = await fetch('data/event.json');
    const data = await res.json();

    // Check if enabled
    if (!data.enabled) return;

    const event = data.event;
    const delay = (data.delay_seconds || 5) * 1000;

    // Check if already dismissed this session
    if (sessionStorage.getItem('eventPopupDismissed')) return;

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'event-popup';
    popup.innerHTML = `
      <button class="event-popup-close" aria-label="Bezár">&times;</button>
      <div class="event-popup-content">
        <div class="event-popup-icon">
          <i class="fas fa-calendar-star"></i>
        </div>
        <div class="event-popup-text">${data.button_text}</div>
      </div>
    `;
    document.body.appendChild(popup);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade event-modal';
    modal.id = 'eventModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${event.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bezár"></button>
          </div>
          <div class="modal-body">
            ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-modal-image" onerror="this.style.display='none'">` : ''}
            <div class="event-modal-info">
              <div class="event-modal-info-item">
                <i class="fas fa-calendar-day"></i>
                <span><strong>${event.date}</strong>${event.time ? ` &bull; ${event.time}` : ''}</span>
              </div>
              <div class="event-modal-info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <div>${event.location}</div>
                  ${event.address ? `<small class="text-muted">${event.address}</small>` : ''}
                </div>
              </div>
            </div>
            <p class="event-modal-description">${event.description}</p>
          </div>
          ${event.cta_text && event.cta_link ? `
          <div class="modal-footer justify-content-center">
            <a href="${event.cta_link}" target="_blank" class="btn btn-event">
              <i class="fas fa-external-link-alt me-2"></i>${event.cta_text}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const eventModal = new bootstrap.Modal(modal);

    // Show popup after delay
    setTimeout(() => {
      popup.classList.add('show');
    }, delay);

    // Click popup to open modal
    popup.addEventListener('click', (e) => {
      if (e.target.closest('.event-popup-close')) return;
      popup.classList.remove('show');
      eventModal.show();
    });

    // Close button
    popup.querySelector('.event-popup-close').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.remove('show');
      sessionStorage.setItem('eventPopupDismissed', 'true');
    });

  } catch (e) {
    console.error('Event popup load error:', e);
  }
}
