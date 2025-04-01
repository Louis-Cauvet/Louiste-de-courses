"use strict";

import "./sass/style.scss";

let $shoppingList = [];
let $shoppingListProducts = [];

function gettingListProducts() {
    $shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

    return fetch('/liste_produits_quotidien.json')
    .then(response => response.json())
    .then(data => {
        $shoppingListProducts = data.map((product, index) => ({
        id: index + 1,
        name: product.nom,
        price: product.prix_unitaire,
        stock_quantity: product.quantite_stock
      }));
    });
}

function displayProductsTable() {
    const $tableBody = document.querySelector('#liste-course-body');
    $tableBody.innerHTML = '';
    let $totalPrice = 0;

    $shoppingList.forEach($item => {
        const $product =  $shoppingListProducts.find($p => $p.id === $item.id);
        if (!$product){
            return;
        }

        const $productSubtotal = $item.quantity * $product.price;
        $totalPrice += $productSubtotal;

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

    document.getElementById('total-general').textContent = `${ $totalPrice.toFixed(2)} €`;
}


function deleteProduct($productId) {
    $shoppingList = $shoppingList.filter($item => $item.id !== $productId);
    localStorage.setItem('shoppingList', JSON.stringify($shoppingList));

    displayProductsTable();
}

function updateProductQuantity($productId, $newProductQuantity) {
    const $item = $shoppingList.find(p => p.id === $productId);
    const $product = $shoppingListProducts.find(p => p.id === $productId);
  
    if (!$item || !$product) return;
  
    const stockDisponible = $product.stock_quantity;
  
    if ($newProductQuantity >= 1 && $newProductQuantity <= stockDisponible) {
      $item.quantity = $newProductQuantity;
      localStorage.setItem('shoppingList', JSON.stringify($shoppingList));
    } 

    displayProductsTable();
}

/*****************************************
 ** On page loading: load products' datas
 *****************************************/
 document.addEventListener('DOMContentLoaded', () => {
    // Waiting for the JSON to be loaded and parsed before continue
    gettingListProducts().then(() => {
    
        displayProductsTable();
        
        
        const $tableBody = document.querySelector('#liste-course-body');
        $tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-supprimer')) {
                deleteProduct(Number(e.target.dataset.productId));
            }
        });

        $tableBody.addEventListener('input', (e) => {
            if (e.target.matches('input[type="number"]')) {
                updateProductQuantity(Number(e.target.dataset.productId), Number(e.target.value));
            }
        });

        document.querySelector('#vider-liste').addEventListener('click', () => {
            localStorage.removeItem('shoppingList');
            $shoppingList = [];
            displayProductsTable();
          });
    });
  });