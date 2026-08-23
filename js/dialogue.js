"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    dialogue.js

    Gestion :
    - des dialogues ;
    - des variantes de relation ;
    - des variantes de confiance ;
    - des indicateurs d’écriture ;
    - des sons propres aux personnages ;
    - des succès ;
    - des choix importants ;
    - des nouvelles informations ;
    - des fonds définis dans les dialogues ;
    - de la galerie multimédia.
=========================================================*/

const dialogueManager = {

    conteneur: null,

    /*
        Identifiant permettant d'annuler une ancienne
        séquence de dialogues lorsqu'une nouvelle scène
        est chargée.
    */

    sequenceAffichage: 0,

    /*
        Réglages du délai d'écriture automatique.

        Le temps d'écriture est calculé selon
        le nombre de caractères du message.
    */

    dureeEcritureMinimum: 650,

    dureeEcritureMaximum: 3200,

    dureeParCaractere: 32,

    pauseEntreMessages: 180,

    /*
        Mémorise le dernier personnage ayant produit
        un son de dialogue.
    */

    dernierPersonnageSonore: null,

    /*
        Association entre les personnages et les fichiers
        présents dans le dossier audio/sons/.
    */

    sonsPersonnages: {

        joueur: "joueur",

        eva: "eva",

        zoe: "zoe",

        emelyne: "emelyne",

        bryan: "bryan",

        christophe: "christophe",

        "lieutenant-morel":
            "lieutenant-morel",

        eleve: "eleve",

        sms: "notification",

        telephone: "notification"

    },


    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById(
                "texte"
            );


        if (!this.conteneur) {

            console.error(
                "dialogue.js : l'élément #texte est introuvable."
            );

            return;

        }


        console.log(
            "dialogueManager initialisé."
        );

    },


    /*=====================================================
        VÉRIFIER AUDIO MANAGER
    =====================================================*/

    audioDisponible() {

        return (

            typeof audioManager !==
                "undefined" &&

            audioManager !== null &&

            typeof audioManager
                .jouerSon ===
                "function"

        );

    },


    /*=====================================================
        VÉRIFIER GALERIE MANAGER
    =====================================================*/

    galerieDisponible() {

        return (

            typeof galerieManager !==
                "undefined" &&

            galerieManager !== null &&

            typeof galerieManager
                .debloquer ===
                "function"

        );

    },


    /*=====================================================
        GÉRER LA GALERIE D'UN DIALOGUE

        Formats acceptés :

        "galerie": "idMedia"

        ou :

        "galerie": [
            "idMedia1",
            "idMedia2"
        ]

        Le moteur garde la priorité afin que la logique
        de déblocage reste centralisée.
    =====================================================*/

    gererGalerieDialogue(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    message,
                    "galerie"
                )
        ) {

            return false;

        }


        const valeur =
            message.galerie;


        if (!valeur) {

            return false;

        }


        /*---------------------------------------------
         PASSER PAR LE MOTEUR EN PRIORITÉ
        ---------------------------------------------*/

        if (
            typeof moteur !==
                "undefined" &&

            moteur !== null &&

            typeof moteur
                .gererGalerieElement ===
                "function"
        ) {

            try {

                return moteur
                    .gererGalerieElement(
                        message
                    );

            }
            catch (erreur) {

                console.error(
                    "dialogue.js : erreur galerie via moteur :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         SECOURS : GALERIE MANAGER DIRECTEMENT
        ---------------------------------------------*/

        if (
            !this.galerieDisponible()
        ) {

            return false;

        }


        try {

            if (
                Array.isArray(
                    valeur
                )
            ) {

                if (
                    typeof galerieManager
                        .debloquerPlusieurs ===
                        "function"
                ) {

                    galerieManager
                        .debloquerPlusieurs(
                            valeur
                        );

                    return true;

                }


                let auMoinsUnDeblocage =
                    false;


                valeur.forEach(
                    id => {

                        if (
                            galerieManager
                                .debloquer(
                                    id
                                )
                        ) {

                            auMoinsUnDeblocage =
                                true;

                        }

                    }
                );


                return auMoinsUnDeblocage;

            }


            return galerieManager
                .debloquer(
                    String(
                        valeur
                    )
                        .trim()
                );

        }
        catch (erreur) {

            console.error(
                "dialogue.js : impossible de débloquer le média :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
        JOUER UN EFFET SONORE
    =====================================================*/

    jouerEffetSonore(
        nomSon,
        volume = undefined
    ) {

        if (!this.audioDisponible()) {

            return;

        }


        if (
            typeof nomSon !==
                "string" ||

            nomSon.trim() ===
                ""
        ) {

            return;

        }


        const nom =
            nomSon.trim();


        /*
            Si un volume est fourni, il est transmis
            à audioManager.

            Sinon audioManager utilise son volume
            d'effets sonores par défaut.
        */

        if (
            typeof volume ===
                "number" &&

            Number.isFinite(
                volume
            )
        ) {

            audioManager.jouerSon(

                nom,

                Math.max(

                    0,

                    Math.min(
                        1,
                        volume
                    )

                )

            );

            return;

        }


        audioManager.jouerSon(
            nom
        );

    },


    /*=====================================================
        IDENTIFIER UN ÉVÉNEMENT SONORE
    =====================================================*/

    obtenirEvenementSonore(
        message
    ) {

        if (!message) {

            return "";

        }


        const evenement =
            String(

                message.evenement ||

                message.événement ||

                message.typeNotification ||

                ""

            )
                .toLowerCase()

                .normalize(
                    "NFD"
                )

                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )

                .trim();


        switch (evenement) {

            case "succes":

            case "success":

            case "achievement":

                return "succes";


            case "choix-important":

            case "choix important":

            case "choix_important":

            case "important":

                return "choix-important";


            case "information-personnage":

            case "information personnage":

            case "nouvelle-information":

            case "nouvelle information":

            case "revelation-personnage":

                return "information-personnage";


            default:

                return "";

        }

    },


    /*=====================================================
        JOUER LE SON D'UN DIALOGUE
    =====================================================*/

    jouerSonDialogue(
        message
    ) {

        if (!message) {

            return;

        }


        if (!this.audioDisponible()) {

            return;

        }


        /*
            Aucun son automatique.

            Un son est joué uniquement si le message JSON
            contient explicitement une propriété "son".
        */

        if (
            typeof message.son !==
                "string" ||

            message.son.trim() ===
                ""
        ) {

            return;

        }


        const nomSon =
            message.son.trim();


        /*
            Permet de désactiver explicitement le son.

            Exemple JSON :

            "son": "aucun"
        */

        if (
            nomSon.toLowerCase() ===
                "aucun" ||

            nomSon.toLowerCase() ===
                "none" ||

            nomSon.toLowerCase() ===
                "false"
        ) {

            return;

        }


        let volume =
            undefined;


        if (
            typeof message.volumeSon ===
                "number" &&

            Number.isFinite(
                message.volumeSon
            )
        ) {

            volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        message.volumeSon
                    )
                );

        }


        this.jouerEffetSonore(
            nomSon,
            volume
        );

    },


    /*=====================================================
        JOUER UN SON DE NOTIFICATION
    =====================================================*/

    jouerSonNotification(
        message
    ) {

        if (!message) {

            return;

        }


        const evenement =
            this.obtenirEvenementSonore(
                message
            );


        if (!evenement) {

            return;

        }


        switch (evenement) {

            case "succes":

                this.jouerEffetSonore(
                    "succes"
                );

                break;


            case "choix-important":

                this.jouerEffetSonore(
                    "choix-important"
                );

                break;


            case "information-personnage":

                this.jouerEffetSonore(
                    "information-personnage"
                );

                break;

        }

    },


    /*=====================================================
        NORMALISER UN PERSONNAGE
    =====================================================*/

    normaliserPersonnage(
        personnage
    ) {

        let type =
            String(
                personnage ||
                "narrateur"
            )
                .toLowerCase()
                .trim();


        type =
            type

                .normalize(
                    "NFD"
                )

                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )

                .replace(
                    /_/g,
                    "-"
                )

                .replace(
                    /\s+/g,
                    "-"
                );


        const alias = {

            narrateur:
                "narrateur",

            narration:
                "narrateur",

            joueur:
                "joueur",

            player:
                "joueur",

            eva:
                "eva",

            zoe:
                "zoe",

            emelyne:
                "emelyne",

            bryan:
                "bryan",

            christophe:
                "christophe",

            morel:
                "lieutenant-morel",

            lieutenant:
                "lieutenant-morel",

            "lieutenant-morel":
                "lieutenant-morel",

            eleve:
                "eleve",

            telephone:
                "telephone",

            tel:
                "telephone",

            sms:
                "sms",

            systeme:
                "systeme",

            succes:
                "systeme"

        };


        return (
            alias[
                type
            ] ||
            type
        );

    },


    /*=====================================================
        OBTENIR LE NOM AFFICHÉ D'UN PERSONNAGE
    =====================================================*/

    obtenirNomPersonnage(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        const noms = {

            narrateur:
                "",

            joueur:
                "Vous",

            eva:
                "Eva",

            zoe:
                "Zoé",

            emelyne:
                "Emelyne",

            bryan:
                "Bryan",

            christophe:
                "Christophe",

            "lieutenant-morel":
                "Lieutenant Morel",

            eleve:
                "Élève",

            telephone:
                "Téléphone",

            sms:
                "SMS",

            systeme:
                "Système"

        };


        if (
            type ===
                "joueur" &&

            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            return String(
                moteur.joueur.nom
            );

        }


        return (
            noms[
                type
            ] ||
            personnage ||
            ""
        );

    },


    /*=====================================================
        REMPLACER LES VARIABLES DANS LE TEXTE
    =====================================================*/

    remplacerVariables(
        texte
    ) {

        let resultat =
            String(
                texte || ""
            );


        let nomJoueur =
            "Joueur";


        if (
            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            nomJoueur =
                String(
                    moteur.joueur.nom
                ).trim();

        }


        resultat =
            resultat

                .replaceAll(
                    "{{nomJoueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom du joueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom_du_joueur}}",
                    nomJoueur
                );


        return resultat;

    },


    /*=====================================================
        OBTENIR LA RELATION D'UN PERSONNAGE
    =====================================================*/

    obtenirRelationPersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesRelation = {

            eva:
                "relationEva",

            zoe:
                "relationZoe",

            emelyne:
                "relationEmelyne",

            bryan:
                "relationBryan",

            christophe:
                "relationChristophe"

        };


        const variable =
            variablesRelation[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        OBTENIR LA CONFIANCE D'UN PERSONNAGE
    =====================================================*/

    obtenirConfiancePersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesConfiance = {

            eva:
                "confianceEva",

            zoe:
                "confianceZoe",

            emelyne:
                "confianceEmelyne",

            bryan:
                "confianceBryan",

            christophe:
                "confianceChristophe"

        };


        const variable =
            variablesConfiance[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE RELATION
    =====================================================*/

    obtenirNiveauRelation(
        personnage
    ) {

        const relation =
            this.obtenirRelationPersonnage(
                personnage
            );


        if (
            relation < 0
        ) {

            return "negative";

        }


        if (
            relation < 5
        ) {

            return "neutre";

        }


        if (
            relation < 10
        ) {

            return "amicale";

        }


        return "proche";

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE CONFIANCE
    =====================================================*/

    obtenirNiveauConfiance(
        personnage
    ) {

        const confiance =
            this.obtenirConfiancePersonnage(
                personnage
            );


        if (
            confiance < 0
        ) {

            return "negative";

        }


        if (
            confiance < 5
        ) {

            return "faible";

        }


        if (
            confiance < 10
        ) {

            return "moyenne";

        }


        return "haute";

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA RELATION
    =====================================================*/

    obtenirTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        /*
            Format simple :

            {
                "personnage": "eva",
                "texte": "Salut."
            }
        */

        if (
            !message.variantes ||

            typeof message.variantes !==
                "object"
        ) {

            return (
                message.texte ||
                ""
            );

        }


        const personnageReference =

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauRelation(
                personnageReference
            );


        return (

            message.variantes[
                niveau
            ] ||

            message.variantes.neutre ||

            message.variantes.amicale ||

            message.variantes.proche ||

            message.variantes.negative ||

            message.texte ||

            ""

        );

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA CONFIANCE
    =====================================================*/

    obtenirTexteConfiance(
        message
    ) {

        if (!message) {

            return "";

        }


        if (
            !message.variantesConfiance ||

            typeof message
                .variantesConfiance !==
                "object"
        ) {

            return this.obtenirTexteMessage(
                message
            );

        }


        const personnageReference =

            message.confianceAvec ||

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauConfiance(
                personnageReference
            );


        return (

            message.variantesConfiance[
                niveau
            ] ||

            message.variantesConfiance.faible ||

            message.texte ||

            this.obtenirTexteMessage(
                message
            ) ||

            ""

        );

    },


    /*=====================================================
        OBTENIR LE TEXTE FINAL
    =====================================================*/

    preparerTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        let texte =
            "";


        /*
            Les variantes de confiance ont la priorité
            sur les variantes de relation.
        */

        if (
            message.variantesConfiance
        ) {

            texte =
                this.obtenirTexteConfiance(
                    message
                );

        }
        else {

            texte =
                this.obtenirTexteMessage(
                    message
                );

        }


        return this.remplacerVariables(
            texte
        );

    },


    /*=====================================================
        VIDER LA CONVERSATION
    =====================================================*/

    vider() {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return;

        }


        /*
            Augmenter cette valeur annule les indicateurs
            d'écriture et les dialogues encore en attente.
        */

        this.sequenceAffichage += 1;


        this.conteneur.innerHTML =
            "";


        /*
            Le premier personnage de la prochaine scène
            pourra de nouveau produire son son.
        */

        this.dernierPersonnageSonore =
            null;

    },
        /*=====================================================
        AFFICHER UNE SCÈNE
    =====================================================*/

    async afficherScene(
        scene
    ) {

        if (!scene) {

            console.error(
                "dialogues.js : scène invalide."
            );

            return;

        }

        /*
            Chaque nouvelle scène reçoit son propre numéro.

            Si une autre scène démarre pendant les délais,
            l'ancienne séquence s'arrête automatiquement.
        */

        const sequence =
            ++this.sequenceAffichage;

        /*
            Nouveau format :

            {
                "dialogues": [
                    {
                        "personnage": "eva",
                        "texte": "Salut."
                    }
                ]
            }

            Ancien format :

            {
                "personnage": "eva",
                "texte": "Salut."
            }
        */

        const dialogues =
            Array.isArray(
                scene.dialogues
            )

                ? scene.dialogues

                : scene.texte

                    ? [

                        {

                            ...scene,

                            texte:
                                scene.texte,

                            personnage:

                                scene.personnage ||

                                "narrateur"

                        }

                    ]

                    : [];

        /*
            Les messages sont parcourus avec une boucle
            asynchrone pour qu'ils apparaissent dans l'ordre.
        */

        for (
            const message
            of dialogues
        ) {

            /*
                Une nouvelle scène a commencé :
                on abandonne cette ancienne séquence.
            */

            if (
                sequence !==
                this.sequenceAffichage
            ) {

                return;

            }

            if (!message) {

                continue;

            }

            /*
                Applique le fond défini directement
                dans le dialogue avant l'indicateur
                d'écriture et avant l'apparition
                de la bulle.

                Exemple JSON :

                {
                    "personnage": "narrateur",
                    "texte": "Tu arrives à la cafétéria.",
                    "fond": "cafeteria_arrivee"
                }
            */

            if (
                typeof moteur !==
                    "undefined" &&

                typeof moteur
                    .gererFondDialogue ===
                    "function"
            ) {

                moteur.gererFondDialogue(
                    message
                );

            }

            const texteMessage =
                this.preparerTexteMessage(
                    message
                );

            if (!texteMessage) {

                continue;

            }

            const personnage =

                message.personnage ||

                message.type ||

                "narrateur";

            const type =
                this.normaliserPersonnage(
                    personnage
                );

            /*
                L'indicateur d'écriture est affiché
                automatiquement pour les personnages.

                Il ne s'affiche pas par défaut pour :

                - la narration ;
                - les pensées ;
                - le système.

                Le JSON peut forcer ou désactiver ce
                comportement avec :

                "afficherEcriture": true

                ou :

                "afficherEcriture": false
            */

            const afficherEcriture =

                message.afficherEcriture ===
                    true ||

                (

                    message.afficherEcriture !==
                        false &&

                    type !==
                        "narration" &&

                    type !==
                        "pensee" &&

                    type !==
                        "systeme"

                );

            if (
                afficherEcriture
            ) {

                const duree =
                    this.calculerDureeEcriture(

                        texteMessage,

                        message

                    );

                const termine =
                    await this
                        .afficherIndicateurEcriture(

                            personnage,

                            duree,

                            sequence

                        );

                /*
                    L'indicateur a été interrompu par
                    le chargement d'une nouvelle scène.
                */

                if (!termine) {

                    return;

                }

            }

            /*
                Vérification supplémentaire avant
                l'ajout du véritable message.
            */

            if (
                sequence !==
                this.sequenceAffichage
            ) {

                return;

            }


            this.ajouterMessage(

                texteMessage,

                personnage,

                message

            );


            /*
                Petite pause après le message avant que
                le personnage suivant commence à écrire.

                Personnalisation possible dans le JSON :

                "pauseApres": 500
            */

            const pause =
                Number.isFinite(

                    Number(
                        message.pauseApres
                    )

                )
                    ? Math.max(

                        0,

                        Number(
                            message.pauseApres
                        )

                    )

                    : this.pauseEntreMessages;


            if (
                pause > 0
            ) {

                await this.attendre(
                    pause
                );

            }

        }

    },


    /*=====================================================
        CALCULER LE TEMPS D'ÉCRITURE
    =====================================================*/

    calculerDureeEcriture(
        texte,
        options = {}
    ) {

        /*
            Une durée précise peut être déclarée
            directement dans le JSON :

            "dureeEcriture": 1500
        */

        if (
            Number.isFinite(

                Number(
                    options.dureeEcriture
                )

            )
        ) {

            return Math.max(

                0,

                Number(
                    options.dureeEcriture
                )

            );

        }


        /*
            Retire les éventuelles balises HTML afin
            qu'elles ne soient pas comptées comme du texte.

            Exemple :

            <strong>Salut</strong>

            compte uniquement les lettres de "Salut".
        */

        const texteSansBalises =
            String(
                texte || ""
            )
                .replace(
                    /<[^>]*>/g,
                    ""
                )
                .trim();


        /*
            Chaque message peut modifier localement
            les réglages du temps d'écriture.
        */

        const minimum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMinimum
                )

            )
                ? Number(
                    options.dureeEcritureMinimum
                )

                : this.dureeEcritureMinimum;


        const maximum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMaximum
                )

            )
                ? Number(
                    options.dureeEcritureMaximum
                )

                : this.dureeEcritureMaximum;


        const parCaractere =
            Number.isFinite(

                Number(
                    options.dureeParCaractere
                )

            )
                ? Number(
                    options.dureeParCaractere
                )

                : this.dureeParCaractere;


        const dureeCalculee =

            texteSansBalises.length *

            Math.max(
                0,
                parCaractere
            );


        /*
            La durée reste comprise entre le minimum
            et le maximum configurés.
        */

        return Math.min(

            Math.max(

                minimum,

                dureeCalculee

            ),

            Math.max(

                minimum,

                maximum

            )

        );

    },


    /*=====================================================
        AFFICHER L'INDICATEUR D'ÉCRITURE
    =====================================================*/

    async afficherIndicateurEcriture(
        personnage,
        duree,
        sequence =
            this.sequenceAffichage
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return false;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*
            Conteneur complet de l'indicateur.
        */

        const indicateur =
            document.createElement(
                "div"
            );


        indicateur.classList.add(

            "message-ecriture",

            type

        );


        /*
            Ligne contenant :

            Eva écrit…
        */

        const ligneNom =
            document.createElement(
                "div"
            );


        ligneNom.classList.add(
            "indicateur-ecriture"
        );


        const nom =
            document.createElement(
                "span"
            );


        nom.classList.add(
            "nom-ecriture"
        );


        nom.textContent =
            this.obtenirNom(
                type
            );


        const statut =
            document.createElement(
                "span"
            );


        statut.classList.add(
            "texte-ecriture"
        );


        statut.textContent =
            "écrit…";


        ligneNom.appendChild(
            nom
        );


        ligneNom.appendChild(
            statut
        );


        /*
            Bulle contenant les trois points.
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle-ecriture"
        );


        /*
            Accessibilité pour les lecteurs d'écran.
        */

        bulle.setAttribute(
            "role",
            "status"
        );


        bulle.setAttribute(

            "aria-label",

            `${this.obtenirNom(type)} écrit`

        );


        /*
            Création des trois points animés.
        */

        for (
            let index = 0;
            index < 3;
            index += 1
        ) {

            const point =
                document.createElement(
                    "span"
                );


            point.classList.add(
                "point-ecriture"
            );


            point.setAttribute(
                "aria-hidden",
                "true"
            );


            bulle.appendChild(
                point
            );

        }


        indicateur.appendChild(
            ligneNom
        );


        indicateur.appendChild(
            bulle
        );


        this.conteneur.appendChild(
            indicateur
        );


        this.defiler();


        /*
            L'indicateur reste visible pendant la durée
            calculée selon la longueur du message.
        */

        await this.attendre(
            duree
        );


        /*
            Il est retiré avant l'apparition
            de la véritable bulle.
        */

        indicateur.remove();


        /*
            Retourne false si une autre scène a été
            chargée pendant l'attente.
        */

        return (

            sequence ===
            this.sequenceAffichage

        );

    },
        /*=====================================================
        AJOUTER UN MESSAGE
    =====================================================*/

    ajouterMessage(
        contenu,
        personnage = "narrateur",
        options = {}
    ) {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            !this.conteneur
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND ASSOCIÉ AU MESSAGE
        ---------------------------------------------*/

        if (
            options &&
            typeof options ===
                "object" &&
            typeof moteur !==
                "undefined" &&
            moteur !==
                null &&
            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            try {

                moteur
                    .gererFondDialogue(
                        options
                    );

            }
            catch (erreur) {

                console.error(
                    "dialogue.js : erreur pendant le changement de fond :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         GALERIE

         Le déblocage se fait ici parce que cette
         fonction correspond à l'apparition réelle
         de la bulle dans la conversation.
        ---------------------------------------------*/

        this.gererGalerieDialogue(
            options
        );


        /*---------------------------------------------
         NORMALISATION DU PERSONNAGE
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         TEXTE FINAL
        ---------------------------------------------*/

        const texteFinal =
            this.remplacerVariables(
                contenu
            );


        if (
            !texteFinal
        ) {

            return null;

        }


        /*---------------------------------------------
         CONTENEUR DU MESSAGE
        ---------------------------------------------*/

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*---------------------------------------------
         CLASSE PERSONNALISÉE
        ---------------------------------------------*/

        if (
            typeof options.classe ===
                "string" &&
            options.classe.trim() !==
                ""
        ) {

            options.classe
                .trim()
                .split(
                    /\s+/
                )
                .forEach(
                    classe => {

                        if (
                            classe
                        ) {

                            message.classList.add(
                                classe
                            );

                        }

                    }
                );

        }


        /*---------------------------------------------
         MESSAGE IMPORTANT
        ---------------------------------------------*/

        if (
            options.important ===
                true
        ) {

            message.classList.add(
                "important"
            );

        }


        /*---------------------------------------------
         MESSAGE SECRET
        ---------------------------------------------*/

        if (
            options.secret ===
                true
        ) {

            message.classList.add(
                "secret"
            );

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            type ===
                "systeme"
        ) {

            message.classList.add(
                "message-systeme"
            );

        }


        /*---------------------------------------------
         MESSAGE NARRATION
        ---------------------------------------------*/

        if (
            type ===
                "narrateur"
        ) {

            message.classList.add(
                "narration"
            );

        }


        /*---------------------------------------------
         NOM DU PERSONNAGE
        ---------------------------------------------*/

        const nom =
            document.createElement(
                "div"
            );


        nom.classList.add(
            "nom"
        );


        const nomPersonnage =
            this.obtenirNomPersonnage(
                type
            );


        /*
            La narration n'affiche pas de nom.
        */

        if (
            nomPersonnage
        ) {

            nom.textContent =
                nomPersonnage;


            message.appendChild(
                nom
            );

        }


        /*---------------------------------------------
         BULLE
        ---------------------------------------------*/

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        /*---------------------------------------------
         HTML AUTORISÉ EXPLICITEMENT
        ---------------------------------------------*/

        if (
            options.html ===
                true
        ) {

            bulle.innerHTML =
                texteFinal;

        }
        else {

            bulle.textContent =
                texteFinal;

        }


        /*---------------------------------------------
         TITRE / TOOLTIP
        ---------------------------------------------*/

        if (
            typeof options.titre ===
                "string" &&
            options.titre.trim() !==
                ""
        ) {

            bulle.title =
                options.titre.trim();

        }


        /*---------------------------------------------
         ACCESSIBILITÉ
        ---------------------------------------------*/

        if (
            type ===
                "narrateur"
        ) {

            bulle.setAttribute(
                "aria-label",
                texteFinal
            );

        }
        else {

            bulle.setAttribute(
                "aria-label",
                `${nomPersonnage} : ${texteFinal}`
            );

        }


        message.appendChild(
            bulle
        );


        /*---------------------------------------------
         AJOUT AU DOM
        ---------------------------------------------*/

        this.conteneur.appendChild(
            message
        );


        /*---------------------------------------------
         SON DU DIALOGUE
        ---------------------------------------------*/

        this.jouerSonDialogue(
            options
        );


        /*---------------------------------------------
         SON DE NOTIFICATION
        ---------------------------------------------*/

        this.jouerSonNotification(
            options
        );


        /*---------------------------------------------
         CLASSE D'APPARITION
        ---------------------------------------------*/

        requestAnimationFrame(
            () => {

                message.classList.add(
                    "envoye"
                );

            }
        );


        /*---------------------------------------------
         DÉFILEMENT AUTOMATIQUE
        ---------------------------------------------*/

        this.defiler();


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ

         Permet à d'autres systèmes d'écouter
         l'apparition d'un message.
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "dialogueAffiche",
                    {

                        detail: {

                            personnage:
                                type,

                            texte:
                                texteFinal,

                            options:
                                options,

                            element:
                                message

                        }

                    }
                )

            );

        }
        catch (erreur) {

            /*
                Le jeu continue même si les événements
                personnalisés ne sont pas disponibles.
            */

        }


        return message;

    },


    /*=====================================================
        AJOUTER UNE NARRATION
    =====================================================*/

    ajouterNarration(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "narrateur",

            options

        );

    },


    /*=====================================================
        AJOUTER UN MESSAGE DU JOUEUR
    =====================================================*/

    ajouterMessageJoueur(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "joueur",

            options

        );

    },


    /*=====================================================
        AJOUTER UN MESSAGE SYSTÈME
    =====================================================*/

    ajouterMessageSysteme(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "systeme",

            options

        );

    },


    /*=====================================================
        AJOUTER UNE NOTIFICATION
    =====================================================*/

    ajouterNotification(
        contenu,
        evenement = "",
        options = {}
    ) {

        const configuration = {

            ...options,

            evenement:
                evenement ||

                options.evenement ||

                ""

        };


        return this.ajouterMessage(

            contenu,

            "systeme",

            configuration

        );

    },


    /*=====================================================
        AFFICHER UNE NOTIFICATION DE SUCCÈS
    =====================================================*/

    afficherNotificationSucces(
        titre,
        description = ""
    ) {

        let texte =
            "Succès débloqué";


        if (
            titre
        ) {

            texte +=
                ` : ${titre}`;

        }


        if (
            description
        ) {

            texte +=
                ` — ${description}`;

        }


        return this.ajouterNotification(

            texte,

            "succes",

            {

                classe:
                    "notification-succes",

                important:
                    true

            }

        );

    },


    /*=====================================================
        AFFICHER UNE INFORMATION DE PERSONNAGE
    =====================================================*/

    afficherInformationPersonnage(
        texte,
        options = {}
    ) {

        return this.ajouterNotification(

            texte,

            "information-personnage",

            {

                ...options,

                classe:
                    [
                        options.classe,
                        "notification-information"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        )

            }

        );

    },


    /*=====================================================
        AFFICHER UN CHOIX IMPORTANT
    =====================================================*/

    afficherChoixImportant(
        texte,
        options = {}
    ) {

        return this.ajouterNotification(

            texte,

            "choix-important",

            {

                ...options,

                classe:
                    [
                        options.classe,
                        "notification-choix-important"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        ),

                important:
                    true

            }

        );

    },


    /*=====================================================
        DÉFILER VERS LE BAS
    =====================================================*/

    defiler() {

        if (
            !this.conteneur
        ) {

            return;

        }


        const conversation =
            document.getElementById(
                "conversation"
            );


        /*
            Le scroll principal du jeu se trouve
            normalement sur #conversation.
        */

        const cible =
            conversation ||
            this.conteneur;


        try {

            cible.scrollTo(
                {

                    top:
                        cible.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (erreur) {

            cible.scrollTop =
                cible.scrollHeight;

        }

    },


    /*=====================================================
        ATTENDRE
    =====================================================*/

    attendre(
        duree
    ) {

        let temps =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                temps
            ) ||
            temps <
                0
        ) {

            temps =
                0;

        }


        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    temps
                );

            }
        );

    },


    /*=====================================================
        OBTENIR LE NOM D'UN PERSONNAGE

        Alias conservé pour compatibilité avec
        les anciennes fonctions du fichier.
    =====================================================*/

    obtenirNom(
        personnage
    ) {

        return this.obtenirNomPersonnage(
            personnage
        );

    },
        /*=====================================================
        ÉCRIRE UN MESSAGE PROGRESSIVEMENT

        Cette méthode est utilisée lorsqu'un message
        doit apparaître caractère par caractère.

        Le système conserve :
        - l'indicateur d'écriture ;
        - les délais de ponctuation ;
        - l'annulation lors d'un changement de scène ;
        - les sons ;
        - les animations ;
        - la galerie.
    =====================================================*/

    async ecrireProgressivement(
        contenu,
        personnage = "narrateur",
        vitesse = 20,
        options = {}
    ) {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            !this.conteneur
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND ASSOCIÉ AU MESSAGE

         Utile lorsque ecrireProgressivement()
         est appelé directement sans passer
         par afficherScene().
        ---------------------------------------------*/

        if (
            options &&
            typeof options ===
                "object" &&

            typeof moteur !==
                "undefined" &&

            moteur !==
                null &&

            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            try {

                moteur
                    .gererFondDialogue(
                        options
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant le changement de fond du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         PRÉPARATION DU TEXTE
        ---------------------------------------------*/

        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        if (
            !contenuPrepare
        ) {

            return null;

        }


        /*---------------------------------------------
         PERSONNAGE
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         SÉQUENCE ACTIVE

         Si une autre scène démarre,
         sequenceAffichage change et cette écriture
         est immédiatement abandonnée.
        ---------------------------------------------*/

        const sequence =
            this.sequenceAffichage;


        /*---------------------------------------------
         INDICATEUR D'ÉCRITURE
        ---------------------------------------------*/

        const afficherEcriture =

            options.afficherEcriture ===
                true ||

            (

                options.afficherEcriture !==
                    false &&

                type !==
                    "narrateur" &&

                type !==
                    "narration" &&

                type !==
                    "pensee" &&

                type !==
                    "systeme"

            );


        if (
            afficherEcriture
        ) {

            const duree =
                this.calculerDureeEcriture(
                    contenuPrepare,
                    options
                );


            const termine =
                await this
                    .afficherIndicateurEcriture(
                        personnage,
                        duree,
                        sequence
                    );


            if (
                !termine
            ) {

                return null;

            }

        }


        /*---------------------------------------------
         VÉRIFICATION AVANT CRÉATION DU MESSAGE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return null;

        }


        /*---------------------------------------------
         CONTENEUR PRINCIPAL
        ---------------------------------------------*/

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*---------------------------------------------
         JOUEUR / AUTRES PERSONNAGES
        ---------------------------------------------*/

        if (
            type ===
                "joueur"
        ) {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        /*---------------------------------------------
         CLASSE PERSONNALISÉE
        ---------------------------------------------*/

        if (
            typeof options.classe ===
                "string" &&
            options.classe.trim() !==
                ""
        ) {

            options.classe
                .trim()
                .split(
                    /\s+/
                )
                .forEach(
                    classe => {

                        if (
                            classe
                        ) {

                            message
                                .classList
                                .add(
                                    classe
                                );

                        }

                    }
                );

        }


        /*---------------------------------------------
         MESSAGE IMPORTANT
        ---------------------------------------------*/

        if (
            options.important ===
                true
        ) {

            message.classList.add(
                "important"
            );

        }


        /*---------------------------------------------
         MESSAGE SECRET
        ---------------------------------------------*/

        if (
            options.secret ===
                true
        ) {

            message.classList.add(
                "secret"
            );

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            type ===
                "systeme"
        ) {

            message.classList.add(
                "message-systeme"
            );

        }


        /*---------------------------------------------
         NARRATION
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            message.classList.add(
                "narration"
            );

        }


        /*---------------------------------------------
         NOM DU PERSONNAGE
        ---------------------------------------------*/

        const nomPersonnage =
            this.obtenirNomPersonnage(
                type
            );


        if (
            nomPersonnage &&
            type !==
                "narrateur" &&
            type !==
                "narration" &&
            type !==
                "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                nomPersonnage;


            message.appendChild(
                nom
            );

        }


        /*---------------------------------------------
         BULLE VIDE
        ---------------------------------------------*/

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        message.appendChild(
            bulle
        );


        /*---------------------------------------------
         AJOUT AU DOM
        ---------------------------------------------*/

        this.conteneur.appendChild(
            message
        );


        /*---------------------------------------------
         SON DU MESSAGE

         Le son est joué une seule fois au moment
         où la bulle commence réellement à apparaître.
        ---------------------------------------------*/

        this.jouerSonDialogue(
            {

                ...options,

                personnage:

                    options.personnage ||

                    options.type ||

                    personnage

            }
        );


        /*---------------------------------------------
         NOTIFICATION ÉVENTUELLE
        ---------------------------------------------*/

        this.jouerSonNotification(
            options
        );


        /*---------------------------------------------
         PREMIER DÉFILEMENT
        ---------------------------------------------*/

        this.defiler();


        /*---------------------------------------------
         VITESSE D'ÉCRITURE

         Plus la valeur est basse,
         plus le texte apparaît rapidement.
        ---------------------------------------------*/

        let delai =
            Number(
                vitesse
            );


        if (
            !Number.isFinite(
                delai
            ) ||
            delai <
                0
        ) {

            delai =
                20;

        }


        /*
         Le JSON peut également définir :

         "vitesseEcriture": 15
        */

        if (
            Number.isFinite(
                Number(
                    options.vitesseEcriture
                )
            )
        ) {

            delai =
                Math.max(
                    0,
                    Number(
                        options.vitesseEcriture
                    )
                );

        }


        /*---------------------------------------------
         TEXTE EN COURS
        ---------------------------------------------*/

        let texteAffiche =
            "";


        /*---------------------------------------------
         ÉCRITURE CARACTÈRE PAR CARACTÈRE
        ---------------------------------------------*/

        for (
            let index = 0;
            index < contenuPrepare.length;
            index += 1
        ) {

            /*-----------------------------------------
             ANNULATION SI NOUVELLE SCÈNE
            -----------------------------------------*/

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                message.remove();


                return null;

            }


            const caractere =
                contenuPrepare[
                    index
                ];


            texteAffiche +=
                caractere;


            /*-----------------------------------------
             AFFICHAGE
            -----------------------------------------*/

            if (
                options.html ===
                    true
            ) {

                /*
                 Pour éviter de casser les balises HTML
                 en cours d'écriture, le mode progressif
                 reste volontairement en texte simple.

                 Le HTML complet sera appliqué une fois
                 l'écriture terminée.
                */

                bulle.textContent =
                    texteAffiche;

            }
            else {

                bulle.textContent =
                    texteAffiche;

            }


            this.defiler();


            /*-----------------------------------------
             PAUSES DE PONCTUATION
            -----------------------------------------*/

            let delaiActuel =
                delai;


            if (
                caractere ===
                    "." ||
                caractere ===
                    "!" ||
                caractere ===
                    "?"
            ) {

                delaiActuel +=
                    180;

            }
            else if (
                caractere ===
                    "," ||
                caractere ===
                    ";" ||
                caractere ===
                    ":"
            ) {

                delaiActuel +=
                    80;

            }
            else if (
                caractere ===
                    "\n"
            ) {

                delaiActuel +=
                    100;

            }


            if (
                delaiActuel >
                0
            ) {

                await this.attendre(
                    delaiActuel
                );

            }

        }


        /*---------------------------------------------
         DERNIÈRE VÉRIFICATION DE SÉQUENCE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            message.remove();


            return null;

        }


        /*---------------------------------------------
         HTML FINAL

         Si le message autorise explicitement le HTML,
         celui-ci n'est injecté qu'après la fin de
         l'écriture progressive.
        ---------------------------------------------*/

        if (
            options.html ===
                true
        ) {

            bulle.innerHTML =
                contenuPrepare;

        }


        /*---------------------------------------------
         ACCESSIBILITÉ
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            bulle.setAttribute(
                "aria-label",
                contenuPrepare
            );

        }
        else {

            bulle.setAttribute(
                "aria-label",
                `${nomPersonnage} : ${contenuPrepare}`
            );

        }


        /*---------------------------------------------
         GALERIE APRÈS ÉCRITURE PROGRESSIVE

         C'est volontairement ici et PAS au début.

         Un média associé au dialogue n'est donc
         débloqué que si :
         - l'indicateur d'écriture est terminé ;
         - le texte entier est apparu ;
         - aucune autre scène n'a remplacé celle-ci.

         Exemple :

         {
             "personnage": "narrateur",
             "texte": "Eva ne recule pas.",
             "galerie":
                 "chap11BaiserFrontAccepte"
         }
        ---------------------------------------------*/

        this.gererGalerieDialogue(
            options
        );


        /*---------------------------------------------
         ANIMATIONS SUPPLÉMENTAIRES
        ---------------------------------------------*/

        if (
            typeof animationManager !==
                "undefined" &&
            animationManager !==
                null
        ) {

            try {

                if (
                    type ===
                        "joueur" &&
                    typeof animationManager
                        .envoi ===
                        "function"
                ) {

                    animationManager
                        .envoi(
                            message
                        );

                }
                else if (
                    type !==
                        "joueur" &&
                    typeof animationManager
                        .reception ===
                        "function"
                ) {

                    animationManager
                        .reception(
                            message
                        );

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur animation du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "dialogueAffiche",
                    {

                        detail: {

                            personnage:
                                type,

                            texte:
                                contenuPrepare,

                            options:
                                options,

                            element:
                                message,

                            progressif:
                                true

                        }

                    }
                )

            );

        }
        catch (
            erreur
        ) {

            /*
             Pas bloquant.
            */

        }


        /*---------------------------------------------
         DERNIER DÉFILEMENT
        ---------------------------------------------*/

        this.defiler();


        return message;

    },


    /*=====================================================
        VÉRIFIER SI UNE CONDITION SIMPLE EST SATISFAITE

        Permet aux dialogues d'avoir éventuellement
        une condition locale.

        Exemple :

        "condition": {
            "relationEva": {
                "min": 5
            }
        }
    =====================================================*/

    verifierConditionMessage(
        condition
    ) {

        if (
            !condition
        ) {

            return true;

        }


        if (
            typeof condition !==
                "object"
        ) {

            return true;

        }


        if (
            typeof moteur !==
                "undefined" &&
            moteur !==
                null &&
            typeof moteur
                .verifierObjetCondition ===
                "function"
        ) {

            try {

                return moteur
                    .verifierObjetCondition(
                        condition
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant la vérification d'une condition :",
                    erreur
                );

            }

        }


        /*
         En l'absence du moteur, on ne bloque pas
         arbitrairement le dialogue.
        */

        return true;

    },


    /*=====================================================
        VÉRIFIER SI UN MESSAGE DOIT ÊTRE AFFICHÉ
    =====================================================*/

    messageEstDisponible(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         MESSAGE DÉSACTIVÉ
        ---------------------------------------------*/

        if (
            message.actif ===
                false
        ) {

            return false;

        }


        /*---------------------------------------------
         CONDITION SIMPLE
        ---------------------------------------------*/

        if (
            message.condition
        ) {

            return this
                .verifierConditionMessage(
                    message.condition
                );

        }


        return true;

    },


    /*=====================================================
        APPLIQUER LES EFFETS D'UN MESSAGE

        Exemple :

        {
            "effet": {
                "confianceEva": 1
            }
        }

        Le moteur reste responsable de la modification
        réelle de l'état du joueur.
    =====================================================*/

    appliquerEffetsMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object" ||
            !message.effet ||
            typeof message.effet !==
                "object"
        ) {

            return false;

        }


        if (
            typeof moteur ===
                "undefined" ||
            moteur ===
                null ||
            typeof moteur
                .appliquerEffets !==
                "function"
        ) {

            return false;

        }


        try {

            moteur
                .appliquerEffets(
                    message.effet
                );


            if (
                typeof moteur
                    .verifierSucces ===
                    "function"
            ) {

                moteur
                    .verifierSucces();

            }


            if (
                typeof moteur
                    .sauvegarder ===
                    "function"
            ) {

                moteur
                    .sauvegarder();

            }


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant l'application des effets du message :",
                erreur
            );


            return false;

        }

    },
        /*=====================================================
        ÉCRIRE UN MESSAGE PROGRESSIVEMENT

        Cette méthode est utilisée lorsqu'un message
        doit apparaître caractère par caractère.

        Le système conserve :
        - l'indicateur d'écriture ;
        - les délais de ponctuation ;
        - l'annulation lors d'un changement de scène ;
        - les sons ;
        - les animations ;
        - la galerie.
    =====================================================*/

    async ecrireProgressivement(
        contenu,
        personnage = "narrateur",
        vitesse = 20,
        options = {}
    ) {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            !this.conteneur
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND ASSOCIÉ AU MESSAGE

         Utile lorsque ecrireProgressivement()
         est appelé directement sans passer
         par afficherScene().
        ---------------------------------------------*/

        if (
            options &&
            typeof options ===
                "object" &&

            typeof moteur !==
                "undefined" &&

            moteur !==
                null &&

            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            try {

                moteur
                    .gererFondDialogue(
                        options
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant le changement de fond du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         PRÉPARATION DU TEXTE
        ---------------------------------------------*/

        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        if (
            !contenuPrepare
        ) {

            return null;

        }


        /*---------------------------------------------
         PERSONNAGE
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         SÉQUENCE ACTIVE

         Si une autre scène démarre,
         sequenceAffichage change et cette écriture
         est immédiatement abandonnée.
        ---------------------------------------------*/

        const sequence =
            this.sequenceAffichage;


        /*---------------------------------------------
         INDICATEUR D'ÉCRITURE
        ---------------------------------------------*/

        const afficherEcriture =

            options.afficherEcriture ===
                true ||

            (

                options.afficherEcriture !==
                    false &&

                type !==
                    "narrateur" &&

                type !==
                    "narration" &&

                type !==
                    "pensee" &&

                type !==
                    "systeme"

            );


        if (
            afficherEcriture
        ) {

            const duree =
                this.calculerDureeEcriture(
                    contenuPrepare,
                    options
                );


            const termine =
                await this
                    .afficherIndicateurEcriture(
                        personnage,
                        duree,
                        sequence
                    );


            if (
                !termine
            ) {

                return null;

            }

        }


        /*---------------------------------------------
         VÉRIFICATION AVANT CRÉATION DU MESSAGE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return null;

        }


        /*---------------------------------------------
         CONTENEUR PRINCIPAL
        ---------------------------------------------*/

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*---------------------------------------------
         JOUEUR / AUTRES PERSONNAGES
        ---------------------------------------------*/

        if (
            type ===
                "joueur"
        ) {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        /*---------------------------------------------
         CLASSE PERSONNALISÉE
        ---------------------------------------------*/

        if (
            typeof options.classe ===
                "string" &&
            options.classe.trim() !==
                ""
        ) {

            options.classe
                .trim()
                .split(
                    /\s+/
                )
                .forEach(
                    classe => {

                        if (
                            classe
                        ) {

                            message
                                .classList
                                .add(
                                    classe
                                );

                        }

                    }
                );

        }


        /*---------------------------------------------
         MESSAGE IMPORTANT
        ---------------------------------------------*/

        if (
            options.important ===
                true
        ) {

            message.classList.add(
                "important"
            );

        }


        /*---------------------------------------------
         MESSAGE SECRET
        ---------------------------------------------*/

        if (
            options.secret ===
                true
        ) {

            message.classList.add(
                "secret"
            );

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            type ===
                "systeme"
        ) {

            message.classList.add(
                "message-systeme"
            );

        }


        /*---------------------------------------------
         NARRATION
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            message.classList.add(
                "narration"
            );

        }


        /*---------------------------------------------
         NOM DU PERSONNAGE
        ---------------------------------------------*/

        const nomPersonnage =
            this.obtenirNomPersonnage(
                type
            );


        if (
            nomPersonnage &&
            type !==
                "narrateur" &&
            type !==
                "narration" &&
            type !==
                "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                nomPersonnage;


            message.appendChild(
                nom
            );

        }


        /*---------------------------------------------
         BULLE VIDE
        ---------------------------------------------*/

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        message.appendChild(
            bulle
        );


        /*---------------------------------------------
         AJOUT AU DOM
        ---------------------------------------------*/

        this.conteneur.appendChild(
            message
        );


        /*---------------------------------------------
         SON DU MESSAGE

         Le son est joué une seule fois au moment
         où la bulle commence réellement à apparaître.
        ---------------------------------------------*/

        this.jouerSonDialogue(
            {

                ...options,

                personnage:

                    options.personnage ||

                    options.type ||

                    personnage

            }
        );


        /*---------------------------------------------
         NOTIFICATION ÉVENTUELLE
        ---------------------------------------------*/

        this.jouerSonNotification(
            options
        );


        /*---------------------------------------------
         PREMIER DÉFILEMENT
        ---------------------------------------------*/

        this.defiler();


        /*---------------------------------------------
         VITESSE D'ÉCRITURE

         Plus la valeur est basse,
         plus le texte apparaît rapidement.
        ---------------------------------------------*/

        let delai =
            Number(
                vitesse
            );


        if (
            !Number.isFinite(
                delai
            ) ||
            delai <
                0
        ) {

            delai =
                20;

        }


        /*
         Le JSON peut également définir :

         "vitesseEcriture": 15
        */

        if (
            Number.isFinite(
                Number(
                    options.vitesseEcriture
                )
            )
        ) {

            delai =
                Math.max(
                    0,
                    Number(
                        options.vitesseEcriture
                    )
                );

        }


        /*---------------------------------------------
         TEXTE EN COURS
        ---------------------------------------------*/

        let texteAffiche =
            "";


        /*---------------------------------------------
         ÉCRITURE CARACTÈRE PAR CARACTÈRE
        ---------------------------------------------*/

        for (
            let index = 0;
            index < contenuPrepare.length;
            index += 1
        ) {

            /*-----------------------------------------
             ANNULATION SI NOUVELLE SCÈNE
            -----------------------------------------*/

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                message.remove();


                return null;

            }


            const caractere =
                contenuPrepare[
                    index
                ];


            texteAffiche +=
                caractere;


            /*-----------------------------------------
             AFFICHAGE
            -----------------------------------------*/

            if (
                options.html ===
                    true
            ) {

                /*
                 Pour éviter de casser les balises HTML
                 en cours d'écriture, le mode progressif
                 reste volontairement en texte simple.

                 Le HTML complet sera appliqué une fois
                 l'écriture terminée.
                */

                bulle.textContent =
                    texteAffiche;

            }
            else {

                bulle.textContent =
                    texteAffiche;

            }


            this.defiler();


            /*-----------------------------------------
             PAUSES DE PONCTUATION
            -----------------------------------------*/

            let delaiActuel =
                delai;


            if (
                caractere ===
                    "." ||
                caractere ===
                    "!" ||
                caractere ===
                    "?"
            ) {

                delaiActuel +=
                    180;

            }
            else if (
                caractere ===
                    "," ||
                caractere ===
                    ";" ||
                caractere ===
                    ":"
            ) {

                delaiActuel +=
                    80;

            }
            else if (
                caractere ===
                    "\n"
            ) {

                delaiActuel +=
                    100;

            }


            if (
                delaiActuel >
                0
            ) {

                await this.attendre(
                    delaiActuel
                );

            }

        }


        /*---------------------------------------------
         DERNIÈRE VÉRIFICATION DE SÉQUENCE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            message.remove();


            return null;

        }


        /*---------------------------------------------
         HTML FINAL

         Si le message autorise explicitement le HTML,
         celui-ci n'est injecté qu'après la fin de
         l'écriture progressive.
        ---------------------------------------------*/

        if (
            options.html ===
                true
        ) {

            bulle.innerHTML =
                contenuPrepare;

        }


        /*---------------------------------------------
         ACCESSIBILITÉ
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            bulle.setAttribute(
                "aria-label",
                contenuPrepare
            );

        }
        else {

            bulle.setAttribute(
                "aria-label",
                `${nomPersonnage} : ${contenuPrepare}`
            );

        }


        /*---------------------------------------------
         GALERIE APRÈS ÉCRITURE PROGRESSIVE

         C'est volontairement ici et PAS au début.

         Un média associé au dialogue n'est donc
         débloqué que si :
         - l'indicateur d'écriture est terminé ;
         - le texte entier est apparu ;
         - aucune autre scène n'a remplacé celle-ci.

         Exemple :

         {
             "personnage": "narrateur",
             "texte": "Eva ne recule pas.",
             "galerie":
                 "chap11BaiserFrontAccepte"
         }
        ---------------------------------------------*/

        this.gererGalerieDialogue(
            options
        );


        /*---------------------------------------------
         ANIMATIONS SUPPLÉMENTAIRES
        ---------------------------------------------*/

        if (
            typeof animationManager !==
                "undefined" &&
            animationManager !==
                null
        ) {

            try {

                if (
                    type ===
                        "joueur" &&
                    typeof animationManager
                        .envoi ===
                        "function"
                ) {

                    animationManager
                        .envoi(
                            message
                        );

                }
                else if (
                    type !==
                        "joueur" &&
                    typeof animationManager
                        .reception ===
                        "function"
                ) {

                    animationManager
                        .reception(
                            message
                        );

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur animation du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "dialogueAffiche",
                    {

                        detail: {

                            personnage:
                                type,

                            texte:
                                contenuPrepare,

                            options:
                                options,

                            element:
                                message,

                            progressif:
                                true

                        }

                    }
                )

            );

        }
        catch (
            erreur
        ) {

            /*
             Pas bloquant.
            */

        }


        /*---------------------------------------------
         DERNIER DÉFILEMENT
        ---------------------------------------------*/

        this.defiler();


        return message;

    },


    /*=====================================================
        VÉRIFIER SI UNE CONDITION SIMPLE EST SATISFAITE

        Permet aux dialogues d'avoir éventuellement
        une condition locale.

        Exemple :

        "condition": {
            "relationEva": {
                "min": 5
            }
        }
    =====================================================*/

    verifierConditionMessage(
        condition
    ) {

        if (
            !condition
        ) {

            return true;

        }


        if (
            typeof condition !==
                "object"
        ) {

            return true;

        }


        if (
            typeof moteur !==
                "undefined" &&
            moteur !==
                null &&
            typeof moteur
                .verifierObjetCondition ===
                "function"
        ) {

            try {

                return moteur
                    .verifierObjetCondition(
                        condition
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant la vérification d'une condition :",
                    erreur
                );

            }

        }


        /*
         En l'absence du moteur, on ne bloque pas
         arbitrairement le dialogue.
        */

        return true;

    },


    /*=====================================================
        VÉRIFIER SI UN MESSAGE DOIT ÊTRE AFFICHÉ
    =====================================================*/

    messageEstDisponible(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         MESSAGE DÉSACTIVÉ
        ---------------------------------------------*/

        if (
            message.actif ===
                false
        ) {

            return false;

        }


        /*---------------------------------------------
         CONDITION SIMPLE
        ---------------------------------------------*/

        if (
            message.condition
        ) {

            return this
                .verifierConditionMessage(
                    message.condition
                );

        }


        return true;

    },


    /*=====================================================
        APPLIQUER LES EFFETS D'UN MESSAGE

        Exemple :

        {
            "effet": {
                "confianceEva": 1
            }
        }

        Le moteur reste responsable de la modification
        réelle de l'état du joueur.
    =====================================================*/

    appliquerEffetsMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object" ||
            !message.effet ||
            typeof message.effet !==
                "object"
        ) {

            return false;

        }


        if (
            typeof moteur ===
                "undefined" ||
            moteur ===
                null ||
            typeof moteur
                .appliquerEffets !==
                "function"
        ) {

            return false;

        }


        try {

            moteur
                .appliquerEffets(
                    message.effet
                );


            if (
                typeof moteur
                    .verifierSucces ===
                    "function"
            ) {

                moteur
                    .verifierSucces();

            }


            if (
                typeof moteur
                    .sauvegarder ===
                    "function"
            ) {

                moteur
                    .sauvegarder();

            }


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant l'application des effets du message :",
                erreur
            );


            return false;

        }

    },
        /*=====================================================
        AFFICHER UNE LISTE DE DIALOGUES

        Compatible avec moteur.js :

        dialogueManager.afficherListe(
            dialogues,
            joueur,
            callback
        );
    =====================================================*/

    async afficherListe(
        dialogues,
        joueur = null,
        callback = null
    ) {

        if (
            !Array.isArray(
                dialogues
            )
        ) {

            if (
                typeof callback ===
                    "function"
            ) {

                callback();

            }

            return;

        }


        const sequence =
            ++this.sequenceAffichage;


        for (
            const message
            of dialogues
        ) {

            /*---------------------------------------------
             INTERRUPTION PAR UNE NOUVELLE SCÈNE
            ---------------------------------------------*/

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                return;

            }


            if (
                !message ||
                typeof message !==
                    "object"
            ) {

                continue;

            }


            /*---------------------------------------------
             CONDITION LOCALE
            ---------------------------------------------*/

            if (
                !this.messageEstDisponible(
                    message
                )
            ) {

                continue;

            }


            /*---------------------------------------------
             FOND DU DIALOGUE
            ---------------------------------------------*/

            if (
                typeof moteur !==
                    "undefined" &&
                moteur !==
                    null
            ) {

                try {

                    if (
                        typeof moteur
                            .gererFondDialogue ===
                            "function"
                    ) {

                        moteur
                            .gererFondDialogue(
                                message
                            );

                    }
                    else if (
                        message.fond &&
                        typeof moteur
                            .changerFond ===
                            "function"
                    ) {

                        const duree =
                            typeof moteur
                                .obtenirDureeTransitionFond ===
                                "function"

                                ? moteur
                                    .obtenirDureeTransitionFond(
                                        message
                                    )

                                : undefined;


                        moteur
                            .changerFond(
                                message.fond,
                                duree
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "dialogue.js : erreur fond dialogue :",
                        erreur
                    );

                }

            }


            /*---------------------------------------------
             TEXTE
            ---------------------------------------------*/

            const texte =
                this.preparerTexteMessage(
                    message
                );


            if (
                !texte
            ) {

                /*
                 Un message sans texte peut quand même
                 porter un effet.
                */

                this.appliquerEffetsMessage(
                    message
                );


                continue;

            }


            const personnage =

                message.personnage ||

                message.type ||

                "narrateur";


            const type =
                this.normaliserPersonnage(
                    personnage
                );


            /*---------------------------------------------
             ÉCRITURE PROGRESSIVE EXPLICITE
            ---------------------------------------------*/

            if (
                message.progressif ===
                    true ||
                message.ecritureProgressive ===
                    true
            ) {

                await this
                    .ecrireProgressivement(
                        texte,
                        personnage,
                        message.vitesseEcriture ??
                            20,
                        message
                    );


                if (
                    sequence !==
                        this.sequenceAffichage
                ) {

                    return;

                }


                this.appliquerEffetsMessage(
                    message
                );


                const pauseProgressive =
                    this.obtenirPauseApresMessage(
                        message
                    );


                if (
                    pauseProgressive >
                    0
                ) {

                    await this.attendre(
                        pauseProgressive
                    );

                }


                continue;

            }


            /*---------------------------------------------
             INDICATEUR D'ÉCRITURE
            ---------------------------------------------*/

            const afficherEcriture =

                message.afficherEcriture ===
                    true ||

                (

                    message.afficherEcriture !==
                        false &&

                    type !==
                        "narrateur" &&

                    type !==
                        "narration" &&

                    type !==
                        "pensee" &&

                    type !==
                        "systeme"

                );


            if (
                afficherEcriture
            ) {

                const duree =
                    this.calculerDureeEcriture(
                        texte,
                        message
                    );


                const termine =
                    await this
                        .afficherIndicateurEcriture(
                            personnage,
                            duree,
                            sequence
                        );


                if (
                    !termine
                ) {

                    return;

                }

            }


            /*---------------------------------------------
             DÉLAI DE NARRATION

             Un délai peut être défini explicitement :

             "delai": 1200

             ou :

             "delaiNarration": 1200
            ---------------------------------------------*/

            const delaiAvant =
                this.obtenirDelaiAvantMessage(
                    message,
                    type
                );


            if (
                delaiAvant >
                0
            ) {

                await this.attendre(
                    delaiAvant
                );


                if (
                    sequence !==
                        this.sequenceAffichage
                ) {

                    return;

                }

            }


            /*---------------------------------------------
             AJOUT DU MESSAGE
            ---------------------------------------------*/

            this.ajouterMessage(
                texte,
                personnage,
                message
            );


            /*---------------------------------------------
             EFFETS DU MESSAGE
            ---------------------------------------------*/

            this.appliquerEffetsMessage(
                message
            );


            /*---------------------------------------------
             PAUSE APRÈS MESSAGE
            ---------------------------------------------*/

            const pause =
                this.obtenirPauseApresMessage(
                    message
                );


            if (
                pause >
                0
            ) {

                await this.attendre(
                    pause
                );

            }

        }


        /*---------------------------------------------
         FIN DE LA LISTE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return;

        }


        if (
            typeof callback ===
                "function"
        ) {

            try {

                callback();

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur dans le callback de fin :",
                    erreur
                );

            }

        }

    },


    /*=====================================================
        AFFICHER PLUSIEURS DIALOGUES

        Variante Promise utilisée par certaines
        versions du moteur.
    =====================================================*/

    async afficherDialogues(
        dialogues,
        joueur = null
    ) {

        return new Promise(
            resolve => {

                this.afficherListe(
                    dialogues,
                    joueur,
                    resolve
                );

            }
        );

    },


    /*=====================================================
        AFFICHER UN SEUL MESSAGE

        Compatible avec :

        dialogueManager.afficher(
            message,
            joueur
        );
    =====================================================*/

    async afficher(
        message,
        joueur = null
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

            return this.ajouterMessage(
                message,
                "narrateur",
                {}
            );

        }


        if (
            typeof message !==
                "object"
        ) {

            return null;

        }


        /*---------------------------------------------
         CONDITION
        ---------------------------------------------*/

        if (
            !this.messageEstDisponible(
                message
            )
        ) {

            return null;

        }


        /*---------------------------------------------
         TEXTE
        ---------------------------------------------*/

        const texte =
            this.preparerTexteMessage(
                message
            );


        if (
            !texte
        ) {

            this.appliquerEffetsMessage(
                message
            );


            return null;

        }


        const personnage =

            message.personnage ||

            message.type ||

            "narrateur";


        /*---------------------------------------------
         ÉCRITURE PROGRESSIVE
        ---------------------------------------------*/

        if (
            message.progressif ===
                true ||
            message.ecritureProgressive ===
                true
        ) {

            const resultat =
                await this
                    .ecrireProgressivement(
                        texte,
                        personnage,
                        message.vitesseEcriture ??
                            20,
                        message
                    );


            this.appliquerEffetsMessage(
                message
            );


            return resultat;

        }


        /*---------------------------------------------
         MESSAGE NORMAL
        ---------------------------------------------*/

        const resultat =
            this.ajouterMessage(
                texte,
                personnage,
                message
            );


        this.appliquerEffetsMessage(
            message
        );


        return resultat;

    },


    /*=====================================================
        OBTENIR LE DÉLAI AVANT UN MESSAGE
    =====================================================*/

    obtenirDelaiAvantMessage(
        message,
        personnage = "narrateur"
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return 0;

        }


        const valeurs = [

            message.delaiAvant,

            message.delai,

            message.delay,

            message.tempsAvant

        ];


        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*
         Les narrations peuvent posséder
         leur propre propriété.
        */

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            valeurs.unshift(
                message.delaiNarration
            );

        }


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
        OBTENIR LA PAUSE APRÈS UN MESSAGE
    =====================================================*/

    obtenirPauseApresMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return this
                .pauseEntreMessages;

        }


        const valeurs = [

            message.pauseApres,

            message.delaiApres,

            message.pause,

            message.afterDelay

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
            .pauseEntreMessages;

    },


    /*=====================================================
        GÉRER LE FOND D'UN MESSAGE

        Cette fonction peut être utilisée directement
        si le moteur ne possède pas gererFondDialogue().
    =====================================================*/

    gererFondMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object" ||
            !message.fond
        ) {

            return false;

        }


        if (
            typeof moteur ===
                "undefined" ||
            moteur ===
                null
        ) {

            return false;

        }


        try {

            if (
                typeof moteur
                    .gererFondDialogue ===
                    "function"
            ) {

                moteur
                    .gererFondDialogue(
                        message
                    );


                return true;

            }


            if (
                typeof moteur
                    .changerFond ===
                    "function"
            ) {

                let duree =
                    undefined;


                if (
                    typeof moteur
                        .obtenirDureeTransitionFond ===
                        "function"
                ) {

                    duree =
                        moteur
                            .obtenirDureeTransitionFond(
                                message
                            );

                }


                moteur
                    .changerFond(
                        message.fond,
                        duree
                    );


                return true;

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant gererFondMessage() :",
                erreur
            );

        }


        return false;

    },


    /*=====================================================
        TRAITER UN MESSAGE COMPLET

        Fonction utilitaire regroupant :
        - condition ;
        - fond ;
        - affichage ;
        - effets.
    =====================================================*/

    async traiterMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return null;

        }


        if (
            !this.messageEstDisponible(
                message
            )
        ) {

            return null;

        }


        this.gererFondMessage(
            message
        );


        const resultat =
            await this.afficher(
                message
            );


        return resultat;

    },


    /*=====================================================
        AFFICHER UNE SCÈNE ET SIGNALER SA FIN

        Variante utilitaire pour les moteurs utilisant
        une Promise plutôt qu'un callback.
    =====================================================*/

    async jouerScene(
        scene
    ) {

        if (
            !scene
        ) {

            return;

        }


        const dialogues =
            Array.isArray(
                scene.dialogues
            )
                ? scene.dialogues
                : [];


        await this.afficherDialogues(
            dialogues
        );

    },
        /*=====================================================
        ANNULER LA SÉQUENCE ACTUELLE

        Incrémente sequenceAffichage afin de rendre
        obsolètes :
        - les indicateurs d'écriture en attente ;
        - les écritures progressives ;
        - les pauses entre messages.
    =====================================================*/

    annulerSequence() {

        this.sequenceAffichage += 1;

    },


    /*=====================================================
        ARRÊTER LES DIALOGUES EN COURS
    =====================================================*/

    arreter() {

        this.annulerSequence();

        /*
         Supprime les éventuels indicateurs d'écriture
         encore présents dans le DOM.
        */

        document
            .querySelectorAll(
                ".message-ecriture"
            )
            .forEach(
                element => {

                    try {

                        element.remove();

                    }
                    catch (
                        erreur
                    ) {

                        /* Rien */

                    }

                }
            );

    },


    /*=====================================================
        NETTOYER LE GESTIONNAIRE
    =====================================================*/

    nettoyer() {

        this.arreter();

        this.dernierPersonnageSonore =
            null;

    },


    /*=====================================================
        RÉINITIALISER COMPLÈTEMENT
    =====================================================*/

    reinitialiser() {

        this.nettoyer();


        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            this.conteneur
        ) {

            this.conteneur.innerHTML =
                "";

        }

    },


    /*=====================================================
        VÉRIFIER SI LE CONTENEUR EXISTE
    =====================================================*/

    estInitialise() {

        return Boolean(
            this.conteneur
        );

    },


    /*=====================================================
        OBTENIR LE CONTENEUR
    =====================================================*/

    obtenirConteneur() {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        return this.conteneur;

    },


    /*=====================================================
        OBTENIR LA SÉQUENCE ACTIVE
    =====================================================*/

    obtenirSequence() {

        return this.sequenceAffichage;

    },


    /*=====================================================
        VÉRIFIER UNE SÉQUENCE
    =====================================================*/

    sequenceValide(
        sequence
    ) {

        return (
            sequence ===
            this.sequenceAffichage
        );

    },


    /*=====================================================
        OBTENIR LA RELATION

        Fonction publique pratique pour le moteur
        ou pour les tests.
    =====================================================*/

    obtenirRelation(
        personnage
    ) {

        return this
            .obtenirRelationPersonnage(
                personnage
            );

    },


    /*=====================================================
        OBTENIR LA CONFIANCE
    =====================================================*/

    obtenirConfiance(
        personnage
    ) {

        return this
            .obtenirConfiancePersonnage(
                personnage
            );

    },


    /*=====================================================
        OBTENIR LES INFORMATIONS D'UN PERSONNAGE
    =====================================================*/

    obtenirInformationsPersonnage(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        return {

            personnage:
                type,

            nom:
                this.obtenirNomPersonnage(
                    type
                ),

            relation:
                this.obtenirRelationPersonnage(
                    type
                ),

            niveauRelation:
                this.obtenirNiveauRelation(
                    type
                ),

            confiance:
                this.obtenirConfiancePersonnage(
                    type
                ),

            niveauConfiance:
                this.obtenirNiveauConfiance(
                    type
                )

        };

    },


    /*=====================================================
        TESTER UN MESSAGE

        Utilisable dans la console :

        dialogueManager.testMessage(
            "eva",
            "Salut !"
        );
    =====================================================*/

    testMessage(
        personnage = "eva",
        texte = "Message de test."
    ) {

        return this.ajouterMessage(
            texte,
            personnage,
            {}
        );

    },


    /*=====================================================
        TESTER UNE NARRATION
    =====================================================*/

    testNarration(
        texte =
            "Narration de test."
    ) {

        return this.ajouterNarration(
            texte
        );

    },


    /*=====================================================
        TESTER L'ÉCRITURE PROGRESSIVE
    =====================================================*/

    async testProgressif(
        personnage =
            "eva",
        texte =
            "Ceci est un message progressif de test."
    ) {

        return this
            .ecrireProgressivement(
                texte,
                personnage,
                20,
                {}
            );

    },


    /*=====================================================
        TESTER LA GALERIE DEPUIS UN DIALOGUE

        Exemple console :

        dialogueManager.testGalerie(
            "chap11BaiserFrontAccepte"
        );
    =====================================================*/

    testGalerie(
        id
    ) {

        if (
            !id
        ) {

            return false;

        }


        return this
            .gererGalerieDialogue(
                {
                    galerie:
                        id
                }
            );

    },


    /*=====================================================
        TESTER UNE NOTIFICATION DE SUCCÈS
    =====================================================*/

    testSucces(
        titre =
            "Succès de test"
    ) {

        return this
            .afficherNotificationSucces(
                titre,
                "Notification de test."
            );

    },


    /*=====================================================
        TESTER UNE INFORMATION
    =====================================================*/

    testInformation(
        texte =
            "Nouvelle information obtenue."
    ) {

        return this
            .afficherInformationPersonnage(
                texte
            );

    },


    /*=====================================================
        TESTER UN CHOIX IMPORTANT
    =====================================================*/

    testChoixImportant(
        texte =
            "Ce choix pourrait avoir des conséquences."
    ) {

        return this
            .afficherChoixImportant(
                texte
            );

    },


    /*=====================================================
        AFFICHER DIRECTEMENT UN DIALOGUE JSON

        Pratique pour les tests :

        dialogueManager.testJSON({
            personnage: "eva",
            texte: "Salut.",
            galerie: "mediaTest"
        });
    =====================================================*/

    async testJSON(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            console.warn(
                "dialogue.js : testJSON() nécessite un objet."
            );


            return null;

        }


        return this
            .afficher(
                message
            );

    },


    /*=====================================================
        FORCER LE DÉFILEMENT
    =====================================================*/

    allerEnBas() {

        this.defiler();

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE EST UNE NARRATION
    =====================================================*/

    estNarration(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        return (

            type ===
                "narrateur" ||

            type ===
                "narration"

        );

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE VIENT DU JOUEUR
    =====================================================*/

    estJoueur(
        personnage
    ) {

        return (

            this.normaliserPersonnage(
                personnage
            ) ===
            "joueur"

        );

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE EST SYSTÈME
    =====================================================*/

    estSysteme(
        personnage
    ) {

        return (

            this.normaliserPersonnage(
                personnage
            ) ===
            "systeme"

        );

    },


    /*=====================================================
        TRAITER UNE GALERIE SANS AFFICHER DE TEXTE

        Cette méthode peut être utile pour un événement
        narratif sans bulle :

        dialogueManager.debloquerGalerie(
            "appelInconnuPremierContact"
        );
    =====================================================*/

    debloquerGalerie(
        galerie
    ) {

        return this
            .gererGalerieDialogue(
                {
                    galerie:
                        galerie
                }
            );

    },


    /*=====================================================
        COMPATIBILITÉ AVEC CERTAINS ANCIENS APPELS

        afficherMessage(
            message,
            joueur
        )
    =====================================================*/

    async afficherMessage(
        message,
        joueur = null
    ) {

        return this.afficher(
            message,
            joueur
        );

    },


    /*=====================================================
        COMPATIBILITÉ : AJOUTER TEXTE

        Exemple :

        dialogueManager.ajouterTexte(
            "Salut",
            "eva"
        );
    =====================================================*/

    ajouterTexte(
        texte,
        personnage =
            "narrateur",
        options = {}
    ) {

        return this
            .ajouterMessage(
                texte,
                personnage,
                options
            );

    },


    /*=====================================================
        COMPATIBILITÉ : AFFICHER TEXTE
    =====================================================*/

    afficherTexte(
        texte,
        personnage =
            "narrateur",
        options = {}
    ) {

        return this
            .ajouterMessage(
                texte,
                personnage,
                options
            );

    }

};


/*=========================================================
 INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            dialogueManager
                .initialiser();

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant l'initialisation :",
                erreur
            );

        }

    }
);


/*=========================================================
 NETTOYAGE AVANT CHANGEMENT DE PAGE
=========================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        try {

            dialogueManager
                .nettoyer();

        }
        catch (
            erreur
        ) {

            /*
             Ne jamais bloquer le changement
             ou la fermeture de la page.
            */

        }

    }
);
