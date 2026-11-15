/* The Syno charging case's Bluetooth protocol, version 1, as the firmware
   documents it (docs/protocol.md in the charger repository). Multi-byte
   fields are little-endian. Trailing bytes a decoder does not know are
   ignored: that is how the firmware adds fields without a new version. */

const uuid = (id) => `60e8000${id}-592f-4425-87f3-9969f6e2570e`;

export const caseService = uuid(1);
export const caseCharacteristics = {
  status: uuid(2),
  info: uuid(3),
  config: uuid(4),
  command: uuid(5),
};

/** Seconds between status reports that a case accepts. */
export const reportInterval = { min: 1, max: 3600 };

/**
 * What a case can measure. Info.capabilities says what the hardware is wired
 * for; Status.valid says which of those a given status actually carries.
 * `charger` is the charger detail that firmware 0.2 appends to a status.
 * @typedef {{ batteryMv: boolean, batteryPercent: boolean, charging: boolean,
 *   vin: boolean, ring: boolean, temperature: boolean, identify: boolean,
 *   charger: boolean }} CaseFields
 */
const fieldNames = [
  "batteryMv",
  "batteryPercent",
  "charging",
  "vin",
  "ring",
  "temperature",
  "identify",
  "charger",
];

const chargePhases = /** @type {const} */ ([
  "notCharging",
  "constantCurrent",
  "constantVoltage",
  "topOff",
]);

/** Why the charger is not doing what was asked of it, by bit. */
const chargerFaults = /** @type {const} */ ([
  "input",
  "battery",
  "system",
  "output",
  "chargerHot",
  "batteryCold",
  "batteryHot",
  "timer",
]);

/**
 * @typedef {object} ChargerDetail
 * @property {number} batteryMa Into the cell positive, out of it negative.
 * @property {number} inputMv
 * @property {number} inputMa
 * @property {(typeof chargePhases)[number]} phase
 * @property {(typeof chargerFaults)[number][]} faults
 */

/** @returns {CaseFields} */
const fields = (bits) =>
  /** @type {CaseFields} */ (
    Object.fromEntries(fieldNames.map((name, bit) => [name, Boolean((bits >> bit) & 1)]))
  );

/**
 * A value is null when the case did not measure it, which is different from
 * a measured "no" or 0.
 * @typedef {object} CaseStatus
 * @property {number} version
 * @property {CaseFields} measured
 * @property {boolean | null} vinPresent
 * @property {boolean | null} charging
 * @property {boolean | null} chargeDone
 * @property {boolean | null} ringPresent
 * @property {boolean} usbHost A computer is talking to the case's USB port.
 * @property {boolean} identifying
 * @property {boolean} batteryLow
 * @property {number | null} batteryPercent
 * @property {number | null} batteryMv
 * @property {number | null} temperatureC Of the case's chip, not of its cell.
 * @property {number} uptimeS
 * @property {ChargerDetail | null} charger
 */

/**
 * @param {DataView} view
 * @returns {CaseStatus}
 */
export function decodeStatus(view) {
  if (view.byteLength < 12) throw new RangeError("status is shorter than 12 bytes");
  const measured = fields(view.getUint8(1));
  const flags = view.getUint8(2);
  const flag = (bit) => Boolean((flags >> bit) & 1);
  return {
    version: view.getUint8(0),
    measured,
    vinPresent: measured.vin ? flag(0) : null,
    charging: measured.charging ? flag(1) : null,
    chargeDone: measured.charging ? flag(2) : null,
    ringPresent: measured.ring ? flag(3) : null,
    usbHost: flag(4),
    identifying: flag(5),
    batteryLow: flag(6),
    batteryPercent: measured.batteryPercent ? view.getUint8(3) : null,
    batteryMv: measured.batteryMv ? view.getUint16(4, true) : null,
    temperatureC: measured.temperature ? view.getInt16(6, true) / 100 : null,
    uptimeS: view.getUint32(8, true),
    // Firmware 0.1 sent the 12 bytes above and nothing more.
    charger:
      measured.charger && view.byteLength >= 20
        ? {
            batteryMa: view.getInt16(12, true),
            inputMv: view.getUint16(14, true),
            inputMa: view.getInt16(16, true),
            phase: chargePhases[view.getUint8(18)] ?? "notCharging",
            faults: chargerFaults.filter((_, bit) => (view.getUint8(19) >> bit) & 1),
          }
        : null,
  };
}

/** Why the case last restarted, by the firmware's reset code. */
const resetReasons = /** @type {const} */ ({
  1: "powerOn",
  2: "resetPin",
  3: "software",
  4: "crash",
  5: "watchdog",
  6: "watchdog",
  7: "watchdog",
  8: "deepSleep",
  9: "brownout",
  11: "usb",
  12: "jtag",
});

/** @typedef {(typeof resetReasons)[keyof typeof resetReasons] | "unknown"} ResetReason */

/**
 * @typedef {object} CaseInfo
 * @property {number} version
 * @property {string} firmware
 * @property {CaseFields} capabilities
 * @property {ResetReason} resetReason
 * @property {number} bootCount Lifetime starts.
 * @property {string} serial
 * @property {string} hardware
 */

/**
 * @param {DataView} view
 * @returns {CaseInfo}
 */
export function decodeInfo(view) {
  if (view.byteLength < 16) throw new RangeError("info is shorter than 16 bytes");
  const byte = (offset) => view.getUint8(offset);
  return {
    version: byte(0),
    firmware: `${byte(1)}.${byte(2)}.${byte(3)}`,
    capabilities: fields(byte(4)),
    resetReason: resetReasons[/** @type {keyof typeof resetReasons} */ (byte(5))] ?? "unknown",
    bootCount: view.getUint32(6, true),
    serial: Array.from({ length: 6 }, (_, i) => byte(10 + i).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase(),
    hardware: new TextDecoder().decode(
      new Uint8Array(view.buffer, view.byteOffset + 16, view.byteLength - 16),
    ),
  };
}

/**
 * The report interval in force, in seconds.
 * @param {DataView} view
 */
export function decodeConfig(view) {
  if (view.byteLength < 2) throw new RangeError("config is shorter than 2 bytes");
  return view.getUint16(0, true);
}

/** @param {number} seconds */
export const encodeConfig = (seconds) => Uint8Array.of(seconds & 0xff, (seconds >> 8) & 0xff);

export const opcodes = /** @type {const} */ ({ identify: 0x01, reboot: 0x02 });

/** Blink the case's indicator; 0 stops it. @param {number} seconds 0–60 */
export const identifyCommand = (seconds) => Uint8Array.of(opcodes.identify, seconds);
export const rebootCommand = () => Uint8Array.of(opcodes.reboot);

const results = /** @type {const} */ (["ok", "unknownCommand", "badArgument", "unsupported"]);

/**
 * The case's answer to a command: which one, and how it went. "unsupported"
 * means this hardware lacks what the command needs.
 * @param {DataView} view
 * @returns {{ opcode: number, result: (typeof results)[number] | "unknown" }}
 */
export function decodeCommandResult(view) {
  if (view.byteLength < 2) throw new RangeError("command result is shorter than 2 bytes");
  return { opcode: view.getUint8(0), result: results[view.getUint8(1)] ?? "unknown" };
}

/** @param {number} seconds */
export function durationParts(seconds) {
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}
