const vm =
    new Vue({
        el: '#app',
        data: {
            answerBit: 2,
            routes: ['-hD--shD-', '-h+D-|-2h', '--UUo'],
            is_questions_observed: false,
            input: [[1, 0], [0, 0], [0, 0], [0, 0]],
            now: '',
            nowPosition: 20,
            rounding: 10000000,
            x: 0,
            M: 0,
            r: 0,
            questions: [1, 1, 1, 1],
            observed_questions: 0,
        },
        methods: {
            // 計算の実行
            calculate() {
                let tmp = this.answerBit;
                this.answerBit = '';
                setTimeout(() => {
                    this.answerBit = tmp;
                }, 1);
                this.is_questions_observed = false;
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
                                this.questions = ControlUnitaryOrderGate(this.input, controlBit, this.answerBit, [this.x, this.M], this.questions, Math.pow(2, unitary_count));
                                unitary_count++;
                                controlFlag = false;
                            }
                        }
                        // 制御回転ゲート
                        // number : 標的ビット
                        if (routesArray[key][i] !== undefined && routesArray[key][i] !== null) {
                            if (routesArray[key][i].match(/[2-9a-f]/) !== null) {
                                rotation = parseInt(routesArray[key][i], 16)
                                if (controlFlag) {
                                    this.input = ControlRotationInverseGate(this.input, controlBit, (Number(key) + 1), this.answerBit, rotation);
                                    controlFlag = false;
                                }
                            }
                        }

                        // s : スワップ
                        if (routesArray[key][i] === 's') {
                            this.input = SwapGate(this.input, this.answerBit);
                            break;
                        }

                        // o : 測定
                        if (routesArray[key][i] === 'o') {
                            this.observeQuestions();
                        }
                    }
                    i++;
                }, 100);
            },
            observeQuestions() {
                let maxValue = Math.pow(2, this.answerBit);
                let random = Math.floor(Math.random() * maxValue);
                let observed = this.questions[random];
                let observable = [];
                // 観測する可能性のある状態を抽出する
                for (let index in this.questions) {
                    if (this.questions[index] == observed) {
                        observable.push(index);
                    }
                }
                // 観測された状態の累計の確率を求める
                let conditional_probability = 0;
                for (let index in this.probability) {
                    if (observable.indexOf(index) > -1) {
                        conditional_probability += this.probability[index];
                    }
                }
                let weight = Math.pow(conditional_probability, 0.5);
                // 返却用の配列
                let observed_input = [];
                for (let i = 0; i < maxValue; i++) {
                    observed_input.push([0, 0]);
                }
                for (let index in this.input) {
                    if (observable.indexOf(index) > -1) {
                        observed_input[index] = [this.input[index][0] / weight, this.input[index][1] / weight];
                    }
                }
                this.input = observed_input;
                this.observed_questions = observed;
                this.is_questions_observed = true;
            },
            getRemainder(x, power, M) {
                let remainder = 1;
                for (let i = 0; i < power; i++) {
                    remainder = (remainder * x) % M;
                }
                return remainder;
            },
            euclideanAlgorithmPower(x, power, add, M) {
                let n = (this.getRemainder(x, power, M) + add) % M;
                return this.euclideanAlgorithm(n, M);
            },
            euclideanAlgorithm(a, b) {
                let m = 0;
                let n = 0;
                if (a >= b) {
                    m = a;
                    n = b;
                } else {
                    m = b;
                    n = a;
                }
                let new_n = 0;
                while (true) {
                    if (n == 0) {
                        return m;
                    }
                    new_n = m % n;
                    m = n;
                    n = new_n;
                }
            }
        },
        watch: {
            // ビット数を変更したときに入力欄を増減させる
            answerBit() {
                // ビット数が大きすぎると計算できない
                if (this.answerBit > 16) {
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
                this.routes[0] += '-s';
                for (let i = 1; i < this.answerBit; i++) {
                    this.routes[i] += '-|';
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
                        if (j != 1) {
                            line += j.toString(16);
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
                // let count = 1;
                for (let i = 0; i < this.answerBit; i++) {
                    psi += 'U';
                    // 逆フーリエ変換部分に対応する'-'の数をカウント
                    // count += i + 1;
                }
                this.routes[this.answerBit] = psi + 'o';

                // 解答レジスタの初期値
                let maxValue = Math.pow(2, this.answerBit);
                this.input = [];
                this.input[0] = [1, 0];
                for (let i = 1; i < maxValue; i++) {
                    this.input.push([0, 0]);
                }

                // 問題レジスタの初期値
                let questions = [];
                for (let i = 0; i < maxValue; i++) {
                    questions.push(1);
                }
                this.questions = questions;
            }
        },
        computed: {
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
                        if (routeArray[key] === 'o') {
                            routeArray[key] = '⓪①';
                        }
                        // 半角数字を全角に変換
                        routeArray[key] = routeArray[key].replace(/[0-9]/g, function (s) {
                            return String.fromCharCode(s.charCodeAt(0) + 65248);
                        });
                        if (routeArray[key].match(/[a-f]/) !== null) {
                            routeArray[key] = parseInt(routeArray[key], 16);
                        }
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
            x_power_r_mod_m() {
                if (this.M == 0) {
                    return '?'
                }
                return this.getRemainder(this.x, this.r, this.M);
            },
            x_power_half_r_mod_m() {
                if (this.M == 0) {
                    return '?'
                }
                if (this.getRemainder(this.x, this.r, this.M) - this.M == -1) {
                    return -1;
                }
                return this.getRemainder(this.x, this.r, this.M);
            },
            gcd_x_power_half_r_plus() {
                if (this.M == 0) {
                    return "?";
                }
                return this.euclideanAlgorithmPower(this.x, this.r / 2, 1, this.M);
            },
            gcd_x_power_half_r_minus() {
                if (this.M == 0) {
                    return "?";
                }
                return this.euclideanAlgorithmPower(this.x, this.r / 2, -1, this.M);
            },
            count() {
                let peak = [0];
                for (let i = 1, length = this.probability.length - 1; i < length; i++) {
                    if (this.probability[i] > this.probability[i - 1] && this.probability[i] > this.probability[i + 1]) {
                        peak.push(i);
                    }
                }
                return peak.length;
            }
        }
    });
