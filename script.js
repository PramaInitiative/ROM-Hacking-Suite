'use strict';

/*!
 *
 * GBZ80 to Items - script.min.js
 * Version 2.1
 * Build date : ??/??/????
 *
 * Scripté par ISSOtm
 * Tous droits réservés à ISSOtm (@ecpensiveLife) et PRAMA Initiative (@PramaTheTrust)
 *
 * Toute ou partie de ce scipt ne peut être recopié qu'avec l'autorisation expresse de ISSOtm et de PRAMA Initiative.
 * De plus, ces deux noms devront être mentionnés dans l'en-tête du script dans lequel elles se trouveront.
 *
 * Remerciements aux équipes de jQuery (http://jquery.org) et de Bootstrap (http://getbootstrap.com) pour leur fantastique travail.
 * Merci à l'auteur des Glyphicons Halflings pour avoir mis gratuitement à disposition de Boostrap certaines de ses créations.
 * Merci enfin à PRAMA Initiative pour avoir hébergé ce script !
 *
 */
/*if(navigator.appName === 'Microsoft Internet Explorer' && navigator.appVersion.match(/^4\.0/) !== null) {
    throw new Error('Les versions 5 à 8 d\'Internet Explorer ne sont plus supportées par GBZ80 to Items. Veuillez passer à une version supérieure.');
}*/

if('undefined' === typeof $) {
    if('undefined' === typeof jQuery) {
        throw new Error('jQuery est requis !!');
    } else {
        var $ = jQuery;
    }
}



// ###############
// #             #
// #  POLYFILLS  #
// #             #
// ###############
// IE8- users, be warned, as these polyfills will be abandoned as soon as this script migrates to jQuery 2.x !





// #############################
// #                           #
// #  FONCTIONS INDÉPENDANTES  #
// #                           #
// #############################

var Utilities = { // Les fonctions utilitaires qui traînaient en vrac.
    typeOf: function(a) { // Retourne le type de A. Similaire à typeof, mais retourne 'array' si A est un array, 'NaN' si A vaut NaN, et 'null' si A vaut null.
        return typeof a === 'number' && isNaN(a) ? 'NaN' : Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a;
    }, // N'utiliser que si différencier Arrays et Objects ainsi que NaNs et nulls du reste est important.
    replaceIfType: function(a, b, t) { // Retourne A si Utilities.typeOf(A) === T, ou si T est un array, si Utilities.typeOf(A) se trouve dans T ; retourne B sinon. Si T vaut undefined, Utilities.typeOf(B) est utilisé à la place.
        t = t || Utilities.typeOf(b);
        return (Utilities.typeOf(t) === 'array' ? t.indexOf(Utilities.typeOf(a)) : t === Utilities.typeOf(a)) ? a : b; // Utilities.typeOf(A) est utilisé pour éviter le remplacement d'objects par des arrays et vice-versa.
    },
    isNumber: function(n) { // Est un peu plus poussé que typeof n === 'number'.
        function _(a) {
            return typeof a === 'number' && !isNaN(a);
        }

        return _(n) || _(parseInt(n));
    },
    isInt: function(n) { // Retourne vrai si l'argument est un entier naturel.
        return Utilities.isNumber(n) && n >= 0 && Math.floor(n) === n;
    }
},



// ############################
// #                          #
// #  DÉFINITION DES OPTIONS  #
// #                          #
// ############################

options = Utilities.replaceIfType(options, {}), defaultOptions = {
    debug: false,
    useStrict: false // Actuellement inutilisé, mais ça pourra servir un jour.
}, i;
for(i in defaultOptions) { // On ajoute simplement les options si elles ne sont pas déjà présentes
    options[i] = Utilities.replaceIfType(options[i], defaultOptions[i]);
}




// ##########################
// #                        #
// #  DÉFINITION DU KERNEL  #
// #                        #
// ##########################
var Kernel = {
        debug: {
            log: function(message) {
                if(options.debug) {
                    console.log(message);
                }
            },
            info: function(message) {
                if(options.debug) {
                    console.info(message);
                }
            },
            warn: function(message) {
                if(options.debug) {
                    console.warn(message);
                }
            },
            raise: function(exception) {
                swal({title: 'Oh zut !', text: exception, type: 'error', allowEscapeKey: true, allowOutsideClick: true, confirmButtonClass: 'btn-danger'});
                console.exception(exception);
                if(options.debug) {
                    console.log('Stack trace :');
                    console.trace();
                    console.groupEnd();
                }
                throw new Error(exception);
            },
            strictOnlyRaise: function(exception) { // Inutilisé car le mode Strict n'est pas utilisé.
                if(options.useStrict) {
                    warn('STRICT-ONLY EXCEPTION RAISED !');
                    raise(exception);
                }
            },
            group: function(title) {
                if(options.debug) {
                    console.group(title);
                }
            },
            groupEnd: function(title) {
                if(options.debug) {
                    console.groupEnd();
                }
            }
        },
        hexCharList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    };


Kernel.debug.group('Chargement en cours...');
Kernel.debug.info('Le kernel a été chargé.');



// ######################################
// #                                    #
// #  FONCTIONS DE CONVERSION DE BASES  #
// #                                    #
// ######################################

function decToHex(input, minChars) { // Tansforme un nombre en son équivalent hexadécimal. On peut spécifier un nombre minimal de caractères, pour forcer par exemple un format 'à l'octet' : ld a, $01
    if(!Utilities.isInt(input)) { // On veut convertir un nombre !
        Kernel.debug.raise('input : Nombre attendu, ' + input + ' obtenu.');
    }
    minChars = minChars || 1; // On attend au moins un chiffre par défaut.
    if(!Utilities.isInt(minChars)) { // Si minChars n'est pas un entier, ça va pas.
        Kernel.debug.raise('minChars : Nombre attendu, ' + minChars + ' obtenu.');
    }
    var valeur = ''; // La valeur retour est d'abord vide.
    while(input !== 0) { // Tant que l'input n'est pas nulle...
        valeur = Kernel.hexCharList[input % 16] + valeur; // On ajoute un signe hexadécimal en fonction du premier nybble de l'input.
        input = Math.floor(input / 16); // On divise l'input par 16, puis on arrondit pour passer au nybble suivant.
        minChars--; // On a généré un chiffre, ça fait un de moins à bourrer.
    }
    if(minChars > 0) { // On bourre de zéros pour remplir le nombre minimum de caractères demandé.
        valeur = '0'.repeat(minChars) + valeur;
    }
    return valeur;
}

function hexToDec(input) { // Convertit un nombre hexadécimal (sous forme de chaîne de caractères) en nombre décimal.
    if(typeof input !== 'string') { // On attend une chaîne de caractères.
        Kernel.debug.raise('input : String expected.');
    }
    if(!/^[0-9A-F]+$/.test(input)) { // On teste si la chaîne correspond à un nombre hexadécimal.
        Kernel.debug.raise('input : heaxdecimal parsing failed.');
    }
    var valeur = 0;
    while(input !== '') {
        valeur = valeur * 16 + Kernel.hexCharList.indexOf(input.charAt(0)); // On ajoute le nybble suivant.
        input = input.slice(1); // On a parsé un caractère.
    }
    return valeur;
}

function binToDec(input) { // Convertit un nombre binaire (sous forme de chaîne de caractères) en nombre décimal.
    if(typeof input !== 'string') { // On attend une chaîne de caractères.
        Kernel.debug.raise('input : String expected.');
    }
    var valeur = 0;
    while(input !== '') {
        valeur *= 2; // On passe au bit suivant.
        if(input.charAt(0) === '1') { // Si c'est un '1', on incrémente.
            valeur++;
        } else if(input.charAt(0) !== '0') { // Sinon, on devrait avoir un '0'.
            Kernel.debug.raise('input : binary parsing failed.'); // Sinon la chaîne n'est pas valide.
        }
        input = input.slice(1); // On a parsé un bit.
    }
    return valeur;
}

Kernel.debug.info('Fonctions de conversion de bases chargées !');



// ##############################
// #                            #
// #  CONSTRUCTEURS DE CLASSES  #
// #                            #
// ##############################

// Espace réservé pour usage futur.
// Code...

Kernel.debug.info('Constructeurs de classe chargés !');



// ###########################
// #                         #
// #  FONCTIONS UTILITAIRES  #
// #                         #
// ###########################

var ptrConversion = {
    parseGBptr: function(GBptr) {
        return /^[0-9A-F]{1,2}:[0-9A-F]{1,4}$/.test(GBptr);
    },
    parseROMofs: function(ROMofs) {
        return /^[0-9A-F]{1,6}$/.test(ROMofs);
    },
    init: function() {
        $('#parseGBptr').click(function() {
            var ptr = $('#GBptr').val().toUpperCase();
            if(ptrConversion.parseGBptr(ptr)) {
                ptr = ptr.split(':');
                ptr = [/* Banque */ hexToDec(ptr[0]) - 1, /* Pointeur interne */ hexToDec(ptr[1])];
                if(ptr[0] === -1) { // Banque 0, c'est particulier
                    if(ptr[1] < 16384) {
                        $('#ROMofs').val(decToHex(ptr[1], 5));
                    } else {
                        Kernel.debug.raise('Le pointeur doit être compris entre 0000 et 3FFF !');
                    }
                } else if (ptr[0] < 127) { // On ne peut être qu'au maximum sur la banque 7F (127)
                    if(ptr[1] < 32768 && ptr[1] > 16383) {
                        $('#ROMofs').val(decToHex(ptr[0] * 16384 + ptr[1], 5));
                    } else {
                        Kernel.debug.raise('Le pointeur être compris entre 4000 et 7FFF !');
                    }
                } else {
                    Kernel.debug.raise('L\'ID de banque ne doit pas valoir plus de 7F !');
                }
            } else {
                Kernel.debug.raise('Veuillez entrer un pointeur compris entre 00:0000 et 7F:7FFF !');
            }
        });
        $('#parseROMofs').click(function() {
            var ptr = $('#ROMofs').val().toUpperCase();
            if(ptrConversion.parseROMofs(ptr)) {
                ptr = hexToDec(ptr);
                if(ptr < 2097152) {
                    ptr = [/* Banque */ Math.floor(ptr / 16384), /* Pointeur interne */ ptr % 16384 + 16384];
                    if(ptr[0] === 0) {
                        ptr[1] -= 16384;
                    }
                    $('#GBptr').val(decToHex(ptr[0], 2) + ':' + decToHex(ptr[1], 4));
                } else {
                    Kernel.debug.raise('L\'offset ne doit pas dépasser 1FFFFF !');
                }
            }
        });
    }
}, ptrLocation = {
    minimums: [256, 16384, 32768, 38912, 39936, 40960, 49152, 57344, 65024, 65184, 65280, 65408, 65535],
    init: function() {
        $('#locatePtr').click(function() {
            var ptr = $('#locPtr').val().toUpperCase(), i = 0;
            $('#loc td').removeClass('bg-info');
            if(/^[0-9A-F]{1,4}$/.test(ptr)) {
                while(hexToDec(ptr) >= ptrLocation.minimums[i]) {
                    i++;
                }
                setTimeout(function() {
                    $('#loc' + i + ' td').addClass('bg-info');
                }, 500);
            } else {
                Kernel.debug.raise('Veuillez entrer un pointeur GB valide (0000-FFFF) !');
            }
        });
    }
}, mapToBank = {
    banques: ['06', '06', '06', '06', '11', '06', '06', '06', '07', '14', '14', '01', '07', '15', '15', '15', '15', '16', '12', '16', '15', '16', '16', '16', '15', '15', '16', '16', '15', '16', '15', '14', '15', '14', '14', '14', '14', '12', '17', '06', '07', '11', '07', '07', '07', '1D', '07', '17', '07', '17', '17', '18', '17', '17', '17', '07', '1D', '07', '17', '12', '14', '12', '07', '07', '17', '17', '07', '17', '12', '07', '07', '17', '15', '07', '17', '17', '07', '17', '17', '07', '07', '12', '11', '07', '12', '07', '12', '12', '07', '17', '16', '17', '17', '07', '07', '18', '18', '11', '18', '18', '18', '18', '18', '18', '18', '1D', '1D', '1D', '17', '1D', '1D', '1D', '1D', '16', '1D', '1D', '1D', '1D', '16', '18', '1D', '18', '18', '15', '12', '12', '12', '12', '12', '12', '12', '12', '07', '12', '12', '12', '12', '12', '12', '12', '12', '17', '18', '18', '18', '18', '18', '18', '18', '07', '17', '07', '07', '1D', '1D', '1D', '1D', '1D', '1D', '11', '11', '11', '11', '15', '15', '11', '1D', '1D', '1D', '1D', '1D', '1D', '1D', '1D', '06', '1D', '17', '17', '17', '07', '17', '17', '17', '07', '12', '12', '12', '12', '07', '15', '12', '12', '11', '07', '14', '12', '06', '18', '11', '11', '11', '11', '11', '11', '01', '01', '01', '16', '16', '06', '06', '06', '14', '15', '14', '14', '14', '11', '11', '12', '11', '11', '12', '11', '11', '11', '11', '11', '1D', '07', '1D', '01', '11', '17', '16', '18', '11', '11', '11', '13', '13', '11', '11', '11', '11', '1D', '1D', '1D', '3E', '90', 'E0', 'B0', 'E0', '4A', 'AF', 'E0'],
    pointeurs: ['42A1', '4357', '4554', '474E', '4000', '4998', '4000', '4BA7', '4000', '491E', '49A4', '49A4', '40C3', '4000', '41E6', '4390', '4581', '4000', '4000', '412D', '4686', '42D4', '44BE', '466D', '480C', '4999', '492C', '4ADA', '4B20', '4C38', '4E78', '40F1', '4FFF', '4000', '433F', '4682', '479B', '415C', '40A4', '5B34', '4B02', '4251', '5462', '5540', '557D', '48E4', '5EA7', '556F', '5EE4', '55BC', '5644', '5101', '40EB', '430B', '437B', '55E7', '4CE9', '563C', '4578', '59BB', '5A39', '5CFE', '5679', '56EA', '4636', '46A4', '5730', '4880', '52C2', '5679', '5F2A', '5691', '6243', '6034', '56D7', '56D7', '60F7', '5714', '5751', '61BE', '6280', '53AD', '44D0', '62BD', '53FF', '65B1', '5447', '54F7', '6761', '497A', '5B64', '49CC', '4A11', '5AF3', '5B49', '5259', '5393', '4926', '5622', '56A2', '57A7', '5889', '596A', '5B3F', '5D49', '62A2', '62A2', '62A2', '59F2', '62A2', '62A2', '62A2', '62A2', '62A2', '62A2', '62A2', '62A2', '62A2', '6492', '5F1A', '5F53', '5F3E', '4F7A', '60E9', '4219', '434A', '43C9', '45F4', '4688', '472E', '4784', '485F', '5D31', '48AC', '48FE', '4BAF', '505C', '50E3', '5144', '5201', '525C', '48C5', '4420', '44E6', '46C0', '47EA', '4926', '4AE3', '4CF9', '589F', '4917', '59A5', '5D7F', '5055', '50A0', '50F2', '520A', '547A', '571C', '6309', '6445', '6581', '678D', '6064', '6170', '42A3', '5783', '5BC2', '5C57', '5CBD', '5D67', '5E62', '5EB4', '5EB4', '5C54', '5EF9', '4C5D', '4D49', '4FF9', '5DD4', '53F1', '5436', '551D', '5E33', '55F5', '563D', '56B1', '57FE', '65EF', '6473', '5869', '5968', '47DD', '667A', '5794', '5553', '5C0B', '5F62', '4974', '4BBE', '4E1B', '5219', '5451', '5704', '5704', '5704', '5704', '5CE5', '5F4F', '5D04', '5F30', '61A2', '5B58', '64F8', '5FCF', '61E5', '63B0', '585F', '599F', '61A8', '5BA6', '5CE1', '630A', '5D1E', '5D69', '5DB4', '5DFF', '5EE4', '4D48', '5A09', '4E45', '56B1', '5FDF', '57A3', '612D', '60EE', '57B4', '5CE5', '5CE5', '7D04', '7D71', '5CE5', '5CE5', '5CE5', '5CE5', '61B1', '630C', '6463', '1C06', '7F21', 'C348', '35F3', 'FF3E', '6BEA', 'CDCD', '1241'],
    init: function() {
        $('#mapToBank').click(function() {
            var map = $('#map').val().toUpperCase();
            if(/^[0-9A-F]{1,2}$/.test(map)) {
                map = hexToDec(map);
                $('#bank').text(mapToBank.banques[map]);
                $('#pointer').text(mapToBank.pointeurs[map]);
                $('#rom').text(decToHex((hexToDec(mapToBank.banques[map]) - 1) * hexToDec('4000') + hexToDec(mapToBank.pointeurs[map])));
            } else {
                Kernel.debug.raise('Veuillez entrer un ID de map (entre 00 et FF) !');
            }
        });
    }
}, headerGenerator = {
    init: function() {
        $('#generateHeader').click(function(){
            var str = '', val = 0;
            $('#collapseFour input').each(function() {
                if(!$(this).is('#header7')) {
                    val = $(this).val().toUpperCase();
                    if(/^[0-9A-F]{1,4}/.test(val) && hexToDec(val) < $(this).attr('data-max')) {
                        val = hexToDec(val);
                        str += ' ' + ($(this).attr('placeholder') === '0000-FFFF' ? decToHex(val, 4).slice(2) + ' ' + decToHex(val, 2).slice(0, 2) : decToHex(val, 2));
                    } else {
                        Kernel.debug.raise('Veuillez entrer des valeur valides !');
                    }
                } else {
                    str += ' ' + $(this).val();
                }
            });
            $('#collapseFour .panel-primary .panel-body').text(str.slice(1));
        });
    }
}, mapCoGenerator = {
    connexions: {active: [false, false, false, false], data: []},
    init: function() {
        $('#mapCoWizard').on('actionclicked.fu.wizard', function(e, data) { // Quand on change d'étape.
            if(data.step === 5 && data.direction === 'next') { // Si on arrive à la dernière, on compile.
                var str = 0;
                mapCoGenerator.connexions.active.forEach(function(me) {
                    str *= 2; // On avance d'un bit.
                    if(me) {
                        str++; // Si la connexion est active, on met le bit à 1.
                    }
                });
                str = decToHex(str, 2); // On passe dans la base qui nous intéresse
                mapCoGenerator.connexions.data.forEach(function(me) {
                    str += ' ' + me.join(' '); // On met bout à bout toutes les données
                });
                $('#mapCoOutput').val(str.replace(/ {2,4}/, ' ').trimRight()).select(); // On vire les espaces multiples et l'espace (éventuel) de droite
            } else if(data.step !== 5) { // Sinon, on valide.
                mapCoGenerator.connexions.data[data.step-1] = []; // On reset les données.
                mapCoGenerator.connexions.active[data.step-1] = $('#mapCoWizard .step-pane.active .btn').hasClass('active'); // On modifie l'attribut d'activité.
                if(mapCoGenerator.connexions.active[data.step-1]) { // Si la connexion est active, on la parse. Sinon osef.
                    $('#mapCoWizard .step-pane.active input').each(function() { // Pour chaque input du panneau actif,
                        var val = hexToDec($(this).val().toUpperCase()); // On récupère la valeur.
                        if(($(this).attr('placeholder') === '0000-FFFF' ? /^[0-9A-F]{1,4}$/ : /^[0-9A-F]{1,2}$/).test(val)) { // On vérifie qu'elle va bien.
                            mapCoGenerator.connexions.data[data.step-1].push($(this).attr('placeholder') === '0000-FFFF' ? decToHex(val, 4).slice(2) + ' ' + decToHex(val, 2).slice(0, 2) : decToHex(val, 2)); // Si oui, on l'ajoute.
                        } else { // Sinon, erreur !
                            $(this).parent().parent().parent().removeClass('has-error has-feedback').children('span').remove(); // On vire l'erreur précédente.
                            $(this).parent().parent().parent().append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span><span class="sr-only">(erreur)</span>').addClass('has-error has-feedback'); // On rajoute l'erreur.
                            Kernel.debug.raise('Veuillez entrer des valeurs valides !'); // L'erreur proprement dite.
                        }
                    });
                }
            }
        });
        $('#mapCoWizard input').focus(function() { // Quand on met le focus sur un input, on reset son état d'erreur.
            $(this).parent().parent().parent().removeClass('has-error has-feedback').children('span').remove();
        });
        $('#mapCoWizard .step-content .btn').click(function() { // Le switch d'activation de la connexion.
            $(this).toggleClass('btn-danger btn-success').siblings('.control-group').find('input')[$(this).hasClass('active') ? 'attr' : 'removeAttr']('disabled', 'disabled'); // Le second argument est ignoré par removeAttr, on peut le laisser pour attr.
        }).trigger('click'); // Firefox retient les attributs des input, on exécute donc un clic "virtuel" pour stabiliser l'état.
    }
}, strConverter = {
    conversions: {
        prefixes: {
            prefixes: ['text', 'line', 'para', 'cont', 'done'],
            indexes: ['00', '4F', '51', '55', '57']
        }, chars: {
            chars:   [' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                      '(', ')', ':', ';', '[', ']',
                      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                      'à', 'è', 'é', 'ù', 'ß', 'ç', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ë', 'ï', 'â', 'ô', 'û', 'ê', 'î',
                      '\'', '-', '+', '?', '!', '.', '$', '*', '/', ',',
                      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            indexes: ['7F', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8A', '8B', '8C', '8D', '8E', '8F', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
                      '9A', '9B', '9C', '9D', '9E', '9F',
                      'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
                      'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'CA', 'CB', 'CC',
                      'E0', 'E3', 'E4', 'E6', 'E7', 'E8', 'F0', 'F1', 'F3', 'F4',
                      'F6', 'F7', 'F8', 'F9', 'FA', 'FB', 'FC', 'FD', 'FE', 'FF']
        }, specialChars: [
            {ida: '54', chars: 'POKé'},
            {ida: '5B', chars: 'PC'},
            {ida: '5C', chars: 'CT'},
            {ida: '5D', chars: 'DRES.'},
            {ida: '5E', chars: 'ROCKET'},
            {ida: '75', chars: '...'},
            {ida: 'D4', chars: 'c\''},
            {ida: 'D5', chars: 'd\''},
            {ida: 'D6', chars: 'j\''},
            {ida: 'D7', chars: 'l\''},
            {ida: 'D8', chars: 'm\''},
            {ida: 'D9', chars: 'n\''},
            {ida: 'DA', chars: 'p\''},
            {ida: 'DB', chars: 's\''},
            {ida: 'DC', chars: '\'s'},
            {ida: 'DD', chars: 't\''},
            {ida: 'DE', chars: 'u\''},
            {ida: 'DF', chars: 'y\''},
            {ida: 'E1', chars: 'PK'},
            {ida: 'E2', chars: 'MN'}
        ]
    }, init: function() {
        $('#strToHex').click(function() {
            var inputs = $('#str').val().split('\n'), hexedStr = '';
            inputs.forEach(function(me, index) { // Pour chaque ligne,
                var i = -1;
                do {
                    i++;
                    if(i === 5) {
                        Kernel.debug.raise('Ligne ' + (index + 1) + ' invalide !\nVeuillez entrer un des préfixes suivants \n' + strConverter.conversions.prefixes.prefixes.join(', ') +'\navant le texte !');
                    }
                } while(!me.startsWith(strConverter.conversions.prefixes.prefixes[i])); // Tant qu'on n'a pas trouvé le bon préfixe, on continue !
                hexedStr += ' ' + strConverter.conversions.prefixes.indexes[i]; // On ajoute le préfixe.
                if(i === 4) { // "done"
                    return;
                }
                me = me.slice(6); // On enlève le préfixe, l'espace et le premier guillemet.
                if(!/^[ A-Z():;\[\]a-zàèéùßçÖÜäöüëïâôûî'+?!.$*\/,0-9-]+"$/.test(me)) { // On vérifie qu'après nous, il n'y a que les caractères acceptés et un " pour terminer.
                    Kernel.debug.raise('Ligne ' + (index + 1) + ' invalide !\nSeuls les caractères suivants sont acceptés :\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\nàèéùßçÖÜäöüëïâôûî\n():; []\'+-?!.*\/,\n0123456789\n\nDe plus, une seule commande de texte par ligne est acceptée !');
                }
                if(me.length > 19) {
                    Kernel.debug.raise('Ligne ' + (index+1) + ' invalide !\nIl ne peut pas y avoir plus de 12 caractères\npar ligne !');
                }
                while(me !== '"') { // Tant qu'il reste des caractères à parser,
                    i = '';
                    strConverter.conversions.specialChars.forEach(function(current) {
                        if(me.startsWith(current.chars)) {
                            i = current;
                        }
                    });
                    if(i === '') {
                        i = strConverter.conversions.chars.chars.indexOf(me.charAt(0)); // On cherche le caractère actuel,
                        hexedStr += ' ' + strConverter.conversions.chars.indexes[i]; // On le parse,
                        me = me.slice(1); // Et on le vire.
                    } else {
                        hexedStr += ' ' + i.ida;
                        me = me.slice(i.chars.length);
                    }
                }
            });
            $('#hexedStr').text(hexedStr); // Résultat final !
        });
    }
},objectDataGenerator = {
    eventDisplacement: function(largeur, Y, X) { // EVENT_DISP largeur, Y, X
        return 50927 + (largeur + 6) * Y + largeur + X; // Vérifier la formule
    }, init: function() {
        $('#generateObject').click(function() {
            var finalStr = '';
            
        });
    }
};

Kernel.debug.info('Toutes les fonctions ont été chargées.');



// #####################
// #                   #
// #  INITIALISATIONS  #
// #                   #
// #####################

$(window).load(function() { // Une fois que le DOM est chargé,
    Kernel.debug.info('Le DOM est chargé.');


    // Empêche les formulaires classés 'prevent-submit' d'être envoyés
    $('form.prevent-submit').submit(function(e){e.preventDefault();});


    // PTR Conversion
    ptrConversion.init();


    // PTR location
    ptrLocation.init();


    // Map To Bank
    mapToBank.init();


    // Header Generator
    headerGenerator.init();


    // mapCo Generator
    mapCoGenerator.init();


    // String converter
    strConverter.init();

    // Konami Code. Si vous ne connaissez pas, vous êtes indigne de ce code !
    var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";
    $(window).keydown(function(e) {
        kkeys.push(e.keyCode);
        if (kkeys.toString().indexOf(konami) >= 0) {
            alert('Vous utilisez Mega Canne !');
            alert('Ca mord !');
            alert('Un MISSINGNO. sauvage apparaît !');
            kkeys = '';
            while(kkeys.length < 12) {
                kkeys += String.fromCharCode(Math.floor(Math.rand() * 100));
            }
            alert(kkeys);
            kkeys = [];
        }
    });


    Kernel.debug.info('Le script est totalement chargé et initialisé. Bonne utilisation !');
    Kernel.debug.groupEnd();
});


/*!
Si tu comprends ce code, tu auras le droit de manger un bonbon !
___    .-'''-.    ___
\  \  /\ \ \ \\  /  /
 }  \/\ \ \ \ \\/  {
 }  /\ \ \ \ \ /\  {
/__/  \ \ \ \ /  \__\
       '-...-'
*/
