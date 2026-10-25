// Episode 2 script source: one row per beat → beats.json (caption + card) and script.md (with the on-screen plan).
// Usage: node make-script.cjs   then   node ../speak.mjs beats.json
const fs = require("fs");

const CH = [
  ["ch0 · Hook", "0:00–0:30", "218 BC"],
  ["ch1 · A score to settle", "0:30–1:40", "264 → 218 BC"],
  ["ch2 · The impossible road", "1:40–2:40", "218 BC"],
  ["ch3 · Spain to the Rhône", "2:40–3:50", "spring–Sept 218 BC"],
  ["ch4 · Into the Alps", "3:50–5:00", "Oct–Nov 218 BC"],
  ["ch5 · The landslide", "5:00–6:00", "Nov 218 BC"],
  ["ch6 · Italy", "6:00–7:20", "218 → 217 BC"],
  ["ch7 · Cannae", "7:20–8:40", "217 → 216 BC"],
  ["ch8 · The answer", "8:40–10:00", "216 → 183 BC"],
];

// [chapter index, id, caption, [card head, card sub], on screen]
const B = [
  [0, "hook", "37 war elephants. Over the Alps. In winter.", ["Over the Alps?", "37 war elephants"], "**Frame 0:** a line of elephants and soldiers on a snowy ridge (panel) over the satellite Alps; counter 37 elephants"],
  [0, "march", "In 218 BC, a Carthaginian general marched an army from Spain into Italy, the long way round, over the highest mountains in Europe.", ["218 BC", "Spain → Italy, over the Alps"], "Tan army band draws Spain → Pyrenees → Rhône → Alps → Po valley *(approx.)*"],
  [0, "nearly", "Then he came within a whisker of destroying Rome.", ["Rome", "Almost destroyed"], "Rome pin glows red; three battle bursts pop in Italy"],
  [0, "question", "So here is today's question. Why did Hannibal take the hardest road in the ancient world? And did it work?", ["Today's question", "Why the hardest road?"], "Red \"?\" badge; two arrows: short sea route (crossed out) vs long land route"],
  [0, "go", "Let's follow him on the map.", ["", ""], "Camera pulls out to the western Mediterranean, year chip spins back to 264 BC"],

  [1, "punic", "First, the grudge. Rome and Carthage were the two great powers of the western Mediterranean.", ["Rome vs Carthage", "Two superpowers"], "Rome and Carthage pins; their areas fill red and purple *(approx.)*"],
  [1, "firstwar", "From 264 to 241 BC they fought the First Punic War, mostly at sea. Rome won, and Carthage lost Sicily.", ["First Punic War", "264–241 BC"], "Sicily flips to Rome; panel: galleys ramming at sea"],
  [1, "indemnity", "Carthage had to pay 3,200 talents of silver. Then Rome grabbed Sardinia and Corsica as well, and demanded more.", ["The price of defeat", "3,200 talents"], "Silver coin counter; Sardinia and Corsica flip red"],
  [1, "unjust", "Even Polybius, a Greek historian who admired Rome, called the grab of Sardinia unjust.", ["Unjust", "Even Polybius says so"], "Quote card: Polybius, Histories 3.28"],
  [1, "hamilcar", "A Carthaginian general, Hamilcar Barca, went west to Spain to build a new empire, rich in silver and soldiers.", ["Hamilcar Barca", "A new empire in Spain"], "Arrow Carthage → southern Spain; Barcid area grows; panel: silver mine"],
  [1, "newcarthage", "His son-in-law founded a new capital on the Spanish coast: New Carthage. Today, it is Cartagena.", ["New Carthage", "Today: Cartagena"], "Pin New Carthage with a \"Cartagena\" chip; panel: harbour city"],
  [1, "oath", "The story goes that he made his nine-year-old son swear never to be a friend of Rome. The boy's name was Hannibal.", ["Hannibal", "The oath, age 9"], "Panel: a father and a boy at an altar; card chip \"the story goes\""],
  [1, "command", "In 221 BC, Hannibal took command in Spain. He was about 26.", ["221 BC", "Hannibal in command"], "Pin New Carthage (Cartagena); panel: young general in front of troops"],
  [1, "saguntum", "Two years later he besieged Saguntum, a Spanish city allied to Rome. It fell after eight months.", ["Saguntum", "8-month siege"], "Pin Saguntum, ring of siege marks; panel: walls under siege"],
  [1, "war", "Rome declared war. The Second Punic War had begun.", ["218 BC", "Rome declares war"], "Card stamp \"WAR\"; Rome and Carthage arrows point at each other"],

  [2, "seapower", "Rome expected to fight in Spain and in Africa. After all, Rome now ruled the sea.", ["Rome's plan", "Spain and Africa"], "Roman fleet icons across the sea lanes"],
  [2, "consuls", "One Roman army headed for Spain. Another gathered in Sicily, ready to sail for Carthage itself.", ["Two consuls", "Spain · Africa"], "Two red arrows: Rome → Massilia → Spain, Rome → Sicily → Carthage"],
  [2, "landroute", "Hannibal did the one thing nobody expected. He left the sea alone and went by land.", ["The surprise", "Go by land"], "Red sea route crossed out; long dashed land route lights up"],
  [2, "distance", "Polybius puts the route at about 1,600 kilometres. Through Spain, over the Pyrenees, across Gaul, and over the Alps.", ["The road", "~1,600 km"], "Route draws with a distance counter"],
  [2, "quiz1", "Quick quiz. How long did the march from New Carthage to Italy take? Five weeks, five months, or a year?", ["", ""], "Quiz card, 3-2-1"],
  [2, "quizans1", "Five months. About as long as Napoleon later spent getting to Moscow and back.", ["About 5 months", "Spring to late autumn"], "Calendar chip spring → November; small nod to Ep 1"],
  [2, "army", "Polybius says he crossed the Ebro with 90,000 foot soldiers and 12,000 horsemen. Modern historians think that is too many.", ["The army", "90,000 + 12,000 (Polybius)"], "Big stat; chip \"ancient figure\"; band at full width"],
  [2, "elephants", "And he brought 37 war elephants.", ["The elephants", "37"], "Panel: African forest elephants with mahouts; counter 37"],

  [3, "ebro", "North of the Ebro, the tribes fought him all the way. He left 11,000 men behind to hold the region, and sent about as many home.", ["North of the Ebro", "Men left behind"], "Band thins; chips \"10,000 + 1,000 left\" and \"~11,000 sent home\""],
  [3, "pyrenees", "By the time he crossed the Pyrenees, Polybius counts about 50,000 foot and 9,000 horse.", ["The Pyrenees", "~59,000"], "Zoom to the Pyrenees relief; counter falls"],
  [3, "rhone", "In late September he reached the Rhône, a fast, wide river. On the far bank, a Gaulish tribe, the Volcae, was waiting.", ["The Rhône", "Late September"], "Rhône lights up; Volcae block on the east bank *(crossing site approx.)*"],
  [3, "hanno", "Hannibal sent a force upstream under an officer named Hanno. They crossed at night on rafts, and came down behind the Gauls.", ["The flank", "Hanno upstream"], "Dashed arrow up the river and back down behind the Volcae"],
  [3, "smoke", "At a smoke signal, the main army crossed. Caught from both sides, the Gauls broke and ran.", ["Smoke signal", "Attack from both sides"], "Smoke puff; arrows meet; Volcae block scatters"],
  [3, "rafts", "Then the elephants. Hannibal's men built huge rafts and covered them with earth, so the animals thought they were still on land.", ["Elephants on rafts", "Covered with earth"], "Panel: elephants walking onto an earth-covered raft"],
  [3, "panic", "Some elephants panicked and fell into the river. Their drivers drowned, but the elephants swam across.", ["Panic on the river", "The elephants swam"], "Panel: an elephant swimming with its trunk up"],
  [3, "scipio", "Meanwhile, a Roman army under the consul Scipio had landed at Massilia to stop him. It reached his camp three days too late.", ["Scipio", "3 days late"], "Red arrow from Massilia reaches an empty camp; chip \"3 days late\""],
  [3, "brother", "Scipio made a bold call. He sent his army on to Spain under his brother, and hurried back to Italy himself.", ["Scipio splits", "Army to Spain, he to Italy"], "Red arrow splits: one to Spain, one by sea to Italy"],
  [3, "turn", "Scipio could not believe it. Hannibal was not heading for Spain or the coast. He was heading for the Alps.", ["Wrong way?", "Into the mountains"], "Band turns east into the Alps"],

  [4, "climb", "Polybius says about 38,000 foot and 8,000 horse left the Rhône. Ahead of them were the Alps, in autumn.", ["~46,000 men", "Ahead: the Alps"], "Camera tilts into the Alpine relief; counter"],
  [4, "height", "The passes he was heading for are well over 2,000 metres high. One of them is almost 3,000.", ["The passes", "2,000–3,000 m"], "Altitude ruler beside the Alps"],
  [4, "allobroges", "Mountain tribes, the Allobroges, held the heights above the track, ready to roll rocks down on the column.", ["The Allobroges", "Holding the heights"], "Red marks on ridge tops along the valley"],
  [4, "town", "He even captured their town, and fed his army from its stores.", ["The town", "Food for the army"], "Pin on the Allobroges town; panel: grain sacks carried out"],
  [4, "night", "Hannibal waited for night, when the tribesmen went home to sleep, and quietly took the heights himself.", ["Night move", "He takes the heights"], "Night grade; gold dots climb to the ridges; panel: soldiers climbing by moonlight"],
  [4, "gorge", "Still, the attacks came. In the narrow gorges, horses and pack animals fell off the cliffs with their loads.", ["The gorges", "Animals lost"], "Panel: a narrow gorge, boulders rolling (no bodies)"],
  [4, "elephantshield", "The tribes were terrified of the elephants. Wherever the elephants walked, nobody attacked.", ["The elephants", "Nobody dared"], "Panel: elephants in the column, tribesmen keeping their distance"],
  [4, "snow", "After nine days they reached the top. Snow had already fallen. It was late October, maybe early November.", ["The summit", "Day 9 · snow"], "Snow over the map; day counter 9"],
  [4, "rest", "The army rested there for two days. Men from Africa and Spain, who had never seen snow, stood freezing on the roof of Europe.", ["Two days' rest", "On the roof of Europe"], "Panel: soldiers in cloaks in the snow at a pass"],
  [4, "downhill", "And the way down turned out to be worse than the way up.", ["The descent", "Worse than the climb"], "Arrow tips down toward Italy; red warning chip"],

  [5, "landslide", "On the Italian side, a landslide had swept the track away. There was no path left. Just a sheer slope of ice and rock.", ["The landslide", "The path is gone"], "Panel: broken track over a drop, old snow over new ice"],
  [5, "dig", "The men dug a new track into the mountainside. The horses got through after one day.", ["Digging a road", "Horses: 1 day"], "Panel: soldiers with picks cutting a ledge"],
  [5, "starving", "The elephants waited three days, half-starved, before the road was wide enough.", ["The elephants", "3 days, half-starved"], "Panel: thin elephants waiting in the snow; day counter"],
  [5, "vinegar", "Livy, writing 200 years later, says they cracked the rock with fire and vinegar. Polybius, the older source, never mentions it.", ["Fire and vinegar?", "Livy claims it"], "Panel: fire against a rock face; chip \"Livy only\""],
  [5, "whichpass", "And which pass did they cross? Nobody knows. At least five passes have their supporters.", ["Which pass?", "Nobody knows"], "Five candidate pass pins pop across the Alps *(approx.)*"],
  [5, "dung", "In 2016, scientists found a layer of ancient horse dung below the Col de la Traversette, dated to around 200 BC. Interesting, but not proof.", ["Col de la Traversette", "Ancient dung, not proof"], "Zoom to Traversette (2,947 m)"],
  [5, "caveat", "But that date could be sixty years off, and no Carthaginian objects were found there. The mystery is still open.", ["Not proof", "±60 years, no artefacts"], "Chips \"±60 years\" and \"no artefacts\""],
  [5, "energy", "A 2026 study modelled how much energy each route would cost, and also picked the Traversette. Other historians are not convinced.", ["2026 study", "Energy cost of each pass"], "Bars per pass, Traversette lowest; chip \"debated\""],
  [5, "quiz2", "Quiz time. How many of the 37 elephants made it over the Alps? None, about half, or most of them?", ["", ""], "Quiz card, 3-2-1"],
  [5, "quizans2", "Most of them. Despite the legend, the elephants survived the Alps. It was what came next that killed them.", ["Most survived", "The myth: all died"], "Elephant counter holds near 37; chip \"Myth busted\""],

  [6, "arrive", "Hannibal reached the plains of northern Italy with 20,000 foot and 6,000 horse. We know, because he carved the numbers in bronze himself.", ["Italy", "~26,000 men"], "Band exits the Alps much thinner; panel: a bronze tablet with numbers"],
  [6, "half", "In fifteen days in the Alps, he had lost about half the army that left the Rhône. Many deserted. Many died.", ["Half the army", "Gone in the Alps"], "Ghost band vs thin band; stat \"−20,000\""],
  [6, "ticinus", "Rome was stunned. In November, at the Ticinus river, Hannibal's cavalry routed the Romans. The consul Scipio was wounded.", ["Ticinus", "November 218 BC"], "Pin Ticinus; cavalry arrows; panel: horsemen clashing"],
  [6, "trebia", "In December, at the Trebia, he lured about 40,000 Romans across an icy river and ambushed them. Only about 10,000 broke out.", ["Trebia", "December 218 BC"], "Pin Trebia; Roman blocks wade the river; counter 40,000"],
  [6, "mago", "His brother Mago had hidden 2,000 men in a stream bed. When the Romans had crossed, they struck from behind.", ["The ambush", "Mago, 2,000 men"], "Hidden block appears in a stream bed; arrow into the Roman rear; counter → 10,000"],
  [6, "lastelephant", "But the winter that followed killed every elephant but one.", ["Winter", "One elephant left"], "Elephant counter 37 → 1; panel: a lone elephant in sleet"],
  [6, "eye", "In the spring, Hannibal rode that last elephant through flooded marshes. He caught an infection there, and lost the sight of one eye.", ["The marshes", "He loses an eye"], "Panel: Hannibal on the elephant in floodwater"],
  [6, "trasimene", "In June 217 BC, at Lake Trasimene, he hid his army in the hills. A Roman army marched along the shore, into the morning fog.", ["Lake Trasimene", "June 217 BC"], "Zoom to the lake; Carthaginian blocks on the hills; fog over the shore"],
  [6, "trap", "About 15,000 Romans were killed in a few hours, including the consul Flaminius.", ["The trap", "~15,000 killed"], "Arrows sweep down the hills; counter; no bodies"],

  [7, "fabius", "Rome panicked. It gave power to Fabius Maximus, who refused to fight a battle at all. He just followed Hannibal and wore him down.", ["Fabius Maximus", "The Delayer"], "Red dashed line shadows the band around Italy"],
  [7, "impatient", "Romans mocked him as the Delayer. By the next summer they wanted a real battle, and a big army to win it.", ["Enough waiting", "A real battle"], "Card chips \"Delayer\"; Roman blocks gather"],
  [7, "cannae", "On the 2nd of August 216 BC, at Cannae, about 86,000 Romans faced Hannibal's 50,000.", ["Cannae", "2 August 216 BC"], "Zoom to Cannae; two army layouts; stats 86,000 vs 50,000 *(approx.)*"],
  [7, "crescent", "Hannibal put his weakest troops in the centre, bulging forward like a crescent, and his best African troops on the wings.", ["The crescent", "Weak centre, strong wings"], "Blue crescent bulges toward the red block; African blocks on both wings"],
  [7, "giveway", "The Romans smashed into the centre. It slowly gave way, and pulled them in.", ["The centre bends", "Pulling them in"], "Crescent bends backward; red block pushes deeper"],
  [7, "close", "Then the African wings turned inward, and Hannibal's cavalry came round behind. The Romans were surrounded.", ["The trap closes", "Double envelopment"], "Wings close, cavalry arrow loops behind; ring complete"],
  [7, "cannaedead", "Polybius says about 70,000 Romans died that day. Livy says about 48,000. Either way, it was one of the worst defeats in history.", ["Roman losses", "48,000–70,000"], "Big counter with range chip; consul Paullus chip"],
  [7, "paullus", "One of the two consuls, Aemilius Paullus, died on the field. Rome had lost three armies in under two years.", ["Three armies", "In under two years"], "Three battle pins pulse: Trebia, Trasimene, Cannae"],
  [7, "maharbal", "Livy says one of Hannibal's officers told him: you know how to win a victory, Hannibal, but not how to use it.", ["Maharbal", "Win, but not use it"], "Quote card: Livy 22.51; chip \"Livy only\""],

  [8, "answer", "So, did the hardest road work?", ["The answer", "Did it work?"], "Whole route and the three battles"],
  [8, "worked", "As a surprise, yes. The Alps let Hannibal skip Rome's navy and land an army in Italy that nobody was ready for.", ["Yes: the surprise", "Past Rome's navy"], "Sea route crossed out again; land route glows"],
  [8, "butnot", "But it came at a price. Half his army and almost all his elephants. And no siege engines to take Rome's walls.", ["The price", "Half the army"], "Chips: half the army, 36 elephants, no siege engines"],
  [8, "never", "Hannibal never besieged Rome. Rome refused to surrender, raised new armies, and kept him busy in Italy for fifteen years.", ["15 years in Italy", "Rome never surrendered"], "Band loops around southern Italy, year chip runs to 203 BC"],
  [8, "why", "He had no siege engines, few reinforcements from home, and most of Rome's allies in central Italy stayed loyal.", ["Why not Rome?", "No siege engines"], "Chips pop; central Italian allies glow red around Rome"],
  [8, "zama", "In 203 BC Carthage called him home. A year later, at Zama, a Roman general named Scipio, the son of the consul at the Rhône, beat him.", ["Zama", "202 BC"], "Arrow Italy → Africa; pin Zama; panel: two armies"],
  [8, "death", "Years later, in exile and about to be handed over to Rome, Hannibal took poison.", ["Hannibal", "c. 183 BC"], "Pin in Bithynia; quiet panel of a cup on a table"],
  [8, "legacy", "Rome won the war. But generals still study Cannae today, and the road over the Alps is still the most famous march in history.", ["The legacy", "Cannae is still studied"], "Cannae diagram on a parchment card"],
  [8, "closeq", "Now, your turn. After Cannae, should Hannibal have marched straight on Rome? Tell me in the comments.", ["Your turn", "March on Rome?"], "Poll card: Yes, march on Rome / No, he was right to wait"],
];

const beats = B.map(([, id, caption, card]) => ({ id, caption, card }));
fs.writeFileSync(`${__dirname}/beats.json`, JSON.stringify(beats));

let md = `# History on the Map · Ep 2: Hannibal crosses the Alps, 218 BC

Format: 9:16 vertical long-form, one continuous video, news look (same kit as Ep 1).
Question for the whole video: **"Why did Hannibal take the hardest road in the ancient world? And did it work?"**
Voice: Sadaltager (channel narrator), Gemini TTS. ${B.length} beats, ~${B.reduce((n, b) => n + b[2].split(" ").length, 0)} words ≈ 10 min with pauses.
VO below is the on-screen caption; \`beats.json\` holds the spoken form (numbers as words, via \`../speak.mjs\`).
*(approx.)* = approximate route or position; the Alpine pass is unknown, and the video says so.

Signature visual: the **army band** from Ep 1 (width = men) from New Carthage to the Po valley, thinning at each
of Polybius's counts, plus an **elephant counter** (37 → most over the Alps → 1 after the winter).

`;
let n = 0;
CH.forEach(([title, time, year], c) => {
  md += `## ${title} (${time}) · ${year}\n| # | id | VO | On screen |\n|---|---|---|---|\n`;
  for (const [ci, id, caption, , screen] of B) if (ci === c) md += `| ${++n} | ${id} | ${caption} | ${screen} |\n`;
  md += "\n";
});
fs.writeFileSync(`${__dirname}/script.md`, md);
console.log(B.length, "beats");
