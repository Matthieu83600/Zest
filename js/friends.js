document.addEventListener("DOMContentLoaded", function () {
  // Sélectionner les éléments du DOM
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

  // Fonction pour trier les amis (statique en dur dans le HTML)
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
});
