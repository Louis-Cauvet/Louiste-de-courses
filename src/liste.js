"use strict";

import "./sass/style.scss";

// Global arrays to store the list of products once loaded
let $shoppingList = [];
let $shoppingListProducts = [];

/*****************************************
 ** Allows to retrieves the shopping list's products from Local Storage
 *****************************************/
function gettingListProducts() {
     // Getting the products' list from shopping list (in Local Storage)
    $shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

    // Getting the products' list from JSON file & check if there are in the shopping list
    return fetch('/liste_produits_quotidien.json')
    .then(response => response.json())
    .then(data => {
        // Transforming each product and storing it in the global array with a unique ID
        $shoppingListProducts = data.map((product, index) => ({
            id: index + 1,
            name: product.nom,
            price: product.prix_unitaire,
            stock_quantity: product.quantite_stock
        }));
    })
    .catch(err => console.error('Erreur dans le chargement du fichier JSON de la liste de produits :', err));
}

/*****************************************
 ** Allows to display all shopping list's products into the table
*****************************************/
function displayProductsTable() {
    // Getting and clearing the table container
    const $tableBody = document.querySelector('#liste-course-body');
    $tableBody.innerHTML = '';

    // Initializing the total price's value to 0
    let $totalPrice = 0;

    // Browsing the shopping list to process each product
    $shoppingList.forEach($item => {
        const $product =  $shoppingListProducts.find($p => $p.id === $item.id);
        if (!$product){
            return;
        }

        // Calculating the product's subtotal, for adding it at the total price
        const $productSubtotal = $item.quantity * $product.price;
        $totalPrice += $productSubtotal;

        // Inserting the product's data in new table's row
        const $tableRow = document.createElement('tr');
        $tableRow.innerHTML = `
            <td>${$product.name}</td>
            <td>${$product.price.toFixed(2)} €</td>
            <td>
                <input type="number" value="${$item.quantity}" min="1" max="${$product.stock_quantity}" data-product-id="${$item.id}">
            </td>
            <td>${$productSubtotal.toFixed(2)} €</td>
            <td><button class="a-button btn-supprimer" data-product-id="${$item.id}">Supprimer</button></td>
        `;
        $tableBody.appendChild($tableRow);
    });

    // Updating the total price's value
    document.getElementById('total-general').textContent = `${ $totalPrice.toFixed(2)} €`;
}


/*****************************************
 ** Allows to delete a product from shopping list based on his id
*****************************************/
function deleteProduct($productId) {
    // Removing the product corresponding to the id in parameters from shopping list
    $shoppingList = $shoppingList.filter($item => $item.id !== $productId);

    // Removing the product corresponding to the id in parameters from shopping list
    localStorage.setItem('shoppingList', JSON.stringify($shoppingList));

    // Updating the table's rows
    displayProductsTable();
}

/*****************************************
 ** Allows to modify a product's quantity thanks to the quantity's input 
*****************************************/
function updateProductQuantity($productId, $newProductQuantity) {
    // Verifying than the product is on the shopping list 
    const $item = $shoppingList.find(p => p.id === $productId);
    const $product = $shoppingListProducts.find(p => p.id === $productId);
    if (!$item || !$product) return;
  
    const $productStock = $product.stock_quantity;
  
    // Verifying than the product's quantity remains in his stock capacity, and updating it in the Local Storage
    if ($newProductQuantity >= 1 && $newProductQuantity <= $productStock) {
      $item.quantity = $newProductQuantity;
      localStorage.setItem('shoppingList', JSON.stringify($shoppingList));
    } 

    // Updating the table's rows
    displayProductsTable();
}

/*****************************************
 ** On page loading: load products' datas
 *****************************************/
 document.addEventListener('DOMContentLoaded', () => {
    // Waiting for the JSON to be loaded and parsed before continue
    gettingListProducts().then(() => {
    
        // Filling table's rows with shopping list's products
        displayProductsTable();
        
        const $tableBody = document.querySelector('#liste-course-body');
        // Listening for click on the delete product's button & getting the product's id thanks to data-attribute 
        $tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-supprimer')) {
                deleteProduct(Number(e.target.dataset.productId));
            }
        });

        // Listening for change value on the arrays inputs for update product's quantity
        $tableBody.addEventListener('input', (e) => {
            if (e.target.matches('input[type="number"]')) {
                updateProductQuantity(Number(e.target.dataset.productId), Number(e.target.value));
            }
        });

        // Listening for click on the 'fill array' button for clear the shopping list
        document.querySelector('#vider-liste').addEventListener('click', () => {
            localStorage.removeItem('shoppingList');

            // Clearing the shopping list
            $shoppingList = [];

            // Updating the table for remove all rows
            displayProductsTable();
          });
    });
  });