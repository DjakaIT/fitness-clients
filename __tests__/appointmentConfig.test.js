import {
  CLIENT_APPOINTMENT_START_TIMES,
  BLOCK_TIMES,
  canCancel,
  formatDateLong,
  formatDateShort,
  formatWeekLabel,
  getBookingWindow,
  getFreeClientTimeText,
  getFreeClientTimes,
  getShiftEndTime,
  getTrainerWorkStartForDate,
  getWeekMondayFromOffset,
  hoursUntilAppointment,
  minutesToTime,
  normalizeDayBlocks,
  parseLocalDate,
  parseSlotDateTime,
  timeToMinutes,
  toLocalDateString,
} from "../backend/utils/appointmentConfig";

describe("timeToMinutes / minutesToTime", () => {
  it.each([
    ["00:00", 0],
    ["08:30", 510],
    ["23:59", 1439],
  ])("parses %s", (time, minutes) => {
    expect(timeToMinutes(time)).toBe(minutes);
  });

  it.each([null, undefined, "", "8", "8:00:00", "abc", 830, {}])(
    "returns NaN for %p",
    (input) => {
      expect(timeToMinutes(input)).toBeNaN();
    },
  );

  it("round-trips through minutesToTime", () => {
    for (const time of CLIENT_APPOINTMENT_START_TIMES) {
      expect(minutesToTime(timeToMinutes(time))).toBe(time);
    }
  });

  it("keeps two digits past midnight-crossing totals", () => {
    expect(minutesToTime(65)).toBe("01:05");
  });
});

describe("parseLocalDate", () => {
  it("parses a real date at local midnight", () => {
    const d = parseLocalDate("2025-03-10");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(0);
  });

  it("rejects dates that do not exist in the calendar", () => {
    expect(parseLocalDate("2025-02-30")).toBeNull();
    expect(parseLocalDate("2025-13-01")).toBeNull();
    expect(parseLocalDate("2023-02-29")).toBeNull();
  });

  it("accepts a real leap day", () => {
    expect(parseLocalDate("2024-02-29")).not.toBeNull();
  });

  it.each([null, undefined, "", "10-03-2025", "2025/03/10", 20250310])(
    "rejects %p",
    (input) => {
      expect(parseLocalDate(input)).toBeNull();
    },
  );
});

describe("date formatters", () => {
  it("formats a known Monday", () => {
    expect(formatDateLong("2025-03-10")).toBe("Ponedjeljak, 10. ožu.");
    expect(formatDateShort("2025-03-10")).toBe("Pon, 10. ožu.");
  });

  // Regression: these used to render "undefined, NaN. undefined." when handed
  // an empty string, which was reachable from the booking screen.
  it.each(["", null, undefined, "not-a-date", "2025-02-30"])(
    "degrades to an empty string for %p",
    (input) => {
      expect(formatDateLong(input)).toBe("");
      expect(formatDateShort(input)).toBe("");
    },
  );
});

describe("toLocalDateString", () => {
  it("zero-pads month and day", () => {
    expect(toLocalDateString(new Date(2025, 0, 5))).toBe("2025-01-05");
  });

  it("does not shift across a UTC boundary the way toISOString would", () => {
    const lateEvening = new Date(2025, 2, 10, 23, 30);
    expect(toLocalDateString(lateEvening)).toBe("2025-03-10");
  });

  it("returns an empty string for an invalid date", () => {
    expect(toLocalDateString(new Date("nope"))).toBe("");
    expect(toLocalDateString(null)).toBe("");
  });
});

describe("time grids", () => {
  it("only offers starts where a full session fits inside the day", () => {
    expect(CLIENT_APPOINTMENT_START_TIMES[0]).toBe("08:00");
    expect(CLIENT_APPOINTMENT_START_TIMES.at(-1)).toBe("19:00");
  });

  it("spaces starts on the 30-minute grid", () => {
    for (let i = 1; i < CLIENT_APPOINTMENT_START_TIMES.length; i += 1) {
      const gap =
        timeToMinutes(CLIENT_APPOINTMENT_START_TIMES[i]) -
        timeToMinutes(CLIENT_APPOINTMENT_START_TIMES[i - 1]);
      expect(gap).toBe(30);
    }
  });

  it("gives the trainer a wider block window than the client day", () => {
    expect(BLOCK_TIMES[0]).toBe("06:00");
    expect(BLOCK_TIMES.at(-1)).toBe("22:00");
  });
});

describe("normalizeDayBlocks", () => {
  it("treats null / undefined / empty as fully free", () => {
    expect(normalizeDayBlocks(null)).toEqual([]);
    expect(normalizeDayBlocks(undefined)).toEqual([]);
    expect(normalizeDayBlocks([])).toEqual([]);
  });

  it("expands the legacy single-start string into one 4h shift", () => {
    expect(normalizeDayBlocks("09:00")).toEqual([
      { start: "09:00", end: "13:00" },
    ]);
  });

  it("sorts blocks by start time", () => {
    expect(
      normalizeDayBlocks([
        { start: "16:00", end: "18:00" },
        { start: "08:00", end: "10:00" },
      ]),
    ).toEqual([
      { start: "08:00", end: "10:00" },
      { start: "16:00", end: "18:00" },
    ]);
  });

  it("drops malformed, zero-length and inverted blocks", () => {
    expect(
      normalizeDayBlocks([
        null,
        { start: "09:00" },
        { start: "10:00", end: "10:00" },
        { start: "14:00", end: "12:00" },
        { start: "bogus", end: "12:00" },
        { start: "08:00", end: "09:00" },
      ]),
    ).toEqual([{ start: "08:00", end: "09:00" }]);
  });

  it("merges overlapping and touching blocks", () => {
    expect(
      normalizeDayBlocks([
        { start: "08:00", end: "10:00" },
        { start: "09:30", end: "11:00" },
        { start: "11:00", end: "12:00" },
      ]),
    ).toEqual([{ start: "08:00", end: "12:00" }]);
  });

  it("keeps a disjoint block separate", () => {
    expect(
      normalizeDayBlocks([
        { start: "08:00", end: "10:00" },
        { start: "10:30", end: "11:00" },
      ]),
    ).toHaveLength(2);
  });
});

describe("getShiftEndTime", () => {
  it("adds the legacy 4h shift", () => {
    expect(getShiftEndTime("09:00")).toBe("13:00");
  });

  it("returns null for an unparseable start", () => {
    expect(getShiftEndTime("")).toBeNull();
    expect(getShiftEndTime(null)).toBeNull();
  });
});

describe("getFreeClientTimes", () => {
  it("offers the whole day when the trainer has no blocks", () => {
    expect(getFreeClientTimes([])).toEqual(CLIENT_APPOINTMENT_START_TIMES);
  });

  it("offers nothing when the trainer is busy all day", () => {
    expect(getFreeClientTimes([{ start: "06:00", end: "22:00" }])).toEqual([]);
  });

  it("excludes a start whose session would overlap a block", () => {
    const free = getFreeClientTimes([{ start: "10:00", end: "12:00" }]);
    // A 09:30 start runs to 10:30 and would collide.
    expect(free).not.toContain("09:30");
    expect(free).not.toContain("11:30");
    // 09:00 ends exactly at 10:00, and 12:00 starts exactly at the block end.
    expect(free).toContain("09:00");
    expect(free).toContain("12:00");
  });

  it("leaves no travel buffer around a block — by design", () => {
    const free = getFreeClientTimes([{ start: "12:00", end: "16:00" }]);
    expect(free).toContain("11:00");
    expect(free).toContain("16:00");
  });

  it("handles two blocks with a usable gap between them", () => {
    expect(
      getFreeClientTimes([
        { start: "08:00", end: "12:00" },
        { start: "14:00", end: "20:00" },
      ]),
    ).toEqual(["12:00", "12:30", "13:00"]);
  });
});

describe("getFreeClientTimeText", () => {
  it("names the empty case", () => {
    expect(getFreeClientTimeText([{ start: "06:00", end: "22:00" }])).toBe(
      "Nema slobodnih termina.",
    );
  });

  it("collapses a contiguous run into one window", () => {
    expect(getFreeClientTimeText([{ start: "12:00", end: "22:00" }])).toBe(
      "08:00 - 12:00",
    );
  });

  it("lists disjoint windows separately", () => {
    expect(
      getFreeClientTimeText([
        { start: "10:00", end: "12:00" },
        { start: "15:00", end: "17:00" },
      ]),
    ).toBe("08:00 - 10:00, 12:00 - 15:00, 17:00 - 20:00");
  });
});

describe("getTrainerWorkStartForDate", () => {
  const schedule = {
    monday: [{ start: "08:00", end: "12:00" }],
    friday: "09:00",
  };

  it("reads the weekday key for the date", () => {
    expect(getTrainerWorkStartForDate(schedule, "2025-03-10")).toEqual(
      schedule.monday,
    );
    expect(getTrainerWorkStartForDate(schedule, "2025-03-14")).toBe("09:00");
  });

  it("returns null for a day with no entry, the weekend, or a bad date", () => {
    expect(getTrainerWorkStartForDate(schedule, "2025-03-11")).toBeNull();
    expect(getTrainerWorkStartForDate(schedule, "2025-03-15")).toBeNull();
    expect(getTrainerWorkStartForDate(schedule, "bogus")).toBeNull();
    expect(getTrainerWorkStartForDate(null, "2025-03-10")).toBeNull();
  });
});

describe("hoursUntilAppointment / canCancel", () => {
  const slotStart = new Date(2025, 2, 10, 10, 0).getTime();

  it("measures the gap to the session start", () => {
    expect(
      hoursUntilAppointment("2025-03-10", "10:00", slotStart - 3 * 3600_000),
    ).toBeCloseTo(3);
  });

  it("goes negative once the session has started", () => {
    expect(
      hoursUntilAppointment("2025-03-10", "10:00", slotStart + 3600_000),
    ).toBeCloseTo(-1);
  });

  it("allows cancelling comfortably ahead of the cutoff", () => {
    expect(canCancel("2025-03-10", "10:00", slotStart - 48 * 3600_000)).toBe(
      true,
    );
  });

  it("refuses inside the 24h cutoff", () => {
    expect(canCancel("2025-03-10", "10:00", slotStart - 23 * 3600_000)).toBe(
      false,
    );
  });

  it("treats exactly 24h before as still cancellable", () => {
    expect(canCancel("2025-03-10", "10:00", slotStart - 24 * 3600_000)).toBe(
      true,
    );
  });

  it("refuses for an unparseable slot rather than defaulting to allow", () => {
    expect(canCancel("bogus", "10:00")).toBe(false);
    expect(canCancel("2025-03-10", "xx:yy")).toBe(false);
    expect(hoursUntilAppointment("bogus", "10:00")).toBeNaN();
  });
});

describe("parseSlotDateTime", () => {
  it("places the session at the right local wall-clock time", () => {
    const d = parseSlotDateTime("2025-03-10", "14:30");
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it("returns null when either half is unparseable", () => {
    expect(parseSlotDateTime("2025-02-30", "10:00")).toBeNull();
    expect(parseSlotDateTime("2025-03-10", "")).toBeNull();
  });
});

describe("getBookingWindow", () => {
  it("always targets next week, Mon–Fri", () => {
    // Wednesday 2025-03-12 → the week of Monday 2025-03-17.
    const w = getBookingWindow(new Date(2025, 2, 12, 15, 0));
    expect(w.weekStart).toBe("2025-03-17");
    expect(w.weekEnd).toBe("2025-03-21");
    expect(w.bookableDates).toEqual([
      "2025-03-17",
      "2025-03-18",
      "2025-03-19",
      "2025-03-20",
      "2025-03-21",
    ]);
  });

  it("treats Sunday as the tail of the outgoing week, not the start of a new one", () => {
    // Sunday 2025-03-16 belongs to the week of Mon 2025-03-10, so the target
    // is still 2025-03-17 — the same answer a Saturday gives.
    expect(getBookingWindow(new Date(2025, 2, 16)).weekStart).toBe(
      "2025-03-17",
    );
    expect(getBookingWindow(new Date(2025, 2, 15)).weekStart).toBe(
      "2025-03-17",
    );
  });

  it("rolls to the next Monday once the week turns over", () => {
    expect(getBookingWindow(new Date(2025, 2, 17)).weekStart).toBe(
      "2025-03-24",
    );
  });

  it("crosses a month and a year boundary correctly", () => {
    expect(getBookingWindow(new Date(2025, 11, 30)).weekStart).toBe(
      "2026-01-05",
    );
  });
});

describe("getWeekMondayFromOffset", () => {
  const wednesday = new Date(2025, 2, 12);

  it("returns this week's Monday at offset 0", () => {
    expect(getWeekMondayFromOffset(0, wednesday)).toBe("2025-03-10");
  });

  it("walks forwards and backwards a week at a time", () => {
    expect(getWeekMondayFromOffset(1, wednesday)).toBe("2025-03-17");
    expect(getWeekMondayFromOffset(-1, wednesday)).toBe("2025-03-03");
  });

  it("keeps Sunday inside the week that just ended", () => {
    expect(getWeekMondayFromOffset(0, new Date(2025, 2, 16))).toBe(
      "2025-03-10",
    );
  });
});

describe("formatWeekLabel", () => {
  it("labels Monday through Friday", () => {
    expect(formatWeekLabel("2025-03-10")).toBe("10. ožu – 14. ožu");
  });

  it("spans a month boundary", () => {
    expect(formatWeekLabel("2025-03-31")).toBe("31. ožu – 4. tra");
  });

  it("degrades to an empty string for a bad date", () => {
    expect(formatWeekLabel("nope")).toBe("");
  });
});
