const vm =
    new Vue({
        el: '#app',
        data: {
            answerBit: 2,
            dimension: 2,
            unitary: [[0, 0], [0, 0]],
            vector: [0, 0],
            routes: ['-hD-shD-', '-h+D|-2h', '--UU----'],
            result: false,
            input: [[1, 0], [0, 0], [0, 0], [0, 0]],
            now: '',
            nowPosition: 20,
            rounding: 100000000,
        },
        methods: {
            // 計算の実行
            calculate() {
                this.result = false;
                const max = this.routes[0].length;
                let routesArray = [];
                for (let route of this.routes) {
                    routesArray.push(route.split(''));
                }
                this.now = '↓';
                let i = 0;
                let unitary_count = 0;
                // 1秒ごとに1列分の計算を進める
                let loop = setInterval(() => {
                    this.nowPosition += 16;
                    if (i >= max) {
                        this.now = '';
                        this.nowPosition = 20;
                        clearInterval(loop);
                        this.result = true;
                        return;
                    }
                    let controlFlag = false;
                    let targetBit = 0;
                    let controlBit = 0;
                    let rotation = 0;
                    for (let key in routesArray) {
                        // h : アダマール
                        if (routesArray[key][i] === 'h') {
                            this.input = HadamardGate(this.input, (Number(key) + 1), this.answerBit);
                        }

                        // D : 制御ビット
                        if (routesArray[key][i] === 'D' && !controlFlag) {
                            controlFlag = true;
                            controlBit = Number(key) + 1;
                        }
                        // 制御ユニタリゲート
                        // U : 標的ビット
                        if (routesArray[key][i] === 'U') {
                            rotation = routesArray[key][i]
                            if (controlFlag) {
                                this.input = ControlUnitaryGate(this.input, controlBit, this.answerBit, this.convertedUnitary, this.questions, Math.pow(2, unitary_count));
                                unitary_count++;
                                controlFlag = false;
                            }
                        }
                        // 制御回転ゲート
                        // number : 標的ビット
                        if (isFinite(routesArray[key][i])) {
                            rotation = routesArray[key][i]
                            if (controlFlag) {
                                this.input = ControlRotationInverseGate(this.input, controlBit, (Number(key) + 1), this.answerBit, rotation);
                                controlFlag = false;
                            }
                        }

                        // s : スワップ
                        if (routesArray[key][i] === 's') {
                            this.input = SwapGate(this.input, this.answerBit);
                            break;
                        }
                    }
                    i++;
                }, 250);
            }
        },
        watch: {
            dimension() {
                this.unitary = [];
                this.vector = [];
                for (let i = 0; i < this.dimension; i++) {
                    let row = [];
                    for (let i = 0; i < this.dimension; i++) {
                        row.push(0);
                    }
                    this.unitary.push(row);
                    this.vector.push(0);
                }
            },
            // ビット数を変更したときに入力欄を増減させる
            answerBit() {
                // ビット数が大きすぎると計算できない
                if (this.answerBit > 9) {
                    return false;
                }
                this.routes = [];

                // ユニタリ変換部分の回路
                // '+D-'を追加する
                // '+++D---'を作る
                let line = '';
                for (let i = 0; i < this.answerBit - 1; i++) {
                    line += '+';
                }
                line += 'D';
                for (let i = 0; i < this.answerBit - 1; i++) {
                    line += '-';
                }
                for (let i = 0; i < this.answerBit; i++) {
                    // 少しずつずらして取得し、追加
                    let addLine = line.substr(this.answerBit - i - 1, this.answerBit);
                    this.routes[i] = '-h' + addLine;
                }

                // 逆フーリエ変換部分の回路
                // スワップゲート追加
                this.routes[0] += 's';
                for (let i = 1; i < this.answerBit; i++) {
                    this.routes[i] += '|';
                }
                // 制御回転ゲート追加
                for (let i = 1; i <= this.answerBit; i++) {
                    // '-D+'を追加する
                    // '+++D---'を作る
                    line = '';
                    for (let j = 0; j < i - 1; j++) {
                        line += '+';
                    }
                    line += 'D';
                    for (let j = 0; j < i - 1; j++) {
                        line += '-';
                    }
                    // 少しずつずらして取得し、追加
                    for (let j = 0; j < i - 1; j++) {
                        let addLine = line.substr(i - j - 1, i);
                        this.routes[j] += addLine;
                    }

                    // 'h'からの文字列を追加
                    line = '';
                    for (let j = i; j > 1; j--) {
                        if (j === 1) {
                        } else {
                            line += j;
                        }
                    }
                    line += 'h';

                    this.routes[i - 1] += line;

                    // 残りのbitに'-'を追加
                    line = '';
                    for (let j = 0; j < i; j++) {
                        line += '-';
                    }
                    for (let j = i; j < this.answerBit; j++) {
                        this.routes[j] += line;
                    }
                }

                // ユニタリ変換部分の回路
                let psi = '--';
                let count = 1;
                for (let i = 0; i < this.answerBit; i++) {
                    psi += 'U';
                    // 逆フーリエ変換部分に対応する'-'の数をカウント
                    count += i + 1;
                }
                this.routes[this.answerBit] = psi + Array(count + 1).join('-');

                // 解答レジスタの初期値
                let maxValue = Math.pow(2, this.answerBit);
                this.input = [];
                this.input[0] = [1, 0];
                for (let i = 1; i < maxValue; i++) {
                    this.input.push([0, 0]);
                }
            }
        },
        computed: {
            convertedUnitary() {
                let converted = [];
                for (let row of this.unitary) {
                    let convertedRow = [];
                    for (let column of row) {
                        // 整数部と虚数部に分割
                        let re = 0;
                        let im = 0;
                        let matchRe = String(column).match(/^(\-?[0-9\.]*)$/);
                        let matchIm = String(column).match(/^(\-?[0-9\.]*)i$/);
                        let match = String(column).match(/^(\-?[0-9\.]*)([\+\-][0-9\.]*i)$/);
                        if (matchRe !== null) {
                            re = Number(matchRe[1]);
                        } else if (matchIm !== null) {
                            im = Number(matchIm[1]);
                        } else if (match !== null) {
                            re = Number(match[1]);
                            im = Number(match[2].slice(0, -1));
                        }
                        convertedRow.push([re, im])
                    }
                    converted.push(convertedRow);
                }
                return converted;
            },
            convertedVector() {
                let converted = [];
                for (let row of this.vector) {
                    // 整数部と虚数部に分割
                    let re = 0;
                    let im = 0;
                    let matchRe = String(row).match(/^(\-?[0-9\.]*)$/);
                    let matchIm = String(row).match(/^(\-?[0-9\.]*)i$/);
                    let match = String(row).match(/^(\-?[0-9\.]*)([\+\-][0-9\.]*i)$/);
                    if (matchRe !== null) {
                        re = Number(matchRe[1]);
                    } else if (matchIm !== null) {
                        im = Number(matchIm[1]);
                    } else if (match !== null) {
                        re = Number(match[1]);
                        im = Number(match[2].slice(0, -1));
                    }
                converted.push([re, im])
                }
                return converted;
            },
            questions() {
                // 問題レジスタの初期値
                let maxValue = Math.pow(2, this.answerBit);
                let questions = [];
                for (let i = 0; i < maxValue; i++) {
                    questions.push([this.convertedVector[0].concat(), this.convertedVector[1].concat()]);
                }
                return questions;
            },
            // 回路をそれっぽく変換して表示する
            routesOutput() {
                let output = [];
                for (let route of this.routes) {
                    let routeArray = route.split('');
                    for (let key in routeArray) {
                        if (routeArray[key] === '-') {
                            routeArray[key] = '━';
                        }
                        if (routeArray[key] === 'h') {
                            routeArray[key] = 'Η';
                        }
                        if (routeArray[key] === 'D') {
                            routeArray[key] = '┳';
                        }
                        if (routeArray[key] === 'U') {
                            routeArray[key] = 'Ｕ';
                        }
                        if (routeArray[key] === '+') {
                            routeArray[key] = '╋';
                        }
                        if (routeArray[key] === 's' || routeArray[key] === '|') {
                            routeArray[key] = 'Ι';
                        }
                        // 半角数字を全角に変換
                        routeArray[key] = routeArray[key].replace(/[0-9]/g, function (s) {
                            return String.fromCharCode(s.charCodeAt(0) + 65248);
                        });
                    }
                    output.push(routeArray.join(''));
                }
                return output;
            },
            // ビット全体の状態を計算
            output() {
                let result = [];
                for (let value of this.input) {
                    // 四捨五入
                    let re = Math.floor((value[0] * this.rounding) + 0.5) / this.rounding;
                    let im = Math.floor((value[1] * this.rounding) + 0.5) / this.rounding;
                    let complex = '';
                    if (im >= 0) {
                        complex = re + ' + ' + im + 'i';
                    } else {
                        complex = re + ' - ' + (-1 * im) + 'i';
                    }
                    result.push(complex);
                }
                return result;
            },
            // ビット全体の確率を計算
            probability() {
                let result = [];
                for (let value of this.input) {
                    // 絶対値
                    let abs = Abs(value);
                    // 四捨五入
                    let round = Math.floor((abs * this.rounding) + 0.5) / this.rounding;
                    result.push(round);
                }
                return result;
            },
            estimatedPhi() {
                let maxIndex = 0;
                for (let index in this.probability) {
                    if (this.probability[index] > this.probability[maxIndex]) {
                        maxIndex = index;
                    }
                }
                let psiBar = maxIndex / Math.pow(2, this.answerBit);
                let theta = 2 * Math.PI * psiBar;
                let estimatedPhi = [Math.cos(theta), Math.sin(theta)];

                return estimatedPhi;
            },
            displayPhi() {
                // 四捨五入
                let re = Math.floor((this.estimatedPhi[0] * this.rounding) + 0.5) / this.rounding;
                let im = Math.floor((this.estimatedPhi[1] * this.rounding) + 0.5) / this.rounding;
                let complex = '';
                if (im >= 0) {
                    complex = re + ' + ' + im + 'i';
                } else {
                    complex = re + ' - ' + (-1 * im) + 'i';
                }
                return complex;
            }
        }
    });
