/************************************************************
 * Title:       enum.js                                     *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/31/2021                                  *
 * Description: Enumerations for the MC Recipe application. *
 ************************************************************/

const time = {
    DAYS: 'd',
    HOURS: 'h',
    MINUTES: 'm'
}

const volume = {
    // imperial
    GALLONS: 'gal',
    QUARTS: 'qt',
    PINTS: 'pt',
    CUPS: 'c',
    TABLESPOONS: 'tbsp',
    TEASPOONS: 'tsp',

    // metric
    LITERS: 'L',
    MILLILITERS: 'mL'
}

const mass = {
    // imperial
    OUNCES: 'oz',
    POUNDS: 'lb',

    // metric
    KILOGRAMS: 'kg',
    GRAMS: 'g',
    MILLIGRAMS: 'mg'
}

const misc = {
    PIECES: 'pieces',
    TO_TASTE: 'to taste'
}

module.exports = {
    time,
    volume,
    mass,
    misc
}