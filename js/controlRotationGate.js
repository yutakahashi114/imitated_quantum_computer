/**
 * 制御回転ゲートを実行する
 * @param {array} input 入力（全ての状態）
 * @param {int} control 制御bit
 * @param {int} target 標的bit
 * @param {int} maxBit 全体のbit数
 * @param {int} rot 回転 exp(2pii/2^rot)
 * @return {array} 出力（全ての状態）
 */
const ControlRotationGate = (input, control, target, maxBit, rot) => {
    const maxValue = Math.pow(2, maxBit);
    // 結果を入れるための配列
    this.output = [];
    for (i = 0; i < maxValue; i++) {
        this.output.push([0, 0]);
    }
    let result = [];
    // 全ての状態を変換する
    for (let i = 0; i < maxValue; i++ ) {
        if (input[i][0] !== 0 || input[i][1] !== 0) {
            output[i] = input[i];            
            if (ControlRotationGateOneState(i, control, target, maxBit)) {
                let theta = 2 * Math.PI / (Math.pow(2, rot));
                let mul = [Math.cos(theta), Math.sin(theta)];
                output[i] = Mul(input[i], mul);
            }
        }
    }
    return output;
}

/**
 * 1つの状態について、制御回転ゲートを実行するかを判定
 * @param {int} input 入力（1つの状態, 10進数）
 * @param {int} control 制御bit
 * @param {int} target 標的bit
 * @return {boolean} true or false
 */
const ControlRotationGateOneState = (input, control, target, maxBit) => {
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
    
    // 制御bitと標的bitが1の場合、標的bitを回転
    return (controlBit === '1' && targetBit === '1');
    // if (controlBit === '0' || targetBit === '0') {
    //     return input;
    // }
    // let result = inputBinaryNumber.substr(0, targetCharNumber) + (1 - targetBit) + inputBinaryNumber.substr(targetCharNumber + 1);
    // // 10進数に変換
    // return Number.parseInt(result,2);
}

