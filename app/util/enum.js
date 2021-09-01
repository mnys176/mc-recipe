/************************************************************
 * Title:       enum.js                                     *
 * Author:      Mike Nystoriak (mnystoriak@gmail.com)       *
 * Created:     08/31/2021                                  *
 * Description: Enumerations for the MC Recipe application. *
 ************************************************************/

const units = {
    time: { DAYS: 'd', HOURS: 'h', MINUTES: 'm' },
    volume: {
        imperial: {
            GALLONS: 'gal',
            QUARTS: 'qt',
            PINTS: 'pt',
            CUPS: 'c',
            TABLESPOONS: 'tbsp',
            TEASPOONS: 'tsp'
        },
        metric: { LITERS: 'L', MILLILITERS: 'mL' }
    },
    mass: {
        imperial: { OUNCES: 'oz', POUNDS: 'lb' },
        metric: {
            KILOGRAMS: 'kg',
            GRAMS: 'g',
            MILLIGRAMS: 'mg'
        }
    },
    misc: { PIECES: 'pieces', TO_TASTE: 'to taste' }
}

module.exports = units