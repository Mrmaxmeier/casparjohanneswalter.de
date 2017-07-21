export class Fraction {
  constructor(public numerator: number, public denominator: number) {}

  /*
  get n() { return this.numerator }
  get d() { return this.denominator }
  */
  get value () {
    return this.numerator / this.denominator
  }

  static into(data: Fraction | number): Fraction {
    if (typeof data === 'number')
      return new Fraction(data, 1)
    return data
  }

  clone(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }

  repr () {
    let gcd_ = gcd(this.numerator, this.denominator)
    return `${this.numerator / gcd_} / ${this.denominator / gcd_}`
  }

  reduce (): Fraction {
    let gcd_ = gcd(this.numerator, this.denominator)
    return new Fraction(this.numerator / gcd_, this.denominator / gcd_)
  }

  mul (other: Fraction) {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator).reduce()
  }

  invert () {
    return new Fraction(this.denominator, this.numerator)
  }

  div (other: Fraction) {
    return this.mul(other.invert())
  }

}


export function gcd (a: number, b: number, depth = 0): number {
  if (isNaN(a) || isNaN(b) || a === undefined || b === undefined) {
    console.log(a, b, depth)
    let err = 'a and/or b are undefined/NaN'
    throw err
  }
  return (b === 0) ? a : gcd(b, a % b, depth + 1)
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}
