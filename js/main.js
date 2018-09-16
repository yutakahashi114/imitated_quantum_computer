const vm =
    new Vue({
        el: '#app',
        data: {
            maxBit: 2,
            bits: [0,0],
            routes: ['-hd-', '--@-'],
            input: [[1, 0], [0, 0], [0, 0], [0, 0]],
            now: '',
            nowPosition: 20,
            binary: true,
            rounding: 10000000,
        },
        methods: {
            // 計算の実行
            calculate() {
                const max = this.routes[0].length;
                let routesArray = [];
                for (let route of this.routes) {
                    routesArray.push(route.split(''));
                }
                this.now = '↓';
                let i = 0;
                // 1秒ごとに1列分の計算を進める
                let loop = setInterval(() => {
                    this.nowPosition += 16;
                    if (i >= max) {
                        this.now = '';
                        this.nowPosition = 20;
                        clearInterval(loop);
                        return;
                    }
                    let targetFlag = false;
                    let controlFlag = false;
                    let targetBit = 0;
                    let controlBit = 0;
                    let rotation = 0;
                    for (let key in routesArray) {
                        // h : アダマール
                        if (routesArray[key][i] === 'h') {
                            this.input = HadamardGate(this.input, (Number(key) + 1), this.maxBit);
                        }
                        // d : 制御ビット
                        if (routesArray[key][i] === 'd' && !controlFlag) {
                            controlFlag = true;
                            controlBit = Number(key) + 1;
                        }
                        // u : 制御ビット
                        if (routesArray[key][i] === 'u' && targetFlag) {
                            this.input = ControlNotGate(this.input, (Number(key) + 1), targetBit, this.maxBit)
                            targetFlag = false;
                        }
                        // @ : 標的ビット
                        if (routesArray[key][i] === '@') {
                            if (controlFlag) {
                                this.input = ControlNotGate(this.input, controlBit, (Number(key) + 1), this.maxBit);
                                controlFlag = false;
                            } else {
                                targetFlag = true;
                                targetBit = Number(key) + 1;
                            }
                        }
                        // 仮実装
                        // D : 制御ビット
                        if (routesArray[key][i] === 'D' && !controlFlag) {
                            controlFlag = true;
                            controlBit = Number(key) + 1;
                        }
                        // U : 制御ビット
                        if (routesArray[key][i] === 'U' && targetFlag) {
                            this.input = ControlRotationGate(this.input, (Number(key) + 1), targetBit, this.maxBit, rotation)
                            targetFlag = false;
                        }
                        // @ : 標的ビット
                        if (isFinite(routesArray[key][i])) {
                            rotation = routesArray[key][i]
                            if (controlFlag) {
                                this.input = ControlRotationGate(this.input, controlBit, (Number(key) + 1), this.maxBit, rotation);
                                controlFlag = false;
                            } else {
                                targetFlag = true;
                                targetBit = Number(key) + 1;
                            }
                        }
                        // s : スワップ
                        if (routesArray[key][i] === 's') {
                            this.input = SwapGate(this.input, this.maxBit);
                            break;
                        }
                    }
                    i++;
                }, 1000);
            },
            setFourierTransform() {
                // 現在の回路を取得（値渡し）
                let route = this.routes.concat();
                for (let i = this.maxBit; i > 0; i--) {
                    // 以後使わないbitに'-'を追加
                    let line = '';
                    for (let j = 0; j < i; j++) {
                        line += '-';
                    }
                    for (let j = i; j < this.maxBit; j++) {
                        route[j] += line;
                    }

                    // 'h'からの文字列を追加
                    line = 'h';
                    for (let j = 2; j <= i; j++) {
                        line += j;
                    }
                    route[i - 1] += line;

                    // 残りに'-D+'を追加する
                    // '---D+++'を作る
                    line = '';
                    for (let j = 0; j < i - 1; j++) {
                        line += '-';
                    }
                    line += 'd';
                    for (let j = 0; j < i - 1; j++) {
                        line += '+';
                    }
                    // 少しずつずらして取得し、追加
                    for (let j = 0; j < i - 1; j++) {
                        let addLine = line.substr(j, i);
                        route[j] += addLine;
                    }
                }
                // スワップゲート追加
                route[0] += 's';
                for (let i = 1; i < this.maxBit; i++) {
                    route[i] += '|';
                }
                // 回路に代入
                this.routes = route;
            }
        },
        watch: {
            // ビット数を変更したときに入力欄を増減させる
            maxBit() {
                this.bits = [];
                this.routes = [];
                for (i = 0; i < this.maxBit; i++) {
                    this.bits.push(0);
                    this.routes.push('-');
                }
            },
            // 初期値を計算の入力側に入れる
            initialValue() {
                const initial = Number.parseInt(this.initialValue,2);
                const maxValue = Math.pow(2, this.maxBit);
                this.input = [];
                for (i = 0; i < maxValue; i++) {
                    this.input.push([0, 0]);
                }
                this.input[initial] = [1, 0];
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
                        if (routeArray[key] === 'd' || routeArray[key] === 'D') {
                            routeArray[key] = '┳';
                        }
                        if (routeArray[key] === 'u' || routeArray[key] === 'U') {
                            routeArray[key] = '┻';
                        }
                        if (routeArray[key] === '+') {
                            routeArray[key] = '╋';
                        }
                        if (routeArray[key] === '@') {
                            routeArray[key] = '◎';
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
            // 計算の初期値を2進数に変換する
            initialValue() {
                let initial = [];
                for (let bit of this.bits) {
                    initial.unshift(bit);
                }
                let binaryNumber = initial.join('');
                let number = Number.parseInt(binaryNumber, 2);
                if (this.binary) {
                    return binaryNumber;
                }
                return number;
            },
            // ビット全体の状態を計算
            output() {
                let result = [];
                for (let value of this.input) {
                    // 四捨五入
                    let re = Math.floor((value[0] * this.rounding) + 0.5) / this.rounding;
                    let im = Math.floor((value[1] * this.rounding) + 0.5) / this.rounding;
                    let complex = re + ' - ' + (-1 * im) + 'i';                    
                    if (im >= 0) {
                        complex = re + ' + ' + im + 'i';
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
            // 出力を2進数に変換
            outputBinary() {
                let result = [];
                let str_0 = '';
                let max = Math.pow(2, this.maxBit);
                for (i = 0; i < this.maxBit; i++) {
                    str_0 += '0';
                }
                for (i = 0; i < max; i++) {
                    let binary = (str_0 + i.toString(2)).substr(-this.maxBit);
                    result.push(binary);
                }
                return result;
            },
        }
    });
