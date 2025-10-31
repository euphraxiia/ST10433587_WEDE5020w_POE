const utils = {
    formatCurrency(amount) {
      return `R${parseFloat(amount).toFixed(2)}`;
    },
  
    validateEmail(email) {
      const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return pattern.test(email);
    },
  
    validatePhone(phone) {
      const cleaned = phone.replace(/\s|-/g, '');
      const saPattern = /^(0|\+27)[0-9]{9}$/;
      return saPattern.test(cleaned);
    },
  
    validateCard(number) {
      const cleaned = number.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) return false;
   
      let sum = 0;
      let shouldDouble = false;
  
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
  
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
  
        sum += digit;
        shouldDouble = !shouldDouble;
      }
  
      return sum % 10 === 0;
    },
  
    showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `toast-notification ${type}`;
      notification.textContent = message;
      
      Object.assign(notification.style, {
        position: 'fixed',
        insetBlockStart: '20px',
        insetInlineEnd: '20px',
        padding: '16px 24px',
        background: type === 'success' ? '#558B2F' : '#C62828',
        color: '#FFF8E1',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '10000',
        fontWeight: '600',
        maxInlineSize: '400px',
        animation: 'slideInRight 0.3s ease'
      });
  
      document.body.appendChild(notification);
  
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },
  
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };
  
/* promotions page interactions */

  const promotionsPage = {
    cart: null,

    init() {
      if (!window.location.pathname.includes('promotions.html')) return;

      if (!window.shoppingCart) {
        window.shoppingCart = new ShoppingCart();
      }
      this.cart = window.shoppingCart;

      try { this.renderFeatured(); } catch (_) {}
      this.attachClickHandlers();
    },

    attachClickHandlers() {
      document.querySelectorAll('.featured-pizzas .pizza-item').forEach(item => {
        const img = item.querySelector('img');
        if (img) {
          img.style.cursor = 'pointer';
          img.addEventListener('click', () => this.openSizeModal(item));
        }
        const title = item.querySelector('h3');
        if (title) {
          title.style.cursor = 'pointer';
          title.addEventListener('click', () => this.openSizeModal(item));
        }
      });
    },

    renderFeatured() {
      const wrapper = document.querySelector('.featured-pizzas');
      if (!wrapper) return;
      const ids = ['carnivore-feast', 'smokey-chicken', 'classic-margherita', 'pepperoni-special'];
      const items = ids.map(id => pizzaData.findPizza(id)).filter(Boolean);
      if (!items.length) return;
      const makeCard = (p) => `
        <div class="pizza-item">
          <img src="images/menu/${p.img}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
        </div>`;
      const rows = [];
      for (let i = 0; i < items.length; i += 2) {
        rows.push(`<div class="pizza-row">${makeCard(items[i])}${items[i+1] ? makeCard(items[i+1]) : ''}</div>`);
      }
      wrapper.innerHTML = rows.join('') + `
        <div class="order-section">
          <a href="order.html" class="order-now-btn">Order Now</a>
        </div>`;
    },

    openSizeModal(item) {
      const name = item.querySelector('h3')?.textContent?.trim();
      if (!name) return;
      const pizza = pizzaData.getAllPizzas().find(p => p.name === name);
      if (!pizza) return;

      const modal = document.createElement('div');
      modal.className = 'size-modal';
      Object.assign(modal.style, {
        position: 'fixed', insetBlockStart: '0', insetInlineStart: '0', inlineSize: '100%', blockSize: '100%',
        background: 'rgba(0,0,0,0.65)', zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center'
      });

      const content = document.createElement('div');
      Object.assign(content.style, {
        background: '#FFFFFF', padding: '28px', borderRadius: '12px', inlineSize: '90%', maxInlineSize: '520px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      });

      const sizeOptions = Object.entries(pizzaData.prices)
        .map(([size, price]) => `
          <label style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border:1px solid #E5E5E5; border-radius:8px; margin-block-end:10px; cursor:pointer;">
            <span style="font-weight:600; color:#263238;">${size.charAt(0).toUpperCase() + size.slice(1)}</span>
            <span style="color:#C62828; font-weight:700;">${utils.formatCurrency(price)}</span>
            <input type="radio" name="size" value="${size}" style="margin-inline-start:12px;">
          </label>
        `).join('');

      content.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-block-end:16px;">
          <img src="images/menu/${pizza.img}" alt="${pizza.name}" style="inline-size:80px; block-size:80px; object-fit:cover; border-radius:8px;">
          <div>
            <h3 style="margin:0; color:#263238; font-family:'Playfair Display', serif;">${pizza.name}</h3>
            <p style="margin:6px 0 0; color:#666;">${item.querySelector('p')?.textContent || ''}</p>
          </div>
        </div>
        <div style="margin:16px 0;">
          ${sizeOptions}
        </div>
        <div style="margin:12px 0; display:flex; align-items:center; gap:10px;">
          <span style="font-weight:600; color:#263238;">We Accept:</span>
          <svg width="40" height="26" viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="6" fill="#1A1F71"/><text x="50%" y="58%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF">VISA</text></svg>
          <svg width="40" height="26" viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="6" fill="#000"/><g transform="translate(14,8)"><circle cx="12" cy="12" r="12" fill="#EB001B"/><circle cx="28" cy="12" r="12" fill="#F79E1B"/><path d="M20 0a12 12 0 0 0 0 24a12 12 0 0 0 0-24z" fill="#FF5F00"/></g></svg>
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-block-start:8px;">
          <button class="cancel-size" style="padding:10px 16px; background:#ECEFF1; color:#263238; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
          <button class="confirm-size" style="padding:10px 16px; background:linear-gradient(135deg,#C62828,#B71C1C); color:#FFF8E1; border:none; border-radius:8px; cursor:pointer; font-weight:700;">Add to Cart</button>
        </div>
      `;

      modal.appendChild(content);
      document.body.appendChild(modal);

      const radios = content.querySelectorAll('input[name="size"]');
      if (radios[0]) radios[0].checked = true;

      content.querySelector('.cancel-size').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      content.querySelector('.confirm-size').addEventListener('click', () => {
        const selected = content.querySelector('input[name="size"]:checked')?.value;
        if (!selected) return;
        this.cart.addItem(pizza, selected, 1);
        modal.remove();
      });
    }
  };

/* pizza menu data & pricing */
  
  const pizzaData = {
    prices: {
      small: 60,
      medium: 85,
      large: 110,
      family: 135
    },
  
    categories: {
      meat: [
        { id: 'carnivore-feast', name: "Carnivore's Feast", desc: 'Juicy beef strips with pepperoni, bacon, and ham on a rich tomato base with mozzarella cheese, olives and bell peppers', img: 'carnivore-feast.jpg' },
        { id: 'meat-supreme', name: 'Meat Supreme', desc: 'Pepperoni, Italian sausage, mushrooms, and olives with tomato base and mozzarella cheese', img: 'meat-supreme.jpg' },
        { id: 'pepperoni-special', name: 'Pepperoni Special', desc: 'Rich tomato base topped with creamy mozzarella and slices of premium pepperoni', img: 'pepperoni-special.jpg' },
        { id: 'steakhouse-classic', name: 'Steakhouse Classic', desc: 'Juicy beef strips, fresh mushrooms, and onions on a rich tomato and mozzarella base', img: 'steakhouse-classic.jpg' },
        { id: 'salami-fiesta', name: 'Salami Fiesta', desc: 'Bold salami, ham, mozzarella cheese, bell pepper, and fresh tomatoes for a punch of flavor', img: 'salami-fiesta.jpg' },
        { id: 'meat-lovers-supreme', name: "Meat Lover's Supreme", desc: 'White sauce topped with sausage, pepperoni, mushrooms, bell peppers, olives, and corn for a true feast', img: 'meat-lovers-supreme.jpg' }
      ],
      chicken: [
        { id: 'smokey-chicken', name: 'Smokey Chicken Delight', desc: 'Succulent chicken with spicy chilli sauce, topped with olives, tomatoes, mozzarella cheese, and a drizzle of ranch sauce', img: 'smokey-chicken.jpg' },
        { id: 'chicken-mushroom', name: 'Chicken & Mushroom', desc: 'Grilled chicken breast with fresh mushrooms, herbs, and mozzarella on a white sauce base', img: 'chicken-mushroom.jpg' },
        { id: 'creamy-chicken-garden', name: 'Creamy Chicken Garden', desc: 'Succulent chicken, mozzarella, olives, bell peppers, mushrooms, and tomatoes on a velvety white sauce base', img: 'creamy-chicken-garden.jpg' },
        { id: 'rustic-chicken-basil', name: 'Rustic Chicken & Basil', desc: 'Tomato base with tender chicken, mushrooms, sweet corn, fresh basil, and mozzarella', img: 'rustic-chicken-basil.jpg' },
        { id: 'bbq-chicken-supreme', name: 'BBQ Chicken Supreme', desc: 'Smoky BBQ sauce loaded with chicken, tomatoes, bell peppers, olives, onions, and gooey mozzarella', img: 'bbq-chicken-supreme.jpg' }
      ],
      vegetarian: [
        { id: 'classic-margherita', name: 'Classic Margherita', desc: 'A combination of fresh tomato base, creamy mozzarella, and fragrant basil leaves', img: 'classic-margherita.jpg' },
        { id: 'mediterranean', name: 'Mediterranean Delight', desc: 'Feta cheese, olives, sun-dried tomatoes, spinach, and herbs with a white sauce base', img: 'mediterranean.jpg' },
        { id: 'veggie-supreme', name: 'Veggie Supreme', desc: 'Broccoli and olives on a tomato base with mozzarella cheese balls', img: 'veggie-supreme.jpg' },
        { id: 'veggie-harvest', name: 'Veggie Harvest', desc: 'Tomato base with grilled aubergine, bell peppers, rocket, and balsamic glaze', img: 'veggie-harvest.jpg' },
        { id: 'avocado-bliss', name: 'Avocado Bliss', desc: 'Creamy white sauce with mozzarella, ripe avocado, juicy tomatoes, and briny olives', img: 'avocado-bliss.jpg' }
      ]
    },
  
    getAllPizzas() {
      return [...this.categories.meat, ...this.categories.chicken, ...this.categories.vegetarian];
    },
  
    findPizza(id) {
      return this.getAllPizzas().find(p => p.id === id);
    }
  };
  
/* navigation & mobile menu */
  
  const navigation = {
    init() {
      this.setupMobileMenu();
      this.highlightCurrentPage();
      this.setupSmoothScroll();
    },
  
    setupMobileMenu() {
      const header = document.querySelector('header');
      if (!header) return;
  
      const hamburger = document.createElement('button');
      hamburger.className = 'hamburger-menu';
      hamburger.setAttribute('aria-label', 'Toggle navigation menu');
      hamburger.innerHTML = '<span></span><span></span><span></span>';
  
      Object.assign(hamburger.style, {
        display: 'none',
        flexDirection: 'column',
        gap: '5px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        position: 'absolute',
        insetInlineEnd: '20px',
        insetBlockStart: '50%',
        transform: 'translateY(-50%)',
        zIndex: '1001'
      });
  
      hamburger.querySelectorAll('span').forEach(span => {
        Object.assign(span.style, {
          inlineSize: '28px',
          blockSize: '3px',
          background: '#FFF8E1',
          transition: 'all 0.3s ease',
          borderRadius: '2px',
          display: 'block'
        });
      });
  
      header.style.position = 'relative';
      header.appendChild(hamburger);
  
      hamburger.addEventListener('click', () => this.toggleMobileMenu(hamburger));
      window.addEventListener('resize', () => this.handleResize(hamburger));
      this.handleResize(hamburger);
    },
  
    toggleMobileMenu(hamburger) {
      const navMenu = document.querySelector('.nav-menu');
      if (!navMenu) return;
      const spans = hamburger.querySelectorAll('span');
      const isActive = hamburger.classList.toggle('active');
  
      if (isActive) {
        Object.assign(navMenu.style, {
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          insetBlockStart: '100%',
          insetInlineStart: '0',
          insetInlineEnd: '0',
          background: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: '1000'
        });
  
        spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
      } else {
        this.resetMobileMenu(navMenu, spans);
      }
    },
  
    resetMobileMenu(navMenu, spans) {
      if (!navMenu) return;
      navMenu.removeAttribute('style');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    },
  
    handleResize(hamburger) {
      const navMenu = document.querySelector('.nav-menu');
      const spans = hamburger.querySelectorAll('span');
  
      if (window.innerWidth <= 768) {
        hamburger.style.display = 'flex';
        if (navMenu && !hamburger.classList.contains('active')) {
          navMenu.style.display = 'none';
        }
      } else {
        hamburger.style.display = 'none';
        hamburger.classList.remove('active');
        this.resetMobileMenu(navMenu, spans);
      }
    },
  
    highlightCurrentPage() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });
    },
  
    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }
  };
  
/* shopping cart */
  
  class ShoppingCart {
    constructor() {
      this.items = this.load();
      this.init();
    }
  
    init() {
      this.createCartButton();
      this.updateCartDisplay();
    }
  
    createCartButton() {
      if (document.querySelector('.cart-button')) return;
  
      const button = document.createElement('button');
      button.className = 'cart-button';
      button.setAttribute('aria-label', 'View shopping cart');
      button.innerHTML = `
        <span class="cart-icon">🛒</span>
        <span class="cart-count">0</span>
      `;
  
      Object.assign(button.style, {
        position: 'fixed',
        insetBlockEnd: '30px',
        insetInlineEnd: '30px',
        inlineSize: '60px',
        blockSize: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #C62828, #B71C1C)',
        color: '#FFF8E1',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(198, 40, 40, 0.4)',
        zIndex: '999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'transform 0.2s'
      });
  
      const countBadge = button.querySelector('.cart-count');
      Object.assign(countBadge.style, {
        position: 'absolute',
        insetBlockStart: '-5px',
        insetInlineEnd: '-5px',
        background: '#FFF8E1',
        color: '#C62828',
        inlineSize: '24px',
        blockSize: '24px',
        borderRadius: '50%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      });
  
      button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.1)');
      button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');
      button.addEventListener('click', () => this.showCartModal());
  
      document.body.appendChild(button);
    }
  
    addItem(pizza, size, quantity = 1) {
      const price = pizzaData.prices[size];
      const existing = this.items.find(item => 
        item.pizzaId === pizza.id && item.size === size
      );
  
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          pizzaId: pizza.id,
          name: pizza.name,
          size: size,
          price: price,
          quantity: quantity
        });
      }
  
      this.save();
      this.updateCartDisplay();
      utils.showNotification(`${pizza.name} added to cart!`, 'success');
    }

    addCustomItem({ name, size, unitPrice, quantity = 1, category = 'other' }) {
      const existing = this.items.find(item => item.name === name && item.size === size);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          pizzaId: null,
          name: name,
          size: size,
          price: unitPrice,
          quantity: quantity,
          category: category
        });
      }

      this.save();
      this.updateCartDisplay();
      utils.showNotification(`${name} added to cart!`, 'success');
    }
  
    removeItem(index) {
      this.items.splice(index, 1);
      this.save();
      this.updateCartDisplay();
    }
  
    updateQuantity(index, newQuantity) {
      if (newQuantity <= 0) {
        this.removeItem(index);
      } else {
        this.items[index].quantity = newQuantity;
        this.save();
        this.updateCartDisplay();
      }
    }
  
    getTotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
  
    getTotalItems() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  
    updateCartDisplay() {
      const countEl = document.querySelector('.cart-count');
      if (countEl) {
        const total = this.getTotalItems();
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'flex' : 'none';
      }
      // notify listeners (e.g., checkout page) that cart changed
      try {
        const evt = new CustomEvent('cart:updated', { detail: { items: this.items, total: this.getTotal() } });
        document.dispatchEvent(evt);
      } catch (_) { /* noop */ }
    }

    save() {
      try {
        localStorage.setItem('campanella_cart_items', JSON.stringify(this.items));
      } catch (_) {
        // ignore storage errors
      }
    }

    load() {
      try {
        const raw = localStorage.getItem('campanella_cart_items');
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }
  
    showCartModal() {
      const modal = document.createElement('div');
      modal.className = 'cart-modal';
      
      Object.assign(modal.style, {
        position: 'fixed',
        insetBlockStart: '0',
        insetInlineStart: '0',
        inlineSize: '100%',
        blockSize: '100%',
        background: 'rgba(0,0,0,0.6)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease'
      });
  
      const content = document.createElement('div');
      Object.assign(content.style, {
        background: '#FFFFFF',
        padding: '30px',
        borderRadius: '12px',
        maxInlineSize: '600px',
        inlineSize: '90%',
        maxBlockSize: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      });
  
      content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-block-end: 24px; border-block-end: 2px solid #F0F0F0; padding-block-end: 16px;">
          <h2 style="margin: 0; color: #263238; font-family: 'Playfair Display', serif;">Your Cart</h2>
          <button class="close-cart" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666; line-height: 1;">&times;</button>
        </div>
        ${this.renderCartItems()}
        <div style="margin-block-start: 24px; padding-block-start: 20px; border-block-start: 2px solid #F0F0F0;">
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #263238; margin-block-end: 16px;">
            <span>Total:</span>
            <span style="color: #C62828;">${utils.formatCurrency(this.getTotal())}</span>
          </div>
          <button class="checkout-btn" style="inline-size: 100%; padding: 16px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
            Proceed to Checkout
          </button>
        </div>
      `;
  
      modal.appendChild(content);
      document.body.appendChild(modal);
  
      modal.querySelector('.close-cart').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
  
      modal.querySelector('.checkout-btn').addEventListener('click', () => {
        window.location.href = 'order.html';
      });
  
      const updateTotals = () => {
        const totalsContainer = modal.querySelector('.checkout-btn').previousElementSibling;
        if (totalsContainer) {
          totalsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #263238; margin-block-end: 16px;">
              <span>Total:</span>
              <span style="color: #C62828;">${utils.formatCurrency(this.getTotal())}</span>
            </div>
          `;
        }
      };

      content.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.cart-qty-btn');
        const removeBtn = e.target.closest('.cart-remove-btn');

        if (qtyBtn) {
          const index = parseInt(qtyBtn.dataset.index);
          const action = qtyBtn.dataset.action;
          const currentQty = this.items[index]?.quantity ?? 0;
          if (action === 'increase') {
            this.updateQuantity(index, currentQty + 1);
          } else if (action === 'decrease') {
            this.updateQuantity(index, currentQty - 1);
          }

          if (this.items.length === 0) {
            modal.remove();
            return;
          }

          const list = content.querySelector('.cart-items');
          if (list) list.innerHTML = this.renderCartItemsOnly();
          updateTotals();
        } else if (removeBtn) {
          const index = parseInt(removeBtn.dataset.index);
          this.removeItem(index);
          if (this.items.length === 0) {
            modal.remove();
            return;
          }
          const list = content.querySelector('.cart-items');
          if (list) list.innerHTML = this.renderCartItemsOnly();
          updateTotals();
        }
      });
    }
  
    renderCartItems() {
      if (this.items.length === 0) {
        return '<p style="text-align: center; color: #666; padding: 40px 0;">Your cart is empty</p>';
      }
      return `<div class="cart-items" style="max-block-size: 400px; overflow-y: auto;">${this.renderCartItemsOnly()}</div>`;
    }

    renderCartItemsOnly() {
      return this.items.map((item, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-block-end: 1px solid #F0F0F0; gap: 16px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #263238; margin-block-end: 4px;">${item.name}</div>
            <div style="color: #777; font-size: 14px; margin-block-end: 4px;">${item.size.charAt(0).toUpperCase() + item.size.slice(1)}</div>
            <div style="color: #C62828; font-weight: 600;">${utils.formatCurrency(item.price)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="cart-qty-btn" data-index="${index}" data-action="decrease" style="inline-size: 32px; block-size: 32px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-weight: bold;">−</button>
            <span style="min-inline-size: 24px; text-align: center; font-weight: 600;">${item.quantity}</span>
            <button class="cart-qty-btn" data-index="${index}" data-action="increase" style="inline-size: 32px; block-size: 32px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-weight: bold;">+</button>
            <button class="cart-remove-btn" data-index="${index}" style="margin-inline-start: 8px; padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Remove</button>
          </div>
        </div>
      `).join('');
    }
  }
  
/* menu page features */
  
  const menuPage = {
    cart: null,
  
    init() {
      if (!window.location.pathname.includes('menu.html')) return;
  
      if (!window.shoppingCart) {
        window.shoppingCart = new ShoppingCart();
      }
      this.cart = window.shoppingCart;
      this.setupSearch();
      this.addMenuTabs();
      // Ensure dynamic content is rendered BEFORE wiring buttons/controls
      Promise.resolve(this.renderMenuFromData())
        .catch(() => {})
        .finally(() => {
          this.setupCategoryAccordions();
          this.addCartButtons();
          this.enhanceDrinkSections();
          this.enhanceDrinkCards();
          this.addExtrasButtons();
        });
    },
  
    setupSearch() {
      const main = document.querySelector('main');
      if (!main) return;
  
      const searchContainer = document.createElement('div');
      searchContainer.style.cssText = 'max-inline-size: 600px; margin: 20px auto; padding: 0 20px;';
      searchContainer.innerHTML = `
        <input type="search" id="menu-search" placeholder="Search pizzas by name or ingredients..." style="
          inline-size: 100%;
          padding: 14px 20px;
          font-size: 16px;
          border: 2px solid #D0D0D0;
          border-radius: 25px;
          outline: none;
          transition: border-color 0.3s;
          font-family: 'Open Sans', sans-serif;
        ">
        <div id="search-results" style="margin-block-start: 12px; color: #666; font-size: 14px;" role="status" aria-live="polite"></div>
      `;
  
      const heading = main.querySelector('.menu-heading');
      if (heading) {
        heading.after(searchContainer);
      }
  
      const searchInput = searchContainer.querySelector('#menu-search');
      const resultsDiv = searchContainer.querySelector('#search-results');
  
      searchInput.addEventListener('focus', () => searchInput.style.borderColor = '#C62828');
      searchInput.addEventListener('blur', () => searchInput.style.borderColor = '#D0D0D0');
  
      searchInput.addEventListener('input', utils.debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        const pizzaItems = document.querySelectorAll('.pizza-item');
        let visibleCount = 0;
  
        pizzaItems.forEach(item => {
          const name = item.querySelector('h3')?.textContent.toLowerCase() || '';
          const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
  
          if (!query || name.includes(query) || desc.includes(query)) {
            item.style.display = '';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });
  
        if (query) {
          resultsDiv.textContent = `Found ${visibleCount} pizza${visibleCount !== 1 ? 's' : ''}`;
        } else {
          resultsDiv.textContent = '';
        }
      }, 300));
    },

    addMenuTabs() {
      const container = document.querySelector('.menu-heading');
      if (!container || document.querySelector('.menu-tabs')) return;
      const tabs = document.createElement('div');
      tabs.className = 'menu-tabs';
      tabs.setAttribute('role', 'tablist');
      tabs.style.cssText = 'display:flex; gap:10px; justify-content:center; margin:10px 0 20px 0; flex-wrap:wrap;';
      const sections = [
        { sel: '.meat-pizza, .chicken-pizza, .vegetarian-pizza, .drinks, .extras', id: 'all', label: 'All' },
        { sel: '.meat-pizza', id: 'meat', label: 'Meat' },
        { sel: '.chicken-pizza', id: 'chicken', label: 'Chicken' },
        { sel: '.vegetarian-pizza', id: 'vegetarian', label: 'Vegetarian' },
        { sel: '.drinks', id: 'drinks', label: 'Drinks' },
        { sel: '.extras', id: 'extras', label: 'Extras' }
      ];
      tabs.innerHTML = sections.map(({ id, label }) => `
        <button id="tab-btn-${id}" role="tab" aria-controls="tab-${id}" data-target="${id}" class="tab-btn" style="padding:8px 14px; border-radius:999px; border:1px solid #E0E0E0; background:#fff; cursor:pointer; font-weight:600;">${label}</button>
      `).join('');
      container.after(tabs);

      const sectionEls = sections.map(s => ({ ...s, el: document.querySelector(s.sel) }));
      // Ensure tabpanel semantics and ids exist
      sectionEls.forEach(({ id, el }) => {
        if (!el) return;
        el.setAttribute('role', 'tabpanel');
        el.setAttribute('id', `tab-${id}`);
        el.setAttribute('aria-labelledby', `tab-btn-${id}`);
      });
      // Tabs act as filters: show only selected section; 'all' shows everything
      const activate = (id) => {
        sectionEls.forEach(({ id: sid, el }) => {
          if (!el) return;
          if (id === 'all') {
            el.style.display = '';
          } else {
            el.style.display = sid === id ? '' : 'none';
          }
        });
        tabs.querySelectorAll('.tab-btn').forEach(btn => btn.setAttribute('aria-selected', btn.dataset.target === id ? 'true' : 'false'));
      };
      tabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        activate(btn.dataset.target);
      });
      tabs.addEventListener('keydown', (e) => {
        const buttons = Array.from(tabs.querySelectorAll('.tab-btn'));
        const idx = buttons.indexOf(document.activeElement);
        if (idx === -1) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); buttons[(idx+1)%buttons.length].focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); buttons[(idx-1+buttons.length)%buttons.length].focus(); }
      });
      // Start with All visible
      activate('all');
    },

    async renderMenuFromData() {
      try {
        const res = await fetch('data/menu.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.prices) pizzaData.prices = data.prices;
          if (data?.categories) pizzaData.categories = data.categories;
        }
      } catch (_) { /* fallback to baked-in data */ }

      const mapSection = (selector, items) => {
        const section = document.querySelector(selector);
        if (!section) return;
        let row = section.querySelector('.pizza-row');
        if (!row) {
          row = document.createElement('div');
          row.className = 'pizza-row';
          section.appendChild(row);
        }
        row.innerHTML = items.map(p => `
          <div class="pizza-item">
            <img src="images/menu/${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
          </div>
        `).join('');
      };

      mapSection('.meat-pizza', pizzaData.categories.meat);
      mapSection('.chicken-pizza', pizzaData.categories.chicken);
      mapSection('.vegetarian-pizza', pizzaData.categories.vegetarian);
    },
  
    setupCategoryAccordions() {
      const categories = document.querySelectorAll('.meat-pizza, .chicken-pizza, .vegetarian-pizza');
      
      categories.forEach(category => {
        const heading = category.querySelector('h2');
        if (!heading) return;
  
        heading.style.cursor = 'pointer';
        heading.style.userSelect = 'none';
        heading.style.position = 'relative';
        heading.style.paddingRight = '40px';
  
        const indicator = document.createElement('span');
        indicator.textContent = '−';
        indicator.style.cssText = 'position: absolute; inset-inline-end: 10px; font-size: 24px; transition: transform 0.3s;';
        heading.appendChild(indicator);
  
        const content = category.querySelector('.pizza-row');
        if (!content) return;
  
        heading.addEventListener('click', () => {
          const isHidden = content.style.display === 'none';
          
          if (isHidden) {
            content.style.display = '';
            indicator.textContent = '−';
            indicator.style.transform = 'rotate(0deg)';
          } else {
            content.style.display = 'none';
            indicator.textContent = '+';
            indicator.style.transform = 'rotate(90deg)';
          }
        });
      });
    },
  
    addCartButtons() {
      document.querySelectorAll('.pizza-item').forEach(item => {
        const name = item.querySelector('h3')?.textContent;
        if (!name) return;
  
        const pizza = pizzaData.getAllPizzas().find(p => p.name === name);
        if (!pizza) return;

        // Add visible starting price badge if missing
        if (!item.querySelector('.price-badge')) {
          const titleEl = item.querySelector('h3');
          if (titleEl) {
            const badge = document.createElement('div');
            badge.className = 'price-badge';
            badge.textContent = `From ${utils.formatCurrency(pizzaData.prices.small)}`;
            badge.style.cssText = 'display:inline-block; margin-top: 6px; color:#C62828; font-weight:800;';
            titleEl.after(badge);
          }
        }
  
        const controls = document.createElement('div');
        controls.className = 'pizza-controls';
        controls.style.cssText = 'margin-block-start: 16px; display: flex; flex-direction: column; gap: 10px;';
  
        const sizeOptions = Object.entries(pizzaData.prices)
          .map(([size, price]) => `<option value="${size}">${size.charAt(0).toUpperCase() + size.slice(1)} - ${utils.formatCurrency(price)}</option>`)
          .join('');
  
        controls.innerHTML = `
          <select class="size-select" style="padding: 10px; border: 2px solid #D0D0D0; border-radius: 8px; font-size: 14px; font-family: 'Open Sans', sans-serif; cursor: pointer;">
            ${sizeOptions}
          </select>
          <div class="qty-total" style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:14px; color:#555;">Qty</label>
            <input type="number" class="pizza-qty" min="1" value="1" style="inline-size:70px; padding:8px; border:2px solid #D0D0D0; border-radius:8px; font-size:14px; text-align:center;" />
            <span class="pizza-total" style="font-weight:700; color:#C62828; min-inline-size:90px; text-align:center;"></span>
          </div>
          <button class="add-to-cart-btn" style="padding: 12px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s; font-family: 'Open Sans', sans-serif;">
            Add to Cart
          </button>
        `;
  
        item.appendChild(controls);
  
        const sizeSelect = controls.querySelector('.size-select');
        const qtyInput = controls.querySelector('.pizza-qty');
        const totalEl = controls.querySelector('.pizza-total');
        const btn = controls.querySelector('.add-to-cart-btn');

        const updateTotal = () => {
          const size = sizeSelect.value;
          const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
          const unit = pizzaData.prices[size];
          totalEl.textContent = utils.formatCurrency(unit * qty);
        };
        sizeSelect.addEventListener('change', updateTotal);
        qtyInput.addEventListener('input', updateTotal);
        updateTotal();
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 4px 12px rgba(198, 40, 40, 0.3)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        });
  
        btn.addEventListener('click', () => {
          const size = sizeSelect.value;
          const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
          this.cart.addItem(pizza, size, qty);
        });
      });
    }
    ,

    enhanceDrinkSections() {
      const enhance = (headerLabel, prices, categoryLabel) => {
        const header = Array.from(document.querySelectorAll('.drinks h3')).find(h => h.textContent.trim().toLowerCase() === headerLabel);
        const list = header?.nextElementSibling;
        if (!header || !list || list.tagName !== 'UL') return;

        list.querySelectorAll('li').forEach(li => {
          const nameText = li.textContent.trim();
          li.textContent = '';

          const container = document.createElement('div');
          container.className = 'drink-item';
          container.innerHTML = `
            <span class=\"drink-name\">${nameText}</span>
            <div class=\"juice-controls\" style=\"display:flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center;\">
              <select class=\"juice-size\" style=\"padding: 8px 10px; border: 2px solid #D0D0D0; border-radius: 8px; font-size: 14px; font-family: 'Open Sans', sans-serif;\">
                <option value=\"small\">Small (300ml) - ${utils.formatCurrency(prices.small)}</option>
                <option value=\"medium\">Medium (500ml) - ${utils.formatCurrency(prices.medium)}</option>
                <option value=\"large\">Large (750ml) - ${utils.formatCurrency(prices.large)}</option>
              </select>
              <div class=\"qty-group\" style=\"display:flex; align-items:center; gap:6px;\">
                <label for=\"\" style=\"font-size: 14px; color:#555;\">Qty</label>
                <input type=\"number\" class=\"juice-qty\" min=\"1\" value=\"1\" style=\"inline-size:70px; padding:8px; border: 2px solid #D0D0D0; border-radius: 8px; font-size: 14px; text-align: center;\" />
              </div>
              <span class=\"juice-total\" style=\"font-weight:700; color:#C62828; min-inline-size:90px; text-align:center;\"></span>
              <button class=\"juice-add-btn\" style=\"padding: 10px 14px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;\">Add to Cart</button>
            </div>
          `;

          li.appendChild(container);

          const sizeSelect = container.querySelector('.juice-size');
          const qtyInput = container.querySelector('.juice-qty');
          const totalEl = container.querySelector('.juice-total');
          const addBtn = container.querySelector('.juice-add-btn');

          const updateTotal = () => {
            const size = sizeSelect.value;
            const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
            const unit = prices[size];
            totalEl.textContent = utils.formatCurrency(unit * qty);
          };
          sizeSelect.addEventListener('change', updateTotal);
          qtyInput.addEventListener('input', updateTotal);
          updateTotal();

          addBtn.addEventListener('click', () => {
            const size = sizeSelect.value;
            const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
            const unit = prices[size];
            this.cart.addCustomItem({ name: nameText + categoryLabel, size, unitPrice: unit, quantity: qty, category: headerLabel });
          });
        });
      };

      enhance('cold drinks', { small: 30, medium: 40, large: 50 }, ' (Soda)');
      enhance('milkshakes', { small: 40, medium: 50, large: 60 }, ' (Milkshake)');
      enhance('water', { small: 25, medium: 30, large: 35 }, ' (Water)');
      enhance('juice', { small: 30, medium: 40, large: 50 }, ' (Juice)');
    }
    ,

    // Inject responsive size/qty controls and Add to Cart into .drinks-grid cards (no visible pricing)
    enhanceDrinkCards() {
      const priceMaps = {
        'cold drinks': { small: 30, medium: 40, large: 50, label: ' (Soda)' },
        'milkshakes': { small: 40, medium: 50, large: 60, label: ' (Milkshake)' },
        'water': { small: 25, medium: 30, large: 35, label: ' (Water)' },
        'juice': { small: 35, medium: 45, large: 55, label: ' (Juice)' }
      };

      const sections = document.querySelectorAll('.drinks h3');
      sections.forEach(h3 => {
        const key = h3.textContent.trim().toLowerCase();
        const prices = priceMaps[key];
        const grid = h3.nextElementSibling;
        if (!prices || !grid || !grid.classList.contains('drinks-grid')) return;

        grid.querySelectorAll('.drink-item-grid').forEach(card => {
          if (card.querySelector('.drink-controls')) return; // idempotent
          const name = card.querySelector('h4')?.textContent?.trim() || 'Drink';
          const legacySizes = card.querySelector('.drink-sizes');
          if (legacySizes) legacySizes.remove(); // remove static price pills

          const controls = document.createElement('div');
          controls.className = 'drink-controls';
          controls.style.cssText = 'margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center;';
          controls.innerHTML = `
            <select class="drink-size" style="padding:10px; border:2px solid #D0D0D0; border-radius:8px; font-size:14px; font-family:'Open Sans', sans-serif; cursor:pointer;">
              <option value="small">Small - ${utils.formatCurrency(prices.small)}</option>
              <option value="medium">Medium - ${utils.formatCurrency(prices.medium)}</option>
              <option value="large">Large - ${utils.formatCurrency(prices.large)}</option>
            </select>
            <div class="qty-wrap" style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:14px; color:#555;">Qty</label>
              <input type="number" class="drink-qty" min="1" value="1" style="inline-size:70px; padding:8px; border:2px solid #D0D0D0; border-radius:8px; font-size:14px; text-align:center;" />
            </div>
            <button class="drink-add-btn" style="padding: 10px 14px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">Add to Cart</button>
          `;

          card.appendChild(controls);

          const sizeSelect = controls.querySelector('.drink-size');
          const qtyInput = controls.querySelector('.drink-qty');
          // ensure visible total next to Qty
          let totalEl = controls.querySelector('.drink-total');
          if (!totalEl) {
            totalEl = document.createElement('span');
            totalEl.className = 'drink-total';
            totalEl.style.cssText = 'font-weight:700; color:#C62828; min-inline-size:90px; text-align:center;';
            const btnRef = controls.querySelector('.drink-add-btn');
            controls.insertBefore(totalEl, btnRef);
          }
          const updateDrinkTotal = () => {
            const size = sizeSelect.value;
            const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
            const unit = prices[size];
            totalEl.textContent = utils.formatCurrency(unit * qty);
          };
          sizeSelect.addEventListener('change', updateDrinkTotal);
          qtyInput.addEventListener('input', updateDrinkTotal);
          updateDrinkTotal();
          const addBtn = controls.querySelector('.drink-add-btn');

          addBtn.addEventListener('click', () => {
            const size = sizeSelect.value;
            const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
            const unit = prices[size];
            menuPage.cart.addCustomItem({ name: name + (prices.label || ''), size, unitPrice: unit, quantity: qty, category: key });
          });
        });
      });
    }
    ,

    // Add Add to Cart on Extras with quantity control
    addExtrasButtons() {
      document.querySelectorAll('.extras .extras-item').forEach(card => {
        if (card.querySelector('.extras-controls')) return; // idempotent
        const name = card.querySelector('h3')?.textContent?.trim() || 'Extra';
        const priceEl = card.querySelector('.price');
        const priceText = priceEl?.textContent || 'R0';
        const unit = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        // remove top price display; we'll show total near Qty
        if (priceEl) priceEl.remove();

        const controls = document.createElement('div');
        controls.className = 'extras-controls';
        controls.style.cssText = 'margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center;';
        controls.innerHTML = `
          <div class="qty-wrap" style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:14px; color:#555;">Qty</label>
            <input type="number" class="extra-qty" min="1" value="1" style="inline-size:70px; padding:8px; border:2px solid #D0D0D0; border-radius:8px; font-size:14px; text-align:center;" />
          </div>
          <span class="extra-total" style="font-weight:700; color:#C62828; min-inline-size:90px; text-align:center;">${utils.formatCurrency(unit)}</span>
          <button class="extra-add-btn" style="padding: 10px 14px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">Add to Cart</button>
        `;

        card.appendChild(controls);

        const qtyInput = controls.querySelector('.extra-qty');
        const totalEl = controls.querySelector('.extra-total');
        const addBtn = controls.querySelector('.extra-add-btn');

        const updateTotal = () => {
          const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
          totalEl.textContent = utils.formatCurrency(unit * qty);
        };

        qtyInput.addEventListener('input', updateTotal);
        updateTotal();

        addBtn.addEventListener('click', () => {
          const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
          menuPage.cart.addCustomItem({ name, size: 'single', unitPrice: unit, quantity: qty, category: 'extras' });
        });
      });
    }
  };
  
/* checkout page cart summary */

  const checkoutSummary = {
    cart: null,

    init() {
      if (!window.location.pathname.includes('order.html')) return;
      if (!window.shoppingCart) {
        window.shoppingCart = new ShoppingCart();
      }
      this.cart = window.shoppingCart;
      this.injectSummary();
      this.render();

      document.addEventListener('cart:updated', () => this.render());
    },

    injectSummary() {
      const formSection = document.querySelector('.order-form-section');
      if (!formSection || document.querySelector('.checkout-cart-summary')) return;

      const summary = document.createElement('section');
      summary.className = 'checkout-cart-summary';
      // Ensure summary matches the same width/alignment as the main form
      summary.style.cssText = 'background:#FFFFFF; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 16px rgba(38,50,56,0.08); border: 1px solid #ECECEC; margin-block-end: 2rem; max-inline-size: 700px; margin-inline-start: auto; margin-inline-end: auto;';
      summary.innerHTML = `
        <h2 style="margin:0 0 12px 0; color:#263238; font-family:'Playfair Display', serif;">Your Order Summary</h2>
        <div class="summary-body"></div>
        <div class="summary-total" style="margin-block-start: 12px; display:flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem;">
          <span>Total</span>
          <span class="summary-total-amount" style="color:#C62828;">R0.00</span>
        </div>
      `;

      formSection.parentElement?.insertBefore(summary, formSection);
    },

    getItemImageSrc(item) {
      // Pizzas use structured data
      if (item.pizzaId) {
        const p = pizzaData.findPizza(item.pizzaId);
        if (p?.img) return `images/menu/${p.img}`;
      }

      // Drinks & Extras: best-effort mapping by name
      const mapping = {
        // Drinks
        'coke': 'coke.jpg',
        'fanta grape': 'fanta-grape.jpg',
        'fanta orange': 'fanta-orange.jpg',
        'sparletta raspberry': 'sparletta-raspberry.jpg',
        'still water': 'still-water.jpg',
        'sparkling water': 'sparkling-water.jpg',
        'strawberry milkshake': 'strawberry-milkshake.jpg',
        'chocolate milkshake': 'chocolate-milkshake.jpg',
        'vanilla milkshake': 'vanilla-milkshake.jpg',
        'cream soda milkshake': 'cream-soda-milkshake.jpg',
        'apple juice': 'apple-juice.jpg',
        'orange juice': 'orange-juice.jpg',
        'mango and orange juice': 'mango-juice.jpg',
        'mango & orange juice': 'mango-juice.jpg',
        'tropical juice': 'tropical-juice.jpg',
        // Extras
        'garlic bread': 'garlic-bread.jpg',
        'caesar salad': 'caesar-salad.jpg',
        'garden salad': 'garden-salad.jpg',
        'chicken wings': 'chicken-wings.jpg',
        'potato wedges': 'potato-wedges.jpg',
        'onion rings': 'onion-rings.jpg'
      };

      const baseName = (item.name || '')
        .toString()
        .toLowerCase()
        .replace(/\s*\([^)]*\)\s*/g, '') // drop suffix like (Soda)
        .replace(/&/g, 'and')
        .trim();
      const file = mapping[baseName];
      if (file) return `images/menu/${file}`;

      // Fallback placeholder with initial
      const letter = (item.category || 'I').toString().charAt(0).toUpperCase();
      const svg = encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
          <rect width='100%' height='100%' rx='10' ry='10' fill='#F5F5F5'/>
          <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='#C62828'>${letter}</text>
        </svg>
      `.trim());
      return `data:image/svg+xml;charset=UTF-8,${svg}`;
    },

    render() {
      const container = document.querySelector('.checkout-cart-summary .summary-body');
      const totalEl = document.querySelector('.checkout-cart-summary .summary-total-amount');
      if (!container || !totalEl) return;

      const items = this.cart.items;
      if (!items.length) {
        container.innerHTML = '<p style="color:#666;">Your cart is empty.</p>';
        totalEl.textContent = utils.formatCurrency(0);
        return;
      }

      container.innerHTML = items.map((item, index) => {
        const lineTotal = (item.price * item.quantity);
        const subtitle = item.size ? `${item.size.charAt(0).toUpperCase() + item.size.slice(1)}` : '';
        const imgSrc = this.getItemImageSrc(item);
        return `
          <div style="display:flex; align-items:center; justify-content: space-between; gap:12px; padding: 10px 0; border-block-end: 1px solid #F0F0F0;">
            <div style="display:flex; align-items:center; gap:12px; flex:1;">
              <img src="${imgSrc}" alt="${item.name}" style="inline-size:48px; block-size:48px; object-fit:cover; border-radius:8px; border:1px solid #EEE;">
              <div>
                <div style="font-weight:700; color:#263238;">${item.name}</div>
                <div style="color:#777; font-size: 13px;">${subtitle} ${utils.formatCurrency(item.price)}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="cs-qty" data-index="${index}" data-action="decrease" style="inline-size:28px; block-size:28px; border:1px solid #ddd; background:white; border-radius:4px; cursor:pointer;">−</button>
              <span style="min-inline-size: 24px; text-align:center; font-weight:600;">${item.quantity}</span>
              <button class="cs-qty" data-index="${index}" data-action="increase" style="inline-size:28px; block-size:28px; border:1px solid #ddd; background:white; border-radius:4px; cursor:pointer;">+</button>
              <button class="cs-remove" data-index="${index}" style="margin-inline-start:6px; padding:6px 10px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Remove</button>
              <div style="min-inline-size:90px; text-align:end; font-weight:700; color:#C62828;">${utils.formatCurrency(lineTotal)}</div>
            </div>
          </div>
        `;
      }).join('');

      totalEl.textContent = utils.formatCurrency(this.cart.getTotal());

      container.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.cs-qty');
        const removeBtn = e.target.closest('.cs-remove');
        if (qtyBtn) {
          const index = parseInt(qtyBtn.dataset.index);
          const action = qtyBtn.dataset.action;
          const current = this.cart.items[index]?.quantity ?? 0;
          if (action === 'increase') this.cart.updateQuantity(index, current + 1);
          if (action === 'decrease') this.cart.updateQuantity(index, current - 1);
        } else if (removeBtn) {
          const index = parseInt(removeBtn.dataset.index);
          this.cart.removeItem(index);
        }
      }, { once: true });
    }
  };

/* order form validation */
  
  const orderForm = {
    form: null,
  
    init() {
      this.form = document.querySelector('.order-form');
      if (!this.form) return;
  
      this.setupValidation();
      this.setupPriceCalculator();
      this.setupFormSubmit();
    },
  
    setupValidation() {
      const fields = {
        email: { validator: utils.validateEmail, message: 'Please enter a valid email address' },
        contactNumber: { validator: utils.validatePhone, message: 'Please enter a valid South African phone number (e.g., 0821234567)' },
        cardNumber: { validator: utils.validateCard, message: 'Please enter a valid credit card number' }
      };
  
      Object.entries(fields).forEach(([fieldName, config]) => {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;
  
        if (fieldName === 'contactNumber') {
          input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
          });
        }
  
        if (fieldName === 'cardNumber') {
          input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').substring(0, 16);
            e.target.value = value.match(/.{1,4}/g)?.join(' ') || value;
          });
        }
  
        input.addEventListener('blur', () => {
          if (input.value && !config.validator(input.value)) {
            this.showError(input, config.message);
          } else {
            this.clearError(input);
          }
        });
  
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.clearError(input);
          }
        });
      });
  
      const cvvInput = this.form.querySelector('[name="cvv"]');
      if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
  
        cvvInput.addEventListener('blur', () => {
          if (cvvInput.value && (cvvInput.value.length < 3 || cvvInput.value.length > 4)) {
            this.showError(cvvInput, 'CVV must be 3 or 4 digits');
          } else {
            this.clearError(cvvInput);
          }
        });
      }
    },
  
    showError(input, message) {
      this.clearError(input);
      input.classList.add('error');
      input.style.borderColor = '#C62828';
  
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      error.style.cssText = 'color: #C62828; font-size: 14px; margin-block-start: 6px; font-weight: 500;';
  
      input.parentElement.appendChild(error);
    },
  
    clearError(input) {
      input.classList.remove('error');
      input.style.borderColor = '';
      const error = input.parentElement.querySelector('.error-message');
      if (error) error.remove();
    },
  
    setupPriceCalculator() {
      const sizeSelect = this.form.querySelector('#pizza-size');
      const flavourSelect = this.form.querySelector('#pizza-flavour');
  
      if (!sizeSelect || !flavourSelect) return;
  
      const priceDisplay = document.createElement('div');
      priceDisplay.className = 'price-calculator';
      Object.assign(priceDisplay.style, {
        position: 'fixed',
        insetBlockEnd: '100px',
        insetInlineEnd: '30px',
        background: '#FFFFFF',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: '998',
        minInlineSize: '220px',
        border: '2px solid #F0F0F0'
      });
  
      priceDisplay.innerHTML = `
        <div style="font-weight: bold; margin-block-end: 12px; color: #263238; font-size: 16px; border-block-end: 2px solid #F0F0F0; padding-block-end: 8px;">Order Summary</div>
        <div style="display: flex; justify-content: space-between; margin-block-end: 6px; color: #555;">
          <span>Size:</span>
          <span id="selected-size" style="font-weight: 600; color: #263238;">-</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-block-end: 12px; color: #555;">
          <span>Pizza:</span>
          <span id="selected-pizza" style="font-weight: 600; color: #263238;">-</span>
        </div>
        <div style="border-block-start: 2px solid #F0F0F0; padding-block-start: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
          <span style="color: #263238;">Total:</span>
          <span id="total-price" style="color: #C62828;">R0.00</span>
        </div>
      `;
  
      document.body.appendChild(priceDisplay);
  
      const updatePrice = () => {
        const size = sizeSelect.value;
        const pizzaOption = flavourSelect.options[flavourSelect.selectedIndex];
  
        document.getElementById('selected-size').textContent = size ? size.charAt(0).toUpperCase() + size.slice(1) : '-';
        document.getElementById('selected-pizza').textContent = pizzaOption?.text || '-';
  
        if (size && pizzaData.prices[size]) {
          document.getElementById('total-price').textContent = utils.formatCurrency(pizzaData.prices[size]);
        } else {
          document.getElementById('total-price').textContent = 'R0.00';
        }
      };
  
      sizeSelect.addEventListener('change', updatePrice);
      flavourSelect.addEventListener('change', updatePrice);
    },
  
    setupFormSubmit() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
  
        let isValid = true;
        const errors = [];
  
        this.form.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) {
            this.showError(field, 'This field is required');
            errors.push(field.name);
            isValid = false;
          }
        });
  
        const email = this.form.querySelector('[name="email"]');
        if (email && email.value && !utils.validateEmail(email.value)) {
          this.showError(email, 'Invalid email address');
          isValid = false;
        }
  
        const phone = this.form.querySelector('[name="contactNumber"]');
        if (phone && phone.value && !utils.validatePhone(phone.value)) {
          this.showError(phone, 'Invalid phone number');
          isValid = false;
        }
  
        const card = this.form.querySelector('[name="cardNumber"]');
        if (card && card.value && !utils.validateCard(card.value)) {
          this.showError(card, 'Invalid card number');
          isValid = false;
        }
  
        if (isValid) {
          this.submitOrder();
        } else {
          utils.showNotification('Please correct the errors in the form', 'error');
          errors[0] && this.form.querySelector(`[name="${errors[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
  
    submitOrder() {
      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => data[key] = value);
  
      const modal = document.createElement('div');
      Object.assign(modal.style, {
        position: 'fixed',
        insetBlockStart: '0',
        insetInlineStart: '0',
        inlineSize: '100%',
        blockSize: '100%',
        background: 'rgba(0,0,0,0.6)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
  
      const size = data.pizzaSize ? data.pizzaSize.charAt(0).toUpperCase() + data.pizzaSize.slice(1) : '';
      const price = pizzaData.prices[data.pizzaSize] || 0;
  
      modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 12px; max-inline-size: 500px; inline-size: 90%; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
          <div style="inline-size: 80px; block-size: 80px; background: linear-gradient(135deg, #558B2F, #689F38); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 40px; color: white;">✓</div>
          <h2 style="color: #263238; margin-block-end: 16px; font-family: 'Playfair Display', serif;">Order Confirmed!</h2>
          <p style="color: #555; margin-block-end: 12px; font-size: 16px;">Thank you, <strong>${data.firstName} ${data.lastName}</strong>!</p>
          <div style="background: #F9F9F9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #F0F0F0;">
            <p style="color: #555; margin-block-end: 8px;"><strong>Your order:</strong></p>
            <p style="color: #C62828; font-weight: bold; font-size: 18px; margin-block-end: 4px;">${size} ${data.pizzaFlavour}</p>
            <p style="color: #555; margin-block-end: 8px;">Total: <strong>${utils.formatCurrency(price)}</strong></p>
            <p style="color: #555; font-size: 14px;">Delivery time: <strong>${data.deliveryTime.replace('-', ' ')}</strong></p>
          </div>
          <p style="color: #666; font-size: 14px; margin-block-end: 24px;">A confirmation email has been sent to <strong>${data.email}</strong></p>
          <button onclick="window.location.href='index.html'" style="padding: 14px 32px; background: linear-gradient(135deg, #C62828, #B71C1C); color: #FFF8E1; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; font-family: 'Open Sans', sans-serif;">
            Back to Home
          </button>
        </div>
      `;
  
      document.body.appendChild(modal);
      this.sendConfirmationEmail(data);
    },
  
    sendConfirmationEmail(data) {
      const size = data.pizzaSize ? data.pizzaSize.charAt(0).toUpperCase() + data.pizzaSize.slice(1) : '';
      const price = pizzaData.prices[data.pizzaSize] || 0;
      
      const subject = encodeURIComponent('Pizza Order Confirmation - Campanella Pizza');
      const body = encodeURIComponent(`
  Order Confirmation
  
  Thank you for your order!
  
  Customer Details:
  Name: ${data.firstName} ${data.lastName}
  Email: ${data.email}
  Phone: ${data.contactNumber}
  Address: ${data.address}
  
  Order Details:
  Pizza: ${size} ${data.pizzaFlavour}
  Price: ${utils.formatCurrency(price)}
  Delivery Time: ${data.deliveryTime.replace('-', ' ')}
  
  ${data.toppings ? 'Additional Toppings: ' + data.toppings : ''}
  ${data.additionalNotes ? 'Special Instructions: ' + data.additionalNotes : ''}
  
  We'll have your delicious pizza ready soon!
  
  Campanella Pizza
  19 Loch Street, Meyerton
  016 362 2502
      `.trim());
  
      setTimeout(() => {
        window.location.href = `mailto:campanellapizzameyerton@outlook.co.za?subject=${subject}&body=${body}`;
      }, 1000);
    }
  };
  
/* contact form with email integration */
  
  const contactForm = {
    form: null,
  
    init() {
      this.form = document.querySelector('.contact-form form');
      if (!this.form) return;
  
      this.setupValidation();
      this.setupSubmit();
    },
  
    setupValidation() {
      const emailInput = this.form.querySelector('#email');
      if (emailInput) {
        emailInput.addEventListener('blur', () => {
          if (emailInput.value && !utils.validateEmail(emailInput.value)) {
            this.showError(emailInput, 'Please enter a valid email address');
          } else {
            this.clearError(emailInput);
          }
        });
        emailInput.addEventListener('input', () => {
          if (emailInput.classList.contains('error')) this.clearError(emailInput);
        });
      }

      const phoneInput = this.form.querySelector('#phone');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
        });
        phoneInput.addEventListener('blur', () => {
          if (phoneInput.value && !utils.validatePhone(phoneInput.value)) {
            this.showError(phoneInput, 'Please enter a valid South African phone number (e.g., 082 123 4567)');
          } else {
            this.clearError(phoneInput);
          }
        });
      }
    },
  
    showError(input, message) {
      input.classList.add('error');
      input.style.borderColor = '#C62828';
  
      const existing = input.parentElement.querySelector('.error-message');
      if (existing) existing.remove();
  
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      error.style.cssText = 'color: #C62828; font-size: 14px; margin-block-start: 6px; font-weight: 500;';
  
      input.parentElement.appendChild(error);
    },
  
    clearError(input) {
      input.classList.remove('error');
      input.style.borderColor = '';
      const error = input.parentElement.querySelector('.error-message');
      if (error) error.remove();
    },
  
    setupSubmit() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        this.form.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) {
            this.showError(field, 'This field is required');
            isValid = false;
          }
        });

        const email = this.form.querySelector('#email');
        if (email && email.value && !utils.validateEmail(email.value)) {
          this.showError(email, 'Invalid email address');
          isValid = false;
        }
        const phone = this.form.querySelector('#phone');
        if (phone && phone.value && !utils.validatePhone(phone.value)) {
          this.showError(phone, 'Invalid phone number');
          isValid = false;
        }

        if (!isValid) {
          utils.showNotification('Please fill in all required fields correctly', 'error');
          return;
        }

        // Simulate AJAX submission
        const formData = new FormData(this.form);
        const data = {};
        formData.forEach((v, k) => data[k] = v);

        const subject = `[Contact] ${data.subject || 'General'} - ${data.name}`;
        const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`;

        // Show confirmation modal
        const modal = document.createElement('div');
        Object.assign(modal.style, {
          position: 'fixed', insetBlockStart: '0', insetInlineStart: '0', inlineSize: '100%', blockSize: '100%', background: 'rgba(0,0,0,0.6)', zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        modal.innerHTML = `
          <div style="background:#fff; padding:28px; border-radius:12px; max-inline-size:520px; inline-size:90%; box-shadow:0 10px 40px rgba(0,0,0,.3);">
            <h2 style="margin:0 0 10px 0; color:#263238; font-family:'Playfair Display', serif;">Message Sent</h2>
            <p style="color:#555;">Thanks, <strong>${data.name}</strong>. We have received your message.</p>
            <pre style="white-space:pre-wrap; background:#F9F9F9; padding:12px; border-radius:8px; border:1px solid #F0F0F0; color:#333;">${body}</pre>
            <div style="text-align: right; margin-top: 12px;">
              <button class="close-confirm" style="padding:10px 16px; background:linear-gradient(135deg,#C62828,#B71C1C); color:#FFF8E1; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Close</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', (ev) => { if (ev.target === modal || ev.target.classList.contains('close-confirm')) modal.remove(); });

        // Reset after simulated async delay
        setTimeout(() => {
          this.form.reset();
          utils.showNotification('Your message has been sent!', 'success');
        }, 500);
      });
    },
  
    sendEmail() {
      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => data[key] = value);
  
      const subject = encodeURIComponent(`Contact Form: ${data.subject}`);
      const body = encodeURIComponent(`
  Name: ${data.name}
  Email: ${data.email}
  Subject: ${data.subject}
  
  Message:
  ${data.message}
      `.trim());
  
      window.location.href = `mailto:campanellapizzameyerton@outlook.co.za?subject=${subject}&body=${body}`;
  
      utils.showNotification('Opening your email client...', 'success');
      setTimeout(() => this.form.reset(), 1000);
    }
  };
  
/* image gallery & lightbox */
  
  const gallery = {
    init() {
		  const isPromotionsPage = window.location.pathname.includes('promotions.html');
          const selector = isPromotionsPage
            ? '.owners-section img, .chefs-section img, .general-staff-section img, .pizza-hero-image img'
            : '.pizza-item img, .owners-section img, .chefs-section img, .general-staff-section img, .pizza-hero-image img';

		  const imgs = Array.from(document.querySelectorAll(selector));
		  imgs.forEach((img, idx) => {
        img.style.cursor = 'pointer';
        img.style.transition = 'transform 0.3s ease';
  
        img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
        img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
        img.addEventListener('click', () => this.openLightbox(imgs, idx));
      });
    },
  
    openLightbox(imgs, startIndex) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      
      Object.assign(lightbox.style, {
        position: 'fixed',
        insetBlockStart: '0',
        insetInlineStart: '0',
        inlineSize: '100%',
        blockSize: '100%',
        background: 'rgba(0,0,0,0.95)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        animation: 'fadeIn 0.3s ease'
      });
  
      lightbox.innerHTML = `
        <div style="position: relative; max-inline-size: 90%; max-block-size: 90vh; display:flex; align-items:center; gap:12px;">
          <button class="prev" aria-label="Previous" style="background:rgba(255,255,255,.9); border:none; inline-size:40px; block-size:40px; border-radius:50%; cursor:pointer; font-size:20px;">‹</button>
          <img class="lb-img" src="" alt="" style="max-inline-size: 100%; max-block-size: 90vh; border-radius: 8px; box-shadow: 0 10px 50px rgba(0,0,0,0.5);">
          <button class="next" aria-label="Next" style="background:rgba(255,255,255,.9); border:none; inline-size:40px; block-size:40px; border-radius:50%; cursor:pointer; font-size:20px;">›</button>
          <button class="close-lightbox" style="position: absolute; inset-block-start: -50px; inset-inline-end: -50px; background: white; border: none; inline-size: 44px; block-size: 44px; border-radius: 50%; cursor: pointer; font-size: 24px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.3); color: #263238;">&times;</button>
        </div>
      `;
  
      document.body.appendChild(lightbox);
  
      const imgEl = lightbox.querySelector('.lb-img');
      let current = startIndex;
      const update = () => {
        const node = imgs[current];
        imgEl.src = node.src;
        imgEl.alt = node.alt || '';
      };
      update();

      lightbox.querySelector('.close-lightbox').addEventListener('click', (e) => {
        e.stopPropagation();
        lightbox.remove();
      });
  
      lightbox.addEventListener('click', () => lightbox.remove());
      lightbox.querySelector('.prev').addEventListener('click', (e) => { e.stopPropagation(); current = (current - 1 + imgs.length) % imgs.length; update(); });
      lightbox.querySelector('.next').addEventListener('click', (e) => { e.stopPropagation(); current = (current + 1) % imgs.length; update(); });
      document.addEventListener('keydown', function onKey(e) {
        if (!document.body.contains(lightbox)) { document.removeEventListener('keydown', onKey); return; }
        if (e.key === 'Escape') lightbox.remove();
        if (e.key === 'ArrowLeft') { current = (current - 1 + imgs.length) % imgs.length; update(); }
        if (e.key === 'ArrowRight') { current = (current + 1) % imgs.length; update(); }
      });
      // basic swipe
      let sx = 0; imgEl.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
      imgEl.addEventListener('touchend', e => { const dx = (e.changedTouches[0].clientX - sx); if (Math.abs(dx) > 40) { current = dx > 0 ? (current - 1 + imgs.length) % imgs.length : (current + 1) % imgs.length; update(); } });
    }
  };
  
/* about page history toggle */
  
  function toggleHistory() {
    const content = document.getElementById('historyContent');
    const btn = document.querySelector('.expand-btn');
    const extraContent = content?.querySelector('.history-extra');
  
    if (!content || !btn || !extraContent) return;
  
    const isExpanded = content.classList.toggle('expanded');
    
    if (isExpanded) {
      extraContent.style.display = 'block';
      btn.textContent = 'Read Less';
    } else {
      extraContent.style.display = 'none';
      btn.textContent = 'Read More';
    }
  }
  
  window.toggleHistory = toggleHistory;
  
/* interactive map enhancement */
  
  const interactiveMap = {
    init() {
      const mapEl = document.getElementById('leaflet-map');
      if (!mapEl) return;
      // Initialise Leaflet map if library is available, otherwise skip silently
      if (window.L) {
        const coords = [-26.4793, 27.9041];
        const map = L.map(mapEl).setView(coords, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.marker(coords).addTo(map).bindPopup('Campanella Pizza<br>19 Loch Street, Meyerton').openPopup();
      }
    }
  };

/* SEO enhancements: keywords + canonical + social footer */

  const seoEnhancements = {
    init() {
      this.injectKeywords();
      this.ensureCanonical();
      this.addSocialLinks();
      this.enableLazyLoading();
    },
    injectKeywords() {
      const existing = document.querySelector('meta[name="keywords"]');
      if (existing) return;
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'pizza, wood-fired pizza, Meyerton, Italian, delivery, takeaway, family pizza, specials, catering';
      document.head.appendChild(meta);
    },
    ensureCanonical() {
      const hasCanonical = document.querySelector('link[rel="canonical"]');
      if (hasCanonical) return;
      const link = document.createElement('link');
      link.rel = 'canonical';
      const page = window.location.pathname.split('/').pop() || 'index.html';
      link.href = `https://euphraxiia.github.io/ST10433587_WEDE5020w_POE/${page}`;
      document.head.appendChild(link);
    },
    addSocialLinks() {
      const footer = document.querySelector('.site-footer .footer-bottom');
      if (!footer || footer.querySelector('.social-links')) return;
      const wrap = document.createElement('div');
      wrap.className = 'social-links';
      wrap.style.cssText = 'margin-top: 10px; display: flex; gap: 12px; justify-content: center; align-items: center;';
      wrap.innerHTML = `
        <a href=\"https://www.facebook.com/campanellapizza/\" target=\"_blank\" rel=\"noopener\" aria-label=\"Facebook\" title=\"Facebook\" style=\"display:inline-flex;align-items:center;\">
          <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.88v-6.987H8.078v-2.893h2.36V9.797c0-2.332 1.393-3.62 3.527-3.62.102 0 .204.003.306.007h1.98v2.36h-1.25c-1.31 0-1.566.623-1.566 1.538v2.017h2.812l-.366 2.893h-2.446V21.88C18.343 21.128 22 16.99 22 12z\" fill=\"#FFFFFF\"/>
          </svg>
        </a>
        <a href="https://www.instagram.com/campanella_pizza_meyerton/" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram" style="display:inline-flex;align-items:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="12" cy="12" r="4.5" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="#FFFFFF"/>
          </svg>
        </a>
      `;
      footer.appendChild(wrap);
    },
    enableLazyLoading() {
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      });
    }
  };
  
  
/* scroll animations */
  
  const scrollAnimations = {
    init() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);
  
      document.querySelectorAll('section, .pizza-item, .promo-banner').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    }
  };
  
/* css animations */
  
  const animations = document.createElement('style');
  animations.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(animations);

/* initialise everything */
  
  document.addEventListener('DOMContentLoaded', () => {
    const historyExtra = document.querySelector('.history-extra');
    if (historyExtra) historyExtra.style.display = 'none';
  
    // ensure a single shared cart across pages
    if (!window.shoppingCart) {
      window.shoppingCart = new ShoppingCart();
    } else {
      // refresh badge on page load
      window.shoppingCart.updateCartDisplay();
    }

    navigation.init();
    menuPage.init();
    promotionsPage.init();
    orderForm.init();
    checkoutSummary.init();
    contactForm.init();
    gallery.init();
    interactiveMap.init();
    scrollAnimations.init();
    seoEnhancements.init();
  
    console.log('Campanella Pizza website initialized');
  });        