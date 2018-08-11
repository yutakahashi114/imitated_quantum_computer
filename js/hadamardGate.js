/**
 * アダマール変換を実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} conversion 変換するbit
 * @param {int} maxBit 全体のbit数
 * @return {array} 出力（全ての状態）
 */
const HadamardGate = (input, conversion, maxBit) => {
    const maxValue = Math.pow(2, maxBit);        
    // 結果を入れるための配列
    this.output = [];
    for (i = 0; i < maxValue; i++) {
        this.output.push([0, 0]);
    }
    let result = [];
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++) {
        if (input[i][0] !== 0 || input[i][1] !== 0) {
            result = HadamardGateOneState(i, conversion, maxBit);
                for (let state in result) {
                let add = output[state];
                add[0] += input[i][0] * result[state];
                add[1] += input[i][1] * result[state];
                output[state] = add;
            }
        }
    }
    return output;
}

/**
 * 1つの状態について、アダマール変換を実行する
 * @param {int} input 入力（1つの状態, 10進数）
 * @param {int} conversion 変換するbit
 * @param {int} maxBit 全体のbit数
 * @return {array} 出力（2つの状態とその重み, 10進数）
 */
const HadamardGateOneState = (input, conversion, maxBit) => {
    const sqrt2 = Math.sqrt(2);
    // 入力を2進数表示
    let str_0 = '';
    for (i = 0; i < maxBit; i++) {
        str_0 += '0';
    }
    let inputBinaryNumber = (str_0 + input.toString(2)).substr(-maxBit);
    // 変換するbitの左から数えた位置
    let charNum = maxBit - conversion;
    // 変換するbitの現在の値
    let bit = inputBinaryNumber.charAt(charNum);

    // 変換後の状態
    let up = inputBinaryNumber.substr(0, charNum) + '0' + inputBinaryNumber.substr(charNum + 1); //up = 0
    let down = inputBinaryNumber.substr(0, charNum) + '1' + inputBinaryNumber.substr(charNum + 1); //down = 1

    // 10進数に変換
    let upDecimalNumber = Number.parseInt(up, 2);
    let downDecimalNumber = Number.parseInt(down, 2);

    // 係数をつけて結果を返す
    if (bit === '0') {
        let result = {
            [upDecimalNumber]: (sqrt2 / 2),
            [downDecimalNumber]: (sqrt2 / 2),
        }
        return result;
    }
    let result = {
        [upDecimalNumber]: (sqrt2 / 2),
        [downDecimalNumber]: (-sqrt2 / 2),
    }
    return result;
}
