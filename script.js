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
        select.innerHTML = `
            <option value="" disabled selected>Choose a product</option>
            ${productOptions}
        `;
    });
}

// Refresh the product list in the management section
function refreshProductList() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    Object.entries(prices).forEach(([name, price]) => {
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

// Initial load
refreshProductList();
refreshProductDropdowns();


// --------------------------------------------------



// Add a new product row
document.getElementById('addProductBtn').addEventListener('click', () => {
    const productRows = document.getElementById('productRows');
    const productRow = document.createElement('div');
    productRow.classList.add('productRow');
    productRow.innerHTML = `
        <label for="product">Select Product:</label>
        <select class="product" required>
            <option value="" disabled selected>Choose a product</option>
            <option value="Kulhar">Kulhar - ₹1.75</option>
            <option value="Water Bottle">Water Bottle - ₹10</option>
        </select>

        <label for="quantity">Enter Quantity:</label>
        <input type="number" class="quantity" min="1" placeholder="Enter quantity" required>
    `;
    productRows.appendChild(productRow);
});

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

        if (!product || isNaN(quantity) || quantity <= 0) {
            alert('Please fill out all product details correctly.');
            return;
        }

        const price = prices[product];
        const amount = price * quantity;
        subtotal += amount;
        products.push({ product, quantity, price, amount });
    });

    // Apply discount
    const discount = parseFloat(discountInput.value) || 0;
    if (discount < 0 || discount > subtotal) {
        alert('Invalid discount amount.');
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
                    <h3>Piyo Mithila</h3>
                    <p>Mobile: +919473012190</p>
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
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.product}</td>
                            <td>${p.quantity}</td>
                            <td>₹${p.price.toFixed(2)}</td>
                            <td>₹${p.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="sub-total">
                <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
                <p><strong>Tax (0%):</strong> ₹0.00</p>
                <p><strong>Discount:</strong> ₹${discount.toFixed(2)}</p>
            </div>
            <div class="total">
                <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            </div>

            

            <hr>
            <div class="bill-footer">
                <p><strong>Terms and Conditions:</strong></p>
                <ol>
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>All disputes are subject to [Your City] jurisdiction only.</li>
                </ol>
            </div>
        </div>
    `;

    shareOptions.style.display = 'block'
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
                title: 'Piyo Mithila Invoice',
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
            x: 75,
            y: 10,
            margin: [10, 10, 10, 10], // Margins: top, right, bottom, left
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate the PDF. Please try again.');
    }
});




