/**
 * 制御NOTゲートを実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} control 制御bit
 * @param {int} target 標的bit
 * @param {int} maxBit 全体のbit数
 * @return {array} 出力（全ての状態）
 */
const ControlNotGate = (input, control, target, maxBit) => {
    const maxValue = Math.pow(2, maxBit);        
    // 結果を入れるための配列
    let output = new Array(maxValue).fill(0);
    let result = [];
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++ ) {
        if (input[i] !== 0) {
            result = ControlNotGateOneState(i, control, target, maxBit);
            output[result] = input[i];
        }
    }
    return output;
}

/**
 * 1つの状態について、制御NOTゲートを実行する
 * @param {int} input 入力（1つの状態, 10進数）
 * @param {int} control 制御bit
 * @param {int} target 標的bit
 * @return {int} 出力（1つの状態, 10進数）
 */
const ControlNotGateOneState = (input, control, target, maxBit) => {
    // 入力を2進数表示
    let str_0 = '';
    for (i = 0; i < maxBit; i++) {
        str_0 += '0';
    }
    let inputBinaryNumber = (str_0 + input.toString(2)).substr(-maxBit);
    // 制御bit, 標的bitの左から数えた位置
    let controlCharNumber = maxBit - control;
    let targetCharNumber = maxBit - target;
    // 制御bit, 標的bitの現在の値
    let controlBit = inputBinaryNumber.charAt(controlCharNumber);
    let targetBit = inputBinaryNumber.charAt(targetCharNumber);
    
    // 制御bitが1の場合、標的bitの値を反転
    if (controlBit === '0') {
        return input;
    } else if (controlBit === '1') {
        let result = inputBinaryNumber.substr(0, targetCharNumber) + (1 - targetBit) + inputBinaryNumber.substr(targetCharNumber + 1);
        // 10進数に変換
        return Number.parseInt(result,2);
    }
}

