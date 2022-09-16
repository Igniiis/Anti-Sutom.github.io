let lLettres = "abcdefghijklmnopqrstuvwxyz";
let motMax = "##erreur##";
let voyelle = "aeiou";

exports.affichageP1 = function (request,response) {
    let french = affichagePrecis(request.params.mot);
    response.render("test.ejs",{france:french,mot:request.params.mot,lettrePresente:"",lettreImpossible:"",alphabet:lLettres, motConceil: motMax});
}

exports.affichageP2 = function (request,response) {
    let french = affichagePrecis(request.params.mot, request.params.lettrePresente);
    response.render("test.ejs",{france:french,mot:request.params.mot,lettrePresente:request.params.lettrePresente,lettreImpossible:"" ,alphabet:lLettres, motConceil: motMax});
}

exports.affichageP3 = function (request,response) {
    let french = affichagePrecis(request.params.mot, request.params.lettrePresente, request.params.lettreImpossible);
    response.render("test.ejs",{france:french,mot:request.params.mot,lettrePresente:request.params.lettrePresente,lettreImpossible:request.params.lettreImpossible ,alphabet:lLettres, motConceil: motMax});
}

exports.affichageP4 = function (request,response){
    let french = affichagePrecis(request.params.mot,"",request.params.lettreImpossible);
    response.render("test.ejs",{france:french,mot:request.params.mot,lettrePresente:"",lettreImpossible:request.params.lettreImpossible ,alphabet:lLettres, motConceil: motMax});
}



function affichagePrecis(mot,lettrePresente,lettreImpossible) {
    let long = mot.length;
    lettreImpossible = lettreImpossible || "";
    lettrePresente = lettrePresente || "";

    let motLettres = [];

    for(let i = 0; i < mot.length; i++){
        if(mot[i]!="$"){
            motLettres.push( {
                lettre:mot[i],
                place:i
            })
        }
    }

    let verif_multipleLettres = false;
    for (let i = 0; i < lettrePresente.length; i++) {
        if(lettrePresente.lastIndexOf(lettrePresente[i])!=lettrePresente.indexOf(lettrePresente[i])){
            verif_multipleLettres = true;
            break;
        }
    }

    
    let alphabet = "";
    let tabMax = "";

    let french = require('an-array-of-french-words').filter(function(element){
        if(element.includes('-')){ //enlève tout mot avec un "-" dedans
            return false;
        }
        if(element.length!=long){ //enlève tout mot d'une autre taille que celle que l'on veut
            return false;
        }
        
        element = element.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); //enlève tout accent


        for (let i = 0; i < lettreImpossible.length; i++) {
            if(element.includes(lettreImpossible[i])){
                if(lettrePresente.includes(lettreImpossible[i])){
                    if(count(element,lettreImpossible[i])>count(lettrePresente,lettreImpossible[i])){
                        return false;
                    }       // mot: maman
                            // lettrePresente: ma
                            // lettreImpossible: a
                }else{
                    return false;
                }


                if(!lettrePresente.includes(lettreImpossible[i])){
                    return false;
                }
            }
        }

        let test = true;
        let j = 0;
        while(test && j<lettrePresente.length){
            if(!element.includes(lettrePresente[j])){
                return false;
            }else{
                //partie pour vérifier si on a autant de fois le nombre de lettres dans le cas où
                //il y a plusieurs fois les mêmes lettres
                if(verif_multipleLettres){
                    if(element.split(lettrePresente[j]).length<lettrePresente.split(lettrePresente[j]).length){
                        return false;
                    }
                }
            }
            j++;
        }

        for (let i = 0; i < motLettres.length; i++) {
            if(element[motLettres[i].place]!=motLettres[i].lettre){
                return false;
            }
        }

        let tabMaxPotentiel = "";

        for(let i=0;i<element.length;i++){
            if(!alphabet.includes(element[i])){
                alphabet = alphabet+element[i];
            }

            //partie optimisation pour trouver le mot Max

            if (voyelle.includes(element[i])){ // si la lettre en question est une voyelle
                if(!tabMaxPotentiel.includes(element[i])){ //si la liste des voyelles du mots ne possède toujours pas cette voyelle
                    tabMaxPotentiel = tabMaxPotentiel + element[i]; //alors on l'ajoute
                }
            }
        }

        if(tabMaxPotentiel.length>tabMax.length){{
            tabMax = tabMaxPotentiel;
            motMax = element;
        }}

        //return true si tout est bon
        return true;
    });

    lLettres = ordreAlphabetique(alphabet);
    return french;
}


exports.ajoutLettre = function (request,response) {
    
    let mot = request.params.mot;
    let lettreImpossible = request.params.lettreImpossible || "";
    let lettrePresente = request.params.lettrePresente || "";

    let a = request.body.nouvelleLettrePresente || "";
    let b = request.body.nouvelleLettreImpossible || "";

    lettrePresente = lettrePresente + a;
    lettreImpossible = lettreImpossible + b;

    response.redirect(`/poursuite/${mot}/${lettrePresente}/${lettreImpossible}`);
}

function motOpti(listeMot) {
    console.log(listeMot);
    let voyelle = "aeiou";
    let lettreUtile = "tr";
    let motMax = "";
    let tabMax = [];
    for (let i=0; i<listeMot.length; i++) {
        console.log(listeMot[i]);
        let tabLettre = [];
        console.log(voyelle.length);
        for(let j=0; i<voyelle.length;j++){
            // console.log(voyelle[j]);
            if(listeMot[i].includes(voyelle[j])){
                tabLettre.push(voyelle[j]);
            }
        }
        console.log(motMax + "___" + listeMot[i]);
        if(tabMax.length<tabLettre.length){
            motMax = listeMot[i];
            tabMax = tabLettre;
        }
    }
    console.log(motMax);
    return motMax;
}



function ordreAlphabetique(texte) {
    return texte.split('').sort().join('');
}

function count(str, find) {
    return (str.split(find)).length - 1;
}