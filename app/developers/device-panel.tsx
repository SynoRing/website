"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DevicePanelCopy } from "../copy/developers";
import { languages, type Lang } from "../i18n";
import { fill } from "../text";
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
  opcodes,
  rebootCommand,
} from "./case-protocol.mjs";
import type { CaseInfo, CaseStatus } from "./case-protocol.mjs";

/* The device panel: connects to a Syno charging case over Web Bluetooth and
   shows what it reports. Everything on screen comes from the case. A value
   its hardware does not measure says so; nothing is filled in with a default. */

// The parts of Web Bluetooth used here; TypeScript's DOM types do not cover it.
type Characteristic = EventTarget & {
  value?: DataView;
  readValue(): Promise<DataView>;
  writeValueWithResponse(data: Uint8Array): Promise<void>;
  startNotifications(): Promise<unknown>;
};
type GattServer = {
  connect(): Promise<GattServer>;
  disconnect(): void;
  getPrimaryService(
    id: string,
  ): Promise<{ getCharacteristic(id: string): Promise<Characteristic> }>;
};
type CaseDevice = EventTarget & { name?: string; gatt?: GattServer };
type Bluetooth = {
  requestDevice(options: {
    filters: { services: string[] }[];
    optionalServices: string[];
  }): Promise<CaseDevice>;
};

type Link = "idle" | "connecting" | "connected" | "reconnecting";

type Session = {
  device: CaseDevice;
  /** Set while the link is being reopened, so a second drop does not start another attempt. */
  recovering: boolean;
  config?: Characteristic;
  command?: Characteristic;
};

type Details = {
  name: string;
  info: CaseInfo;
  manufacturer?: string;
  model?: string;
  /** From the standard Battery Service; null when the case does not offer it. */
  batteryLevel: number | null;
};

type Reading = {
  label: string;
  value: string;
  /** Lines under the value. */
  details?: string[];
  /** Nothing measured to show. */
  dim?: boolean;
  /** 0–100, drawn as a bar. */
  meter?: number;
};

const intervals = [1, 5, 30, 60];
const identifySeconds = 5;
const logLines = 8;
// A restart takes the case a few seconds; give it about twelve to come back.
const reconnectTries = 6;
const reconnectDelayMs = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Maker and model from Device Information; empty when the case leaves it out. */
async function readDeviceInformation(server: GattServer) {
  try {
    const service = await server.getPrimaryService("device_information");
    const text = async (id: string) =>
      new TextDecoder().decode(await (await service.getCharacteristic(id)).readValue());
    return {
      manufacturer: await text("manufacturer_name_string"),
      model: await text("model_number_string"),
    };
  } catch {
    return {};
  }
}

/** The standard Battery Service's level; a case that cannot measure its cell has none. */
async function batteryLevelCharacteristic(server: GattServer) {
  try {
    return await (await server.getPrimaryService("battery_service")).getCharacteristic("battery_level");
  } catch {
    return null;
  }
}

export function DevicePanel({ lang, copy }: { lang: Lang; copy: DevicePanelCopy }) {
  const [supported, setSupported] = useState(true);
  const [link, setLink] = useState<Link>("idle");
  const [details, setDetails] = useState<Details | null>(null);
  const [status, setStatus] = useState<CaseStatus | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [reportEvery, setReportEvery] = useState<number | null>(null);
  const [log, setLog] = useState<{ id: number; at: Date; text: string }[]>([]);
  /** The case in use. Cleared the moment the person lets go of it, which also stops reconnecting. */
  const session = useRef<Session | null>(null);
  const previous = useRef<CaseStatus | null>(null);
  const nextLogId = useRef(0);
  const intervalLabel = useId();

  useEffect(() => {
    setSupported("bluetooth" in navigator);
    return () => {
      const current = session.current;
      session.current = null;
      current?.device.gatt?.disconnect();
    };
  }, []);

  const time = new Intl.DateTimeFormat(languages[lang].htmlLang, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  function note(text: string) {
    const id = nextLogId.current++;
    setLog((lines) => [{ id, at: new Date(), text }, ...lines].slice(0, logLines));
  }

  /** Takes in a status and notes what changed since the one before. */
  function show(next: CaseStatus) {
    const before = previous.current;
    previous.current = next;
    if (!before) {
      if (next.version !== 1) note(copy.log.newerProtocol);
    } else {
      const turned = (was: boolean | null, now: boolean | null) =>
        was !== null && now !== null && was !== now;
      if (turned(before.vinPresent, next.vinPresent))
        note(next.vinPresent ? copy.log.powerOn : copy.log.powerOff);
      if (!before.chargeDone && next.chargeDone) note(copy.log.charged);
      // Finishing a charge also stops it; "Fully charged" already says so.
      else if (turned(before.charging, next.charging))
        note(next.charging ? copy.log.chargingOn : copy.log.chargingOff);
      if (turned(before.ringPresent, next.ringPresent))
        note(next.ringPresent ? copy.log.ringIn : copy.log.ringOut);
      if (!before.batteryLow && next.batteryLow) note(copy.log.batteryLow);
      const had = before.charger?.faults ?? [];
      const has = next.charger?.faults ?? [];
      for (const fault of has)
        if (!had.includes(fault)) note(fill(copy.log.fault, { fault: copy.faults[fault] }));
      if (had.length > 0 && has.length === 0) note(copy.log.faultsCleared);
    }
    setStatus(next);
    setUpdated(new Date());
  }

  function answered({ opcode, result }: ReturnType<typeof decodeCommandResult>) {
    if (result === "ok" && opcode === opcodes.identify) note(copy.log.identifying);
    else if (result === "ok" && opcode === opcodes.reboot) note(copy.log.restarting);
    else if (result === "unsupported" && opcode === opcodes.identify) note(copy.log.noIndicator);
    else note(copy.log.refused);
  }

  /** Connects and reads everything once, then follows the case's notifications. */
  async function open(current: Session) {
    const live = () => session.current === current;
    const server = await current.device.gatt!.connect();
    const service = await server.getPrimaryService(caseService);
    // One request at a time: some Bluetooth stacks refuse overlapping ones.
    const statusValue = await service.getCharacteristic(caseCharacteristics.status);
    const infoValue = await service.getCharacteristic(caseCharacteristics.info);
    const config = await service.getCharacteristic(caseCharacteristics.config);
    const command = await service.getCharacteristic(caseCharacteristics.command);

    // Read before listening: a read raises the same event as a notification.
    const info = decodeInfo(await infoValue.readValue());
    const interval = decodeConfig(await config.readValue());
    const first = decodeStatus(await statusValue.readValue());
    const text = await readDeviceInformation(server);
    const battery = await batteryLevelCharacteristic(server);
    const batteryLevel = battery ? (await battery.readValue()).getUint8(0) : null;
    if (!live()) return;

    current.config = config;
    current.command = command;
    previous.current = null;
    show(first);
    setReportEvery(interval);
    setDetails({ name: current.device.name || copy.unnamed, info, ...text, batteryLevel });

    const follow = async (source: Characteristic, changed: (value: DataView) => void) => {
      source.addEventListener("characteristicvaluechanged", () => {
        if (live() && source.value) changed(source.value);
      });
      await source.startNotifications();
    };
    await follow(statusValue, (value) => show(decodeStatus(value)));
    await follow(config, (value) => {
      const seconds = decodeConfig(value);
      setReportEvery(seconds);
      note(fill(copy.log.interval, { seconds }));
    });
    await follow(command, (value) => answered(decodeCommandResult(value)));
    if (battery)
      await follow(battery, (value) =>
        setDetails((known) => known && { ...known, batteryLevel: value.getUint8(0) }),
      );
    if (live()) setLink("connected");
  }

  function close() {
    const current = session.current;
    session.current = null;
    current?.device.gatt?.disconnect();
    previous.current = null;
    setLink("idle");
    setDetails(null);
    setStatus(null);
    setUpdated(null);
    setReportEvery(null);
  }

  /** The link dropped without being asked to, as it does when the case restarts. */
  async function lost(current: Session) {
    if (session.current !== current || current.recovering) return;
    current.recovering = true;
    setLink("reconnecting");
    note(copy.log.lost);
    for (let attempt = 0; attempt < reconnectTries; attempt++) {
      await sleep(reconnectDelayMs);
      if (session.current !== current) return;
      try {
        await open(current);
        current.recovering = false;
        if (session.current === current) note(copy.log.reconnected);
        return;
      } catch {
        current.device.gatt?.disconnect();
      }
    }
    if (session.current !== current) return;
    close();
    note(copy.log.gaveUp);
  }

  async function connect() {
    const bluetooth = (navigator as Navigator & { bluetooth?: Bluetooth }).bluetooth;
    if (!bluetooth) return;
    setLink("connecting");
    try {
      const device = await bluetooth.requestDevice({
        filters: [{ services: [caseService] }],
        optionalServices: ["battery_service", "device_information"],
      });
      const current: Session = { device, recovering: false };
      session.current = current;
      device.addEventListener("gattserverdisconnected", () => void lost(current));
      await open(current);
      note(fill(copy.log.connected, { name: device.name || copy.unnamed }));
    } catch (error) {
      close();
      // Closing the browser's device chooser is reported as NotFoundError.
      note(
        error instanceof DOMException && error.name === "NotFoundError"
          ? copy.log.cancelled
          : fill(copy.log.failed, { reason: reason(error) }),
      );
    }
  }

  function disconnect() {
    close();
    note(copy.log.disconnected);
  }

  /** Writes to the case. Its answer arrives as a notification (see open). */
  async function send(target: "config" | "command", bytes: Uint8Array) {
    try {
      await session.current?.[target]?.writeValueWithResponse(bytes);
    } catch (error) {
      note(fill(copy.log.writeFailed, { reason: reason(error) }));
    }
  }

  const capabilities = details?.info.capabilities;
  const connected = link === "connected";

  function readings(): Reading[] {
    const labels = copy.readings;
    const values = copy.values;
    if (!status || !capabilities)
      return Object.values(labels).map((label) => ({ label, value: "—", dim: true }));

    const noSensor = { value: values.notMeasured, details: [values.noSensor], dim: true };
    const unknown = { value: values.notMeasured, dim: true };
    const charger = status.charger;
    const yesNo = (state: boolean | null, capable: boolean, yes: string, no: string) =>
      !capable ? noSensor : state === null ? unknown : { value: state ? yes : no };
    const up = durationParts(status.uptimeS);
    // A case running from USB with no cell fitted. Its thermistor is in the
    // battery pack, so the charger reports the missing pack as a cold cell;
    // that is not a temperature problem and is not shown as one.
    const noCell = status.batteryMv !== null && status.batteryPercent === null;
    const faults = (charger?.faults ?? []).filter(
      (fault) => !(noCell && (fault === "batteryCold" || fault === "batteryHot")),
    );

    return [
      {
        label: labels.battery,
        ...(!capabilities.batteryMv
          ? noSensor
          : status.batteryMv === null
            ? unknown
            : status.batteryPercent === null
              ? { value: values.noCell, details: [`${status.batteryMv} mV`], dim: true }
              : {
                  value: `${status.batteryPercent}%`,
                  details: [
                    fill(values.estimate, { mv: status.batteryMv }) +
                      (status.batteryLow ? ` · ${values.low}` : ""),
                  ],
                  meter: status.batteryPercent,
                }),
      },
      {
        label: labels.charging,
        ...(!capabilities.charging
          ? noSensor
          : status.charging === null
            ? unknown
            : {
                value: status.charging
                  ? values.charging
                  : status.chargeDone
                    ? values.charged
                    : values.notCharging,
                // Why it is not charging, or how the charge is going.
                details: !charger
                  ? []
                  : faults.length > 0 || noCell
                    ? [
                        ...(noCell ? [values.nothingToCharge] : []),
                        ...faults.map((fault) => copy.faults[fault]),
                      ]
                    : status.charging
                      ? [
                          fill(values.charge, {
                            phase: copy.phases[charger.phase],
                            ma: charger.batteryMa,
                          }),
                        ]
                      : charger.batteryMa < 0
                        ? [fill(values.discharge, { ma: -charger.batteryMa })]
                        : [],
              }),
      },
      {
        label: labels.power,
        ...yesNo(status.vinPresent, capabilities.vin, values.powerOn, values.powerOff),
        details: [
          ...(charger && status.vinPresent
            ? [
                fill(values.input, {
                  volts: (charger.inputMv / 1000).toFixed(2),
                  ma: charger.inputMa,
                }),
              ]
            : []),
          // Known on any hardware: the case's own USB port reports it.
          status.usbHost ? values.usbHost : values.noUsbHost,
        ],
      },
      {
        label: labels.ring,
        ...yesNo(status.ringPresent, capabilities.ring, values.ringIn, values.ringOut),
      },
      {
        label: labels.temperature,
        ...(status.temperatureC === null
          ? capabilities.temperature
            ? unknown
            : noSensor
          : { value: `${status.temperatureC.toFixed(1)} °C`, details: [values.chip] }),
      },
      {
        label: labels.uptime,
        value: fill(
          up.days
            ? copy.duration.days
            : up.hours
              ? copy.duration.hours
              : up.minutes
                ? copy.duration.minutes
                : copy.duration.seconds,
          up,
        ),
      },
    ];
  }

  const facts: [string, string | undefined][] = details
    ? [
        [copy.device.name, details.name],
        [copy.device.model, details.model],
        [copy.device.manufacturer, details.manufacturer],
        [copy.device.firmware, details.info.firmware],
        [copy.device.hardware, details.info.hardware],
        [copy.device.serial, details.info.serial],
        [copy.device.lastRestart, copy.resetReasons[details.info.resetReason]],
        [copy.device.starts, String(details.info.bootCount)],
        [
          copy.device.batteryService,
          details.batteryLevel === null
            ? copy.device.batteryServiceOff
            : fill(copy.device.batteryServiceOn, { percent: details.batteryLevel }),
        ],
      ]
    : [];

  return (
    <div className="device-panel" data-link={link} role="group" aria-label={copy.label}>
      <div className="device-header">
        <span className="live-dot" />
        <div className="device-title">
          <strong>{details?.name ?? copy.unnamed}</strong>
          <span>
            <span role="status">{copy.states[link]}</span>
            {connected && updated && ` · ${fill(copy.updated, { time: time.format(updated) })}`}
          </span>
        </div>
        {link === "idle" || link === "connecting" ? (
          <button
            className="button button-small"
            onClick={connect}
            disabled={!supported || link === "connecting"}
          >
            {copy.connect}
          </button>
        ) : (
          <button className="device-action" onClick={disconnect}>
            {copy.disconnect}
          </button>
        )}
      </div>
      {!supported && <p className="device-notice">{copy.unsupported}</p>}
      <dl className="device-readings">
        {readings().map((reading) => (
          <div key={reading.label} className="device-reading" data-dim={reading.dim || undefined}>
            <dt>{reading.label}</dt>
            <dd className="device-value">{reading.value}</dd>
            {reading.meter !== undefined && (
              <dd className="device-meter" aria-hidden="true">
                <span style={{ width: `${reading.meter}%` }} />
              </dd>
            )}
            {reading.details?.map((detail) => (
              <dd key={detail} className="device-detail">
                {detail}
              </dd>
            ))}
          </div>
        ))}
      </dl>
      <div className="device-lower">
        <section>
          <h3 className="device-heading">{copy.device.title}</h3>
          {details ? (
            <dl className="device-facts">
              {facts.map(
                ([label, value]) =>
                  value && (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          ) : (
            <p className="device-empty">{copy.device.empty}</p>
          )}
        </section>
        <section>
          <h3 className="device-heading">{copy.controls.title}</h3>
          <div className="device-control">
            <span id={intervalLabel}>
              {copy.controls.interval}
              {reportEvery !== null && ` · ${fill(copy.controls.seconds, { seconds: reportEvery })}`}
            </span>
            <div className="device-options" role="group" aria-labelledby={intervalLabel}>
              {intervals.map((seconds) => (
                <button
                  key={seconds}
                  className="device-action"
                  aria-pressed={reportEvery === seconds}
                  disabled={!connected}
                  onClick={() => send("config", encodeConfig(seconds))}
                >
                  {fill(copy.controls.seconds, { seconds })}
                </button>
              ))}
            </div>
          </div>
          <div className="device-control">
            <div className="device-options">
              <button
                className="device-action"
                disabled={!connected || !capabilities?.identify}
                onClick={() => send("command", identifyCommand(identifySeconds))}
              >
                {copy.controls.identify}
              </button>
              <button
                className="device-action"
                disabled={!connected}
                onClick={() => send("command", rebootCommand())}
              >
                {copy.controls.restart}
              </button>
            </div>
            <p className="device-hint">
              {capabilities && !capabilities.identify
                ? copy.controls.identifyUnsupported
                : fill(copy.controls.identifyHint, { seconds: identifySeconds })}
            </p>
          </div>
          <h3 className="device-heading">{copy.activity.title}</h3>
          <ol className="device-log" aria-live="polite">
            {log.length === 0 && <li className="device-empty">{copy.activity.empty}</li>}
            {log.map((line) => (
              <li key={line.id}>
                <time dateTime={line.at.toISOString()}>{time.format(line.at)}</time>
                {line.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
