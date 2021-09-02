/******************************************************
 * Title:       quantifiable.js                       *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/01/2021                            *
 * Description:                                       *
 *     Contains a plethora of classes that can be     *
 *     used to represent a quantity with units        *
 *     This has many applications, but most notably   *
 *     converting from one unit to another.           *
 ******************************************************/

const {
    time,
    volume,
    mass,
    misc
} = require('./enum')

/**
 * Enforces instantiation policy on abstractions.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {class} someClass An abstract class.
 */
const preventAbstractInstantiation = someClass => {
    const abstractionBlacklist = [
        QuantifiableBase,
        TimeQuantifiable,
        VolumeQuantifiable,
        MassQuantifiable,
        Quantifiable
    ]
    if (abstractionBlacklist.includes(someClass.constructor)) {
        const message = `Abstract \`${someClass.constructor.name}\`` +
                        ' cannot be instantiated.'
        throw new Error(message)
    }
}

/**
 * A class to represent a quantity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 */
const QuantifiableBase = class {
    #value
    #readable

    constructor(value) {
        preventAbstractInstantiation(this)
        if (value) {
            this.#readable = value.toString()

            const parts = this.#readable.split('/')
            this.#value = parts[0] / (parts[1] ?? 1)
        }
    }

    get value() { return this.#value }
    get readable() { return this.#readable }

    set value(value) {
        this.#readable = value.toString()

        const parts = this.#readable.split('/')
        this.#value = parts[0] / (parts[1] ?? 1)
    }
}

/**
 * A class to represent a quantities that are represented in the
 * context of time.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 * @augments Quantifiable
 */
const TimeQuantifiable = class extends QuantifiableBase {
    constructor(value) { super(value) }

    static relatedQuantifiables() {
        return [
            time.DAYS,
            time.HOURS,
            time.MINUTES
        ]
    }
    static totalTime(times) {
        if (!times || !(times instanceof Array)) {
            const message = 'No `times` array was supplied.'
            throw new Error(message)
        }
        times.forEach(t => {
            if (!this.relatedQuantifiables().includes(t.units)) {
                const message = 'Must be an array of type `TimeQuantifiable`.'
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
 * @augments Quantifiable
 */
const VolumeQuantifiable = class extends QuantifiableBase {
    constructor(value) { super(value) }

    static relatedQuantifiables() {
        return [
            volume.GALLONS,
            volume.QUARTS,
            volume.PINTS,
            volume.CUPS,
            volume.TABLESPOONS,
            volume.TEASPOONS,
            volume.LITERS,
            volume.MILLILITERS
        ]
    }
    static totalVolume(volumes) {
        if (!volumes || !(volumes instanceof Array)) {
            const message = 'No `volumes` array was supplied.'
            throw new Error(message)
        }
        volumes.forEach(v => {
            if (!this.relatedQuantifiables().includes(v.units)) {
                const message = 'Must be an array of type `VolumeQuantifiable`.'
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
 * @augments Quantifiable
 */
const MassQuantifiable = class extends QuantifiableBase {
    constructor(value) { super(value) }

    static relatedQuantifiables() {
        return [
            mass.OUNCES,
            mass.POUNDS,
            mass.MILLIGRAMS,
            mass.GRAMS,
            mass.KILOGRAMS
        ]
    }
    static totalMass(masses) {
        if (!masses || !(masses instanceof Array)) {
            const message = 'No `masses` array was supplied.'
            throw new Error(message)
        }
        masses.forEach(m => {
            if (!this.relatedQuantifiables().includes(m.units)) {
                const message = 'Must be an array of type `MassQuantifiable`.'
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
 * @augments VolumeQuantifiable
 */
const Gallon = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.GALLONS
    }

    get units() { return this.#units }
    get inQuarts() { return this.value * 4 }
    get inPints() { return this.value * 8 }
    get inCups() { return this.value * 16 }
    get inTablespoons() { return this.value * 256 }
    get inTeaspoons() { return this.value * 768 }
    get inLiters() { return this.value * 4.55 }
    get inMilliliters() { return this.value * 4546.09 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial quarts.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Quart = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.QUARTS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 4 }
    get inPints() { return this.value * 2 }
    get inCups() { return this.value * 4 }
    get inTablespoons() { return this.value * 64 }
    get inTeaspoons() { return this.value * 192 }
    get inLiters() { return this.value / 1.14 }
    get inMilliliters() { return this.value * 1136.52 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial pints.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Pint = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.PINTS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 8 }
    get inQuarts() { return this.value / 2 }
    get inCups() { return this.value * 2 }
    get inTablespoons() { return this.value * 32 }
    get inTeaspoons() { return this.value * 96 }
    get inLiters() { return this.value / 1.76 }
    get inMilliliters() { return this.value * 568.26 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial cups.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Cup = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.CUPS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 16 }
    get inQuarts() { return this.value / 4 }
    get inPints() { return this.value / 2 }
    get inTablespoons() { return this.value * 16 }
    get inTeaspoons() { return this.value * 48 }
    get inLiters() { return this.value / 3.52 }
    get inMilliliters() { return this.value * 284.13 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial tablespoons.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Tablespoon = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.TABLESPOONS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 256 }
    get inQuarts() { return this.value / 64 }
    get inPints() { return this.value / 32 }
    get inCups() { return this.value / 16 }
    get inTeaspoons() { return this.value * 3 }
    get inLiters() { return this.value / 56.31 }
    get inMilliliters() { return this.value * 17.76 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial teaspoons.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Teaspoon = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.TEASPOONS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 768 }
    get inQuarts() { return this.value / 192 }
    get inPints() { return this.value / 96 }
    get inCups() { return this.value / 48 }
    get inTablespoons() { return this.value / 3 }
    get inLiters() { return this.value / 169.94 }
    get inMilliliters() { return this.value * 5.92 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in liters.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Liter = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.LITERS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 4.55 }
    get inQuarts() { return this.value * 1.14 }
    get inPints() { return this.value * 1.76 }
    get inCups() { return this.value * 3.52 }
    get inTablespoons() { return this.value * 56.31 }
    get inTeaspoons() { return this.value * 169.94 }
    get inMilliliters() { return this.value * 1000 }
    get normalized() { return this.value }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in milliliters.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments VolumeQuantifiable
 */
const Milliliter = class extends VolumeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = volume.MILLILITERS
    }

    get units() { return this.#units }
    get inGallons() { return this.value / 4546.09 }
    get inQuarts() { return this.value / 1136.52 }
    get inPints() { return this.value / 568.26 }
    get inCups() { return this.value / 284.13 }
    get inTablespoons() { return this.value / 17.76 }
    get inTeaspoons() { return this.value / 5.92 }
    get inLiters() { return this.value / 1000 }
    get normalized() { return this.inLiters }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial ounces.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassQuantifiable
 */
const Ounce = class extends MassQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = mass.OUNCES
    }

    get units() { return this.#units }
    get inPounds() { return this.value / 16 }
    get inKilograms() { return this.value / 35.27 }
    get inGrams() { return this.value * 28.35 }
    get inMilligrams() { return this.value * 28349.5 }
    get normalized() { return this.inGrams }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in imperial pounds.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassQuantifiable
 */
const Pound = class extends MassQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = mass.POUNDS
    }

    get units() { return this.#units }
    get inOunces() { return this.value * 16 }
    get inKilograms() { return this.value / 2.21 }
    get inGrams() { return this.value * 453.59 }
    get inMilligrams() { return this.value * 453592 }
    get normalized() { return this.inGrams }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in kilograms.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassQuantifiable
 */
const Kilogram = class extends MassQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = mass.KILOGRAMS
    }

    get units() { return this.#units }
    get inOunces() { return this.value * 35.27 }
    get inPounds() { return this.value * 2.2 }
    get inGrams() { return this.value * 1000 }
    get inMilligrams() { return this.value * 1000000 }
    get normalized() { return this.inGrams }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in grams.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassQuantifiable
 */
const Gram = class extends MassQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = mass.GRAMS
    }

    get units() { return this.#units }
    get inOunces() { return this.value / 28.35 }
    get inPounds() { return this.value / 453.59 }
    get inKilograms() { return this.value / 1000 }
    get inMilligrams() { return this.value * 1000 }
    get normalized() { return this.value }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in milligrams.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments MassQuantifiable
 */
const Milligram = class extends MassQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = mass.MILLIGRAMS
    }

    get units() { return this.#units }
    get inOunces() { return this.value / 28349.5 }
    get inPounds() { return this.value / 453592 }
    get inKilograms() { return this.value / 1000000 }
    get inGrams() { return this.value / 1000 }
    get normalized() { return this.inGrams }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeQuantifiable
 */
const Day = class extends TimeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = time.DAYS
    }

    get units() { return this.#units }
    get inHours() { return this.value * 24 }
    get inMinutes() { return this.value * 24 * 60 }
    get normalized() { return this.inMinutes }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeQuantifiable
 */
const Hour = class extends TimeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = time.HOURS
    }

    get units() { return this.#units }
    get inDays() { return this.value / 24 }
    get inMinutes() { return this.value * 60 }
    get normalized() { return this.inMinutes }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in days.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments TimeQuantifiable
 */
const Minute = class extends TimeQuantifiable {
    #units

    constructor(value) {
        super(value)
        this.#units = time.MINUTES
    }

    get units() { return this.#units }
    get inDays() { return this.value / 60 / 24 }
    get inHours() { return this.value / 60 }
    get normalized() { return this.value }

    toString() { return `${this.readable}${this.#units}` }
}

/**
 * A class to represent a quantity in simple pieces
 * or chunks.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments Quantifiable
 */
const Piece = class extends QuantifiableBase {
    #units

    constructor(value) {
        super(value)
        this.#units = misc.PIECES
    }

    get units() { return this.#units }

    toString() { return `${this.readable} ${this.#units}` }
}

/**
 * A class to represent a quantity that can be interpreted
 * dynamically.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @augments Quantifiable
 */
const ToTaste = class extends QuantifiableBase {
    #units

    constructor() {
        super(0)
        this.#units = misc.TO_TASTE
    }

    get units() { return this.#units }

    toString() { return ` ${this.#units}` }
}

/**
 * Factory that produces a `Quantifiable` from a string
 * and quantity.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @abstract
 */
const Quantifiable = class {
    constructor() { preventAbstractInstantiation(this) }

    static build(q, u) {
        switch (u) {
            case time.DAYS: return new Day(q)
            case time.HOURS: return new Hour(q)
            case time.MINUTES: return new Minute(q)
            case volume.GALLONS: return new Gallon(q)
            case volume.QUARTS: return new Quart(q)
            case volume.PINTS: return new Pint(q)
            case volume.CUPS: return new Cup(q)
            case volume.TABLESPOONS: return new Tablespoon(q)
            case volume.TEASPOONS: return new Teaspoon(q)
            case volume.LITERS: return new Liter(q)
            case volume.MILLILITERS: return new Milliliter(q)
            case mass.OUNCES: return new Ounce(q)
            case mass.POUNDS: return new Pound(q)
            case mass.MILLIGRAMS: return new Milligram(q)
            case mass.GRAMS: return new Gram(q)
            case mass.KILOGRAMS: return new Kilogram(q)
            case misc.PIECES: return new Piece(q)
            default: return new ToTaste()
        }
    }
}

module.exports = Quantifiable