import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  /* FIREBASE CONFIG */
  const firebaseConfig = {
    apiKey: "AIzaSyDDueA796Z4HeKUghx0CNBxoZ03CDpzP2s",
    authDomain: "fini-3d4e2.firebaseapp.com",
    projectId: "fini-3d4e2",
    storageBucket: "fini-3d4e2.firebasestorage.app",
    messagingSenderId: "735686291193",
    appId: "1:735686291193:web:306c23f5aaec1ac1a7fc28"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  /* ELEMENTS DOM GLOBALS */
  const historique = document.getElementById("historique");
  const scoreMiloEl = document.getElementById("scoreMilo");
  const scoreGuillaumeEl = document.getElementById("scoreGuillaume");
  
  const mainActionBtn = document.getElementById("mainActionBtn");
  const popupMatch = document.getElementById("popupMatch");
  const btnMilo = document.getElementById("btnMilo");
  const btnMatchEnCours = document.getElementById("btnMatchEnCours");
  const btnGuillaume = document.getElementById("btnGuillaume");

  /* MODALE MATCH DE SCORE */
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const scoreLabel = document.getElementById("scoreLabel"); 
  const scoreInput = document.getElementById("scoreInput");
  const enCoursToggle = document.getElementById("enCoursToggle");
  const toggleRow = document.getElementById("toggleRow"); 
  const gagnantRow = document.getElementById("gagnantRow"); 
  const btnValider = document.getElementById("valider");
  const btnFermer = document.getElementById("fermer");

  /* BOUTONS CHOIX JOUEUR DANS MODALE */
  const modalSelectMilo = document.getElementById("modalSelectMilo");
  const modalSelectGuillaume = document.getElementById("modalSelectGuillaume");

  /* FLAMMES */
  const flameMilo = document.getElementById("flameMilo");
  const flameGuillaume = document.getElementById("flameGuillaume");
  const streakTextMilo = document.getElementById("streakTextMilo");
  const streakTextGuillaume = document.getElementById("streakTextGuillaume");

  /* VARIABLES DE SUIVI */
  let joueurSelectionneModal = ""; 
  let matchEnCoursGlobal = null; 

  /* SELECTION DU JOUEUR DANS LA MODALE */
  modalSelectMilo.addEventListener("click", () => {
    joueurSelectionneModal = "joueur1";
    modalSelectMilo.classList.add("selected");
    modalSelectGuillaume.classList.remove("selected");
  });

  modalSelectGuillaume.addEventListener("click", () => {
    joueurSelectionneModal = "joueur2";
    modalSelectGuillaume.classList.add("selected");
    modalSelectMilo.classList.remove("selected");
  });

  function réinitialiserSelectionModal() {
    joueurSelectionneModal = "";
    modalSelectMilo.classList.remove("selected");
    modalSelectGuillaume.classList.remove("selected");
  }

  /* COMPORTEMENT DU GROS BOUTON PRINCIPAL */
  mainActionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    if (matchEnCoursGlobal) {
      réinitialiserSelectionModal(); 
      
      scoreInput.value = matchEnCoursGlobal.score || "";
      
      enCoursToggle.checked = false; 
      toggleRow.style.display = "flex"; 
      gagnantRow.style.display = "block"; 
      scoreLabel.textContent = "Indique le score final :";
      
      modalTitle.textContent = "Terminer / Modifier le match";
      
      if (matchEnCoursGlobal.gagnant === "joueur1" || matchEnCoursGlobal.gagnant === "Milo") {
        joueurSelectionneModal = "joueur1";
        modalSelectMilo.classList.add("selected");
      } else if (matchEnCoursGlobal.gagnant === "joueur2" || matchEnCoursGlobal.gagnant === "Guillaume") {
        joueurSelectionneModal = "joueur2";
        modalSelectGuillaume.classList.add("selected");
      }

      modal.style.display = "flex";
    } else {
      popupMatch.style.display = popupMatch.style.display === "flex" ? "none" : "flex";
    }
  });

  document.addEventListener("click", (e) => {
    if (!popupMatch.contains(e.target) && e.target !== mainActionBtn) {
      popupMatch.style.display = "none";
    }
  });

  /* POPUP OPTION 1 : CLIC SUR "EN LIVE" ⏳ */
  btnMatchEnCours.addEventListener("click", () => {
    popupMatch.style.display = "none";
    réinitialiserSelectionModal();
    
    scoreInput.value = "0-0";
    
    enCoursToggle.checked = true;
    toggleRow.style.display = "flex";
    gagnantRow.style.display = "none"; 
    scoreLabel.textContent = "Indique le score actuel :";
    
    modalTitle.textContent = "Nouveau match en direct";
    modal.style.display = "flex";
  });

  /* POPUP OPTION 2 : MATCH DIRECT FINI POUR MILO */
  btnMilo.addEventListener("click", () => {
    popupMatch.style.display = "none";
    réinitialiserSelectionModal();
    joueurSelectionneModal = "joueur1";
    modalSelectMilo.classList.add("selected");
    scoreInput.value = "";
    enCoursToggle.checked = false; 
    
    toggleRow.style.display = "none"; 
    gagnantRow.style.display = "none"; 
    scoreLabel.textContent = "Indique le score final :";
    
    modalTitle.textContent = "Entrer le score pour Milo";
    modal.style.display = "flex";
  });

  /* POPUP OPTION 3 : MATCH DIRECT FINI POUR GUILLAUME */
  btnGuillaume.addEventListener("click", () => {
    popupMatch.style.display = "none";
    réinitialiserSelectionModal();
    joueurSelectionneModal = "joueur2";
    modalSelectGuillaume.classList.add("selected");
    scoreInput.value = "";
    enCoursToggle.checked = false; 
    
    toggleRow.style.display = "none"; 
    gagnantRow.style.display = "none"; 
    scoreLabel.textContent = "Indique le score final :";
    
    modalTitle.textContent = "Entrer le score pour Guillaume";
    modal.style.display = "flex";
  });

  btnFermer.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  /* ENREGISTRER / MISE À ZONE SUR FIREBASE */
  btnValider.addEventListener("click", async () => {
    const score = scoreInput.value.trim();
    const etatEnCours = enCoursToggle.checked;

    if (!etatEnCours && !joueurSelectionneModal) {
      alert("Veuillez choisir le gagnant du match avant de valider !");
      return;
    }

    if (matchEnCoursGlobal) {
      const docRef = doc(db, "matchs", matchEnCoursGlobal.id);
      await updateDoc(docRef, {
        gagnant: joueurSelectionneModal, 
        score: score || "0-0",
        enCours: etatEnCours,
        date: serverTimestamp() 
      });
    } else {
      await addDoc(collection(db, "matchs"), {
        gagnant: joueurSelectionneModal,
        score: score || "0-0",
        enCours: etatEnCours,
        date: serverTimestamp()
      });
    }

    modal.style.display = "none";
    chargerMatchs();
  });

  /* STREAKS */
  function calculerStreak(matchs) {
    const matchsFinis = [...matchs]
      .filter(m => !m.enCours && m.gagnant)
      .sort((a, b) => {
        const timeA = a.date?.seconds || (Date.now() / 1000);
        const timeB = b.date?.seconds || (Date.now() / 1000);
        return timeB - timeA;
      });

    if (matchsFinis.length === 0) return { joueur: null, streak: 0 };
    
    const dernierGagnant = matchsFinis[0].gagnant;
    let streak = 1;

    for (let i = 1; i < matchsFinis.length; i++) {
      if (matchsFinis[i].gagnant === dernierGagnant) {
        streak++;
      } else {
        break;
      }
    }
    return { joueur: dernierGagnant, streak };
  }

  function afficherStreak(streakInfo) {
    const { joueur, streak } = streakInfo;
    flameMilo.style.display = "none"; flameMilo.style.animation = "none";
    flameGuillaume.style.display = "none"; flameGuillaume.style.animation = "none";

    if (streak < 2) return;
    const vitesse = Math.max(0.04, 0.2 - (streak * 0.025));

    if (joueur === "joueur1" || joueur === "Milo") {
      streakTextMilo.textContent = streak;
      flameMilo.style.animation = `flameJiggle ${vitesse}s ease-in-out infinite alternate`;
      flameMilo.style.display = "block";
    } else if (joueur === "joueur2" || joueur === "Guillaume") {
      streakTextGuillaume.textContent = streak;
      flameGuillaume.style.animation = `flameJiggle ${vitesse}s ease-in-out infinite alternate`;
      flameGuillaume.style.display = "block";
    }
  }

  /* CHARGER TOUS LES MATCHS */
  async function chargerMatchs() {
    historique.innerHTML = "";
    matchEnCoursGlobal = null; 

    const snap = await getDocs(collection(db, "matchs"));
    let matchs = [];
    let victoiresMilo = 0;
    let victoiresGuillaume = 0;

    snap.forEach(docSnap => {
      let d = docSnap.data();
      d.id = docSnap.id; 
      
      if (d.enCours === undefined) d.enCours = false;

      matchs.push(d);

      if (!d.enCours) {
        if (d.gagnant === "joueur1" || d.gagnant === "Milo") victoiresMilo++;
        if (d.gagnant === "joueur2" || d.gagnant === "Guillaume") victoiresGuillaume++;
      } else {
        matchEnCoursGlobal = d; 
      }
    });

    if (matchEnCoursGlobal) {
      mainActionBtn.textContent = "REPRENDRE LE MATCH";
      mainActionBtn.classList.add("reprendre");
    } else {
      mainActionBtn.textContent = "AJOUTER UN MATCH";
      mainActionBtn.classList.remove("reprendre");
    }

    scoreMiloEl.textContent = victoiresMilo;
    scoreGuillaumeEl.textContent = victoiresGuillaume;

    matchs.sort((a, b) => {
      const timeA = a.date?.seconds || (Date.now() / 1000);
      const timeB = b.date?.seconds || (Date.now() / 1000);
      return timeB - timeA;
    });

    const streakInfo = calculerStreak(matchs);
    afficherStreak(streakInfo);

    matchs.forEach(d => {
      const li = document.createElement("li");
      
      const textSpan = document.createElement("span");
      if (d.enCours) {
        textSpan.textContent = `⏳ Match en cours (${d.score || "0-0"})`;
        li.classList.add("match-en-cours-item");
      } else {
        const nomAffiche = (d.gagnant === "joueur1" || d.gagnant === "Milo") ? "Milo" : "Guillaume";
        textSpan.textContent = `${nomAffiche} : ${d.score}`;
        li.classList.add((d.gagnant === "joueur1" || d.gagnant === "Milo") ? "victoireMilo" : "victoireGuillaume");
      }
      li.appendChild(textSpan);

      // Bouton de suppression personnalisé
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.classList.add("delete-match-btn");
      
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const customConfirm = document.getElementById("customConfirm");
        const confirmCancel = document.getElementById("confirmCancel");
        const confirmConfirm = document.getElementById("confirmConfirm");

        customConfirm.style.display = "flex";

        confirmCancel.onclick = () => {
          customConfirm.style.display = "none";
        };

        confirmConfirm.onclick = async () => {
          customConfirm.style.display = "none";
          const docRef = doc(db, "matchs", d.id);
          await deleteDoc(docRef);
          chargerMatchs();
        };
      });
      
      li.appendChild(deleteBtn);
      historique.appendChild(li);
    });
  }

  chargerMatchs();

  /* ANIMATION SCROLL */
  const sectionTitre = document.querySelector(".titre");
  const sectionBouton = document.querySelector(".bouton");
  const sectionScore = document.querySelector(".score");
  const cibleHistorique = document.querySelector(".historique");

  window.addEventListener("scroll", () => {
    if (!cibleHistorique) return;
    const positionHistorique = cibleHistorique.getBoundingClientRect().top;
    const pointDepart = 550; 
    const deplacementScroll = Math.max(0, pointDepart - positionHistorique);
    const maxScroll = 150; 

    let opacite = 1 - (deplacementScroll / maxScroll);
    if (opacite < 0) opacite = 0;
    if (opacite > 1) opacite = 1;

    let translation = -(deplacementScroll * 0.85);

    [sectionTitre, sectionBouton, sectionScore].forEach(element => {
      if (element) {
        element.style.opacity = opacite;
        element.style.transform = `translateY(${translation}px)`;
        element.style.pointerEvents = opacite === 0 ? "none" : "auto";
      }
    });
  });

});