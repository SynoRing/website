import assert from "node:assert/strict";
import test from "node:test";
import {
  caseCharacteristics,
  caseService,
  decodeCommandResult,
  decodeConfig,
  decodeInfo,
  decodeStatus,
  durationParts,
  encodeConfig,
  identifyCommand,
  rebootCommand,
} from "../app/developers/case-protocol.mjs";

const view = (hex) => new DataView(Uint8Array.from(hex.match(/../g), (b) => parseInt(b, 16)).buffer);

// The hex strings in the first three tests were read from a case running
// firmware 0.1.0, before it knew its charger: it only measured temperature.

test("decodes a status read from a case", () => {
  const status = decodeStatus(view("012010ff0000fa0a8d000000"));
  assert.equal(status.version, 1);
  assert.equal(status.temperatureC, 28.1);
  assert.equal(status.uptimeS, 141);
  assert.equal(status.usbHost, true);
  assert.equal(status.batteryLow, false);
  assert.equal(status.identifying, false);
  // Not measured by that hardware, so unknown rather than "no" or 0.
  for (const key of ["vinPresent", "charging", "chargeDone", "ringPresent", "batteryPercent", "batteryMv"])
    assert.equal(status[key], null, key);
  assert.deepEqual(
    Object.keys(status.measured).filter((name) => status.measured[name]),
    ["temperature"],
  );
});

test("decodes the info read from a case", () => {
  assert.deepEqual(decodeInfo(view("01000100200306000000744dbd6a3fc370726f746f2d6832")), {
    version: 1,
    firmware: "0.1.0",
    capabilities: {
      batteryMv: false,
      batteryPercent: false,
      charging: false,
      vin: false,
      ring: false,
      temperature: true,
      identify: false,
      charger: false,
    },
    resetReason: "software",
    bootCount: 6,
    serial: "744DBD6A3FC3",
    hardware: "proto-h2",
  });
});

test("decodes the config and a command result read from a case", () => {
  assert.equal(decodeConfig(view("0500")), 5);
  assert.deepEqual(decodeCommandResult(view("0103")), { opcode: 1, result: "unsupported" });
});

// Read from the demo board on firmware 0.2.0: USB power, no cell plugged in,
// so its thermistor pin is open and the charger holds charging off.
test("decodes a status with charger detail read from a case", () => {
  const status = decodeStatus(view("01ad11ff0f00960a1f00000000008c1400000020"));
  assert.equal(status.batteryMv, 15);
  assert.equal(status.batteryPercent, null);
  assert.equal(status.vinPresent, true);
  assert.equal(status.charging, false);
  assert.equal(status.chargeDone, false);
  assert.equal(status.ringPresent, null);
  assert.equal(status.temperatureC, 27.1);
  assert.deepEqual(status.charger, {
    batteryMa: 0,
    inputMv: 5260,
    inputMa: 0,
    phase: "notCharging",
    faults: ["batteryCold"],
  });
  const info = decodeInfo(view("01000200ef0b09000000744dbd6a3fc364656d6f2d312e30"));
  assert.equal(info.firmware, "0.2.0");
  assert.equal(info.hardware, "demo-1.0");
  assert.equal(info.resetReason, "usb");
  assert.deepEqual(
    Object.keys(info.capabilities).filter((name) => !info.capabilities[name]),
    ["ring"],
  );
  assert.deepEqual(decodeCommandResult(view("0100")), { opcode: 1, result: "ok" });
});

test("decodes a charging status", () => {
  // Charging at 316 mA in constant current from 5.12 V, drawing 290 mA.
  const status = decodeStatus(view("01af0357" + "880f" + "fa0a" + "10270000" + "3c01" + "0014" + "2201" + "01" + "00"));
  assert.equal(status.charging, true);
  assert.equal(status.batteryPercent, 87);
  assert.deepEqual(status.charger, {
    batteryMa: 316,
    inputMv: 5120,
    inputMa: 290,
    phase: "constantCurrent",
    faults: [],
  });
  // On the cell alone: current flows out of it, so it reads negative.
  const idle = decodeStatus(view("01af0057" + "880f" + "fa0a" + "10270000" + "f4ff" + "0000" + "0000" + "00" + "81"));
  assert.equal(idle.charger.batteryMa, -12);
  assert.deepEqual(idle.charger.faults, ["input", "timer"]);
  // A status cut short of the detail it claims carries none.
  assert.equal(decodeStatus(view("01af0357880ffa0a10270000")).charger, null);
});

test("decodes a fully measured status", () => {
  // valid: everything but identify. flags: vin, charging, ring, low battery.
  const status = decodeStatus(view("013f4b57" + "880f" + "c4f6" + "10270000"));
  assert.equal(status.batteryPercent, 87);
  assert.equal(status.batteryMv, 3976);
  assert.equal(status.temperatureC, -23.64);
  assert.equal(status.uptimeS, 10000);
  assert.equal(status.vinPresent, true);
  assert.equal(status.charging, true);
  assert.equal(status.chargeDone, false);
  assert.equal(status.ringPresent, true);
  assert.equal(status.usbHost, false);
  assert.equal(status.batteryLow, true);
  assert.equal(status.charger, null);
});

test("ignores fields appended by newer firmware and rejects truncated values", () => {
  assert.equal(decodeStatus(view("012010ff0000fa0a8d000000" + "aabbcc")).uptimeS, 141);
  assert.throws(() => decodeStatus(view("012010ff0000fa0a8d0000")), RangeError);
  assert.throws(() => decodeInfo(view("0100010020")), RangeError);
  assert.throws(() => decodeConfig(view("05")), RangeError);
  // A reset code this page does not know (0x63).
  assert.equal(decodeInfo(view("0100010020" + "63" + "06000000744dbd6a3fc3")).resetReason, "unknown");
  assert.equal(decodeCommandResult(view("0109")).result, "unknown");
});

test("encodes what the panel writes", () => {
  assert.deepEqual([...encodeConfig(5)], [5, 0]);
  assert.deepEqual([...encodeConfig(3600)], [0x10, 0x0e]);
  assert.equal(decodeConfig(new DataView(encodeConfig(1234).buffer)), 1234);
  assert.deepEqual([...identifyCommand(5)], [1, 5]);
  assert.deepEqual([...rebootCommand()], [2]);
});

test("uses the service and characteristic ids the firmware advertises", () => {
  assert.equal(caseService, "60e80001-592f-4425-87f3-9969f6e2570e");
  assert.deepEqual(Object.values(caseCharacteristics), [
    "60e80002-592f-4425-87f3-9969f6e2570e",
    "60e80003-592f-4425-87f3-9969f6e2570e",
    "60e80004-592f-4425-87f3-9969f6e2570e",
    "60e80005-592f-4425-87f3-9969f6e2570e",
  ]);
});

test("splits an uptime into days, hours, minutes and seconds", () => {
  assert.deepEqual(durationParts(59), { days: 0, hours: 0, minutes: 0, seconds: 59 });
  assert.deepEqual(durationParts(3725), { days: 0, hours: 1, minutes: 2, seconds: 5 });
  assert.deepEqual(durationParts(2 * 86400 + 3 * 3600 + 4 * 60 + 5), {
    days: 2,
    hours: 3,
    minutes: 4,
    seconds: 5,
  });
});
