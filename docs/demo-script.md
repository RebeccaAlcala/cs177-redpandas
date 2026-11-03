# Demo script (5 minutes)

**Roles:** one **Driver** clicks, one **Narrator** speaks. Quoted lines are for the Narrator.
**The story:** Maya Chen is a product manager. Her teams keep disagreeing without knowing it, and she can't tell who said what. Everything on screen is mocked data.

## Before you start

- [ ] Open the deployed link in a fresh browser window, zoomed so it reads on the projector
- [ ] Open `/connect` once and check nothing is already connected (it saves in your browser; use a private window if it is)
- [ ] Keep a local copy running as a backup: `npm run dev`

## 1. Sign in and connect sources (30 sec)

1. On the landing page, click **Sign in with company SSO**.
2. Click **Connect** on Google Calendar, Slack, and Google Docs.
3. Click **Go to meetings**.

> "Maya signs in with her company account and connects the places her teams already talk: meetings, Slack, and docs. From here on, the tool does the listening."

## 2. See what each team said about a feature (45 sec)

1. Click **Features** in the nav, then **Customer data export**.
2. Point at the **What each team said** columns, then at the **Conflict** tag on the Compliance and Product cards.

> "Maya doesn't read four transcripts. She opens the feature and sees each team's position side by side. Compliance and Product are both talking about 'customer data', and the tool has flagged that they don't mean the same thing."

## 3. Read the AI summary with its flagged conflict (45 sec)

1. Under **Linked meetings**, click **Data export scoping sync**.
2. Point at the orange **Conflict detected** card (82% confidence).
3. Point at the two **AI summary** points, including the red **No source** chip on the second one.

> "Here's the summary of that meeting. It caught something nobody said out loud: two teams left the room with different definitions. And every point shows its evidence. This one has two sources. This one has none, so Maya knows not to repeat it as fact."

## 4. Trace a claim to its source (60 sec)

1. On the conflict card, click **View →** to open **Conflicts**.
2. Scroll to **Product and Compliance define "customer data" differently**.
3. On the Compliance side, click **2 sources**. The side panel opens.
4. Point at Sana's exact quote and the Slack thread below it.
5. Click **Jump to moment (00:42)** to land on that line of the transcript.

> "Maya clicks the badge and sees exactly what was said, by whom, and when, across both the meeting and Slack. One more click takes her to that moment in the transcript. No more 'I think someone said'. Every claim has a receipt."

## 5. Open the decision log and ask "Why" (60 sec)

1. Click **Decisions** in the nav. Scroll to **Enterprise SSO**.
2. Point at the crossed-out decision and its red **Overturned** tag.
3. Click **Why →** on that decision (**MFA is optional during trials**).
4. Point at the red callout linking to the decision that replaced it, then scroll through the discussion.

> "Six months from now, someone will ask why MFA works the way it does. The decision log shows what was decided, and that this one was later overturned. 'Why' shows the actual conversation that led to it: Security, Growth, and Product in their own words."

## 6. Spot an unsourced claim (30 sec)

1. Click **Features**, then **Enterprise SSO**.
2. In the **Growth** column, point at **MFA at first login costs around 30% of trial signups** and its red **No source** chip.

> "And here's the one that matters most. Growth said MFA costs 30% of signups, and that number helped shape a decision. There's nothing behind it. It came from memory. The tool flags it, so Maya can ask for the data before anyone builds on it."

## Close (15 sec)

> "Meeting Source Tracer records the meeting, catches the conflict, and traces every claim back to its source, so product managers can stop being the human search engine between teams."

## If something breaks

| Problem | Do this |
|---|---|
| The deployed link is down | Switch to the local copy |
| The side panel won't open | Go straight to the full source page: `/trace/src_001` |
| A page shows an empty state | Skip to the next step and keep talking; don't debug live |
