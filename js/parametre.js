// --- Définition des URLs centralisées ---
const apiUrls = {
  setWifi: () => "/setInfos-wifi",
  setTime: () => "/setTime"
};

// --- Fonctions spécialisées pour les requêtes API ---
const api = {
  async setWifiConfig(ssid, password) {
    const url = apiUrls.setWifi();
    const configData = {
      ssid: ssid,
      password: password
    };
    const response = await fetchESP(url, configData);
    if (response?.data) {
      console.log("Données envoyées pour le Wi-Fi : ", response.data);
      return response.data;
    }
    console.warn("Réponse inattendue du serveur pour la configuration Wi-Fi :", response);
    return null;
  },

  async setTime(timeData) {
    const url = apiUrls.setTime();
    const response = await fetchESP(url, timeData);
    if (response?.data) {
      console.log("Données envoyées pour l'heure : ", response.data);
      return response.data;
    }
    console.warn("Réponse inattendue du serveur pour l'heure :", response);
    return null;
  }
};
// --- Reste de ton code (apiUrls, api, etc.) ---
// ...

const ssidEl = document.getElementById("ssid");
const passwordEL = document.getElementById("password");
const timeEl = document.getElementById("time");
const wifiEl = document.getElementById("wifi-form");
const hourFormEl = document.getElementById('hour-form');
const wifiBtn = document.getElementById("wifi-btn-modify");
const timeBtn = document.getElementById("time-btn-modify");
const wifiSection = document.getElementById('wifiSection');
const timeSection = document.getElementById('timeSection');
const modalSections = document.querySelectorAll('.modal'); // 💡 Sélectionne toutes les sections avec la classe 'modal'

if (!ssidEl || !passwordEL || !timeEl || !wifiEl || !wifiBtn || !timeBtn || !timeSection || !wifiSection) {
  console.error("Un ou plusieurs éléments n'existent pas dans le DOM. Le script ne peut pas continuer.");
} else {
  // ⛱️ Masquer tout au départ
  modalSections.forEach(section => section.style.display = "none"); // 💡 Cache toutes les modales au début

  // Fonction utilitaire pour afficher une modale et cacher les autres
  function showModal(modalToShow) {
    modalSections.forEach(section => {
      section.style.display = "none";
    });
    modalToShow.style.display = "block";
  }

  // 📌 Bouton Wi-Fi
  wifiBtn.addEventListener("click", () => {
    showModal(wifiSection);
  });

  // 📌 Bouton Heure
  timeBtn.addEventListener("click", () => {
    showModal(timeSection);
  });

  // 📡 Événement sur la soumission du formulaire Wi-Fi
  wifiEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ssid = ssidEl.value.trim();
    const password = passwordEL.value.trim();

    if (ssid === "" || password === "") {
      console.error("La configuration est vide !");
      return;
    }
    
    const responseData = await api.setWifiConfig(ssid, password);
    
    if (!responseData) {
      console.error("Échec de l'envoi de la configuration Wi-Fi.");
    }
    
    wifiEl.reset();
    wifiSection.style.display = "none";
  });

  // ⏰ Événement sur la soumission du formulaire Heure
  hourFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const timeData = parseInput(timeEl);

    if (!timeData) {
        console.error("Données de temps invalides. Le script ne peut pas continuer.");
        return;
    }
    
    const responseData = await api.setTime(timeData);
    
    if (!responseData) {
      console.error("Échec de l'envoi de la configuration de l'heure.");
    }
    
    hourFormEl.reset();
    timeSection.style.display = "none";
  });
}
// --- Reste de ton code (parseInput, fetchESP, etc.) ---

function parseInput(input) {
  if (!input || input.value.trim() === "") {
    console.error("Données invalides pour être parsé");
    return null; // Retourne null pour indiquer un échec
  }
  const [hour, minute] = input.value.trim().split(':').map(n => parseInt(n, 10));
  return {
    heure: hour,
    minute: minute,
    seconde: 0
  };
}

async function fetchESP(url, data = null) {
  const options = data
    ? {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      }
    : { method: "GET" };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Réponse du serveur : ", responseData);
    return responseData;
  } catch (err) {
    console.error("Erreur lors du fetch avec l'esp !", err);
    return null;
  }
}