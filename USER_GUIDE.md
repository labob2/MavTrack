# MavTrack — User Guide

MavTrack is a GPA, credit, and scholarship tracker built for students who are tired of piecing together their academic standing from five different places — a grade portal, a degree audit tool, and a scholarship award letter that nobody re-reads after the first week of school.

This guide walks through every feature: what it does, how to use it, and why it works the way it does.

---

## Getting started

**Creating an account:** Go to the MavTrack sign-in page and click **"Don't have an account? Sign up."** Enter an email and a password (at least 6 characters), then hit **Sign up**.

Depending on how the site is configured, you may need to confirm your email before you can sign in — if so, you'll see a message telling you to check your inbox.

**Signing in:** Once you have an account, just enter your email and password and hit **Sign in**.

**Your data follows you.** Because MavTrack uses real accounts, whatever you enter is tied to your account, not your browser or device. Log in from your laptop, your phone, a library computer — it's all the same data, always in sync.

---

## The Dashboard

This is your home screen — everything that matters, in one place, at a glance.

**Cumulative GPA:** shown large at the top of every page. This is calculated from every graded course you've entered, across every semester.

**Progress toward graduation:** a set of bars, one per requirement category (for example, Major Requirements, General Education, Electives). Each bar shows how many credit hours you've completed toward that category, how many are required, and how many you have left. These bars only count credit hours from courses you've actually finished — a course still marked "in progress," or one you failed, doesn't count yet.

**GPA trend:** once you have two or more semesters entered, a small line chart appears showing how your semester-by-semester GPA has moved over time. This is just for your own visibility — a quick gut check on whether you're trending up or down.

**Scholarship standing:** if you've added any scholarships (see below), this section shows each one along with a status — **On track**, **Watch**, or **At risk**. More on exactly what that means further down.

---

## Courses

This is where you build your actual academic record, one semester at a time.

**Adding a semester:** type a name (like "Fall 2026") in the box at the top of the Courses page and click **Add semester**.

**Adding a course:** inside a semester, fill in:
- **Course name** — whatever you want to call it (a course code like "CSE 1325" works well)
- **Credits** — how many credit hours it's worth
- **Grade** — pick from the dropdown, or leave it on **"In progress"** if you're still taking it
- **Counts toward** — which requirement category this course applies to (see the Requirements section below)

Then click **Add course**.

**Editing anything:** every field for a course you've already added — name, credits, grade, category — can be changed directly, right in the table. Nothing needs a separate "edit mode."

**Removing things:** each course has a small trash icon to delete just that course. Each semester has a **Remove semester** button, which removes that semester and every course inside it.

**A note on grades:** MavTrack uses a plain letter scale — A, B, C, D, F — worth 4.0, 3.0, 2.0, 1.0, and 0.0 points respectively. No plus/minus grades, matching how they're actually calculated at most schools that don't use them.

---

## Requirements

This page defines what actually counts toward your degree. Rather than hardcoding "major / gen-ed / elective" as fixed, unchangeable buckets, MavTrack treats these as a flexible list you control.

Each requirement group has:
- **A label** — what to call it (e.g. "CS Major," "Math Minor," "General Education")
- **A type** — major, minor, gen-ed, or elective
- **Credits required** — how many credit hours you need in that category to satisfy it

By default, MavTrack starts you off with three groups: Major Requirements, General Education, and Electives. You can rename them, change their credit targets, delete them, or add entirely new ones.

**Why this matters:** if you're pursuing a double major, an additional minor, or any combination of overlapping requirements, you're not stuck — just add another group for it (e.g., a second "Major Requirements" group, or a "Minor" group), and start tagging courses toward it. Your graduation progress bars and calculations extend automatically; nothing about the underlying app needs to change.

---

## Scholarships

Enter the actual, specific terms of any scholarship you hold, and MavTrack will continuously check your real academic record against them — instead of you having to remember to check yourself.

**Adding a scholarship:**
- **Scholarship name**
- **Min GPA** — the minimum cumulative GPA the scholarship requires
- **Min credits/semester** — the minimum number of credit hours you must be enrolled in each semester
- **Other conditions** — an optional free-text field for anything that doesn't fit a simple number (for example, a specific major requirement, or a community service component)

### Understanding the status: On track / Watch / At risk

MavTrack doesn't just check pass-or-fail against the minimum — it checks how much room you actually have, because a GPA that barely clears the minimum is a very different situation from one that clears it comfortably.

- **On track** — your GPA is comfortably above the minimum. A normal bad semester wouldn't put your scholarship at risk.
- **Watch** — you're above the minimum, but without much of a cushion. Worth paying attention to.
- **At risk** — either your GPA has actually dropped below the minimum, or it's dangerously close, or you're not enrolled in enough credit hours this semester to satisfy the scholarship's terms.

That last point trips people up sometimes: **it's possible to see "At risk" even with a great GPA**, if your current semester's credit load is below what the scholarship requires. Both conditions are checked — GPA and enrollment — because both are usually real requirements in an actual award letter.

---

## What-if

This is a sandbox for testing the future without touching your real record.

Go to the What-if tab, name your hypothetical semester (or leave the default), and add courses to it the same way you would on the Courses page — except this time, the "grade" is an estimate, not a real result.

MavTrack then shows you two numbers side by side: your **current cumulative GPA**, and your **projected GPA** if that hypothetical semester played out as entered. If you have scholarships on file, it also shows what your standing would look like under that projected GPA — so you can answer questions like *"if I get a B and two C's next semester, is my scholarship still safe?"* before the semester happens, not after.

Nothing here is saved as part of your real academic history. You can clear it and start over anytime with the **Clear hypothetical** button.

---

## Your account

**Signing out:** click **Sign out** at the bottom of the sidebar. You'll need to sign back in with your email and password to see your data again.

**Data privacy:** your academic data is private to your account. Nobody else can see your grades, GPA, or scholarship details.

---

## A few honest limitations

- **MavTrack is not your university's official record.** Your school's own systems are always the source of truth for your actual standing. Think of MavTrack as a second set of eyes, not a replacement.
- **Everything is entered by hand.** MavTrack doesn't log into any university system on your behalf — you're always in control of what's entered, but that also means it's only as accurate as what you put in.
- **The requirement-tracking system counts credit hours, not specific course requirements.** MavTrack doesn't know that "you specifically need CSE 3320, not just any 3 major credits" — it tracks totals, not a full course-by-course degree audit.

---

Questions, bugs, or feature ideas — check the GitHub repository linked in the footer.
