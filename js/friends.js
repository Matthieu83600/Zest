document.addEventListener("DOMContentLoaded", function () {
  // 1. Charger les données des conversations depuis le fichier JSON
  fetch("../data/conversations.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des conversations JSON.");
      }
      return response.json();
    })
    .then((data) => {
      // Stocker le JSON dans le localStorage
      if (!localStorage.getItem("conversations")) {
        localStorage.setItem("conversations", JSON.stringify(data));
        console.log("Conversations initialisées avec succès.");
      }
    })
    .catch((error) => console.error("Erreur lors du chargement des conversations :", error));

  // 2. Sélectionner les éléments du DOM
  const friendsContainer = document.getElementById("friends-container");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("search-input");

  // Fonction pour afficher les amis (tous les amis sont déjà dans le HTML)
  function updateDisplay() {
    const friendsCards = Array.from(friendsContainer.getElementsByClassName("friends-card"));

    // Filtrer les amis en fonction de la recherche
    let searchQuery = searchInput.value.toLowerCase();
    friendsCards.forEach((card) => {
      const firstname = card.querySelector(".firstname").textContent.toLowerCase();
      const lastname = card.querySelector(".lastname").textContent.toLowerCase();

      // Vérifier si le prénom ou le nom correspond à la requête de recherche
      if (firstname.includes(searchQuery) || lastname.includes(searchQuery)) {
        card.style.display = ""; // Afficher la carte
      } else {
        card.style.display = "none"; // Masquer la carte
      }
    });
  }

  // Fonction pour trier les amis
  function sortFriends(criteria) {
    const friendsCards = Array.from(friendsContainer.getElementsByClassName("friends-card"));

    friendsCards.sort((a, b) => {
      const nameA =
        criteria === "firstname" ? a.querySelector(".firstname").textContent : a.querySelector(".lastname").textContent;
      const nameB =
        criteria === "firstname" ? b.querySelector(".firstname").textContent : b.querySelector(".lastname").textContent;

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    // Réafficher les amis triés
    friendsCards.forEach((card) => friendsContainer.appendChild(card));
  }

  // Ajouter un événement de tri
  sortSelect.addEventListener("change", function () {
    const selectedOption = sortSelect.value;
    if (selectedOption !== "none") {
      sortFriends(selectedOption);
    }
  });

  // Ajouter un événement de recherche
  searchInput.addEventListener("input", function () {
    updateDisplay();
  });

  // Initialisation : afficher les amis filtrés au chargement
  updateDisplay();

  // 3. Relier chaque bouton "Envoyer un message"
  const messageButtons = document.querySelectorAll(".friends-card .actions button[data-id]");
  messageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Récupérer l'ID de l'ami depuis l'attribut data-id
      const friendId = button.getAttribute("data-id");

      // Stocker l'ID de l'ami sélectionné dans localStorage
      localStorage.setItem("currentConversationId", friendId);

      // Rediriger vers la page de messagerie
      window.location.href = "../pages/messagerie.html";
    });
  });

  // 4. Drag and Drop pour réorganiser les amis
  const cards = document.querySelectorAll(".friends-card");
  const dropZone = document.getElementById("friends-container");

  let draggedItem = null; // Carte en mouvement
  let initialIndex = null; // Position initiale

  function handleDragStart(e) {
    draggedItem = e.target.closest(".friends-card"); // Identifier la carte en mouvement
    initialIndex = Array.from(dropZone.children).indexOf(draggedItem); // Sauvegarder sa position initiale
    draggedItem.style.opacity = 0.5; // Rendre semi-transparent
  }

  function handleDragOver(e) {
    e.preventDefault(); // Permettre le drop
    const target = e.target.closest(".friends-card"); // Identifier la carte survolée

    if (target && target !== draggedItem) {
      const targetIndex = Array.from(dropZone.children).indexOf(target); // Position de la carte survolée

      if (targetIndex > initialIndex) {
        // Si la carte survolée est après la carte en mouvement
        dropZone.insertBefore(draggedItem, target.nextSibling);
      } else {
        // Si la carte survolée est avant la carte en mouvement
        dropZone.insertBefore(draggedItem, target);
      }

      // Mettre à jour la position actuelle
      initialIndex = Array.from(dropZone.children).indexOf(draggedItem);
    }
  }

  function handleDragEnd() {
    draggedItem.style.opacity = 1; // Restaurer l'opacité
    draggedItem = null; // Réinitialiser
    initialIndex = null; // Réinitialiser
  }

  // Ajouter les écouteurs d'événements aux cartes
  cards.forEach((card) => {
    card.setAttribute("draggable", true); // Rendre les cartes déplaçables
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("dragend", handleDragEnd);
  });
});
