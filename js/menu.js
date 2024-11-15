function createHeader() {
  const header = document.createElement("header");
  header.classList.add("menu");

  // Déterminez si nous sommes à la racine ou dans un sous-dossier
  const isInPages = window.location.pathname.includes("/pages/");

  // Préfixe des chemins en fonction de la localisation
  const pathPrefix = isInPages ? "../" : "./";

  header.innerHTML = `
        <div class="menu-header">
            <h1>Zest</h1>
            <p>Ajoutez un zest de partage à vos moments.</p>
        </div>
        <nav>
            <ul class="nav-links">
                <li><a href="${pathPrefix}index.html" title="Fil d'actualités"><i class="fa-solid fa-house"></i></a></li>
                <li><a href="${pathPrefix}pages/messagerie.html" title="Messagerie"><i class="fa-solid fa-message"></i></a></li>
                <li><a href="${pathPrefix}pages/friends.html" title="Amis"><i class="fa-solid fa-user-group"></i></a></li>
                <li><a href="#" title="Mon profil" class="profile">
                    <i class="fa-solid fa-user-tie"></i>
                    <span>John Doe</span>
                </a></li>
                <li><a href="#" title="Déconnexion" class="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></a></li>
            </ul>
        </nav>
    `;

  document.body.prepend(header);

  // Ajoutez la classe active au lien correspondant à la page actuelle
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    // Vérifiez si l'URL du lien correspond à l'URL actuelle
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}

// Appelez cette fonction après le chargement du DOM
document.addEventListener("DOMContentLoaded", createHeader);
