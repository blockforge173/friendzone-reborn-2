"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 menu.js

 Gestion :
 - musique du menu ;
 - transition vers le jeu ;
 - nouvelle partie ;
 - multi-sauvegarde ;
 - continuer la partie la plus récente ;
 - chargement d'un slot précis ;
 - suppression d'un slot ;
 - galerie multimédia ;
 - réinitialisation de la galerie ;
 - succès ;
 - réinitialisation des succès ;
 - paramètres ;
 - crédits ;
 - fermeture des popups.
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*=================================================
         ÉLÉMENTS DU MENU
        =================================================*/

        const transition =
            document.getElementById(
                "transition"
            );

        const boutonNouvellePartie =
            document.getElementById(
                "nouvellePartie"
            );

        const boutonContinuer =
            document.getElementById(
                "continuer"
            );

        const boutonCharger =
            document.getElementById(
                "charger"
            );

        const boutonGalerie =
            document.getElementById(
                "galerie"
            );

        const boutonSucces =
            document.getElementById(
                "succes"
            );

        const boutonParametres =
            document.getElementById(
                "parametres"
            );

        const boutonCredits =
            document.getElementById(
                "credits"
            );

        const boutonQuitter =
            document.getElementById(
                "quitter"
            );


        /*=================================================
         MULTI-SAUVEGARDE
        =================================================*/

        const fenetreSauvegardes =
            document.getElementById(
                "fenetreSauvegardes"
            );

        const titreFenetreSauvegardes =
            document.getElementById(
                "titreFenetreSauvegardes"
            );

        const descriptionFenetreSauvegardes =
            document.getElementById(
                "descriptionFenetreSauvegardes"
            );

        const listeSauvegardes =
            document.getElementById(
                "listeSauvegardes"
            );

        const boutonFermerSauvegardes =
            document.getElementById(
                "fermerSauvegardes"
            );


        /*=================================================
         GALERIE
        =================================================*/

        const fenetreGalerie =
            document.getElementById(
                "fenetreGalerie"
            );

        const visionneuseGalerie =
            document.getElementById(
                "visionneuseGalerie"
            );

        const boutonReinitialiserGalerie =
            document.getElementById(
                "reinitialiserGalerie"
            );


        /*=================================================
         SUCCÈS
        =================================================*/

        const fenetreSucces =
            document.getElementById(
                "fenetreSucces"
            );

        const boutonReinitialiserSucces =
            document.getElementById(
                "reinitialiserSucces"
            );


        /*=================================================
         ÉTAT
        =================================================*/

        let transitionEnCours =
            false;

        let modeSauvegardes =
            null;


        const CLE_NOUVELLE_PARTIE =
            "nouvellePartieDemandee";


        /*=================================================
         DISPONIBILITÉ DES MANAGERS
        =================================================*/

        function sauvegardeManagerDisponible() {

            return (
                typeof sauvegardeManager !==
                    "undefined" &&
                sauvegardeManager !== null
            );

        }


        function galerieManagerDisponible() {

            return (
                typeof galerieManager !==
                    "undefined" &&
                galerieManager !== null
            );

        }


        function succesManagerDisponible() {

            return (
                typeof succesManager !==
                    "undefined" &&
                succesManager !== null
            );

        }


        function parametresManagerDisponible() {

            return (
                typeof parametresManager !==
                    "undefined" &&
                parametresManager !== null
            );

        }


        function audioManagerDisponible() {

            return (
                typeof audioManager !==
                    "undefined" &&
                audioManager !== null
            );

        }


        /*=================================================
         SAUVEGARDE EXISTANTE
        =================================================*/

        function sauvegardeExiste() {

            if (
                !sauvegardeManagerDisponible()
            ) {

                return false;

            }


            if (
                typeof sauvegardeManager
                    .existeAuMoinsUne !==
                "function"
            ) {

                return false;

            }


            return sauvegardeManager
                .existeAuMoinsUne();

        }


        /*=================================================
         BOUTONS CONTINUER / CHARGER
        =================================================*/

        function actualiserBoutonsSauvegarde() {

            const existe =
                sauvegardeExiste();


            if (
                boutonContinuer
            ) {

                boutonContinuer.style.display =
                    existe
                        ? ""
                        : "none";


                boutonContinuer.disabled =
                    !existe;

            }


            if (
                boutonCharger
            ) {

                boutonCharger.style.display =
                    existe
                        ? ""
                        : "none";


                boutonCharger.disabled =
                    !existe;

            }

        }


        /*=================================================
         MUSIQUE DU MENU
        =================================================*/

        function initialiserMusique() {

            if (
                !audioManagerDisponible()
            ) {

                return;

            }


            if (
                typeof audioManager
                    .jouerMusique !==
                "function"
            ) {

                return;

            }


            audioManager
                .jouerMusique(
                    "menu"
                );

        }


        function demarrerMusiqueApresInteraction() {

            if (
                !audioManagerDisponible()
            ) {

                return;

            }


            if (
                audioManager.musiqueActuelle !==
                    "menu"
            ) {

                if (
                    typeof audioManager
                        .jouerMusique ===
                    "function"
                ) {

                    audioManager
                        .jouerMusique(
                            "menu"
                        );

                }


                return;

            }


            if (
                audioManager.musique &&
                audioManager.musique.paused
            ) {

                audioManager
                    .musique
                    .play()
                    .catch(
                        () => {}
                    );

            }

        }


        document.addEventListener(
            "click",
            demarrerMusiqueApresInteraction,
            {
                once: true
            }
        );


        function fadeOutMusique(
            duree = 1200
        ) {

            if (
                !audioManagerDisponible()
            ) {

                return;

            }


            if (
                typeof audioManager.fadeOut ===
                    "function"
            ) {

                audioManager
                    .fadeOut(
                        duree
                    );


                return;

            }


            if (
                typeof audioManager
                    .arreterMusique ===
                "function"
            ) {

                audioManager
                    .arreterMusique();

            }

        }


        /*=================================================
         BOUTONS
        =================================================*/

        function desactiverBoutons() {

            document
                .querySelectorAll(
                    "button"
                )
                .forEach(
                    bouton => {

                        bouton.disabled =
                            true;

                    }
                );

        }


        function reactiverBoutons() {

            document
                .querySelectorAll(
                    "button"
                )
                .forEach(
                    bouton => {

                        if (
                            bouton.classList.contains(
                                "galerie-carte"
                            ) &&
                            bouton.classList.contains(
                                "verrouillee"
                            )
                        ) {

                            bouton.disabled =
                                true;

                            return;

                        }


                        bouton.disabled =
                            false;

                    }
                );


            actualiserBoutonsSauvegarde();

        }


        /*=================================================
         LANCER LE JEU
        =================================================*/

        function lancerJeu() {

            if (
                transitionEnCours
            ) {

                return;

            }


            transitionEnCours =
                true;


            desactiverBoutons();


            fadeOutMusique(
                1200
            );


            if (
                transition
            ) {

                transition.classList.add(
                    "actif"
                );

            }


            setTimeout(
                () => {

                    window.location.href =
                        "jeu.html";

                },
                1200
            );

        }


        /*=================================================
         POPUPS
        =================================================*/

        function ouvrirPopup(
            id
        ) {

            const popup =
                document.getElementById(
                    id
                );


            if (
                !popup
            ) {

                return;

            }


            popup.style.display =
                "flex";


            popup.classList.add(
                "ouverte"
            );


            popup.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        function fermerPopup(
            popup
        ) {

            if (
                !popup
            ) {

                return;

            }


            if (
                popup.id ===
                    "visionneuseGalerie" &&
                galerieManagerDisponible() &&
                typeof galerieManager
                    .fermerVisionneuse ===
                    "function"
            ) {

                galerieManager
                    .fermerVisionneuse();


                return;

            }


            popup.classList.remove(
                "ouverte"
            );


            popup.setAttribute(
                "aria-hidden",
                "true"
            );


            setTimeout(
                () => {

                    if (
                        !popup.classList.contains(
                            "ouverte"
                        )
                    ) {

                        popup.style.display =
                            "none";

                    }

                },
                200
            );

        }


        function fermerToutesLesPopups() {

            if (
                galerieManagerDisponible() &&
                visionneuseGalerie &&
                visionneuseGalerie
                    .classList
                    .contains(
                        "ouverte"
                    ) &&
                typeof galerieManager
                    .fermerVisionneuse ===
                    "function"
            ) {

                galerieManager
                    .fermerVisionneuse();

            }


            document
                .querySelectorAll(
                    ".popup"
                )
                .forEach(
                    popup => {

                        if (
                            popup.id ===
                            "visionneuseGalerie"
                        ) {

                            return;

                        }


                        fermerPopup(
                            popup
                        );

                    }
                );


            modeSauvegardes =
                null;

        }


        window.fermerPopup =
            fermerToutesLesPopups;


        /*=================================================
         DATE DE SAUVEGARDE
        =================================================*/

        function formaterDateSauvegarde(
            dateISO
        ) {

            if (
                !dateISO
            ) {

                return "Date inconnue";

            }


            const date =
                new Date(
                    dateISO
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "Date inconnue";

            }


            return date
                .toLocaleString(
                    "fr-FR",
                    {

                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"

                    }
                );

        }


        function obtenirNumeroChapitreAffiche(
            chapitre
        ) {

            const index =
                Number(
                    chapitre
                );


            if (
                !Number.isInteger(
                    index
                ) ||
                index < 0
            ) {

                return "?";

            }


            return index + 1;

        }


        /*=================================================
         CRÉER TEXTE
        =================================================*/

        function creerTexte(
            classe,
            texte
        ) {

            const element =
                document.createElement(
                    "div"
                );


            if (
                classe
            ) {

                element.className =
                    classe;

            }


            element.textContent =
                texte;


            return element;

        }


        /*=================================================
         CRÉER BOUTON SLOT
        =================================================*/

        function creerBoutonSlot(
            texte,
            classe,
            callback
        ) {

            const bouton =
                document.createElement(
                    "button"
                );


            bouton.type =
                "button";


            bouton.textContent =
                texte;


            if (
                classe
            ) {

                bouton.className =
                    classe;

            }


            if (
                typeof callback ===
                    "function"
            ) {

                bouton.addEventListener(
                    "click",
                    callback
                );

            }


            return bouton;

        }


        /*=================================================
         NOUVELLE PARTIE DANS UN SLOT
        =================================================*/

        function commencerNouvellePartieDansSlot(
            slot
        ) {

            if (
                !sauvegardeManagerDisponible()
            ) {

                return;

            }


            if (
                !sauvegardeManager
                    .slotValide(
                        slot
                    )
            ) {

                return;

            }


            if (
                sauvegardeManager
                    .existe(
                        slot
                    )
            ) {

                const informations =
                    sauvegardeManager
                        .obtenirInformationsSlot(
                            slot
                        );


                const nom =
                    informations?.nom ||
                    "Joueur";


                const confirmation =
                    window.confirm(
                        `L'emplacement ${slot} contient déjà la partie de ${nom}.\n\nCommencer une nouvelle partie ici supprimera cette sauvegarde.\n\nContinuer ?`
                    );


                if (
                    !confirmation
                ) {

                    return;

                }


                sauvegardeManager
                    .supprimer(
                        slot
                    );

            }


            const slotDefini =
                sauvegardeManager
                    .definirSlotActif(
                        slot
                    );


            if (
                !slotDefini
            ) {

                window.alert(
                    "Impossible de sélectionner cet emplacement."
                );


                return;

            }


            localStorage.setItem(
                CLE_NOUVELLE_PARTIE,
                "true"
            );


            fermerToutesLesPopups();

            lancerJeu();

        }


        /*=================================================
         CHARGER UN SLOT
        =================================================*/

        function chargerSlot(
            slot
        ) {

            if (
                !sauvegardeManagerDisponible()
            ) {

                return;

            }


            if (
                !sauvegardeManager
                    .existe(
                        slot
                    )
            ) {

                window.alert(
                    "Cette sauvegarde n'existe plus."
                );


                afficherSauvegardes();

                actualiserBoutonsSauvegarde();


                return;

            }


            const slotDefini =
                sauvegardeManager
                    .definirSlotActif(
                        slot
                    );


            if (
                !slotDefini
            ) {

                window.alert(
                    "Impossible de charger cette sauvegarde."
                );


                return;

            }


            localStorage.removeItem(
                CLE_NOUVELLE_PARTIE
            );


            fermerToutesLesPopups();

            lancerJeu();

        }


        /*=================================================
         SUPPRIMER SLOT
        =================================================*/

        function supprimerSlot(
            slot
        ) {

            if (
                !sauvegardeManagerDisponible()
            ) {

                return;

            }


            const informations =
                sauvegardeManager
                    .obtenirInformationsSlot(
                        slot
                    );


            if (
                !informations ||
                informations.vide
            ) {

                return;

            }


            const nom =
                informations.nom ||
                "Joueur";


            const confirmation =
                window.confirm(
                    `Supprimer définitivement la sauvegarde ${slot} de ${nom} ?\n\nCette action est irréversible.`
                );


            if (
                !confirmation
            ) {

                return;

            }


            sauvegardeManager
                .supprimer(
                    slot
                );


            afficherSauvegardes();

            actualiserBoutonsSauvegarde();

        }


        /*=================================================
         CARTE DE SAUVEGARDE
        =================================================*/

        function creerCarteSauvegarde(
            informations
        ) {

            if (
                !informations
            ) {

                return null;

            }


            const slot =
                informations.slot;


            const carte =
                document.createElement(
                    "div"
                );


            carte.classList.add(
                "sauvegarde-slot"
            );


            carte.dataset.slot =
                String(
                    slot
                );


            carte.classList.add(
                informations.vide
                    ? "vide"
                    : "occupe"
            );


            if (
                informations.invalide
            ) {

                carte.classList.add(
                    "invalide"
                );

            }


            const titre =
                document.createElement(
                    "h3"
                );


            titre.className =
                "sauvegarde-slot-titre";


            titre.textContent =
                `Sauvegarde ${slot}`;


            carte.appendChild(
                titre
            );


            /*-----------------------------------------
             SLOT INVALIDE
            -----------------------------------------*/

            if (
                informations.invalide
            ) {

                carte.appendChild(
                    creerTexte(
                        "sauvegarde-erreur",
                        "Sauvegarde invalide ou endommagée."
                    )
                );


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "sauvegarde-actions";


                if (
                    modeSauvegardes ===
                    "nouvellePartie"
                ) {

                    actions.appendChild(
                        creerBoutonSlot(
                            "Utiliser cet emplacement",
                            "sauvegarde-bouton principal",
                            () => {

                                commencerNouvellePartieDansSlot(
                                    slot
                                );

                            }
                        )
                    );

                }


                actions.appendChild(
                    creerBoutonSlot(
                        "Supprimer",
                        "sauvegarde-bouton supprimer",
                        () => {

                            const confirmation =
                                window.confirm(
                                    `Supprimer les données invalides de l'emplacement ${slot} ?`
                                );


                            if (
                                confirmation
                            ) {

                                sauvegardeManager
                                    .supprimer(
                                        slot
                                    );


                                afficherSauvegardes();

                                actualiserBoutonsSauvegarde();

                            }

                        }
                    )
                );


                carte.appendChild(
                    actions
                );


                return carte;

            }


            /*-----------------------------------------
             SLOT VIDE
            -----------------------------------------*/

            if (
                informations.vide
            ) {

                carte.appendChild(
                    creerTexte(
                        "sauvegarde-vide",
                        "Emplacement vide"
                    )
                );


                if (
                    modeSauvegardes ===
                    "nouvellePartie"
                ) {

                    const actions =
                        document.createElement(
                            "div"
                        );


                    actions.className =
                        "sauvegarde-actions";


                    actions.appendChild(
                        creerBoutonSlot(
                            "Nouvelle partie",
                            "sauvegarde-bouton principal",
                            () => {

                                commencerNouvellePartieDansSlot(
                                    slot
                                );

                            }
                        )
                    );


                    carte.appendChild(
                        actions
                    );

                }


                if (
                    modeSauvegardes ===
                    "charger"
                ) {

                    const bouton =
                        creerBoutonSlot(
                            "Aucune sauvegarde",
                            "sauvegarde-bouton indisponible"
                        );


                    bouton.disabled =
                        true;


                    carte.appendChild(
                        bouton
                    );

                }


                return carte;

            }


            /*-----------------------------------------
             SLOT OCCUPÉ
            -----------------------------------------*/

            carte.appendChild(
                creerTexte(
                    "sauvegarde-nom",
                    informations.nom ||
                        "Joueur"
                )
            );


            carte.appendChild(
                creerTexte(
                    "sauvegarde-chapitre",
                    `Chapitre ${obtenirNumeroChapitreAffiche(informations.chapitre)}`
                )
            );


            if (
                informations.scene
            ) {

                carte.appendChild(
                    creerTexte(
                        "sauvegarde-scene",
                        `Scène : ${informations.scene}`
                    )
                );

            }


            carte.appendChild(
                creerTexte(
                    "sauvegarde-date",
                    formaterDateSauvegarde(
                        informations.date
                    )
                )
            );


            if (
                sauvegardeManager
                    .obtenirSlotActif() ===
                slot
            ) {

                carte.classList.add(
                    "actif"
                );


                carte.appendChild(
                    creerTexte(
                        "sauvegarde-slot-actif",
                        "Partie active"
                    )
                );

            }


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "sauvegarde-actions";


            if (
                modeSauvegardes ===
                "charger"
            ) {

                actions.appendChild(
                    creerBoutonSlot(
                        "Charger",
                        "sauvegarde-bouton principal",
                        () => {

                            chargerSlot(
                                slot
                            );

                        }
                    )
                );

            }


            if (
                modeSauvegardes ===
                "nouvellePartie"
            ) {

                actions.appendChild(
                    creerBoutonSlot(
                        "Remplacer",
                        "sauvegarde-bouton principal",
                        () => {

                            commencerNouvellePartieDansSlot(
                                slot
                            );

                        }
                    )
                );

            }


            actions.appendChild(
                creerBoutonSlot(
                    "Supprimer",
                    "sauvegarde-bouton supprimer",
                    () => {

                        supprimerSlot(
                            slot
                        );

                    }
                )
            );


            carte.appendChild(
                actions
            );


            return carte;

        }


        /*=================================================
         AFFICHER SAUVEGARDES
        =================================================*/

        function afficherSauvegardes() {

            if (
                !listeSauvegardes
            ) {

                return;

            }


            listeSauvegardes.innerHTML =
                "";


            if (
                !sauvegardeManagerDisponible() ||
                typeof sauvegardeManager
                    .obtenirTousLesSlots !==
                    "function"
            ) {

                listeSauvegardes.appendChild(
                    creerTexte(
                        "sauvegarde-erreur",
                        "Le système multi-sauvegarde n'est pas disponible."
                    )
                );


                return;

            }


            const slots =
                sauvegardeManager
                    .obtenirTousLesSlots();


            if (
                !Array.isArray(
                    slots
                )
            ) {

                return;

            }


            slots.forEach(
                informations => {

                    const carte =
                        creerCarteSauvegarde(
                            informations
                        );


                    if (
                        carte
                    ) {

                        listeSauvegardes
                            .appendChild(
                                carte
                            );

                    }

                }
            );

        }


        /*=================================================
         OUVRIR SAUVEGARDES
        =================================================*/

        function ouvrirSauvegardes(
            mode
        ) {

            modeSauvegardes =
                mode;


            if (
                mode ===
                "nouvellePartie"
            ) {

                if (
                    titreFenetreSauvegardes
                ) {

                    titreFenetreSauvegardes.textContent =
                        "Nouvelle partie";

                }


                if (
                    descriptionFenetreSauvegardes
                ) {

                    descriptionFenetreSauvegardes.textContent =
                        "Choisis l'emplacement dans lequel créer la nouvelle partie.";

                }

            }
            else {

                if (
                    titreFenetreSauvegardes
                ) {

                    titreFenetreSauvegardes.textContent =
                        "Charger une sauvegarde";

                }


                if (
                    descriptionFenetreSauvegardes
                ) {

                    descriptionFenetreSauvegardes.textContent =
                        "Choisis la partie que tu souhaites reprendre.";

                }

            }


            afficherSauvegardes();


            ouvrirPopup(
                "fenetreSauvegardes"
            );

        }


        /*=================================================
         NOUVELLE PARTIE
        =================================================*/

        function demanderNouvellePartie() {

            ouvrirSauvegardes(
                "nouvellePartie"
            );

        }


        /*=================================================
         CONTINUER
        =================================================*/

        function continuerPartie() {

            if (
                !sauvegardeExiste()
            ) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );


                return;

            }


            const slot =
                sauvegardeManager
                    .obtenirSlotLePlusRecent();


            if (
                !slot
            ) {

                return;

            }


            chargerSlot(
                slot
            );

        }


        /*=================================================
         CHARGER
        =================================================*/

        function chargerSauvegarde() {

            if (
                !sauvegardeExiste()
            ) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );


                return;

            }


            ouvrirSauvegardes(
                "charger"
            );

        }


        /*=================================================
         OUVRIR GALERIE
        =================================================*/

        function ouvrirGalerie() {

            if (
                !galerieManagerDisponible()
            ) {

                window.alert(
                    "La galerie n'est pas disponible."
                );


                return;

            }


            if (
                typeof galerieManager
                    .afficher ===
                "function"
            ) {

                galerieManager
                    .afficher();

            }


            ouvrirPopup(
                "fenetreGalerie"
            );

        }


        /*=================================================
         RÉINITIALISER GALERIE
        =================================================*/

        function reinitialiserGalerie() {

            if (
                !galerieManagerDisponible()
            ) {

                window.alert(
                    "Le gestionnaire de galerie est indisponible."
                );


                return;

            }


            if (
                typeof galerieManager
                    .reinitialiser !==
                "function"
            ) {

                window.alert(
                    "La réinitialisation de la galerie n'est pas disponible."
                );


                return;

            }


            const nombreDebloques =
                typeof galerieManager
                    .nombreDebloques ===
                    "function"

                    ? galerieManager
                        .nombreDebloques()

                    : 0;


            if (
                nombreDebloques <=
                0
            ) {

                window.alert(
                    "Aucun média n'est actuellement débloqué."
                );


                return;

            }


            const confirmation =
                window.confirm(
                    "Réinitialiser toute la galerie ?\n\n" +
                    "Tous les médias débloqués seront de nouveau verrouillés.\n\n" +
                    "Les sauvegardes, les succès et les paramètres seront conservés.\n\n" +
                    "Cette action est irréversible."
                );


            if (
                !confirmation
            ) {

                return;

            }


            const resultat =
                galerieManager
                    .reinitialiser();


            if (
                !resultat
            ) {

                window.alert(
                    "Impossible de réinitialiser la galerie."
                );


                return;

            }


            window.alert(
                "La galerie a été réinitialisée."
            );

        }


        /*=================================================
         RÉINITIALISER SUCCÈS
        =================================================*/

        function reinitialiserSucces() {

            if (
                !succesManagerDisponible()
            ) {

                return;

            }


            if (
                typeof succesManager
                    .reinitialiser !==
                "function"
            ) {

                return;

            }


            const nombreDebloques =
                typeof succesManager
                    .nombreDebloques ===
                    "function"

                    ? succesManager
                        .nombreDebloques()

                    : 0;


            if (
                nombreDebloques <=
                0
            ) {

                window.alert(
                    "Aucun succès n'est actuellement débloqué."
                );


                return;

            }


            const confirmation =
                window.confirm(
                    "Réinitialiser tous les succès ?\n\n" +
                    "Cette action supprimera uniquement la progression des succès.\n\n" +
                    "Les sauvegardes, la galerie et les paramètres seront conservés.\n\n" +
                    "Cette action est irréversible."
                );


            if (
                !confirmation
            ) {

                return;

            }


            const resultat =
                succesManager
                    .reinitialiser();


            if (
                !resultat
            ) {

                window.alert(
                    "Impossible de réinitialiser les succès."
                );


                return;

            }


            window.alert(
                "Les succès ont été réinitialisés."
            );

        }


        /*=================================================
         FERMER SAUVEGARDES
        =================================================*/

        if (
            boutonFermerSauvegardes
        ) {

            boutonFermerSauvegardes
                .addEventListener(
                    "click",
                    () => {

                        fermerPopup(
                            fenetreSauvegardes
                        );


                        modeSauvegardes =
                            null;

                    }
                );

        }


        /*=================================================
         BOUTON NOUVELLE PARTIE
        =================================================*/

        if (
            boutonNouvellePartie
        ) {

            boutonNouvellePartie
                .addEventListener(
                    "click",
                    demanderNouvellePartie
                );

        }


        /*=================================================
         BOUTON CONTINUER
        =================================================*/

        if (
            boutonContinuer
        ) {

            boutonContinuer
                .addEventListener(
                    "click",
                    continuerPartie
                );

        }


        /*=================================================
         BOUTON CHARGER
        =================================================*/

        if (
            boutonCharger
        ) {

            boutonCharger
                .addEventListener(
                    "click",
                    chargerSauvegarde
                );

        }


        /*=================================================
         BOUTON GALERIE
        =================================================*/

        if (
            boutonGalerie
        ) {

            boutonGalerie
                .addEventListener(
                    "click",
                    ouvrirGalerie
                );

        }


        /*=================================================
         BOUTON RÉINITIALISER GALERIE
        =================================================*/

        if (
            boutonReinitialiserGalerie
        ) {

            boutonReinitialiserGalerie
                .addEventListener(
                    "click",
                    reinitialiserGalerie
                );

        }


        /*=================================================
         BOUTON SUCCÈS
        =================================================*/

        if (
            boutonSucces
        ) {

            boutonSucces
                .addEventListener(
                    "click",
                    () => {

                        if (
                            succesManagerDisponible() &&
                            typeof succesManager
                                .afficher ===
                                "function"
                        ) {

                            succesManager
                                .afficher();

                        }


                        ouvrirPopup(
                            "fenetreSucces"
                        );

                    }
                );

        }


        /*=================================================
         BOUTON RÉINITIALISER SUCCÈS
        =================================================*/

        if (
            boutonReinitialiserSucces
        ) {

            boutonReinitialiserSucces
                .addEventListener(
                    "click",
                    reinitialiserSucces
                );

        }


        /*=================================================
         PARAMÈTRES
        =================================================*/

        if (
            boutonParametres
        ) {

            boutonParametres
                .addEventListener(
                    "click",
                    () => {

                        if (
                            parametresManagerDisponible() &&
                            typeof parametresManager
                                .actualiserDepuisAudio ===
                                "function"
                        ) {

                            parametresManager
                                .actualiserDepuisAudio();

                        }


                        ouvrirPopup(
                            "fenetreParametres"
                        );

                    }
                );

        }


        /*=================================================
         CRÉDITS
        =================================================*/

        if (
            boutonCredits
        ) {

            boutonCredits
                .addEventListener(
                    "click",
                    () => {

                        ouvrirPopup(
                            "fenetreCredits"
                        );

                    }
                );

        }


        /*=================================================
         QUITTER
        =================================================*/

        if (
            boutonQuitter
        ) {

            boutonQuitter
                .addEventListener(
                    "click",
                    () => {

                        const confirmation =
                            window.confirm(
                                "Quitter le jeu ?"
                            );


                        if (
                            !confirmation
                        ) {

                            return;

                        }


                        if (
                            galerieManagerDisponible() &&
                            typeof galerieManager
                                .fermerVisionneuse ===
                                "function"
                        ) {

                            galerieManager
                                .fermerVisionneuse();

                        }


                        if (
                            audioManagerDisponible() &&
                            typeof audioManager
                                .arreterMusique ===
                                "function"
                        ) {

                            audioManager
                                .arreterMusique();

                        }


                        window.close();


                        setTimeout(
                            () => {

                                if (
                                    !window.closed
                                ) {

                                    window.alert(
                                        "Le navigateur empêche la fermeture automatique. Tu peux fermer cet onglet manuellement."
                                    );

                                }

                            },
                            150
                        );

                    }
                );

        }


        /*=================================================
         CLIC SUR LE FOND D'UNE POPUP
        =================================================*/

        document
            .querySelectorAll(
                ".popup"
            )
            .forEach(
                popup => {

                    if (
                        popup.id ===
                        "visionneuseGalerie"
                    ) {

                        return;

                    }


                    popup.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                popup
                            ) {

                                fermerPopup(
                                    popup
                                );


                                if (
                                    popup ===
                                    fenetreSauvegardes
                                ) {

                                    modeSauvegardes =
                                        null;

                                }

                            }

                        }
                    );

                }
            );


        /*=================================================
         ÉCHAP
        =================================================*/

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    visionneuseGalerie &&
                    visionneuseGalerie
                        .classList
                        .contains(
                            "ouverte"
                        )
                ) {

                    return;

                }


                fermerToutesLesPopups();

            }
        );


        /*=================================================
         GALERIE DÉBLOQUÉE
        =================================================*/

        document.addEventListener(
            "galerieDebloquee",
            () => {

                if (
                    galerieManagerDisponible() &&
                    typeof galerieManager
                        .afficher ===
                        "function"
                ) {

                    galerieManager
                        .afficher();

                }

            }
        );


        /*=================================================
         GALERIE RÉINITIALISÉE
        =================================================*/

        document.addEventListener(
            "galerieReinitialisee",
            () => {

                if (
                    galerieManagerDisponible() &&
                    typeof galerieManager
                        .afficher ===
                        "function"
                ) {

                    galerieManager
                        .afficher();

                }

            }
        );


        /*=================================================
         SUCCÈS RÉINITIALISÉS
        =================================================*/

        document.addEventListener(
            "succesReinitialises",
            () => {

                if (
                    succesManagerDisponible() &&
                    typeof succesManager
                        .afficher ===
                        "function"
                ) {

                    succesManager
                        .afficher();

                }

            }
        );


        /*=================================================
         MODIFICATION LOCALSTORAGE DEPUIS UN AUTRE ONGLET
        =================================================*/

        window.addEventListener(
            "storage",
            event => {

                if (
                    !event.key
                ) {

                    return;

                }


                /*-----------------------------------------
                 SAUVEGARDES
                -----------------------------------------*/

                if (
                    event.key.startsWith(
                        "friendzoneRebornSave_slot_"
                    ) ||
                    event.key ===
                        "friendzoneRebornSave_slot_actif" ||
                    event.key ===
                        "save"
                ) {

                    actualiserBoutonsSauvegarde();


                    if (
                        fenetreSauvegardes &&
                        fenetreSauvegardes
                            .classList
                            .contains(
                                "ouverte"
                            )
                    ) {

                        afficherSauvegardes();

                    }

                }


                /*-----------------------------------------
                 GALERIE
                -----------------------------------------*/

                if (
                    event.key ===
                        "friendzoneRebornGalerie" &&
                    galerieManagerDisponible() &&
                    typeof galerieManager
                        .afficher ===
                        "function"
                ) {

                    galerieManager
                        .afficher();

                }


                /*-----------------------------------------
                 SUCCÈS
                -----------------------------------------*/

                if (
                    event.key ===
                        "friendzoneRebornSucces" &&
                    succesManagerDisponible() &&
                    typeof succesManager
                        .afficher ===
                        "function"
                ) {

                    succesManager
                        .afficher();

                }

            }
        );


        /*=================================================
         RETOUR NAVIGATEUR
        =================================================*/

        window.addEventListener(
            "pageshow",
            () => {

                transitionEnCours =
                    false;


                reactiverBoutons();


                if (
                    transition
                ) {

                    transition.classList.remove(
                        "actif"
                    );

                }


                if (
                    fenetreSauvegardes &&
                    fenetreSauvegardes
                        .classList
                        .contains(
                            "ouverte"
                        )
                ) {

                    afficherSauvegardes();

                }


                if (
                    fenetreGalerie &&
                    fenetreGalerie
                        .classList
                        .contains(
                            "ouverte"
                        ) &&
                    galerieManagerDisponible() &&
                    typeof galerieManager
                        .afficher ===
                        "function"
                ) {

                    galerieManager
                        .afficher();

                }


                if (
                    fenetreSucces &&
                    fenetreSucces
                        .classList
                        .contains(
                            "ouverte"
                        ) &&
                    succesManagerDisponible() &&
                    typeof succesManager
                        .afficher ===
                        "function"
                ) {

                    succesManager
                        .afficher();

                }

            }
        );


        /*=================================================
         INITIALISATION
        =================================================*/

        actualiserBoutonsSauvegarde();


        if (
            galerieManagerDisponible() &&
            typeof galerieManager
                .afficher ===
                "function"
        ) {

            galerieManager
                .afficher();

        }


        if (
            succesManagerDisponible() &&
            typeof succesManager
                .afficher ===
                "function"
        ) {

            succesManager
                .afficher();

        }


        initialiserMusique();

    }
);
