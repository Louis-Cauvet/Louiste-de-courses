/** 
 * @jest-environment jsdom 
 */

import { addingProductToShoppingList, filterProducts, displayProductCards, resetfilters } from "../main"; 

jest.mock("../main", () => ({
  ...jest.requireActual("../main"), // Conserver les autres exports
 filterProducts: jest.fn()
}));


describe("addingProductToShoppingList", () => {
  beforeEach(() => {
    // Réinitialiser l'état de localStorage avant chaque test
    localStorage.clear();
  });

  it("devrait ajouter un produit à la liste de courses s'il n'existe pas déjà", () => {
    // ID du produit à ajouter
    const productId = 1; 

    // Appeler la fonction pour ajouter le produit
    addingProductToShoppingList(productId);

    // Vérifier que le produit a été ajouté à localStorage
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(shoppingList).toEqual([{ id: 1, quantity: 1 }]);
  });

  it("devrait augmenter la quantité d'un produit s'il existe déjà dans la liste", () => {
    const productId = 1; // ID du produit à ajouter

    // Ajouter 2 fois le même produit
    addingProductToShoppingList(productId);
    addingProductToShoppingList(productId);

    // Vérifier que la quantité du produit a été mise à jour
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(shoppingList).toEqual([{ id: 1, quantity: 2 }]);
  });

  it("devrait ajouter plusieurs produits à la liste de courses", () => {
    // Ajouter plusieurs produits
    addingProductToShoppingList(1);
    addingProductToShoppingList(2);
    addingProductToShoppingList(1); 

    // Vérifier le contenu final de la liste de courses
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(shoppingList).toEqual([
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ]);
  });
});



describe("displayProductCards", () => {
  let container, counter;

  beforeEach(() => {
    // Créer nos éléments dans le DOM
    document.body.innerHTML = `
      <div id="liste-produits"></div>
      <div id="compteur-produits"></div>
    `;

    // Créer un mock pour localStorage
    const shoppingList = [
      { id: 1, quantity: 2 }, 
      { id: 3, quantity: 1 } 
    ];
    
    // Mock du stockage local
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'shoppingList') {
        return JSON.stringify(shoppingList); 
      }
      return null;
    });

    // Mock du conteneur de produits et du compteur
    container = document.querySelector("#liste-produits");
    counter = document.querySelector("#compteur-produits");
  });

  afterEach(() => {
    // Nettoyer les mocks après chaque test
    jest.clearAllMocks(); 
  });

  // Test 1 : Vide le conteneur avant l'ajout de produit
  it("devrait vider le conteneur de produits avant d'ajouter de nouveaux produits", () => {
    // Simuler l'ajout de produits
    const productsToDisplay = [
      { id: 1, name: "Banane", price: 1.5, stock_quantity: 5 },
      { id: 2, name: "Pomme", price: 2, stock_quantity: 3 }
    ];

    // Appeler la fonction
    displayProductCards(productsToDisplay);

    // Vérifier que le conteneur est bien vidé
    expect(container.innerHTML).not.toContain("Rupture de stock"); 
    // Vérifier qu'il y a bien 2 produits
    expect(container.childElementCount).toBe(2); 
  });


  // Test 2 : Afficher les produits correctement
  it("devrait afficher les produits avec leurs informations correctes", () => {
    // Ajouter les produits 
    const productsToDisplay = [
      { id: 1, name: "Banane", price: 1.5, stock_quantity: 5 },
      { id: 3, name: "Orange", price: 1, stock_quantity: 0 } 
    ];

    // Appeler la fonction 
    displayProductCards(productsToDisplay);

    // Vérifier le contenu 
    expect(container.innerHTML).toContain("Banane");
    expect(container.innerHTML).toContain("1.50 €");
    expect(container.innerHTML).toContain("5");
    expect(container.innerHTML).toContain("Orange");
    expect(container.innerHTML).toContain("1.00 €");
    expect(container.innerHTML).toContain("Rupture de stock");
    expect(container.querySelectorAll('.product-card').length).toBe(2);
  });


  // Test 3 : Incrémentation du compteur de produit affichés
  it("devrait mettre à jour le compteur de produits affichés", () => {
    const productsToDisplay = [
      { id: 1, name: "Banane", price: 1.5, stock_quantity: 5 },
      { id: 2, name: "Pomme", price: 2, stock_quantity: 3 }
    ];

    // Appeler la fonction
    displayProductCards(productsToDisplay);

    // Vérifier que le compteur est mis à jour
    expect(counter.innerHTML).toBe("2 produits");
  });


  // Test 4 : Désactiver le produit si il n'y en a plus 
  it("devrait désactiver le bouton si le produit est en rupture de stock", () => {
    // Ajouter le produit en rupture
    const productsToDisplay = [
      { id: 1, name: "Banane", price: 1.5, stock_quantity: 0 } 
    ];

    // Appeler la fonction
    displayProductCards(productsToDisplay);

    // Vérifier que le bouton est désactivé
    const button = container.querySelector('.adding-product-to-list');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe("Rupture de stock");
  }); 


  // Test 5 : L'ajout à la liste met à jour la quantité
  it("devrait permettre d'ajouter un produit à la liste de courses et mettre à jour la quantité", () => {
    // Ajout du produit
    const productsToDisplay = [
      { id: 1, name: "Banane", price: 1.5, stock_quantity: 5 }
    ];

    // Appeler la fonction
    displayProductCards(productsToDisplay);

    const button = container.querySelector('.adding-product-to-list');

    // Simuler le clic sur le bouton
    button.click();

    // Vérifier que la quantité a été mise à jour
    expect(container.querySelector('.card-quantity').textContent).toBe("4");
  });
});


/*
describe("filterProducts", () => {
  // Création de mes variables
  let searchInput, sortSelect;
  
  
  beforeEach(() => {
    // Créer le DOM simulé
    document.body.innerHTML = `
      <input id="recherche" value="" />
      <select id="tri">
        <option value="nom">Nom</option>
        <option value="prix">Prix</option>
      </select>
      <div id="liste-produits"></div>
      <div id="compteur-produits"></div>
    `;

    // Récupérer les éléments de recherche
    searchInput = document.querySelector("#recherche");
    sortSelect = document.querySelector("#tri");

    // Créer par défaut des produits 
    global.$listProducts = [
      { id: 1, name: "Banane", price: 1.5 },
      { id: 2, name: "Pomme", price: 2 },
      { id: 3, name: "Orange", price: 1 },
      { id: 4, name: "Abricot", price: 3 }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  // Test 1 : Filtre par nom sans tri
  it("devrait filtrer par nom sans tri", () => {
    // Simuler un input et utilise la fonction
    searchInput.value = "pomme"; // Recherche le produit "Pomme"
    filterProducts(); // Appeler la fonction

    // Vérifier qu'il nous retourne bien le produit "Pomme"
    expect(displayProductCards).toHaveBeenCalledWith([
      { id: 2, name: "Pomme", price: 2 }
    ]);
  });

  // Test 2 : Produit non trouvé
  it("devrait retourner une liste vide si aucun produit ne correspond", () => {
    // Simuler un input qui ne correspond à aucun produit
    searchInput.value = "kiwi"; // Recherche un produit inexistant
    filterProducts(); // Appeler la fonction

    // Vérifier que displayProductCards a été appelée avec une liste vide
    expect(displayProductCards).toHaveBeenCalledWith([]); // Vérifie que la liste est vide
  });

  // Test 3 : Filtre par nom et tri par ordre alphabétique
  it("devrait filtrer par nom et trier par ordre alphabétique", () => {
    searchInput.value = "a"; // Recherche tous les produits contenant "a"
    sortSelect.value = "nom"; // Tri par nom
    filterProducts(); // Appeler la fonction

    // Vérifier que les résultats sont triés par ordre alphabétique
    expect(displayProductCards).toHaveBeenCalledWith([
      { id: 4, name: "Abricot", price: 3 },
      { id: 1, name: "Banane", price: 1.5 },
      { id: 3, name: "Orange", price: 1 }
    ]);
  });

  // Test 4 : Filtre par nom et tri par prix
  it("devrait filtrer par nom et trier par prix croissant", () => {
    searchInput.value = "a"; // Recherche tous les produits contenant "a"
    sortSelect.value = "prix"; // Tri par prix
    filterProducts(); // Appeler la fonction

    // Vérifier que les résultats sont triés par prix
    expect(displayProductCards).toHaveBeenCalledWith([
      { id: 3, name: "Orange", price: 1 },
      { id: 1, name: "Banane", price: 1.5 },
      { id: 4, name: "Abricot", price: 3 }
    ]);
  });
});
*/



describe("resetfilters", () => {
  let searchInput, sortSelect;

  beforeEach(() => {
    // Créer le DOM simulé
    document.body.innerHTML = `
      <input id="recherche" value="test" />
      <select id="tri">
        <option value="default">Default</option>
        <option value="nom">Nom</option>
        <option value="prix">Prix</option>
      </select>
      <div id="liste-produits"></div>
      <div id="compteur-produits"></div>
    `;

    // Récupérer les éléments du DOM
    searchInput = document.querySelector("#recherche");
    sortSelect = document.querySelector("#tri");

    // Mock de filterProducts pour vérifier son appel
    // jest.spyOn(global, "filterProducts").mockImplementation(() => {});  
  });

  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait réinitialiser les valeurs des filtres", () => {
    // Appeler la fonction resetFilters
    resetfilters();

    // Vérifier que les valeurs ont été réinitialisées
    expect(searchInput.value).toBe(""); // La valeur du champ de recherche doit être vide
    expect(sortSelect.value).toBe("default"); // La valeur du select doit être "default"
  });

  // it("devrait appeler filterProducts après réinitialisation", () => {
  //   // Appeler la fonction resetFilters
  //   resetfilters();

  //   // Vérifier que filterProducts a été appelée
  //   expect(filterProducts).toHaveBeenCalled(); // filterProducts doit être appelée
  // });
});