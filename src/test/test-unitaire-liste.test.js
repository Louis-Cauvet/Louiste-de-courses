/**
 * @jest-environment jsdom
 */

import { gettingListProducts, getShoppingListProducts, displayProductsTable, deleteProduct, updateProductQuantity } from "../liste"; 

describe("gettingListProducts", () => {
  beforeEach(() => {
    // 🔹 Simuler le localStorage
    const shoppingList = [
      { id: 1, quantity: 2 }, 
      { id: 3, quantity: 1 } 
    ];
    
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'shoppingList') {
        return JSON.stringify(shoppingList); 
      }
      return null;
    });

    // 🔹 Mock de fetch pour renvoyer des produits
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { nom: "Produit A", prix_unitaire: 10, quantite_stock: 5 },
        { nom: "Produit B", prix_unitaire: 20, quantite_stock: 10 }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait charger la liste des produits depuis le fichier JSON", async () => {
    await gettingListProducts(); // Appeler la fonction

    expect(getShoppingListProducts()).toEqual([
      { id: 1, name: "Produit A", price: 10, stock_quantity: 5 },
      { id: 2, name: "Produit B", price: 20, stock_quantity: 10 }
    ]);
  });

  it("devrait gérer les erreurs lors du chargement du fichier JSON", async () => {
    console.error = jest.fn(); // Mock de console.error
    fetch.mockRejectedValueOnce(new Error("Erreur réseau")); // Simuler une erreur de fetch

    await gettingListProducts(); // Appeler la fonction

    expect(console.error).toHaveBeenCalledWith(
      "Erreur dans le chargement du fichier JSON de la liste de produits :", 
      expect.any(Error)
    );
  });
});

describe("displayProductsTable", () => {
  let $shoppingList, $shoppingListProducts;

  beforeEach(() => {
    // 🛠️ Initialisation du DOM fictif
    document.body.innerHTML = `
      <table>
        <tbody id="liste-course-body"></tbody>
      </table>
      <div id="total-general"></div>
    `;

    // 📋 Mock des données
    $shoppingList = [
      { id: 1, quantity: 2 }, 
      { id: 2, quantity: 3 }
    ];

    $shoppingListProducts = [
      { id: 1, name: "Produit A", price: 10, stock_quantity: 5 },
      { id: 2, name: "Produit B", price: 20, stock_quantity: 10 }
    ];
  });

  it("devrait générer un tableau avec les bons produits", async () => {
    displayProductsTable($shoppingList, $shoppingListProducts);

    await new Promise(resolve => setTimeout(resolve, 100)); // Attente asynchrone

    const rows = document.querySelectorAll("#liste-course-body tr");
    expect(rows.length).toBe(2);

    expect(rows[0].innerHTML).toContain("Produit A");
    expect(rows[0].innerHTML).toContain("10.00 €");
    expect(rows[1].innerHTML).toContain("Produit B");
    expect(rows[1].innerHTML).toContain("20.00 €");
  });

  it("devrait calculer correctement le total général", () => {
    displayProductsTable($shoppingList, $shoppingListProducts);

    const totalGeneral = document.getElementById("total-general").textContent;
    expect(totalGeneral).toBe("80.00 €"); // (2 * 10) + (3 * 20) = 80
  });

  it("devrait inclure un input avec les bonnes valeurs", () => {
    displayProductsTable($shoppingList, $shoppingListProducts);

    const inputs = document.querySelectorAll("#liste-course-body input[type='number']");
    expect(inputs.length).toBe(2);

    expect(inputs[0].value).toBe("2"); // Quantité du produit 1
    expect(inputs[0].max).toBe("5");  // Stock du produit 1
    expect(inputs[1].value).toBe("3"); // Quantité du produit 2
    expect(inputs[1].max).toBe("10");  // Stock du produit 2
  });

  it("devrait inclure un bouton supprimer par produit", () => {
    displayProductsTable($shoppingList, $shoppingListProducts);

    const buttons = document.querySelectorAll(".btn-supprimer");
    expect(buttons.length).toBe(2);

    expect(buttons[0].dataset.productId).toBe("1");
    expect(buttons[1].dataset.productId).toBe("2");
  });
});

/*
describe("deleteProduct", () => {
  beforeEach(() => {
    // Simuler une liste de courses initiale dans localStorage
    localStorage.setItem(
      "shoppingList",
      JSON.stringify([
        { id: 1, quantity: 2 },
        { id: 2, quantity: 3 }
      ])
    );

    // Mock de displayProductsTable pour éviter des erreurs liées au DOM
    global.displayProductsTable = jest.fn();
  });

  it("doit supprimer un produit de la liste et mettre à jour le tableau", () => {
    deleteProduct(1);

    // Récupérer la liste mise à jour depuis localStorage
    const updatedShoppingList = JSON.parse(localStorage.getItem("shoppingList"));

    // Vérifier que la liste ne contient plus le produit supprimé
    expect(updatedShoppingList.length).toBe(1);
    expect(updatedShoppingList.find(p => p.id === 1)).toBeUndefined();

    // Vérifier que displayProductsTable a été appelé avec la liste mise à jour
    expect(displayProductsTable).toHaveBeenCalled();
  });
});
*/

/*describe("updateProductQuantity", () => {
  let shoppingListProducts;

  beforeEach(() => {
    // Simuler une liste de courses dans localStorage
    localStorage.setItem(
      "shoppingList",
      JSON.stringify([
        { id: 1, quantity: 2 },
        { id: 2, quantity: 3 }
      ])
    );

    // Simuler une liste de produits
    shoppingListProducts = [
      { id: 1, name: "Produit 1", price: 10, stock_quantity: 5 },
      { id: 2, name: "Produit 2", price: 20, stock_quantity: 10 }
    ];

    // Mock des variables globales
    global.$shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    global.$shoppingListProducts = shoppingListProducts;

    // Mock de displayProductsTable
    global.displayProductsTable = jest.fn();
  });

  it("doit mettre à jour la quantité d'un produit si elle est valide", () => {
    updateProductQuantity(1, 4);

    // Vérifier que la quantité est bien mise à jour
    expect($shoppingList.find(p => p.id === 1).quantity).toBe(4);

    // Vérifier que localStorage a bien été mis à jour
    const updatedShoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(updatedShoppingList.find(p => p.id === 1).quantity).toBe(4);

    // Vérifier que displayProductsTable a été appelé
    expect(displayProductsTable).toHaveBeenCalled();
  });

  it("ne doit pas mettre à jour la quantité si elle est hors stock", () => {
    updateProductQuantity(1, 10); // Stock max = 5

    // Vérifier que la quantité n'a pas changé
    expect($shoppingList.find(p => p.id === 1).quantity).toBe(2);

    // Vérifier que localStorage n'a pas été mis à jour
    const updatedShoppingList = JSON.parse(localStorage.getItem("shoppingList"));
    expect(updatedShoppingList.find(p => p.id === 1).quantity).toBe(2);

    // Vérifier que displayProductsTable n'a pas été appelé
    expect(displayProductsTable).not.toHaveBeenCalled();
  });

  it("ne doit pas mettre à jour la quantité si le produit n'existe pas", () => {
    updateProductQuantity(99, 3); // ID inexistant

    // Vérifier que la liste reste inchangée
    expect($shoppingList.length).toBe(2);
    expect(localStorage.getItem("shoppingList")).toEqual(
      JSON.stringify([
        { id: 1, quantity: 2 },
        { id: 2, quantity: 3 }
      ])
    );

    // Vérifier que displayProductsTable n'a pas été appelé
    expect(displayProductsTable()).not.toHaveBeenCalled();
  });
});
*/
