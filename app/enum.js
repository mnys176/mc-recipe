/************************************************************
 * Title:       enum.js                                     *
 * Author:      Mike Nystoriak (mike.nystoriak@sapns2.com)  *
 * Created:     08/31/2021                                  *
 * Description: Enumerations for the MC Recipe application. *
 ************************************************************/

const units = {
    time: {
        DAYS: 'd',
        HOURS: 'h',
        MINUTES: 'm'
    },
    imperial: {
        GALLONS: 'gal',
        QUARTS: 'qt',
        PINTS: 'pt',
        CUPS: 'c',
        TABLESPOONS: 'tbsp',
        TEASPOONS: 'tsp',
        OUNCES: 'oz',
        POUNDS: 'lb'
    },
    metric: {
        KILOGRAMS: 'kg',
        GRAMS: 'g',
        MILLIGRAMS: 'mg',
        LITERS: 'L',
        MILLILITERS: 'mL'
    },
    misc: {
        PIECES: 'pieces',
        TO_TASTE: 'to taste'
    }
}

module.exports = units