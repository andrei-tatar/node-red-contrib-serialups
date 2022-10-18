import { SerialPort } from 'serialport';
import { merge, Observable, Subject } from 'rxjs';
import { first, map, scan, switchMap, tap, timeout } from 'rxjs/operators';
import * as cnst from './Ep2000ProConst';

export class Ep2000ProProvider {
    private port: SerialPort;
    private data = new Subject<Buffer>();

    private constructor(private readonly portName: string) {
        this.port = new SerialPort({
            path: this.portName,
            baudRate: 9600,
            autoOpen: false,
        });
        this.port.on('data', data => this.data.next(data));
    }

    static begin(portName: string) {
        return new Observable<Ep2000ProProvider>(observer => {
            const provider = new Ep2000ProProvider(portName);
            provider.port.open(err => {
                if (err) {
                    observer.error(err);
                }
            });
            provider.port.once('open', () => observer.next(provider));
            provider.port.once('error', err => observer.error(err));
            return () => provider.port.close();
        });
    }

    read() {
        return this.getData(cnst.REAT_STATUS, cnst.EXPECTED_REPLY_STATUS).pipe(
            switchMap(status =>
                this.getData(cnst.READ_DATA_2, cnst.EXPECTED_REPLY_COUNT_2)
                    .pipe(map(writable => ({ status, writable }))),
            ),
            map(({ status, writable }) => ({
                machineType: status.readInt16BE(0),
                softwareVersion: status.readInt16BE(2),
                workState: cnst.WORK_STATE[status.readInt16BE(4)],
                batClass: status.readInt16BE(6),
                ratedPower: status.readInt16BE(8),
                grid: {
                    voltage: status.readInt16BE(10) * 0.1,
                    frequency: status.readInt16BE(12) * 0.1,
                    frequencyType: cnst.FREQUENCY_TYPE[writable.readInt16BE(0)],
                    voltageType: cnst.VOLTAGE_TYPE[writable.readInt16BE(2)],
                },
                output: {
                    voltage: status.readInt16BE(14) * 0.1,
                    frequency: status.readInt16BE(16) * 0.1,
                },
                load: {
                    current: status.readInt16BE(18) * 0.1,
                    power: status.readInt16BE(20),
                    percent: status.readInt16BE(24),
                    state: cnst.LOAD_STATE[status.readInt16BE(26)],
                },
                battery: {
                    voltage: status.readInt16BE(28) * 0.1,
                    current: status.readInt16BE(30) * 0.1,
                    soc: status.readInt16BE(34),
                },
                transformerTemp: status.readInt16BE(36),
                avrState: cnst.AVR_STATE[status.readInt16BE(38)],
                buzzerState: cnst.BUZZER_STATE[status.readInt16BE(40)],
                fault: cnst.FAULTS.get(status.readInt16BE(42)),
                alarm: status.readInt16BE(44),
                charge: {
                    state: cnst.CHARGE_STATE[status.readInt16BE(46)],
                    flag: cnst.CHARGE_FLAG[status.readInt16BE(48)],
                },
                mainSw: cnst.MAIN_SW[status.readInt16BE(50)],
                delayType: cnst.DELAY_TYPE[status.readInt16BE(52)],
                bulkChargeCurrent: writable.readInt16BE(10),
                batteryLowVoltage: writable.readInt16BE(4) * 0.1,
                constantChargeVoltage: writable.readInt16BE(6) * 0.1,
                floatChargeVoltage: writable.readInt16BE(8) * 0.1,
                buzzerSilence: cnst.BUZZER_SILENCE[writable.readInt16BE(12)],
                enableGridCharge: writable.readInt16BE(14) === 0 ? 'Enable' : 'Disable',
                enableKeySound: writable.readInt16BE(16) === 0 ? 'Enable' : 'Disable',
            }))
        );
    }

    private getData(command: Buffer, expectedReplyCount: number): Observable<Buffer> {
        return merge(
            this.readData(expectedReplyCount),
            this.sendCommand(command)
        );
    }

    private sendCommand(data: Buffer): Observable<never> {
        return new Observable(observer => {
            this.port.write(data, err => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.complete();
                }
            });
        });
    }

    private readData(dataLength: number, timeoutMiliseconds = 600) {
        return this.data.pipe(
            scan((ctx, data) => {
                ctx.offset += data.copy(ctx.buffer, ctx.offset);
                return ctx;
            }, {
                buffer: Buffer.alloc(dataLength),
                offset: 0,
            }),
            first(ctx => ctx.offset === dataLength),
            map(ctx => ctx.buffer),
            tap(data => {
                if (!this.errorCheck(data)) {
                    throw new Error('Data did not pass CRC check');
                }
            }),
            map(data => data.slice(3, data.length - 2)),
            timeout(timeoutMiliseconds),
        );
    }

    private errorCheck(data: Buffer) {
        const numArray1 = data;
        const numArray2 = data.slice(0, data.length - 2);
        const num1 = numArray1[numArray1.length - 2] + numArray1[numArray1.length - 1];

        let maxValue1 = 255;
        let maxValue2 = 255;
        const num2 = 1;
        const num3 = 160;
        for (let num4 of numArray2) {
            maxValue1 ^= num4;
            for (let index = 0; index <= 7; ++index) {
                const num5 = maxValue2;
                const num6 = maxValue1;
                maxValue2 >>= 1;
                maxValue1 >>= 1;
                if ((num5 & 1) == 1)
                    maxValue1 |= 128;
                if ((num6 & 1) == 1) {
                    maxValue2 ^= num3;
                    maxValue1 ^= num2;
                }
            }
        }
        return maxValue2 + maxValue1 == num1;
    }
}
