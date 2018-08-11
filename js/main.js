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
                    }
                    i++;
                }, 1000);
            },
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
                        if (routeArray[key] === 'd') {
                            routeArray[key] = '┳';
                        }
                        if (routeArray[key] === 'u') {
                            routeArray[key] = '┻';
                        }
                        if (routeArray[key] === '+') {
                            routeArray[key] = '╋';
                        }
                        if (routeArray[key] === '@') {
                            routeArray[key] = '◎';
                        }
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
                return initial.join('');
            },
            // ビット全体の状態を計算
            output() {
                let result = [];
                for (let value of this.input) {
                    // 四捨五入
                    let re = Math.floor((value[0] * this.rounding) + 0.5) / this.rounding;
                    let im = Math.floor((value[1] * this.rounding) + 0.5) / this.rounding;
                    let complex = re + ' + ' + im + 'i';
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
