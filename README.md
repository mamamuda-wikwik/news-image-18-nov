# The World on One Page — 18 November 2026

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/mamamuda-wikwik/news-image-18-nov/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/mamamuda-wikwik/news-image-18-nov/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

## What this is

This is my entry for the make.fun news-picture bounty of 18 November 2026:
a single broadsheet front page that tries to hold a whole crowded day of
world news in one frame. The picture itself is the entry — a classic
newspaper front page, masthead at the top, the biggest story given the
most room, and the rest of the day stacked around it in columns. The
little program in this repository does one job only: it hands you a
verified copy of that picture.

If you join make.fun through my link, the referral token tdgxqn9n is the
one tied to this entry.

## The day in the headlines

It was a day when the great powers were all talking and all fighting at
once. In Shenzhen, the leaders of China and Russia sat down together
before joining the American president for a three-way session — a rare
moment of three-way diplomacy in a year that has had very little of it.

The same day, the shooting did not pause. American forces struck a
missile site on Qeshm Island, off the Iranian coast, and Tehran answered
by sending drones toward Bahrain and Kuwait, dragging the Gulf's small
states into a confrontation they did not start.

Further west, Ukraine hit the Kerch Bridge for a second day running, and
this time part of its road deck came down — another blow to the crossing
that links Russia to the Crimean peninsula it holds.

In Washington, the balance of power shifted: the Democrats won the
Senate after taking Alaska, ending up with 56 seats to the Republicans'
44, a result that will shape the rest of the president's term.

Two public-health stories ran side by side. The United States lost the
measles-free standing it had held for 26 years, and in the Democratic
Republic of Congo an Ebola outbreak passed eleven thousand cases — a
reminder that old diseases are still very much with us.

And beyond the politics and the wars, the day had its own quieter
milestones: Nvidia closed a record quarter, OpenAI showed off a new
family of models, Voyager 1 drifted out to one light-day from Earth, a
Russian military plane went down in Siberia killing nineteen people, and
a category five cyclone gathered over the Northern Cook Islands.

## How to run it

You need Node.js 22. No other packages, no network, nothing to install.

```sh
node main.ts ./out
```

That checks `entry.png`, copies it into `./out` under the same name, and
prints a one-line summary with its size in pixels and bytes. If the
picture is missing, is not a real PNG, is bigger than 1 MiB, or is larger
than 1024 by 1024 pixels, the program stops with an error instead of
copying anything. Run it twice and the two copies come out byte for byte
identical.

## Files

- `main.ts` — the program: checks the picture and copies it to the folder you name.
- `entry.png` — the front page itself, the entry for 18 November 2026.
- `README.md` — this file.
- `LICENSE` — the MIT license for this repository.
