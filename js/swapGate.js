/**
 * スワップゲートを実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} maxBit 全体のbit数
 * @return {array} 出力（全ての状態）
 */
const SwapGate = (input, maxBit) => {
    const maxValue = Math.pow(2, maxBit);
    // 結果を入れるための配列
    let output = [];
    for (i = 0; i < maxValue; i++) {
        output.push([0, 0]);
    }
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++ ) {
        if (input[i][0] !== 0 || input[i][1] !== 0) {
            result = SwapGateOneState(i, maxBit);
            output[result] = input[i];
        }
    }
    return output;
}

/**
 * 1つの状態について、スワップゲートを実行する
 * @param {int} input 入力（1つの状態, 10進数）
 * @return {int} 出力（1つの状態, 10進数）
 */
const SwapGateOneState = (input, maxBit) => {
    // 入力を2進数表示
    let str_0 = '';
    for (i = 0; i < maxBit; i++) {
        str_0 += '0';
    }
    let inputBinaryNumber = (str_0 + input.toString(2)).substr(-maxBit);
    // 配列に分割、反転、結合
    let result = inputBinaryNumber.split("").reverse().join("");
    // 10進数に変換
    return Number.parseInt(result,2);
}
