const FORMAT = [
  ['15 players', '5 teams of 3', '2 tables (3 teams + 2 teams)'],
  ['16-17 players', '4 teams of 3 + 1 or 2 teams of 4', '2 tables'],
  ['18 players', '6 teams of 3', '3 tables of 2 teams'],
  ['19-20 players', '4 teams of 3 + 2 teams of 4', '3 tables of 2 teams'],
]
const SCORING = [
  'The team whose player goes out first scores 3 points.',
  'Among the other teams at that table, the team with the fewest cards left across its members scores 2 points.',
  'Any remaining team scores 1 point.',
  'If the 15 minutes run out and nobody went out, the team with the fewest cards left scores 2 points (teams tied on the fewest each score 2) and every other team scores 1 point.',
  'Total points over the scored rounds decide the finalists. Ties are broken by the fewest cards left in the last round. If teams are still tied for a finalist place, a play-off game decides it.',
  'The top 3 teams play the final. The winner of the final takes the title.',
]
const FLOW = [
  'Players are seated according to their assigned teams and tables.',
  'Each player is dealt 7 cards.',
  'Standard UNO rules apply, together with the turn rules below.',
  'A round lasts a maximum of 15 minutes.',
  'The round ends immediately when one player clears all their cards.',
  "The winning player's team receives 3 points.",
  'Of the remaining teams, the team with the fewest total cards remaining receives 2 points.',
  'Any other team receives 1 point.',
  'Volunteers record the scores before players rotate to the next table or round.',
  'After the scored rounds, the highest-ranked teams proceed to the final.',
]
const TURNS = [
  'Every turn lasts 10 seconds. If a player takes longer, they forfeit: draw 1 card and their turn is skipped.',
  'Every wrong placement of a card (for example, putting a card down when it is not your turn) is a forfeit: draw 1 card as a penalty. Play then continues as normal.',
]
const WALKIN = [
  ['Before Round 1', "The walk-in joins the team with the fewest members, up to a maximum of 4. A volunteer tells the team's facilitator and adjusts the format using the table above."],
  ['Three or more walk-ins together', "They form a new team. It starts with the average points of the other teams so they aren't far behind."],
  ['After Round 1 (or after the last round)', "The walk-in joins the fun-variant table, or acts as a team supporter, timekeeper or scorekeeper helper. They can be included in the next session's draw."],
  ['More than 20 players', "Add a casual volunteer-led table. Youths who don't want to compete can play there."],
  ['Fewer than 15 players', 'Use a single table for 9 or fewer players, with 2 rounds and a final. For 10 to 14 players, run 2 tables with the same scoring.'],
  ['Players leaving early', 'The team continues with 2 players, or merges with another short team.'],
]
const ROLES = [
  '1 lead who handles the schedule and timekeeping',
  '1 scorekeeper',
  '2 or 3 table facilitators',
  '1 floater who greets walk-ins and settles rule questions',
]
const DISPUTES = [
  'The table facilitator checks the one-page rules sheet and decides on the spot.',
  'If it is still disputed, the floater or lead makes the final call.',
  'The ruling stands for the rest of the session. If no clear rule applies, replay the turn.',
]

function H({ children }) {
  return <h3 className="mb-2 mt-5 text-xl font-bold text-uno-yellow">{children}</h3>
}
function List({ items, ordered }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className={`space-y-1 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>{items.map((t) => <li key={t}>{t}</li>)}</Tag>
}

export default function FullRules() {
  return (
    <div className="text-base">
      <p className="text-white/80">The formal tournament rules, as set out in the event proposal. Standard UNO rules apply throughout.</p>
      <H>Format</H>
      <List items={['This plan is built around 15 players as the baseline and 20 as the upper limit.', 'Everyone plays all the scored rounds, and no team is knocked out early.', 'A team of 3 is the standard unit, with a few teams of 4 to absorb extra players.', 'Sessions run 7 to 9pm with a 15-minute round cap.']} />
      <dl className="mt-3 space-y-2">
        {FORMAT.map(([p, t, tb]) => (
          <div key={p} className="rounded-xl border border-white/20 bg-white/5 p-3">
            <dt className="font-bold">{p}</dt>
            <dd>{t}</dd>
            <dd className="text-white/80">{tb}</dd>
          </div>
        ))}
      </dl>
      <H>Scoring</H>
      <List items={SCORING} />
      <H>Round flow</H>
      <List items={FLOW} ordered />
      <H>Turn rules</H>
      <List items={TURNS} />
      <H>Walk-in contingency</H>
      <dl className="space-y-2">
        {WALKIN.map(([s, a]) => (
          <div key={s} className="rounded-xl border border-white/20 bg-white/5 p-3">
            <dt className="font-bold">{s}</dt>
            <dd>{a}</dd>
          </div>
        ))}
      </dl>
      <H>Volunteer roles (6 volunteers)</H>
      <List items={ROLES} />
      <H>Handling disagreements</H>
      <List items={DISPUTES} ordered />
      <p className="mt-3">State the house rules in the briefing, for example "no stacking draw cards" and the penalty for forgetting to call Uno. Sportsmanship also earns a prize.</p>
    </div>
  )
}
