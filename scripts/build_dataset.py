#!/usr/bin/env python3
"""Build data/players.json and data/nations.json.

Preserves all existing player entries exactly, tops up the original 12 nations
with current (2026-era) stars, and adds rosters for the 2026 World Cup
qualifiers plus a few iconic historic nations. Ratings are community-curated
(corrections welcome via GitHub Issues), mirroring the project's data model.

Run:  python3 scripts/build_dataset.py
"""
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def era_for(year):
    if year <= 1990:
        return "classic"
    if year <= 2010:
        return "modern"
    return "contemporary"


def slug(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


# Nations: id, name, flag, World Cup appearances (wheel weighting, through 2022;
# 2026 debutants weighted 1).
NATIONS = [
    ("brazil", "Brazil", "🇧🇷", 22),
    ("germany", "Germany", "🇩🇪", 20),
    ("italy", "Italy", "🇮🇹", 18),
    ("argentina", "Argentina", "🇦🇷", 18),
    ("france", "France", "🇫🇷", 16),
    ("england", "England", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 16),
    ("spain", "Spain", "🇪🇸", 16),
    ("mexico", "Mexico", "🇲🇽", 17),
    ("uruguay", "Uruguay", "🇺🇾", 14),
    ("belgium", "Belgium", "🇧🇪", 14),
    ("sweden", "Sweden", "🇸🇪", 12),
    ("switzerland", "Switzerland", "🇨🇭", 12),
    ("netherlands", "Netherlands", "🇳🇱", 11),
    ("usa", "United States", "🇺🇸", 11),
    ("south-korea", "South Korea", "🇰🇷", 11),
    ("czechia", "Czechia", "🇨🇿", 10),
    ("hungary", "Hungary", "🇭🇺", 9),
    ("chile", "Chile", "🇨🇱", 9),
    ("poland", "Poland", "🇵🇱", 9),
    ("portugal", "Portugal", "🇵🇹", 8),
    ("austria", "Austria", "🇦🇹", 8),
    ("paraguay", "Paraguay", "🇵🇾", 8),
    ("scotland", "Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", 8),
    ("cameroon", "Cameroon", "🇨🇲", 8),
    ("japan", "Japan", "🇯🇵", 7),
    ("croatia", "Croatia", "🇭🇷", 6),
    ("colombia", "Colombia", "🇨🇴", 6),
    ("morocco", "Morocco", "🇲🇦", 6),
    ("iran", "Iran", "🇮🇷", 6),
    ("saudi-arabia", "Saudi Arabia", "🇸🇦", 6),
    ("australia", "Australia", "🇦🇺", 6),
    ("tunisia", "Tunisia", "🇹🇳", 6),
    ("nigeria", "Nigeria", "🇳🇬", 6),
    ("ecuador", "Ecuador", "🇪🇨", 4),
    ("algeria", "Algeria", "🇩🇿", 4),
    ("ghana", "Ghana", "🇬🇭", 4),
    ("norway", "Norway", "🇳🇴", 4),
    ("egypt", "Egypt", "🇪🇬", 3),
    ("ivory-coast", "Ivory Coast", "🇨🇮", 3),
    ("senegal", "Senegal", "🇸🇳", 3),
    ("south-africa", "South Africa", "🇿🇦", 3),
    ("new-zealand", "New Zealand", "🇳🇿", 2),
    ("canada", "Canada", "🇨🇦", 2),
    ("turkey", "Turkey", "🇹🇷", 2),
    ("dr-congo", "DR Congo", "🇨🇩", 1),
    ("iraq", "Iraq", "🇮🇶", 1),
    ("panama", "Panama", "🇵🇦", 1),
    ("qatar", "Qatar", "🇶🇦", 1),
    ("bosnia", "Bosnia and Herzegovina", "🇧🇦", 1),
    ("haiti", "Haiti", "🇭🇹", 1),
    ("curacao", "Curaçao", "🇨🇼", 1),
    ("cape-verde", "Cape Verde", "🇨🇻", 1),
    ("jordan", "Jordan", "🇯🇴", 1),
    ("uzbekistan", "Uzbekistan", "🇺🇿", 1),
]

# New players: nation -> [(name, [positions], year, rating, fun_fact, club)]
# club="" for pure legends. Stats are intentionally sparse for current squads
# (tournament in progress); the card falls back to club + fun_fact context.
P = {
    # ---- Top-ups for the original 12 nations: current 2026-era stars ----
    "Brazil": [
        ("Neymar", ["LW", "CAM"], 2018, 90, "Brazil's record scorer", "Santos"),
        ("Vinícius Júnior", ["LW"], 2022, 90, "Champions League final match-winner", "Real Madrid"),
        ("Rodrygo", ["RW", "ST"], 2026, 86, "Big-game forward", "Real Madrid"),
        ("Alisson", ["GK"], 2022, 89, "Commanding shot-stopper", "Liverpool"),
        ("Marquinhos", ["CB"], 2022, 87, "Captain at the back", "Paris Saint-Germain"),
        ("Bruno Guimarães", ["CM", "CDM"], 2026, 85, "Box-to-box engine", "Newcastle United"),
        ("Casemiro", ["CDM"], 2022, 84, "Midfield destroyer", "Manchester United"),
        ("Endrick", ["ST"], 2026, 80, "Teenage phenom", "Real Madrid"),
    ],
    "Argentina": [
        ("Lautaro Martínez", ["ST"], 2022, 87, "Ruthless poacher", "Inter"),
        ("Julián Álvarez", ["ST", "CAM"], 2022, 86, "Relentless presser", "Atlético Madrid"),
        ("Alexis Mac Allister", ["CM"], 2022, 85, "World Cup-winning midfielder", "Liverpool"),
        ("Enzo Fernández", ["CM"], 2022, 84, "Young general", "Chelsea"),
        ("Cristian Romero", ["CB"], 2022, 86, "Aggressive ball-winner", "Tottenham Hotspur"),
        ("Rodrigo De Paul", ["CM"], 2022, 83, "Messi's bodyguard", "Atlético Madrid"),
    ],
    "France": [
        ("Aurélien Tchouaméni", ["CDM"], 2022, 85, "Composed anchor", "Real Madrid"),
        ("William Saliba", ["CB"], 2022, 86, "Elegant defender", "Arsenal"),
        ("Theo Hernández", ["LB"], 2022, 85, "Rampaging full-back", "AC Milan"),
        ("Mike Maignan", ["GK"], 2022, 86, "Modern keeper", "AC Milan"),
        ("Ousmane Dembélé", ["RW", "LW"], 2026, 86, "Two-footed terror", "Paris Saint-Germain"),
        ("Eduardo Camavinga", ["CM"], 2026, 84, "Silky all-rounder", "Real Madrid"),
        ("Marcus Thuram", ["ST"], 2026, 84, "Powerful forward", "Inter"),
    ],
    "England": [
        ("Jude Bellingham", ["CM", "CAM"], 2022, 88, "Generational midfielder", "Real Madrid"),
        ("Bukayo Saka", ["RW"], 2022, 86, "Fearless winger", "Arsenal"),
        ("Phil Foden", ["CAM"], 2022, 86, "Stockport Iniesta", "Manchester City"),
        ("Declan Rice", ["CDM"], 2022, 85, "Tireless shield", "Arsenal"),
        ("Cole Palmer", ["CAM"], 2026, 85, "Ice-cold finisher", "Chelsea"),
        ("John Stones", ["CB"], 2022, 84, "Ball-playing defender", "Manchester City"),
        ("Jordan Pickford", ["GK"], 2022, 82, "Shootout specialist", "Everton"),
    ],
    "Spain": [
        ("Rodri", ["CDM"], 2022, 90, "Ballon d'Or anchor", "Manchester City"),
        ("Pedri", ["CM"], 2022, 86, "Effortless tempo-setter", "Barcelona"),
        ("Lamine Yamal", ["RW"], 2026, 86, "Teenage sensation", "Barcelona"),
        ("Nico Williams", ["LW"], 2026, 85, "Blistering pace", "Athletic Club"),
        ("Dani Olmo", ["CAM"], 2026, 84, "Creative spark", "Barcelona"),
        ("Gavi", ["CM"], 2022, 83, "Fearless teenager", "Barcelona"),
        ("Unai Simón", ["GK"], 2022, 84, "Footwork keeper", "Athletic Club"),
    ],
    "Portugal": [
        ("Bernardo Silva", ["CAM", "RW"], 2022, 87, "Tireless magician", "Manchester City"),
        ("Rúben Dias", ["CB"], 2022, 87, "Defensive rock", "Manchester City"),
        ("Rafael Leão", ["LW"], 2022, 85, "Explosive winger", "AC Milan"),
        ("Vitinha", ["CM"], 2026, 85, "Press-resistant metronome", "Paris Saint-Germain"),
        ("Diogo Costa", ["GK"], 2022, 84, "Penalty hero", "FC Porto"),
        ("Nuno Mendes", ["LB"], 2026, 84, "Flying full-back", "Paris Saint-Germain"),
        ("Gonçalo Ramos", ["ST"], 2022, 82, "Hat-trick off the bench", "Paris Saint-Germain"),
    ],
    "Netherlands": [
        ("Virgil van Dijk", ["CB"], 2022, 89, "Imperious captain", "Liverpool"),
        ("Frenkie de Jong", ["CM"], 2022, 86, "Glides through midfield", "Barcelona"),
        ("Cody Gakpo", ["LW"], 2022, 84, "Direct forward", "Liverpool"),
        ("Xavi Simons", ["CAM"], 2026, 84, "Creative livewire", "RB Leipzig"),
        ("Denzel Dumfries", ["RB"], 2022, 82, "Marauding wing-back", "Inter"),
        ("Nathan Aké", ["CB"], 2026, 82, "Versatile defender", "Manchester City"),
        ("Bart Verbruggen", ["GK"], 2026, 80, "Modern keeper", "Brighton"),
    ],
    "Germany": [
        ("Jamal Musiala", ["CAM"], 2022, 88, "Mesmerising dribbler", "Bayern Munich"),
        ("Florian Wirtz", ["CAM"], 2026, 88, "Generational playmaker", "Bayer Leverkusen"),
        ("Joshua Kimmich", ["CM", "RB"], 2022, 87, "Tactical leader", "Bayern Munich"),
        ("Antonio Rüdiger", ["CB"], 2022, 86, "Relentless defender", "Real Madrid"),
        ("Marc-André ter Stegen", ["GK"], 2026, 86, "Sweeper-keeper", "Barcelona"),
        ("Kai Havertz", ["ST", "CAM"], 2022, 84, "Versatile forward", "Arsenal"),
        ("Leroy Sané", ["RW"], 2022, 84, "Searing pace", "Bayern Munich"),
    ],
    "Italy": [
        ("Gianluigi Donnarumma", ["GK"], 2022, 89, "Euro 2020 hero", "Paris Saint-Germain"),
        ("Nicolò Barella", ["CM"], 2022, 86, "All-action midfielder", "Inter"),
        ("Alessandro Bastoni", ["CB"], 2022, 85, "Ball-playing defender", "Inter"),
        ("Marco Verratti", ["CM"], 2018, 87, "Midfield metronome", "Paris Saint-Germain"),
        ("Giorgio Chiellini", ["CB"], 2014, 88, "Defensive masterclass", "Juventus"),
        ("Federico Chiesa", ["RW"], 2021, 84, "Direct match-winner", "Juventus"),
        ("Federico Dimarco", ["LB"], 2026, 83, "Wand of a left foot", "Inter"),
    ],
    "Uruguay": [
        ("Federico Valverde", ["CM"], 2022, 88, "Engine of midfield", "Real Madrid"),
        ("Ronald Araújo", ["CB"], 2022, 85, "Uncompromising defender", "Barcelona"),
        ("Darwin Núñez", ["ST"], 2022, 83, "Chaotic finisher", "Liverpool"),
        ("Rodrigo Bentancur", ["CM"], 2022, 82, "Composed deep-lying mid", "Tottenham Hotspur"),
        ("Sergio Rochet", ["GK"], 2022, 80, "Reliable last line", "Internacional"),
    ],
    "Croatia": [
        ("Mateo Kovačić", ["CM"], 2022, 84, "Press-resistant carrier", "Manchester City"),
        ("Marcelo Brozović", ["CDM"], 2022, 83, "Deep-lying regista", "Al-Nassr"),
        ("Andrej Kramarić", ["CAM", "ST"], 2022, 82, "Clever finisher", "Hoffenheim"),
        ("Borna Sosa", ["LB"], 2022, 79, "Cross-supply machine", "Ajax"),
    ],
    "Hungary": [
        ("Dominik Szoboszlai", ["CAM"], 2026, 85, "Hungary's talisman", "Liverpool"),
        ("Milos Kerkez", ["LB"], 2026, 81, "Energetic full-back", "Liverpool"),
        ("Willi Orbán", ["CB"], 2026, 80, "Aerial leader", "RB Leipzig"),
        ("Péter Gulácsi", ["GK"], 2026, 80, "Steady keeper", "RB Leipzig"),
        ("Roland Sallai", ["RW"], 2026, 78, "Direct winger", "Galatasaray"),
        ("Barnabás Varga", ["ST"], 2026, 76, "Aerial target man", "Ferencváros"),
    ],
    # ---- New nations ----
    "Mexico": [
        ("Hugo Sánchez", ["ST"], 1986, 91, "Acrobatic goal king", ""),
        ("Rafael Márquez", ["CB", "CDM"], 2006, 87, "Captain across five World Cups", ""),
        ("Cuauhtémoc Blanco", ["CAM"], 1998, 84, "Inventor of the Cuauhtemiña", ""),
        ("Jorge Campos", ["GK"], 1994, 82, "Flamboyant keeper-striker", ""),
        ("Guillermo Ochoa", ["GK"], 2014, 84, "The wall of Brazil 2014", ""),
        ("Javier Hernández", ["ST"], 2014, 83, "Chicharito, instinctive finisher", ""),
        ("Hirving Lozano", ["LW"], 2018, 82, "Chucky stunned Germany", "PSV"),
        ("Edson Álvarez", ["CDM"], 2022, 82, "Tireless shield", "West Ham United"),
        ("Santiago Giménez", ["ST"], 2026, 81, "Prolific in Europe", "AC Milan"),
    ],
    "Belgium": [
        ("Kevin De Bruyne", ["CAM"], 2018, 92, "World-class playmaker", "Manchester City"),
        ("Eden Hazard", ["LW"], 2018, 90, "Mesmeric dribbler", "Real Madrid"),
        ("Thibaut Courtois", ["GK"], 2018, 89, "Giant shot-stopper", "Real Madrid"),
        ("Romelu Lukaku", ["ST"], 2018, 86, "Belgium's record scorer", "Roma"),
        ("Jan Vertonghen", ["CB"], 2018, 85, "Composed veteran", "Anderlecht"),
        ("Jean-Marie Pfaff", ["GK"], 1986, 86, "One of the greats in goal", ""),
        ("Enzo Scifo", ["CAM"], 1986, 85, "Elegant playmaker", ""),
        ("Jérémy Doku", ["RW"], 2026, 83, "Electric one-v-one winger", "Manchester City"),
    ],
    "Sweden": [
        ("Zlatan Ibrahimović", ["ST"], 2006, 90, "Audacious genius", ""),
        ("Henrik Larsson", ["ST"], 2002, 87, "Lethal and tireless", ""),
        ("Gunnar Nordahl", ["ST"], 1950, 88, "Milan goal machine", ""),
        ("Freddie Ljungberg", ["RW"], 2002, 84, "Surging runs", ""),
        ("Victor Lindelöf", ["CB"], 2018, 81, "Calm in possession", "Manchester United"),
        ("Emil Forsberg", ["CAM"], 2018, 81, "Creative hub", "New York Red Bulls"),
        ("Alexander Isak", ["ST"], 2026, 85, "Lethal, elegant finisher", "Newcastle United"),
        ("Dejan Kulusevski", ["RW", "CAM"], 2026, 83, "Powerful dribbler", "Tottenham Hotspur"),
        ("Andreas Isaksson", ["GK"], 2006, 80, "Long-serving keeper", ""),
    ],
    "Switzerland": [
        ("Granit Xhaka", ["CM", "CDM"], 2022, 84, "Captain and leader", "Bayer Leverkusen"),
        ("Xherdan Shaqiri", ["RW", "CAM"], 2018, 83, "Set-piece specialist", "Chicago Fire"),
        ("Yann Sommer", ["GK"], 2022, 84, "Reflex shot-stopper", "Inter"),
        ("Manuel Akanji", ["CB"], 2022, 84, "Composed defender", "Manchester City"),
        ("Breel Embolo", ["ST"], 2022, 81, "Powerful forward", "Monaco"),
        ("Remo Freuler", ["CM"], 2022, 79, "Industrious midfielder", "Bologna"),
        ("Stéphane Chapuisat", ["ST"], 1994, 83, "European champion forward", ""),
    ],
    "United States": [
        ("Christian Pulisic", ["LW"], 2022, 84, "Captain America", "AC Milan"),
        ("Landon Donovan", ["CAM"], 2010, 84, "USA's all-time icon", ""),
        ("Clint Dempsey", ["ST"], 2014, 83, "Fearless forward", ""),
        ("Tim Howard", ["GK"], 2014, 83, "16 saves vs Belgium", ""),
        ("Weston McKennie", ["CM"], 2022, 80, "Box-crashing midfielder", "Juventus"),
        ("Tyler Adams", ["CDM"], 2022, 79, "Relentless ball-winner", "Bournemouth"),
        ("Gio Reyna", ["CAM"], 2022, 78, "Silky playmaker", "Borussia Dortmund"),
        ("Sergiño Dest", ["RB"], 2022, 80, "Attacking full-back", "PSV"),
        ("Brian McBride", ["ST"], 2002, 80, "Brave target man", ""),
    ],
    "South Korea": [
        ("Son Heung-min", ["LW", "ST"], 2022, 88, "Tottenham talisman", "Tottenham Hotspur"),
        ("Park Ji-sung", ["CM"], 2006, 85, "Three-lunged engine", ""),
        ("Cha Bum-kun", ["ST"], 1986, 86, "Bundesliga legend", ""),
        ("Kim Min-jae", ["CB"], 2022, 84, "The Monster", "Bayern Munich"),
        ("Lee Kang-in", ["CAM"], 2022, 82, "Left-footed creator", "Paris Saint-Germain"),
        ("Hong Myung-bo", ["CB"], 2002, 83, "Sweeper of 2002", ""),
        ("Hwang Hee-chan", ["RW"], 2022, 80, "Direct runner", "Wolverhampton"),
        ("Cho Hyun-woo", ["GK"], 2018, 79, "Heroics vs Germany", ""),
    ],
    "Czechia": [
        ("Pavel Nedvěd", ["CAM"], 2006, 90, "The Czech Fury", ""),
        ("Petr Čech", ["GK"], 2006, 89, "Legendary shot-stopper", ""),
        ("Tomáš Rosický", ["CAM"], 2006, 86, "Little Mozart", ""),
        ("Antonín Panenka", ["CAM"], 1982, 84, "Invented the Panenka", ""),
        ("Patrik Schick", ["ST"], 2022, 83, "Halfway-line wonder goal", "Bayer Leverkusen"),
        ("Tomáš Souček", ["CM"], 2026, 81, "Towering box presence", "West Ham United"),
        ("Milan Baroš", ["ST"], 2006, 82, "Euro 2004 Golden Boot", ""),
        ("Vladimír Coufal", ["RB"], 2026, 79, "Tenacious full-back", "West Ham United"),
    ],
    "Chile": [
        ("Alexis Sánchez", ["RW", "ST"], 2014, 86, "Chile's wonder boy", "Udinese"),
        ("Arturo Vidal", ["CM"], 2014, 86, "King Arturo", "Colo-Colo"),
        ("Iván Zamorano", ["ST"], 1998, 85, "Bam Bam", ""),
        ("Marcelo Salas", ["ST"], 1998, 84, "El Matador", ""),
        ("Elías Figueroa", ["CB"], 1974, 86, "Three-time South American POTY", ""),
        ("Claudio Bravo", ["GK"], 2014, 83, "Shootout specialist", ""),
        ("Gary Medel", ["CDM", "CB"], 2014, 80, "The Pitbull", ""),
    ],
    "Poland": [
        ("Robert Lewandowski", ["ST"], 2018, 90, "Prolific finisher", "Barcelona"),
        ("Zbigniew Boniek", ["RW"], 1982, 87, "Juventus great", ""),
        ("Grzegorz Lato", ["RW"], 1974, 86, "1974 Golden Boot", ""),
        ("Kazimierz Deyna", ["CM"], 1974, 85, "Elegant playmaker", ""),
        ("Wojciech Szczęsny", ["GK"], 2022, 84, "Penalty hero", "Barcelona"),
        ("Piotr Zieliński", ["CM", "CAM"], 2022, 82, "Creative midfielder", "Inter"),
        ("Jan Tomaszewski", ["GK"], 1974, 82, "The clown who beat England", ""),
        ("Jakub Kiwior", ["CB"], 2026, 78, "Left-footed defender", "Arsenal"),
    ],
    "Austria": [
        ("David Alaba", ["CB", "LB"], 2026, 85, "Versatile maestro", "Real Madrid"),
        ("Hans Krankl", ["ST"], 1978, 86, "Hero of Córdoba", ""),
        ("Marcel Sabitzer", ["CM"], 2026, 82, "Driving midfielder", "Borussia Dortmund"),
        ("Konrad Laimer", ["CM"], 2026, 80, "Pressing machine", "Bayern Munich"),
        ("Christoph Baumgartner", ["CAM"], 2026, 80, "Late-arriving runner", "RB Leipzig"),
        ("Xaver Schlager", ["CDM"], 2026, 80, "Combative anchor", "RB Leipzig"),
        ("Toni Polster", ["ST"], 1990, 82, "Prolific marksman", ""),
        ("Patrick Pentz", ["GK"], 2026, 76, "Shot-stopper", "Brøndby"),
    ],
    "Paraguay": [
        ("José Luis Chilavert", ["GK"], 1998, 87, "Goalscoring goalkeeper", ""),
        ("Julio César Romero", ["CAM"], 1986, 84, "Romerito, South American POTY", ""),
        ("Carlos Gamarra", ["CB"], 2002, 84, "Impeccable defender", ""),
        ("Roque Santa Cruz", ["ST"], 2006, 83, "Elegant target man", ""),
        ("Salvador Cabañas", ["ST"], 2006, 82, "Lethal poacher", ""),
        ("Miguel Almirón", ["RW", "CAM"], 2026, 81, "Tireless runner", "Atlanta United"),
        ("Gustavo Gómez", ["CB"], 2026, 80, "Commanding captain", "Palmeiras"),
        ("Antonio Sanabria", ["ST"], 2026, 78, "Mobile forward", "Torino"),
    ],
    "Scotland": [
        ("Kenny Dalglish", ["ST"], 1978, 88, "King Kenny", ""),
        ("Denis Law", ["ST"], 1974, 87, "The Lawman", ""),
        ("Graeme Souness", ["CM"], 1986, 86, "Steel and class", ""),
        ("Andy Robertson", ["LB"], 2026, 84, "Rampaging captain", "Liverpool"),
        ("Scott McTominay", ["CM"], 2026, 82, "Goal-getting midfielder", "Napoli"),
        ("John McGinn", ["CM"], 2026, 80, "Energetic engine", "Aston Villa"),
        ("Billy Bremner", ["CM"], 1974, 83, "Fearless leader", ""),
        ("Angus Gunn", ["GK"], 2026, 76, "Reliable keeper", "Norwich City"),
    ],
    "Cameroon": [
        ("Samuel Eto'o", ["ST"], 2002, 89, "Indomitable Lion", ""),
        ("Roger Milla", ["ST"], 1990, 86, "Dancing at 38", ""),
        ("Thomas N'Kono", ["GK"], 1982, 82, "Inspiration to a generation", ""),
        ("Patrick Mboma", ["ST"], 1998, 81, "Powerful finisher", ""),
        ("Rigobert Song", ["CB"], 2002, 80, "Warrior defender", ""),
        ("Marc-Vivien Foé", ["CDM"], 2002, 80, "Forever remembered", ""),
        ("André Onana", ["GK"], 2022, 83, "Modern sweeper-keeper", "Manchester United"),
        ("Vincent Aboubakar", ["ST"], 2022, 80, "Clutch goalscorer", "Beşiktaş"),
    ],
    "Japan": [
        ("Hidetoshi Nakata", ["CAM"], 2002, 85, "Pioneer in Europe", ""),
        ("Shunsuke Nakamura", ["CAM"], 2006, 82, "Free-kick maestro", ""),
        ("Keisuke Honda", ["CAM"], 2010, 83, "Big-stage performer", ""),
        ("Kaoru Mitoma", ["LW"], 2022, 83, "Mesmeric dribbler", "Brighton"),
        ("Takefusa Kubo", ["RW"], 2022, 83, "Japanese Messi", "Real Sociedad"),
        ("Wataru Endo", ["CDM"], 2022, 81, "Tireless anchor", "Liverpool"),
        ("Takehiro Tomiyasu", ["CB", "RB"], 2022, 80, "Versatile defender", "Arsenal"),
        ("Eiji Kawashima", ["GK"], 2014, 77, "Veteran keeper", ""),
    ],
    "Colombia": [
        ("Carlos Valderrama", ["CAM"], 1990, 89, "El Pibe", ""),
        ("James Rodríguez", ["CAM"], 2014, 87, "2014 Golden Boot", ""),
        ("Radamel Falcao", ["ST"], 2018, 85, "El Tigre", ""),
        ("Luis Díaz", ["LW"], 2026, 86, "Electric winger", "Liverpool"),
        ("René Higuita", ["GK"], 1990, 82, "Scorpion-kick showman", ""),
        ("Davinson Sánchez", ["CB"], 2018, 81, "Athletic defender", "Galatasaray"),
        ("Juan Cuadrado", ["RW"], 2018, 81, "Driving wing-back", "Atalanta"),
    ],
    "Morocco": [
        ("Achraf Hakimi", ["RB"], 2022, 85, "Marauding full-back", "Paris Saint-Germain"),
        ("Yassine Bounou", ["GK"], 2022, 84, "Penalty king of Qatar", "Al-Hilal"),
        ("Hakim Ziyech", ["CAM", "RW"], 2022, 83, "Wand of a left foot", "Al-Duhail"),
        ("Sofyan Amrabat", ["CDM"], 2022, 82, "Engine of the 2022 run", "Fiorentina"),
        ("Youssef En-Nesyri", ["ST"], 2022, 81, "Header sank Portugal", "Fenerbahçe"),
        ("Noussair Mazraoui", ["RB"], 2022, 80, "Two-way full-back", "Manchester United"),
        ("Brahim Díaz", ["CAM"], 2026, 83, "Dribbling creator", "Real Madrid"),
        ("Mustapha Hadji", ["CAM"], 1998, 83, "African Footballer of the Year", ""),
    ],
    "Iran": [
        ("Ali Daei", ["ST"], 1998, 84, "Record international scorer", ""),
        ("Mehdi Taremi", ["ST"], 2022, 83, "Clinical forward", "Inter"),
        ("Sardar Azmoun", ["ST"], 2018, 81, "The Iranian Messi", "Shabab Al-Ahli"),
        ("Mehdi Mahdavikia", ["RW"], 2006, 80, "Bundesliga flyer", ""),
        ("Alireza Jahanbakhsh", ["RW"], 2018, 79, "Direct winger", ""),
        ("Ehsan Hajsafi", ["LB"], 2018, 77, "Veteran captain", ""),
        ("Alireza Beiranvand", ["GK"], 2018, 78, "Long-throw keeper", ""),
        ("Saeid Ezatolahi", ["CDM"], 2026, 76, "Defensive anchor", ""),
    ],
    "Saudi Arabia": [
        ("Majed Abdullah", ["ST"], 1994, 82, "The Arabian Pelé", ""),
        ("Salem Al-Dawsari", ["LW"], 2022, 80, "Winner against Argentina", "Al-Hilal"),
        ("Sami Al-Jaber", ["ST"], 1998, 79, "Four-time World Cup forward", ""),
        ("Mohamed Al-Deayea", ["GK"], 1998, 78, "Long-serving keeper", ""),
        ("Firas Al-Buraikan", ["ST"], 2026, 77, "Mobile striker", "Al-Ahli"),
        ("Saud Abdulhamid", ["RB"], 2026, 76, "Attacking full-back", "Roma"),
        ("Ali Al-Bulaihi", ["CB"], 2022, 76, "Uncompromising defender", "Al-Hilal"),
        ("Mohamed Kanno", ["CDM", "CM"], 2022, 76, "Box-to-box anchor", "Al-Hilal"),
    ],
    "Australia": [
        ("Tim Cahill", ["CAM", "ST"], 2014, 84, "Socceroos icon", ""),
        ("Harry Kewell", ["LW"], 2006, 84, "Australia's finest export", ""),
        ("Mark Schwarzer", ["GK"], 2006, 80, "Premier League stalwart", ""),
        ("Mathew Ryan", ["GK"], 2018, 79, "Brave captain keeper", "Roma"),
        ("Aaron Mooy", ["CM"], 2018, 78, "Tidy passer", ""),
        ("Jackson Irvine", ["CM"], 2022, 76, "Box-to-box runner", "St. Pauli"),
        ("Mathew Leckie", ["RW"], 2022, 77, "Goal sank Denmark", "Melbourne City"),
        ("Mitchell Duke", ["ST"], 2022, 75, "Hard-working forward", ""),
        ("Harry Souttar", ["CB"], 2022, 79, "Towering defender", "Sheffield United"),
    ],
    "Tunisia": [
        ("Wahbi Khazri", ["ST"], 2018, 79, "Talisman forward", ""),
        ("Youssef Msakni", ["RW"], 2018, 79, "Creative captain", ""),
        ("Ellyes Skhiri", ["CM"], 2026, 80, "Two-way midfielder", "Eintracht Frankfurt"),
        ("Aïssa Laïdouni", ["CDM"], 2022, 78, "Combative anchor", "Wolfsburg"),
        ("Hannibal Mejbri", ["CAM"], 2026, 78, "Energetic playmaker", "Burnley"),
        ("Dylan Bronn", ["CB"], 2018, 76, "Aerial defender", ""),
        ("Aymen Mathlouthi", ["GK"], 2014, 75, "Experienced keeper", ""),
    ],
    "Nigeria": [
        ("Jay-Jay Okocha", ["CAM"], 1998, 87, "So good they named him twice", ""),
        ("Nwankwo Kanu", ["ST"], 1998, 84, "Olympic and Invincible great", ""),
        ("Rashidi Yekini", ["ST"], 1994, 84, "Roared into the net", ""),
        ("Victor Osimhen", ["ST"], 2026, 87, "Lethal No.9", "Galatasaray"),
        ("Sunday Oliseh", ["CDM"], 1998, 81, "Thunderous striker of the ball", ""),
        ("Wilfred Ndidi", ["CDM"], 2018, 81, "Ball-winning machine", "Beşiktaş"),
        ("Vincent Enyeama", ["GK"], 2014, 80, "Inspirational keeper", ""),
        ("Ahmed Musa", ["RW"], 2014, 79, "Pacey forward", ""),
        ("William Troost-Ekong", ["CB"], 2026, 79, "Commanding captain", "Al-Kholood"),
    ],
    "Ecuador": [
        ("Moisés Caicedo", ["CDM"], 2022, 84, "Record-fee anchor", "Chelsea"),
        ("Enner Valencia", ["ST"], 2022, 82, "Ecuador's talisman", "Internacional"),
        ("Antonio Valencia", ["RW"], 2014, 82, "Driving force", ""),
        ("Pervis Estupiñán", ["LB"], 2022, 81, "Overlapping full-back", "Brighton"),
        ("Piero Hincapié", ["CB", "LB"], 2026, 82, "Aggressive defender", "Bayer Leverkusen"),
        ("Kendry Páez", ["CAM"], 2026, 78, "Teenage prodigy", "Chelsea"),
        ("Agustín Delgado", ["ST"], 2002, 80, "First Ecuador WC scorer", ""),
        ("Hernán Galíndez", ["GK"], 2022, 76, "Steady keeper", ""),
    ],
    "Algeria": [
        ("Riyad Mahrez", ["RW"], 2014, 86, "Mercurial winger", "Al-Ahli"),
        ("Rabah Madjer", ["ST"], 1986, 85, "Backheel European champion", ""),
        ("Ismaël Bennacer", ["CM"], 2026, 82, "Press-resistant midfielder", "AC Milan"),
        ("Islam Slimani", ["ST"], 2014, 80, "Record goalscorer", ""),
        ("Aïssa Mandi", ["CB"], 2026, 78, "Calm defender", "Lille"),
        ("Youcef Atal", ["RB"], 2026, 78, "Attacking full-back", "Al-Sadd"),
        ("Raïs M'Bolhi", ["GK"], 2014, 79, "Heroics against Germany", ""),
    ],
    "Ghana": [
        ("Abedi Pelé", ["CAM"], 1990, 87, "African great", ""),
        ("Michael Essien", ["CM"], 2006, 86, "The Bison", ""),
        ("Asamoah Gyan", ["ST"], 2010, 84, "Africa's WC top scorer", ""),
        ("Mohammed Kudus", ["CAM", "RW"], 2022, 84, "Dynamic playmaker", "Tottenham Hotspur"),
        ("Thomas Partey", ["CDM"], 2022, 83, "Composed anchor", "Villarreal"),
        ("Sulley Muntari", ["CM"], 2010, 81, "Thunderous striker", ""),
        ("Daniel Amartey", ["CB"], 2022, 77, "Versatile defender", ""),
        ("Richard Kingson", ["GK"], 2010, 77, "Brave keeper", ""),
    ],
    "Norway": [
        ("Erling Haaland", ["ST"], 2026, 91, "Unstoppable goal machine", "Manchester City"),
        ("Martin Ødegaard", ["CAM"], 2026, 87, "Arsenal captain", "Arsenal"),
        ("Ole Gunnar Solskjær", ["ST"], 1998, 83, "Super-sub finisher", ""),
        ("Tore André Flo", ["ST"], 1998, 80, "Lanky target man", ""),
        ("Alexander Sørloth", ["ST"], 2026, 82, "Powerful forward", "Atlético Madrid"),
        ("Antonio Nusa", ["LW"], 2026, 80, "Direct teenage winger", "RB Leipzig"),
        ("Ørjan Nyland", ["GK"], 2026, 76, "Reliable keeper", "Sevilla"),
        ("Kjetil Rekdal", ["CM"], 1998, 78, "Penalty sank Brazil", ""),
        ("Kristoffer Ajer", ["CB"], 2026, 78, "Mobile defender", "Brentford"),
    ],
    "Egypt": [
        ("Mohamed Salah", ["RW"], 2018, 89, "The Egyptian King", "Liverpool"),
        ("Hossam Hassan", ["ST"], 1990, 82, "Egypt's goal legend", ""),
        ("Omar Marmoush", ["ST"], 2026, 83, "Pacey forward", "Manchester City"),
        ("Mohamed Elneny", ["CDM"], 2018, 78, "Tidy midfielder", ""),
        ("Trezeguet", ["RW"], 2018, 79, "Direct winger", "Trabzonspor"),
        ("Ahmed Hegazi", ["CB"], 2018, 78, "Aerial defender", ""),
        ("Essam El-Hadary", ["GK"], 2018, 79, "Oldest World Cup player", ""),
    ],
    "Ivory Coast": [
        ("Didier Drogba", ["ST"], 2010, 89, "Ivorian icon", ""),
        ("Yaya Touré", ["CM"], 2010, 88, "Dominant midfielder", ""),
        ("Kolo Touré", ["CB"], 2010, 83, "Fearless defender", ""),
        ("Franck Kessié", ["CM"], 2026, 82, "Powerful box-to-box", "Al-Ahli"),
        ("Sébastien Haller", ["ST"], 2026, 81, "Comeback striker", "Utrecht"),
        ("Gervinho", ["RW"], 2014, 81, "Searing pace", ""),
        ("Wilfried Zaha", ["LW"], 2026, 80, "Explosive dribbler", "Charlotte FC"),
        ("Boubacar Barry", ["GK"], 2014, 76, "AFCON-winning keeper", ""),
    ],
    "Senegal": [
        ("Sadio Mané", ["LW"], 2018, 88, "Lions of Teranga star", "Al-Nassr"),
        ("Kalidou Koulibaly", ["CB"], 2018, 84, "Commanding defender", "Al-Hilal"),
        ("El Hadji Diouf", ["ST"], 2002, 84, "2002 quarter-final hero", ""),
        ("Édouard Mendy", ["GK"], 2022, 83, "Champions League winner", "Al-Ahli"),
        ("Nicolas Jackson", ["ST"], 2026, 81, "Mobile centre-forward", "Chelsea"),
        ("Idrissa Gueye", ["CDM"], 2018, 81, "Tireless ball-winner", "Everton"),
        ("Khalilou Fadiga", ["CAM"], 2002, 80, "Creative spark", ""),
        ("Ismaïla Sarr", ["RW"], 2022, 80, "Rapid winger", "Crystal Palace"),
    ],
    "South Africa": [
        ("Lucas Radebe", ["CB"], 1998, 82, "Leeds captain, the Chief", ""),
        ("Benni McCarthy", ["ST"], 2002, 82, "Clinical finisher", ""),
        ("Steven Pienaar", ["CM", "CAM"], 2010, 80, "Tireless creator", ""),
        ("Siphiwe Tshabalala", ["LW"], 2010, 79, "Scored the 2010 opener", ""),
        ("Itumeleng Khune", ["GK"], 2010, 78, "Sweeper-keeper", ""),
        ("Aaron Mokoena", ["CDM"], 2010, 76, "Combative anchor", ""),
        ("Percy Tau", ["RW", "CAM"], 2026, 78, "Skilful forward", "Qatar SC"),
        ("Lyle Foster", ["ST"], 2026, 77, "Energetic striker", "Burnley"),
    ],
    "New Zealand": [
        ("Chris Wood", ["ST"], 2026, 80, "Premier League striker", "Nottingham Forest"),
        ("Winston Reid", ["CB"], 2010, 79, "Last-gasp goal vs Slovakia", ""),
        ("Ryan Nelsen", ["CB"], 2010, 78, "All Whites captain", ""),
        ("Tommy Smith", ["CB"], 2010, 75, "Reliable defender", ""),
        ("Marco Rojas", ["RW"], 2026, 74, "Kiwi Messi", ""),
        ("Matthew Garbett", ["CM"], 2026, 73, "Tidy midfielder", ""),
        ("Ben Old", ["RW"], 2026, 73, "Young winger", "St. Mirren"),
        ("Stefan Marinovic", ["GK"], 2026, 73, "Shot-stopper", ""),
    ],
    "Canada": [
        ("Alphonso Davies", ["LB", "LW"], 2022, 85, "The Roadrunner", "Bayern Munich"),
        ("Jonathan David", ["ST"], 2022, 84, "Clinical finisher", "Juventus"),
        ("Stephen Eustáquio", ["CM"], 2022, 79, "Deep-lying creator", "FC Porto"),
        ("Cyle Larin", ["ST"], 2022, 79, "Aerial threat", ""),
        ("Tajon Buchanan", ["RW"], 2022, 78, "Direct winger", "Inter"),
        ("Alistair Johnston", ["RB"], 2026, 78, "Energetic full-back", "Celtic"),
        ("Atiba Hutchinson", ["CM"], 2022, 78, "Veteran captain", ""),
        ("Milan Borjan", ["GK"], 2022, 76, "Vocal keeper", ""),
    ],
    "Turkey": [
        ("Hakan Şükür", ["ST"], 2002, 85, "Fastest World Cup goal", ""),
        ("Arda Güler", ["CAM"], 2026, 84, "Turkish prodigy", "Real Madrid"),
        ("Hakan Çalhanoğlu", ["CM", "CDM"], 2026, 85, "Deep-lying maestro", "Inter"),
        ("Rüştü Reçber", ["GK"], 2002, 84, "Wall of 2002", ""),
        ("Kenan Yıldız", ["CAM", "LW"], 2026, 82, "Silky forward", "Juventus"),
        ("Merih Demiral", ["CB"], 2026, 80, "Aerial defender", "Al-Ahli"),
        ("Ferdi Kadıoğlu", ["LB", "RB"], 2026, 79, "Two-way full-back", "Brighton"),
    ],
    "DR Congo": [
        ("Chancel Mbemba", ["CB"], 2026, 80, "Commanding defender", "Lille"),
        ("Yoane Wissa", ["ST", "LW"], 2026, 81, "Sharp finisher", "Brentford"),
        ("Cédric Bakambu", ["ST"], 2026, 79, "Travelled goalscorer", "Real Betis"),
        ("Silas Katompa", ["RW"], 2026, 79, "Direct winger", "VfB Stuttgart"),
        ("Théo Bongonda", ["LW"], 2026, 77, "Tricky dribbler", "Spartak Moscow"),
        ("Arthur Masuaku", ["LB"], 2026, 77, "Attacking full-back", "Beşiktaş"),
        ("Samuel Moutoussamy", ["CM"], 2026, 75, "Tidy midfielder", "Nantes"),
        ("Lionel Mpasi", ["GK"], 2026, 74, "Penalty hero", "Rodez"),
    ],
    "Iraq": [
        ("Younis Mahmoud", ["ST"], 2007, 82, "Asian Cup-winning captain", ""),
        ("Ali Adnan", ["LB"], 2026, 77, "Attacking full-back", ""),
        ("Aymen Hussein", ["ST"], 2026, 76, "Target forward", ""),
        ("Zidane Iqbal", ["CM"], 2026, 75, "Press-resistant midfielder", "Utrecht"),
        ("Amir Al-Ammari", ["CM"], 2026, 74, "Box-to-box runner", "Halmstad"),
        ("Rebin Sulaka", ["CB"], 2026, 73, "Aerial defender", ""),
        ("Ibrahim Bayesh", ["CAM"], 2026, 74, "Creative spark", ""),
        ("Jalal Hassan", ["GK"], 2026, 74, "Reliable keeper", ""),
    ],
    "Panama": [
        ("Adalberto Carrasquilla", ["CM"], 2026, 78, "Tempo-setting midfielder", "Houston Dynamo"),
        ("Aníbal Godoy", ["CDM"], 2026, 76, "Veteran anchor", "San Jose Earthquakes"),
        ("Michael Murillo", ["RB"], 2026, 77, "Energetic full-back", "Olympique Marseille"),
        ("José Luis Rodríguez", ["LW"], 2026, 76, "Pacey winger", ""),
        ("Ismael Díaz", ["ST"], 2026, 76, "Sharp forward", ""),
        ("Fidel Escobar", ["CB"], 2026, 75, "Aerial defender", ""),
        ("Orlando Mosquera", ["GK"], 2026, 75, "Shot-stopper", ""),
        ("Cecilio Waterman", ["ST"], 2026, 74, "Hard-working striker", ""),
    ],
    "Qatar": [
        ("Akram Afif", ["RW", "CAM"], 2022, 79, "Asian Cup star", "Al-Sadd"),
        ("Almoez Ali", ["ST"], 2022, 78, "Asian Cup record scorer", "Al-Duhail"),
        ("Hassan Al-Haydos", ["CAM"], 2022, 76, "Long-serving captain", "Al-Sadd"),
        ("Abdelkarim Hassan", ["LB"], 2022, 75, "Attacking full-back", "Al-Arabi"),
        ("Boualem Khoukhi", ["CB"], 2022, 74, "Set-piece threat", "Al-Sadd"),
        ("Karim Boudiaf", ["CDM"], 2022, 73, "Defensive anchor", "Al-Gharafa"),
        ("Saad Al-Sheeb", ["GK"], 2022, 74, "Experienced keeper", "Al-Sadd"),
    ],
    "Bosnia and Herzegovina": [
        ("Edin Džeko", ["ST"], 2014, 85, "Bosnian Diamond", "Fenerbahçe"),
        ("Miralem Pjanić", ["CM", "CAM"], 2014, 84, "Set-piece maestro", ""),
        ("Sead Kolašinac", ["LB"], 2014, 79, "Powerful wing-back", "Atalanta"),
        ("Asmir Begović", ["GK"], 2014, 80, "Giant shot-stopper", ""),
        ("Ermedin Demirović", ["ST"], 2026, 79, "Mobile forward", "VfB Stuttgart"),
        ("Amar Dedić", ["RB"], 2026, 77, "Modern full-back", "Benfica"),
        ("Senad Lulić", ["LW"], 2014, 78, "Tireless runner", ""),
    ],
    "Haiti": [
        ("Frantzdy Pierrot", ["ST"], 2026, 77, "Powerful target man", "Gaziantep"),
        ("Duckens Nazon", ["ST"], 2026, 75, "Travelled goalscorer", ""),
        ("Derrick Etienne", ["RW"], 2026, 76, "Direct winger", "Columbus Crew"),
        ("Danley Jean Jacques", ["CM"], 2026, 75, "Combative midfielder", "Lorient"),
        ("Zachary Herivaux", ["CM"], 2026, 73, "Tidy passer", ""),
        ("Ricardo Adé", ["CB"], 2026, 73, "Aerial defender", ""),
        ("Andrew Jean-Baptiste", ["CB"], 2026, 72, "Composed defender", ""),
        ("Johny Placide", ["GK"], 2026, 74, "Experienced keeper", ""),
    ],
    "Curaçao": [
        ("Leandro Bacuna", ["CM"], 2026, 76, "Versatile midfielder", ""),
        ("Juninho Bacuna", ["CM"], 2026, 75, "Box-to-box runner", "Birmingham City"),
        ("Tahith Chong", ["RW", "CAM"], 2026, 76, "Tricky winger", "Sheffield United"),
        ("Jurgen Locadia", ["ST"], 2026, 75, "Physical forward", ""),
        ("Rangelo Janga", ["ST"], 2026, 73, "Mobile striker", ""),
        ("Cuco Martina", ["RB"], 2026, 73, "Experienced full-back", ""),
        ("Darryl Lachman", ["CB"], 2026, 73, "Aerial defender", ""),
        ("Eloy Room", ["GK"], 2026, 74, "Commanding keeper", "Columbus Crew"),
    ],
    "Cape Verde": [
        ("Ryan Mendes", ["RW"], 2026, 77, "Creative captain", ""),
        ("Garry Rodrigues", ["LW"], 2026, 77, "Skilful winger", ""),
        ("Jovane Cabral", ["ST"], 2026, 76, "Direct forward", ""),
        ("Bebé", ["ST", "LW"], 2026, 75, "Powerful runner", "Rayo Vallecano"),
        ("Kenny Rocha Santos", ["CM"], 2026, 74, "Tidy midfielder", ""),
        ("Roberto Lopes", ["CB"], 2026, 76, "Rock at the back", "Shamrock Rovers"),
        ("Stopira", ["LB"], 2026, 74, "Veteran full-back", ""),
        ("Vozinha", ["GK"], 2026, 74, "Shot-stopper", ""),
    ],
    "Jordan": [
        ("Mousa Al-Tamari", ["RW"], 2026, 80, "Jordan's gem", "Montpellier"),
        ("Yazan Al-Naimat", ["ST"], 2026, 76, "Sharp finisher", ""),
        ("Ali Olwan", ["ST"], 2026, 75, "Mobile striker", ""),
        ("Noor Al-Rawabdeh", ["LW"], 2026, 74, "Energetic winger", ""),
        ("Mahmoud Al-Mardi", ["CM"], 2026, 73, "Combative midfielder", ""),
        ("Ehsan Haddad", ["CB"], 2026, 73, "Aerial defender", ""),
        ("Salem Al-Ajalin", ["CB"], 2026, 72, "Composed defender", ""),
        ("Yazeed Abulaila", ["GK"], 2026, 73, "Reliable keeper", ""),
    ],
    "Uzbekistan": [
        ("Eldor Shomurodov", ["ST"], 2026, 80, "Talisman striker", "Roma"),
        ("Abdukodir Khusanov", ["CB"], 2026, 80, "Rising defender", "Manchester City"),
        ("Abbosbek Fayzullaev", ["CAM"], 2026, 78, "Young playmaker", "CSKA Moscow"),
        ("Jaloliddin Masharipov", ["CAM"], 2026, 76, "Creative winger", ""),
        ("Otabek Shukurov", ["CM"], 2026, 75, "Deep-lying midfielder", ""),
        ("Rustam Ashurmatov", ["CB"], 2026, 74, "Composed defender", ""),
        ("Oston Urunov", ["RW"], 2026, 74, "Direct winger", ""),
        ("Utkir Yusupov", ["GK"], 2026, 73, "Shot-stopper", ""),
    ],
}


def main():
    existing = json.load(open(os.path.join(DATA, "players.json"), encoding="utf-8"))
    ids = {p["id"] for p in existing}
    names = {(p["nation"], p["name"]) for p in existing}
    valid_nation_names = {name for _, name, _, _ in NATIONS}

    players = list(existing)
    added = 0
    for nation, roster in P.items():
        assert nation in valid_nation_names, f"Unknown nation: {nation}"
        for name, positions, year, rating, fact, club in roster:
            if (nation, name) in names:
                continue  # don't duplicate an existing entry
            pid = f"{slug(name)}-{year}"
            n = 2
            while pid in ids:
                pid = f"{slug(name)}-{year}-{n}"
                n += 1
            ids.add(pid)
            names.add((nation, name))
            entry = {
                "id": pid,
                "name": name,
                "nation": nation,
                "position": positions,
                "world_cup_year": year,
                "overall_rating": rating,
                "era": era_for(year),
            }
            if club:
                entry["club"] = club
            if fact:
                entry["fun_fact"] = fact
            players.append(entry)
            added += 1

    nations = [
        {"id": nid, "name": name, "flag": flag, "appearances": apps}
        for nid, name, flag, apps in NATIONS
    ]

    json.dump(
        players,
        open(os.path.join(DATA, "players.json"), "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=2,
    )
    json.dump(
        nations,
        open(os.path.join(DATA, "nations.json"), "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=2,
    )

    # --- Validation: every nation needs a GK and a spread of positions ---
    by_nation = {}
    for p in players:
        by_nation.setdefault(p["nation"], []).append(p)

    problems = []
    for nid, name, _flag, _apps in NATIONS:
        roster = by_nation.get(name, [])
        firsts = {pl["position"][0] for pl in roster}
        groups = set()
        for pos in firsts:
            if pos == "GK":
                groups.add("GK")
            elif pos in ("RB", "CB", "LB"):
                groups.add("DEF")
            elif pos in ("CDM", "CM", "CAM"):
                groups.add("MID")
            else:
                groups.add("ATT")
        if len(roster) < 7:
            problems.append(f"{name}: only {len(roster)} players")
        if "GK" not in firsts:
            problems.append(f"{name}: no goalkeeper")
        missing = {"GK", "DEF", "MID", "ATT"} - groups
        if missing:
            problems.append(f"{name}: missing line(s) {sorted(missing)}")

    print(f"Nations: {len(nations)}  Players: {len(players)} (+{added} new)")
    if problems:
        print("VALIDATION PROBLEMS:")
        for pr in problems:
            print("  -", pr)
        raise SystemExit(1)
    print("Validation OK: every nation has a keeper and all four lines covered.")


if __name__ == "__main__":
    main()
