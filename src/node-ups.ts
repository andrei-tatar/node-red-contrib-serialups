import { defer, timer } from "rxjs";
import { tap, switchMap, map, distinctUntilChanged, retry } from 'rxjs/operators';
import { Ep2000ProProvider } from "./providers/Ep2000ProProvider";

const PERIODIC_UPDATE_SEC = 10;
const POLL_INTERVAL_MSEC = 500;
const SKIP = PERIODIC_UPDATE_SEC * 1000 / POLL_INTERVAL_MSEC;

module.exports = function (RED: any) {
    RED.nodes.registerType('node-ups', function (this: NodeInterface, config: any) {
        RED.nodes.createNode(this, config);

        if (!config.port) {
            return;
        }

        const subscription = defer(() => Ep2000ProProvider.begin(config.port)).pipe(
            tap(_ => this.status({
                fill: 'green',
                shape: 'ring',
                text: 'connected',
            })),
            switchMap(provider =>
                timer(0, POLL_INTERVAL_MSEC).pipe(
                    switchMap(index => provider.read().pipe(map(data => ({ index, data })))),
                ),
            ),
            tap(({ data, index }) => {
                if (index % SKIP === 0) {
                    this.send({ payload: data, topic: config.topic });
                }
            }),
            map(({ data }) => data.grid.voltage > 150 ? 'POWER' : 'NOPOWER'),
            distinctUntilChanged(),
            tap(state => {
                this.send([null, { payload: state, topic: config.topic }]);
            }),
            retry({
                delay: (err) => {
                    this.error(err);
                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: 'error, retrying in 10 sec'
                    });
                    return timer(10000);
                },
            }),
        ).subscribe();

        this.on('close', () => {
            subscription.unsubscribe();
        });
    });
};

export interface NodeMessage {
    payload: any;
    topic?: string;
}

export interface NodeInterface {
    credentials: { [key: string]: string };

    on(type: 'input', callback: (msg: NodeMessage, send?: (msg: NodeMessage) => void, done?: (err?: any) => void) => void): void;
    on(type: 'close', callback: () => void): void;

    send(msg: any): void;

    log(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;

    status(params: {
        fill: 'red' | 'green' | 'yellow' | 'blue' | 'grey',
        text: string,
        shape: 'ring' | 'dot',
    } | {}): void;
}
