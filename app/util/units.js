/******************************************************
 * Title:       units.js                              *
 * Author:      Mike Nystoriak (mnystoriak@gmail.com) *
 * Created:     09/01/2021                            *
 * Description:                                       *
 *     Contains a plethora of classes that can be     *
 *     used to represent a quantity with units        *
 *     This has many applications, but most notably   *
 *     converting from one unit to another.           *
 ******************************************************/

const units = require('./enum')

/**
 * A class to represent a quantity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 */
const Unit = class {
    #value

    constructor(value) {
        if (this.constructor === Unit) {
            const message = `Abstract \`${this.constructor.name}\`` +
                            ' cannot be instantiated.'
            throw new Error(message)
        }
        this.#value = value
    }

    get value() { return this.#value }

    set value(value) { this.#value = value }
}

/**
 * A class to represent a quantities that are represented in the
 * context of time.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 * @augments Unit
 */
const TimeUnit = class extends Unit {
    constructor(value) {
        super(value)
        if (this.constructor === TimeUnit) {
            const message = `Abstract \`${this.constructor.name}\`` +
                            ' cannot be instantiated.'
            throw new Error(message)
        }
    }

    static relatedUnits() {
        return [
            units.time.DAYS,
            units.time.HOURS,
            units.time.MINUTES
        ]
    }
    static totalTime(times) {
        if (!times || !(times instanceof Array)) {
            const message = 'No `times` array was supplied.'
            throw new Error(message)
        }
        times.forEach(t => {
            if (!this.relatedUnits().includes(t.units)) {
                const message = 'Must be an array of type `TimeUnit`.'
                throw new Error(message)
            }
        })
        return times.map(t => t.normalized).reduce((a, c) => a + c)
    }
}

/**
 * A class to represent a quantities that are represented in the
 * context of volume.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 * @augments Unit
 */
const VolumeUnit = class extends Unit {
    constructor(value) {
        super(value)
        if (this.constructor === VolumeUnit) {
            const message = `Abstract \`${this.constructor.name}\`` +
                            ' cannot be instantiated.'
            throw new Error(message)
        }
    }

    static relatedUnits() {
        return [
            units.volume.imperial.GALLONS,
            units.volume.imperial.QUARTS,
            units.volume.imperial.PINTS,
            units.volume.imperial.CUPS,
            units.volume.imperial.TABLESPOONS,
            units.volume.imperial.TEASPOONS,
            units.volume.metric.LITERS,
            units.volume.metric.MILLILITERS
        ]
    }
    static totalVolume(volumes) {
        if (!volumes || !(volumes instanceof Array)) {
            const message = 'No `volumes` array was supplied.'
            throw new Error(message)
        }
        volumes.forEach(v => {
            if (!this.relatedUnits().includes(v.units)) {
                const message = 'Must be an array of type `VolumeUnit`.'
                throw new Error(message)
            }
        })
        return volumes.map(v => v.normalized).reduce((a, c) => a + c)
    }
}

/**
 * A class to represent a quantities that are represented in the
 * context of mass.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 * @augments Unit
 */
const MassUnit = class extends Unit {
    constructor(value) {
        super(value)
        if (this.constructor === MassUnit) {
            const message = `Abstract \`${this.constructor.name}\`` +
                            ' cannot be instantiated.'
            throw new Error(message)
        }
    }

    static relatedUnits() {
        return [
            units.mass.imperial.OUNCES,
            units.mass.imperial.POUNDS,
            units.mass.metric.MILLIGRAMS,
            units.mass.metric.GRAMS,
            units.mass.metric.KILOGRAMS
        ]
    }
    static totalMass(masses) {
        if (!masses || !(masses instanceof Array)) {
            const message = 'No `masses` array was supplied.'
            throw new Error(message)
        }
        masses.forEach(m => {
            if (!this.relatedUnits().includes(m.units)) {
                const message = 'Must be an array of type `MassUnit`.'
                throw new Error(message)
            }
        })
        return masses.map(m => m.normalized).reduce((a, c) => a + c)
    }
}

/**
 * A class to represent a quantity in imperial gallons.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Gallon = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.GALLONS
    }

    get units() { return this.#units }
    get inQuarts() { return super.value * 4 }
    get inPints() { return super.value * 8 }
    get inCups() { return super.value * 16 }
    get inTablespoons() { return super.value * 256 }
    get inTeaspoons() { return super.value * 768 }
    get inLiters() { return super.value * 4.55 }
    get inMilliliters() { return super.value * 4546.09 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial quarts.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Quart = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.QUARTS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 4 }
    get inPints() { return super.value * 2 }
    get inCups() { return super.value * 4 }
    get inTablespoons() { return super.value * 64 }
    get inTeaspoons() { return super.value * 192 }
    get inLiters() { return super.value / 1.14 }
    get inMilliliters() { return super.value * 1136.52 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial pints.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Pint = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.PINTS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 8 }
    get inQuarts() { return super.value / 2 }
    get inCups() { return super.value * 2 }
    get inTablespoons() { return super.value * 32 }
    get inTeaspoons() { return super.value * 96 }
    get inLiters() { return super.value / 1.76 }
    get inMilliliters() { return super.value * 568.26 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial cups.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Cup = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.CUPS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 16 }
    get inQuarts() { return super.value / 4 }
    get inPints() { return super.value / 2 }
    get inTablespoons() { return super.value * 16 }
    get inTeaspoons() { return super.value * 48 }
    get inLiters() { return super.value / 3.52 }
    get inMilliliters() { return super.value * 284.13 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial tablespoons.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Tablespoon = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.TABLESPOONS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 256 }
    get inQuarts() { return super.value / 64 }
    get inPints() { return super.value / 32 }
    get inCups() { return super.value / 16 }
    get inTeaspoons() { return super.value * 3 }
    get inLiters() { return super.value / 56.31 }
    get inMilliliters() { return super.value * 17.76 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial teaspoons.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Teaspoon = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.imperial.TEASPOONS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 768 }
    get inQuarts() { return super.value / 192 }
    get inPints() { return super.value / 96 }
    get inCups() { return super.value / 48 }
    get inTablespoons() { return super.value / 3 }
    get inLiters() { return super.value / 169.94 }
    get inMilliliters() { return super.value * 5.92 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in liters.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Liter = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.metric.LITERS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 4.55 }
    get inQuarts() { return super.value * 1.14 }
    get inPints() { return super.value * 1.76 }
    get inCups() { return super.value * 3.52 }
    get inTablespoons() { return super.value * 56.31 }
    get inTeaspoons() { return super.value * 169.94 }
    get inMilliliters() { return super.value * 1000 }
    get normalized() { return super.value }
}

/**
 * A class to represent a quantity in milliliters.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeUnit
 */
const Milliliter = class extends VolumeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.volume.metric.MILLILITERS
    }

    get units() { return this.#units }
    get inGallons() { return super.value / 4546.09 }
    get inQuarts() { return super.value / 1136.52 }
    get inPints() { return super.value / 568.26 }
    get inCups() { return super.value / 284.13 }
    get inTablespoons() { return super.value / 17.76 }
    get inTeaspoons() { return super.value / 5.92 }
    get inLiters() { return super.value / 1000 }
    get normalized() { return this.inLiters }
}

/**
 * A class to represent a quantity in imperial ounces.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassUnit
 */
const Ounce = class extends MassUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.mass.imperial.OUNCES
    }

    get units() { return this.#units }
    get inPounds() { return super.value / 16 }
    get inKilograms() { return super.value / 35.27 }
    get inGrams() { return super.value * 28.35 }
    get inMilligrams() { return super.value * 28349.5 }
    get normalized() { return this.inGrams }
}

/**
 * A class to represent a quantity in imperial pounds.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassUnit
 */
const Pound = class extends MassUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.mass.imperial.POUNDS
    }

    get units() { return this.#units }
    get inOunces() { return super.value * 16 }
    get inKilograms() { return super.value / 2.21 }
    get inGrams() { return super.value * 453.59 }
    get inMilligrams() { return super.value * 453592 }
    get normalized() { return this.inGrams }
}

/**
 * A class to represent a quantity in kilograms.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassUnit
 */
const Kilogram = class extends MassUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.mass.metric.KILOGRAMS
    }

    get units() { return this.#units }
    get inOunces() { return super.value * 35.27 }
    get inPounds() { return super.value * 2.2 }
    get inGrams() { return super.value * 1000 }
    get inMilligrams() { return super.value * 1000000 }
    get normalized() { return this.inGrams }
}

/**
 * A class to represent a quantity in grams.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassUnit
 */
const Gram = class extends MassUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.mass.metric.GRAMS
    }

    get units() { return this.#units }
    get inOunces() { return super.value / 28.35 }
    get inPounds() { return super.value / 453.59 }
    get inKilograms() { return super.value / 1000 }
    get inMilligrams() { return super.value * 1000 }
    get normalized() { return super.value }
}

/**
 * A class to represent a quantity in milligrams.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassUnit
 */
const Milligram = class extends MassUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.mass.metric.MILLIGRAMS
    }

    get units() { return this.#units }
    get inOunces() { return super.value / 28349.5 }
    get inPounds() { return super.value / 453592 }
    get inKilograms() { return super.value / 1000000 }
    get inGrams() { return super.value / 1000 }
    get normalized() { return this.inGrams }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeUnit
 */
const Day = class extends TimeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.time.DAYS
    }

    get units() { return this.#units }
    get inHours() { return super.value * 24 }
    get inMinutes() { return super.value * 24 * 60 }
    get normalized() { return this.inMinutes }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeUnit
 */
const Hour = class extends TimeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.time.HOURS
    }

    get units() { return this.#units }
    get inDays() { return super.value / 24 }
    get inMinutes() { return super.value * 60 }
    get normalized() { return this.inMinutes }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeUnit
 */
const Minute = class extends TimeUnit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.time.MINUTES
    }

    get units() { return this.#units }
    get inDays() { return super.value / 60 / 24 }
    get inHours() { return super.value / 60 }
    get normalized() { return super.value }
}

/**
 * A class to represent a quantity in simple pieces
 * or chunks.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments Unit
 */
const Piece = class extends Unit {
    #units

    constructor(value) {
        super(value)
        this.#units = units.misc.PIECES
    }

    get units() { return this.#units }
}

/**
 * A class to represent a quantity that can be interpreted
 * dynamically.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments Unit
 */
const ToTaste = class extends Unit {
    #units

    constructor() {
        super(0)
        this.#units = units.misc.TO_TASTE
    }

    get units() { return this.#units }
}

module.exports = {
    Day,
    Hour,
    Minute,
    Gallon,
    Quart,
    Pint,
    Cup,
    Tablespoon,
    Teaspoon,
    Liter,
    Milliliter,
    Ounce,
    Pound,
    Milligram,
    Gram,
    Kilogram,
    Piece,
    ToTaste
}