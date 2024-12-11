

// Initialize prices object from localStorage or use defaults
const defaultPrices = {
    "Kulhar": 1.75,
    "Water Bottle": 10,
};
const prices = JSON.parse(localStorage.getItem('prices')) || defaultPrices;

// Save prices to localStorage
function savePricesToLocalStorage() {
    localStorage.setItem('prices', JSON.stringify(prices));
}

// Refresh the product dropdown options
function refreshProductDropdowns() {
    const productOptions = Object.entries(prices)
        .map(([name, price]) => `<option value="${name}">${name} - ₹${price.toFixed(2)}</option>`)
        .join('');
    document.querySelectorAll('.product').forEach(select => {
        const currentValue = select.value; // Preserve selected value
        select.innerHTML = `
            <option value="" disabled selected>Choose a product</option>
            ${productOptions}
        `;
        select.value = currentValue; // Reapply selected value
    });
}

// Refresh product list
function refreshProductList(searchTerm = "") {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    const filteredProducts = Object.entries(prices).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredProducts.length === 0) {
        productList.innerHTML = "<li>No matching products found.</li>";
        return;
    }

    filteredProducts.forEach(([name, price]) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${name} - ₹${price.toFixed(2)}
            <button class="editProductBtn" data-name="${name}">Edit</button>
            <button class="deleteProductBtn" data-name="${name}">Delete</button>
        `;
        productList.appendChild(listItem);
    });
}


// Add a new product to the prices object
document.getElementById('addProductToListBtn').addEventListener('click', () => {
    const productName = document.getElementById('newProductName').value.trim();
    const productPrice = parseFloat(document.getElementById('newProductPrice').value);

    if (!productName || isNaN(productPrice) || productPrice <= 0) {
        alert('Please enter a valid product name and price.');
        return;
    }

    // Add or update the product
    prices[productName] = productPrice;

    // Save changes and refresh UI
    savePricesToLocalStorage();
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    refreshProductList();
    refreshProductDropdowns();
});

// Search Product
document.getElementById('searchProductInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    refreshProductList(searchTerm);
});


// Handle edit and delete actions for products
document.getElementById('productList').addEventListener('click', (event) => {
    const target = event.target;
    const productName = target.dataset.name;

    if (target.classList.contains('editProductBtn')) {
        // Handle edit
        const newPrice = prompt(`Enter new price for ${productName}:`, prices[productName]);
        if (newPrice !== null) {
            const parsedPrice = parseFloat(newPrice);
            if (!isNaN(parsedPrice) && parsedPrice > 0) {
                prices[productName] = parsedPrice;
                savePricesToLocalStorage();
                refreshProductList();
                refreshProductDropdowns();
            } else {
                alert('Invalid price.');
            }
        }
    } else if (target.classList.contains('deleteProductBtn')) {
        // Handle delete
        if (confirm(`Are you sure you want to delete ${productName}?`)) {
            delete prices[productName];
            savePricesToLocalStorage();
            refreshProductList();
            refreshProductDropdowns();
        }
    }
});

// Refresh the product dropdown options without resetting selected values
function refreshProductDropdowns() {
    document.querySelectorAll('.product').forEach(select => {
        const currentValue = select.value; // Preserve selected value

        const productOptions = Object.entries(prices)
            .map(([name, price]) => `
                <option value="${name}" ${currentValue === name ? 'selected' : ''}>
                    ${name} - ₹${price.toFixed(2)}
                </option>
            `).join('');

        select.innerHTML = `
            <option value="" disabled ${currentValue ? '' : 'selected'}>Choose a product</option>
            ${productOptions}
        `;
    });
}


// Initialize Select2 for existing dropdowns
$(document).ready(() => {
    $('.searchable-dropdown').select2({
        placeholder: 'Search and select a product',
        allowClear: true,
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Add product row function
    function addProductRow() {
        const productRows = document.getElementById('productRows');
        
        // Ensure the element exists
        if (!productRows) {
            // console.error("Element with ID 'productRows' not found.");
            return;
        }

        const productRow = document.createElement('div');
        productRow.classList.add('productRow');
        productRow.innerHTML = `
            <label>Select Product:</label>
            <select class="product searchable-dropdown" required></select>

            <label>Enter Quantity:</label>
            <input type="number" class="quantity" min="1" placeholder="Enter quantity" required>

            <label>Discount (%)</label>
            <input type="number" class="item-discount" min="0" max="100" value="0">
        `;
        productRow.appendChild(productRow);
        refreshProductDropdowns();
    }

    // Example Button Event Listener
    document.getElementById('addProductBtn').addEventListener('click', addProductRow);
});


// Refresh products and product dropdowns on changes
refreshProductList();
refreshProductDropdowns();
  

// Generate Bill Button Logic
document.getElementById('generateBillBtn').addEventListener('click', () => {
    const customerName = document.getElementById('customerName')?.value?.trim() || 'Customer';
    const discountInput = document.getElementById('discount');
    const billOutput = document.getElementById('billOutput');
    const shareOptions = document.getElementById('shareOptions');

    // Validate and calculate products
    const productRows = document.querySelectorAll('.productRow');
    let subtotal = 0;
    let products = [];

    productRows.forEach(row => {
        const product = row.querySelector('.product').value;
        const quantity = parseInt(row.querySelector('.quantity').value, 10);
        const discount = parseFloat(row.querySelector('.item-discount').value) || 0;

        if (!product || isNaN(quantity) || quantity <= 0 || discount < 0 || discount > 100) {
            alert('Please fill out product details correctly.');
            return;
        }

        const price = prices[product];
        const discountedPrice = price - (price * (discount / 100));
        const amount = discountedPrice * quantity;
        subtotal += amount;
        products.push({ product, quantity, price, discount, amount });
    });

    // Apply discount
    const discount = parseFloat(discountInput.value) || 0;
    if (discount < 0 || discount > subtotal) {
        // alert('Invalid discount amount.');
        return;
    }

    const total = subtotal - discount;
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Render bill output
    billOutput.innerHTML = `
        <div class="bill">
            <div class="bill-header">
                <div class="bill-header-left">
                    <h3>Shivam Crackers</h3>
                    <p>Mobile: +918210012972</p>
                </div>
                <div class="bill-header-right">
                    <p>Invoice Date: ${date}</p>
                    <p>Time: ${time}</p>
                </div>
            </div>
            <p><strong>Bill To:</strong> ${customerName}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Discount</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.product}</td>
                            <td>${p.quantity}</td>
                            <td>₹${p.price.toFixed(2)}</td>
                            <td>${p.discount}%</td>
                            <td>₹${p.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="sub-total">
                <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
                <p><strong>Tax (0%):</strong> ₹0.00</p>
                <p><strong>Total Discount:</strong> ₹${discount.toFixed(2)}</p>
            </div>
            <div class="total">
                <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            </div>
            <hr>
            <div class="bill-footer">
                <p><strong>Terms and Conditions:</strong></p>
                <ol>
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>All disputes are subject to Madhubani jurisdiction only.</li>
                </ol>
            </div>
        </div>
    `;

    shareOptions.style.display = 'block';

    
});

// Share Bill Button Logic (Share as Image)
document.getElementById('shareBillBtn').addEventListener('click', async () => {
    const billOutput = document.getElementById('billOutput');

    if (!billOutput.innerHTML.trim()) {
        alert('No bill found. Please generate the bill first.');
        return;
    }

    try {
        // Convert the bill to an image using html2canvas
        const canvas = await html2canvas(billOutput);
        const image = canvas.toDataURL('image/png'); // Get image as base64

        // Convert the base64 image to Blob
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'Bill.png', { type: 'image/png' });

        // Use the navigator.share API for sharing
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Shivam Crackers Invoice',
                text: 'Here is your bill:',
                files: [file],
            });
        } else {
            // Fallback: Download the image if sharing is not supported
            const link = document.createElement('a');
            link.href = image;
            link.download = 'Bill.png';
            link.click();
        }
    } catch (error) {
        console.error('Error generating or sharing image:', error);
        alert('Failed to share the bill image. Please try again.');
    }
});

document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const billOutput = document.getElementById('billOutput');

    if (!billOutput.innerHTML.trim()) {
        alert('No bill found. Please generate the bill first.');
        return;
    }

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4', // Use A4 page size
        });

        await pdf.html(billOutput, {
            callback: (doc) => {
                doc.save(`Bill_${new Date().toISOString().slice(0, 10)}.pdf`);
            },
            x: 35,
            y: 10,
            margin: [10, 10, 10, 10], // Margins: top, right, bottom, left
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate the PDF. Please try again.');
    }
});

// ---------------------------------------------------

let cart = []; // Store added products

// Update Cart Counter
function updateCartCounter() {
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = cart.length;
    cartCounter.style.display = cart.length > 0 ? 'block' : 'none';
}

// Add Product to Cart
function addProductToCart() {
    const productSelect = document.querySelector('.product');
    const quantityInput = document.querySelector('.quantity');
    const discountInput = document.querySelector('.item-discount');

    const productName = productSelect.value;
    const price = prices[productName] || 0;
    const quantity = parseInt(quantityInput.value, 10);
    const discount = parseFloat(discountInput.value) || 0;

    if (!productName || isNaN(quantity) || quantity <= 0 || discount < 0 || discount > 100) {
        alert('Please fill out all product details correctly.');
        return;
    }

    // Add Product to Cart Array
    cart.push({
        name: productName,
        price: price,
        quantity: quantity,
        discount: discount
    });

    updateCartCounter();
    updateCart(); // Update Cart UI

    // Reset Form Fields
    productSelect.value = '';
    quantityInput.value = '';
    discountInput.value = '0';

    // alert(`${productName} added to cart!`);
}

// Update Cart Details in Modal
function updateCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<li>No products in the cart.</li>';
    } else {
        cart.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${item.name} - Qty: ${item.quantity}, Discount: ${item.discount}% 
                <button class="removeProductBtn" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(listItem);
        });
    }
}

// Show Cart Modal
document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartModal').style.display = 'block';
    updateCart(); // Refresh Cart Details
});

// Close Cart Modal
document.getElementById('closeCartModal').addEventListener('click', () => {
    document.getElementById('cartModal').style.display = 'none';
});

// Remove Product from Cart
document.getElementById('cartList').addEventListener('click', (e) => {
    if (e.target.classList.contains('removeProductBtn')) {
        const index = parseInt(e.target.dataset.index, 10);
        cart.splice(index, 1); // Remove Product from Cart
        updateCart();  // Update Cart UI
        updateCartCounter(); // Update Counter
    }
});

// Generate Bill
document.getElementById('generateBillBtn').addEventListener('click', () => {
    const customerName = document.getElementById('customerName').value.trim();
    const discountInput = parseFloat(document.getElementById('discount').value) || 0;
    const billOutput = document.getElementById('billOutput');
    const shareOptions = document.getElementById('shareOptions');

    if (cart.length === 0) {
        alert('No products in the cart. Please add products first.');
        return;
    }

    let subtotal = 0;
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Build Bill Table Rows
    const billRows = cart.map((product) => {
        const amount = (product.price * product.quantity * (1 - product.discount / 100)).toFixed(2);
        subtotal += parseFloat(amount);

        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.discount}%</td>
                <td>₹${amount}</td>
            </tr>
        `;
    }).join('');

    const total = subtotal - discountInput;

    // Render Bill
    billOutput.innerHTML = `
        <div class="bill">
            <div class="bill-header">
                <div class="bill-header-left">
                    <h3>Shivam Crackers</h3>
                    <p>Mobile: +918210012972</p>
                </div>
                <div class="bill-header-right">
                    <p>Invoice Date: ${date}</p>
                    <p>Time: ${time}</p>
                </div>
            </div>
            <p><strong>Bill To:</strong> ${customerName || "Customer"}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Discount</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${billRows}
                </tbody>
            </table>
            <div class="sub-total">
                <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
                <p><strong>Overall Discount:</strong> ₹${discountInput.toFixed(2)}</p>
            </div>
            <div class="total">
                <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            </div>
            <hr>
            <div class="bill-footer">
                <p><strong>Terms and Conditions:</strong></p>
                <ol>
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>All disputes are subject to Madhubani jurisdiction only.</li>
                </ol>
            </div>
        </div>
    `;

    shareOptions.style.display = 'block';
});


// Initial Load
updateCartCounter();




// Add Product on Button Click
document.getElementById('addProductBtn').addEventListener('click', addProductToCart);

 


// Initial load
refreshProductList();
refreshProductDropdowns();
