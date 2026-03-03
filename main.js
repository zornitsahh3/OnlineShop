let currentIndex = 0;
const itemsPerPage = 20;
let currentCategory = "bags";
let activeFilteredProducts = null;

const categoryInfo = {
    bags: {
        title: "Bags",
        description: "Explore our collection of stylish and functional bags."
    },
    shoes: {
        title: "Shoes",
        description: "Discover our range of fashionable and comfortable shoes."
    }
};

const priceRanges = {
    low:    { min: 0, max: 50 },
    medium: { min: 50, max: 100 },
    high:   { min: 100, max: Infinity }
};

function addToCart() {
    alert("Product added to cart!");
}

function showCategory(category) {
    currentCategory = category;
    currentIndex = 0;
    activeFilteredProducts = null;

    document.querySelectorAll("input[type='checkbox']")
        .forEach(cb => cb.checked = false);

    const info = categoryInfo[category] || {};
    document.getElementById("category-title").textContent = info.title || "";
    document.getElementById("category-description").textContent = info.description || "";

    renderProducts();
}

function getStars(rating) {
    const full = Math.floor(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    const productCount = document.getElementById("product-count");
    const loadMoreBtn = document.getElementById("load-more");

    const baseProducts = activeFilteredProducts ??
        products.filter(p => p.category === currentCategory);

    let sortedProducts=[...baseProducts];

    const sortValue=document.getElementById("sort-select")?.value;

    if (sortValue === "az") {
        sortedProducts.sort((a,b) => a.name.localeCompare(b.name));
    }

    if (sortValue === "za") {
        sortedProducts.sort((a,b) => b.name.localeCompare(a.name));
    }

    if (sortValue === "priceLow") {
    sortedProducts.sort((a, b) =>
        (a.price - a.discount) - (b.price - b.discount)
    );
    }

    if (sortValue === "priceHigh") {
        sortedProducts.sort((a, b) =>
            (b.price - b.discount) - (a.price - a.discount)
        );
    }

    const visible = sortedProducts.slice(0, currentIndex + itemsPerPage);

    productList.innerHTML = visible.map(product => {
        const finalPrice = product.price - product.discount;
        const priceHTML = product.discount > 0
            ? `$${finalPrice} <s>$${product.price}</s>`
            : `$${product.price}`;

        return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Color: ${product.color}</p>
            ${product.discount > 0 ? `<span class="discount-badge">Save $${product.discount}</span>` : ""}
            <p class="price">${priceHTML}</p>
            <div class="stars">${getStars(product.rating)}</div>
            <button onclick="addToCart()">Add to Cart</button>
        </div>
        `;
    }).join("");

    productCount.textContent =
        `${visible.length} out of ${baseProducts.length} products displayed.`;

    loadMoreBtn.style.display =
        visible.length >= baseProducts.length ? "none" : "block";
}

function loadMore() {
    currentIndex += itemsPerPage;
    renderProducts();
}

document.addEventListener("DOMContentLoaded", () => {
    showCategory("bags");
});

document.getElementById("sort-select")
    .addEventListener("change", renderProducts);

function applyFilters() {

    const selectedColors = [...document.querySelectorAll('.filter-color:checked')]
        .map(cb => cb.value);

    const selectedPrices = [...document.querySelectorAll('.filter-price:checked')]
        .map(cb => cb.value);

    const discountOnly =
        document.getElementById("discount-only").checked;

    let filtered = products.filter(
        p => p.category === currentCategory
    );

    // Filter by color
    if (selectedColors.length) {
        filtered = filtered.filter(p =>
            selectedColors.includes(p.color)
        );
    }

    // Filter by price range
    if (selectedPrices.length) {
        filtered = filtered.filter(product => {
            const finalPrice = product.price - product.discount;

            return selectedPrices.some(level => {
                const range = priceRanges[level];
                return finalPrice >= range.min && finalPrice < range.max;
            });
        });
    }

    // Filter by discount
    if (discountOnly) {
        filtered = filtered.filter(p => p.discount > 0);
    }

    activeFilteredProducts = filtered;
    currentIndex = 0;

    renderProducts();
}