/**
 * 制御ユニタリゲートを実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} control 制御bit
 * @param {int} maxBit 全体のbit数
 * @param {array} unitary ユニタリ行列
 * @param {array} questions 固有ベクトルの配列
 * @param {int} times ユニタリ行列を作用する回数
 * @return {array} 出力（全ての状態）
 */
const ControlUnitaryGate = (input, control, maxBit, unitary, questions, times) => {
    const maxValue = Math.pow(2, maxBit);
    // 結果を入れるための配列
    let output = [];
    for (let i = 0; i < maxValue; i++) {
        output.push([0, 0]);
    }
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++ ) {
        if (input[i][0] !== 0 || input[i][1] !== 0) {
            output[i] = input[i];
            if (ControlUnitaryGateOneState(i, control, maxBit)) {
                let eigenvalue = [0, 0];
                for (let index_row in unitary) {
                    let add_eigenvalue = [0, 0];
                    for (let index_column in unitary[index_row]) {
                        add_eigenvalue = Add(add_eigenvalue, Mul(unitary[index_row][index_column], questions[i][index_column]));
                    }
                    eigenvalue = Add(eigenvalue, Div(add_eigenvalue, questions[i][index_row]));
                }
                eigenvalue = Div(eigenvalue, [unitary.length, 0]);
                let out = input[i];
                for (let i = 0; i < times; i++) {
                    out = Mul(out, eigenvalue);
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
const ControlUnitaryGateOneState = (input, control, maxBit) => {
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

    // 制御bitと標的bitが1の場合、標的bitを回転
    return (controlBit === '1');
}
