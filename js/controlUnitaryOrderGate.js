/**
 * 制御ユニタリゲートを実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} control 制御bit
 * @param {int} maxBit 全体のbit数
 * @param {array} unitary [x, M]
 * @param {array} questions 問題レジスタの配列
 * @param {int} times ユニタリ行列を作用する回数
 * @return {array} 変換後の標的bitの配列
 */
const ControlUnitaryOrderGate = (input, control, maxBit, unitary, questions, times) => {
    const maxValue = Math.pow(2, maxBit);
    // 結果を入れるための配列
    let output = [];
    let x = unitary[0];
    let M = unitary[1];
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++) {
        output[i] = questions[i];
        if (input[i][0] !== 0 || input[i][1] !== 0) {
            // output[i] = input[i];
            if (ControlUnitaryOrderGateOneState(i, control, maxBit)) {
                let out = questions[i];
                for (let j = 0; j < times; j++) {
                    out = (out * x) % M;
                }
                output[i] = out;
            }
        }
    }
    return output;
}

/**
 * 1つの状態について、制御ユニタリゲートを実行するかを判定
 * @param {int} input 入力（1つの状態, 10進数）
 * @param {int} control 制御bit
 * @return {boolean} true or false
 */
const ControlUnitaryOrderGateOneState = (input, control, maxBit) => {
    // 入力を2進数表示
    let str_0 = '';
    for (i = 0; i < maxBit; i++) {
        str_0 += '0';
    }
    let inputBinaryNumber = (str_0 + input.toString(2)).substr(-maxBit);
    // 制御bit, 標的bitの左から数えた位置
    let controlCharNumber = maxBit - control;
    // 制御bit, 標的bitの現在の値
    let controlBit = inputBinaryNumber.charAt(controlCharNumber);

    // 制御bitと標的bitが1の場合、標的bitを
    return (controlBit === '1');
}
