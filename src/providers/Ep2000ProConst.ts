export const REAT_STATUS = Buffer.from([0x0a, 0x03, 0x75, 0x30, 0x00, 0x1b, 0x1e, 0xb9]);
export const READ_DATA_2 = Buffer.from([0x0a, 0x03, 0x79, 0x18, 0x00, 0x09, 0x1d, 0xec]);
export const EXPECTED_REPLY_STATUS = 59;
export const EXPECTED_REPLY_COUNT_2 = 23;
export const WORK_STATE = ['', 'INIT', 'SELF_CHECK', 'BACKUP', 'LINE', 'STOP', 'POWER_OFF', 'GRID_CHG', 'SOFT_START'];
export const LOAD_STATE = ['NORMAL', 'ALARM', 'LOAD'];
export const AVR_STATE = ['BYPASS', 'STEPDOWN', 'BOOST'];
export const BUZZER_STATE = ['OFF', 'BLEW', 'ALARM'];
export const CHARGE_STATE = ['CC', 'CV', 'FV'];
export const CHARGE_FLAG = ['UnCharge', 'Charge'];
export const MAIN_SW = ['Off', 'On'];
export const BUZZER_SILENCE = ['Normal', 'Silence'];
export const FREQUENCY_TYPE = ['50Hz', '60Hz'];
export const VOLTAGE_TYPE = ['220V', '120V'];
export const DELAY_TYPE = ['Standard', 'Long delay'];
export const FAULTS = new Map<number, string>([
    [0, ''],
    [1, 'Fan is locked when inverter is off'],
    [2, 'Inverter transformer over temperature'],
    [3, 'battery voltage is too high'],
    [4, 'battery voltage is too low'],
    [5, 'Output short circuited'],
    [6, 'Inverter output voltage is high'],
    [7, 'Overload time out'],
    [8, 'Inverter bus voltage is too high'],
    [9, 'Bus soft start failed'],
    [11, 'Main relay failed'],
    [21, 'Inverter output voltage sensor error'],
    [22, 'Inverter grid voltage sensor error'],
    [23, 'Inverter output current sensor error'],
    [24, 'Inverter grid current sensor error'],
    [25, 'Inverter load current sensor error'],
    [26, 'Inverter grid over current error'],
    [27, 'Inverter radiator over temperature'],
    [31, 'Solar charger battery voltage class error'],
    [32, 'Solar charger current sensor error'],
    [33, 'Solar charger current is uncontrollable'],
    [41, 'Inverter grid voltage is low'],
    [42, 'Inverter grid voltage is high'],
    [43, 'Inverter grid under frequency'],
    [44, 'Inverter grid over frequency'],
    [51, 'Inverter over current protection error'],
    [52, 'Inverter bus voltage is too low'],
    [53, 'Inverter soft start failed'],
    [54, 'Over DC voltage in AC output'],
    [56, 'Battery connection is open'],
    [57, 'Inverter control current sensor error'],
    [58, 'Inverter output voltage is too low'],
    [61, 'Fan is locked when inverter is on.'],
    [62, 'Fan2 is locked when inverter is on.'],
    [63, 'Battery is over-charged.'],
    [64, 'Low battery'],
    [67, 'Overload'],
    [70, 'Output power Derating'],
    [72, 'Solar charger stops due to low battery'],
    [73, 'Solar charger stops due to high PV voltage'],
    [74, 'Solar charger stops due to over load'],
    [75, 'Solar charger over temperature'],
    [76, 'PV charger communication error'],
    [77, 'Parameter error'],
]);