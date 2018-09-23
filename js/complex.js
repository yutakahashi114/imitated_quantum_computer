 /**
 * 複素数の和
 * @param {array} a 入力 Re = a[0], Im = a[1]
 * @param {array} b 入力 Re = b[0], Im = b[1]
 * @return {array} 出力
 */
const Add = (a, b) => {
    let result = [];
    result[0] = a[0] + b[0];
    result[1] = a[1] + b[1];
    return result
}

/**
 * 複素数の差
 * @param {array} a 入力 Re = a[0], Im = a[1]
 * @param {array} b 入力 Re = b[0], Im = b[1]
 * @return {array} 出力
 */
const Sub = (a, b) => {
    let result = [];
    result[0] = a[0] - b[0];
    result[1] = a[1] - b[1];
    return result
}

/**
 * 複素数の積
 * @param {array} a 入力 Re = a[0], Im = a[1]
 * @param {array} b 入力 Re = b[0], Im = b[1]
 * @return {array} 出力
 */
const Mul = (a, b) => {
    let result = [];
    result[0] = a[0] * b[0] - a[1] * b[1];
    result[1] = a[0] * b[1] + a[1] * b[0];
    return result
}

/**
 * 複素数の商
 * @param {array} a 入力 Re = a[0], Im = a[1]
 * @param {array} b 入力 Re = b[0], Im = b[1]
 * @return {array} 出力
 */
const Div = (a, b) => {
    let result = [];
    if (b[0] == 0 && b[1] == 0) {
        throw new Error('divide by zero');
    }
    result[0] = (a[0] * b[0] + a[1] * b[1]) / (b[0] * b[0] + b[1] * b[1]);
    result[1] = (a[1] * b[0] - a[0] * b[1]) / (b[0] * b[0] + b[1] * b[1]);
    return result
}

/**
 * 複素数の絶対値
 * @param {array} a 入力 Re = a[0], Im = a[1]
 * @return {number} 出力
 */
const Abs = (a) => {
    let abs = a[0] * a[0] + a[1] * a[1]
    return abs;
}
