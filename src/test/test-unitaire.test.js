/** 
 * @jest-environment jsdom 
 */

import { addingProductToShoppingList } from "../main"; 

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

    // Ajouter le produit une première fois
    addingProductToShoppingList(productId);
    
    // Ajouter à nouveau le même produit
    addingProductToShoppingList(productId);

    // Vérifier que la quantité du produit a été mise à jour
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(shoppingList).toEqual([{ id: 1, quantity: 2 }]);
  });

  it("devrait ajouter plusieurs produits à la liste de courses", () => {
    // Ajouter plusieurs produits
    addingProductToShoppingList(1);
    addingProductToShoppingList(2);
    addingProductToShoppingList(1); // Augmenter la quantité du produit 1

    // Vérifier le contenu final de la liste de courses
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(shoppingList).toEqual([
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ]);
  });
});

