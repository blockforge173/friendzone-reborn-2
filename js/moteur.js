"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 moteur.js

 Gestion :
 - chapitres ;
 - scènes ;
 - dialogues ;
 - apparition progressive des messages ;
 - délais des narrations ;
 - choix ;
 - effets ;
 - succès ;
 - galerie multimédia ;
 - sauvegardes multi-slot ;
 - audio ;
 - fonds dynamiques.
=========================================================*/

const moteur = {

    /*=====================================================
     ÉTAT DU JEU
    =====================================================*/

    chapitreActuel:
        0,

    sceneActuelle:
        "",

    chapitre:
        null,

    joueur:
        null,


    /*=====================================================
     TIMERS ET ÉLÉMENTS TEMPORAIRES
    =====================================================*/

    timerChoix:
        null,

    boutonChoix:
        null,

    timerFond:
        null,

    transitionChapitreEnCours:
        false,

    changementFondEnCours:
        false,


    /*=====================================================
     GESTION DES FONDS
    =====================================================*/

    fondActuel:
        "",

    cheminFonds:
        "images/fonds/",

    extensionFondParDefaut:
        "jpg",

    dureeTransitionFondParDefaut:
        500,


    /*=====================================================
     INITIALISATION
    =====================================================*/

    async initialiser() {

        try {

            this.initialiserTransition();

            this.initialiserFond();


            /*---------------------------------------------
             VÉRIFICATION DES GESTIONNAIRES OBLIGATOIRES
            ---------------------------------------------*/

            if (
                typeof chapitresManager ===
                    "undefined"
            ) {

                throw new Error(
                    "chapitresManager est introuvable."
                );

            }


            if (
                typeof sauvegardeManager ===
                    "undefined"
            ) {

                throw new Error(
                    "sauvegardeManager est introuvable."
                );

            }


            /*---------------------------------------------
             CHARGEMENT DES CHAPITRES
            ---------------------------------------------*/

            await chapitresManager
                .charger();


            if (
                chapitresManager
                    .nombre() ===
                0
            ) {

                this.afficherErreur(
                    "Aucun chapitre n'a pu être chargé."
                );

                return;

            }


            /*---------------------------------------------
             NOUVELLE PARTIE DEMANDÉE DEPUIS LE MENU
            ---------------------------------------------*/

            const nouvellePartieDemandee =
                localStorage.getItem(
                    "nouvellePartieDemandee"
                ) ===
                "true";


            if (
                nouvellePartieDemandee
            ) {

                localStorage.removeItem(
                    "nouvellePartieDemandee"
                );


                /*
                 IMPORTANT — MULTI-SAUVEGARDE

                 Le menu a déjà :
                 - choisi le slot ;
                 - supprimé son ancienne sauvegarde
                   si nécessaire ;
                 - défini ce slot comme actif.

                 Il ne faut donc pas supprimer
                 la sauvegarde ici.
                */


                let slotActif =
                    null;


                if (
                    typeof sauvegardeManager
                        .obtenirSlotActif ===
                        "function"
                ) {

                    slotActif =
                        sauvegardeManager
                            .obtenirSlotActif();

                }


                if (
                    !slotActif &&
                    typeof sauvegardeManager
                        .obtenirPremierSlotVide ===
                        "function" &&
                    typeof sauvegardeManager
                        .definirSlotActif ===
                        "function"
                ) {

                    const premierSlotVide =
                        sauvegardeManager
                            .obtenirPremierSlotVide();


                    if (
                        premierSlotVide
                    ) {

                        sauvegardeManager
                            .definirSlotActif(
                                premierSlotVide
                            );


                        slotActif =
                            premierSlotVide;

                    }

                }


                if (
                    !slotActif
                ) {

                    this.afficherErreur(
                        "Aucun emplacement de sauvegarde n'a été sélectionné."
                    );

                    return;

                }


                this.nouvellePartie();

                return;

            }


            /*---------------------------------------------
             CHARGEMENT D'UNE SAUVEGARDE
            ---------------------------------------------*/

            const sauvegarde =
                sauvegardeManager
                    .charger();


            if (
                sauvegarde
            ) {

                this.appliquerSauvegarde(
                    sauvegarde
                );

            }
            else {

                let slotActif =
                    null;


                if (
                    typeof sauvegardeManager
                        .obtenirSlotActif ===
                        "function"
                ) {

                    slotActif =
                        sauvegardeManager
                            .obtenirSlotActif();

                }


                if (
                    !slotActif &&
                    typeof sauvegardeManager
                        .obtenirPremierSlotVide ===
                        "function" &&
                    typeof sauvegardeManager
                        .definirSlotActif ===
                        "function"
                ) {

                    const premierSlotVide =
                        sauvegardeManager
                            .obtenirPremierSlotVide();


                    if (
                        premierSlotVide
                    ) {

                        sauvegardeManager
                            .definirSlotActif(
                                premierSlotVide
                            );


                        slotActif =
                            premierSlotVide;

                    }

                }


                if (
                    !slotActif
                ) {

                    this.afficherErreur(
                        "Aucun emplacement de sauvegarde disponible."
                    );

                    return;

                }


                this.nouvellePartie();

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur d'initialisation du moteur :",
                erreur
            );


            this.afficherErreur(
                "Une erreur est survenue pendant le chargement du jeu."
            );

        }

    },


    /*=====================================================
     INITIALISER LE FOND DU JEU
    =====================================================*/

    initialiserFond() {

        const fond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !fond
        ) {

            console.warn(
                "L'élément HTML #fond-jeu est introuvable."
            );

            return;

        }


        this.annulerTransitionFond();


        fond.style.backgroundImage =
            "none";


        fond.style.opacity =
            "1";


        fond.classList.remove(
            "changement-fond"
        );


        fond.classList.remove(
            "fond-charge"
        );


        this.fondActuel =
            "";

    },


    /*=====================================================
     TRANSITION D'ENTRÉE
    =====================================================*/

    initialiserTransition() {

        const transition =
            document.getElementById(
                "transition"
            );


        if (
            !transition
        ) {

            return;

        }


        setTimeout(
            () => {

                transition.classList.remove(
                    "actif"
                );


                transition.style.opacity =
                    "0";

            },
            100
        );

    },


    /*=====================================================
     DEMANDER LE NOM DU JOUEUR
    =====================================================*/

    demanderNomJoueur() {

        let nomChoisi =
            window.prompt(
                "Quel est le prénom de ton personnage ?",
                "Mikael"
            );


        nomChoisi =
            String(
                nomChoisi ||
                ""
            )
                .trim();


        if (
            nomChoisi.length <
            2
        ) {

            nomChoisi =
                "Joueur";

        }


        if (
            nomChoisi.length >
            20
        ) {

            nomChoisi =
                nomChoisi.substring(
                    0,
                    20
                );

        }


        return nomChoisi;

    },


    /*=====================================================
     NOUVELLE PARTIE
    =====================================================*/

    nouvellePartie() {

        const premierChapitre =
            chapitresManager
                .obtenir(
                    0
                );


        if (
            !premierChapitre
        ) {

            this.afficherErreur(
                "Le chapitre 1 est introuvable."
            );

            return;

        }


        this.annulerTransitionFond();

        this.annulerAttenteChoix();


        this.chapitreActuel =
            0;


        this.sceneActuelle =
            premierChapitre
                .debut;


        this.chapitre =
            premierChapitre;


        this.fondActuel =
            "";


        this.joueur =
            sauvegardeManager
                .creerJoueurParDefaut();


        this.joueur.nom =
            this.demanderNomJoueur();


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .vider ===
                "function"
        ) {

            dialogueManager
                .vider();

        }


        if (
            typeof audioManager !==
                "undefined" &&
            typeof audioManager
                .toutArreter ===
                "function"
        ) {

            audioManager
                .toutArreter();

        }


        this.retirerFond(
            0
        );


        this.verifierSucces();


        this.sauvegarder();


        this.chargerChapitre(
            0,
            this.sceneActuelle
        );

    },


    /*=====================================================
     APPLIQUER UNE SAUVEGARDE
    =====================================================*/

    appliquerSauvegarde(
        sauvegarde
    ) {

        if (
            !sauvegarde
        ) {

            this.nouvellePartie();

            return;

        }


        this.annulerTransitionFond();

        this.annulerAttenteChoix();


        this.chapitreActuel =
            sauvegarde.chapitre ??
            0;


        this.sceneActuelle =
            sauvegarde.scene ||
            "";


        this.fondActuel =
            sauvegarde.fond ||
            "";


        this.joueur = {

            ...sauvegardeManager
                .creerJoueurParDefaut(),

            ...(
                sauvegarde.joueur ||
                {}
            )

        };


        if (
            !this.joueur.nom ||
            String(
                this.joueur.nom
            )
                .trim()
                .toLowerCase() ===
                "joueur"
        ) {

            this.joueur.nom =
                this.demanderNomJoueur();


            this.sauvegarder();

        }


        this.verifierSucces();


        const chapitreSauvegarde =
            chapitresManager
                .obtenir(
                    this.chapitreActuel
                );


        if (
            !chapitreSauvegarde
        ) {

            console.warn(
                "Le chapitre sauvegardé est introuvable. Une nouvelle partie va être lancée."
            );


            this.nouvellePartie();

            return;

        }


        if (
            !this.sceneActuelle ||
            !chapitreSauvegarde
                .scenes?.[
                    this.sceneActuelle
                ]
        ) {

            this.sceneActuelle =
                chapitreSauvegarde
                    .debut;

        }


        if (
            this.fondActuel
        ) {

            this.appliquerFondImmediat(
                this.fondActuel
            );

        }


        this.chargerChapitre(
            this.chapitreActuel,
            this.sceneActuelle
        );

    },


    /*=====================================================
     SAUVEGARDER
    =====================================================*/

    sauvegarder() {

        if (
            typeof sauvegardeManager ===
                "undefined" ||
            typeof sauvegardeManager
                .sauvegarder !==
                "function"
        ) {

            return false;

        }


        if (
            !this.joueur
        ) {

            return false;

        }


        const resultat =
            sauvegardeManager
                .sauvegarder(
                    {

                        chapitre:
                            this.chapitreActuel,

                        scene:
                            this.sceneActuelle,

                        joueur:
                            this.joueur,

                        fond:
                            this.fondActuel ||
                            "",

                        musique:
                            typeof audioManager !==
                            "undefined"

                                ? audioManager
                                    .musiqueActuelle ||
                                    ""

                                : "",

                        ambiance:
                            typeof audioManager !==
                            "undefined"

                                ? audioManager
                                    .ambianceActuelle ||
                                    ""

                                : ""

                    }
                );


        return resultat ===
            true;

    },


    /*=====================================================
     VÉRIFIER LES SUCCÈS
    =====================================================*/

    verifierSucces() {

        if (
            typeof succesManager ===
                "undefined" ||
            succesManager ===
                null ||
            typeof succesManager
                .verifierConditions !==
                "function" ||
            !this.joueur
        ) {

            return;

        }


        try {

            succesManager
                .verifierConditions(
                    this.joueur
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur pendant la vérification des succès :",
                erreur
            );

        }

    },


    /*=====================================================
     VÉRIFIER SI LA GALERIE EST DISPONIBLE
    =====================================================*/

    galerieDisponible() {

        return (

            typeof galerieManager !==
                "undefined" &&

            galerieManager !==
                null &&

            typeof galerieManager
                .debloquer ===
                "function"

        );

    },


    /*=====================================================
     DÉBLOQUER UN MÉDIA DE GALERIE
    =====================================================*/

    debloquerGalerie(
        valeur
    ) {

        if (
            !valeur ||
            !this.galerieDisponible()
        ) {

            return false;

        }


        if (
            Array.isArray(
                valeur
            )
        ) {

            let debloque =
                false;


            valeur.forEach(
                id => {

                    if (
                        this.debloquerGalerie(
                            id
                        )
                    ) {

                        debloque =
                            true;

                    }

                }
            );


            return debloque;

        }


        const id =
            String(
                valeur
            )
                .trim();


        if (
            !id
        ) {

            return false;

        }


        try {

            return galerieManager
                .debloquer(
                    id
                );

        }
        catch (
            erreur
        ) {

            console.error(
                `Erreur pendant le déblocage du média "${id}" :`,
                erreur
            );


            return false;

        }

    },


    /*=====================================================
     GÉRER LA GALERIE D'UN ÉLÉMENT
    =====================================================*/

    gererGalerieElement(
        element
    ) {

        if (
            !element ||
            typeof element !==
                "object"
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    element,
                    "galerie"
                )
        ) {

            return false;

        }


        return this.debloquerGalerie(
            element.galerie
        );

    },


    /*=====================================================
     CHARGER UN CHAPITRE
    =====================================================*/

    chargerChapitre(
        index,
        sceneDemandee = null
    ) {

        const indexChapitre =
            Number(
                index
            );


        if (
            !Number.isInteger(
                indexChapitre
            ) ||
            indexChapitre < 0
        ) {

            console.error(
                "moteur.js : index de chapitre invalide :",
                index
            );

            return false;

        }


        const chapitre =
            chapitresManager
                .obtenir(
                    indexChapitre
                );


        if (
            !chapitre
        ) {

            this.afficherErreur(
                `Le chapitre ${indexChapitre + 1} est introuvable.`
            );

            return false;

        }


        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        this.chapitreActuel =
            indexChapitre;


        this.chapitre =
            chapitre;


        const elementTitre =
            document.getElementById(
                "titre"
            );


        if (
            elementTitre
        ) {

            elementTitre.textContent =
                chapitre.titre ||
                `Chapitre ${indexChapitre + 1}`;

        }


        this.gererGalerieElement(
            chapitre
        );


        this.gererFondChapitre(
            chapitre
        );


        this.gererAudioChapitre(
            chapitre
        );


        let sceneCible =
            sceneDemandee ||
            chapitre.debut;


        if (
            !sceneCible ||
            !chapitre.scenes?.[
                sceneCible
            ]
        ) {

            console.warn(
                `moteur.js : scène "${sceneCible}" introuvable dans le chapitre ${indexChapitre + 1}.`
            );


            sceneCible =
                chapitre.debut;

        }


        if (
            !sceneCible ||
            !chapitre.scenes?.[
                sceneCible
            ]
        ) {

            this.afficherErreur(
                `Le chapitre ${indexChapitre + 1} ne possède pas de scène de départ valide.`
            );

            return false;

        }


        this.chargerScene(
            sceneCible
        );


        return true;

    },
        /*=====================================================
     CHARGER UNE SCÈNE
    =====================================================*/

    async chargerScene(
        idScene
    ) {

        if (
            !this.chapitre ||
            !this.chapitre.scenes
        ) {

            console.error(
                "moteur.js : aucun chapitre actif."
            );

            return false;

        }


        if (
            !idScene
        ) {

            console.error(
                "moteur.js : identifiant de scène manquant."
            );

            return false;

        }


        const scene =
            this.chapitre
                .scenes[
                    idScene
                ];


        if (
            !scene
        ) {

            console.error(
                `moteur.js : scène introuvable : "${idScene}".`
            );


            this.afficherErreur(
                `La scène "${idScene}" est introuvable.`
            );

            return false;

        }


        /*---------------------------------------------
         ANNULER LES ÉTATS DE LA SCÈNE PRÉCÉDENTE
        ---------------------------------------------*/

        this.annulerAttenteChoix();


        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur fermeture popup choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         ENREGISTRER LA SCÈNE ACTIVE
        ---------------------------------------------*/

        this.sceneActuelle =
            idScene;


        console.log(
            `Chargement de la scène : ${idScene}`
        );


        /*---------------------------------------------
         GALERIE DE LA SCÈNE
        ---------------------------------------------*/

        this.gererGalerieElement(
            scene
        );


        /*---------------------------------------------
         EFFETS DE SCÈNE
        ---------------------------------------------*/

        if (
            scene.effet &&
            typeof scene.effet ===
                "object"
        ) {

            this.appliquerEffets(
                scene.effet
            );

        }


        /*---------------------------------------------
         SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
         CONDITIONS DE REDIRECTION
        ---------------------------------------------*/

        if (
            Array.isArray(
                scene.conditions
            ) &&
            scene.conditions.length >
                0
        ) {

            const destination =
                this.evaluerConditionsScene(
                    scene.conditions
                );


            if (
                destination
            ) {

                this.sauvegarder();


                /*
                 IMPORTANT :
                 une redirection peut pointer
                 vers une scène OU un chapitre.
                */

                await this.gererDestination(
                    destination
                );


                return true;

            }

        }


        /*---------------------------------------------
         FOND DE LA SCÈNE
        ---------------------------------------------*/

        this.gererFondScene(
            scene
        );


        /*---------------------------------------------
         AUDIO DE LA SCÈNE
        ---------------------------------------------*/

        this.gererAudioScene(
            scene
        );


        /*---------------------------------------------
         SAUVEGARDE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
         DIALOGUES
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .afficherScene ===
                "function"
        ) {

            try {

                await dialogueManager
                    .afficherScene(
                        scene
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage de la scène :",
                    erreur
                );

            }

        }
        else {

            console.warn(
                "moteur.js : dialogueManager.afficherScene() est indisponible."
            );

        }


        /*
         Une autre scène peut avoir été chargée
         pendant l'affichage des dialogues.
        */

        if (
            this.sceneActuelle !==
                idScene
        ) {

            return true;

        }


        /*---------------------------------------------
         FIN D'AFFICHAGE
        ---------------------------------------------*/

        this.terminerAffichageScene(
            scene
        );


        return true;

    },


    /*=====================================================
     GÉRER UNE DESTINATION

     Fonction centrale.

     Une destination JSON peut être :

     "discussionEva"
         -> scène du chapitre actuel

     "chapitre2"
         -> chapitre 2

     "chapitre13"
         -> chapitre 13

     "finJeu"
         -> fin du jeu

     Tous les "next" du moteur doivent passer
     par cette fonction.
    =====================================================*/

    async gererDestination(
        destination
    ) {

        if (
            destination ===
                null ||
            destination ===
                undefined
        ) {

            console.warn(
                "moteur.js : destination manquante."
            );

            return false;

        }


        const destinationTexte =
            String(
                destination
            )
                .trim();


        if (
            !destinationTexte
        ) {

            console.warn(
                "moteur.js : destination vide."
            );

            return false;

        }


        console.log(
            "moteur.js : destination :",
            destinationTexte
        );


        /*---------------------------------------------
         FIN DU JEU
        ---------------------------------------------*/

        if (
            destinationTexte ===
                "finJeu" ||
            destinationTexte ===
                "terminerJeu"
        ) {

            this.terminerJeu();

            return true;

        }


        /*---------------------------------------------
         CHANGEMENT DE CHAPITRE

         Exemples :
         chapitre2
         chapitre3
         chapitre13
        ---------------------------------------------*/

        const correspondanceChapitre =
            destinationTexte.match(
                /^chapitre(\d+)$/i
            );


        if (
            correspondanceChapitre
        ) {

            const numeroChapitre =
                Number.parseInt(
                    correspondanceChapitre[
                        1
                    ],
                    10
                );


            if (
                !Number.isInteger(
                    numeroChapitre
                ) ||
                numeroChapitre <
                    1
            ) {

                this.afficherErreur(
                    `Destination de chapitre invalide : "${destinationTexte}".`
                );

                return false;

            }


            const indexChapitre =
                numeroChapitre -
                1;


            const chapitreCible =
                chapitresManager
                    .obtenir(
                        indexChapitre
                    );


            if (
                !chapitreCible
            ) {

                this.afficherErreur(
                    `Le chapitre ${numeroChapitre} est introuvable.`
                );

                return false;

            }


            /*
             Lorsque le JSON demande explicitement
             "chapitre2", on charge le début
             du chapitre correspondant.
            */

            return this.chargerChapitre(
                indexChapitre,
                chapitreCible.debut
            );

        }


        /*---------------------------------------------
         SCÈNE DU CHAPITRE ACTUEL
        ---------------------------------------------*/

        return await this.chargerScene(
            destinationTexte
        );

    },


    /*=====================================================
     GÉRER LE FOND DU CHAPITRE
    =====================================================*/

    gererFondChapitre(
        chapitre
    ) {

        if (
            !chapitre ||
            typeof chapitre !==
                "object"
        ) {

            return false;

        }


        if (
            !chapitre.fond
        ) {

            return false;

        }


        /*
         Le fond du chapitre sert de valeur
         par défaut.

         On évite de remplacer immédiatement
         un fond restauré depuis une sauvegarde.
        */

        if (
            this.fondActuel
        ) {

            return false;

        }


        const duree =
            this.obtenirDureeTransitionFond(
                chapitre
            );


        return this.changerFond(
            chapitre.fond,
            duree,
            chapitre
        );

    },


    /*=====================================================
     GÉRER LE FOND D'UNE SCÈNE
    =====================================================*/

    gererFondScene(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         RETIRER LE FOND
        ---------------------------------------------*/

        if (
            scene.fond ===
                false ||
            scene.fond ===
                null
        ) {

            return this.retirerFond(
                this.obtenirDureeTransitionFond(
                    scene
                )
            );

        }


        /*---------------------------------------------
         NOUVEAU FOND
        ---------------------------------------------*/

        if (
            scene.fond
        ) {

            return this.changerFond(
                scene.fond,
                this.obtenirDureeTransitionFond(
                    scene
                ),
                scene
            );

        }


        /*---------------------------------------------
         FOND DU CHAPITRE EN SECOURS
        ---------------------------------------------*/

        if (
            !this.fondActuel &&
            this.chapitre?.fond
        ) {

            return this.changerFond(
                this.chapitre.fond,
                this.obtenirDureeTransitionFond(
                    this.chapitre
                ),
                this.chapitre
            );

        }


        return false;

    },


    /*=====================================================
     GÉRER LE FOND D'UN DIALOGUE
    =====================================================*/

    gererFondDialogue(
        dialogue
    ) {

        if (
            !dialogue ||
            typeof dialogue !==
                "object"
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    dialogue,
                    "fond"
                )
        ) {

            return false;

        }


        /*---------------------------------------------
         RETIRER LE FOND
        ---------------------------------------------*/

        if (
            dialogue.fond ===
                false ||
            dialogue.fond ===
                null ||
            dialogue.fond ===
                ""
        ) {

            return this.retirerFond(
                this.obtenirDureeTransitionFond(
                    dialogue
                )
            );

        }


        /*---------------------------------------------
         CHANGER LE FOND
        ---------------------------------------------*/

        return this.changerFond(
            dialogue.fond,
            this.obtenirDureeTransitionFond(
                dialogue
            ),
            dialogue
        );

    },


    /*=====================================================
     GÉRER L'AUDIO DU CHAPITRE
    =====================================================*/

    gererAudioChapitre(
        chapitre
    ) {

        if (
            !chapitre ||
            typeof chapitre !==
                "object" ||
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return;

        }


        /*---------------------------------------------
         MUSIQUE
        ---------------------------------------------*/

        if (
            chapitre.musique
        ) {

            if (
                typeof audioManager
                    .jouerMusique ===
                    "function"
            ) {

                try {

                    audioManager
                        .jouerMusique(
                            chapitre.musique
                        );

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur musique chapitre :",
                        erreur
                    );

                }

            }

        }


        /*---------------------------------------------
         AMBIANCE
        ---------------------------------------------*/

        if (
            chapitre.ambiance
        ) {

            if (
                typeof audioManager
                    .jouerAmbiance ===
                    "function"
            ) {

                try {

                    audioManager
                        .jouerAmbiance(
                            chapitre.ambiance
                        );

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur ambiance chapitre :",
                        erreur
                    );

                }

            }

        }

    },


    /*=====================================================
     GÉRER L'AUDIO D'UNE SCÈNE
    =====================================================*/

    gererAudioScene(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object" ||
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return;

        }


        /*---------------------------------------------
         MUSIQUE
        ---------------------------------------------*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "musique"
                )
        ) {

            if (
                scene.musique ===
                    false ||
                scene.musique ===
                    null ||
                scene.musique ===
                    ""
            ) {

                if (
                    typeof audioManager
                        .arreterMusique ===
                        "function"
                ) {

                    audioManager
                        .arreterMusique();

                }

            }
            else if (
                typeof audioManager
                    .jouerMusique ===
                    "function"
            ) {

                try {

                    audioManager
                        .jouerMusique(
                            scene.musique
                        );

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur musique scène :",
                        erreur
                    );

                }

            }

        }


        /*---------------------------------------------
         AMBIANCE
        ---------------------------------------------*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "ambiance"
                )
        ) {

            if (
                scene.ambiance ===
                    false ||
                scene.ambiance ===
                    null ||
                scene.ambiance ===
                    ""
            ) {

                if (
                    typeof audioManager
                        .arreterAmbiance ===
                        "function"
                ) {

                    audioManager
                        .arreterAmbiance();

                }

            }
            else if (
                typeof audioManager
                    .jouerAmbiance ===
                    "function"
            ) {

                try {

                    audioManager
                        .jouerAmbiance(
                            scene.ambiance
                        );

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur ambiance scène :",
                        erreur
                    );

                }

            }

        }


        /*---------------------------------------------
         EFFET SONORE DE SCÈNE
        ---------------------------------------------*/

        if (
            scene.son &&
            typeof audioManager
                .jouerSon ===
                "function"
        ) {

            try {

                audioManager
                    .jouerSon(
                        scene.son
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur effet sonore scène :",
                    erreur
                );

            }

        }

    },


    /*=====================================================
     ÉVALUER LES CONDITIONS D'UNE SCÈNE
    =====================================================*/

    evaluerConditionsScene(
        conditions
    ) {

        if (
            !Array.isArray(
                conditions
            ) ||
            conditions.length ===
                0
        ) {

            return null;

        }


        let destinationSinon =
            null;


        for (
            const condition
            of conditions
        ) {

            if (
                !condition ||
                typeof condition !==
                    "object"
            ) {

                continue;

            }


            /*-----------------------------------------
             SINON
            -----------------------------------------*/

            if (
                condition.sinon
            ) {

                destinationSinon =
                    condition.sinon;

                continue;

            }


            /*-----------------------------------------
             SI
            -----------------------------------------*/

            if (
                condition.si &&
                condition.next
            ) {

                const valide =
                    this.verifierObjetCondition(
                        condition.si
                    );


                if (
                    valide
                ) {

                    return condition.next;

                }

            }

        }


        return destinationSinon;

    },


    /*=====================================================
     VÉRIFIER UNE CONDITION AU FORMAT HISTORIQUE

     Exemple utilisé dans tes premiers chapitres :

     "condition": {
         "variable": "rencontreZoe",
         "operateur": "===",
         "valeur": true
     }
    =====================================================*/

    verifierConditionClassique(
        condition
    ) {

        if (
            !condition ||
            typeof condition !==
                "object" ||
            !this.joueur
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    condition,
                    "variable"
                )
        ) {

            return false;

        }


        const variable =
            condition.variable;


        const valeurActuelle =
            this.joueur[
                variable
            ];


        const valeurAttendue =
            condition.valeur;


        const operateur =
            condition.operateur ||
            "==";


        switch (
            operateur
        ) {

            case ">":

                return (
                    valeurActuelle >
                    valeurAttendue
                );


            case ">=":

                return (
                    valeurActuelle >=
                    valeurAttendue
                );


            case "<":

                return (
                    valeurActuelle <
                    valeurAttendue
                );


            case "<=":

                return (
                    valeurActuelle <=
                    valeurAttendue
                );


            case "===":

                return (
                    valeurActuelle ===
                    valeurAttendue
                );


            case "!==":

                return (
                    valeurActuelle !==
                    valeurAttendue
                );


            case "!=":

                return (
                    valeurActuelle !=
                    valeurAttendue
                );


            case "==":

                return (
                    valeurActuelle ==
                    valeurAttendue
                );


            default:

                console.warn(
                    `moteur.js : opérateur de condition inconnu : "${operateur}".`
                );


                return (
                    valeurActuelle ==
                    valeurAttendue
                );

        }

    },


    /*=====================================================
     VÉRIFIER UN OBJET DE CONDITION

     Deux formats sont acceptés.

     FORMAT 1 :

     {
         "rencontreZoe": true
     }

     FORMAT 2 :

     {
         "variable": "relationEva",
         "operateur": ">=",
         "valeur": 5
     }
    =====================================================*/

    verifierObjetCondition(
        condition
    ) {

        if (
            !condition ||
            typeof condition !==
                "object" ||
            !this.joueur
        ) {

            return false;

        }


        /*---------------------------------------------
         FORMAT HISTORIQUE
        ---------------------------------------------*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    condition,
                    "variable"
                )
        ) {

            return this
                .verifierConditionClassique(
                    condition
                );

        }


        /*---------------------------------------------
         FORMAT MODERNE
        ---------------------------------------------*/

        return Object
            .entries(
                condition
            )
            .every(
                ([
                    cle,
                    attendu
                ]) => {

                    const valeur =
                        this.joueur[
                            cle
                        ];


                    /*---------------------------------
                     VALEUR SIMPLE

                     Exemple :
                     {
                         "rencontreEva": true
                     }
                    ---------------------------------*/

                    if (
                        attendu ===
                            null ||
                        typeof attendu !==
                            "object" ||
                        Array.isArray(
                            attendu
                        )
                    ) {

                        return (
                            valeur ===
                            attendu
                        );

                    }


                    /*---------------------------------
                     MINIMUM

                     {
                         "relationEva": {
                             "min": 5
                         }
                     }
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "min"
                            ) &&
                        Number(
                            valeur
                        ) <
                        Number(
                            attendu.min
                        )
                    ) {

                        return false;

                    }


                    /*---------------------------------
                     MAXIMUM
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "max"
                            ) &&
                        Number(
                            valeur
                        ) >
                        Number(
                            attendu.max
                        )
                    ) {

                        return false;

                    }


                    /*---------------------------------
                     ÉGAL
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "egal"
                            ) &&
                        valeur !==
                            attendu.egal
                    ) {

                        return false;

                    }


                    /*---------------------------------
                     DIFFÉRENT
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "different"
                            ) &&
                        valeur ===
                            attendu.different
                    ) {

                        return false;

                    }


                    return true;

                }
            );

    },
        /*=====================================================
     FIN DE L'AFFICHAGE D'UNE SCÈNE
    =====================================================*/

    terminerAffichageScene(
        scene
    ) {

        if (
            !scene
        ) {

            return;

        }


        /*---------------------------------------------
         CHOIX
        ---------------------------------------------*/

        if (
            Array.isArray(
                scene.choix
            ) &&
            scene.choix.length >
                0
        ) {

            this.preparerChoix(
                scene.choix,
                scene
            );

            return;

        }


        /*---------------------------------------------
         SCÈNE / CHAPITRE SUIVANT
        ---------------------------------------------*/

        if (
            scene.next
        ) {

            this.gererDestination(
                scene.next
            );

            return;

        }


        /*---------------------------------------------
         FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            scene.finChapitre ===
                true ||
            scene.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();

            return;

        }


        /*---------------------------------------------
         FIN DU JEU
        ---------------------------------------------*/

        if (
            scene.finJeu ===
                true ||
            scene.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                scene
            );

            return;

        }


        /*---------------------------------------------
         SAUVEGARDE FINALE DE LA SCÈNE
        ---------------------------------------------*/

        this.sauvegarder();

    },


    /*=====================================================
     PRÉPARER LES CHOIX
    =====================================================*/

    preparerChoix(
        listeChoix,
        scene = null
    ) {

        if (
            !Array.isArray(
                listeChoix
            ) ||
            listeChoix.length ===
                0
        ) {

            return;

        }


        /*---------------------------------------------
         ANNULER UN ANCIEN TIMER DE CHOIX
        ---------------------------------------------*/

        this.annulerAttenteChoix();


        /*---------------------------------------------
         FILTRER LES CHOIX DISPONIBLES
        ---------------------------------------------*/

        const choixDisponibles =
            listeChoix
                .filter(
                    choix => {

                        return this
                            .choixEstDisponible(
                                choix
                            );

                    }
                );


        /*---------------------------------------------
         AUCUN CHOIX DISPONIBLE
        ---------------------------------------------*/

        if (
            choixDisponibles.length ===
                0
        ) {

            console.warn(
                "moteur.js : aucun choix disponible pour cette scène."
            );


            /*
             Si un next existe,
             la scène peut continuer automatiquement.

             IMPORTANT :
             on passe aussi par gererDestination()
             pour accepter un changement de chapitre.
            */

            if (
                scene?.next
            ) {

                this.gererDestination(
                    scene.next
                );

            }


            return;

        }


        /*---------------------------------------------
         DÉLAI AVANT AFFICHAGE
        ---------------------------------------------*/

        const delai =
            this.obtenirDelaiChoix(
                scene
            );


        if (
            delai >
            0
        ) {

            this.timerChoix =
                setTimeout(
                    () => {

                        this.timerChoix =
                            null;


                        this.afficherChoix(
                            choixDisponibles
                        );

                    },
                    delai
                );


            return;

        }


        this.afficherChoix(
            choixDisponibles
        );

    },


    /*=====================================================
     VÉRIFIER SI UN CHOIX EST DISPONIBLE
    =====================================================*/

    choixEstDisponible(
        choix
    ) {

        if (
            !choix ||
            typeof choix !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         CHOIX DÉSACTIVÉ
        ---------------------------------------------*/

        if (
            choix.actif ===
                false
        ) {

            return false;

        }


        /*---------------------------------------------
         CHOIX VERROUILLÉ EXPLICITEMENT
        ---------------------------------------------*/

        if (
            choix.verrouille ===
                true
        ) {

            return false;

        }


        /*---------------------------------------------
         CONDITION SIMPLE
        ---------------------------------------------*/

        if (
            choix.condition &&
            typeof choix.condition ===
                "object"
        ) {

            if (
                !this.verifierObjetCondition(
                    choix.condition
                )
            ) {

                return false;

            }

        }


        /*---------------------------------------------
         CONDITION "si"
        ---------------------------------------------*/

        if (
            choix.si &&
            typeof choix.si ===
                "object"
        ) {

            if (
                !this.verifierObjetCondition(
                    choix.si
                )
            ) {

                return false;

            }

        }


        return true;

    },


    /*=====================================================
     OBTENIR LE DÉLAI AVANT LES CHOIX
    =====================================================*/

    obtenirDelaiChoix(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return 0;

        }


        const valeurs = [

            scene.delaiChoix,

            scene.choixDelai,

            scene.delayChoix

        ];


        for (
            const valeur
            of valeurs
        ) {

            const nombre =
                Number(
                    valeur
                );


            if (
                Number.isFinite(
                    nombre
                ) &&
                nombre >= 0
            ) {

                return nombre;

            }

        }


        return 0;

    },


    /*=====================================================
     AFFICHER LES CHOIX
    =====================================================*/

    afficherChoix(
        listeChoix
    ) {

        if (
            typeof choixManager ===
                "undefined" ||
            choixManager ===
                null ||
            typeof choixManager
                .afficher !==
                "function"
        ) {

            console.error(
                "moteur.js : choixManager est introuvable."
            );

            return;

        }


        const choixPourInterface =
            listeChoix
                .map(
                    choix => {

                        return {

                            ...choix,

                            action:
                                () => {

                                    this.traiterChoix(
                                        choix
                                    );

                                }

                        };

                    }
                );


        try {

            choixManager
                .afficher(
                    choixPourInterface
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur pendant l'affichage des choix :",
                erreur
            );

        }

    },


    /*=====================================================
     TRAITER UN CHOIX
    =====================================================*/

    async traiterChoix(
        choix
    ) {

        if (
            !choix ||
            typeof choix !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         VÉRIFICATION FINALE DE DISPONIBILITÉ
        ---------------------------------------------*/

        if (
            !this.choixEstDisponible(
                choix
            )
        ) {

            return false;

        }


        /*---------------------------------------------
         FERMER LA POPUP
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur fermeture popup choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         MESSAGE DU JOUEUR ASSOCIÉ AU CHOIX
        ---------------------------------------------*/

        if (
            choix.message
        ) {

            await this
                .afficherMessageChoix(
                    choix.message
                );

        }


        /*---------------------------------------------
         GALERIE DU CHOIX
        ---------------------------------------------*/

        this.gererGalerieElement(
            choix
        );


        /*---------------------------------------------
         EFFETS DU CHOIX
        ---------------------------------------------*/

        if (
            choix.effet &&
            typeof choix.effet ===
                "object"
        ) {

            this.appliquerEffets(
                choix.effet
            );

        }


        /*---------------------------------------------
         SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
         SAUVEGARDE IMMÉDIATE APRÈS LE CHOIX
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
         POURSUITE
        ---------------------------------------------*/

        await this
            .poursuivreApresChoix(
                choix
            );


        return true;

    },


    /*=====================================================
     AFFICHER LE MESSAGE ASSOCIÉ AU CHOIX
    =====================================================*/

    async afficherMessageChoix(
        message
    ) {

        if (
            !message
        ) {

            return null;

        }


        /*---------------------------------------------
         CHAÎNE SIMPLE
        ---------------------------------------------*/

        if (
            typeof message ===
                "string"
        ) {

            if (
                typeof dialogueManager !==
                    "undefined" &&
                dialogueManager !==
                    null &&
                typeof dialogueManager
                    .ajouterMessage ===
                    "function"
            ) {

                return dialogueManager
                    .ajouterMessage(
                        message,
                        "joueur",
                        {}
                    );

            }


            return null;

        }


        if (
            typeof message !==
                "object"
        ) {

            return null;

        }


        /*---------------------------------------------
         GALERIE DU MESSAGE
        ---------------------------------------------*/

        if (
            typeof dialogueManager ===
                "undefined" ||
            dialogueManager ===
                null
        ) {

            this.gererGalerieElement(
                message
            );

        }


        /*---------------------------------------------
         FOND DU MESSAGE
        ---------------------------------------------*/

        this.gererFondDialogue(
            message
        );


        /*---------------------------------------------
         API MODERNE
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .afficher ===
                "function"
        ) {

            try {

                return await dialogueManager
                    .afficher(
                        {

                            personnage:
                                message.personnage ||
                                "joueur",

                            ...message

                        },

                        this.joueur
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage du message de choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         API DE SECOURS
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .ajouterMessage ===
                "function"
        ) {

            const texte =
                message.texte ||
                "";


            if (
                texte
            ) {

                return dialogueManager
                    .ajouterMessage(
                        texte,
                        message.personnage ||
                            "joueur",
                        message
                    );

            }

        }


        return null;

    },


    /*=====================================================
     POURSUIVRE APRÈS UN CHOIX
    =====================================================*/

    async poursuivreApresChoix(
        choix
    ) {

        if (
            !choix
        ) {

            return;

        }


        /*---------------------------------------------
         CONDITIONS DE REDIRECTION
        ---------------------------------------------*/

        if (
            Array.isArray(
                choix.conditions
            ) &&
            choix.conditions.length >
                0
        ) {

            const destination =
                this.evaluerConditionsScene(
                    choix.conditions
                );


            if (
                destination
            ) {

                /*
                 IMPORTANT :
                 une condition de choix peut maintenant
                 pointer vers :
                 - une scène ;
                 - un chapitre.
                */

                await this.gererDestination(
                    destination
                );

                return;

            }

        }


        /*---------------------------------------------
         NEXT
        ---------------------------------------------*/

        if (
            choix.next
        ) {

            /*
             CORRECTION PRINCIPALE :

             Avant :
             chargerScene(choix.next)

             Maintenant :
             gererDestination(choix.next)

             Donc :
             "chapitre2" n'est plus recherché
             comme une scène.
            */

            await this.gererDestination(
                choix.next
            );

            return;

        }


        /*---------------------------------------------
         FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            choix.finChapitre ===
                true ||
            choix.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();

            return;

        }


        /*---------------------------------------------
         FIN DU JEU
        ---------------------------------------------*/

        if (
            choix.finJeu ===
                true ||
            choix.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                choix
            );

            return;

        }

    },


    /*=====================================================
     APPLIQUER LES EFFETS
    =====================================================*/

    appliquerEffets(
        effets
    ) {

        if (
            !effets ||
            typeof effets !==
                "object" ||
            !this.joueur
        ) {

            return false;

        }


        /*---------------------------------------------
         GESTIONNAIRE EXTERNE SI DISPONIBLE
        ---------------------------------------------*/

        if (
            typeof conditionsManager !==
                "undefined" &&
            conditionsManager !==
                null &&
            typeof conditionsManager
                .appliquerEffet ===
                "function"
        ) {

            try {

                conditionsManager
                    .appliquerEffet(
                        effets,
                        this.joueur
                    );


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur conditionsManager.appliquerEffet() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         APPLICATION INTERNE
        ---------------------------------------------*/

        for (
            const [
                variable,
                modification
            ]
            of Object.entries(
                effets
            )
        ) {

            /*-----------------------------------------
             NOMBRE = MODIFICATION RELATIVE

             Exemple :
             "relationEva": 2
             ajoute +2.
            -----------------------------------------*/

            if (
                typeof modification ===
                    "number"
            ) {

                const ancienneValeur =
                    Number(
                        this.joueur[
                            variable
                        ]
                    );


                this.joueur[
                    variable
                ] =
                    (
                        Number.isFinite(
                            ancienneValeur
                        )
                            ? ancienneValeur
                            : 0
                    ) +
                    modification;


                continue;

            }


            /*-----------------------------------------
             OBJET SPÉCIAL
            -----------------------------------------*/

            if (
                modification &&
                typeof modification ===
                    "object" &&
                !Array.isArray(
                    modification
                )
            ) {

                /*-------------------------------------
                 AJOUT
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "ajouter"
                        )
                ) {

                    const ancienneValeur =
                        Number(
                            this.joueur[
                                variable
                            ]
                        );


                    const ajout =
                        Number(
                            modification.ajouter
                        );


                    this.joueur[
                        variable
                    ] =
                        (
                            Number.isFinite(
                                ancienneValeur
                            )
                                ? ancienneValeur
                                : 0
                        ) +
                        (
                            Number.isFinite(
                                ajout
                            )
                                ? ajout
                                : 0
                        );


                    continue;

                }


                /*-------------------------------------
                 RETIRER
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "retirer"
                        )
                ) {

                    const ancienneValeur =
                        Number(
                            this.joueur[
                                variable
                            ]
                        );


                    const retrait =
                        Number(
                            modification.retirer
                        );


                    this.joueur[
                        variable
                    ] =
                        (
                            Number.isFinite(
                                ancienneValeur
                            )
                                ? ancienneValeur
                                : 0
                        ) -
                        (
                            Number.isFinite(
                                retrait
                            )
                                ? retrait
                                : 0
                        );


                    continue;

                }


                /*-------------------------------------
                 DÉFINIR
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "definir"
                        )
                ) {

                    this.joueur[
                        variable
                    ] =
                        modification.definir;


                    continue;

                }

            }


            /*-----------------------------------------
             BOOLÉEN / CHAÎNE / NULL / TABLEAU
            -----------------------------------------*/

            this.joueur[
                variable
            ] =
                modification;

        }


        return true;

    },


    /*=====================================================
     ANNULER L'ATTENTE DES CHOIX
    =====================================================*/

    annulerAttenteChoix() {

        if (
            this.timerChoix !==
                null
        ) {

            clearTimeout(
                this.timerChoix
            );


            this.timerChoix =
                null;

        }


        if (
            this.boutonChoix
        ) {

            try {

                this.boutonChoix
                    .remove();

            }
            catch (
                erreur
            ) {

                /* Rien */

            }


            this.boutonChoix =
                null;

        }

    },
        /*=====================================================
     OBTENIR LA DURÉE DE TRANSITION D'UN FOND
    =====================================================*/

    obtenirDureeTransitionFond(
        element
    ) {

        if (
            !element ||
            typeof element !==
                "object"
        ) {

            return this
                .dureeTransitionFondParDefaut;

        }


        const valeurs = [

            element.transitionFond,

            element.dureeFond,

            element.fondDuree,

            element.delaiFond

        ];


        for (
            const valeur
            of valeurs
        ) {

            const nombre =
                Number(
                    valeur
                );


            if (
                Number.isFinite(
                    nombre
                ) &&
                nombre >= 0
            ) {

                return nombre;

            }

        }


        return this
            .dureeTransitionFondParDefaut;

    },


    /*=====================================================
     NORMALISER UN NOM DE FOND
    =====================================================*/

    normaliserNomFond(
        fond
    ) {

        if (
            fond ===
                null ||
            fond ===
                undefined
        ) {

            return "";

        }


        return String(
            fond
        )
            .trim();

    },


    /*=====================================================
     VÉRIFIER SI LE FOND POSSÈDE UNE EXTENSION
    =====================================================*/

    fondPossedeExtension(
        fond
    ) {

        if (
            !fond
        ) {

            return false;

        }


        return /\.(png|jpe?g|webp|gif|avif)$/i
            .test(
                fond
            );

    },


    /*=====================================================
     VÉRIFIER SI LE FOND EST UN CHEMIN
    =====================================================*/

    fondEstCheminComplet(
        fond
    ) {

        if (
            !fond
        ) {

            return false;

        }


        return (

            fond.startsWith(
                "http://"
            ) ||

            fond.startsWith(
                "https://"
            ) ||

            fond.startsWith(
                "/"
            ) ||

            fond.startsWith(
                "./"
            ) ||

            fond.startsWith(
                "../"
            ) ||

            fond.includes(
                "/"
            )

        );

    },


    /*=====================================================
     CONSTRUIRE LE CHEMIN D'UN FOND
    =====================================================*/

    construireCheminFond(
        fond
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return "";

        }


        /*---------------------------------------------
         CHEMIN DÉJÀ COMPLET
        ---------------------------------------------*/

        if (
            this.fondEstCheminComplet(
                nomFond
            )
        ) {

            return nomFond;

        }


        /*---------------------------------------------
         NOM AVEC EXTENSION
        ---------------------------------------------*/

        if (
            this.fondPossedeExtension(
                nomFond
            )
        ) {

            return (
                this.cheminFonds +
                nomFond
            );

        }


        /*---------------------------------------------
         NOM SIMPLE
        ---------------------------------------------*/

        return (
            this.cheminFonds +
            nomFond +
            "." +
            this.extensionFondParDefaut
        );

    },


    /*=====================================================
     OBTENIR LES OPTIONS VISUELLES DU FOND
    =====================================================*/

    obtenirOptionsFond(
        source = null
    ) {

        if (
            !source ||
            typeof source !==
                "object"
        ) {

            return {

                position:
                    "center",

                taille:
                    "cover",

                repetition:
                    "no-repeat",

                filtre:
                    "",

                opacite:
                    1

            };

        }


        const options =
            source.optionsFond &&
            typeof source.optionsFond ===
                "object"

                ? source.optionsFond

                : {};


        return {

            position:

                options.position ||

                source.positionFond ||

                "center",


            taille:

                options.taille ||

                options.size ||

                source.tailleFond ||

                source.fondTaille ||

                "cover",


            repetition:

                options.repetition ||

                source.repetitionFond ||

                "no-repeat",


            filtre:

                options.filtre ||

                source.filtreFond ||

                "",


            opacite:

                Number.isFinite(
                    Number(
                        options.opacite
                    )
                )

                    ? Math.max(
                        0,
                        Math.min(
                            1,
                            Number(
                                options.opacite
                            )
                        )
                    )

                    : Number.isFinite(
                        Number(
                            source.opaciteFond
                        )
                    )

                        ? Math.max(
                            0,
                            Math.min(
                                1,
                                Number(
                                    source.opaciteFond
                                )
                            )
                        )

                        : 1

        };

    },


    /*=====================================================
     APPLIQUER LES OPTIONS VISUELLES DU FOND
    =====================================================*/

    appliquerOptionsFond(
        elementFond,
        source = null
    ) {

        if (
            !elementFond
        ) {

            return;

        }


        const options =
            this.obtenirOptionsFond(
                source
            );


        elementFond
            .style
            .backgroundPosition =
            options.position;


        elementFond
            .style
            .backgroundSize =
            options.taille;


        elementFond
            .style
            .backgroundRepeat =
            options.repetition;


        elementFond
            .style
            .filter =
            options.filtre;


        /*
         L'opacité du fond lui-même est distincte
         de l'animation de transition.
        */

        elementFond.dataset
            .opaciteCible =
            String(
                options.opacite
            );

    },


    /*=====================================================
     OBTENIR L'OPACITÉ CIBLE DU FOND
    =====================================================*/

    obtenirOpaciteFond(
        elementFond
    ) {

        if (
            !elementFond
        ) {

            return 1;

        }


        const valeur =
            Number(
                elementFond.dataset
                    .opaciteCible
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 1;

        }


        return Math.max(
            0,
            Math.min(
                1,
                valeur
            )
        );

    },


    /*=====================================================
     PRÉCHARGER UNE IMAGE DE FOND
    =====================================================*/

    prechargerFond(
        chemin
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    !chemin
                ) {

                    reject(
                        new Error(
                            "Chemin de fond vide."
                        )
                    );

                    return;

                }


                const image =
                    new Image();


                image.onload =
                    () => {

                        resolve(
                            chemin
                        );

                    };


                image.onerror =
                    () => {

                        reject(
                            new Error(
                                `Impossible de charger le fond : ${chemin}`
                            )
                        );

                    };


                image.src =
                    chemin;

            }
        );

    },


    /*=====================================================
     CHANGER LE FOND
    =====================================================*/

    changerFond(
        fond,
        duree = null,
        source = null
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return false;

        }


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            console.warn(
                "moteur.js : #fond-jeu est introuvable."
            );

            return false;

        }


        /*---------------------------------------------
         APPLIQUER LES OPTIONS
        ---------------------------------------------*/

        this.appliquerOptionsFond(
            elementFond,
            source
        );


        const opaciteCible =
            this.obtenirOpaciteFond(
                elementFond
            );


        /*---------------------------------------------
         MÊME FOND

         Même si l'image ne change pas,
         les options visuelles peuvent avoir changé.
        ---------------------------------------------*/

        if (
            nomFond ===
                this.fondActuel
        ) {

            elementFond
                .style
                .opacity =
                String(
                    opaciteCible
                );


            return true;

        }


        /*---------------------------------------------
         ANNULER L'ANCIENNE TRANSITION
        ---------------------------------------------*/

        this.annulerTransitionFond();


        /*---------------------------------------------
         DURÉE
        ---------------------------------------------*/

        let dureeTransition =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                dureeTransition
            ) ||
            dureeTransition <
                0
        ) {

            dureeTransition =
                this
                    .dureeTransitionFondParDefaut;

        }


        /*---------------------------------------------
         CHEMIN
        ---------------------------------------------*/

        const chemin =
            this.construireCheminFond(
                nomFond
            );


        if (
            !chemin
        ) {

            return false;

        }


        this.changementFondEnCours =
            true;


        /*---------------------------------------------
         CHANGEMENT IMMÉDIAT
        ---------------------------------------------*/

        if (
            dureeTransition ===
                0
        ) {

            elementFond
                .style
                .transition =
                "none";


            elementFond
                .style
                .backgroundImage =
                `url("${chemin}")`;


            this.appliquerOptionsFond(
                elementFond,
                source
            );


            elementFond
                .style
                .opacity =
                String(
                    this.obtenirOpaciteFond(
                        elementFond
                    )
                );


            elementFond
                .classList
                .remove(
                    "changement-fond"
                );


            elementFond
                .classList
                .add(
                    "fond-charge"
                );


            void elementFond
                .offsetWidth;


            elementFond
                .style
                .transition =
                "";


            this.fondActuel =
                nomFond;


            this.changementFondEnCours =
                false;


            return true;

        }


        /*---------------------------------------------
         PRÉCHARGEMENT
        ---------------------------------------------*/

        this.prechargerFond(
            chemin
        )
            .then(
                () => {

                    if (
                        !this.changementFondEnCours
                    ) {

                        return;

                    }


                    /*---------------------------------
                     FONDU DE SORTIE
                    ---------------------------------*/

                    elementFond
                        .style
                        .transition =
                        `opacity ${dureeTransition}ms ease`;


                    elementFond
                        .classList
                        .add(
                            "changement-fond"
                        );


                    elementFond
                        .classList
                        .remove(
                            "fond-charge"
                        );


                    elementFond
                        .style
                        .opacity =
                        "0";


                    /*---------------------------------
                     CHANGEMENT D'IMAGE
                    ---------------------------------*/

                    this.timerFond =
                        setTimeout(
                            () => {

                                elementFond
                                    .style
                                    .backgroundImage =
                                    `url("${chemin}")`;


                                this.appliquerOptionsFond(
                                    elementFond,
                                    source
                                );


                                this.fondActuel =
                                    nomFond;


                                elementFond
                                    .classList
                                    .remove(
                                        "changement-fond"
                                    );


                                /*---------------------
                                 FONDU D'ENTRÉE
                                ---------------------*/

                                requestAnimationFrame(
                                    () => {

                                        elementFond
                                            .style
                                            .opacity =
                                            String(
                                                this.obtenirOpaciteFond(
                                                    elementFond
                                                )
                                            );


                                        elementFond
                                            .classList
                                            .add(
                                                "fond-charge"
                                            );


                                        this.timerFond =
                                            setTimeout(
                                                () => {

                                                    this.timerFond =
                                                        null;


                                                    this.changementFondEnCours =
                                                        false;


                                                    elementFond
                                                        .style
                                                        .transition =
                                                        "";

                                                },
                                                dureeTransition
                                            );

                                    }
                                );

                            },
                            dureeTransition
                        );

                }
            )
            .catch(
                erreur => {

                    console.error(
                        "moteur.js : erreur pendant le préchargement du fond :",
                        erreur
                    );


                    /*---------------------------------
                     SOLUTION DE SECOURS
                    ---------------------------------*/

                    elementFond
                        .style
                        .backgroundImage =
                        `url("${chemin}")`;


                    this.appliquerOptionsFond(
                        elementFond,
                        source
                    );


                    elementFond
                        .style
                        .opacity =
                        String(
                            this.obtenirOpaciteFond(
                                elementFond
                            )
                        );


                    elementFond
                        .classList
                        .remove(
                            "changement-fond"
                        );


                    elementFond
                        .classList
                        .add(
                            "fond-charge"
                        );


                    this.fondActuel =
                        nomFond;


                    this.changementFondEnCours =
                        false;

                }
            );


        return true;

    },


    /*=====================================================
     APPLIQUER UN FOND IMMÉDIATEMENT

     Utilisé notamment lors du chargement
     d'une sauvegarde.
    =====================================================*/

    appliquerFondImmediat(
        fond,
        source = null
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return false;

        }


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            return false;

        }


        this.annulerTransitionFond();


        const chemin =
            this.construireCheminFond(
                nomFond
            );


        if (
            !chemin
        ) {

            return false;

        }


        elementFond
            .style
            .transition =
            "none";


        elementFond
            .style
            .backgroundImage =
            `url("${chemin}")`;


        this.appliquerOptionsFond(
            elementFond,
            source
        );


        elementFond
            .style
            .opacity =
            String(
                this.obtenirOpaciteFond(
                    elementFond
                )
            );


        elementFond
            .classList
            .remove(
                "changement-fond"
            );


        elementFond
            .classList
            .add(
                "fond-charge"
            );


        void elementFond
            .offsetWidth;


        elementFond
            .style
            .transition =
            "";


        this.fondActuel =
            nomFond;


        this.changementFondEnCours =
            false;


        return true;

    },


    /*=====================================================
     RETIRER LE FOND
    =====================================================*/

    retirerFond(
        duree = 300
    ) {

        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            this.fondActuel =
                "";

            return false;

        }


        this.annulerTransitionFond();


        let dureeTransition =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                dureeTransition
            ) ||
            dureeTransition <
                0
        ) {

            dureeTransition =
                300;

        }


        /*---------------------------------------------
         SUPPRESSION IMMÉDIATE
        ---------------------------------------------*/

        if (
            dureeTransition ===
                0
        ) {

            elementFond
                .style
                .backgroundImage =
                "none";


            elementFond
                .style
                .opacity =
                "1";


            elementFond
                .style
                .filter =
                "";


            elementFond
                .style
                .backgroundPosition =
                "center";


            elementFond
                .style
                .backgroundSize =
                "cover";


            elementFond
                .style
                .backgroundRepeat =
                "no-repeat";


            elementFond
                .classList
                .remove(
                    "changement-fond",
                    "fond-charge"
                );


            elementFond.dataset
                .opaciteCible =
                "1";


            this.fondActuel =
                "";


            this.changementFondEnCours =
                false;


            return true;

        }


        /*---------------------------------------------
         FONDU
        ---------------------------------------------*/

        this.changementFondEnCours =
            true;


        elementFond
            .style
            .transition =
            `opacity ${dureeTransition}ms ease`;


        elementFond
            .style
            .opacity =
            "0";


        elementFond
            .classList
            .add(
                "changement-fond"
            );


        this.timerFond =
            setTimeout(
                () => {

                    elementFond
                        .style
                        .backgroundImage =
                        "none";


                    elementFond
                        .style
                        .opacity =
                        "1";


                    elementFond
                        .style
                        .filter =
                        "";


                    elementFond
                        .style
                        .backgroundPosition =
                        "center";


                    elementFond
                        .style
                        .backgroundSize =
                        "cover";


                    elementFond
                        .style
                        .backgroundRepeat =
                        "no-repeat";


                    elementFond
                        .classList
                        .remove(
                            "changement-fond",
                            "fond-charge"
                        );


                    elementFond.dataset
                        .opaciteCible =
                        "1";


                    elementFond
                        .style
                        .transition =
                        "";


                    this.fondActuel =
                        "";


                    this.timerFond =
                        null;


                    this.changementFondEnCours =
                        false;

                },
                dureeTransition
            );


        return true;

    },


    /*=====================================================
     ANNULER UNE TRANSITION DE FOND
    =====================================================*/

    annulerTransitionFond() {

        if (
            this.timerFond !==
                null
        ) {

            clearTimeout(
                this.timerFond
            );


            this.timerFond =
                null;

        }


        this.changementFondEnCours =
            false;


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            elementFond
        ) {

            elementFond
                .classList
                .remove(
                    "changement-fond"
                );


            elementFond
                .style
                .transition =
                "";

        }

    },


    /*=====================================================
     OBTENIR LE FOND ACTUEL
    =====================================================*/

    obtenirFondActuel() {

        return this.fondActuel ||
            "";

    },


    /*=====================================================
     VÉRIFIER SI UN FOND EST ACTIF
    =====================================================*/

    fondActif() {

        return Boolean(
            this.fondActuel
        );

    },
        /*=====================================================
     TERMINER LE CHAPITRE ACTUEL
    =====================================================*/

    terminerChapitre() {

        if (
            this.transitionChapitreEnCours
        ) {

            return;

        }


        this.transitionChapitreEnCours =
            true;


        /*---------------------------------------------
         ANNULER LES ÉTATS TEMPORAIRES
        ---------------------------------------------*/

        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        /*---------------------------------------------
         SAUVEGARDE AVANT TRANSITION
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
         CHAPITRE SUIVANT
        ---------------------------------------------*/

        const indexSuivant =
            this.chapitreActuel +
            1;


        const chapitreSuivant =
            chapitresManager
                .obtenir(
                    indexSuivant
                );


        /*---------------------------------------------
         PLUS AUCUN CHAPITRE
        ---------------------------------------------*/

        if (
            !chapitreSuivant
        ) {

            this.transitionChapitreEnCours =
                false;


            this.terminerJeu(
                {
                    raison:
                        "finChapitres"
                }
            );


            return;

        }


        /*---------------------------------------------
         LANCER LE CHAPITRE SUIVANT
        ---------------------------------------------*/

        const lancerChapitreSuivant =
            () => {

                this.transitionChapitreEnCours =
                    false;


                this.chargerChapitre(
                    indexSuivant,
                    chapitreSuivant.debut
                );

            };


        /*---------------------------------------------
         TRANSITION VISUELLE
        ---------------------------------------------*/

        if (
            typeof animationManager !==
                "undefined" &&
            animationManager !==
                null &&
            typeof animationManager
                .transitionVersNoir ===
                "function"
        ) {

            try {

                animationManager
                    .transitionVersNoir(
                        lancerChapitreSuivant
                    );


                return;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant la transition de chapitre :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         SECOURS
        ---------------------------------------------*/

        lancerChapitreSuivant();

    },


    /*=====================================================
     TERMINER UNE SCÈNE AVEC EFFETS

     Utile pour une scène terminale qui possède
     encore :
     - galerie ;
     - effet ;
     - succès ;
     - next ;
     - finChapitre ;
     - finJeu.
    =====================================================*/

    terminerSceneAvecEffets(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return;

        }


        /*---------------------------------------------
         GALERIE
        ---------------------------------------------*/

        this.gererGalerieElement(
            scene
        );


        /*---------------------------------------------
         EFFETS
        ---------------------------------------------*/

        if (
            scene.effet &&
            typeof scene.effet ===
                "object"
        ) {

            this.appliquerEffets(
                scene.effet
            );

        }


        /*---------------------------------------------
         SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
         SAUVEGARDE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
         FIN DU JEU
        ---------------------------------------------*/

        if (
            scene.finJeu ===
                true ||
            scene.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                scene
            );


            return;

        }


        /*---------------------------------------------
         FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            scene.finChapitre ===
                true ||
            scene.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();


            return;

        }


        /*---------------------------------------------
         DESTINATION SUIVANTE

         IMPORTANT :
         scene.next peut être une scène normale
         ou un identifiant de chapitre comme :
         "chapitre2".
        ---------------------------------------------*/

        if (
            scene.next
        ) {

            this.gererDestination(
                scene.next
            );

        }

    },


    /*=====================================================
     TERMINER LE JEU
    =====================================================*/

    terminerJeu(
        source = null
    ) {

        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        /*---------------------------------------------
         GALERIE FINALE
        ---------------------------------------------*/

        if (
            source &&
            typeof source ===
                "object"
        ) {

            this.gererGalerieElement(
                source
            );

        }


        /*---------------------------------------------
         EFFETS FINAUX
        ---------------------------------------------*/

        if (
            source?.effet &&
            typeof source.effet ===
                "object"
        ) {

            this.appliquerEffets(
                source.effet
            );

        }


        /*---------------------------------------------
         SUCCÈS FINAUX
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
         SAUVEGARDE FINALE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
         ARRÊT DES CHOIX
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant la fermeture des choix en fin de jeu :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         FONDU AUDIO
        ---------------------------------------------*/

        if (
            typeof audioManager !==
                "undefined" &&
            audioManager !==
                null
        ) {

            try {

                if (
                    typeof audioManager
                        .fadeOut ===
                        "function"
                ) {

                    audioManager
                        .fadeOut(
                            1000
                        );

                }
                else if (
                    typeof audioManager
                        .arreterMusique ===
                        "function"
                ) {

                    audioManager
                        .arreterMusique();

                }


                if (
                    typeof audioManager
                        .fadeOutAmbiance ===
                        "function"
                ) {

                    audioManager
                        .fadeOutAmbiance(
                            800
                        );

                }
                else if (
                    typeof audioManager
                        .arreterAmbiance ===
                        "function"
                ) {

                    audioManager
                        .arreterAmbiance();

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'arrêt audio de fin :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         MESSAGE DE FIN
        ---------------------------------------------*/

        this.afficherMessageFin(
            source
        );


        /*---------------------------------------------
         BOUTON RETOUR MENU
        ---------------------------------------------*/

        this.creerBoutonRetourMenuFin();

    },


    /*=====================================================
     AFFICHER LE MESSAGE DE FIN
    =====================================================*/

    afficherMessageFin(
        source = null
    ) {

        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            return false;

        }


        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            "narration"
        );


        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        bulle.textContent =

            source?.messageFin ||

            source?.texteFin ||

            "Fin de cette version de Friendzoné Reborn.";


        message.appendChild(
            bulle
        );


        conversation.appendChild(
            message
        );


        try {

            conversation.scrollTo(
                {

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }


        return true;

    },


    /*=====================================================
     CRÉER LE BOUTON RETOUR MENU
    =====================================================*/

    creerBoutonRetourMenuFin() {

        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            return false;

        }


        /*---------------------------------------------
         ÉVITER LES DOUBLONS
        ---------------------------------------------*/

        if (
            document.getElementById(
                "retourMenuFin"
            )
        ) {

            return false;

        }


        const zone =
            document.createElement(
                "div"
            );


        zone.className =
            "zone-afficher-choix";


        const bouton =
            document.createElement(
                "button"
            );


        bouton.id =
            "retourMenuFin";


        bouton.type =
            "button";


        bouton.className =
            "bouton-afficher-choix";


        bouton.textContent =
            "Retour au menu";


        bouton.addEventListener(
            "click",
            () => {

                this.sauvegarder();


                const retourner =
                    () => {

                        window.location.href =
                            "index.html";

                    };


                if (
                    typeof animationManager !==
                        "undefined" &&
                    animationManager !==
                        null &&
                    typeof animationManager
                        .transitionVersNoir ===
                        "function"
                ) {

                    try {

                        animationManager
                            .transitionVersNoir(
                                retourner
                            );


                        return;

                    }
                    catch (
                        erreur
                    ) {

                        console.error(
                            "moteur.js : erreur transition retour menu :",
                            erreur
                        );

                    }

                }


                retourner();

            }
        );


        zone.appendChild(
            bouton
        );


        conversation.appendChild(
            zone
        );


        try {

            conversation.scrollTo(
                {

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }


        return true;

    },


    /*=====================================================
     TERMINER UN CHAPITRE AVEC UN MÉDIA GALERIE
    =====================================================*/

    terminerChapitreAvecGalerie(
        idGalerie
    ) {

        if (
            idGalerie
        ) {

            this.debloquerGalerie(
                idGalerie
            );

        }


        this.terminerChapitre();

    },


    /*=====================================================
     DÉBLOQUER UNE CINÉMATIQUE
    =====================================================*/

    debloquerCinematique(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },


    /*=====================================================
     DÉBLOQUER UN APPEL AUDIO
    =====================================================*/

    debloquerAppel(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },
        /*=====================================================
     AFFICHER UNE ERREUR
    =====================================================*/

    afficherErreur(
        message
    ) {

        console.error(
            message
        );


        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            window.alert(
                message
            );

            return;

        }


        const conteneur =
            document.createElement(
                "div"
            );


        conteneur.className =
            "message narration";


        const bulle =
            document.createElement(
                "div"
            );


        bulle.className =
            "bulle";


        bulle.textContent =
            String(
                message ||
                "Une erreur est survenue."
            );


        conteneur.appendChild(
            bulle
        );


        conversation.appendChild(
            conteneur
        );


        try {

            conversation.scrollTo(
                {
                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"
                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }

    },


    /*=====================================================
     OBTENIR LA SCÈNE ACTUELLE
    =====================================================*/

    obtenirSceneActuelle() {

        if (
            !this.chapitre ||
            !this.sceneActuelle
        ) {

            return null;

        }


        return (
            this.chapitre
                .scenes?.[
                    this.sceneActuelle
                ] ||
            null
        );

    },


    /*=====================================================
     OBTENIR LE CHAPITRE ACTUEL
    =====================================================*/

    obtenirChapitreActuel() {

        return this.chapitre ||
            null;

    },


    /*=====================================================
     OBTENIR LE JOUEUR
    =====================================================*/

    obtenirJoueur() {

        return this.joueur ||
            null;

    },


    /*=====================================================
     OBTENIR LE SLOT ACTIF
    =====================================================*/

    obtenirSlotActif() {

        if (
            typeof sauvegardeManager ===
                "undefined" ||
            sauvegardeManager ===
                null ||
            typeof sauvegardeManager
                .obtenirSlotActif !==
                "function"
        ) {

            return null;

        }


        return sauvegardeManager
            .obtenirSlotActif();

    },


    /*=====================================================
     FORCER UNE SAUVEGARDE
    =====================================================*/

    sauvegardeManuelle() {

        const resultat =
            this.sauvegarder();


        if (
            resultat
        ) {

            console.log(
                "moteur.js : sauvegarde manuelle effectuée."
            );

        }
        else {

            console.warn(
                "moteur.js : la sauvegarde manuelle a échoué."
            );

        }


        return resultat;

    },


    /*=====================================================
     RECHARGER LA SCÈNE ACTUELLE
    =====================================================*/

    rechargerScene() {

        if (
            !this.sceneActuelle
        ) {

            return false;

        }


        this.chargerScene(
            this.sceneActuelle
        );


        return true;

    },


    /*=====================================================
     ALLER À UNE SCÈNE

     Fonction de développement.
    =====================================================*/

    allerScene(
        idScene
    ) {

        if (
            !idScene
        ) {

            return false;

        }


        this.chargerScene(
            idScene
        );


        return true;

    },


    /*=====================================================
     ALLER À UN CHAPITRE

     Fonction de développement.
    =====================================================*/

    allerChapitre(
        index,
        scene = null
    ) {

        const indexChapitre =
            Number(
                index
            );


        if (
            !Number.isInteger(
                indexChapitre
            ) ||
            indexChapitre <
                0
        ) {

            console.warn(
                "moteur.js : index de chapitre invalide :",
                index
            );


            return false;

        }


        return this.chargerChapitre(
            indexChapitre,
            scene
        );

    },


    /*=====================================================
     TESTER LA GALERIE
    =====================================================*/

    testGalerie(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },


    /*=====================================================
     TESTER PLUSIEURS MÉDIAS DE GALERIE
    =====================================================*/

    testGalerieMultiple(
        ids
    ) {

        if (
            !Array.isArray(
                ids
            )
        ) {

            return false;

        }


        return this.debloquerGalerie(
            ids
        );

    },


    /*=====================================================
     TESTER UN SUCCÈS
    =====================================================*/

    testSucces(
        idSucces
    ) {

        if (
            !idSucces
        ) {

            return false;

        }


        if (
            typeof succesManager ===
                "undefined" ||
            succesManager ===
                null ||
            typeof succesManager
                .debloquer !==
                "function"
        ) {

            return false;

        }


        try {

            return succesManager
                .debloquer(
                    idSucces
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur pendant le test du succès :",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
     MODIFIER UNE VARIABLE DU JOUEUR
    =====================================================*/

    definirVariable(
        nom,
        valeur
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return false;

        }


        this.joueur[
            nom
        ] =
            valeur;


        this.verifierSucces();

        this.sauvegarder();


        return true;

    },


    /*=====================================================
     OBTENIR UNE VARIABLE DU JOUEUR
    =====================================================*/

    obtenirVariable(
        nom
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return undefined;

        }


        return this.joueur[
            nom
        ];

    },


    /*=====================================================
     AJOUTER UNE VALEUR À UNE VARIABLE
    =====================================================*/

    ajouterVariable(
        nom,
        valeur
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return false;

        }


        const ancienneValeur =
            Number(
                this.joueur[
                    nom
                ]
            );


        const ajout =
            Number(
                valeur
            );


        this.joueur[
            nom
        ] =
            (
                Number.isFinite(
                    ancienneValeur
                )
                    ? ancienneValeur
                    : 0
            ) +
            (
                Number.isFinite(
                    ajout
                )
                    ? ajout
                    : 0
            );


        this.verifierSucces();

        this.sauvegarder();


        return true;

    },


    /*=====================================================
     VÉRIFIER LE MOTEUR
    =====================================================*/

    verifierDependances() {

        const dependances = {

            chapitresManager:
                typeof chapitresManager !==
                    "undefined",

            sauvegardeManager:
                typeof sauvegardeManager !==
                    "undefined",

            dialogueManager:
                typeof dialogueManager !==
                    "undefined",

            choixManager:
                typeof choixManager !==
                    "undefined",

            audioManager:
                typeof audioManager !==
                    "undefined",

            animationManager:
                typeof animationManager !==
                    "undefined",

            succesManager:
                typeof succesManager !==
                    "undefined",

            galerieManager:
                typeof galerieManager !==
                    "undefined"

        };


        console.table(
            dependances
        );


        return dependances;

    },


    /*=====================================================
     NETTOYER LES ÉTATS TEMPORAIRES
    =====================================================*/

    nettoyer() {

        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        this.transitionChapitreEnCours =
            false;


        this.changementFondEnCours =
            false;


        /*---------------------------------------------
         ARRÊTER LES DIALOGUES EN COURS
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .arreter ===
                "function"
        ) {

            try {

                dialogueManager
                    .arreter();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur nettoyage dialogueManager :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         FERMER LES CHOIX
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur nettoyage choixManager :",
                    erreur
                );

            }

        }

    },


    /*=====================================================
     PRÉPARER LE MOTEUR AVANT DE QUITTER
    =====================================================*/

    avantQuitter() {

        if (
            this.joueur &&
            this.sceneActuelle
        ) {

            try {

                this.sauvegarder();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur sauvegarde avant fermeture :",
                    erreur
                );

            }

        }


        this.nettoyer();

    }

};


/*=========================================================
 SAUVEGARDE AVANT FERMETURE OU CHANGEMENT DE PAGE
=========================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        try {

            moteur
                .avantQuitter();

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur avant fermeture :",
                erreur
            );

        }

    }
);


/*=========================================================
 INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        moteur
            .initialiser()
            .catch(
                erreur => {

                    console.error(
                        "moteur.js : erreur fatale pendant l'initialisation :",
                        erreur
                    );


                    moteur
                        .afficherErreur(
                            "Impossible d'initialiser le jeu."
                        );

                }
            );

    }
);
