# Sources · Episode 1: Napoleon invades Russia, 1812

Checked online 21 Oct 2026. All dates are Gregorian (New Style); Russian sources of the time ran 12 days
behind (Borodino = 26 Aug Old Style). Britannica and napoleon-series.org could not be fetched, so other
independent sources stand in for them.

Source keys
- **WFI** = https://en.wikipedia.org/wiki/French_invasion_of_Russia
- **WBo** = https://en.wikipedia.org/wiki/Battle_of_Borodino
- **WBe** = https://en.wikipedia.org/wiki/Battle_of_Berezina
- **WFM** = https://en.wikipedia.org/wiki/Fire_of_Moscow_(1812)
- **WGA** = https://en.wikipedia.org/wiki/Grande_Arm%C3%A9e
- **WN** = https://en.wikipedia.org/wiki/Napoleon
- **WCS** = https://en.wikipedia.org/wiki/Continental_System
- **WFE** = https://en.wikipedia.org/wiki/First_French_Empire
- **WK** = https://en.wikipedia.org/wiki/Mikhail_Kutuzov
- **WMi** = https://en.wikipedia.org/wiki/Charles_Joseph_Minard
- **NAM** = https://www.nam.ac.uk/explore/emperors-samovars (National Army Museum)
- **WHE-B** = https://www.worldhistory.org/article/2274/battle-of-borodino/
- **WHE-T** = https://www.worldhistory.org/timeline/Napoleon's_Invasion_of_Russia/
- **NE** = https://www.napoleon-empire.org/en/battles/campaign-russia-1812-day-by-day.php
- **NET** = https://www.napoleon-empire.org/en/counter-revolution/toulon.php
- **WHN** = https://warfarehistorynetwork.com/?p=107791
- **MW** = https://masswerk.at/nowgobang/2018/observing-minard
- **HD** = R package HistData, Minard.troops / Minard.cities / Minard.temp
  (https://cran.r-project.org/package=HistData ; CSV: https://vincentarelbundock.github.io/Rdatasets/csv/HistData/Minard.troops.csv)

| Beat | Claim in the script | Value (range) | Sources | Confidence | Note |
|---|---|---|---|---|---|
| hook, back | "400,000 marched in · barely 10,000 came back" | Minard: 422,000 crossed, 10,000 back (main line) | WMi; MW; HD; WFI | high as Minard's figures | 10,000 is Minard's main column only. Counting flank corps (Austrians, Prussians, Macdonald) about 93,000–120,000 got out. Script says so in `back` |
| toulon | Artillery officer at Toulon 1793, aged 24 | Siege artillery from Sep 1793; city retaken 19 Dec 1793; born 15 Aug 1769 | WN; NET | high | |
| rise | Seized power 1799, crowned himself Emperor 1804 | Coup 9–10 Nov 1799; crowned Notre-Dame 2 Dec 1804 | WN | high | |
| wins | Austerlitz (Austria, Russia), Jena (Prussia), Friedland (Russia) | 1805, 1806, 1807 | WN | high | |
| map | By 1810–12 France ruled or controlled from Spain to the Baltic | Empire of 130 departments + satellites; ~40 % of Europe's population | WFE; WN | medium-high | Spain contested throughout |
| quiz1 | Britain never conquered, protected by the navy | Trafalgar 1805 | WN; WCS | high | |
| cs | Berlin Decree 1806 banned trade with Britain | 21 Nov 1806 | WCS | high | |
| tilsit | Tilsit 1807, Russia joins the ban | Signed 7 Jul 1807 | WN; WHE-T | high | |
| hurt | Russia's exports to Britain (grain, timber, hemp) hurt | | WCS; WFI | high | |
| ukase | Last day of 1810: ports opened to neutral ships, French goods taxed | Ukase 31 Dec 1810 | WHE-T; WCS | high | |
| poland | Duchy of Warsaw on Russia's border seen as a threat | Created 1807 | WFI; WN | high | |
| gather, numbers | ~450,000 in the first wave; ~600,000 in all | First wave 440,000–450,000+; total 600,000–685,000 | WFI; WGA; NAM; WHE-B | high (range) | |
| nations | About half not French; Poles, Germans, Italians, Austrians, Prussians, Swiss… | Riehn: 355,000 of 685,000 French | WGA; WFI | medium-high | "about half" |
| horses | 150,000–200,000 horses, about 1,300 cannon | Cannon 1,300–1,400 | WFI; WHE-B | medium | |
| plan | Expected a short campaign (~3 weeks of supplies) | Supply prepared for ~24 days | WFI | medium | Script says "a short war", supply "for a few weeks" |
| cross | 24 Jun 1812 at Kovno (Kaunas) | Three bridges | NE; WFI; WHE-T | high | |
| minard | Minard's 1869 map; band width = men (1 mm = 10,000) | Dated 20 Nov 1869 | WMi; MW | high | Original map is public domain; we redraw from the HD numbers (facts) and credit HD in the description |
| retreat | Barclay de Tolly and Bagration retreated | Joined at Smolensk | NAM; WFI | high | |
| scorch | Crops and villages burned | | NAM; WFI | high | |
| disease, third | ~100,000 lost in the first month; about a third in 8 weeks, mostly disease, heat, desertion | | WFI; WHE-B | high | Core point: the army melted in summer |
| smolensk | Smolensk 16–18 Aug, city burned | ~10,000 French / 12,000 Russian casualties | WFI; NE | high (dates) | |
| kutuzov | Kutuzov took command end of August | Appointed 20 Aug, joined army 29 Aug | WK; NE | medium-high | |
| stand | Borodino, ~120 km west of Moscow | 110–120 km | WBo | high | |
| sides | 7 Sep: ~130,000 French and allies vs ~120,000+ Russians, 1,200+ guns | French 103–135k (587 guns); Russians 120–160k incl. militia (~640 guns) | WBo; WHE-B | high (range) | Script: "about 130,000 … more than 120,000 Russians" |
| losses | 70,000+ killed or wounded in one day; bloodiest day of the Napoleonic Wars | French 28–42k, Russians 40–53k | WBo; WHE-B; NAM | high | Keep the qualifier "of the Napoleonic Wars" |
| guard | Napoleon held back the Imperial Guard | | WBo | high | |
| quiz2 | Kutuzov abandoned Moscow without a fight | Council of Fili, 13 Sep | WFI; WK | high | |
| enter | 14 Sep entered Moscow; nobody brought the keys | Kremlin 15 Sep | WFM; NE | high | |
| empty | ~270,000 people, most left | 6,000–10,000 stayed | WFM | high | |
| fire | Four days; about three quarters destroyed | 6,496 of 9,151 houses | WFM; NE | high | |
| who | Most historians blame Russian arson, probably Rostopchin; debated | | WFM | medium | Worded as debated |
| letters | Peace offers to the Tsar, no answer | 20 and 22 Sep | NE; WFM | high | |
| leave | 19 Oct, ~100,000 left with loot | 95,000–108,000 | WFI; HD; NE | high (date) | |
| malo | Maloyaroslavets 24 Oct forced the old road | | WFI; WHE-T; NE | high | |
| snow | Real winter from early Nov | Hard frost 26 Oct; blizzard ~6 Nov | NE; WFI | medium-high | |
| cold | Below −30 °C in early December | Minard: −30 °R (−37.5 °C) on 6 Dec | HD; MW; NE | high (as Minard) | |
| krasnoi | Krasnoi mid-Nov, Ney's rearguard nearly destroyed | 15–18 Nov | NE; WHE-T | high | |
| berezina, eble, crossing | 26–29 Nov; ~400 pontonniers built two bridges in icy water; few survived; bridges burned 29 Nov with stragglers left behind | | WBe; WHN; NE | high (dates), low-medium (survivor count) | Script does not give a survivor number for the pontonniers |
| napleave | 5 Dec, left by sledge for Paris from Smorgoni | | NE; WFI | high | |
| back | Last remnants recrossed the Neman mid-Dec | 12–14 Dec | WFI; NE | high | |
| causes | Losses mostly before winter: disease, heat, supply, distance, Russian strategy | | WFI; HD | high | |
| russia | Russia lost hundreds of thousands | 150,000–300,000 military dead; ~1M total deaths is medium | WFI | medium | Script stays at "hundreds of thousands" |
| after | Allies in Paris within two years; abdication Apr 1814, Elba | 6 Apr 1814 | WN | high | |
| poles | The Poles sent close to 100,000 men, hoping for their country back | 90,000–120,000 | WGA; WFI | medium-high | |
| vilna | Vilna taken without a fight four days after the crossing | 28 Jun 1812 | NE; WFI | high | |
| vitebsk | Napoleon stopped at Vitebsk ~two weeks in late July hoping for battle | 28 Jul – 12 Aug | NE; HD | high | |
| smolosses | Smolensk: ~10,000 French and ~12,000 Russian killed or wounded in three days | | WFI; NE | medium | |
| tarutino | 18 Oct: Kutuzov struck Murat's outpost at Tarutino (Vinkovo); retreat ordered | | WFI; NE | high | "No peace" = Alexander never answered (see letters) |
| kremlin | Rearguard (Mortier) blew up parts of the Kremlin on Napoleon's orders | 23 Oct | WFI; NE | medium-high | |
| vyazma | Vyazma, 3 Nov: Miloradovich attacks the rearguard | | WHE-T; NE | high | |
| smolensk2 | Back at Smolensk 9 Nov with ~60,000 fit men | | NE | medium-high | |
| prisoners | ~100,000 French and allies taken prisoner | 100,000–120,000 | WFI; WHE-T | medium | |
| tauroggen | 30 Dec 1812: Yorck's Prussian corps signs the Convention of Tauroggen | | WN; NAM | high | A corps-level truce, not yet Prussia's declaration of war (Mar 1813) |
| leipzig | Leipzig, 16–19 Oct 1813: ~560,000 soldiers, largest battle of the Napoleonic Wars; Napoleon defeated | | https://en.wikipedia.org/wiki/Battle_of_Leipzig | high | Do not say "largest in Europe before WWI" |
| minard2 | Minard (retired engineer) drew it in 1869, 57 years later; Tufte: possibly "the best statistical graphic ever drawn" | | WMi; MW | high | Script says "some call it" |
| distance | Nearly 1,000 km Neman → Moscow by road | Straight line ~875 km | coordinates | medium | |

## Map and data credits (video description)
- Imagery: NASA Blue Marble (public domain)
- Rivers: © OpenStreetMap contributors (ODbL) / Natural Earth (public domain)
- Army route and troop numbers after Charles Joseph Minard (1869), via the HistData R package (M. Friendly)
- Approximate routes: all army lines are approximate and simplified, as on Minard's original
