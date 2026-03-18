// Sanwariya Vastraly Website JavaScript

// Store custom products in localStorage
let customProducts = JSON.parse(localStorage.getItem('sanwariyaProducts')) || [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Initialize all functionality
    initMobileMenu();
    initNavbarScroll();
    initProductFilters();
    initCart();
    initSmoothScroll();
    initAnimations();
    initProductManager();
    renderCustomProducts();
});

// Product Manager Functions
function initProductManager() {
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductForm = document.getElementById('addProductForm');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
}

function openAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('hidden');
    // Reset form
    document.getElementById('addProductForm').reset();
    clearImagePreview();
}

let currentImageData = null;

function previewImage(input, type) {
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (type === 'file' && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            previewImg.src = e.target.result;
            previewDiv.classList.remove('hidden');
            lucide.createIcons();
        };
        reader.readAsDataURL(input.files[0]);
    } else if (type === 'url' && input.value) {
        currentImageData = input.value;
        previewImg.src = input.value;
        previewDiv.classList.remove('hidden');
        // Clear file input if URL is entered
        document.getElementById('productImageFile').value = '';
    }
}

function clearImagePreview() {
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const fileInput = document.getElementById('productImageFile');
    const urlInput = document.getElementById('productImageUrl');
    
    previewDiv.classList.add('hidden');
    previewImg.src = '';
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    currentImageData = null;
    lucide.createIcons();
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    const isNew = document.getElementById('productNew').checked;
    
    // Use placeholder if no image provided
    const image = currentImageData || `http://static.photos/fashion/640x360/${Math.floor(Math.random() * 100)}`;
    
    const product = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        image: image,
        description: description || category.charAt(0).toUpperCase() + category.slice(1) + '\'s Collection',
        isNew: isNew,
        isCustom: true
    };
    
    // Add to custom products array
    customProducts.push(product);
    
    // Save to localStorage
    localStorage.setItem('sanwariyaProducts', JSON.stringify(customProducts));
    
    // Add to grid
    addProductToGrid(product);
    
    // Show success message
    showToast('Product added successfully!');
    
    // Close modal
    closeAddProductModal();
    
    // Refresh filters
    initProductFilters();
}

function addProductToGrid(product) {
    const grid = document.getElementById('productsGrid');
    
    // Hide empty state when adding first product
    hideEmptyState();
    
    const productHTML = `
        <div class="product-card group" data-category="${product.category}" data-id="${product.id}">
            <div class="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] mb-4">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                    <button class="p-3 bg-white rounded-full hover:bg-amber-600 hover:text-white transition-colors add-to-cart" data-name="${product.name}" data-price="${product.price}">
                        <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                    </button>
                    <button class="p-3 bg-white rounded-full hover:bg-amber-600 hover:text-white transition-colors" onclick="deleteProduct(${product.id})">
                        <i data-lucide="trash-2" class="w-5 h-5 text-red-500"></i>
                    </button>
                </div>
                ${product.isNew ? '<span class="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">New</span>' : ''}
                ${product.isCustom ? '<span class="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Custom</span>' : ''}
            </div>
            <h3 class="font-semibold text-lg text-gray-900 mb-1">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${product.description}</p>
            <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-amber-600">${product.price}</span>
                <div class="flex text-yellow-400 text-sm">
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the last product (before the default products)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = productHTML;
    const newProduct = tempDiv.firstElementChild;
    
    // Insert at the beginning of the grid
    grid.insertBefore(newProduct, grid.firstChild);
    
    // Initialize icons and cart functionality for new product
    lucide.createIcons();
    
    // Add event listener to the new add-to-cart button
    const addToCartBtn = newProduct.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(name, price);
        });
    }
}

function renderCustomProducts() {
    // Render all custom products from localStorage on page load
    if (customProducts.length > 0) {
        hideEmptyState();
        customProducts.forEach(product => {
            addProductToGrid(product);
        });
    } else {
        showEmptyState();
    }
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.remove('hidden');
        emptyState.style.display = 'block';
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.add('hidden');
        emptyState.style.display = 'none';
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Remove from array
        customProducts = customProducts.filter(p => p.id !== productId);
        // Update localStorage
        localStorage.setItem('sanwariyaProducts', JSON.stringify(customProducts));
        // Remove from DOM
        const productElement = document.querySelector(`[data-id="${productId}"]`);
        if (productElement) {
            productElement.remove();
        }
        // Show empty state if no products left
        if (customProducts.length === 0) {
            showEmptyState();
        }
        showToast('Product deleted successfully!');
    }
}

// Close modal on escape key for add product modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAddProductModal();
    }
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
            const icon = menuBtn.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
        
        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                const icon = menuBtn.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Product Filtering
function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            products.forEach(product => {
                if (filter === 'all' || product.getAttribute('data-category') === filter) {
                    product.style.display = 'block';
                    product.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// Shopping Cart Functionality
let cart = [];
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartModal = document.getElementById('cartModal');
const cartSidebar = document.getElementById('cartSidebar');

function initCart() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(name, price);
        });
    });
    
    // Cart button in navbar
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showToast(`${name} added to cart!`);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${item.name}</h4>
                    <p class="text-amber-600 font-bold">$${item.price}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="updateQuantity('${item.name}', -1)" class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700">
                        <i data-lucide="minus" class="w-4 h-4"></i>
                    </button>
                    <span class="font-semibold w-8 text-center">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)" class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button onclick="removeFromCart('${item.name}')" class="ml-4 text-red-500 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    cartModal.classList.remove('hidden');
    setTimeout(() => {
        cartSidebar.classList.add('open');
    }, 10);
}

function closeCart() {
    cartSidebar.classList.remove('open');
    setTimeout(() => {
        cartModal.classList.add('hidden');
    }, 300);
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for Animations
function initAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCart();
    }
});
