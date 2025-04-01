"use strict";

import "./sass/style.scss";

 // Global array to store the list of products once loaded
let $listProducts = [];     

/*****************************************
 ** Allows to fetch & store products' data form JSON file into an array
 *****************************************/
function createProductsArray() {
  return fetch('/liste_produits_quotidien.json')
   // Getting the products' list from JSON file
  .then(response => response.json())
  .then(data => {
   // Transforming each product and storing it in the global array with a unique ID
    $listProducts = data.map((product, index) => ({
      id: index + 1,
      name: product.nom,
      price: product.prix_unitaire,
      stock_quantity: product.quantite_stock
    }));
  })
  .catch(err => console.error('Erreur dans le chargement du fichier JSON de la liste de produits :', err));
}

/*****************************************
 ** Allows to store the shopping list's products in Local Storage
*****************************************/
function addingProductToShoppingList($productId) {
  // Getting the shopping list stored in Local Storage
  let $shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

   // Checking if the product is already in the shopping list
  const $isAlreadyExistingProduct = $shoppingList.find($product => $product.id === $productId);

  if ($isAlreadyExistingProduct) {
    // If the product is already in shopping list, updating his quantity
    $isAlreadyExistingProduct.quantity++;
  } else {
    // If the product isn't already in shopping list, inserting it inside
    $shoppingList.push({ id: $productId, quantity: 1 });
  }

  // Upadting the 'shopping list' item into Local Storage
  localStorage.setItem('shoppingList', JSON.stringify($shoppingList));
}

/*****************************************
 ** Allows to dynamically display products' card from the array passed in parameters
 *****************************************/
function displayProductCards($productsToDisplay) {
  // Getting & clearing the container on which we dynamically insert the products' list passed in parameters
  const $productsListContainer = document.querySelector('#liste-produits');
  $productsListContainer.innerHTML = '';

  // Getting the products stored in shopping list (in Local Storage)
  const $shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
  
  // Inserting each product's datas into an item in the container 
  $productsToDisplay.forEach(($product) => {
    const $productItem = document.createElement('li');
    $productItem.className = 'product-card';

    // Calculating the product's remaining quantity (taking quantity into account in the shopping list)
    const $numberInShoppingList = $shoppingList.find($p => $p.id === $product.id);
    const $quantityToSubstract = $numberInShoppingList ? $numberInShoppingList.quantity : 0;
    const $remainingQuantity = $product.stock_quantity - $quantityToSubstract ;

    $productItem.innerHTML = `
      <h2 class="card-title">${$product.name}</h2>
      <p>Quantité en stock : <span class="card-quantity h-fw-400">${$remainingQuantity}</span></p>
      <p>Prix unitaire : <span class="h-fw-400">${$product.price.toFixed(2)} €</span></p>
      <button class="a-button adding-product-to-list" data-product-id="${$product.id}">Ajouter à la liste</button>
    `;

    // Disabling product's button if his remaining quantity is 0 
    const $addingToListButton = $productItem.querySelector('.adding-product-to-list');
    if ($remainingQuantity <= 0) {
      $addingToListButton.disabled = true;
      $addingToListButton.textContent = 'Rupture de stock';
    }

     // Listening for click on the 'adding to list' button
    $addingToListButton.addEventListener('click', () => {
      if ( $remainingQuantity > 0) {
         // Updating the product quantity
        $product.stock_quantity--;
        $productItem.querySelector('.card-quantity').textContent = $product.stock_quantity;

        // Disabling product's button if his remaining quantity is 0 
        if ($product.stock_quantity === 0) {
          $addingToListButton.disabled = true;
          $addingToListButton.textContent = 'Rupture de stock';
        }

        // Adding the product in the shopping list
        addingProductToShoppingList($product.id);
      }
    });


    // Inserting product in container
    $productsListContainer.appendChild($productItem);
  });

  // Updating the number of products displayed
  const $productsCounter = document.querySelector('#compteur-produits');
  $productsCounter.innerHTML = `${$productsToDisplay.length} produits`
}


/*****************************************
 ** Allows to filter products based on the search input & the sort value
 *****************************************/
function filterProducts() {
  const $searchValue = document.querySelector('#recherche').value.toLowerCase();
  const $sortValue = document.querySelector('#tri').value;

  // Storing each product which match with the keystroke into array '$searchMatchingProducts'
  let $searchMatchingProducts = $listProducts.filter(
    product => product.name.toLowerCase().includes($searchValue)
  );

  if ($sortValue === 'nom') {
    // Applying alphabetic order on '$searchMatchingProducts' elements 
    $searchMatchingProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if ($sortValue === 'prix') {
    // Applying ascending order on '$searchMatchingProducts' elements 
    $searchMatchingProducts.sort((a, b) => a.price - b.price);
  }

  // Displaying products which match with the keystroke
  displayProductCards($searchMatchingProducts);
}


/*****************************************
 ** Allows to reset filters 
 *****************************************/
function resetfilters() {
  // Passing the default values of filters' fields
  document.querySelector('#recherche').value = '';
  document.querySelector('#tri').value = 'default';

  // Applying the new filter configuration
  filterProducts();
}


/*****************************************
 ** On page loading: load products' datas
 *****************************************/
document.addEventListener('DOMContentLoaded', () => {
  // Waiting for the JSON to be loaded and parsed before continue
  createProductsArray().then(() => {
    // Showing all products initially
    displayProductCards($listProducts);

    // Listening for input in the search field and filtering products
    document.querySelector('#recherche').addEventListener('input', (e) => {
      filterProducts();
    });

    // Listening for changing value in the sort field and filtering products
    document.querySelector('#tri').addEventListener('change', (e) => {
      filterProducts();
    });

    // Listening for click in the reset filters button and filtering products
    document.querySelector('#reset-filtres').addEventListener('click', () => {
      resetfilters();
    });
  });
});