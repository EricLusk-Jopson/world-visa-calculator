```python
import datetime

def date_range(start_date, end_date):
    curr = start_date
    while curr <= end_date:
        yield curr
        curr += datetime.timedelta(days=1)

# Trip dates
t1 = (datetime.date(2025, 3, 14), datetime.date(2025, 3, 21))
t2 = (datetime.date(2025, 4, 18), datetime.date(2025, 7, 2))
t3 = (datetime.date(2025, 9, 19), datetime.date(2025, 9, 26))
t4 = (datetime.date(2025, 11, 27), datetime.date(2025, 12, 30))

trips = [t1, t2, t3, t4]

# Set of all past stay days
past_days = set()
for start, end in trips:
    for d in date_range(start, end):
        past_days.add(d)

print("Trip 1 days:", (t1[1] - t1[0]).days + 1)
print("Trip 2 days:", (t2[1] - t2[0]).days + 1)
print("Trip 3 days:", (t3[1] - t3[0]).days + 1)
print("Trip 4 days:", (t4[1] - t4[0]).days + 1)

def check_validity(entry_date, duration_days):
    # A trip of duration_days starting on entry_date spans [entry_date, entry_date + duration_days - 1]
    trip_days = set(date_range(entry_date, entry_date + datetime.timedelta(days=duration_days - 1)))

    # Combined set of days present
    all_days = past_days.union(trip_days)

    # Check every day during the proposed new trip
    for day_of_stay in trip_days:
        # 180-day window ending on day_of_stay: [day_of_stay - 179 days, day_of_stay]
        window_start = day_of_stay - datetime.timedelta(days=179)
        days_in_window = sum(1 for d in date_range(window_start, day_of_stay) if d in all_days)
        if days_in_window > 90:
            return False, day_of_stay, days_in_window
    return True, None, None

# Search for earliest entry date starting after Dec 30, 2025
start_search = datetime.date(2025, 12, 31)
for i in range(365):
    candidate_entry = start_search + datetime.timedelta(days=i)
    valid, fail_day, count = check_validity(candidate_entry, 21)
    if valid:
        print(f"Earliest entry date for 21-day trip: {candidate_entry}")
        print(f"Trip end date: {candidate_entry + datetime.timedelta(days=20)}")
        break
```

```text
Trip 1 days: 8
Trip 2 days: 76
Trip 3 days: 8
Trip 4 days: 34
Earliest entry date for 21-day trip: 2025-12-31
Trip end date: 2026-01-20
```

```python
# Let's check past travel history compliance first!
for day in sorted(past_days):
    window_start = day - datetime.timedelta(days=179)
    days_in_window = sum(1 for d in past_days if window_start <= d <= day)
    if days_in_window > 90:
        print(f"OVERSTAY detected on past date {day}: {days_in_window} days in 180-day window ending {day}")
```

```python
max_days = 0
for day in sorted(past_days):
    window_start = day - datetime.timedelta(days=179)
    days_in_window = sum(1 for d in past_days if window_start <= d <= day)
    if days_in_window > max_days:
        max_days = days_in_window
        max_day = day

print("Max days in window during past trips:", max_days, "on", max_day)
```

```text
Max days in window during past trips: 84 on 2025-07-02
```

```python
entry_date = datetime.date(2025, 12, 31)
trip_days = [entry_date + datetime.timedelta(days=i) for i in range(21)]

for day in trip_days:
    window_start = day - datetime.timedelta(days=179)
    # count days in window
    days_in_win = [d for d in past_days.union(set(trip_days)) if window_start <= d <= day]
    print(f"Day {day}: Window [{window_start} to {day}] -> {len(days_in_win)} days used")
```

```text
Day 2025-12-31: Window [2025-07-05 to 2025-12-31] -> 43 days used
Day 2026-01-01: Window [2025-07-06 to 2026-01-01] -> 44 days used
Day 2026-01-02: Window [2025-07-07 to 2026-01-02] -> 45 days used
Day 2026-01-03: Window [2025-07-08 to 2026-01-03] -> 46 days used
Day 2026-01-04: Window [2025-07-09 to 2026-01-04] -> 47 days used
Day 2026-01-05: Window [2025-07-10 to 2026-01-05] -> 48 days used
Day 2026-01-06: Window [2025-07-11 to 2026-01-06] -> 49 days used
Day 2026-01-07: Window [2025-07-12 to 2026-01-07] -> 50 days used
Day 2026-01-08: Window [2025-07-13 to 2026-01-08] -> 51 days used
Day 2026-01-09: Window [2025-07-14 to 2026-01-09] -> 52 days used
Day 2026-01-10: Window [2025-07-15 to 2026-01-10] -> 53 days used
Day 2026-01-11: Window [2025-07-16 to 2026-01-11] -> 54 days used
Day 2026-01-12: Window [2025-07-17 to 2026-01-12] -> 55 days used
Day 2026-01-13: Window [2025-07-18 to 2026-01-13] -> 56 days used
Day 2026-01-14: Window [2025-07-19 to 2026-01-14] -> 57 days used
Day 2026-01-15: Window [2025-07-20 to 2026-01-15] -> 58 days used
Day 2026-01-16: Window [2025-07-21 to 2026-01-16] -> 59 days used
Day 2026-01-17: Window [2025-07-22 to 2026-01-17] -> 60 days used
Day 2026-01-18: Window [2025-07-23 to 2026-01-18] -> 61 days used
Day 2026-01-19: Window [2025-07-24 to 2026-01-19] -> 62 days used
Day 2026-01-20: Window [2025-07-25 to 2026-01-20] -> 63 days used
```

The earliest date after December 30, 2025 on which Jordan could enter the Schengen Area for a 21-day trip is **December 31, 2025**.

Key Breakdown & Reasoning

1. Past Schengen Days

Both entry and exit dates count as days spent in the Schengen Area:

- **Trip 1 (Mar 14 – Mar 21, 2025):** 8 days
- **Trip 2 (Apr 18 – Jul 2, 2025):** 76 days
- **Trip 3 (Sep 19 – Sep 26, 2025):** 8 days
- **Trip 4 (Nov 27 – Dec 30, 2025):** 34 days

2. How the 90/180-Day Rule Applies

Under Schengen rules, on **every single day** of a trip, the total days spent in the Schengen Area during the preceding 180-day rolling window (including that day) cannot exceed 90 days.

If Jordan enters on **December 31, 2025** for a 21-day stay (departing on **January 20, 2026**):

- **On Entry Date (Dec 31, 2025):**
- **180-day window:** July 5, 2025 – December 31, 2025.
- Trip 2 ended on July 2, 2025, meaning **Trip 2 has completely rolled out** of the 180-day window.
- Days present: Trip 3 (8 days) + Trip 4 (34 days) + Day 1 of new trip (1 day) = **43 days** (well under the 90-day limit).

- **On Last Day of the Trip (Jan 20, 2026):**
- **180-day window:** July 25, 2025 – January 20, 2026.
- Days present: Trip 3 (8 days) + Trip 4 (34 days) + New Trip (21 days) = **63 days**.

Because the maximum days present in any 180-day window during this period reaches only **63 days**, Jordan can re-enter immediately on **December 31, 2025** without overstaying.
