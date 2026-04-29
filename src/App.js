import React, { useEffect, useMemo, useState } from "react";

// Polish Trainer A2 → B1
// Pure React, no external libraries. Paste into src/App.js

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

const LEGACY_STORAGE_KEY = "polish-trainer-course-v1";
const PROFILE_META_KEY = "polish-trainer-profiles-v1";
const PROFILE_STORAGE_PREFIX = "polish-trainer-course-profile-v1";

const styles = {
  app: { minHeight: "100vh", background: "#f4f6f8", padding: 20, fontFamily: "Arial, sans-serif", color: "#202428" },
  shell: { maxWidth: 1280, margin: "0 auto" },
  layout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 },
  card: { background: "white", padding: 18, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
  btn: { padding: "8px 12px", borderRadius: 9, border: "1px solid #aaa", background: "white", cursor: "pointer" },
  primary: { padding: "8px 12px", borderRadius: 9, border: "1px solid #1f4f6f", background: "#1f4f6f", color: "white", cursor: "pointer" },
  topicBtn: { width: "100%", textAlign: "left", padding: 10, borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer", marginBottom: 8 },
  activeTopic: { background: "#1f4f6f", color: "white", border: "1px solid #1f4f6f" },
  exBtn: { width: "calc(100% - 16px)", marginLeft: 16, textAlign: "left", padding: 8, borderRadius: 8, border: "1px solid #ddd", background: "#fafafa", cursor: "pointer", marginBottom: 6, fontSize: 13 },
  item: { background: "#f5f7f9", padding: 12, borderRadius: 8, marginBottom: 10 },
  input: { width: "100%", padding: 9, borderRadius: 8, border: "1px solid #bbb", boxSizing: "border-box" },
  rule: { background: "#eef3f6", borderRadius: 8, padding: 10, marginBottom: 8, lineHeight: 1.45 },
  badge: { display: "inline-block", padding: "3px 8px", borderRadius: 999, background: "#eee", fontSize: 12, marginRight: 6 },
  skillBadge: { display: "inline-block", padding: "4px 8px", borderRadius: 999, background: "#e8f3ee", color: "#1d5d42", fontSize: 12, marginRight: 6, marginBottom: 6 },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: 14, fontSize: 14 },
  th: { border: "1px solid #ccc", padding: 8, background: "#eee", textAlign: "left" },
  td: { border: "1px solid #ccc", padding: 8 },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 },
  stat: { background: "white", padding: 12, borderRadius: 8, minWidth: 170, boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
  progressTrack: { height: 8, borderRadius: 999, background: "#dce3e8", overflow: "hidden", marginTop: 6 },
  progressFill: { height: "100%", background: "#2f7d59", transition: "width .2s ease" },
  moduleTitle: { margin: "18px 0 8px", color: "#56616b", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0 },
  moduleBtn: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", border: 0, background: "transparent", cursor: "pointer", color: "#56616b", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0 },
  moduleCard: { border: "1px solid #d9e2e8", borderRadius: 10, background: "#fbfcfd", padding: "8px 10px", marginBottom: 12 },
  topicPanel: { border: "1px solid #dde6ec", borderRadius: 10, background: "#f8fbfd", padding: 10, marginBottom: 12 },
  exerciseList: { borderLeft: "3px solid #c8d7e2", marginLeft: 12, paddingLeft: 10, marginTop: 8 },
  collapseBtn: { padding: "7px 10px", borderRadius: 8, border: "1px solid #c7d2da", background: "#f8fafb", cursor: "pointer" },
  goal: { borderLeft: "4px solid #2f7d59", background: "#f3faf6", padding: 12, borderRadius: 8, marginBottom: 12 },
  mistake: { border: "1px solid #f0c7c7", background: "#fff7f7", borderRadius: 8, padding: 10, marginBottom: 8 },
  review: { border: "1px solid #d6e6db", background: "#f7fcf9", borderRadius: 8, padding: 10, marginBottom: 8 },
  note: { border: "1px solid #dbe4ef", background: "#f8fbff", borderRadius: 8, padding: 12, marginBottom: 10, lineHeight: 1.55 },
  template: { whiteSpace: "pre-wrap", background: "#fff", border: "1px solid #dfe6eb", borderRadius: 8, padding: 10, marginTop: 8, fontFamily: "inherit" },
  wordChip: { display: "inline-flex", alignItems: "center", gap: 6, margin: "6px 6px 0 0", padding: "6px 9px", borderRadius: 999, border: "1px solid #cbd8e2", background: "white", cursor: "pointer", fontSize: 13 },
  dictionaryItem: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #edf1f4" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(14, 24, 36, .45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 10 },
  modal: { width: "min(900px, 96vw)", maxHeight: "90vh", overflow: "auto", background: "white", borderRadius: 10, padding: 20, boxShadow: "0 24px 80px rgba(0,0,0,.25)" },
  printArea: { width: "100%", minHeight: 220, boxSizing: "border-box", border: "1px solid #cbd8e2", borderRadius: 8, padding: 10, fontFamily: "Consolas, monospace", whiteSpace: "pre" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 12 },
  metric: { background: "#f8fafb", border: "1px solid #e0e6ea", borderRadius: 8, padding: 10 },
  profileBar: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 },
  floatingDictionaryButton: { position: "fixed", right: 20, bottom: 20, zIndex: 18, boxShadow: "0 12px 28px rgba(0,0,0,.16)" },
  floatingDictionaryPanel: { position: "fixed", right: 20, bottom: 76, width: "min(380px, calc(100vw - 24px))", maxHeight: "70vh", overflow: "auto", zIndex: 18, background: "white", border: "1px solid #d8e2e8", borderRadius: 12, padding: 16, boxShadow: "0 24px 60px rgba(0,0,0,.18)" }
};

const input = (q, a, explanation = "") => ({ type: "input", q, a: Array.isArray(a) ? a : [a], explanation });
const choice = (q, options, correct, explanation = "") => ({ type: "choice", q, options, correct, explanation });
const free = (q, hint = "Ответ свободный. Напиши 4–8 предложений, потом можешь прислать мне на проверку.") => ({ type: "free", q, explanation: hint });
const note = (title, body, words = [], links = []) => ({ type: "note", title, body, words, links });
const audio = (title, body, src = "", links = [], transcript = "") => ({ type: "audio", title, body, src, links, transcript });
const cloze = (q, title, lines, blanks, explanation = "") => ({ type: "cloze", q, title, lines, blanks, explanation });

function itemSignature(item) {
  if (!item) return "";
  if (item.type === "input") return `input|${norm(item.q)}|${(item.a || []).map(norm).join("|")}`;
  if (item.type === "choice") return `choice|${norm(item.q)}|${(item.options || []).map(norm).join("|")}|${norm(item.correct)}`;
  if (item.type === "free") return `free|${norm(item.q)}`;
  if (item.type === "note") return `note|${norm(item.title)}|${norm(item.body)}`;
  if (item.type === "audio") return `audio|${norm(item.title)}|${norm(item.transcript || item.body)}`;
  if (item.type === "cloze") {
    const lines = (item.lines || []).map((line) => JSON.stringify(line)).join("|");
    const blanks = (item.blanks || []).map((blank) => (blank.answers || []).map(norm).join("&")).join("|");
    return `cloze|${norm(item.title || item.q)}|${lines}|${blanks}`;
  }
  return JSON.stringify(item);
}

function uniqueExerciseItems(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = itemSignature(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const makeExercise = (title, items) => ({ title, items: uniqueExerciseItems(items) });
const PRIVATE_COURSE_BASE = `${process.env.PUBLIC_URL || ""}/private-course`;

const privateCourseLessons = [
  { lesson: 1, textbook: ["a1.1", "a1.2", "a1.3", "a1.4", "a1.5"], workbook: ["b1.1"], guide: ["c1.1"] },
  { lesson: 2, textbook: ["a2.1", "a2.2", "a2.3", "a2.4"], workbook: ["b2.1", "b2.2"], guide: ["c2.1"] },
  { lesson: 3, textbook: ["a3.1", "a3.2", "a3.3"], workbook: ["b3.1"], guide: ["c3.1"] },
  { lesson: 4, textbook: ["a4.1", "a4.2", "a4.3"], workbook: ["b4.1", "b4.2"], guide: ["c4.1"] },
  { lesson: 5, textbook: ["a5.1", "a5.2", "a5.3"], workbook: ["b5.1", "b5.2", "b5.3"], guide: ["c5.1"] },
  { lesson: 6, textbook: ["a6.1", "a6.2", "a6.3"], workbook: ["b6.1", "b6.2"], guide: ["c6.1"] },
  { lesson: 7, textbook: ["a7.1", "a7.2", "a7.3"], workbook: ["b7.1", "b7.2", "b7.3"], guide: ["c7.1"] },
  { lesson: 8, textbook: ["a8.1", "a8.2", "a8.3"], workbook: ["b8.1", "b8.2", "b8.3"], guide: ["c8.1"] },
  { lesson: 9, textbook: ["a9.1", "a9.2", "a9.3"], workbook: ["b9.1", "b9.2"], guide: ["c9.1"] },
  { lesson: 10, textbook: ["a10.1", "a10.2", "a10.3"], workbook: ["b10.1", "b10.2"], guide: ["c10.1"] }
];

function privatePdf(file) {
  return `${PRIVATE_COURSE_BASE}/pdf/${file}`;
}

function privateAudio(folder, file) {
  return `${PRIVATE_COURSE_BASE}/audio/CD audio/${folder}/${file}.mp3`;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function speakPolish(text, rate = 0.95) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pl-PL";
  utterance.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const polishVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("pl"));
  if (polishVoice) utterance.voice = polishVoice;
  window.speechSynthesis.speak(utterance);
  return true;
}

function cap50(items) {
  const unique = uniqueExerciseItems(items);
  if (unique.length === 0) return [];
  const shuffled = shuffle(unique);
  return shuffled.slice(0, 50);
}

function repeatTo50(items) {
  return cap50(items);
}

const dict = {
  numbers: [
    ["0", "zero"], ["1", "jeden"], ["2", "dwa"], ["3", "trzy"], ["4", "cztery"], ["5", "pięć"],
    ["6", "sześć"], ["7", "siedem"], ["8", "osiem"], ["9", "dziewięć"], ["10", "dziesięć"],
    ["11", "jedenaście"], ["12", "dwanaście"], ["13", "trzynaście"], ["14", "czternaście"], ["15", "piętnaście"],
    ["16", "szesnaście"], ["17", "siedemnaście"], ["18", "osiemnaście"], ["19", "dziewiętnaście"], ["20", "dwadzieścia"],
    ["21", "dwadzieścia jeden"], ["22", "dwadzieścia dwa"], ["30", "trzydzieści"], ["40", "czterdzieści"], ["50", "pięćdziesiąt"],
    ["60", "sześćdziesiąt"], ["70", "siedemdziesiąt"], ["80", "osiemdziesiąt"], ["90", "dziewięćdziesiąt"], ["100", "sto"]
  ],
  clock: [
    ["7:00", "siódma"], ["8:00", "ósma"], ["9:00", "dziewiąta"], ["10:00", "dziesiąta"], ["11:00", "jedenasta"], ["12:00", "dwunasta"],
    ["7:15", "siódma piętnaście"], ["8:15", "ósma piętnaście"], ["9:15", "dziewiąta piętnaście"],
    ["7:30", "siódma trzydzieści"], ["8:30", "ósma trzydzieści"], ["9:30", "dziewiąta trzydzieści"],
    ["7:45", "siódma czterdzieści pięć"], ["8:45", "ósma czterdzieści pięć"], ["9:45", "dziewiąta czterdzieści pięć"],
    ["13:00", "trzynasta"], ["14:00", "czternasta"], ["15:00", "piętnasta"], ["16:00", "szesnasta"], ["17:00", "siedemnasta"], ["18:00", "osiemnasta"]
  ],
  timePhrases: [
    ["dzisiaj", "сегодня"], ["jutro", "завтра"], ["pojutrze", "послезавтра"], ["wczoraj", "вчера"],
    ["rano", "утром"], ["po południu", "после обеда"], ["wieczorem", "вечером"], ["w nocy", "ночью"],
    ["za godzinę", "через час"], ["za tydzień", "через неделю"], ["w przyszłym tygodniu", "на следующей неделе"],
    ["w poniedziałek", "в понедельник"], ["o ósmej", "в восемь"], ["przed pracą", "перед работой"],
    ["po pracy", "после работы"], ["od rana do wieczora", "с утра до вечера"]
  ],
  money: [
    ["1 zł", "jeden złoty"], ["2 zł", "dwa złote"], ["3 zł", "trzy złote"], ["4 zł", "cztery złote"], ["5 zł", "pięć złotych"],
    ["12 zł", "dwanaście złotych"], ["22 zł", "dwadzieścia dwa złote"], ["24 zł", "dwadzieścia cztery złote"], ["25 zł", "dwadzieścia pięć złotych"],
    ["1 gr", "jeden grosz"], ["2 gr", "dwa grosze"], ["3 gr", "trzy grosze"], ["4 gr", "cztery grosze"], ["5 gr", "pięć groszy"],
    ["1 pieniądz", "jeden pieniądz"], ["2 pieniądze", "dwa pieniądze"], ["3 pieniądze", "trzy pieniądze"], ["4 pieniądze", "cztery pieniądze"], ["5 pieniędzy", "pięć pieniędzy"]
  ],
  mascPlural: [
    ["student", "studenci", "-t → -ci"], ["kolega", "koledzy", "g → dz"], ["Polak", "Polacy", "k → c"], ["Anglik", "Anglicy", "k → c"], ["Czech", "Czesi", "nieregularne"],
    ["sąsiad", "sąsiedzi", "d → dzi"], ["klient", "klienci", "t → ci"], ["aktor", "aktorzy", "r → rz"], ["lekarz", "lekarze", "-rz"], ["nauczyciel", "nauczyciele", "-el"],
    ["pracownik", "pracownicy", "k → c"], ["kierowca", "kierowcy", "-ca → -cy"], ["mężczyzna", "mężczyźni", "źni"], ["szef", "szefowie", "-owie"], ["profesor", "profesorowie", "-owie"],
    ["brat", "bracia", "nieregularne"], ["człowiek", "ludzie", "nieregularne"], ["ojciec", "ojcowie", "nieregularne"], ["gość", "goście", "miękka spółgłoska"], ["turysta", "turyści", "-sta → -ści"],
    ["artysta", "artyści", "-sta → -ści"], ["specjalista", "specjaliści", "-sta → -ści"], ["dentysta", "dentyści", "-sta → -ści"], ["informatyk", "informatycy", "k → c"], ["programista", "programiści", "-sta → -ści"],
    ["mechanik", "mechanicy", "k → c"], ["urzędnik", "urzędnicy", "k → c"], ["policjant", "policjanci", "t → ci"], ["kelner", "kelnerzy", "r → rz"], ["menedżer", "menedżerowie", "-owie"],
    ["sprzedawca", "sprzedawcy", "-ca → -cy"], ["sportowiec", "sportowcy", "-owiec → -owcy"], ["wykładowca", "wykładowcy", "-ca → -cy"], ["strażak", "strażacy", "k → c"], ["rolnik", "rolnicy", "k → c"],
    ["kucharz", "kucharze", "-rz → -rze"], ["dyrektor", "dyrektorzy", "r → rz"], ["inżynier", "inżynierowie", "-owie"], ["pasażer", "pasażerowie", "-owie"], ["listonosz", "listonosze", "-sz → -sze"],
    ["recepcjonista", "recepcjoniści", "-sta → -ści"], ["ratownik", "ratownicy", "k → c"], ["naukowiec", "naukowcy", "-owiec → -owcy"], ["opiekun", "opiekunowie", "-owie"], ["sędzia", "sędziowie", "nieregularne"]
  ],
  nonMascPlural: [
    ["kobieta", "kobiety"], ["książka", "książki"], ["kawa", "kawy"], ["praca", "prace"], ["szkoła", "szkoły"], ["ulica", "ulice"], ["restauracja", "restauracje"], ["lekcja", "lekcje"],
    ["rodzina", "rodziny"], ["sprawa", "sprawy"], ["dziecko", "dzieci"], ["okno", "okna"], ["miasto", "miasta"], ["auto", "auta"], ["mieszkanie", "mieszkania"], ["zadanie", "zadania"],
    ["pytanie", "pytania"], ["imię", "imiona"], ["pies", "psy"], ["kot", "koty"], ["dom", "domy"], ["telefon", "telefony"], ["samochód", "samochody"], ["problem", "problemy"],
    ["film", "filmy"], ["sklep", "sklepy"], ["kurs", "kursy"], ["język", "języki"], ["bilet", "bilety"], ["pokój", "pokoje"],
    ["gazeta", "gazety"], ["mapa", "mapy"], ["torba", "torby"], ["lodówka", "lodówki"], ["apteka", "apteki"], ["sala", "sale"], ["plaża", "plaże"], ["podróż", "podróże"],
    ["krzesło", "krzesła"], ["światło", "światła"], ["morze", "morza"], ["zdjęcie", "zdjęcia"], ["ćwiczenie", "ćwiczenia"], ["biuro", "biura"], ["muzeum", "muzea"], ["zwierzę", "zwierzęta"],
    ["drzewo", "drzewa"], ["butelka", "butelki"]
  ],
  adjectives: [
    ["dobry", "dobrzy", "dobre", "dobrego", "dobrą"], ["nowy", "nowi", "nowe", "nowego", "nową"], ["polski", "polscy", "polskie", "polskiego", "polską"],
    ["wysoki", "wysocy", "wysokie", "wysokiego", "wysoką"], ["młody", "młodzi", "młode", "młodego", "młodą"], ["duży", "duzi", "duże", "dużego", "dużą"],
    ["mały", "mali", "małe", "małego", "małą"], ["miły", "mili", "miłe", "miłego", "miłą"], ["stary", "starzy", "stare", "starego", "starą"], ["znany", "znani", "znane", "znanego", "znaną"]
  ],
  biernik: {
    animate: [["lekarz", "lekarza"], ["student", "studenta"], ["kolega", "kolegę"], ["nauczyciel", "nauczyciela"], ["pies", "psa"], ["kot", "kota"], ["mężczyzna", "mężczyznę"], ["klient", "klienta"], ["pracownik", "pracownika"], ["programista", "programistę"]],
    inanimate: [["telefon", "telefon"], ["samochód", "samochód"], ["chleb", "chleb"], ["dom", "dom"], ["film", "film"], ["kurs", "kurs"], ["język", "język"], ["bilet", "bilet"], ["komputer", "komputer"], ["obiad", "obiad"]],
    feminine: [["kawa", "kawę"], ["praca", "pracę"], ["książka", "książkę"], ["szkoła", "szkołę"], ["restauracja", "restaurację"], ["lekcja", "lekcję"], ["rodzina", "rodzinę"], ["woda", "wodę"], ["sprawa", "sprawę"], ["ulica", "ulicę"]],
    mascPlural: [["studenci", "studentów"], ["lekarze", "lekarzy"], ["koledzy", "kolegów"], ["nauczyciele", "nauczycieli"], ["klienci", "klientów"], ["pracownicy", "pracowników"], ["aktorzy", "aktorów"], ["profesorowie", "profesorów"], ["programiści", "programistów"], ["mężczyźni", "mężczyzn"]]
  },
  genitive: [["czas", "czasu"], ["kawa", "kawy"], ["praca", "pracy"], ["telefon", "telefonu"], ["student", "studenta"], ["kobieta", "kobiety"], ["dziecko", "dziecka"], ["chleb", "chleba"], ["samochód", "samochodu"], ["pomoc", "pomocy"], ["człowiek", "człowieka"], ["pieniądze", "pieniędzy"], ["woda", "wody"], ["lekarz", "lekarza"], ["kolega", "kolegi"], ["książka", "książki"], ["język", "języka"], ["dom", "domu"], ["sklep", "sklepu"], ["Polska", "Polski"]],
  dative: [["ja", "mi"], ["ty", "ci"], ["on", "mu"], ["ona", "jej"], ["my", "nam"], ["wy", "wam"], ["oni", "im"], ["student", "studentowi"], ["kolega", "koledze"], ["kobieta", "kobiecie"], ["dziecko", "dziecku"], ["brat", "bratu"], ["siostra", "siostrze"], ["mama", "mamie"], ["człowiek", "człowiekowi"], ["lekarz", "lekarzowi"], ["nauczyciel", "nauczycielowi"], ["ludzie", "ludziom"]],
  instrumental: [["programista", "programistą"], ["student", "studentem"], ["lekarz", "lekarzem"], ["nauczyciel", "nauczycielem"], ["kolega", "kolegą"], ["rodzina", "rodziną"], ["dziecko", "dzieckiem"], ["kobieta", "kobietą"], ["mężczyzna", "mężczyzną"], ["samochód", "samochodem"], ["autobus", "autobusem"], ["długopis", "długopisem"], ["komputer", "komputerem"], ["ludzie", "ludźmi"], ["przyjaciel", "przyjacielem"]],
  locative: [["Polska", "Polsce"], ["praca", "pracy"], ["sklep", "sklepie"], ["dom", "domu"], ["kurs", "kursie"], ["spacer", "spacerze"], ["rodzina", "rodzinie"], ["problem", "problemie"], ["student", "studencie"], ["kobieta", "kobiecie"], ["język polski", "języku polskim"], ["park", "parku"], ["stół", "stole"], ["dziecko", "dziecku"], ["spotkanie", "spotkaniu"], ["miasto", "mieście"], ["szkoła", "szkole"], ["telefon", "telefonie"]],
  present: [["pracować", ["pracuję", "pracujesz", "pracuje", "pracujemy", "pracujecie", "pracują"]], ["robić", ["robię", "robisz", "robi", "robimy", "robicie", "robią"]], ["mówić", ["mówię", "mówisz", "mówi", "mówimy", "mówicie", "mówią"]], ["pić", ["piję", "pijesz", "pije", "pijemy", "pijecie", "piją"]], ["mieć", ["mam", "masz", "ma", "mamy", "macie", "mają"]], ["czytać", ["czytam", "czytasz", "czyta", "czytamy", "czytacie", "czytają"]], ["mieszkać", ["mieszkam", "mieszkasz", "mieszka", "mieszkamy", "mieszkacie", "mieszkają"]], ["oglądać", ["oglądam", "oglądasz", "ogląda", "oglądamy", "oglądacie", "oglądają"]], ["uczyć się", ["uczę się", "uczysz się", "uczy się", "uczymy się", "uczycie się", "uczą się"]]],
  perfectivePairs: [["robić", "zrobić"], ["pisać", "napisać"], ["czytać", "przeczytać"], ["kupować", "kupić"], ["uczyć się", "nauczyć się"], ["gotować", "ugotować"], ["oglądać", "obejrzeć"], ["wracać", "wrócić"], ["spotykać", "spotkać"], ["otwierać", "otworzyć"], ["jeść", "zjeść"], ["pić", "wypić"], ["brać", "wziąć"], ["mówić", "powiedzieć"]],
  thematicVocab: {
    work: [["umowa", "договор"], ["wynagrodzenie", "зарплата"], ["stanowisko", "должность"], ["obowiązki", "обязанности"], ["spotkanie", "встреча"], ["termin", "срок"], ["nadgodziny", "сверхурочные"], ["urlop", "отпуск"], ["zwolnienie lekarskie", "больничный"], ["zespół", "команда"], ["kierownik", "руководитель"], ["pracodawca", "работодатель"], ["pracownik", "сотрудник"], ["doświadczenie", "опыт"], ["rozmowa kwalifikacyjna", "собеседование"], ["podanie", "заявление"], ["faktura", "счёт-фактура"], ["zadanie", "задача"]],
    housing: [["mieszkanie", "квартира"], ["pokój", "комната"], ["czynsz", "арендная плата"], ["kaucja", "залог"], ["rachunek", "счёт"], ["ogrzewanie", "отопление"], ["prąd", "электричество"], ["woda", "вода"], ["właściciel", "владелец"], ["sąsiad", "сосед"], ["klatka schodowa", "подъезд"], ["winda", "лифт"], ["piwnica", "подвал"], ["balkon", "балкон"], ["awaria", "поломка"], ["naprawa", "ремонт"], ["wynajmować", "арендовать"], ["przeprowadzać się", "переезжать"]],
    health: [["przychodnia", "поликлиника"], ["lekarz rodzinny", "семейный врач"], ["recepta", "рецепт"], ["badanie", "обследование"], ["ból", "боль"], ["gorączka", "температура"], ["kaszel", "кашель"], ["katar", "насморк"], ["ubezpieczenie", "страховка"], ["apteka", "аптека"], ["tabletki", "таблетки"], ["wizyta", "визит"], ["termin wizyty", "дата приёма"], ["skierowanie", "направление"], ["wyniki badań", "результаты анализов"], ["zwolnienie", "справка/больничный"]],
    documents: [["urząd", "учреждение"], ["wniosek", "заявление"], ["formularz", "формуляр"], ["podpis", "подпись"], ["dowód osobisty", "удостоверение личности"], ["paszport", "паспорт"], ["meldunek", "регистрация адреса"], ["zezwolenie", "разрешение"], ["decyzja", "решение"], ["opłata", "оплата/сбор"], ["termin", "срок"], ["załącznik", "приложение"], ["potwierdzenie", "подтверждение"], ["numer sprawy", "номер дела"], ["odbiór dokumentu", "получение документа"], ["kolejka", "очередь"]],
    shopping: [["paragon", "чек"], ["reklamacja", "претензия/жалоба"], ["zwrot", "возврат"], ["wymiana", "обмен"], ["gwarancja", "гарантия"], ["rozmiar", "размер"], ["dostawa", "доставка"], ["odbiór osobisty", "самовывоз"], ["płatność kartą", "оплата картой"], ["gotówka", "наличные"], ["promocja", "акция"], ["koszyk", "корзина"], ["kasa", "касса"], ["sklep internetowy", "интернет-магазин"], ["usługa", "услуга"], ["zamówienie", "заказ"]],
    city: [["przystanek", "остановка"], ["rozkład jazdy", "расписание"], ["bilet miesięczny", "месячный билет"], ["przesiadka", "пересадка"], ["dworzec", "вокзал"], ["skrzyżowanie", "перекрёсток"], ["chodnik", "тротуар"], ["przejście dla pieszych", "пешеходный переход"], ["korek", "пробка"], ["spóźnienie", "опоздание"], ["dzielnica", "район"], ["centrum", "центр"], ["dojazd", "проезд"], ["linia autobusowa", "автобусный маршрут"], ["tramwaj", "трамвай"], ["biletomat", "билетный автомат"]],
    education: [["wykształcenie", "образование"], ["zajęcia", "занятия"], ["egzamin", "экзамен"], ["ocena", "оценка"], ["poziom", "уровень"], ["wymagania", "требования"], ["termin egzaminu", "дата экзамена"], ["wynik", "результат"], ["zaświadczenie", "справка/сертификат"], ["certyfikat", "сертификат"], ["nauczyciel", "учитель"], ["uczeń", "ученик"], ["zadanie domowe", "домашнее задание"], ["powtórka", "повторение"], ["wymowa", "произношение"], ["słownictwo", "лексика"], ["gramatyka", "грамматика"], ["postęp", "прогресс"], ["błąd", "ошибка"], ["odpowiedź", "ответ"]],
    relationships: [["znajomy", "знакомый"], ["przyjaciel", "друг"], ["sąsiad", "сосед"], ["związek", "отношения"], ["rozmowa", "разговор"], ["kłótnia", "ссора"], ["wsparcie", "поддержка"], ["zaufanie", "доверие"], ["samotność", "одиночество"], ["radość", "радость"], ["smutek", "грусть"], ["stres", "стресс"], ["wstyd", "стыд"], ["nadzieja", "надежда"], ["obawa", "опасение"], ["decyzja", "решение"], ["rada", "совет"], ["prośba", "просьба"], ["przeprosiny", "извинения"], ["wdzięczność", "благодарность"]],
    travel: [["podróż", "путешествие"], ["wyjazd", "выезд/поездка"], ["pobyt", "пребывание"], ["nocleg", "ночлег"], ["rezerwacja", "бронь"], ["pokój jednoosobowy", "одноместный номер"], ["recepcja", "ресепшен"], ["bagaż", "багаж"], ["walizka", "чемодан"], ["lot", "рейс"], ["opóźnienie", "задержка"], ["odwołanie", "отмена"], ["granica", "граница"], ["ubezpieczenie turystyczne", "туристическая страховка"], ["zwiedzanie", "осмотр достопримечательностей"], ["przewodnik", "гид"], ["atrakcja", "достопримечательность"], ["mapa", "карта"], ["pamiątka", "сувенир"], ["rachunek", "счёт"]],
    food: [["posiłek", "приём пищи"], ["śniadanie", "завтрак"], ["obiad", "обед"], ["kolacja", "ужин"], ["przekąska", "перекус"], ["danie", "блюдо"], ["składnik", "ингредиент"], ["przepis", "рецепт"], ["smak", "вкус"], ["słony", "солёный"], ["słodki", "сладкий"], ["kwaśny", "кислый"], ["ostry", "острый"], ["rachunek", "счёт"], ["napiwek", "чаевые"], ["kelner", "официант"], ["stolik", "столик"], ["menu", "меню"], ["rezerwacja stolika", "бронь столика"], ["alergia", "аллергия"]],
    technology: [["hasło", "пароль"], ["konto", "аккаунт"], ["ustawienia", "настройки"], ["powiadomienie", "уведомление"], ["załącznik", "вложение"], ["plik", "файл"], ["folder", "папка"], ["połączenie", "соединение"], ["sieć", "сеть"], ["ładowarka", "зарядное устройство"], ["bateria", "батарея"], ["ekran", "экран"], ["aplikacja", "приложение"], ["aktualizacja", "обновление"], ["błąd systemu", "системная ошибка"], ["wiadomość", "сообщение"], ["wyszukiwarka", "поисковик"], ["prywatność", "приватность"], ["bezpieczeństwo", "безопасность"], ["dane", "данные"]],
    argumentation: [["opinia", "мнение"], ["argument", "аргумент"], ["przykład", "пример"], ["powód", "причина"], ["skutek", "последствие"], ["zaleta", "преимущество"], ["wada", "недостаток"], ["rozwiązanie", "решение"], ["wniosek", "вывод"], ["porównanie", "сравнение"], ["różnica", "разница"], ["podobieństwo", "сходство"], ["zgoda", "согласие"], ["sprzeciw", "возражение"], ["problem", "проблема"], ["temat", "тема"], ["stanowisko", "позиция"], ["dowód", "доказательство"], ["cel", "цель"], ["wpływ", "влияние"]],
    finance: [["budżet", "бюджет"], ["wydatek", "расход"], ["dochód", "доход"], ["oszczędności", "сбережения"], ["konto bankowe", "банковский счёт"], ["przelew", "перевод"], ["opłata", "платёж/сбор"], ["podatek", "налог"], ["rachunek za prąd", "счёт за электричество"], ["dług", "долг"], ["rata", "платёж по кредиту"], ["pożyczka", "заём"], ["gotówka", "наличные"], ["karta płatnicza", "платёжная карта"], ["paragon fiskalny", "кассовый чек"], ["cena", "цена"], ["zniżka", "скидка"], ["koszt utrzymania", "стоимость жизни"], ["wypłata", "выплата/зарплата"], ["oszczędzać", "экономить"]],
    family: [["rodzice", "родители"], ["małżeństwo", "брак"], ["mąż", "муж"], ["żona", "жена"], ["dzieciństwo", "детство"], ["wychowanie", "воспитание"], ["krewny", "родственник"], ["teściowie", "родители супруга"], ["wnuk", "внук"], ["wnuczka", "внучка"], ["opieka", "забота/уход"], ["obowiązek domowy", "домашняя обязанность"], ["wspólne mieszkanie", "совместное проживание"], ["uroczystość", "торжество"], ["rocznica", "годовщина"], ["prezent", "подарок"], ["wsparcie rodziny", "поддержка семьи"], ["pokolenie", "поколение"], ["dorosły", "взрослый"], ["dziecko", "ребёнок"]],
    daily: [["poranek", "утро"], ["wieczór", "вечер"], ["nawyk", "привычка"], ["plan dnia", "план дня"], ["odpoczynek", "отдых"], ["sprzątanie", "уборка"], ["pranie", "стирка"], ["prasowanie", "глажка"], ["gotowanie", "готовка"], ["zakupy spożywcze", "покупка продуктов"], ["kolejność", "порядок/очерёдность"], ["pośpiech", "спешка"], ["spokój", "спокойствие"], ["zmęczenie", "усталость"], ["przerwa", "перерыв"], ["obowiązek", "обязанность"], ["rutyna", "рутина"], ["organizacja czasu", "организация времени"], ["punktualność", "пунктуальность"], ["samodzielność", "самостоятельность"]],
    nature: [["pogoda", "погода"], ["temperatura", "температура"], ["deszcz", "дождь"], ["śnieg", "снег"], ["wiatr", "ветер"], ["burza", "гроза"], ["upał", "жара"], ["mróz", "мороз"], ["zachmurzenie", "облачность"], ["prognoza pogody", "прогноз погоды"], ["przyroda", "природа"], ["las", "лес"], ["rzeka", "река"], ["jezioro", "озеро"], ["góra", "гора"], ["morze", "море"], ["powietrze", "воздух"], ["krajobraz", "пейзаж"], ["sezon", "сезон"], ["zmiana pogody", "изменение погоды"]],
    culture: [["film", "фильм"], ["serial", "сериал"], ["książka", "книга"], ["gazeta", "газета"], ["artykuł", "статья"], ["wiadomości", "новости"], ["program", "программа"], ["wystawa", "выставка"], ["muzeum", "музей"], ["teatr", "театр"], ["koncert", "концерт"], ["bilet", "билет"], ["recenzja", "рецензия"], ["autor", "автор"], ["bohater", "герой"], ["wydarzenie kulturalne", "культурное событие"], ["publiczność", "публика"], ["scena", "сцена"], ["audycja", "передача"], ["media społecznościowe", "социальные сети"]],
    leisure: [["czas wolny", "свободное время"], ["hobby", "хобби"], ["siłownia", "спортзал"], ["trening", "тренировка"], ["spacer", "прогулка"], ["rower", "велосипед"], ["basen", "бассейн"], ["odpoczywać", "отдыхать"], ["spotkanie ze znajomymi", "встреча с друзьями"], ["gra planszowa", "настольная игра"], ["wycieczka", "экскурсия/поездка"], ["zainteresowanie", "интерес"], ["umiejętność", "навык"], ["zawody sportowe", "соревнования"], ["drużyna", "команда"], ["wynik meczu", "счёт матча"], ["aktywność fizyczna", "физическая активность"], ["relaks", "расслабление"], ["wolny weekend", "свободные выходные"], ["pasja", "увлечение"]],
    safety: [["policja", "полиция"], ["straż pożarna", "пожарная служба"], ["pogotowie", "скорая помощь"], ["wypadek", "авария/несчастный случай"], ["kradzież", "кража"], ["zgłoszenie", "заявление/сообщение"], ["świadek", "свидетель"], ["mandat", "штраф"], ["przepis", "правило/закон"], ["zakaz", "запрет"], ["nakaz", "предписание"], ["ostrożność", "осторожность"], ["niebezpieczeństwo", "опасность"], ["pomoc", "помощь"], ["ubezpieczenie", "страховка"], ["numer alarmowy", "экстренный номер"], ["zaginiony dokument", "потерянный документ"], ["ochrona", "охрана"], ["odpowiedzialność", "ответственность"], ["sprawa", "дело"]],
    society: [["społeczeństwo", "общество"], ["mieszkaniec", "житель"], ["obywatel", "гражданин"], ["cudzoziemiec", "иностранец"], ["integracja", "интеграция"], ["wolontariat", "волонтёрство"], ["sąsiedztwo", "соседство"], ["wspólnota", "сообщество"], ["problem społeczny", "социальная проблема"], ["bezrobocie", "безработица"], ["edukacja publiczna", "общественное образование"], ["opieka zdrowotna", "здравоохранение"], ["komunikacja miejska", "городской транспорт"], ["wybory", "выборы"], ["prawo głosu", "право голоса"], ["równość", "равенство"], ["różnorodność", "разнообразие"], ["pomoc społeczna", "социальная помощь"], ["migracja", "миграция"], ["jakość życia", "качество жизни"]],
    personality: [["charakter", "характер"], ["cecha", "черта"], ["cierpliwy", "терпеливый"], ["odpowiedzialny", "ответственный"], ["pracowity", "трудолюбивый"], ["otwarty", "открытый"], ["zamknięty w sobie", "замкнутый"], ["pewny siebie", "уверенный в себе"], ["nieśmiały", "застенчивый"], ["uprzejmy", "вежливый"], ["uczciwy", "честный"], ["spokojny", "спокойный"], ["nerwowy", "нервный"], ["ambitny", "амбициозный"], ["pomocny", "отзывчивый"], ["samodzielny", "самостоятельный"], ["punktualny", "пунктуальный"], ["dokładny", "точный/аккуратный"], ["wrażliwy", "чувствительный"], ["zabawny", "забавный"]],
    environment: [["środowisko", "окружающая среда"], ["odpady", "отходы"], ["segregacja śmieci", "сортировка мусора"], ["recykling", "переработка"], ["zanieczyszczenie", "загрязнение"], ["hałas", "шум"], ["smog", "смог"], ["energia", "энергия"], ["oszczędzanie wody", "экономия воды"], ["transport publiczny", "общественный транспорт"], ["rower miejski", "городской велосипед"], ["plastik", "пластик"], ["opakowanie", "упаковка"], ["natura", "природа"], ["ochrona środowiska", "защита окружающей среды"], ["zmiany klimatu", "изменение климата"], ["czyste powietrze", "чистый воздух"], ["zielona przestrzeń", "зелёное пространство"], ["park miejski", "городской парк"], ["odpowiedzialny wybór", "ответственный выбор"]]
  },
  thematicPhrases: {
    work: [["Мне нужно подготовить отчёт", "muszę przygotować raport"], ["У меня встреча в понедельник", "mam spotkanie w poniedziałek"], ["Я ищу работу в новой компании", "szukam pracy w nowej firmie"], ["Мне нужно поговорить с руководителем", "muszę porozmawiać z kierownikiem"], ["Я хочу взять отпуск", "chcę wziąć urlop"]],
    housing: [["Я хочу снять квартиру", "chcę wynająć mieszkanie"], ["Сколько стоит аренда?", "ile kosztuje czynsz?"], ["У нас проблема с отоплением", "mamy problem z ogrzewaniem"], ["Когда можно посмотреть квартиру?", "kiedy można obejrzeć mieszkanie?"], ["Я переезжаю в другой район", "przeprowadzam się do innej dzielnicy"]],
    health: [["Я хотел бы записаться к врачу", "chciałbym umówić się do lekarza"], ["У меня болит горло", "boli mnie gardło"], ["Мне нужен рецепт", "potrzebuję recepty"], ["Где находится ближайшая аптека?", "gdzie jest najbliższa apteka?"], ["Когда будут результаты анализов?", "kiedy będą wyniki badań?"]],
    documents: [["Мне нужно подать заявление", "muszę złożyć wniosek"], ["Где я должен подписать формуляр?", "gdzie mam podpisać formularz?"], ["Мне нужно подтверждение оплаты", "potrzebuję potwierdzenia opłaty"], ["Какой у меня номер дела?", "jaki jest mój numer sprawy?"], ["Когда я могу забрать документ?", "kiedy mogę odebrać dokument?"]],
    shopping: [["Я хочу вернуть товар", "chcę zwrócić towar"], ["У меня есть чек", "mam paragon"], ["Можно оплатить картой?", "czy można zapłacić kartą?"], ["Мне нужен другой размер", "potrzebuję innego rozmiaru"], ["Когда будет доставка?", "kiedy będzie dostawa?"]],
    city: [["Где ближайшая остановка?", "gdzie jest najbliższy przystanek?"], ["Мне нужна пересадка", "muszę się przesiąść"], ["Автобус опаздывает", "autobus się spóźnia"], ["Как доехать до центра?", "jak dojechać do centrum?"], ["Где можно купить билет?", "gdzie można kupić bilet?"]],
    education: [["Я хочу сдать экзамен B1", "chcę zdać egzamin B1"], ["Мне нужно повторить грамматику", "muszę powtórzyć gramatykę"], ["Какой у меня прогресс?", "jaki mam postęp?"], ["Я часто делаю эту ошибку", "często robię ten błąd"], ["Мне нужен сертификат", "potrzebuję certyfikatu"]],
    relationships: [["Мне нужна поддержка", "potrzebuję wsparcia"], ["Я хочу извиниться", "chcę przeprosić"], ["У нас был трудный разговор", "mieliśmy trudną rozmowę"], ["Я не уверен в этом решении", "nie jestem pewien tej decyzji"], ["Я благодарен за совет", "jestem wdzięczny za radę"]],
    travel: [["Я хочу забронировать номер", "chcę zarezerwować pokój"], ["Мой рейс задержан", "mój lot jest opóźniony"], ["Где находится ресепшен?", "gdzie jest recepcja?"], ["Мне нужна туристическая страховка", "potrzebuję ubezpieczenia turystycznego"], ["Мы будем осматривать город", "będziemy zwiedzać miasto"]],
    food: [["Я хотел бы заказать обед", "chciałbym zamówić obiad"], ["Можно счёт?", "czy mogę prosić o rachunek?"], ["У меня аллергия", "mam alergię"], ["Это блюдо слишком острое", "to danie jest za ostre"], ["Я хочу забронировать столик", "chcę zarezerwować stolik"]],
    technology: [["Я забыл пароль", "zapomniałem hasła"], ["Не работает соединение", "połączenie nie działa"], ["Мне нужно обновить приложение", "muszę zaktualizować aplikację"], ["Я не могу открыть файл", "nie mogę otworzyć pliku"], ["Это вопрос безопасности данных", "to kwestia bezpieczeństwa danych"]],
    argumentation: [["Моё мнение такое, что...", "moim zdaniem..."], ["Главное преимущество — это...", "główna zaleta to..."], ["С другой стороны есть недостаток", "z drugiej strony jest wada"], ["Например, можно сказать, что...", "na przykład można powiedzieć, że..."], ["Мой вывод такой", "mój wniosek jest taki"]],
    finance: [["Я хочу лучше планировать бюджет", "chcę lepiej planować budżet"], ["Мне нужно сделать перевод", "muszę zrobić przelew"], ["Расходы выросли", "wydatki wzrosły"], ["Я стараюсь экономить", "staram się oszczędzać"], ["Сколько стоит содержание квартиры?", "ile kosztuje utrzymanie mieszkania?"]],
    family: [["Я часто помогаю семье", "często pomagam rodzinie"], ["У нас семейное торжество", "mamy uroczystość rodzinną"], ["Это важное поколение", "to ważne pokolenie"], ["Я забочусь о ребёнке", "opiekuję się dzieckiem"], ["Мне нужна поддержка семьи", "potrzebuję wsparcia rodziny"]],
    daily: [["У меня плотный план дня", "mam napięty plan dnia"], ["Мне нужен короткий перерыв", "potrzebuję krótkiej przerwy"], ["Я делаю покупки продуктов", "robię zakupy spożywcze"], ["Я хочу лучше организовать время", "chcę lepiej organizować czas"], ["По утрам я спешу", "rano się spieszę"]],
    nature: [["Какая сегодня погода?", "jaka jest dziś pogoda?"], ["Прогноз обещает дождь", "prognoza zapowiada deszcz"], ["Мне нравится этот пейзаж", "podoba mi się ten krajobraz"], ["Зимой бывает мороз", "zimą bywa mróz"], ["Погода быстро меняется", "pogoda szybko się zmienia"]],
    culture: [["Я прочитал интересную статью", "przeczytałem ciekawy artykuł"], ["Мы идём на выставку", "idziemy na wystawę"], ["Мне понравилась рецензия", "spodobała mi się recenzja"], ["В новостях говорили об этом", "mówili o tym w wiadomościach"], ["Я купил билет на концерт", "kupiłem bilet na koncert"]],
    leisure: [["В свободное время езжу на велосипеде", "w czasie wolnym jeżdżę na rowerze"], ["Мне нужна физическая активность", "potrzebuję aktywności fizycznej"], ["У нас встреча с друзьями", "mamy spotkanie ze znajomymi"], ["В выходные хочу отдохнуть", "w weekend chcę odpocząć"], ["Это моя новая pasja", "to moja nowa pasja"]],
    safety: [["Мне нужно вызвать помощь", "muszę wezwać pomoc"], ["Я zgubiłem dokument", "zgubiłem dokument"], ["Нужно сообщить в полицию", "trzeba zgłosić to na policję"], ["Будь осторожен", "bądź ostrożny"], ["Я был свидетелем аварии", "byłem świadkiem wypadku"]],
    society: [["Качество жизни здесь хорошее", "jakość życia jest tu dobra"], ["Интеграция требует времени", "integracja wymaga czasu"], ["Это важная социальная проблема", "to ważny problem społeczny"], ["Многие жители пользуются транспортом", "wielu mieszkańców korzysta z komunikacji"], ["Волонтёрство помогает людям", "wolontariat pomaga ludziom"]],
    personality: [["Он ответственный и пунктуальный", "on jest odpowiedzialny i punktualny"], ["Она уверена в себе", "ona jest pewna siebie"], ["Я иногда застенчивый", "czasem jestem nieśmiały"], ["Мне нравится открытый характер", "lubię otwarty charakter"], ["Он очень отзывчивый", "on jest bardzo pomocny"]],
    environment: [["Мы сортируем мусор", "segregujemy śmieci"], ["Нужно экономить воду", "trzeba oszczędzać wodę"], ["Смог влияет на здоровье", "smog wpływa na zdrowie"], ["Я чаще выбираю общественный транспорт", "częściej wybieram transport publiczny"], ["Это ответственный выбор", "to odpowiedzialny wybór"]]
  }
};

const ruleTables = {
  pluralNominative: [
    { title: "Dwie główne grupy", headers: ["grupa", "zaimek", "kiedy?", "przykład"], rows: [["męskoosobowy", "oni", "mężczyźni albo grupa mieszana", "dobrzy studenci"], ["niemęskoosobowy", "one", "kobiety, dzieci, rzeczy, zwierzęta", "dobre książki"]] },
    { title: "Męskoosobowy — rzeczowniki", headers: ["typ", "liczba pojedyncza", "liczba mnoga", "uwaga"], rows: [["-t → -ci", "student", "studenci", "częste"], ["-d → -dzi", "sąsiad", "sąsiedzi", "częste"], ["-k → -cy", "Polak", "Polacy", "narodowości"], ["-g → -dzy", "kolega", "koledzy", "ważne"], ["-r → -rzy", "aktor", "aktorzy", "zawody"], ["-owie", "profesor", "profesorowie", "grupa specjalna"], ["nieregularne", "człowiek", "ludzie", "zapamiętać"]] },
    { title: "Przymiotniki", headers: ["pojedyncza", "męskoosobowy", "niemęskoosobowy"], rows: [["dobry", "dobrzy", "dobre"], ["nowy", "nowi", "nowe"], ["polski", "polscy", "polskie"], ["wysoki", "wysocy", "wysokie"], ["młody", "młodzi", "młode"], ["duży", "duzi", "duże"], ["miły", "mili", "miłe"]] }
  ],
  accusative: [{ title: "Biernik — końcówki", headers: ["rodzaj", "mianownik", "biernik", "przykład"], rows: [["męski żywotny", "dobry lekarz", "dobrego lekarza", "Widzę dobrego lekarza"], ["męski nieżywotny", "nowy telefon", "nowy telefon", "Mam nowy telefon"], ["żeński", "dobra kawa", "dobrą kawę", "Piję dobrą kawę"], ["nijaki", "małe dziecko", "małe dziecko", "Widzę małe dziecko"], ["męskoos. mn.", "dobrzy studenci", "dobrych studentów", "Znam dobrych studentów"]] }],
  genitive: [{ title: "Dopełniacz — końcówki", headers: ["typ", "mianownik", "dopełniacz", "użycie"], rows: [["męski", "czas", "czasu", "nie mam czasu"], ["męski", "student", "studenta", "nie ma studenta"], ["żeński", "kawa", "kawy", "nie ma kawy"], ["żeński", "praca", "pracy", "szukam pracy"], ["nijaki", "dziecko", "dziecka", "nie ma dziecka"], ["mnoga", "ludzie", "ludzi", "dużo ludzi"]] }],
  dative: [{ title: "Celownik — komu? czemu?", headers: ["mianownik", "celownik", "przykład"], rows: [["ja", "mi", "daje mi"], ["ty", "ci", "pomagam ci"], ["on", "mu", "mówię mu"], ["student", "studentowi", "pomagam studentowi"], ["kolega", "koledze", "mówię koledze"], ["kobieta", "kobiecie", "pomagam kobiecie"], ["dziecko", "dziecku", "daję dziecku"]] }],
  instrumental: [{ title: "Narzędnik — z kim? z czym?", headers: ["mianownik", "narzędnik", "przykład"], rows: [["programista", "programistą", "jestem programistą"], ["student", "studentem", "jestem studentem"], ["lekarz", "lekarzem", "jestem lekarzem"], ["kolega", "kolegą", "z kolegą"], ["rodzina", "rodziną", "z rodziną"], ["dziecko", "dzieckiem", "z dzieckiem"], ["ludzie", "ludźmi", "z ludźmi"]] }],
  locative: [{ title: "Miejscownik — o kim? o czym?", headers: ["mianownik", "miejscownik", "przykład"], rows: [["Polska", "Polsce", "w Polsce"], ["praca", "pracy", "w pracy"], ["sklep", "sklepie", "w sklepie"], ["dom", "domu", "w domu"], ["kurs", "kursie", "na kursie"], ["rodzina", "rodzinie", "o rodzinie"], ["dziecko", "dziecku", "o dziecku"]] }],
  verbsPresent: [
    { title: "Czas teraźniejszy — быстрый ориентир по лицам", headers: ["osoba", "pracować", "robić", "mówić", "mieć"], rows: [["ja", "pracuję", "robię", "mówię", "mam"], ["ty", "pracujesz", "robisz", "mówisz", "masz"], ["on/ona", "pracuje", "robi", "mówi", "ma"], ["my", "pracujemy", "robimy", "mówimy", "mamy"], ["wy", "pracujecie", "robicie", "mówicie", "macie"], ["oni/one", "pracują", "robią", "mówią", "mają"]] },
    { title: "Группа -ować / -ywać / -iwać", headers: ["model", "ja", "ty", "my", "oni/one"], rows: [["pracować", "pracuję", "pracujesz", "pracujemy", "pracują"], ["pokazywać", "pokazuję", "pokazujesz", "pokazujemy", "pokazują"], ["potakiwać", "potakuję", "potakujesz", "potakujemy", "potakują"], ["правило", "-uję", "-ujesz", "-ujemy", "-ują"]] },
    { title: "Группа -ać с моделью -am / -asz", headers: ["model", "ja", "ty", "my", "oni/one"], rows: [["mieszkać", "mieszkam", "mieszkasz", "mieszkamy", "mieszkają"], ["czekać", "czekam", "czekasz", "czekamy", "czekają"], ["czytać", "czytam", "czytasz", "czytamy", "czytają"], ["znać", "znam", "znasz", "znamy", "znają"]] },
    { title: "Группа -ić / -yć / часть -eć", headers: ["model", "ja", "ty", "my", "oni/one"], rows: [["mówić", "mówię", "mówisz", "mówimy", "mówią"], ["prosić", "proszę", "prosisz", "prosimy", "proszą"], ["uczyć", "uczę", "uczysz", "uczymy", "uczą"], ["widzieć", "widzę", "widzisz", "widzimy", "widzą"], ["milczeć", "milczę", "milczysz", "milczymy", "milczą"]] },
    { title: "Чередования и формы, которые надо учить отдельно", headers: ["bezokolicznik", "ja", "ty", "oni/one", "uwaga"], rows: [["brać", "biorę", "bierzesz", "biorą", "меняется основа"], ["nieść", "niosę", "niesiesz", "niosą", "меняется основа"], ["wieźć", "wiozę", "wieziesz", "wiozą", "меняется основа"], ["pisać", "piszę", "piszesz", "piszą", "sz/sz/ą"], ["piec", "piekę", "pieczesz", "pieką", "k/cz/ką"], ["dać", "dam", "dasz", "dadzą", "они/one: dadzą"]] }
  ],
  irregularVerbs: [
    { title: "Самые частые неправильные глаголы", headers: ["bezokolicznik", "ja", "ty", "on/ona", "my", "wy", "oni/one"], rows: [["być", "jestem", "jesteś", "jest", "jesteśmy", "jesteście", "są"], ["mieć", "mam", "masz", "ma", "mamy", "macie", "mają"], ["iść", "idę", "idziesz", "idzie", "idziemy", "idziecie", "idą"], ["jechać", "jadę", "jedziesz", "jedzie", "jedziemy", "jedziecie", "jadą"], ["jeść", "jem", "jesz", "je", "jemy", "jecie", "jedzą"]] },
    { title: "Вторая группа, которую надо узнавать сразу", headers: ["bezokolicznik", "ja", "ty", "on/ona", "my", "wy", "oni/one"], rows: [["móc", "mogę", "możesz", "może", "możemy", "możecie", "mogą"], ["chcieć", "chcę", "chcesz", "chce", "chcemy", "chcecie", "chcą"], ["wiedzieć", "wiem", "wiesz", "wie", "wiemy", "wiecie", "wiedzą"], ["brać", "biorę", "bierzesz", "bierze", "bierzemy", "bierzecie", "biorą"], ["dać", "dam", "dasz", "da", "damy", "dacie", "dadzą"]] },
    { title: "На что смотреть в первую очередь", headers: ["глагол", "опасная форма", "что запомнить"], rows: [["być", "są", "не `jestą`"], ["iść", "idę / idą", "не `iszę`, не `idzą`"], ["jechać", "jadę / jadą", "основа `jad-`"], ["móc", "mogę / mogą", "g/gą"], ["brać", "biorę / biorą", "основа меняется"], ["dać", "dadzą", "не `dają` в значении `дадут`"]] }
  ],
  verbsPast: [
    { title: "Czas przeszły — окончания", headers: ["osoba", "męski", "żeński / niemęskoos."], rows: [["ja", "robiłem", "robiłam"], ["ty", "robiłeś", "robiłaś"], ["on/ona", "robił", "robiła"], ["my", "robiliśmy", "robiłyśmy"], ["wy", "robiliście", "robiłyście"], ["oni/one", "robili", "robiły"]] },
    { title: "Что здесь важно видеть", headers: ["ситуация", "форма", "подсказка"], rows: [["муж. ед. ч.", "-łem / -łeś / -ł", "robiłem, robiłeś, robił"], ["жен. ед. ч.", "-łam / -łaś / -ła", "robiłam, robiłaś, robiła"], ["męskoosobowy мн.", "-liśmy / -liście / -li", "robiliśmy, robiliście, robili"], ["niemęskoosobowy мн.", "-łyśmy / -łyście / -ły", "robiłyśmy, robiłyście, robiły"], ["движение", "poszedłem / poszłam", "учить отдельно"]] }
  ],
  verbsFuture: [
    { title: "Czas przyszły — два типа", headers: ["typ", "przykład", "znaczenie"], rows: [["będę + infinitiv", "będę pracować", "процесс"], ["będę + forma przeszła", "będę pracował", "процесс"], ["dokonany", "zrobię", "результат"], ["dokonany", "kupię", "результат"], ["dokonany", "przeczytam", "результат"]] },
    { title: "Formy być w czasie przyszłym", headers: ["osoba", "forma"], rows: [["ja", "będę"], ["ty", "będziesz"], ["on/ona/ono", "będzie"], ["my", "będziemy"], ["wy", "będziecie"], ["oni/one", "będą"]] }
  ],
  aspect: [
    { title: "Aspekt — когда что брать", headers: ["sytuacja", "niedokonany", "dokonany"], rows: [["процесс", "robić", "—"], ["результат", "—", "zrobić"], ["często / zawsze", "robię", "—"], ["już / do końca", "—", "zrobiłem / zrobię"], ["długo", "czytałem", "—"], ["całą książkę", "—", "przeczytałem"]] },
    { title: "Маркер → тип глагола", headers: ["маркер", "чаще нужен", "пример"], rows: [["teraz, często, zwykle", "niedokonany", "Teraz czytam."], ["już, w końcu, do końca", "dokonany", "Już przeczytałem."], ["jutro będę...", "процесс", "Jutro będę pisać."], ["jutro zrobię...", "результат", "Jutro napiszę raport."]] }
  ],
  prepositions: [{ title: "Przyimki + przypadki", headers: ["przyimek", "przypadek", "przykład"], rows: [["do", "dopełniacz", "do sklepu"], ["z = od/skąd", "dopełniacz", "z pracy"], ["z = razem", "narzędnik", "z rodziną"], ["w = gdzie", "miejscownik", "w Polsce"], ["na = gdzie", "miejscownik", "na kursie"], ["na = dokąd", "biernik", "na kurs"], ["o", "miejscownik", "o pracy"]] }],
  numbersTime: [
    { title: "Liczby 1–4 i 5+", headers: ["liczba", "forma", "przykład"], rows: [["1", "mianownik pojedynczy", "jeden złoty, jeden grosz"], ["2, 3, 4", "mianownik liczby mnogiej", "dwa złote, trzy grosze"], ["5–21", "dopełniacz liczby mnogiej", "pięć złotych, pięć groszy"], ["22, 23, 24", "jak 2–4", "dwadzieścia dwa złote"], ["25–31", "jak 5+", "dwadzieścia pięć złotych"], ["godziny / minuty", "2/3/4 godziny, 5 godzin", "mam dwie godziny / pięć minut"]] },
    { title: "Czas i godziny", headers: ["pytanie", "forma", "przykład"], rows: [["która godzina?", "pierwsza, druga, trzecia", "Jest druga."], ["o której?", "o pierwszej, o drugiej", "Spotkanie jest o drugiej."], ["pełna godzina", "ósma, dziewiąta", "Jest ósma."], ["oficjalnie", "13:00 = trzynasta", "Spotkanie o trzynastej."] ] }
  ],
  complexSentences: [{ title: "Zdania złożone", headers: ["spójnik", "znaczenie", "przykład"], rows: [["że", "что", "Myślę, że to dobry pomysł."], ["kiedy/gdy", "когда", "Kiedy wracam, jem obiad."], ["jeśli/jeżeli", "если", "Jeśli mam czas, uczę się."], ["bo", "потому что", "Uczę się, bo chcę mówić."], ["dlatego", "поэтому", "Pracuję dużo, dlatego jestem zmęczony."], ["żeby", "чтобы", "Uczę się, żeby mówić lepiej."]] }],
  politeConditional: [{ title: "Tryb warunkowy i grzeczne prośby", headers: ["forma", "użycie", "przykład"], rows: [["chciałbym/chciałabym", "вежливо хочу", "Chciałbym zapytać o termin."], ["mógłbym/mogłabym", "мог бы / могла бы", "Czy mógłbym zmienić godzinę?"], ["mogliby Państwo", "могли бы Вы", "Czy mogliby Państwo pomóc?"], ["gdybym miał czas", "если бы у меня было время", "Gdybym miał czas, zadzwoniłbym."], ["prosiłbym/prosiłabym", "я бы просил(а)", "Prosiłbym o odpowiedź."]] }],
  imperatives: [{ title: "Tryb rozkazujący", headers: ["osoba", "forma", "przykład"], rows: [["ty", "zrób / napisz / poczekaj", "Napisz do mnie."], ["wy", "zróbcie / napiszcie", "Poczekajcie chwilę."], ["pan/pani", "proszę + bezokolicznik", "Proszę wypełnić formularz."], ["zakaz", "nie + rozkazujący", "Nie zapomnij dokumentu."], ["instrukcja", "należy / trzeba", "Należy podpisać wniosek."]] }],
  pronouns: [{ title: "Zaimki w przypadkach", headers: ["kto?", "biernik", "celownik", "dopełniacz"], rows: [["ja", "mnie", "mi", "mnie"], ["ty", "ciebie / cię", "ci", "ciebie"], ["on", "go / jego", "mu", "go / jego"], ["ona", "ją", "jej", "jej"], ["my", "nas", "nam", "nas"], ["wy", "was", "wam", "was"], ["oni/one", "ich/je", "im", "ich"]] }],
  reflexiveSie: [{ title: "Czasowniki z się", headers: ["typ", "przykład", "uwaga"], rows: [["uczyć się", "Uczę się polskiego.", "się обычно после глагола"], ["spotykać się", "Spotykam się z kolegą.", "często z + narzędnik"], ["podobać się", "Podoba mi się kurs.", "кому? = celownik"], ["czuć się", "Czuję się dobrze.", "описание состояния"], ["bać się", "Boję się egzaminu.", "często dopełniacz"]] }],
  comparisons: [{ title: "Stopniowanie", headers: ["typ", "forma", "przykład"], rows: [["regularne", "-szy / -ejszy", "tani → tańszy"], ["naj-", "najlepszy / najważniejszy", "To najważniejszy temat."], ["nieregularne", "dobry → lepszy → najlepszy", "Ten kurs jest lepszy."], ["porównanie", "niż", "Polski jest trudniejszy niż angielski."], ["równość", "tak samo ... jak", "To jest tak samo ważne jak gramatyka."]] }],
  modalVerbs: [{ title: "Czasowniki modalne", headers: ["forma", "znaczenie", "przykład"], rows: [["muszę", "я должен", "Muszę złożyć wniosek."], ["mogę", "я могу", "Mogę przyjść jutro."], ["powinienem/powinnam", "мне следует", "Powinienem powtórzyć słowa."], ["wolno", "разрешено", "Tu wolno parkować."], ["nie wolno", "нельзя", "Nie wolno palić."]] }],
  impersonal: [{ title: "Formy bezosobowe", headers: ["forma", "użycie", "przykład"], rows: [["można", "можно", "Można zapłacić kartą."], ["trzeba", "нужно", "Trzeba podpisać formularz."], ["należy", "следует", "Należy dołączyć załącznik."], ["mówi się", "говорят", "Mówi się, że to trudne."], ["warto", "стоит", "Warto robić powtórki."]] }],
  wordOrder: [{ title: "Szyk zdania", headers: ["sytuacja", "schemat", "przykład"], rows: [["neutralnie", "kto + co robi + reszta", "Ja uczę się polskiego."], ["czas na początku", "czas + czasownik + osoba", "Jutro mam egzamin."], ["się", "często po czasowniku", "Uczę się codziennie."], ["nie", "przed czasownikiem", "Nie rozumiem pytania."], ["pytanie", "czy / gdzie / kiedy + reszta", "Kiedy mogę odebrać dokument?"]] }],
  b1Connectors: [{ title: "Łączniki B1", headers: ["łącznik", "znaczenie", "przykład"], rows: [["jednak", "однако", "Chciałem przyjść, jednak nie miałem czasu."], ["natomiast", "а вот / тогда как", "Ja wolę kurs online, natomiast brat woli szkołę."], ["oprócz tego", "кроме того", "Uczę się słów, oprócz tego czytam teksty."], ["z tego powodu", "по этой причине", "Był remont, z tego powodu autobus się spóźnił."], ["podsumowując", "подводя итог", "Podsumowując, to dobry pomysł."]] }]
};

const topicRuleSheets = {
  pluralNominative: [
    { title: "С чего начать", body: "Сначала не думай об окончаниях. Сначала реши только одно: `oni` или `one`. Если там мужчины или смешанная группа, чаще будет `oni`. Если женщины, вещи, дети, животные — чаще `one`." },
    { title: "Как выбирать форму", body: "Шаг 1: определяешь группу `oni/one`. Шаг 2: выбираешь форму существительного. Шаг 3: согласуешь прилагательное: `dobrzy studenci`, но `dobre książki`." },
    { title: "Где чаще всего ошибка", body: "Обычно ошибка не в самом слове, а в согласовании: человек ставит `dobre studenci` или `polskie lekarze`. Здесь надо видеть пару целиком: прилагательное + существительное." }
  ],
  accusative: [
    { title: "Что это за падеж", body: "Biernik показывает объект действия. Если ты что-то видишь, покупаешь, знаешь, любишь, встречаешь — очень часто нужен именно он." },
    { title: "Как мыслить пошагово", body: "Шаг 1: найди глагол. Шаг 2: задай вопрос `kogo? co?`. Шаг 3: реши род и тип слова. Шаг 4: только потом меняй окончание." },
    { title: "Главная ловушка", body: "Самая частая путаница — мужской одушевлённый против мужского неодушевлённого: `widzę lekarza`, но `mam telefon`. То есть один меняется, а другой часто нет." }
  ],
  genitive: [
    { title: "Когда он нужен", body: "Dopełniacz часто появляется после отрицания, количества и глаголов типа `szukam`, `potrzebuję`, `używam`. Это падеж нехватки, отсутствия, количества и потребности." },
    { title: "Как его узнавать", body: "Если по-русски хочется сказать `нет чего-то`, `много чего-то`, `ищу что-то`, `нужно что-то` — почти наверняка здесь будет dopełniacz." },
    { title: "Главная ловушка", body: "Не пытайся вывести все окончания одной формулой. Здесь лучше помнить частые блоки: `nie mam czasu`, `szukam pracy`, `potrzebuję pomocy`, `dużo ludzi`." }
  ],
  dative: [
    { title: "Что передаёт celownik", body: "Этот падеж показывает адресата: кому даю, кому помогаю, кому говорю, кому нравится. Он отвечает за `кому?`." },
    { title: "Как думать", body: "Если в ситуации есть получатель действия, сначала найди его: `daję książkę bratu`, `pomagam koledze`, `podoba mi się kurs`." },
    { title: "Главная ловушка", body: "После `pomagać`, `dawać`, `mówić`, `pokazywać` нельзя машинально ставить biernik. Сначала спроси: это объект действия или адресат?" }
  ],
  instrumental: [
    { title: "Две главные ситуации", body: "Narzędnik чаще всего нужен после `z` в значении `с кем/с чем` и после `być`, когда называем профессию, роль или состояние: `z kolegą`, `jestem lekarzem`." },
    { title: "Как не путаться", body: "Если `z` значит `вместе с`, это narzędnik. Если `z` значит `откуда`, это уже не он, а чаще dopełniacz: `z pracy`, `z Polski`." },
    { title: "Практический способ", body: "Лучше учить готовыми кусками: `jadę samochodem`, `rozmawiam z nauczycielem`, `jestem studentem`, `pracuję z ludźmi`." }
  ],
  locative: [
    { title: "Почему он кажется сложным", body: "Miejscownik почти не живёт один: он приходит с предлогами `w`, `na`, `o`, `po`, `przy`. Поэтому здесь надо учить не слово, а связку." },
    { title: "Как выбирать", body: "Сначала определи смысл: `где?` или `о чём?`. Тогда появляются блоки `w pracy`, `na kursie`, `o rodzinie`, `po pracy`." },
    { title: "Главная ловушка", body: "Предлог `na` может тянуть разные падежи: `na kurs` = куда? biernik, а `na kursie` = где? miejscownik." }
  ],
  verbsPresent: [
    { title: "Главная идея темы", body: "Здесь нельзя учить только инфинитив. Нужно сразу видеть модель спряжения и окончания по лицам: `я`, `ты`, `он`, `мы`, `вы`, `они`." },
    { title: "Как учить глагол правильно", body: "Не `pracować = работать`, а `pracować -> pracuję, pracujesz...`; не `mówić = говорить`, а `mówię, mówisz...`. То есть учим сразу мини-парадигмой." },
    { title: "Что делать на практике", body: "Сначала распознавай группу, потом подставляй окончания, потом говори целую фразу. Именно поэтому после правила сразу должны идти упражнения по моделям." }
  ],
  irregularVerbs: [
    { title: "Как к ним относиться", body: "Эти глаголы не надо пытаться домыслить. Их надо узнавать как готовые частые формы: `jestem`, `mam`, `idę`, `mogę`, `wiem`." },
    { title: "Что учить первым", body: "В первую очередь формы `ja`, `ty` и `oni/one`, потому что именно они чаще всего ломают автоматизм: `idę`, `idziesz`, `idą`; `biorę`, `bierzesz`, `biorą`." },
    { title: "Как закреплять", body: "Не таблицей в вакууме, а через короткие фразы: `mam czas`, `mogę przyjść`, `idę do pracy`, `oni wiedzą`, `wy dacie odpowiedź`." }
  ],
  verbsPast: [
    { title: "Что здесь главное", body: "В прошедшем времени сначала смотри не на глагол, а на `кто говорит` и `какой род`. От этого зависит половина формы." },
    { title: "Как собирать форму", body: "Если это `я, мужчина` — чаще увидишь `-łem`; если `я, женщина` — `-łam`. Для множественного числа важно различать `robiliśmy` и `robiłyśmy`." },
    { title: "Где больше всего ошибок", body: "Чаще всего теряется род или путаются формы движения: `poszedłem / poszłam`, `przyszedłem / przyszłam`." }
  ],
  verbsFuture: [
    { title: "Сначала смысл, потом форма", body: "В будущем ты сначала решаешь: говорю о процессе или о результате. От этого зависит, будет `będę robić` или `zrobię`." },
    { title: "Две линии будущего", body: "Процесс = `będę + bezokolicznik / forma przeszła`. Результат = совершенный глагол без `będę`: `napiszę`, `kupię`, `przeczytam`." },
    { title: "Главная ловушка", body: "Нельзя смешивать две модели в одну, например `będę zrobię`. Это одна из самых частых ошибок на B1." }
  ],
  aspect: [
    { title: "Что такое aspekt по-человечески", body: "Это не “сложная грамматика”, а выбор между процессом и результатом. Ты либо показываешь, что действие длится/повторяется, либо что оно завершится или уже завершилось." },
    { title: "Как выбирать", body: "Слова `często`, `zwykle`, `teraz`, `długo` тянут к процессу. Слова `już`, `do końca`, `na jutro`, `w końcu` часто тянут к результату." },
    { title: "Что надо довести до автоматизма", body: "Учить парами: `czytać / przeczytać`, `pisać / napisać`, `robić / zrobić`, и сразу на примерах, а не в отрыве." }
  ],
  prepositions: [
    { title: "Как учить предлоги", body: "Не `do = в`, а `do + dopełniacz`; не `na = на`, а `na + biernik` или `na + miejscownik` в зависимости от смысла." },
    { title: "Нормальный порядок мысли", body: "Сначала задай вопрос: `куда?`, `где?`, `откуда?`, `с кем?`, `о чём?` — и только потом выбирай предлог и падеж." },
    { title: "Где чаще всего путаются", body: "В парах `do / w / na`, а ещё в предлоге `z`, потому что он может значить и `с кем`, и `откуда`." }
  ],
  numbersTime: [
    { title: "Зачем эта тема вообще важна", body: "Числа и время — это не “вспомогательная тема”, а повседневная речь: часы, даты, цены, адреса, планы, транспорт, работа." },
    { title: "Что надо видеть сразу", body: "После `1`, после `2-4`, после `5+` будут разные формы. То же касается времени: `która godzina?` и `o której?` — это разные модели." },
    { title: "Как учить полезно", body: "Не отдельно числа и отдельно часы, а через реальные блоки: `Spotkanie jest o ósmej`, `Bilet kosztuje dwadzieścia dwa złote`, `Za godzinę wychodzę`." }
  ],
  complexSentences: [
    { title: "Почему это уже B1", body: "На B1 мало назвать факт. Нужно объяснить причину, мнение, цель, условие. Для этого и нужны сложные предложения." },
    { title: "Как строить длинную мысль", body: "Начинай с простого каркаса: `Myślę, że...`, `bo...`, `dlatego...`, `żeby...`, `jeśli...`. Этого уже хватает для сильного ответа." },
    { title: "Главная ловушка", body: "Не надо пытаться сразу строить очень длинную фразу. Сильная речь — это 2–3 простые части, связанные правильно." }
  ],
  pronouns: [
    { title: "Почему местоимения мешают", body: "Потому что короткие формы выглядят похоже, но отвечают на разные вопросы: `mi`, `mnie`, `go`, `mu`, `jej`." },
    { title: "Как не путаться", body: "Не учи их списком. Сначала задавай вопрос `кому?`, `кого?`, `чего?`, а потом вспоминай форму: `daj mi`, `widzę go`, `nie ma mnie`." },
    { title: "Как закреплять", body: "Только в парах с глаголом: `pomóż mi`, `powiedz jej`, `znam go`, `potrzebuję ich`." }
  ],
  reflexiveSie: [
    { title: "Что делать с się", body: "Не пытайся учить `się` отдельно. Нужно учить целую конструкцию: `uczyć się`, `bać się`, `spotykać się`, `podobać się`." },
    { title: "Как мыслить", body: "Если глагол живёт с `się`, он меняет не только форму, но часто и логику управления: `bać się czegoś`, `podobać się komuś`." },
    { title: "Главная ловушка", body: "Люди часто теряют `się` или ставят его хаотично. Здесь надо довести до привычки готовую фразу." }
  ],
  comparisons: [
    { title: "Зачем сравнения нужны на B1", body: "Они делают речь точнее: ты уже не просто говоришь `dobry`, а сравниваешь, оцениваешь, аргументируешь." },
    { title: "Что учить", body: "Обычные модели, `naj-` и самые частые неправильные формы: `lepszy`, `gorszy`, `większy`, `mniejszy`." },
    { title: "Как использовать", body: "Лучше не отдельно слово, а мысль целиком: `Ten вариант jest wygodniejszy niż tamten`, `To było najlepsze rozwiązanie`." }
  ],
  modalVerbs: [
    { title: "Почему это практичная тема", body: "Модальные конструкции нужны в повседневной жизни постоянно: обязанности, разрешения, советы, запреты, планы." },
    { title: "Что помнить", body: "После `muszę`, `mogę`, `powinienem` обычно идёт bezokolicznik: `muszę iść`, `mogę wejść`, `powinienem zadzwonić`." },
    { title: "Где ошибка", body: "Часто человек после модального ставит уже спрягаемую форму. Здесь надо держать модель `модальный + инфинитив`." }
  ],
  impersonal: [
    { title: "Зачем нужны безличные формы", body: "Они важны для объявлений, правил, писем и официального тона. Это очень жизненный слой польского." },
    { title: "Как их понимать", body: "Это способ говорить нейтрально, без конкретного `я` или `ты`: `można`, `trzeba`, `należy`, `warto`." },
    { title: "Как строить фразу", body: "Обычно схема очень простая: `trzeba + bezokolicznik`, `można + bezokolicznik`, `warto + bezokolicznik`." }
  ],
  wordOrder: [
    { title: "Почему порядок слов пугает", body: "Потому что в польском он гибкий, но это не значит, что он хаотичный. Есть нейтральный естественный порядок, к которому всегда можно вернуться." },
    { title: "Базовая опора", body: "Начинай с прямой модели: `кто / тема -> глагол -> остальная информация`. Потом уже добавляй время, вопрос, `się`, местоимения." },
    { title: "Главные якоря", body: "`nie` обычно перед глаголом, `się` часто сразу после глагола, короткие местоимения любят устойчивые места: `podoba mi się`, `daj mi znać`." }
  ],
  b1Connectors: [
    { title: "Почему связки важны", body: "Связки делают из отдельных предложений нормальную речь уровня B1. Без них ответ кажется рубленым и детским." },
    { title: "Как использовать", body: "Бери не много, а точно: одна связка для причины, одна для противопоставления, одна для вывода — этого уже достаточно." },
    { title: "Практический каркас", body: "`Moim zdaniem...`, `ponieważ...`, `jednak...`, `oprócz tego...`, `podsumowując...` — уже даёт связный короткий ответ." }
  ]
};

function renderTables(topicKey) {
  const tables = ruleTables[topicKey] || [];
  return tables.map((table, index) => (
    <div key={index} style={{ marginTop: 12 }}>
      <h4>{table.title}</h4>
      <table style={styles.table}>
        <thead><tr>{table.headers.map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={styles.td}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  ));
}

function renderRuleSheets(topicKey) {
  const sheets = topicRuleSheets[topicKey] || [];
  return sheets.map((sheet, index) => (
    <div key={index} style={{ ...styles.note, marginTop: 10 }}>
      <strong>{sheet.title}</strong>
      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{sheet.body}</div>
    </div>
  ));
}

function genMascPlural() { return cap50(dict.mascPlural.map(([sg, pl, note]) => input(`${sg} →`, pl, note))); }
function genNonMascPlural() { return cap50(dict.nonMascPlural.map(([sg, pl]) => input(`${sg} →`, pl))); }
function genPluralAdjectives() { const items = []; dict.adjectives.forEach(([base, mascPl, nonMascPl]) => { dict.mascPlural.slice(0, 15).forEach(([sg, pl]) => items.push(input(`${base} ${sg} →`, `${mascPl} ${pl}`))); dict.nonMascPlural.slice(0, 15).forEach(([sg, pl]) => items.push(input(`${base} ${sg} →`, `${nonMascPl} ${pl}`))); }); return cap50(items); }
function genOniOne() { const items = []; dict.mascPlural.forEach(([, pl]) => items.push(choice(`___ to ${pl}`, ["oni", "one"], "oni"))); dict.nonMascPlural.forEach(([, pl]) => items.push(choice(`___ to ${pl}`, ["oni", "one"], "one"))); return cap50(items); }
function genPluralMistakes() { return cap50([input("To są dobre studenci", "to są dobrzy studenci"), input("To są polskie lekarze", "to są polscy lekarze"), input("To są wysokie mężczyźni", "to są wysocy mężczyźni"), input("To są nowe klienci", "to są nowi klienci"), input("To są młode chłopaki", "to są młodzi chłopaki"), input("To są duże pracownicy", "to są duzi pracownicy"), input("To są miłe nauczyciele", "to są mili nauczyciele"), input("To są stare sąsiedzi", "to są starzy sąsiedzi"), input("To są znane aktorzy", "to są znani aktorzy"), input("To są dobre profesorowie", "to są dobrzy profesorowie"), input("To są polscy kobiety", "to są polskie kobiety"), input("To są dobrzy książki", "to są dobre książki"), input("To są nowi samochody", "to są nowe samochody"), input("To są wysocy domy", "to są wysokie domy"), input("To są młodzi dzieci", "to są młode dzieci")]); }
function genAccusativeForms() {
  const items = [];
  const animateVerbs = ["Widzę", "Spotykam", "Znam", "Słyszę", "Pamiętam", "Odwiedzam"];
  const inanimateVerbs = ["Mam", "Kupuję", "Biorę", "Otwieram", "Czytam", "Wybieram"];
  const feminineVerbs = ["Kupuję", "Piję", "Widzę", "Czytam", "Piszę", "Zamawiam"];
  const pluralVerbs = ["Znam", "Widzę", "Spotykam", "Zapraszam", "Odwiedzam"];
  dict.biernik.animate.forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${animateVerbs[index % animateVerbs.length]} (${sg}).`, acc, "biernik: rodzaj męski żywotny")));
  dict.biernik.inanimate.forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${inanimateVerbs[index % inanimateVerbs.length]} (${sg}).`, acc, "biernik: rodzaj męski nieżywotny")));
  dict.biernik.feminine.forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${feminineVerbs[index % feminineVerbs.length]} (${sg}).`, acc, "biernik: rodzaj żeński")));
  dict.biernik.mascPlural.forEach(([nom, acc], index) => items.push(input(`Uzupełnij: ${pluralVerbs[index % pluralVerbs.length]} (${nom}).`, acc, "biernik liczby mnogiej męskoosobowej")));
  return cap50(items);
}
function genAccusativeAdjectives() {
  const items = [];
  dict.adjectives.forEach(([base, , , mascAcc, femAcc]) => {
    dict.biernik.animate.slice(0, 8).forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${["Widzę", "Spotykam", "Odwiedzam", "Zapraszam"][index % 4]} (${base} ${sg}).`, `${mascAcc} ${acc}`)));
    dict.biernik.feminine.slice(0, 8).forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${["Kupuję", "Piję", "Czytam", "Biorę"][index % 4]} (${base} ${sg}).`, `${femAcc} ${acc}`)));
    dict.biernik.inanimate.slice(0, 8).forEach(([sg, acc], index) => items.push(input(`Uzupełnij: ${["Mam", "Kupuję", "Wybieram", "Otwieram"][index % 4]} (${base} ${sg}).`, `${base} ${acc}`)));
  });
  return cap50(items);
}

function genAccusativeVariety() {
  return cap50([
    input("Uzupełnij: Codziennie oglądam (serial).", "serial"),
    input("Uzupełnij: W restauracji zamawiam (zupa pomidorowa).", "zupę pomidorową"),
    input("Uzupełnij: Rano piję (mocna kawa).", "mocną kawę"),
    input("Uzupełnij: Wieczorem czytam (interesująca książka).", "interesującą książkę"),
    input("Uzupełnij: W sklepie wybieram (nowy telefon).", "nowy telefon"),
    input("Uzupełnij: Na dworcu kupuję (bilet miesięczny).", "bilet miesięczny"),
    input("Uzupełnij: Jutro odwiedzam (stary kolega).", "starego kolegę"),
    input("Uzupełnij: Na zdjęciu widzę (małe dziecko).", "małe dziecko"),
    input("Uzupełnij: Szef zaprasza (nowi pracownicy).", "nowych pracowników"),
    input("Uzupełnij: Po pracy spotykam (miły sąsiad).", "miłego sąsiada"),
    input("Uzupełnij: Na lekcji słyszę (ważne pytanie).", "ważne pytanie"),
    input("Uzupełnij: W domu otwieram (duże okno).", "duże okno"),
    input("Uzupełnij: W aptece biorę (tańszy lek).", "tańszy lek"),
    input("Uzupełnij: Na uczelni znam (dobrzy profesorowie).", "dobrych profesorów"),
    input("Uzupełnij: W weekend oglądam (ciekawy film).", "ciekawy film"),
    input("Uzupełnij: W urzędzie pokazuję (ważny dokument).", "ważny dokument"),
    input("Uzupełnij: Na obiad gotuję (smaczna zupa).", "smaczną zupę"),
    input("Uzupełnij: Wieczorem piszę (krótka wiadomość).", "krótką wiadomość"),
    input("Uzupełnij: W pracy pamiętam (nowy termin).", "nowy termin"),
    input("Uzupełnij: Na ulicy mijam (młody turysta).", "młodego turystę"),
    choice("Które zdanie jest poprawne?", ["Rano piję gorącą herbatę.", "Rano piję gorąca herbata.", "Rano piję gorącej herbaty."], "Rano piję gorącą herbatę."),
    choice("Które zdanie jest poprawne?", ["Widzę nowego klienta.", "Widzę nowy klient.", "Widzę nowemu klientowi."], "Widzę nowego klienta."),
    choice("Które zdanie jest poprawne?", ["Kupuję świeży chleb.", "Kupuję świeżego chleba.", "Kupuję świeżym chlebem."], "Kupuję świeży chleb."),
    choice("Które zdanie jest poprawne?", ["Spotykam dobrych znajomych.", "Spotykam dobrzy znajomi.", "Spotykam dobrym znajomym."], "Spotykam dobrych znajomych."),
    free("Napisz 4 zdania w bierniku z różnymi czasownikami. Użyj przynajmniej: kupować, oglądać, spotykać, zamawiać.", "Не повторяй один и тот же глагол. Покажи разные типы дополнения: человека, вещь, еду, документ.")
  ]);
}
function genGenitiveVariety() {
  return cap50([
    input("Uzupełnij: Rano słucham (polskie radio).", "polskiego radia"),
    input("Uzupełnij: W nowym mieście szukam (spokojne mieszkanie).", "spokojnego mieszkania"),
    input("Uzupełnij: Po pracy potrzebuję (chwila spokoju).", "chwili spokoju"),
    input("Uzupełnij: W kuchni używam (duży nóż).", "dużego noża"),
    input("Uzupełnij: Dziś nie ma (wolny termin).", "wolnego terminu"),
    input("Uzupełnij: Na kursie uczę się (polska wymowa).", "polskiej wymowy"),
    input("Uzupełnij: Wieczorem nie mam (siła).", "siły"),
    input("Uzupełnij: W sklepie szukam (świeży chleb).", "świeżego chleba"),
    input("Uzupełnij: W pracy potrzebuję (dobry komputer).", "dobrego komputera"),
    input("Uzupełnij: W tej dzielnicy nie ma (duży park).", "dużego parku"),
    choice("Które zdanie jest poprawne?", ["Potrzebuję nowego dokumentu.", "Potrzebuję nowy dokument.", "Potrzebuję nowemu dokumentowi."], "Potrzebuję nowego dokumentu."),
    choice("Które zdanie jest poprawne?", ["Nie ma wolnego miejsca.", "Nie ma wolne miejsce.", "Nie ma wolnym miejscem."], "Nie ma wolnego miejsca."),
    free("Napisz 4 zdania w dopełniaczu. Użyj przynajmniej: nie ma, potrzebuję, szukam, używam.", "Пусть в предложениях будут разные ситуации: дом, работа, магазин, учёба.")
  ]);
}
function genDativeVariety() {
  return cap50([
    input("Uzupełnij: Tłumaczę zadanie (nowy student).", "nowemu studentowi"),
    input("Uzupełnij: Wysyłam wiadomość (moja siostra).", "mojej siostrze"),
    input("Uzupełnij: Pokazuję drogę (starsza pani).", "starszej pani"),
    input("Uzupełnij: Daję dokument (kierownik).", "kierownikowi"),
    input("Uzupełnij: Pomagam (małe dziecko).", "małemu dziecku"),
    input("Uzupełnij: Mówię prawdę (dobry kolega).", "dobremu koledze"),
    input("Uzupełnij: Na lekcji odpowiadam (nauczyciel).", "nauczycielowi"),
    input("Uzupełnij: Tłumaczę problem (moja mama).", "mojej mamie"),
    choice("Które zdanie jest poprawne?", ["Pomagam starszemu sąsiadowi.", "Pomagam starszego sąsiada.", "Pomagam starszym sąsiadem."], "Pomagam starszemu sąsiadowi."),
    choice("Które zdanie jest poprawne?", ["Daję książkę mojej koleżance.", "Daję książkę moją koleżankę.", "Daję książkę mojej koleżanką."], "Daję książkę mojej koleżance."),
    free("Napisz 4 zdania w celowniku. Użyj przynajmniej: dawać, pomagać, tłumaczyć, wysyłać.", "Покажи разные адресаты: человек, родственник, коллега, ребёнок.")
  ]);
}
function genLocativeVariety() {
  return cap50([
    input("Uzupełnij: Mieszkam w (spokojna dzielnica).", "spokojnej dzielnicy"),
    input("Uzupełnij: Rozmawiamy o (ważny egzamin).", "ważnym egzaminie"),
    input("Uzupełnij: Czytam o (nowa praca).", "nowej pracy"),
    input("Uzupełnij: Myślę o (krótki urlop).", "krótkim urlopie"),
    input("Uzupełnij: Jestem na (długie spotkanie).", "długim spotkaniu"),
    input("Uzupełnij: Mówię o (trudny problem).", "trudnym problemie"),
    input("Uzupełnij: Byłem w (mały sklep).", "małym sklepie"),
    input("Uzupełnij: Jestem po (ciężki dzień).", "ciężkim dniu"),
    choice("Które zdanie jest poprawne?", ["Jestem w nowym biurze.", "Jestem w nowe biuro.", "Jestem w nowego biura."], "Jestem w nowym biurze."),
    choice("Które zdanie jest poprawne?", ["Myślę o ważnym terminie.", "Myślę o ważny termin.", "Myślę o ważnego terminu."], "Myślę o ważnym terminie."),
    free("Napisz 4 zdania w miejscowniku. Użyj przynajmniej: w, na, o, po.", "Пусть одно предложение будет о месте, одно о встрече, одно о теме разговора, одно о дне.")
  ]);
}
function genPresentVariety() {
  return cap50([
    input("Uzupełnij: Rano ja (pić) kawę przed pracą.", "piję"),
    input("Uzupełnij: Wieczorem my (oglądać) serial po kolacji.", "oglądamy"),
    input("Uzupełnij: W pracy oni (mówić) po polsku i po angielsku.", "mówią"),
    input("Uzupełnij: W domu ty (robić) zakupy online.", "robisz"),
    input("Uzupełnij: Na kursie wy (uczyć się) nowych słów.", "uczycie się"),
    input("Uzupełnij: Codziennie on (czytać) wiadomości rano.", "czyta"),
    input("Uzupełnij: Ja często (mieć) mało czasu po pracy.", "mam"),
    input("Uzupełnij: My zwykle (mieszkać) blisko centrum.", "mieszkamy"),
    choice("Które zdanie jest poprawne?", ["Oni pracują w biurze.", "Oni pracuje w biurze.", "Oni pracujesz w biurze."], "Oni pracują w biurze."),
    choice("Które zdanie jest poprawne?", ["Ty uczysz się codziennie.", "Ty uczę się codziennie.", "Ty uczymy się codziennie."], "Ty uczysz się codziennie."),
    free("Napisz 5 zdań w czasie teraźniejszym o swoim dniu. Użyj różnych czasowników.", "Не повторяй всё время `być` и `mieć`. Добавь хотя бы 4 разных глагола.")
  ]);
}
function genComplexSentenceVariety() {
  return cap50([
    input("Uzupełnij: Zostaję w domu, ___ jestem zmęczony.", "bo"),
    input("Uzupełnij: Uczę się codziennie, ___ chcę zdać egzamin.", "bo"),
    input("Uzupełnij: Mam dziś dużo pracy, ___ oddzwonię wieczorem.", "dlatego"),
    input("Uzupełnij: Zabiorę dokumenty, ___ złożyć wniosek.", "żeby"),
    input("Uzupełnij: ___ będę mieć czas, pójdę na spacer.", "jeśli"),
    input("Uzupełnij: Wiem, ___ to jest ważne.", "że"),
    choice("Które zdanie jest poprawne?", ["Nie przyszedłem, bo byłem chory.", "Nie przyszedłem, dlatego byłem chory.", "Nie przyszedłem, żeby byłem chory."], "Nie przyszedłem, bo byłem chory."),
    choice("Które zdanie jest poprawne?", ["Uczę się, żeby lepiej mówić.", "Uczę się, dlatego lepiej mówić.", "Uczę się, bo lepiej mówić."], "Uczę się, żeby lepiej mówić."),
    free("Napisz 4 zdania złożone. Użyj przynajmniej: bo, dlatego, żeby, jeśli.", "Каждую связку используй в отдельном предложении, не повторяй одну и ту же модель.")
  ]);
}
function genPluralVariety() {
  return cap50([
    input("Uzupełnij: To są (nowy student).", "nowi studenci"),
    input("Uzupełnij: To są (miła kobieta).", "miłe kobiety"),
    input("Uzupełnij: W biurze pracują (dobry specjaliści).", "dobrzy specjaliści"),
    input("Uzupełnij: Na stole leżą (ważny dokumenty).", "ważne dokumenty"),
    input("Uzupełnij: W naszej grupie są (polski nauczyciele).", "polscy nauczyciele"),
    input("Uzupełnij: Na zdjęciu widać (małe dzieci).", "małe dzieci"),
    choice("Które zdanie jest poprawne?", ["To są nowi klienci.", "To są nowe klienci.", "To jest nowi klienci."], "To są nowi klienci."),
    choice("Które zdanie jest poprawne?", ["To są piękne ulice.", "To są piękni ulice.", "To jest piękne ulice."], "To są piękne ulice."),
    free("Napisz 4 zdania w liczbie mnogiej. Użyj dwóch grup męskoosobowych i dwóch niemęskoosobowych.", "Пусть будут люди, вещи и хотя бы одно прилагательное в каждом предложении.")
  ]);
}
function genPrepositionVariety() {
  return cap50([
    input("Uzupełnij: Po pracy idę ___ siłownię.", "na"),
    input("Uzupełnij: Rano wracam ___ sklepu z pieczywem.", "ze"),
    input("Uzupełnij: W weekend jadę ___ rodziny.", "do"),
    input("Uzupełnij: Rozmawiam ___ lekarzem o wynikach.", "z"),
    input("Uzupełnij: Czekam ___ ciebie przed wejściem.", "na"),
    input("Uzupełnij: Czytałem artykuł ___ nowej pracy.", "o"),
    input("Uzupełnij: Prezent jest ___ mojego brata.", "dla"),
    input("Uzupełnij: Spotkajmy się ___ dworcu o ósmej.", "na"),
    choice("Które zdanie jest poprawne?", ["Jadę do centrum autobusem.", "Jadę w centrum autobusem.", "Jadę z centrum autobusem."], "Jadę do centrum autobusem."),
    choice("Które zdanie jest poprawne?", ["Jestem w pracy do szesnastej.", "Jestem do pracy do szesnastej.", "Jestem z pracy do szesnastej."], "Jestem w pracy do szesnastej."),
    free("Napisz 5 zdań z przyimkami. Użyj przynajmniej: do, w, na, z, o.", "Пусть это будут реальные бытовые фразы: дорога, работа, встреча, разговор, место.")
  ]);
}
function genComparisonVariety() {
  return cap50([
    input("Uzupełnij: Ten kurs jest (dobry) niż tamten.", "lepszy"),
    input("Uzupełnij: To było (trudne zadanie) w całym teście.", "najtrudniejsze zadanie"),
    input("Uzupełnij: Mieszkanie w centrum jest (drogie) od mieszkania na obrzeżach.", "droższe"),
    input("Uzupełnij: Dziś czuję się (zły) niż wczoraj.", "gorzej"),
    input("Uzupełnij: To rozwiązanie jest (łatwe) dla początkujących.", "łatwiejsze"),
    choice("Które zdanie jest poprawne?", ["Ten tekst jest łatwiejszy niż tamten.", "Ten tekst jest łatwy niż tamten.", "Ten tekst jest łatwiejszy od tamten."], "Ten tekst jest łatwiejszy niż tamten."),
    choice("Które zdanie jest poprawne?", ["To był najlepszy moment dnia.", "To był bardziej najlepszy moment dnia.", "To był najlepszym moment dnia."], "To był najlepszy moment dnia."),
    free("Napisz 4 zdania z porównaniem. Użyj: lepszy, trudniejszy, najważniejszy, tak samo ... jak.", "Сравни курс, работу, день и один свой выбор.")
  ]);
}
function genFutureVariety() {
  return cap50([
    input("Uzupełnij: Jutro po pracy (ja odpoczywać) w domu.", "będę odpoczywać"),
    input("Uzupełnij: Za godzinę (my wyjść) na spotkanie.", "wyjdziemy"),
    input("Uzupełnij: W weekend (oni odwiedzić) rodzinę.", "odwiedzą"),
    input("Uzupełnij: Wieczorem (ona oglądać) serial.", "będzie oglądać"),
    input("Uzupełnij: W przyszłym miesiącu (ty zmienić) pracę.", "zmienisz"),
    input("Uzupełnij: Jutro rano (ja zrobić) zakupy.", "zrobię"),
    choice("Które zdanie mówi o procesie?", ["Wieczorem będę czytać książkę.", "Wieczorem przeczytam książkę."], "Wieczorem będę czytać książkę."),
    choice("Które zdanie mówi o rezultacie?", ["Do jutra napiszę raport.", "Do jutra będę pisać raport."], "Do jutra napiszę raport."),
    free("Napisz 4 zdania o przyszłym tygodniu. Użyj dwóch form procesu i dwóch form rezultatu.", "Пусть будут планы про работу, дом, учёбу и свободное время.")
  ]);
}
function genIrregularVerbsVariety() {
  return cap50([
    input("Uzupełnij: Codziennie rano ja (jeść) śniadanie.", "jem"),
    input("Uzupełnij: Dziś my (jechać) do centrum autobusem.", "jedziemy"),
    input("Uzupełnij: Wieczorem oni (iść) na spacer.", "idą"),
    input("Uzupełnij: Teraz ty (mieć) chwilę czasu?", "masz"),
    input("Uzupełnij: Na lekcji wy (wiedzieć) już dużo więcej.", "wiecie"),
    input("Uzupełnij: W pracy ona (móc) pomóc klientowi.", "może"),
    input("Uzupełnij: Ja naprawdę (chcieć) zdać ten egzamin.", "chcę"),
    input("Uzupełnij: W sklepie my (brać) tylko świeże warzywa.", "bierzemy"),
    choice("Które zdanie jest poprawne?", ["Ja wiem, co robić.", "Ja wiedzę, co robić.", "Ja wiedzą, co robić."], "Ja wiem, co robić."),
    choice("Które zdanie jest poprawne?", ["Oni mają dziś spotkanie.", "Oni ma dziś spotkanie.", "Oni masz dziś spotkanie."], "Oni mają dziś spotkanie."),
    free("Napisz 5 zdań z nieregularnymi czasownikami. Użyj przynajmniej: być, mieć, iść, móc, wiedzieć.", "Каждое предложение с другим глаголом и нормальным бытовым контекстом.")
  ]);
}
function genAspectVariety() {
  return cap50([
    choice("Wczoraj długo ___ raport, ale go nie skończyłem.", ["pisałem", "napisałem"], "pisałem"),
    choice("Do jutra ___ cały raport.", ["napiszę", "będę pisać"], "napiszę"),
    choice("Codziennie ___ polskich podcastów w drodze do pracy.", ["słucham", "posłucham"], "słucham"),
    choice("Wieczorem ___ ten odcinek do końca.", ["obejrzę", "oglądam"], "obejrzę"),
    input("Uzupełnij: Teraz (czytać) ciekawy artykuł.", "czytam"),
    input("Uzupełnij: W końcu (przeczytać) całą książkę.", "przeczytałem"),
    input("Uzupełnij: Na kursie często (powtarzać) nowe słowa.", "powtarzam"),
    input("Uzupełnij: Jutro rano (powtórzyć) cały materiał.", "powtórzę"),
    free("Napisz 4 zdania z aspektem. Dwa o procesie i dwa o rezultacie.", "Используй пары вроде `czytać/przeczytać`, `pisać/napisać`, `robić/zrobić`.")
  ]);
}
function genNumberTimeVariety() {
  return cap50([
    input("Uzupełnij: Spotkanie zaczyna się o (8:00).", "o ósmej"),
    input("Uzupełnij: Bilet kosztuje (22 zł).", "dwadzieścia dwa złote"),
    input("Uzupełnij: Mam tylko (5 gr).", "pięć groszy"),
    input("Uzupełnij: Lekcja kończy się o (17:00).", "o siedemnastej"),
    input("Uzupełnij: Za (1 godzina) wychodzę z domu.", "za godzinę"),
    input("Uzupełnij: Pociąg odjeżdża o (14:00).", "o czternastej"),
    choice("Które zdanie jest poprawne?", ["Mam trzy złote i pięć groszy.", "Mam trzy złotych i pięć grosze.", "Mam trzy złoty i pięć grosz."], "Mam trzy złote i pięć groszy."),
    choice("Które zdanie jest poprawne?", ["Spotkanie jest o dziewiątej.", "Spotkanie jest w dziewiątej.", "Spotkanie jest na dziewiątej."], "Spotkanie jest o dziewiątej."),
    free("Napisz 4 zdania z godziną, ceną i czasem. Użyj przynajmniej: o..., za..., złote/złotych.", "Сделай это про реальную жизнь: встреча, магазин, дорога, курс.")
  ]);
}
function genModalVariety() {
  return cap50([
    input("Uzupełnij: W urzędzie ___ mieć paszport przy sobie.", "trzeba"),
    input("Uzupełnij: Dziś nie ___ przyjść wcześniej, bo pracuję do późna.", "mogę"),
    input("Uzupełnij: Jeśli źle się czujesz, ___ odpocząć.", "powinieneś"),
    input("Uzupełnij: Przed wysłaniem formularza ___ sprawdzić dane.", "musisz"),
    input("Uzupełnij: W tym miejscu nie ___ palić.", "wolno"),
    choice("Które zdanie jest poprawne?", ["Powinienem zadzwonić jutro rano.", "Powinienem dzwonię jutro rano.", "Powinienem zadzwoniłem jutro rano."], "Powinienem zadzwonić jutro rano."),
    choice("Które zdanie jest poprawne?", ["Można zapłacić kartą.", "Można płacę kartą.", "Można zapłaciłem kartą."], "Można zapłacić kartą."),
    free("Napisz 4 zdania z modalnymi konstrukcjami. Użyj: muszę, mogę, powinienem, nie wolno.", "Пусть это будут реальные правила, планы и обязанности.")
  ]);
}
function genImpersonalVariety() {
  return cap50([
    input("Uzupełnij: W tym formularzu ___ wpisać numer paszportu.", "trzeba"),
    input("Uzupełnij: Warto ___ krótkie notatki po lekcji.", "robić"),
    input("Uzupełnij: W sklepie ___ płacić kartą i gotówką.", "można"),
    input("Uzupełnij: Przed wizytą u lekarza ___ zabrać dokument.", "należy"),
    input("Uzupełnij: O tym problemie często ___ w wiadomościach.", "mówi się"),
    choice("Które zdanie jest poprawne?", ["Trzeba poczekać na swoją kolej.", "Trzeba czekam na swoją kolej.", "Trzeba poczekałem na swoją kolej."], "Trzeba poczekać na swoją kolej."),
    choice("Które zdanie jest poprawne?", ["Warto czytać krótkie teksty codziennie.", "Warto czytam krótkie teksty codziennie.", "Warto czytałem krótkie teksty codziennie."], "Warto czytać krótkie teksty codziennie."),
    free("Napisz 4 zdania z bezosobowymi formami. Użyj: można, trzeba, należy, warto.", "Сделай это как советы и правила для учёбы или жизни в Польше.")
  ]);
}
function genWordOrderVariety() {
  return cap50([
    input("Ułóż naturalnie: jutro / do urzędu / idę / rano", "jutro rano idę do urzędu"),
    input("Ułóż naturalnie: się / z kolegą / spotykam / dziś", "dziś spotykam się z kolegą"),
    input("Ułóż naturalnie: nie / mam / dziś / czasu", "dziś nie mam czasu"),
    input("Ułóż naturalnie: o wynik / zapytać / chciałbym", "chciałbym zapytać o wynik"),
    choice("Które zdanie brzmi naturalniej?", ["Wieczorem będę czytać książkę.", "Będę książkę czytać wieczorem ja."], "Wieczorem będę czytać książkę."),
    choice("Które zdanie brzmi naturalniej?", ["Podoba mi się ten pomysł.", "Ten pomysł mi się podoba bardzo jest."], "Podoba mi się ten pomysł."),
    free("Napisz 4 zdania w naturalnym szyku. Użyj: dziś, jutro, nie, się.", "Сделай одно утверждение, один вопрос, одну фразу с `się` и одну с `nie`.")
  ]);
}
function genPresentConjugationGuide() {
  return [
    note(
      "Как учить спряжение, чтобы оно работало",
      "Сначала всегда ищи 3 вещи: `инфинитив`, `группу`, `лицо`.\n\nЕсли ты видишь только слово `pracować`, этого ещё мало. Нужно сразу привязывать его к модели: `pracuję, pracujesz, pracuje, pracujemy, pracujecie, pracują`.\n\nСамый полезный порядок такой:\n1. определить группу\n2. посмотреть, что происходит с основой\n3. подставить окончания по лицам\n4. сразу сказать готовую фразу"
    ),
    note(
      "Группа 1: -ować / -ywać / -iwać",
      "Для этой группы характерна модель `-uję, -ujesz, -uje, -ujemy, -ujecie, -ują`.\n\nГлавный сигнал: в инфинитиве есть `-ować`, а в спряжении кусок `-owa-` обычно меняется на `-uj-`.\n\n`pracować -> pracuję, pracujesz, pracuje, pracujemy, pracujecie, pracują`\n`pokazywać -> pokazuję, pokazujesz, pokazuje, pokazujemy, pokazujecie, pokazują`\n`potakiwać -> potakuję, potakujesz, potakuje, potakujemy, potakujecie, potakują`\n\nЭту группу удобно запомнить через форму `ty`: если слышишь `pracujesz`, почти наверняка это эта модель."
    ),
    note(
      "Группа 2: -ać с моделью -am / -asz",
      "Очень частая разговорная группа. Для неё характерны окончания `-am, -asz, -a, -amy, -acie, -ają`.\n\n`mieszkać -> mieszkam, mieszkasz, mieszka, mieszkamy, mieszkacie, mieszkają`\n`czekać -> czekam, czekasz, czeka, czekamy, czekacie, czekają`\n`czytać -> czytam, czytasz, czyta, czytamy, czytacie, czytają`\n`znać -> znam, znasz, zna, znamy, znacie, znają`\n\nЭто одна из самых полезных моделей для быта, потому что в неё попадает много частых глаголов."
    ),
    note(
      "Группа 3: -ić / -yć / часть -eć и некоторые особые -ać",
      "Для этой группы характерны окончания типа `-ę, -isz/-ysz, -i/-y, -imy/-ymy, -icie/-ycie, -ą`.\n\n`mówić -> mówię, mówisz, mówi, mówimy, mówicie, mówią`\n`prosić -> proszę, prosisz, prosi, prosimy, prosicie, proszą`\n`uczyć (się) -> uczę (się), uczysz (się), uczy (się), uczymy (się), uczycie (się), uczą (się)`\n`milczeć -> milczę, milczysz, milczy, milczymy, milczycie, milczą`\n`widzieć -> widzę, widzisz, widzi, widzimy, widzicie, widzą`\n\nЗдесь уже чаще бывают чередования в основе, поэтому форму `ja` и `ty` лучше запоминать сразу парой."
    ),
    note(
      "Глаголы с чередованием основы",
      "Есть частые глаголы, где меняются не только окончания, но и сам корень. Их надо учить как готовые наборы.\n\n`brać -> biorę, bierzesz, bierze, bierzemy, bierzecie, biorą`\n`nieść -> niosę, niesiesz, niesie, niesiemy, niesiecie, niosą`\n`wieźć -> wiozę, wioziesz, wiezie, wieziemy, wieziecie, wiozą`\n`pisać -> piszę, piszesz, pisze, piszemy, piszecie, piszą`\n`piec -> piekę, pieczesz, piecze, pieczemy, pieczecie, pieką`\n`dać -> dam, dasz, da, damy, dacie, dadzą`\n\nИменно эти глаголы чаще всего ломают автоматизм, если их не выучить как отдельную модель."
    ),
    note(
      "Частотные неправильные формы, которые надо знать в лицо",
      "`być -> jestem, jesteś, jest, jesteśmy, jesteście, są`\n`mieć -> mam, masz, ma, mamy, macie, mają`\n`iść -> idę, idziesz, idzie, idziemy, idziecie, idą`\n`jechać -> jadę, jedziesz, jedzie, jedziemy, jedziecie, jadą`\n`jeść -> jem, jesz, je, jemy, jecie, jedzą`\n`móc -> mogę, możesz, może, możemy, możecie, mogą`\n`wiedzieć -> wiem, wiesz, wie, wiemy, wiecie, wiedzą`\n\nИх лучше учить не по одному слову, а сразу в коротких живых фразах."
    )
  ];
}
function genPresentConjugationDrills() {
  return cap50([
    input("Uzupełnij model: pracować -> ja pracuję, ty ___, my pracujemy.", "pracujesz"),
    input("Uzupełnij model: mieszkać -> ja mieszkam, ty ___, oni ___.", ["mieszkasz", "mieszkają"]),
    input("Uzupełnij model: mówić -> ja mówię, ty ___, wy ___.", ["mówisz", "mówicie"]),
    input("Uzupełnij model: prosić -> ja proszę, ty ___, oni ___.", ["prosisz", "proszą"]),
    input("Uzupełnij model: widzieć -> ja widzę, ty ___, my ___.", ["widzisz", "widzimy"]),
    input("Uzupełnij model: brać -> ja biorę, ty ___, oni ___.", ["bierzesz", "biorą"]),
    input("Uzupełnij model: nieść -> ja niosę, ty ___, my ___.", ["niesiesz", "niesiemy"]),
    input("Uzupełnij model: pisać -> ja piszę, ty ___, wy ___.", ["piszesz", "piszecie"]),
    input("Uzupełnij model: dać -> ja dam, ty ___, oni ___.", ["dasz", "dadzą"]),
    choice("Która grupa pasuje do `pracować`?", ["-uję / -ujesz / -ują", "-am / -asz / -ają", "-ę / -isz / -ą"], "-uję / -ujesz / -ują"),
    choice("Która grupa pasuje do `mieszkać`?", ["-am / -asz / -ają", "-uję / -ujesz / -ują", "-ę / -isz / -ą"], "-am / -asz / -ają"),
    choice("Która grupa pasuje do `mówić`?", ["-ę / -isz / -ą", "-am / -asz / -ają", "-uję / -ujesz / -ują"], "-ę / -isz / -ą"),
    choice("Które zdanie jest poprawne?", ["Ty pracujesz w biurze.", "Ty pracuję w biurze.", "Ty pracujasz w biurze."], "Ty pracujesz w biurze."),
    choice("Które zdanie jest poprawne?", ["My mieszkamy w Krakowie.", "My mieszkim w Krakowie.", "My mieszkają w Krakowie."], "My mieszkamy w Krakowie."),
    choice("Które zdanie jest poprawne?", ["Oni mówią po polsku.", "Oni mówi po polsku.", "Oni mówie po polsku."], "Oni mówią po polsku."),
    choice("Które zdanie jest poprawne?", ["Ja biorę dokument.", "Ja bierzę dokument.", "Ja bierzę dokument."], "Ja biorę dokument."),
    choice("Które zdanie jest poprawne?", ["Wy piszecie maila.", "Wy piszacie maila.", "Wy piszą maila."], "Wy piszecie maila."),
    choice("Które zdanie jest poprawne?", ["Oni dadzą odpowiedź jutro.", "Oni dajądzą odpowiedź jutro.", "Oni dają odpowiedź jutro."], "Oni dadzą odpowiedź jutro."),
    free("Napisz 8 zdań: po dwa z grupą `-ować`, `-ać`, `-ić/-yć` i dwa z czasownikami z чередованием.", "Используй реальные глаголы и подпиши себе мысленно, к какой модели относится каждый.")
  ]);
}
function genGenitive() {
  const verbs = [
    ["Uzupełnij: Nie mam", "negacja + dopełniacz"],
    ["Uzupełnij: Nie ma", "negacja + dopełniacz"],
    ["Uzupełnij: Szukam", "czasownik wymaga dopełniacza"],
    ["Uzupełnij: Potrzebuję", "czasownik wymaga dopełniacza"],
    ["Uzupełnij: Używam", "czasownik wymaga dopełniacza"],
    ["Uzupełnij: Słucham", "czasownik wymaga dopełniacza"],
    ["Uzupełnij: Uczę się", "czasownik wymaga dopełniacza"]
  ];
  const items = [];
  dict.genitive.forEach(([sg, gen]) => verbs.forEach(([v, hint]) => items.push(input(`${v} (${sg}).`, gen, hint))));
  return cap50(items);
}
function genDative() {
  const verbs = [
    ["Uzupełnij: Daję prezent", "komu? = celownik"],
    ["Uzupełnij: Pomagam", "komu? = celownik"],
    ["Uzupełnij: Mówię prawdę", "komu? = celownik"],
    ["Uzupełnij: Pokazuję drogę", "komu? = celownik"],
    ["Uzupełnij: Tłumaczę zadanie", "komu? = celownik"],
    ["Uzupełnij: Wysyłam wiadomość", "komu? = celownik"]
  ];
  const items = [];
  dict.dative.forEach(([sg, dat]) => verbs.forEach(([v, hint]) => items.push(input(`${v} (${sg}).`, dat, hint))));
  return cap50(items);
}
function genInstrumental() {
  const items = [];
  const contexts = ["Idę z", "Jestem", "Rozmawiam z", "Interesuję się", "Jadę z"];
  dict.instrumental.forEach(([sg, ins], index) => {
    items.push(input(`Uzupełnij: ${contexts[index % contexts.length]} (${sg}).`, ins));
    items.push(input(`Uzupełnij: ${contexts[(index + 1) % contexts.length]} (${sg}).`, ins));
  });
  return cap50(items);
}
function genLocative() {
  const items = [];
  const contexts = [
    (sg) => `Uzupełnij: Jestem w (${sg}).`,
    (sg) => `Uzupełnij: Myślę o (${sg}).`,
    (sg) => `Uzupełnij: Rozmawiam o (${sg}).`,
    (sg) => `Uzupełnij: Czytam o (${sg}).`,
    (sg) => `Uzupełnij: Mówię o (${sg}).`
  ];
  dict.locative.forEach(([sg, loc], index) => {
    items.push(input(contexts[index % contexts.length](sg), loc));
    items.push(input(contexts[(index + 2) % contexts.length](sg), loc));
  });
  return cap50(items);
}
function genPresent() {
  const persons = ["ja", "ty", "on", "my", "wy", "oni"];
  const items = [];
  const contexts = [
    (person, verb) => `Uzupełnij formę: ${person} (${verb}) codziennie rano.`,
    (person, verb) => `Uzupełnij formę: ${person} (${verb}) po pracy.`,
    (person, verb) => `Uzupełnij formę: ${person} (${verb}) w domu.`,
    (person, verb) => `Uzupełnij formę: ${person} (${verb}) po polsku.`
  ];
  dict.present.forEach(([verb, forms]) => forms.forEach((form, i) => items.push(input(contexts[(i + verb.length) % contexts.length](persons[i], verb), form))));
  return cap50(items);
}
function genIrregularVerbs() {
  const verbs = [
    ["być", ["jestem", "jesteś", "jest", "jesteśmy", "jesteście", "są"]],
    ["mieć", ["mam", "masz", "ma", "mamy", "macie", "mają"]],
    ["iść", ["idę", "idziesz", "idzie", "idziemy", "idziecie", "idą"]],
    ["jechać", ["jadę", "jedziesz", "jedzie", "jedziemy", "jedziecie", "jadą"]],
    ["jeść", ["jem", "jesz", "je", "jemy", "jecie", "jedzą"]],
    ["móc", ["mogę", "możesz", "może", "możemy", "możecie", "mogą"]],
    ["chcieć", ["chcę", "chcesz", "chce", "chcemy", "chcecie", "chcą"]],
    ["wiedzieć", ["wiem", "wiesz", "wie", "wiemy", "wiecie", "wiedzą"]],
    ["brać", ["biorę", "bierzesz", "bierze", "bierzemy", "bierzecie", "biorą"]],
    ["dać", ["dam", "dasz", "da", "damy", "dacie", "dadzą"]]
  ];
  const persons = ["ja", "ty", "on", "my", "wy", "oni"];
  return cap50(verbs.flatMap(([verb, forms]) => forms.map((form, index) => input(`${persons[index]} (${verb})`, form))));
}
function genPast() {
  const base = [["Uzupełnij formę: ja, mężczyzna (robić) wczoraj wieczorem.", "robiłem"], ["Uzupełnij formę: ja, kobieta (robić) wczoraj wieczorem.", "robiłam"], ["Uzupełnij formę: ty, mężczyzna (robić) w domu.", "robiłeś"], ["Uzupełnij formę: ty, kobieta (robić) w domu.", "robiłaś"], ["Uzupełnij formę: on (robić) zadanie.", "robił"], ["Uzupełnij formę: ona (robić) zakupy.", "robiła"], ["Uzupełnij formę: my, mężczyźni (robić) raport.", "robiliśmy"], ["Uzupełnij formę: my, kobiety (robić) kolację.", "robiłyśmy"], ["Uzupełnij formę: wy, mężczyźni (robić) to razem.", "robiliście"], ["Uzupełnij formę: wy, kobiety (robić) to razem.", "robiłyście"], ["Uzupełnij formę: oni (robić) projekt.", "robili"], ["Uzupełnij formę: one (robić) zdjęcia.", "robiły"], ["Uzupełnij formę: ja, mężczyzna (być) w pracy.", "byłem"], ["Uzupełnij formę: ja, kobieta (być) w pracy.", "byłam"], ["Uzupełnij formę: ja, mężczyzna (pójść) do sklepu.", "poszedłem"], ["Uzupełnij formę: ja, kobieta (pójść) do sklepu.", "poszłam"], ["Uzupełnij formę: ja, mężczyzna (wrócić) późno.", "wróciłem"], ["Uzupełnij formę: ja, kobieta (wrócić) późno.", "wróciłam"]];
  return cap50(base.map(([q, a]) => input(q, a)));
}
function genFuture() {
  return cap50([
    input("Uzupełnij: Jutro ja (pracować).", "będę pracować"),
    input("Uzupełnij: Jutro ty (pracować).", "będziesz pracować"),
    input("Uzupełnij: Jutro on (pracować).", "będzie pracować"),
    input("Uzupełnij: Jutro my (pracować).", "będziemy pracować"),
    input("Uzupełnij: Jutro wy (pracować).", "będziecie pracować"),
    input("Uzupełnij: Jutro oni (pracować).", "będą pracować"),
    input("Uzupełnij: Ja (zrobić) zadanie.", "zrobię zadanie"),
    input("Uzupełnij: Ty (kupić) chleb.", "kupisz chleb"),
    input("Uzupełnij: On (napisać) mail.", "napisze mail"),
    input("Uzupełnij: My (przeczytać) książkę.", "przeczytamy książkę"),
    input("Uzupełnij: Wy (pójść) do sklepu.", "pójdziecie do sklepu"),
    input("Uzupełnij: Oni (wrócić) do domu.", "wrócą do domu"),
    input("Uzupełnij: Ja (nauczyć się) tego.", "nauczę się tego"),
    input("Uzupełnij: Ona (ugotować) obiad.", "ugotuje obiad"),
    input("Uzupełnij: My (spotkać) kolegę.", "spotkamy kolegę"),
    input("Uzupełnij: Oni (zobaczyć) film.", "zobaczą film"),
    input("Uzupełnij: Jutro o 8:00 ja (pracować).", "będę pracować"),
    input("Uzupełnij: W przyszłym tygodniu my (pojechać) do Krakowa.", "pojedziemy do Krakowa"),
    input("Uzupełnij: Za godzinę ja (zadzwonić).", "zadzwonię"),
    input("Uzupełnij: Pojutrze oni (wrócić).", "wrócą"),
    input("Uzupełnij: Wieczorem ja (czytać) książkę.", "będę czytać"),
    input("Uzupełnij: Rano ona (zrobić) śniadanie.", "zrobi śniadanie")
  ]);
}
function genAspectChoice() { return cap50([choice("Codziennie ___ zadanie", ["robię", "zrobię"], "robię", "codziennie = powtarzalność"), choice("Jutro ___ zadanie do końca", ["będę robić", "zrobię"], "zrobię", "do końca = rezultat"), choice("Wczoraj długo ___ książkę", ["czytałem", "przeczytałem"], "czytałem", "długo = proces"), choice("Wczoraj ___ całą książkę", ["czytałem", "przeczytałem"], "przeczytałem", "całą = rezultat"), choice("Często ___ kawę w domu", ["robię", "zrobię"], "robię"), choice("Za chwilę ___ kawę", ["zrobię", "robię"], "zrobię"), choice("Uczę się, żeby ___ polskiego", ["uczyć się", "nauczyć się"], "nauczyć się"), choice("Teraz ___ polskiego", ["uczę się", "nauczę się"], "uczę się"), choice("Muszę ___ maila", ["napisać", "pisać"], "napisać"), choice("Lubię ___ maile rano", ["pisać", "napisać"], "pisać")]); }
function genAspectPairs() { return cap50(dict.perfectivePairs.map(([imp, perf]) => input(`${imp} →`, perf))); }
function genPrepositions() {
  return cap50([
    input("Uzupełnij: Idę ___ sklepu.", "do", "do + dopełniacz"),
    input("Uzupełnij: Jestem ___ pracy.", "w", "w + miejscownik"),
    input("Uzupełnij: Idę ___ spacer.", "na", "na + biernik"),
    input("Uzupełnij: Jestem ___ spacerze.", "na", "na + miejscownik"),
    input("Uzupełnij: Wracam ___ pracy.", "z", "z + dopełniacz"),
    input("Uzupełnij: Jadę ___ Polski.", "do", "do + dopełniacz"),
    input("Uzupełnij: Mieszkam ___ Polsce.", "w", "w + miejscownik"),
    input("Uzupełnij: Spotykam się ___ kolegą.", "z", "z + narzędnik"),
    input("Uzupełnij: Czekam ___ autobus.", "na", "na + biernik"),
    input("Uzupełnij: Rozmawiam ___ rodziną.", "z", "z + narzędnik"),
    input("Uzupełnij: Myślę ___ pracy.", "o", "o + miejscownik"),
    input("Uzupełnij: To jest prezent ___ dziecka.", "dla", "dla + dopełniacz"),
    input("Uzupełnij: Idę ___ lekarza.", "do"),
    input("Uzupełnij: Jestem ___ kursie.", "na"),
    input("Uzupełnij: Rozmawiam ___ problemie.", "o")
  ]);
}
function genNumbers() { return cap50(dict.numbers.map(([num, word]) => input(`${num} →`, word))); }
function genMoney() { return cap50(dict.money.map(([short, full]) => input(`${short} →`, full))); }
function genNumberRules() { return cap50([
  choice("1 ___", ["złoty", "złote", "złotych"], "złoty", "1 + mianownik pojedynczy"),
  choice("2 ___", ["złoty", "złote", "złotych"], "złote", "2/3/4 + mianownik liczby mnogiej"),
  choice("3 ___", ["grosz", "grosze", "groszy"], "grosze", "2/3/4 + grosze"),
  choice("4 ___", ["pieniądz", "pieniądze", "pieniędzy"], "pieniądze", "2/3/4 + pieniądze"),
  choice("5 ___", ["złoty", "złote", "złotych"], "złotych", "5+ + dopełniacz liczby mnogiej"),
  choice("12 ___", ["grosz", "grosze", "groszy"], "groszy", "12 + groszy"),
  choice("22 ___", ["złoty", "złote", "złotych"], "złote", "ostatnia cyfra 2, ale nie 12 → złote"),
  choice("24 ___", ["pieniądz", "pieniądze", "pieniędzy"], "pieniądze", "ostatnia cyfra 4, ale nie 14 → pieniądze"),
  choice("25 ___", ["złoty", "złote", "złotych"], "złotych", "25 → złotych"),
  choice("21 ___", ["złoty", "złote", "złotych"], "złotych", "21 w praktyce: dwadzieścia jeden złotych")
]); }
function genClock() { return cap50(dict.clock.map(([time, word]) => input(`Która godzina? ${time}`, word))); }
function genTimePhrases() { return cap50(dict.timePhrases.map(([pl, ru]) => input(`${ru} →`, pl))); }
function genFutureWithTime() { return cap50([
  input("Завтра я буду работать", "jutro będę pracować"), input("Через час я позвоню", "za godzinę zadzwonię"), input("На следующей неделе мы поедем в Краков", "w przyszłym tygodniu pojedziemy do Krakowa"),
  input("Вечером я буду учиться", "wieczorem będę się uczyć"), input("Утром я сделаю завтрак", "rano zrobię śniadanie"), input("Послезавтра они вернутся", "pojutrze wrócą"),
  input("В 8:00 я начну работу", "o ósmej zacznę pracę"), input("В 18:00 мы пойдём на прогулку", "o osiemnastej pójdziemy na spacer"), input("Завтра вечером я прочитаю текст", "jutro wieczorem przeczytam tekst"),
  input("Через неделю я напишу тест", "za tydzień napiszę test"), input("Сегодня вечером я буду читать", "dzisiaj wieczorem będę czytać"), input("Завтра утром я куплю хлеб", "jutro rano kupię chleb")
]); }
function genComplexSentences() {
  return cap50([
    input("Uzupełnij: Myślę, ___ to dobry pomysł.", "że"),
    input("Uzupełnij: Wiem, ___ muszę się uczyć.", "że"),
    input("Uzupełnij: ___ wracam z pracy, jestem zmęczony.", "kiedy"),
    input("Uzupełnij: ___ mam czas, uczę się polskiego.", "jeśli"),
    input("Uzupełnij: Uczę się, ___ chcę mieszkać w Polsce.", "bo"),
    input("Uzupełnij: Nie mam czasu, ___ pracuję.", "bo"),
    input("Uzupełnij: Pracuję dużo, ___ jestem zmęczony.", "dlatego"),
    input("Uzupełnij: Uczę się polskiego, ___ lepiej mówić.", "żeby"),
    input("Uzupełnij: Zostanę w domu, ___ będzie padać.", "jeśli"),
    input("Uzupełnij: Powiedziałem, ___ wrócę później.", "że"),
    input("Uzupełnij: Idę na kurs, ___ mówić lepiej.", "żeby"),
    input("Uzupełnij: Jestem zmęczony, ___ pracowałem długo.", "bo"),
    input("Uzupełnij: Mam kurs, ___ nie mogę przyjść.", "dlatego"),
    input("Uzupełnij: ___ będę mieć czas, zadzwonię.", "jeśli"),
    input("Uzupełnij: Nie wiem, ___ to zrobić.", "jak")
  ]);
}
function genB1Mistakes() { return cap50([input("Muszę uszyć się polskiego", "muszę uczyć się polskiego", "uszyć = сшить; uczyć się = учиться"), input("Mi się podoba język polski", "podoba mi się język polski"), input("Praca daje mnie satysfakcję", "praca daje mi satysfakcję"), input("Bawiłem z córką", "bawiłem się z córką"), input("Idę w pracy", "idę do pracy"), input("Jestem programista", "jestem programistą"), input("Nie mam czas", "nie mam czasu"), input("Widzę dobry lekarz", "widzę dobrego lekarza"), input("Mieszkam w Polska", "mieszkam w Polsce"), input("Jutro będę zrobię zadanie", "jutro zrobię zadanie"), input("Uczę się dlatego żeby łatwo mówić", "uczę się dlatego, żeby łatwo mówić"), input("Spotykam nowego kolegu", "spotykam nowego kolegę"), input("To są dobre studenci", "to są dobrzy studenci"), input("Kupuję świeżego chleb", "kupuję świeży chleb"), input("Ja pracuje", "ja pracuję"), input("Szukam pracę", "szukam pracy"), input("Pomagam mój kolega", "pomagam mojemu koledze"), input("Rozmawiam z kolega", "rozmawiam z kolegą"), input("Jestem na kurs", "jestem na kursie"), input("Idę do spacer", "idę na spacer"), input("Nie mogę przyjść, dlatego że mam spotkanie, jednak zadzwonię później", "nie mogę przyjść, ponieważ mam spotkanie, jednak zadzwonię później"), input("Chciałbym zapytać o termin i oprócz tego proszę odpowiedź", "chciałbym zapytać o termin i oprócz tego proszę o odpowiedź"), input("W załączniku wysyłam dokumenty, dlatego proszę o informację", "w załączniku wysyłam dokumenty i proszę o informację"), input("Z jednej strony kurs jest ciekawy, dlatego z drugiej strony trudny", "z jednej strony kurs jest ciekawy, z drugiej strony trudny"), input("Wczoraj zrobiłem powtórkę, ponieważ nie miałem czasu", "wczoraj zrobiłem powtórkę, chociaż nie miałem czasu")]); }

function genPoliteConditional() {
  const requests = [
    ["Я хотел бы спросить о сроке", "chciałbym zapytać o termin"],
    ["Я хотел бы получить подтверждение", "chciałbym otrzymać potwierdzenie"],
    ["Я хотел бы записаться на курс", "chciałbym zapisać się na kurs"],
    ["Я хотела бы изменить дату", "chciałabym zmienić termin"],
    ["Я хотела бы задать вопрос", "chciałabym zadać pytanie"],
    ["Я бы попросил ответ", "prosiłbym o odpowiedź"],
    ["Я бы попросила помощь", "prosiłabym o pomoc"],
    ["Могли бы Вы помочь?", "czy mogliby Państwo pomóc?"],
    ["Могли бы Вы прислать формуляр?", "czy mogliby Państwo przesłać formularz?"],
    ["Могли бы Вы подтвердить запись?", "czy mogliby Państwo potwierdzić zapis?"],
    ["Если бы у меня было время, я бы позвонил", "gdybym miał czas, zadzwoniłbym"],
    ["Если бы я знал ответ, я бы написал", "gdybym znał odpowiedź, napisałbym"]
  ];
  return cap50([
    ...requests.map(([ru, pl]) => input(ru, pl)),
    input("Я хотел бы спросить о сроке", "chciałbym zapytać o termin"),
    input("Я хотела бы изменить дату", "chciałabym zmienić termin"),
    input("Могли бы Вы помочь?", "czy mogliby Państwo pomóc?"),
    input("Я бы попросил ответ", "prosiłbym o odpowiedź"),
    input("Если бы у меня было время, я бы позвонил", "gdybym miał czas, zadzwoniłbym"),
    choice("Czy ___ Państwo przesłać formularz?", ["mogliby", "mogę", "muszę"], "mogliby"),
    choice("___ zapytać o wynik egzaminu.", ["Chciałbym", "Chcę bym", "Chciałem by"], "Chciałbym"),
    choice("Gdybym miał czas, ___.", ["zadzwoniłbym", "zadzwonię", "zadzwoniłem"], "zadzwoniłbym"),
    choice("Prosiłabym ___ odpowiedź.", ["o", "na", "do"], "o"),
    input("Chcę bym zapytać o termin", "chciałbym zapytać o termin"),
    input("Czy mogli Państwo pomóc?", "czy mogliby Państwo pomóc?"),
    input("Gdybym mam czas, zadzwonię", "gdybym miał czas, zadzwoniłbym")
  ]);
}

function genImperatives() {
  const forms = [["napisać", "napisz", "napiszcie"], ["zrobić", "zrób", "zróbcie"], ["poczekać", "poczekaj", "poczekajcie"], ["sprawdzić", "sprawdź", "sprawdźcie"], ["wziąć", "weź", "weźcie"], ["przeczytać", "przeczytaj", "przeczytajcie"], ["zadzwonić", "zadzwoń", "zadzwońcie"], ["powtórzyć", "powtórz", "powtórzcie"]];
  return cap50([
    ...forms.flatMap(([inf, ty, wy]) => [input(`Uzupełnij rozkaz: ty (${inf}).`, ty), input(`Uzupełnij rozkaz: wy (${inf}).`, wy)]),
    input("Uzupełnij grzeczną prośbę: Proszę ___ formularz.", "wypełnić"),
    input("Uzupełnij rozkaz: ty (napisać) wiadomość.", "napisz"),
    input("Uzupełnij rozkaz: ty (poczekać) chwilę.", "poczekaj"),
    input("Uzupełnij rozkaz: wy (zrobić) zadanie.", "zróbcie"),
    input("Не забудь документ", "nie zapomnij dokumentu"),
    input("Пожалуйста, подпишите заявление", "proszę podpisać wniosek"),
    input("Пожалуйста, не курите здесь", "proszę tu nie palić"),
    input("Проверьте расписание", "sprawdźcie rozkład jazdy"),
    choice("___ podpisać wniosek.", ["Proszę", "Zrób", "Niech"], "Proszę"),
    choice("___ załącznik do maila.", ["Dodaj", "Dodać", "Dodasz"], "Dodaj"),
    choice("Nie ___ dokumentu.", ["zapomnij", "zapomnisz", "zapominać"], "zapomnij"),
    input("Proszę podpisuje formularz", "proszę podpisać formularz")
  ]);
}

function genPronouns() {
  const pronounForms = [
    ["Uzupełnij: Daję książkę (ja).", "mi"], ["Uzupełnij: Pomagam (ty).", "ci"], ["Uzupełnij: Mówię prawdę (on).", "mu"], ["Uzupełnij: Pokazuję drogę (ona).", "jej"],
    ["Uzupełnij: Daję informację (my).", "nam"], ["Uzupełnij: Pomagam (wy).", "wam"], ["Uzupełnij: Mówię prawdę (oni).", "im"],
    ["Uzupełnij: Widzę (ona).", "ją"], ["Uzupełnij: Znam (on).", "go"], ["Uzupełnij: Czekam na (my).", "nas"], ["Uzupełnij: Zapraszam (wy).", "was"], ["Uzupełnij: Rozumiem (oni).", "ich"]
  ];
  return cap50([
    ...pronounForms.map(([q, a]) => input(q, a)),
    input("Uzupełnij: Daję znać (ja).", "mi"),
    input("Uzupełnij: Pomagam codziennie (ty).", "ci"),
    input("Uzupełnij: Widzę dziś (ona).", "ją"),
    input("Uzupełnij: Nie znam dobrze (on).", "go"),
    input("Uzupełnij: Mówię prawdę (oni).", "im"),
    input("Uzupełnij: Czekasz na przystanku na (my).", "nas"),
    choice("Podoba ___ się ten kurs.", ["mi", "mnie", "mną"], "mi"),
    choice("Znam ___ bardzo dobrze.", ["go", "mu", "nim"], "go"),
    choice("Pomagam ___ codziennie.", ["mu", "go", "jego"], "mu"),
    choice("Zapraszam ___ na spotkanie.", ["ją", "jej", "nią"], "ją"),
    input("Praca daje mnie satysfakcję", "praca daje mi satysfakcję"),
    input("Pomagam jego", "pomagam mu"),
    input("Widzę jej w sklepie", "widzę ją w sklepie")
  ]);
}

function genReflexiveSie() {
  const reflexive = [
    ["Я учу польский", "uczę się polskiego"], ["Я встречаюсь с коллегой", "spotykam się z kolegą"], ["Мне нравится этот курс", "podoba mi się ten kurs"],
    ["Я чувствую себя хорошо", "czuję się dobrze"], ["Я боюсь экзамена", "boję się egzaminu"], ["Я интересуюсь культурой", "interesuję się kulturą"],
    ["Я занимаюсь спортом", "zajmuję się sportem"], ["Я готовлюсь к экзамену", "przygotowuję się do egzaminu"], ["Мы видимся завтра", "widzimy się jutro"],
    ["Она смеётся", "ona się śmieje"]
  ];
  return cap50([
    ...reflexive.map(([ru, pl]) => input(ru, pl)),
    input("Я учу польский", "uczę się polskiego"),
    input("Я встречаюсь с коллегой", "spotykam się z kolegą"),
    input("Мне нравится этот курс", "podoba mi się ten kurs"),
    input("Я чувствую себя хорошо", "czuję się dobrze"),
    input("Я боюсь экзамена", "boję się egzaminu"),
    input("Bawię ___ z dzieckiem", "się"),
    choice("___ mi się ta książka.", ["Podoba", "Podobam", "Podobają"], "Podoba"),
    choice("Spotykam się ___ kolegą.", ["z", "do", "na"], "z"),
    choice("Boję się ___.", ["egzaminu", "egzamin", "egzaminem"], "egzaminu"),
    input("Mi się podoba ten kurs", "podoba mi się ten kurs"),
    input("Uczę polskiego", "uczę się polskiego"),
    input("Spotykam z kolegą", "spotykam się z kolegą")
  ]);
}

function genComparisons() {
  const adj = [["tani", "tańszy", "najtańszy"], ["drogi", "droższy", "najdroższy"], ["dobry", "lepszy", "najlepszy"], ["zły", "gorszy", "najgorszy"], ["ważny", "ważniejszy", "najważniejszy"], ["łatwy", "łatwiejszy", "najłatwiejszy"], ["trudny", "trudniejszy", "najtrudniejszy"], ["długi", "dłuższy", "najdłuższy"], ["krótki", "krótszy", "najkrótszy"], ["duży", "większy", "największy"]];
  return cap50([
    ...adj.flatMap(([base, comp, sup]) => [input(`${base} →`, comp), input(`naj + ${comp}`, sup)]),
    input("tani →", "tańszy"),
    input("drogi →", "droższy"),
    input("dobry →", "lepszy"),
    input("zły →", "gorszy"),
    input("ważny →", "ważniejszy"),
    input("naj + ważniejszy", "najważniejszy"),
    input("Польский труднее, чем английский", "polski jest trudniejszy niż angielski"),
    input("Этот курс лучше, чем тот", "ten kurs jest lepszy niż tamten"),
    input("Это самое важное задание", "to najważniejsze zadanie"),
    choice("Ten tekst jest ___ niż poprzedni.", ["dłuższy", "długi", "najdłuższy"], "dłuższy"),
    choice("To jest ___ temat w kursie.", ["najważniejszy", "ważniejszy", "ważny niż"], "najważniejszy"),
    input("Ten kurs jest dobry niż tamten", "ten kurs jest lepszy niż tamten")
  ]);
}

function genModalVerbs() {
  const modal = [
    ["Я должен подать заявление", "muszę złożyć wniosek"], ["Я должен заплатить счёт", "muszę zapłacić rachunek"], ["Я могу прийти завтра", "mogę przyjść jutro"],
    ["Я могу оплатить картой", "mogę zapłacić kartą"], ["Мне следует повторить слова", "powinienem powtórzyć słowa"], ["Мне следует больше читать", "powinienem więcej czytać"],
    ["Мне следует записаться к врачу", "powinienem umówić się do lekarza"], ["Ей следует отдохнуть", "powinna odpocząć"], ["Нам нужно выйти раньше", "musimy wyjść wcześniej"],
    ["Вы можете прислать файл", "możecie wysłać plik"]
  ];
  return cap50([
    ...modal.map(([ru, pl]) => input(ru, pl)),
    input("Я должен подать заявление", "muszę złożyć wniosek"),
    input("Я могу прийти завтра", "mogę przyjść jutro"),
    input("Мне следует повторить слова", "powinienem powtórzyć słowa"),
    input("Здесь нельзя курить", "tu nie wolno palić"),
    input("Можно оплатить картой", "można zapłacić kartą"),
    choice("___ podpisać formularz przed wysłaniem.", ["Muszę", "Mogę", "Wolno"], "Muszę"),
    choice("Tu nie ___ palić.", ["wolno", "można", "trzeba"], "wolno"),
    choice("Ona ___ odpocząć.", ["powinna", "powinien", "powinni"], "powinna"),
    input("Ja muszę złożę wniosek", "muszę złożyć wniosek"),
    input("Powinienem powtarzam słowa", "powinienem powtórzyć słowa")
  ]);
}

function genImpersonal() {
  const impersonal = [
    ["Можно купить билет онлайн", "można kupić bilet online"], ["Можно оплатить картой", "można zapłacić kartą"], ["Можно zapisać się przez internet", "można zapisać się przez internet"],
    ["Нужно заполнить формуляр", "trzeba wypełnić formularz"], ["Нужно подписать заявление", "trzeba podpisać wniosek"], ["Нужно прийти раньше", "trzeba przyjść wcześniej"],
    ["Следует добавить приложение", "należy dodać załącznik"], ["Следует проверить данные", "należy sprawdzić dane"], ["Стоит повторять слова", "warto powtarzać słowa"],
    ["Стоит читать тексты", "warto czytać teksty"], ["Говорят, что это важный экзамен", "mówi się, że to ważny egzamin"]
  ];
  return cap50([
    ...impersonal.map(([ru, pl]) => input(ru, pl)),
    input("Можно купить билет онлайн", "można kupić bilet online"),
    input("Нужно заполнить формуляр", "trzeba wypełnić formularz"),
    input("Следует добавить приложение", "należy dodać załącznik"),
    input("Стоит повторять слова", "warto powtarzać słowa"),
    input("Говорят, что это важный экзамен", "mówi się, że to ważny egzamin"),
    choice("___ zachować paragon.", ["Trzeba", "Mogę", "Jestem"], "Trzeba"),
    choice("___ podpisać formularz.", ["Należy", "Mam", "Jest"], "Należy"),
    choice("___ robić powtórki.", ["Warto", "Warty", "Wartość"], "Warto"),
    input("Trzeba podpisuję formularz", "trzeba podpisać formularz"),
    input("Można zapłacę kartą", "można zapłacić kartą")
  ]);
}

function genWordOrder() {
  const order = [
    ["polskiego / uczę się / codziennie", "uczę się polskiego codziennie"], ["jutro / mam / egzamin", "jutro mam egzamin"], ["nie / rozumiem / pytania", "nie rozumiem pytania"],
    ["kiedy / mogę / odebrać dokument", "kiedy mogę odebrać dokument"], ["podoba / mi się / ten kurs", "podoba mi się ten kurs"], ["wczoraj / byłem / w urzędzie", "wczoraj byłem w urzędzie"],
    ["często / robię / powtórki", "często robię powtórki"], ["dlaczego / uczysz się / polskiego", "dlaczego uczysz się polskiego"], ["nie / mam / czasu", "nie mam czasu"],
    ["czy / można / zapłacić kartą", "czy można zapłacić kartą"], ["spotykam się / z kolegą / jutro", "jutro spotykam się z kolegą"]
  ];
  return cap50([
    ...order.map(([q, a]) => input(q, a)),
    input("polskiego / uczę się / codziennie", "uczę się polskiego codziennie"),
    input("jutro / mam / egzamin", "jutro mam egzamin"),
    input("nie / rozumiem / pytania", "nie rozumiem pytania"),
    input("kiedy / mogę / odebrać dokument", "kiedy mogę odebrać dokument"),
    input("podoba / mi się / ten kurs", "podoba mi się ten kurs"),
    choice("Poprawnie:", ["Jutro mam spotkanie", "Jutro spotkanie mam", "Mam jutro spotkanie ja"], "Jutro mam spotkanie"),
    choice("Poprawnie:", ["Podoba mi się ta książka", "Mi się podoba ta książka", "Podoba się mi książka ta"], "Podoba mi się ta książka"),
    input("Ja jutro mam spotkanie ważne", "jutro mam ważne spotkanie"),
    input("Nie pytania rozumiem", "nie rozumiem pytania")
  ]);
}

function genB1Connectors() {
  const connectors = [
    ["однако", "jednak"], ["а вот / тогда как", "natomiast"], ["кроме того", "oprócz tego"], ["по этой причине", "z tego powodu"],
    ["подводя итог", "podsumowując"], ["с одной стороны", "z jednej strony"], ["с другой стороны", "z drugiej strony"], ["например", "na przykład"],
    ["по моему мнению", "moim zdaniem"], ["прежде всего", "przede wszystkim"], ["несмотря на это", "mimo to"], ["поэтому", "dlatego"]
  ];
  return cap50([
    ...connectors.map(([ru, pl]) => input(ru, pl)),
    input("однако", "jednak"),
    input("кроме того", "oprócz tego"),
    input("по этой причине", "z tego powodu"),
    input("подводя итог", "podsumowując"),
    input("Я хотел прийти, однако не мог", "chciałem przyjść, jednak nie mogłem"),
    input("Я учу слова, кроме того читаю тексты", "uczę się słów, oprócz tego czytam teksty"),
    input("С одной стороны это удобно, с другой стороны дорого", "z jednej strony to wygodne, z drugiej strony drogie"),
    input("По моему мнению это хорошее решение", "moim zdaniem to dobre rozwiązanie"),
    choice("Był korek, ___ spóźniłem się.", ["z tego powodu", "natomiast", "oprócz tego"], "z tego powodu"),
    choice("Ja wolę kurs online, ___ mój brat woli szkołę.", ["natomiast", "oprócz tego", "podsumowując"], "natomiast"),
    choice("___, warto robić powtórki codziennie.", ["Podsumowując", "Jednak", "Natomiast"], "Podsumowując"),
    input("Był remont, natomiast autobus się spóźnił", "był remont, z tego powodu autobus się spóźnił")
  ]);
}

function genThematicWords(key) {
  return cap50((dict.thematicVocab[key] || []).map(([pl, ru]) => input(`${ru} →`, pl)));
}

function genThematicActiveRecall(key) {
  const vocab = (dict.thematicVocab[key] || []).map(([pl, ru]) => input(`${ru} →`, pl));
  const phrases = (dict.thematicPhrases[key] || []).map(([ru, pl]) => input(`${ru} →`, pl));
  return cap50([...vocab, ...phrases]);
}

function genSentenceAssemblyB1() {
  const sentences = [
    ["w przyszłym tygodniu / muszę / złożyć wniosek w urzędzie", "w przyszłym tygodniu muszę złożyć wniosek w urzędzie"],
    ["po pracy / spotykam się / z kolegą w centrum", "po pracy spotykam się z kolegą w centrum"],
    ["z jednej strony / ten kurs jest trudny / z drugiej strony / bardzo skuteczny", "z jednej strony ten kurs jest trudny, z drugiej strony bardzo skuteczny"],
    ["nie mogę / otworzyć pliku / dlatego / napiszę do wsparcia technicznego", "nie mogę otworzyć pliku, dlatego napiszę do wsparcia technicznego"],
    ["chciałbym / przełożyć wizytę / ponieważ / jutro pracuję do wieczora", "chciałbym przełożyć wizytę, ponieważ jutro pracuję do wieczora"],
    ["oprócz tego / codziennie słucham nagrań / i zapisuję nowe słowa", "oprócz tego codziennie słucham nagrań i zapisuję nowe słowa"],
    ["w restauracji / poprosiłem kelnera / o menu bez orzechów", "w restauracji poprosiłem kelnera o menu bez orzechów"],
    ["jeśli będzie padać / pojedziemy tramwajem / zamiast rowerem", "jeśli będzie padać, pojedziemy tramwajem zamiast rowerem"],
    ["wczoraj / nie miałem czasu / jednak / zrobiłem krótką powtórkę", "wczoraj nie miałem czasu, jednak zrobiłem krótką powtórkę"],
    ["najpierw / sprawdziłem rozkład jazdy / potem / kupiłem bilet", "najpierw sprawdziłem rozkład jazdy, potem kupiłem bilet"],
    ["moja koleżanka / chce / zapisać się na egzamin B1", "moja koleżanka chce zapisać się na egzamin B1"],
    ["w załączniku / przesyłam dokumenty / i proszę o odpowiedź", "w załączniku przesyłam dokumenty i proszę o odpowiedź"]
  ];
  return cap50(sentences.map(([parts, full]) => input(`Ułóż zdanie z części: ${parts}`, full)));
}

function genConnectorChoiceAdvanced() {
  return cap50([
    choice("Nie mogłem przyjść, ___ miałem spotkanie w pracy.", ["ponieważ", "jednak", "oprócz tego"], "ponieważ"),
    choice("Autobus się spóźnił, ___ przyjechałem później.", ["dlatego", "jednak", "natomiast"], "dlatego"),
    choice("Uczę się słówek, ___ czytam krótkie teksty.", ["oprócz tego", "ponieważ", "natomiast"], "oprócz tego"),
    choice("Chciałem kupić ten telefon, ___ był za drogi.", ["jednak", "ponieważ", "dlatego"], "jednak"),
    choice("Najpierw zrobiłem ćwiczenia, ___ sprawdziłem błędy.", ["potem", "jednak", "ponieważ"], "potem"),
    choice("Mój brat woli naukę rano, ___ ja uczę się wieczorem.", ["natomiast", "ponieważ", "dlatego"], "natomiast"),
    choice("Nie rozumiem tego słowa, ___ sprawdzę je w słowniku.", ["dlatego", "jednak", "natomiast"], "dlatego"),
    choice("Kurs jest wymagający, ___ bardzo dobrze porządkuje materiał.", ["jednak", "ponieważ", "na przykład"], "jednak"),
    choice("Muszę powtórzyć biernik, ___ często robię tu błędy.", ["ponieważ", "natomiast", "oprócz tego"], "ponieważ"),
    choice("Moim zdaniem trzeba więcej czytać. ___ warto też słuchać nagrań.", ["Oprócz tego", "Ponieważ", "Jednak"], "Oprócz tego"),
    input("Wybierz poprawną связку: Kurs jest trudny, ___ skuteczny.", "kurs jest trudny, jednak skuteczny"),
    input("Wybierz poprawną связку: Nie miałem czasu, ___ zrobiłem tylko 10 minut powtórki.", "nie miałem czasu, dlatego zrobiłem tylko 10 minut powtórki")
  ]);
}

function genShortWritingB1() {
  return repeatTo50([
    free("Napisz 2–4 zdania: dlaczego uczysz się polskiego i co robisz prawie codziennie, żeby mieć postęp.", "Użyj minimum 1 связку: ponieważ / dlatego / oprócz tego."),
    free("Napisz 2–4 zdania do nauczyciela: pytasz o typowe błędy i prosisz o krótką radę.", "Użyj: chciałbym/chciałabym, ponieważ, proszę o."),
    free("Napisz 2–4 zdania do właściciela mieszkania o małej awarii.", "Użyj: problem, ponieważ, proszę o kontakt."),
    free("Napisz 2–4 zdania: porównaj naukę z tekstem i naukę z audio.", "Użyj: z jednej strony, z drugiej strony."),
    free("Napisz 2–4 zdania o swoim planie na jutro po pracy.", "Użyj czasu przyszłego i 1 wyrażenie czasu."),
    free("Napisz 2–4 zdania: opisz problem z transportem i co zrobisz.", "Użyj: dlatego / z tego powodu."),
    free("Napisz 2–4 zdania do sklepu: produkt nie działa i chcesz rozwiązania.", "Użyj: ponieważ, proszę o, jednak."),
    free("Napisz 2–4 zdania: jakie 3 rzeczy robisz, żeby lepiej zapamiętywać słowa.", "Użyj: najpierw, potem, oprócz tego."),
    free("Napisz 2–4 zdania o swoim mieście albo dzielnicy.", "Użyj: moim zdaniem, jednak / natomiast."),
    free("Napisz 2–4 zdania: co lubisz robić w wolnym czasie i dlaczego.", "Użyj: ponieważ, oprócz tego."),
    free("Napisz 2–4 zdania: czy wolisz uczyć się rano czy wieczorem?", "Użyj porównania i 1 связку."),
    free("Napisz 2–4 zdania do kolegi: nie możesz przyjść i proponujesz inny termin.", "Użyj: niestety, dlatego, czy możemy.")
  ]);
}

function genThematicIntro(key) {
  const texts = {
    work: "Od kilku miesięcy pracuję w nowej firmie i powoli przyzwyczajam się do zasad w zespole. Na początku największym wyzwaniem były dla mnie obowiązki, terminy i komunikacja z kierownikiem. W umowie mam opisane stanowisko, wynagrodzenie, urlop oraz zasady pracy zdalnej, ale w praktyce wiele rzeczy trzeba wyjaśniać podczas spotkań. W przyszłym tygodniu mam rozmowę z pracodawcą o nowych zadaniach, dlatego przygotowuję raport i zbieram informacje o swoim doświadczeniu. Chciałbym też zapytać o nadgodziny, bo ostatnio kilka razy zostawałem w pracy dłużej.",
    housing: "Kiedy szukałem mieszkania, szybko zrozumiałem, że sam czynsz to nie wszystko. Trzeba sprawdzić kaucję, rachunki za prąd, wodę i ogrzewanie, a także to, czy właściciel szybko reaguje, gdy pojawi się awaria. W moim obecnym mieszkaniu jest balkon i winda, ale największym problemem jest stara instalacja oraz hałas na klatce schodowej. Ostatnio zepsuło się ogrzewanie, więc napisałem do właściciela z prośbą o naprawę. Jeśli sytuacja się powtórzy, prawdopodobnie będę musiał przeprowadzić się do innej dzielnicy.",
    health: "Od kilku dni źle się czuję: mam gorączkę, kaszel, katar i silny ból gardła. Zadzwoniłem do przychodni, żeby umówić wizytę u lekarza rodzinnego, ale najbliższy wolny termin był dopiero za dwa dni. W rejestracji zapytano mnie o ubezpieczenie i numer PESEL. Lekarz może wystawić receptę, skierowanie na badanie albo zwolnienie lekarskie, jeśli nie będę mógł pracować. Po wizycie muszę pójść do apteki po tabletki i poczekać na wyniki badań.",
    documents: "W urzędzie trzeba zachować spokój, bo jedna sprawa często wymaga kilku dokumentów. Najpierw wypełnia się formularz, potem składa wniosek, podpisuje dokument i dodaje potrzebny załącznik. Czasem trzeba też zapłacić opłatę i zachować potwierdzenie. Po złożeniu dokumentów dostaje się numer sprawy, dzięki któremu można sprawdzić, czy decyzja jest już gotowa. Na końcu trzeba przyjść po odbiór dokumentu albo poczekać na wiadomość z urzędu.",
    shopping: "Coraz częściej kupuję rzeczy przez sklep internetowy, ale nie każde zamówienie kończy się dobrze. Ostatnio zamówiłem kurtkę, zapłaciłem kartą i wybrałem dostawę do punktu odbioru osobistego. Niestety rozmiar był za mały, a zamek nie działał prawidłowo. Miałem paragon i gwarancję, więc napisałem do obsługi klienta, że chcę zrobić zwrot albo wymianę. W formularzu reklamacji musiałem podać numer zamówienia, opisać problem i napisać, czy oczekuję naprawy, wymiany czy zwrotu pieniędzy.",
    city: "Dojazd do centrum bywa prosty tylko wtedy, gdy wszystko działa zgodnie z rozkładem jazdy. Rano sprawdzam w aplikacji, o której odjeżdża tramwaj z mojego przystanku, a potem kupuję bilet w biletomacie albo używam biletu miesięcznego. Jeśli jest korek albo remont na skrzyżowaniu, autobus ma spóźnienie i trzeba zrobić przesiadkę. Najbardziej stresujące są sytuacje, kiedy nie znam dzielnicy i muszę zapytać kogoś o drogę, przejście dla pieszych albo najbliższy dworzec.",
    education: "Przygotowanie do egzaminu B1 wymaga systematycznej pracy, a nie tylko robienia testów na ostatnią chwilę. Najpierw trzeba sprawdzić swój poziom, potem zaplanować powtórkę gramatyki, słownictwa i wymowy. Nauczyciel może pomóc znaleźć typowe błędy, ale uczeń sam musi regularnie robić zadanie domowe i analizować odpowiedzi. Najważniejszy jest postęp: jeśli wynik rośnie powoli, to znaczy, że metoda działa. Po zdanym egzaminie można otrzymać certyfikat albo zaświadczenie.",
    relationships: "Dobre relacje z ludźmi opierają się na zaufaniu, rozmowie i wsparciu. Czasem nawet bliski przyjaciel albo sąsiad może źle zrozumieć naszą decyzję, dlatego warto spokojnie wyjaśnić swoje stanowisko. Kiedy pojawia się kłótnia, często czujemy stres, wstyd albo smutek, ale przeprosiny i szczera rozmowa pomagają odbudować kontakt. W trudnej sytuacji dobrze jest poprosić o radę, a potem okazać wdzięczność za pomoc.",
    travel: "Podróż zaczyna się dużo wcześniej niż na dworcu albo lotnisku. Najpierw trzeba zrobić rezerwację, sprawdzić nocleg i upewnić się, że pobyt jest dobrze zaplanowany. Jeśli lot jest opóźniony albo odwołany, trzeba skontaktować się z recepcją hotelu i zmienić godzinę przyjazdu. Warto mieć ubezpieczenie turystyczne, mapę i kopię dokumentów. Podczas zwiedzania miasta przewodnik może pokazać najważniejsze atrakcje, ale czasem najlepsze wspomnienia powstają przypadkiem.",
    food: "W restauracji nie chodzi tylko o jedzenie, ale też o sposób rozmowy. Najpierw kelner przynosi menu, potem wybieramy danie, pytamy o składniki i ewentualne alergie. Jeśli smak jest zbyt ostry, słony albo kwaśny, można grzecznie poprosić o zmianę. Po posiłku prosimy o rachunek i decydujemy, czy zostawić napiwek. W domu częściej korzystamy z przepisu, planujemy śniadanie, obiad i kolację, a czasem przygotowujemy tylko szybką przekąskę.",
    technology: "Codziennie korzystamy z aplikacji, kont internetowych i wielu różnych haseł, dlatego bezpieczeństwo danych jest bardzo ważne. Jeśli zapomnimy hasła, musimy sprawdzić ustawienia albo potwierdzić wiadomość e-mail. Czasem problemem jest połączenie z siecią, rozładowana bateria, brak ładowarki albo błąd systemu po aktualizacji. W pracy często wysyłamy plik jako załącznik, zapisujemy go w folderze i szukamy informacji przez wyszukiwarkę. Coraz częściej zwracamy też uwagę na prywatność.",
    argumentation: "Na poziomie B1 trzeba umieć nie tylko opisać sytuację, ale też wyrazić opinię i podać argument. Dobra wypowiedź ma temat, stanowisko, przykład oraz wniosek. Warto pokazać zalety i wady danego rozwiązania, porównać dwie możliwości i wyjaśnić różnicę albo podobieństwo. Jeśli ktoś się z nami nie zgadza, możemy spokojnie wyrazić sprzeciw i podać dowód. Taki sposób mówienia ma duży wpływ na jakość pisania i wypowiedzi ustnej.",
    finance: "Kiedy mieszkamy samodzielnie, budżet staje się bardzo praktycznym tematem. Co miesiąc trzeba policzyć dochód, wypłatę, czynsz, rachunek za prąd, opłaty i inne wydatki. Jeśli koszt utrzymania rośnie, warto szukać zniżek, płacić kartą tylko wtedy, gdy kontrolujemy konto bankowe, i regularnie odkładać oszczędności. Czasem trzeba zrobić przelew, zapłacić podatek albo ratę pożyczki. Dobra organizacja pieniędzy daje więcej spokoju.",
    family: "Rodzina może wyglądać bardzo różnie, ale często łączy kilka pokoleń i wiele obowiązków. Rodzice zajmują się wychowaniem, dorosłe dzieci pomagają starszym krewnym, a dziadkowie opiekują się wnukiem albo wnuczką. Podczas rodzinnej uroczystości, rocznicy albo świąt rozmawiamy o pracy, wspólnym mieszkaniu, prezentach i planach. W trudnej sytuacji wsparcie rodziny bywa ważniejsze niż idealna rada.",
    daily: "Dobry dzień często zaczyna się od prostego planu dnia. Rano mamy poranek, śniadanie, sprzątanie albo pośpiech przed wyjściem. W pracy potrzebujemy przerwy, punktualności i organizacji czasu, a wieczorem chcemy odpoczynku i spokoju. Codzienna rutyna nie musi być nudna, jeśli mamy zdrowe nawyki i trochę samodzielności. Nawet pranie, gotowanie i zakupy spożywcze są łatwiejsze, kiedy znamy kolejność obowiązków.",
    nature: "Pogoda ma duży wpływ na nasze plany. Jeśli prognoza pogody zapowiada deszcz, wiatr albo burzę, lepiej zabrać parasol i zmienić trasę spaceru. Latem problemem bywa upał, zimą mróz i śnieg, a jesienią zachmurzenie. W wolnym czasie lubię przyrodę: las, rzekę, jezioro, góry i morze. Taki krajobraz pomaga odpocząć i zauważyć, jak szybko zmienia się sezon.",
    culture: "Kultura i media pomagają mówić po polsku naturalniej, bo dają tematy do rozmowy. Można obejrzeć film albo serial, przeczytać artykuł w gazecie, posłuchać audycji lub sprawdzić wiadomości. W weekend wiele osób idzie do muzeum, teatru, na wystawę albo koncert. Po wydarzeniu kulturalnym można napisać krótką recenzję: kto był autorem, jaki był bohater, jak reagowała publiczność i czy warto kupić bilet.",
    leisure: "Czas wolny jest potrzebny tak samo jak praca. Jedni wybierają siłownię, trening, basen albo rower, inni wolą spacer, grę planszową lub spotkanie ze znajomymi. Ważne, żeby hobby dawało relaks i rozwijało umiejętności. Jeśli mamy wolny weekend, można zaplanować wycieczkę, obejrzeć zawody sportowe albo po prostu odpoczywać. Pasja często pomaga utrzymać dobrą aktywność fizyczną i lepszy nastrój.",
    safety: "W sytuacji zagrożenia trzeba działać spokojnie i konkretnie. Jeśli wydarzy się wypadek, kradzież albo zaginie dokument, można zadzwonić pod numer alarmowy, wezwać pomoc albo zgłosić sprawę na policję. Świadek powinien opisać, co widział, a poszkodowana osoba może potrzebować ubezpieczenia lub ochrony. Warto znać przepisy, zakazy i nakazy, bo ostrożność zmniejsza niebezpieczeństwo.",
    society: "Życie w społeczeństwie zależy od wielu małych decyzji mieszkańców. Obywatel, cudzoziemiec i każdy nowy mieszkaniec miasta potrzebuje dostępu do komunikacji miejskiej, edukacji publicznej, opieki zdrowotnej i pomocy społecznej. Integracja wymaga czasu, ale pomagają sąsiedztwo, wolontariat i wspólnota. Ważne są też równość, różnorodność, wybory i prawo głosu, bo wpływają na jakość życia.",
    personality: "Kiedy opisujemy ludzi, warto mówić nie tylko, jak ktoś wygląda, ale też jaki ma charakter. Dobry pracownik może być odpowiedzialny, punktualny, dokładny i pracowity. Dobry przyjaciel bywa pomocny, uczciwy, wrażliwy i zabawny. Niektóre osoby są otwarte i pewne siebie, inne zamknięte w sobie albo nieśmiałe. Na poziomie B1 takie cechy pomagają opowiadać o relacjach, pracy i własnych doświadczeniach.",
    environment: "Ochrona środowiska zaczyna się od codziennych wyborów. Możemy segregować śmieci, ograniczać plastik, wybierać recykling i oszczędzanie wody. W mieście dużym problemem jest smog, hałas i zanieczyszczenie powietrza, dlatego warto korzystać z transportu publicznego albo roweru miejskiego. Zielona przestrzeń, park miejski i czyste powietrze wpływają na zdrowie. Nawet mały odpowiedzialny wybór ma znaczenie."
  };
  const vocab = dict.thematicVocab[key] || [];
  const words = vocab.map(([pl, ru]) => `${pl} = ${ru}`).join(", ");
  return [
    note("Tekst z nowymi słowami", texts[key] || "", vocab),
    note("Mini-słownik", words)
  ];
}

function genThematicPhrases(key) {
  return cap50((dict.thematicPhrases[key] || []).map(([ru, pl]) => input(ru, pl)));
}

function genThematicSkillBuilder(key) {
  const blocks = {
    work: [
      note("Jak mówić o pracy konkretnie", "В теме `praca` сильный B1 начинается не со словаря, а с умения описать ситуацию по шагам: stanowisko -> obowiązki -> problem albo cel -> rozwiązanie.\n\nНапример: `Pracuję jako specjalista ds. obsługi klienta. Mam dużo kontaktu z ludźmi. Ostatnio dostałem nowe obowiązki, dlatego muszę lepiej organizować czas.`"),
      choice("Które zdanie brzmi bardziej konkretnie?", ["Mam nowe obowiązki i przygotowuję raport dla kierownika.", "Praca jest jakaś i coś robię.", "Firma jest."], "Mam nowe obowiązki i przygotowuję raport dla kierownika."),
      input("Uzupełnij: szukam ___ w nowej firmie", "pracy"),
      input("Uzupełnij: rozmawiam z ___ o terminie spotkania", "kierownikiem"),
      free("Napisz 3–4 zdania o swojej pracy albo pracy, której szukasz. Użyj: stanowisko, obowiązki, termin, zespół.", "Сделай ответ конкретным: кем работаешь / что делаешь / какой есть вопрос или план.")
    ],
    housing: [
      note("Jak opisać problem w mieszkaniu", "В теме `mieszkanie` важно уметь не просто назвать предмет, а спокойно и конкретно сообщить о проблеме: co nie działa -> od kiedy -> jaki jest skutek -> czego oczekujesz.\n\nНапример: `Od wczoraj nie działa ogrzewanie. W mieszkaniu jest zimno. Proszę o kontakt i naprawę jak najszybciej.`"),
      choice("Co jest najważniejsze w wiadomości o awarii?", ["problem i prośba o działanie", "opis wakacji", "lista zakupów"], "problem i prośba o działanie"),
      input("Uzupełnij: nie działa ___ w łazience", "ogrzewanie"),
      input("Uzupełnij: napisałem do ___ z prośbą o naprawę", "właściciela"),
      free("Napisz 3–4 zdania do właściciela mieszkania o awarii. Użyj: od wczoraj, problem, proszę o kontakt.", "Опиши проблему, её последствия и просьбу.")
    ],
    health: [
      note("Jak opisać objawy po polsku", "В теме `zdrowie` лучше всего работает модель: co mi jest -> od kiedy -> czego potrzebuję.\n\nНапример: `Od dwóch dni mam gorączkę i kaszel. Boli mnie gardło. Chciałbym umówić wizytę u lekarza rodzinnego.`"),
      choice("Który opis brzmi naturalniej u lekarza?", ["Od dwóch dni mam gorączkę i kaszel.", "Jestem choroba gardło.", "Mam lekarz."], "Od dwóch dni mam gorączkę i kaszel."),
      input("Uzupełnij: potrzebuję ___ na badanie", "skierowania"),
      input("Uzupełnij: chcę umówić ___ u lekarza", "wizytę"),
      free("Napisz 3–4 zdania do przychodni albo lekarza. Użyj: od kiedy, objawy, wizyta.", "Скажи, что болит, как долго и что тебе нужно.")
    ],
    documents: [
      note("Jak przejść sprawę w urzędzie", "Тема `urząd` становится сильной, когда ты видишь не отдельные слова, а последовательность действий: formularz -> wniosek -> załącznik -> opłata -> odbiór.\n\nНапример: `Najpierw wypełniam formularz, potem składam wniosek i dołączam załącznik. Na końcu czekam na odbiór dokumentu.`"),
      choice("Co zwykle jest pierwszym krokiem w urzędzie?", ["wypełnić formularz", "odebrać bagaż", "zamówić obiad"], "wypełnić formularz"),
      input("Uzupełnij: muszę złożyć ___ o wydanie dokumentu", "wniosek"),
      input("Uzupełnij: proszę o informację, kiedy mogę odebrać ___", "dokument"),
      free("Napisz 3–4 zdania do urzędu. Użyj: formularz, wniosek, załącznik, proszę o informację.", "Покажи цель, нужные документы и вопрос о сроке.")
    ],
    shopping: [
      note("Jak opisać problem z zakupem", "В теме `zakupy` нужен не просто словарь, а ясная структура жалобы: co kupiłeś -> jaki jest problem -> czego oczekujesz.\n\nНапример: `Kupiłem kurtkę przez internet, ale rozmiar jest za mały i zamek nie działa. Mam paragon i chcę zrobić zwrot albo wymianę.`"),
      choice("Co brzmi najbardziej rzeczowo w reklamacji?", ["Produkt jest uszkodzony i proszę o wymianę.", "To wszystko jest bez sensu.", "Nie wiem, coś się stało."], "Produkt jest uszkodzony i proszę o wymianę."),
      input("Uzupełnij: chcę zrobić ___ towaru", "zwrot"),
      input("Uzupełnij: mam ___ i numer zamówienia", "paragon"),
      free("Napisz 3–4 zdania do sklepu o problemie z zamówieniem. Użyj: produkt, problem, zwrot albo wymiana.", "Опиши, что ты купил, что не так и чего ожидаешь.")
    ],
    city: [
      note("Jak mówić o dojeździe i drodze", "В теме `miasto i transport` полезно говорить по схеме: skąd dokąd -> czym jedziesz -> jaki jest problem -> co trzeba zrobić.\n\nНапример: `Jadę do centrum tramwajem, ale dziś mam przesiadkę, bo jest remont. Muszę sprawdzić rozkład jazdy i zapytać o drogę.`"),
      choice("Co jest najważniejsze, gdy tłumaczysz drogę?", ["kierunek i środek transportu", "opis obiadu", "numer PESEL"], "kierunek i środek transportu"),
      input("Uzupełnij: muszę zrobić ___ na inny tramwaj", "przesiadkę"),
      input("Uzupełnij: sprawdzam ___ jazdy w aplikacji", "rozkład"),
      free("Napisz 3–4 zdania o problemie z dojazdem. Użyj: przystanek, spóźnienie, przesiadka, bilet.", "Объясни, куда едешь, что случилось и что собираешься делать.")
    ],
    education: [
      note("Jak mówić o nauce skutecznie", "В теме `edukacja` сильный ответ строится так: cel -> plan -> trudność -> postęp. Тогда речь звучит не общо, а по-настоящему учебно.\n\nНапример: `Przygotowuję się do egzaminu B1. Codziennie powtarzam słownictwo i robię ćwiczenia z gramatyki. Najtrudniejsze jest dla mnie pisanie, ale widzę postęp.`"),
      choice("Który opis nauki brzmi dojrzalej?", ["Codziennie robię powtórkę i analizuję błędy.", "Uczę się jakoś tam.", "Egzamin jest egzaminem."], "Codziennie robię powtórkę i analizuję błędy."),
      input("Uzupełnij: robię codzienną ___ przed egzaminem", "powtórkę"),
      input("Uzupełnij: nauczyciel pokazuje moje typowe ___", "błędy"),
      free("Napisz 3–4 zdania o swojej nauce polskiego. Użyj: poziom, powtórka, błąd, postęp.", "Покажи цель, рутину и то, что хочешь улучшить.")
    ],
    relationships: [
      note("Jak mówić o relacjach spokojnie", "В теме `relacje` важно уметь не только назвать эмоцию, но и мягко объяснить ситуацию: co się stało -> jak się czułeś -> czego potrzebujesz teraz.\n\nНапример: `Źle się poczułem po tej rozmowie, bo zabrakło zaufania. Chciałbym spokojnie wyjaśnić sytuację i przeprosić.`"),
      choice("Co pomaga w trudnej rozmowie?", ["spokojne wyjaśnienie i przeprosiny", "krzyk i chaos", "milczenie bez końca"], "spokojne wyjaśnienie i przeprosiny"),
      input("Uzupełnij: dziękuję za twoje ___ i pomoc", "wsparcie"),
      input("Uzupełnij: chcę cię ___ za swoje słowa", "przeprosić"),
      free("Napisz 3–4 zdania do bliskiej osoby po trudnej rozmowie. Użyj: zaufanie, przeprosiny, wsparcie.", "Объясни ситуацию спокойно и по-человечески.")
    ]
  };
  return blocks[key] || [];
}

function genThematicComprehension(key) {
  const blocks = {
    work: cap50([
      choice("Tekst o pracy: Co było największym wyzwaniem na początku?", ["obowiązki, terminy i komunikacja", "pogoda w biurze", "zakupy po pracy"], "obowiązki, terminy i komunikacja"),
      choice("Co osoba przygotowuje przed rozmową z pracodawcą?", ["raport", "receptę", "mapę miasta"], "raport"),
      input("Jak po polsku w tekście jest 'сверхурочные'?", "nadgodziny")
    ]),
    housing: cap50([
      choice("Co trzeba sprawdzić oprócz czynszu?", ["kaucję i rachunki", "tylko kolor ścian", "menu restauracji"], "kaucję i rachunki"),
      choice("Jaki problem pojawił się w mieszkaniu?", ["zepsuło się ogrzewanie", "zniknął paszport", "odwołano egzamin"], "zepsuło się ogrzewanie"),
      input("Jak po polsku w tekście jest 'авария'?", "awaria")
    ]),
    health: cap50([
      choice("Na co skarży się osoba?", ["na gorączkę, kaszel i ból gardła", "na hałas w mieszkaniu", "na opóźniony tramwaj"], "na gorączkę, kaszel i ból gardła"),
      choice("O co zapytano w rejestracji?", ["o ubezpieczenie i numer PESEL", "o numer konta", "o kaucję"], "o ubezpieczenie i numer PESEL"),
      input("Jak po polsku w tekście jest 'больничный'?", "zwolnienie lekarskie")
    ]),
    documents: cap50([
      choice("Co często wymaga jedna sprawa w urzędzie?", ["kilku dokumentów", "jednej piosenki", "jednego telefonu"], "kilku dokumentów"),
      choice("Co dostaje się po złożeniu dokumentów?", ["numer sprawy", "bilet miesięczny", "kartę bankową"], "numer sprawy"),
      input("Jak po polsku w tekście jest 'подтверждение оплаты'?", "potwierdzenie")
    ]),
    shopping: cap50([
      choice("Jaki problem był z kurtką?", ["rozmiar był za mały, a zamek nie działał", "nie było przystanku", "odwołano wizytę"], "rozmiar był za mały, a zamek nie działał"),
      choice("Co trzeba było podać w formularzu reklamacji?", ["numer zamówienia i opis problemu", "numer PESEL i adres szkoły", "wynik badania i receptę"], "numer zamówienia i opis problemu"),
      input("Jak po polsku w tekście jest 'обмен'?", "wymiana")
    ]),
    city: cap50([
      choice("Co osoba sprawdza rano w aplikacji?", ["o której odjeżdża tramwaj", "cenę mieszkania", "wyniki badań"], "o której odjeżdża tramwaj"),
      choice("Kiedy trzeba zrobić przesiadkę?", ["gdy jest korek albo remont", "gdy boli gardło", "gdy sklep jest zamknięty"], "gdy jest korek albo remont"),
      input("Jak po polsku w tekście jest 'пересадка'?", "przesiadka")
    ]),
    education: cap50([
      choice("Od czego trzeba zacząć przygotowanie do B1?", ["od sprawdzenia swojego poziomu", "od kupienia biletu", "od wizyty u lekarza"], "od sprawdzenia swojego poziomu"),
      choice("Co pokazuje, że metoda nauki działa?", ["powolny, ale stały postęp", "wysoki czynsz", "spóźniony autobus"], "powolny, ale stały postęp"),
      input("Jak po polsku w tekście jest 'прогресс'?", "postęp")
    ]),
    relationships: cap50([
      choice("Na czym opierają się dobre relacje?", ["na zaufaniu, rozmowie i wsparciu", "na formularzach i rachunkach", "na rozkładzie jazdy"], "na zaufaniu, rozmowie i wsparciu"),
      choice("Co pomaga odbudować kontakt po kłótni?", ["przeprosiny i szczera rozmowa", "nowy bilet miesięczny", "zwrot towaru"], "przeprosiny i szczera rozmowa"),
      input("Jak po polsku w tekście jest 'благодарность'?", "wdzięczność")
    ])
  };
  return blocks[key] || [];
}

function genThematicContextGrammar(key) {
  const blocks = {
    work: cap50([
      input("Uzupełnij: pracuję w nowej ___", "firmie"),
      input("Uzupełnij: przygotowuję ___ dla kierownika", "raport"),
      choice("Szukam ___ z lepszym wynagrodzeniem.", ["pracy", "pracę", "pracą"], "pracy"),
      choice("Rozmawiam z kierownikiem ___ nowych zadaniach.", ["o", "do", "na"], "o")
    ]),
    housing: cap50([
      input("Uzupełnij: mieszkam w spokojnej ___", "dzielnicy"),
      input("Uzupełnij: proszę o szybką ___ awarii", "naprawę"),
      choice("Od wczoraj nie działa ___.", ["ogrzewanie", "ogrzewania", "ogrzewaniem"], "ogrzewanie"),
      choice("Napisałem do właściciela ___ prośbą o kontakt.", ["z", "w", "do"], "z")
    ]),
    health: cap50([
      input("Uzupełnij: mam silny ból ___", "gardła"),
      input("Uzupełnij: po wizycie pójdę do ___", "apteki"),
      choice("Chcę umówić ___ u lekarza rodzinnego.", ["wizytę", "wizyta", "wizytą"], "wizytę"),
      choice("Potrzebuję ___ na badanie.", ["skierowania", "skierowanie", "skierowaniem"], "skierowania")
    ]),
    documents: cap50([
      input("Uzupełnij: trzeba wypełnić ___", "formularz"),
      input("Uzupełnij: na końcu trzeba odebrać ___", "dokument"),
      choice("Muszę dołączyć brakujący ___.", ["załącznik", "załącznika", "załącznikiem"], "załącznik"),
      choice("Proszę ___ informację o terminie odbioru.", ["o", "na", "z"], "o")
    ]),
    shopping: cap50([
      input("Uzupełnij: chcę złożyć ___ na produkt", "reklamację"),
      input("Uzupełnij: mam numer ___ i paragon", "zamówienia"),
      choice("Proszę o ___ pieniędzy.", ["zwrot", "zwrotem", "zwrotu"], "zwrot"),
      choice("Zapłaciłem ___ i wybrałem dostawę do punktu.", ["kartą", "kartę", "karty"], "kartą")
    ]),
    city: cap50([
      input("Uzupełnij: jadę do centrum ___", "tramwajem"),
      input("Uzupełnij: pytam o drogę do najbliższego ___", "dworca"),
      choice("Muszę kupić ___ w biletomacie.", ["bilet", "biletu", "biletem"], "bilet"),
      choice("Czekam ___ przystanku na autobus.", ["na", "w", "do"], "na")
    ]),
    education: cap50([
      input("Uzupełnij: przygotowuję się do ___ B1", "egzaminu"),
      input("Uzupełnij: analizuję swoje typowe ___", "błędy"),
      choice("Codziennie robię krótką ___.", ["powtórkę", "powtórka", "powtórce"], "powtórkę"),
      choice("Po egzaminie mogę dostać ___.", ["certyfikat", "certyfikatu", "certyfikatem"], "certyfikat")
    ]),
    relationships: cap50([
      input("Uzupełnij: ta rozmowa wymaga wzajemnego ___", "zaufania"),
      input("Uzupełnij: chcę okazać ci ___ za pomoc", "wdzięczność"),
      choice("Po kłótni warto spokojnie ___ sytuację.", ["wyjaśnić", "wyjaśnię", "wyjaśniać się"], "wyjaśnić"),
      choice("Poprosiłem przyjaciela ___ wsparcie.", ["o", "na", "z"], "o")
    ])
  };
  return blocks[key] || [];
}

function genThematicChoices(key) {
  const words = dict.thematicVocab[key] || [];
  return cap50(words.map(([pl, ru], index) => {
    const options = [pl, words[(index + 3) % words.length]?.[0], words[(index + 7) % words.length]?.[0]].filter(Boolean);
    return choice(`${ru}:`, shuffle(options), pl);
  }));
}

function genThematicReverseChoices(key) {
  const words = dict.thematicVocab[key] || [];
  return cap50(words.map(([pl, ru], index) => {
    const options = [ru, words[(index + 4) % words.length]?.[1], words[(index + 8) % words.length]?.[1]].filter(Boolean);
    return choice(`${pl}:`, shuffle(options), ru);
  }));
}

function genWritingTemplates() {
  return [
    note("E-mail formalny", "Dzień dobry,\n\npiszę w sprawie ...\nChciałbym/Chciałabym zapytać o ...\nCzy mogliby Państwo ...?\nZ góry dziękuję za odpowiedź.\n\nZ poważaniem,\n..."),
    note("Reklamacja", "Dzień dobry,\n\nchciałbym/chciałabym złożyć reklamację dotyczącą ...\nProdukt został kupiony ... Numer zamówienia to ...\nProblem polega na tym, że ...\nProszę o zwrot pieniędzy / wymianę produktu / naprawę.\n\nZ poważaniem,\n..."),
    note("Podanie / prośba", "Szanowni Państwo,\n\nzwracam się z prośbą o ...\nPotrzebuję tego dokumentu, ponieważ ...\nW załączniku przesyłam ...\nProszę o informację, kiedy mogę odebrać dokument.\n\nZ poważaniem,\n..."),
    note("Wiadomość nieformalna", "Cześć ...,\n\npiszę, bo ...\nNiestety nie mogę ...\nCzy możemy ...?\nDaj znać, czy Ci pasuje.\n\nPozdrawiam,\n...")
  ];
}

function genWritingTemplatePractice() {
  return repeatTo50([
    free("Użyj шаблона e-mail formalny: napisz do szkoły językowej i zapytaj o zmianę terminu kursu. 80–120 słów.", "Użyj: piszę w sprawie, chciałbym zapytać, czy mogliby Państwo, z góry dziękuję."),
    free("Użyj шаблона reklamacji: napisz do sklepu o problemie z zamówieniem. 80–120 słów.", "Użyj: chciałbym złożyć reklamację, problem polega na tym, proszę o, numer zamówienia."),
    free("Użyj шаблона podania: napisz do urzędu z prośbą o dokument. 80–120 słów.", "Użyj: zwracam się z prośbą, ponieważ, w załączniku, proszę o informację."),
    free("Użyj шаблона wiadomości nieformalnej: napisz do kolegi, że nie możesz przyjść i zaproponuj inny termin. 60–100 słów.", "Użyj: piszę, bo; niestety; czy możemy; daj znać.")
  ]);
}

function genWritingAssembly() {
  return cap50([
    input("Ułóż formalne zdanie: chciałbym / zapytać / o termin egzaminu", "chciałbym zapytać o termin egzaminu"),
    input("Ułóż formalne zdanie: zwracam się / z prośbą / o przesłanie dokumentu", "zwracam się z prośbą o przesłanie dokumentu"),
    input("Ułóż reklamację: problem / polega na tym / że produkt nie działa", "problem polega na tym, że produkt nie działa"),
    input("Ułóż zdanie: w załączniku / przesyłam / potwierdzenie opłaty", "w załączniku przesyłam potwierdzenie opłaty"),
    input("Ułóż zdanie: proszę / o informację / kiedy mogę odebrać dokument", "proszę o informację, kiedy mogę odebrać dokument"),
    input("Ułóż wiadomość: niestety / nie mogę przyjść / w piątek wieczorem", "niestety nie mogę przyjść w piątek wieczorem"),
    input("Ułóż zdanie: czy mogliby Państwo / potwierdzić / zmianę terminu", "czy mogliby Państwo potwierdzić zmianę terminu"),
    input("Ułóż zdanie: z góry / dziękuję / za odpowiedź", "z góry dziękuję za odpowiedź")
  ]);
}

function genReadingSignalsB1() {
  return [
    note("Jak czytać krótkie teksty użytkowe", "Во многих B1-заданиях попадаются не длинные статьи, а короткие сообщения: ogłoszenie, e-mail, informacja z urzędu, wiadomość od szkoły, reklama usługi.\n\nТут важно быстро понять 4 вещи:\n1. kto pisze\n2. do kogo\n3. w jakim celu\n4. co trzeba zrobić\n\nЭто уже не просто экзамен, а полезный навык для жизни: читать объявления, письма, сообщения из urzędu и szkoły."),
    choice("Komunikat: Prosimy pasażerów o skasowanie biletu zaraz po wejściu do autobusu. To jest:", ["instrukcja / zasada", "zaproszenie", "reklamacja"], "instrukcja / zasada"),
    choice("Wiadomość: Informujemy, że w piątek urząd będzie nieczynny. Główny cel tekstu to:", ["przekazać ważną informację organizacyjną", "sprzedać usługę", "opisać problem zdrowotny"], "przekazać ważną informację organizacyjną"),
    choice("E-mail: Proszę przesłać brakujący załącznik do końca dnia. Co trzeba zrobić?", ["wysłać załącznik", "odebrać dokument", "zrobić zakupy"], "wysłać załącznik"),
    choice("Ogłoszenie: Wynajmę pokój blisko centrum, tylko dla osoby pracującej. Czego dotyczy tekst?", ["wynajmu pokoju", "wizyty lekarskiej", "kursu językowego"], "wynajmu pokoju"),
    choice("SMS: Będę spóźniony około 20 minut, spotkajmy się przy wejściu głównym. Najważniejsza informacja to:", ["zmiana czasu spotkania", "opis pogody", "prośba o dokument"], "zmiana czasu spotkania"),
    choice("Informacja: Aby odebrać kartę pobytu, proszę przynieść paszport i potwierdzenie opłaty. Co trzeba mieć?", ["paszport i potwierdzenie opłaty", "receptę i bilet", "umowę i zdjęcie"], "paszport i potwierdzenie opłaty"),
    choice("Reklama: Kurs online obejmuje 30 lekcji, materiały PDF i konsultacje z nauczycielem. Co oferuje kurs?", ["lekcje, materiały i konsultacje", "nocleg i transport", "badania i receptę"], "lekcje, materiały i konsultacje"),
    input("Uzupełnij po polsku: główna informacja w krótkim tekście = ___ informacja", "kluczowa", "najważniejsza dla odpowiedzi"),
    input("Uzupełnij: kto pisze, do kogo, w jakim ___ i co trzeba zrobić", "celu", "to podstawa czytania B1")
  ];
}

function genListeningSignalsB1() {
  return [
    note("Jak słuchać krótkie komunikaty", "В B1-аудировании часто звучат короткие бытовые записи: telefon, komunikat, rejestracja, sklep, transport.\n\nНе надо слышать всё. Нужно быстро поймать:\n- miejsce\n- problem lub cel\n- termin / godzinę\n- działanie\n\nЭто учебный навык: так ты потом лучше понимаешь и реальные звонки, и официальные сообщения."),
    choice("Nagranie: Dzwonię, żeby potwierdzić wizytę na jutro. Najważniejsze jest to, że osoba:", ["potwierdza termin", "odwołuje egzamin", "szuka mieszkania"], "potwierdza termin"),
    choice("Nagranie: Proszę podejść do okienka numer trzy z dowodem osobistym. Co trzeba zrobić?", ["podejść do właściwego okienka", "zapłacić rachunek", "napisać reklamację"], "podejść do właściwego okienka"),
    choice("Nagranie: Spotkanie zostało przeniesione na czwartek o dziesiątej. Co jest kluczową informacją?", ["zmiana terminu", "opis osoby", "pogoda"], "zmiana terminu"),
    choice("Nagranie: Proszę przygotować numer rezerwacji i podejść do recepcji po osiemnastej. Co jest ważne?", ["trzeba mieć numer rezerwacji i przyjść po 18:00", "trzeba wysłać CV", "trzeba kupić bilet miesięczny"], "trzeba mieć numer rezerwacji i przyjść po 18:00"),
    choice("Nagranie: Z powodu remontu zajęcia odbędą się dziś online. Czego dotyczy komunikat?", ["zmiany organizacyjnej", "wizyty w banku", "zakupów spożywczych"], "zmiany organizacyjnej"),
    choice("Nagranie: Proszę przyjść na badanie na czczo jutro rano. Co trzeba zrobić?", ["przyjść rano bez jedzenia", "przyjść wieczorem po kolacji", "odesłać formularz pocztą"], "przyjść rano bez jedzenia"),
    choice("Nagranie: Jeśli paczka nie dotrze do piątku, prosimy o kontakt z infolinią. Co trzeba zrobić w razie problemu?", ["skontaktować się z infolinią", "złożyć podanie w urzędzie", "zapłacić mandat"], "skontaktować się z infolinią"),
    input("Uzupełnij: w słuchaniu najpierw łapiemy ogólną ___ sytuacji", "logikę", "nie każde pojedyncze słowo"),
    input("Uzupełnij: potem sprawdzamy miejsce, cel, godzinę i ___", "działanie", "co trzeba zrobić")
  ];
}

function genExamGrammarGuide() {
  return [
    note("Jak działa poprawność gramatyczna B1", "В заданиях на poprawność gramatyczną редко спрашивают правило в вакууме. Обычно нужно выбрать форму по контексту.\n\nРабочий порядок:\n1. найди глагол или связку\n2. задай вопрос: kogo? komu? gdzie? kiedy? po co?\n3. реши, нужен ли падеж, время, аспект или связка\n4. только потом выбирай форму\n\nЭто учебный навык, который полезен не только для теста, но и для письма, речи и чтения."),
    choice("Что лучше делать первым в грамматическом задании?", ["понять, что именно требует контекст", "смотреть только на окончание", "искать самое длинное слово"], "понять, что именно требует контекст"),
    choice("Фраза `pomagam ...` чаще всего требует:", ["celownik", "biernik", "miejscownik"], "celownik"),
    choice("Фраза `jutro ... raport do końca` чаще тянет к:", ["rezultatowi / aspektowi dokonanemu", "miejscownikowi", "liczbie mnogiej"], "rezultatowi / aspektowi dokonanemu"),
    choice("Фраза `mieszkam w ...` чаще всего требует:", ["miejscownik", "biernik", "celownik"], "miejscownik"),
    choice("Фраза `szukam ...` чаще всего требует:", ["dopełniacz", "narzędnik", "mianownik"], "dopełniacz"),
    choice("Фраза `jestem nauczycielem` показывает, что после `jestem` тут нужен:", ["narzędnik", "biernik", "celownik"], "narzędnik"),
    input("Uzupełnij po rosyjskiej podpowiedzi: najpierw rozumiem ___, potem wybieram formę", "kontekst", "to podstawa B1"),
    input("Uzupełnij: po czasowniku zadaję pytanie i dopiero potem wybieram ___", "formę", "nie odwrotnie")
  ];
}

function genExamGrammarSkills() {
  return cap50([
    choice("Nie mam ___ na spotkanie.", ["czasu", "czas", "czasem"], "czasu"),
    choice("Jutro ___ ten formularz do końca.", ["wypełnię", "wypełniać", "wypełniałem"], "wypełnię"),
    choice("Rozmawiam z ___ o nowej umowie.", ["kierownikiem", "kierownik", "kierownika"], "kierownikiem"),
    choice("Mieszkam ___ centrum miasta.", ["w", "do", "z"], "w"),
    choice("To są bardzo ___ studenci.", ["dobrzy", "dobre", "dobrego"], "dobrzy"),
    choice("Podoba ___ ten kurs.", ["mi się", "się mi", "mnie się"], "mi się"),
    choice("Nie mogłem przyjść, ___ miałem wizytę u lekarza.", ["ponieważ", "jednak", "oprócz tego"], "ponieważ"),
    choice("Jeśli będę mieć czas, ___ do ciebie wieczorem.", ["zadzwonię", "dzwonię", "dzwoniłem"], "zadzwonię"),
    choice("Szukam ___ w centrum.", ["mieszkania", "mieszkanie", "mieszkaniem"], "mieszkania"),
    choice("Wczoraj ___ bardzo zmęczona.", ["byłam", "jestem", "będę"], "byłam"),
    choice("Jutro ___ do urzędu rano.", ["pójdę", "idę wczoraj", "chodziłem"], "pójdę"),
    choice("Uczę się polskiego, ___ chcę zdać egzamin B1.", ["ponieważ", "natomiast", "mimo to"], "ponieważ"),
    choice("To są bardzo ___ dokumenty.", ["ważne", "ważni", "ważnego"], "ważne"),
    choice("Muszę porozmawiać z ___ o terminie kursu.", ["nauczycielem", "nauczyciela", "nauczycielowi"], "nauczycielem"),
    choice("Idę ___ spacer po pracy.", ["na", "w", "z"], "na"),
    choice("Podoba ___ nowy plan zajęć.", ["mi się", "mnie z", "jej się do"], "mi się"),
    choice("W weekend będę ___ teksty i robić notatki.", ["czytać", "przeczytam", "czytałem"], "czytać"),
    choice("Potrzebuję ___ z banku.", ["potwierdzenia", "potwierdzenie", "potwierdzeniem"], "potwierdzenia"),
    choice("Kiedy wróciłem do domu, ___ kolację.", ["zjadłem", "jem", "zjem"], "zjadłem"),
    choice("Moja siostra jest ___ ode mnie.", ["młodsza", "młoda niż", "najmłoda"], "młodsza"),
    input("Uzupełnij: potrzebuję (pomoc)", "pomocy"),
    input("Uzupełnij: jutro (napisać raport do końca)", "jutro napiszę raport do końca"),
    input("Uzupełnij: mieszkam w (duże miasto)", "dużym mieście"),
    input("Uzupełnij: pomagam (mój kolega)", "mojemu koledze"),
    input("Uzupełnij: rozmawiam z (miła nauczycielka)", "miłą nauczycielką"),
    input("Uzupełnij: nie mam (wolny czas)", "wolnego czasu")
  ]);
}

function genExamGrammarContext() {
  return [
    note("Gramatyka w kontekście", "Здесь мы тренируем тот же материал, но уже внутри жизненных ситуаций: urząd, mieszkanie, praca, szkoła językowa. Так правило перестаёт быть сухим и начинает работать как часть реальной речи."),
    input("Urząd: Chciałbym złożyć ___ o wydanie dokumentu.", "wniosek"),
    input("Mieszkanie: Wczoraj rozmawiałem z ___ o awarii ogrzewania.", "właścicielem"),
    input("Praca: Nie mam dziś ___ na długie spotkanie.", "czasu"),
    input("Szkoła: Czy mogę zapisać się ___ egzamin B1 w czerwcu?", "na"),
    choice("Sklep: Chcę ___ ten produkt, bo nie działa.", ["zwrócić", "zwracać", "zwracałem"], "zwrócić"),
    choice("Lekarz: Potrzebuję ___ na badanie.", ["skierowania", "skierowanie", "skierowaniem"], "skierowania"),
    choice("Transport: Tramwaj jest opóźniony, ___ pojadę autobusem.", ["dlatego", "jednak", "ponieważ"], "dlatego"),
    choice("Mail: W załączniku przesyłam dokumenty i proszę ___ odpowiedź.", ["o", "na", "z"], "o"),
    input("Przychodnia: Chciałabym przełożyć ___ na czwartek.", "wizytę"),
    input("Bank: Nie mogę zrobić ___ przez aplikację.", "przelewu"),
    input("Mieszkanie: W kuchni kapie ___ pod zlewem.", "woda"),
    input("Szkoła: Codziennie robię krótkie ___ ze słuchania.", "dyktanda"),
    choice("Urząd: Proszę podpisać formularz i dołączyć ___ paszportu.", ["kopię", "kopia", "kopią"], "kopię"),
    choice("Praca: Jutro ___ raport do końca dnia.", ["przygotuję", "przygotowywać", "przygotowałem"], "przygotuję"),
    choice("Transport: Muszę się ___ na tramwaj przy dworcu.", ["przesiąść", "przesiadka", "przesiadłem"], "przesiąść"),
    choice("Sklep internetowy: Numer zamówienia jest potrzebny, ___ złożyć reklamację.", ["żeby", "jednak", "natomiast"], "żeby")
  ];
}

function genWritingTaskAnalysis() {
  return [
    note("Jak rozłożyć polecenie pisemne", "Перед письмом полезно не писать сразу, а разложить zadanie на пункты.\n\nНапример:\n- wyjaśnij problem\n- podaj 2 szczegóły\n- poproś o rozwiązanie\n- zakończ grzecznie\n\nТакой разбор делает письмо намного легче и учит думать по-польски структурно."),
    choice("Polecenie: napisz do właściciela o awarii i poproś o naprawę. Co musi być w tekście?", ["problem i prośba o rozwiązanie", "opis pogody", "plan wakacji"], "problem i prośba o rozwiązanie"),
    choice("Polecenie: napisz do szkoły i zapytaj o nowy termin. Co jeszcze warto dodać?", ["krótki powód zmiany", "przepis na obiad", "opis rodziny"], "krótki powód zmiany"),
    input("Uzupełnij po polsku: najpierw analizuję ___, potem piszę", "polecenie")
  ];
}

function genTopicSpeaking(key) {
  const prompts = {
    work: ["Opisz swoją pracę albo pracę, której szukasz. Użyj: stanowisko, obowiązki, zespół, termin.", "Napisz wiadomość do kierownika: chcesz wziąć urlop i wyjaśniasz dlaczego."],
    housing: ["Opisz mieszkanie, które chcesz wynająć. Użyj: czynsz, kaucja, ogrzewanie, dzielnica.", "Napisz wiadomość do właściciela o awarii w mieszkaniu."],
    health: ["Opisz problem zdrowotny w rejestracji. Użyj: ból, gorączka, wizyta, recepta.", "Napisz krótką wiadomość: chcesz umówić się do lekarza rodzinnego."],
    documents: ["Opisz wizytę w urzędzie. Użyj: wniosek, formularz, podpis, załącznik.", "Napisz pytanie do urzędu: kiedy możesz odebrać dokument."],
    shopping: ["Opisz reklamację w sklepie. Użyj: paragon, gwarancja, zwrot, wymiana.", "Napisz wiadomość do sklepu internetowego o dostawie."],
    city: ["Wyjaśnij komuś, jak dojechać do centrum. Użyj: przystanek, przesiadka, tramwaj, bilet.", "Opisz problem z dojazdem: korek, spóźnienie, rozkład jazdy."],
    education: ["Opisz swój plan przygotowania do egzaminu B1. Użyj: poziom, powtórka, słownictwo, postęp.", "Napisz wiadomość do nauczyciela: chcesz zapytać o wynik i typowe błędy."],
    relationships: ["Opisz trudną rozmowę z bliską osobą. Użyj: zaufanie, wsparcie, decyzja, przeprosiny.", "Napisz wiadomość do znajomego: chcesz przeprosić i zaproponować spotkanie."],
    travel: ["Opisz plan podróży. Użyj: rezerwacja, nocleg, bagaż, zwiedzanie.", "Napisz wiadomość do hotelu: Twój lot jest opóźniony i przyjedziesz później."],
    food: ["Opisz wizytę w restauracji. Użyj: menu, składnik, danie, rachunek.", "Napisz wiadomość do restauracji: chcesz zarezerwować stolik i masz pytanie o alergię."],
    technology: ["Opisz problem techniczny. Użyj: hasło, konto, połączenie, plik.", "Napisz wiadomość do pomocy technicznej: aplikacja nie działa po aktualizacji."],
    argumentation: ["Napisz opinię: czy nauka online jest skuteczna? Użyj: argument, przykład, zaleta, wada, wniosek.", "Porównaj życie w małym mieście i dużym mieście. Użyj: różnica, podobieństwo, wpływ, rozwiązanie."],
    finance: ["Opisz swój miesięczny budżet. Użyj: dochód, wydatek, oszczędności, opłata.", "Napisz wiadomość do banku: masz problem z przelewem albo kartą płatniczą."],
    family: ["Opisz swoją rodzinę albo ważną osobę z rodziny. Użyj: pokolenie, wsparcie, obowiązek, uroczystość.", "Napisz zaproszenie na rodzinną rocznicę albo spotkanie."],
    daily: ["Opisz swój zwykły dzień. Użyj: poranek, plan dnia, przerwa, odpoczynek.", "Napisz wiadomość: spóźnisz się, bo masz dużo obowiązków domowych."],
    nature: ["Opisz pogodę i swoje plany na weekend. Użyj: prognoza, deszcz, wiatr, krajobraz.", "Napisz krótką relację z wycieczki nad jezioro, do lasu albo w góry."],
    culture: ["Opowiedz o filmie, książce albo koncercie. Użyj: autor, bohater, recenzja, publiczność.", "Napisz wiadomość do znajomego: zaproś go na wydarzenie kulturalne."],
    leisure: ["Opisz swoje hobby i czas wolny. Użyj: zainteresowanie, trening, relaks, pasja.", "Zaproponuj znajomemu wspólną aktywność w weekend."],
    safety: ["Opisz sytuację awaryjną. Użyj: wypadek, świadek, pomoc, numer alarmowy.", "Napisz zgłoszenie: zgubiłeś dokument albo byłeś świadkiem kradzieży."],
    society: ["Opisz problem społeczny w swoim mieście. Użyj: mieszkaniec, komunikacja, jakość życia, rozwiązanie.", "Napisz opinię: czy wolontariat pomaga w integracji?"],
    personality: ["Opisz swój charakter i cechy, które pomagają ci w pracy albo nauce.", "Opisz osobę, którą lubisz. Użyj: odpowiedzialny, uczciwy, pomocny, zabawny."],
    environment: ["Opisz, jak dbasz o środowisko. Użyj: segregacja śmieci, recykling, transport publiczny.", "Napisz opinię: co miasto może zrobić, żeby zmniejszyć smog i hałas?"]
  };
  return repeatTo50((prompts[key] || []).map((prompt) => free(prompt, "Ответ свободный. Напиши 5–8 предложений и используй минимум 4 слова из темы.")));
}

function genExamReading() {
  return cap50([
    choice("Tekst: Anna wynajmuje mieszkanie blisko centrum. Czynsz jest wysoki, ale dojazd do pracy zajmuje tylko 15 minut. Co jest plusem mieszkania?", ["niski czynsz", "dobry dojazd", "duży balkon"], "dobry dojazd"),
    choice("Tekst: Marek musi złożyć wniosek w urzędzie do piątku. Brakuje mu jednego załącznika. Co Marek powinien przygotować?", ["załącznik", "paragon", "receptę"], "załącznik"),
    choice("Tekst: Sklep przyjmie zwrot tylko z paragonem i w ciągu 14 dni. Co jest potrzebne do zwrotu?", ["recepta", "paragon", "skierowanie"], "paragon"),
    choice("Tekst: Lekarz powiedział, że wyniki badań będą gotowe jutro po południu. Kiedy będą wyniki?", ["dzisiaj rano", "jutro po południu", "za tydzień"], "jutro po południu"),
    choice("Tekst: Autobus numer 128 nie jedzie dziś przez centrum z powodu remontu. Pasażerowie muszą się przesiąść na tramwaj. Co trzeba zrobić?", ["kupić mieszkanie", "przesiąść się", "złożyć wniosek"], "przesiąść się"),
    choice("Tekst: Firma szuka pracownika z doświadczeniem i dobrą znajomością języka polskiego. Czego wymaga firma?", ["doświadczenia", "zwolnienia lekarskiego", "kaucji"], "doświadczenia"),
    choice("Tekst: Szkoła językowa informuje, że termin egzaminu został przeniesiony z maja na czerwiec. Co się zmieniło?", ["poziom kursu", "termin egzaminu", "nauczyciel"], "termin egzaminu"),
    choice("Tekst: W restauracji trzeba wcześniej zarezerwować stolik, bo w sobotę jest dużo gości. Co trzeba zrobić?", ["zarezerwować stolik", "zapłacić mandat", "zmienić hasło"], "zarezerwować stolik"),
    choice("Tekst: Aplikacja nie działa po aktualizacji. Użytkownik nie może wysłać załącznika. Jaki jest problem?", ["problem techniczny", "problem zdrowotny", "problem z czynszem"], "problem techniczny"),
    choice("Tekst: Mieszkańcy skarżą się na smog i hałas przy głównej ulicy. Czego dotyczy tekst?", ["środowiska i miasta", "urlopu", "reklamacji sklepowej"], "środowiska i miasta"),
    choice("Tekst: Kasia odkłada część wypłaty, bo chce mieć oszczędności na kurs i egzamin. Co robi Kasia?", ["oszczędza pieniądze", "zgłasza kradzież", "szuka noclegu"], "oszczędza pieniądze"),
    choice("Tekst: Muzeum zaprasza na wystawę w piątek o osiemnastej. Wstęp jest bezpłatny. Gdzie odbędzie się wydarzenie?", ["w muzeum", "w banku", "w przychodni"], "w muzeum"),
    choice("Tekst: Świadek wypadku powinien zadzwonić pod numer alarmowy i poczekać na pomoc. Co powinien zrobić świadek?", ["wezwać pomoc", "kupić bilet", "napisać recenzję"], "wezwać pomoc"),
    choice("Tekst: Michał jest punktualny, odpowiedzialny i dokładny, dlatego kierownik powierza mu trudne zadania. Jaki jest Michał?", ["odpowiedzialny", "opóźniony", "odwołany"], "odpowiedzialny"),
    choice("Tekst: Wolontariat pomaga nowym mieszkańcom poznać miasto i szybciej się zintegrować. W czym pomaga wolontariat?", ["w integracji", "w naprawie telefonu", "w zamówieniu dania"], "w integracji"),
    choice("Tekst: Prognoza zapowiada burzę i silny wiatr, więc wycieczka rowerowa została odwołana. Dlaczego odwołano wycieczkę?", ["z powodu pogody", "z powodu podatku", "z powodu paragonu"], "z powodu pogody")
  ]);
}

function genLongReading() {
  const texts = [
    {
      title: "Czytanie: budżet domowy",
      body: "Paweł od trzech miesięcy zapisuje wszystkie wydatki, bo chce lepiej kontrolować budżet. Najwięcej pieniędzy wydaje na czynsz, rachunek za prąd, jedzenie i transport publiczny. Zauważył, że małe zakupy robione codziennie kosztują więcej niż jeden większy zakup spożywczy raz w tygodniu. Dlatego postanowił planować posiłki, korzystać ze zniżek i odkładać część wypłaty na oszczędności. Nie chce brać pożyczki, jeśli nie będzie to konieczne.",
      qs: [
        choice("Paweł zapisuje wydatki, ponieważ chce:", ["lepiej kontrolować budżet", "zmienić mieszkanie", "kupić bilet do teatru"], "lepiej kontrolować budżet"),
        choice("Najwięcej pieniędzy wydaje między innymi na:", ["czynsz i jedzenie", "koncerty i muzeum", "mandaty i prezenty"], "czynsz i jedzenie"),
        input("Jak po polsku w tekście jest 'сбережения'?", "oszczędności")
      ]
    },
    {
      title: "Czytanie: życie w mieście",
      body: "Nowi mieszkańcy często mówią, że największym problemem miasta nie jest praca, ale codzienna organizacja życia. Trzeba poznać komunikację miejską, znaleźć przychodnię, urząd, szkołę dla dziecka i dobre miejsce na zakupy. Integracja jest łatwiejsza, kiedy sąsiedzi pomagają sobie nawzajem, a lokalna wspólnota organizuje spotkania albo wolontariat. Dzięki temu cudzoziemiec szybciej rozumie zasady i czuje, że ma wpływ na jakość życia w swojej dzielnicy.",
      qs: [
        choice("Według tekstu integracja jest łatwiejsza, kiedy:", ["ludzie sobie pomagają", "rachunki są droższe", "autobus się spóźnia"], "ludzie sobie pomagają"),
        choice("Tekst mówi głównie o:", ["życiu społecznym w mieście", "reklamacji produktu", "wizycie u lekarza"], "życiu społecznym w mieście"),
        input("Jak po polsku w tekście jest 'качество жизни'?", "jakość życia")
      ]
    },
    {
      title: "Czytanie: środowisko",
      body: "W wielu miastach mieszkańcy coraz częściej rozmawiają o środowisku. Smog, hałas i brak zielonej przestrzeni wpływają na zdrowie oraz codzienny odpoczynek. Miasto może sadzić drzewa, rozwijać transport publiczny i tworzyć bezpieczne drogi rowerowe. Mieszkańcy też mają wpływ na sytuację: mogą segregować śmieci, ograniczać plastik i oszczędzać wodę. Takie działania nie rozwiązują wszystkiego od razu, ale uczą odpowiedzialnych wyborów.",
      qs: [
        choice("Co wpływa na zdrowie mieszkańców?", ["smog i hałas", "recenzja filmu", "termin egzaminu"], "smog i hałas"),
        choice("Mieszkańcy mogą między innymi:", ["segregować śmieci", "odwołać lot", "złożyć reklamację"], "segregować śmieci"),
        input("Jak po polsku w tekście jest 'ответственный выбор'?", "odpowiedzialny wybór")
      ]
    },
    {
      title: "Czytanie: kurs i egzamin",
      body: "Magda przygotowuje się do egzaminu B1 i wie, że sama gramatyka nie wystarczy. Każdego dnia czyta krótki tekst, wypisuje nowe słownictwo i dodaje słowa do własnego słownika. Potem robi powtórkę: najpierw wybiera poprawne tłumaczenie, a następnie pisze słowo bez podpowiedzi. Nauczyciel sprawdza jej wypowiedzi pisemne i pokazuje typowe błędy. Dzięki temu Magda widzi postęp i lepiej rozumie wymagania egzaminu.",
      qs: [
        choice("Magda dodaje nowe słowa do:", ["własnego słownika", "paragonu", "rozkładu jazdy"], "własnego słownika"),
        choice("Nauczyciel pomaga jej znaleźć:", ["typowe błędy", "tańszy czynsz", "zaginiony dokument"], "typowe błędy"),
        input("Jak po polsku w tekście jest 'требования экзамена'?", "wymagania egzaminu")
      ]
    },
    {
      title: "Czytanie: kultura i wolny czas",
      body: "W sobotę grupa znajomych poszła na wydarzenie kulturalne w centrum miasta. Najpierw obejrzeli wystawę w muzeum, potem poszli na koncert młodego autora piosenek. Po koncercie rozmawiali o tym, jak reagowała publiczność i czy warto napisać krótką recenzję w mediach społecznościowych. Dla Ani taki czas wolny jest lepszy niż zwykłe zakupy, bo daje relaks, nowe tematy do rozmowy i inspirację do nauki języka.",
      qs: [
        choice("Znajomi najpierw poszli:", ["do muzeum", "do banku", "na policję"], "do muzeum"),
        choice("Ania uważa, że taki czas wolny daje:", ["relaks i inspirację", "mandat i pożyczkę", "gorączkę i kaszel"], "relaks i inspirację"),
        input("Jak po polsku w tekście jest 'социальные сети'?", "media społecznościowe")
      ]
    },
    {
      title: "Czytanie: bezpieczeństwo",
      body: "Po południu na skrzyżowaniu doszło do wypadku. Jeden kierowca nie zauważył znaku zakazu i uderzył w rowerzystę. Świadek zadzwonił pod numer alarmowy, opisał miejsce zdarzenia i poczekał na policję oraz pogotowie. Rowerzysta miał ubezpieczenie, ale najbardziej potrzebował szybkiej pomocy. Policjant poprosił świadka o krótkie zgłoszenie i przypomniał, że ostrożność na drodze jest obowiązkiem każdego uczestnika ruchu.",
      qs: [
        choice("Świadek zadzwonił:", ["pod numer alarmowy", "do restauracji", "do szkoły językowej"], "pod numer alarmowy"),
        choice("Rowerzysta najbardziej potrzebował:", ["szybkiej pomocy", "recenzji", "zniżki"], "szybkiej pomocy"),
        input("Jak po polsku w tekście jest 'свидетель'?", "świadek")
      ]
    }
  ];
  return repeatTo50(texts.flatMap((text) => [note(text.title, text.body), ...text.qs]));
}

function genExamListening() {
  return cap50([
    choice("Nagranie: Dzień dobry, dzwonię, żeby przełożyć wizytę u lekarza z wtorku na czwartek. Co chce zrobić osoba?", ["odwołać zakupy", "przełożyć wizytę", "wynająć mieszkanie"], "przełożyć wizytę"),
    choice("Nagranie: Pociąg do Krakowa jest opóźniony o dwadzieścia minut. Co się stało?", ["pociąg jest opóźniony", "pociąg już odjechał", "bilet jest nieważny"], "pociąg jest opóźniony"),
    choice("Nagranie: Proszę podpisać formularz na dole strony i dołączyć kopię paszportu. Co trzeba dołączyć?", ["kopię paszportu", "paragon", "wyniki badań"], "kopię paszportu"),
    choice("Nagranie: Spotkanie zespołu zacznie się o dziewiątej w sali numer trzy. O której zacznie się spotkanie?", ["o ósmej", "o dziewiątej", "o trzynastej"], "o dziewiątej"),
    choice("Nagranie: Reklamację można złożyć przez formularz internetowy albo w sklepie. Gdzie można złożyć reklamację?", ["tylko w aptece", "przez formularz albo w sklepie", "tylko telefonicznie"], "przez formularz albo w sklepie")
  ]);
}

function genAudioListening() {
  const recordings = [
    {
      title: "Audio 1: przychodnia",
      script: "Dzień dobry, chciałabym przełożyć wizytę u lekarza rodzinnego z wtorku na czwartek. Mam gorączkę i kaszel, ale jutro nie mogę przyjść, bo pracuję do osiemnastej. Czy jest wolny termin po południu?",
      questions: [
        choice("Co chce zrobić osoba?", ["przełożyć wizytę", "odebrać dokument", "zarezerwować hotel"], "przełożyć wizytę"),
        choice("Kiedy osoba nie może przyjść?", ["jutro", "w czwartek", "w weekend"], "jutro"),
        input("Dyktando: napisz słowo 'gorączka'", "gorączka")
      ]
    },
    {
      title: "Audio 2: mieszkanie",
      script: "Dzień dobry, dzwonię w sprawie mieszkania. Od wczoraj nie działa ogrzewanie, a w kuchni kapie woda pod zlewem. Czynsz zapłaciłem w terminie, dlatego proszę o szybki kontakt z właścicielem albo administracją.",
      questions: [
        choice("Jaki jest główny problem?", ["awaria w mieszkaniu", "brak umowy", "za wysoki rachunek"], "awaria w mieszkaniu"),
        choice("Co nie działa?", ["ogrzewanie", "internet", "domofon"], "ogrzewanie"),
        input("Dyktando: napisz słowo 'właściciel'", "właściciel")
      ]
    },
    {
      title: "Audio 3: transport",
      script: "Uwaga, pasażerowie. Tramwaj numer dziewięć w kierunku centrum jest opóźniony o piętnaście minut z powodu awarii na trasie. Osoby jadące na dworzec mogą przesiąść się do autobusu numer sto dwadzieścia.",
      questions: [
        choice("Co jest opóźnione?", ["tramwaj", "pociąg", "samolot"], "tramwaj"),
        choice("Ile wynosi opóźnienie?", ["piętnaście minut", "pół godziny", "godzinę"], "piętnaście minut"),
        input("Dyktando: napisz słowo 'przesiąść'", "przesiąść")
      ]
    },
    {
      title: "Audio 4: sklep",
      script: "Dzień dobry, chciałabym złożyć reklamację. Kupiłam ten czajnik trzy dni temu, ale urządzenie nie działa. Mam paragon i oryginalne opakowanie. Chciałabym wymienić produkt albo otrzymać zwrot pieniędzy.",
      questions: [
        choice("Co chce zrobić klientka?", ["złożyć reklamację", "kupić prezent", "zamówić dostawę"], "złożyć reklamację"),
        choice("Jaki dokument ma klientka?", ["paragon", "paszport", "wniosek"], "paragon"),
        input("Dyktando: napisz słowo 'urządzenie'", "urządzenie")
      ]
    },
    {
      title: "Audio 5: szkoła",
      script: "W przyszłym miesiącu zapisuję się na egzamin B1. Najbardziej boję się słuchania, dlatego codziennie powtarzam słownictwo, robię krótkie dyktanda i słucham prostych nagrań bez tekstu.",
      questions: [
        choice("Na jaki egzamin zapisuje się osoba?", ["B1", "prawo jazdy", "maturę"], "B1"),
        choice("Czego osoba boi się najbardziej?", ["słuchania", "pisania", "czytania"], "słuchania"),
        input("Dyktando: napisz słowo 'słownictwo'", "słownictwo")
      ]
    },
    {
      title: "Audio 6: bank",
      script: "Dzień dobry, mam problem z kartą. Chciałem zrobić przelew, ale aplikacja bankowa pokazuje błąd. Czy mogę tymczasowo zablokować kartę i sprawdzić ostatnie płatności na koncie?",
      questions: [
        choice("Z czym osoba ma problem?", ["z kartą", "z mieszkaniem", "z wizytą"], "z kartą"),
        choice("Co pokazuje aplikacja?", ["błąd", "nową ofertę", "adres banku"], "błąd"),
        input("Dyktando: napisz słowo 'przelew'", "przelew")
      ]
    },
    {
      title: "Audio 7: technologia",
      script: "Nie mogę wysłać załącznika, bo plik jest za duży. Spróbuję spakować dokumenty albo wysłać link. Jeśli wiadomość nie dojdzie, zadzwonię do działu technicznego.",
      questions: [
        choice("Dlaczego osoba nie może wysłać załącznika?", ["plik jest za duży", "nie zna adresu", "telefon jest wyłączony"], "plik jest za duży"),
        choice("Co może wysłać zamiast pliku?", ["link", "paragon", "bilet"], "link"),
        input("Dyktando: napisz słowo 'załącznik'", "załącznik")
      ]
    },
    {
      title: "Audio 8: środowisko",
      script: "Coraz więcej mieszkańców wybiera transport publiczny, bo w centrum jest duży smog i trudno znaleźć miejsce parkingowe. Miasto planuje też nowe ścieżki rowerowe i lepszą segregację odpadów.",
      questions: [
        choice("Co wybiera coraz więcej mieszkańców?", ["transport publiczny", "droższe mieszkania", "zakupy online"], "transport publiczny"),
        choice("Jaki problem jest w centrum?", ["smog", "brak szkół", "za dużo sklepów"], "smog"),
        input("Dyktando: napisz słowo 'segregacja'", "segregacja")
      ]
    },
    {
      title: "Audio 9: restauracja",
      script: "Dobry wieczór, mam rezerwację na nazwisko Kowalski. Prosiłem o stolik przy oknie, ponieważ jedna osoba z naszej grupy ma alergię na orzechy i chcemy spokojnie porozmawiać z kelnerem o składnikach.",
      questions: [
        choice("Gdzie ma być stolik?", ["przy oknie", "na tarasie", "przy wejściu"], "przy oknie"),
        choice("Na co ktoś ma alergię?", ["na orzechy", "na mleko", "na ryby"], "na orzechy"),
        input("Dyktando: napisz słowo 'składniki'", "składniki")
      ]
    },
    {
      title: "Audio 10: praca",
      script: "Cześć, musimy przełożyć spotkanie zespołu, bo raport nie jest jeszcze gotowy. Nowy termin to piątek o dziesiątej. Proszę przygotować krótkie podsumowanie i wysłać je przed końcem dnia.",
      questions: [
        choice("Dlaczego trzeba przełożyć spotkanie?", ["raport nie jest gotowy", "biuro jest zamknięte", "klient odwołał umowę"], "raport nie jest gotowy"),
        choice("Kiedy jest nowy termin?", ["w piątek o dziesiątej", "we wtorek o ósmej", "w sobotę wieczorem"], "w piątek o dziesiątej"),
        input("Dyktando: napisz słowo 'podsumowanie'", "podsumowanie")
      ]
    }
  ];

  return repeatTo50(recordings.flatMap((recording) => [
    audio(recording.title, recording.script),
    ...recording.questions
  ]));
}

function genUczmySiePolskiego() {
  return [
    note(
      "Uczmy się polskiego — jak pracować z serialem",
      "To jest klasyczny serial edukacyjny do nauki polskiego. Najlepiej pracować tak: 1) obejrzyj 10-15 minut bez zatrzymywania, 2) obejrzyj drugi raz i wypisz 5-10 fraz, 3) dodaj nowe słowa do słownika, 4) wróć do odcinka po 2-3 dniach. Najpierw bierz odcinki 1-15, bo to kurs podstawowy i bardziej pasuje do naszego A2-B1.",
      [],
      [
        { label: "Playlist YouTube: Uczmy się polskiego (30 odcinków)", url: "https://www.youtube.com/watch?v=NOJVwQK1pOE&list=PLsqlYowH737T5hAxqs0wja9niCQoEGg7I" },
        { label: "Opis kursu Uniwersytetu Śląskiego", url: "https://www.sjikp.us.edu.pl/pl/uczmy-sie-polskiego-1-kurs-podstawowy-lets-learn-polish-basic/" }
      ]
    ),
    note(
      "Startowe odcinki z bezpośrednimi linkami",
      "Zacznij od odcinków codziennych i praktycznych. One dobrze rozwijają słownictwo o rodzinie, mieszkaniu, telefonie, drodze, zakupach, zdrowiu i podróży.",
      [],
      [
        { label: "Odcinek 1 — Nowi lokatorzy", url: "https://www.youtube.com/watch?v=NOJVwQK1pOE" },
        { label: "Odcinek 2 — Pierwsze kłopoty", url: "https://www.youtube.com/watch?v=mbv404A-n1s" },
        { label: "Odcinek 3 — Halo, tu mieszkanie Grzegorzewskich", url: "https://www.youtube.com/watch?v=SJWJY-1GlQM" },
        { label: "Odcinek 4 — Jak znaleźć dom cioci Ani", url: "https://www.youtube.com/watch?v=2pIcsFGZzA0" },
        { label: "Odcinek 7 — Szpital w domu", url: "https://www.youtube.com/watch?v=MzFTzAzC8HA" },
        { label: "Odcinek 9 — Podróżująca rodzinka", url: "https://www.youtube.com/watch?v=5k_kwFiXnFM" }
      ]
    ),
    note(
      "Plan odcinków 1-15",
      "1. Nowi lokatorzy\n2. Pierwsze kłopoty\n3. Halo, tu mieszkanie Grzegorzewskich\n4. Jak znaleźć dom cioci Ani\n5. Zakupy\n6. Proszę nie ruszać moich rzeczy\n7. Szpital w domu\n8. Wesołych świąt\n9. Podróżująca rodzinka\n10. Kto jest lepszy\n11. Prezent urodzinowy\n12. Witamy w Warszawie\n13. Musimy się lepiej poznać\n14. Rozstania i powroty\n15. Ach, co to będzie za ślub",
      [],
      [
        { label: "Otwórz playlistę i wybierz odcinek 1-15", url: "https://www.youtube.com/watch?v=NOJVwQK1pOE&list=PLsqlYowH737T5hAxqs0wja9niCQoEGg7I" },
        { label: "Podręcznik / teksty — część 1", url: "https://docer.pl/doc/xncxv8" },
        { label: "Podręcznik / teksty — część 2", url: "https://docer.pl/doc/x8v8x0e" }
      ]
    ),
    note(
      "Plan odcinków 16-30",
      "16. Każdy chce czego innego\n17. Propozycja nie do odrzucenia\n18. Świetny pomysł\n19. Droga pełna przeszkód\n20. Ach, co to był za ślub\n21. Pierwsze małżeńskie problemy\n22. Dobrze, powtórzę\n23. Niech żyje socjologia\n24. Gdzie mamy mieszkać\n25. Szukam pracy\n26. On to powiedział\n27. Proszę o spokój\n28. Kłopoty z pogodą\n29. Plany na przyszłość\n30. Pożegnanie",
      [],
      [
        { label: "Otwórz playlistę i wybierz odcinek 16-30", url: "https://www.youtube.com/watch?v=NOJVwQK1pOE&list=PLsqlYowH737T5hAxqs0wja9niCQoEGg7I" }
      ]
    ),
    free("Po obejrzeniu odcinka napisz 2-4 zdania: o czym był odcinek, jakie 3 nowe słowa zapamiętałeś i jaka scena była dla ciebie najłatwiejsza do zrozumienia.", "Użyj minimum 1 связку: ponieważ / dlatego / jednak / oprócz tego."),
    free("Po 2-3 odcinkach napisz krótki komentarz: które tematy rozumiesz już lepiej dzięki serialowi — mieszkanie, zakupy, zdrowie, podróż czy rodzina?", "Napisz 4-6 zdań i dodaj 3 polskie frazy z serialu.")
  ];
}

function genPrivateCourseIntro() {
  return [
    note(
      "Z językiem polskim każdego dnia — prywatna baza kursu",
      "Этот модуль мы используем как приватную основу курса. Здесь важен не сам PDF как файл, а логика учебника: структура lekcji, типы упражнений, порядок ввода слов, слушание и постепенное усложнение. PDF и audio лежат локально, а в курс мы переносим только нужные блоки в удобный HTML-формат.",
      [],
      [
        { label: "Podręcznik PDF", url: privatePdf("podrecznik.pdf") },
        { label: "Zeszyt ćwiczeń PDF", url: privatePdf("cwiczenia.pdf") },
        { label: "Poradnik metodyczny PDF", url: privatePdf("poradnik-metodyczny.pdf") }
      ]
    ),
    note(
      "Jak będziemy z tym pracować",
      "На каждый урок делаем связку: 1) краткая теория и лексика в HTML, 2) 1-3 выбранных задания из учебника в переработанном виде, 3) привязанные audio, 4) короткое письмо или устный ответ, 5) слова в личный словарь. Это сильнее, чем просто открыть PDF и листать страницы.",
      [["lekcja", "урок"], ["ćwiczenie", "упражнение"], ["nagranie", "запись"], ["słownictwo", "лексика"], ["rozumienie ze słuchu", "понимание на слух"]]
    ),
    free("Napisz krótko, czego najbardziej chcesz z tej bazy: więcej słuchania, więcej gotowych dialogów, mocniejszą gramatykę czy więcej aktywnego pisania?", "2-4 zdania. Это поможет точнее собирать следующие lekcje в HTML.")
  ];
}

function getSelectedLessonExercisesLegacy(lesson) {
  const selected = {
    1: [
      note("Lekcja 1 — wybrane ćwiczenia", "Берём лучшее из блока o sobie, krajach, liczbach i godzinach: представление себя, страны и города, mieszkańcy, числа и время."),
      choice("Wybierz poprawnie: Ola ___ Kowalska.", ["nazywa się", "ma na imię"], "nazywa się"),
      input("Kowalska to:", "nazwisko"),
      input("Mieszkańcy Polski to:", "Polacy"),
      input("21:10 oficjalnie to:", ["jest dwudziesta pierwsza dziesięć", "dwudziesta pierwsza dziesięć"]),
      free("Przedstaw się w 3-4 zdaniach: jak masz na imię, skąd pochodzisz, gdzie mieszkasz i ile masz lat.", "Используй: mam na imię, pochodzę z, mieszkam w, mam ... lat.")
    ],
    2: [
      note("Lekcja 2 — wybrane ćwiczenia", "Сильные задания здесь: семья, степени pokrewieństwa, święta i cechy charakteru."),
      input("Mama twojej żony albo męża to twoja:", "teściowa"),
      input("Mąż twojej cioci to:", "wujek"),
      input("Rodzinna kolacja 24 grudnia w Polsce to:", "wigilia"),
      input("Kto lubi pracować i jest sumienny? To ktoś:", "pracowity"),
      free("Opisz jedną osobę z rodziny w 3-5 zdaniach: kim jest, jaki / jaka jest i za co ją cenisz.", "Добавь 2 прилагательных и 1 связку: ponieważ / dlatego.")
    ],
    3: [
      note("Lekcja 3 — wybrane ćwiczenia", "Этот урок хорошо качает opis wyglądu, ubrania i porównania."),
      choice("Twarz może być:", ["owalna", "wysportowana", "niebieska"], "owalna"),
      input("Kobieta, która ma blond włosy, to:", "blondynka"),
      input("Stopień wyższy od 'szybki' to:", "szybszy"),
      free("Napisz 3-4 zdania o wyglądzie osoby: włosy, oczy, twarz, wzrost.", "Используй минимум 4 слова opisujące wygląd."),
      free("Porównaj dwie osoby albo dwa style ubierania się w 2-4 zdaniach.", "Użyj: bardziej, mniej, naj-, niż.")
    ],
    4: [
      note("Lekcja 4 — wybrane ćwiczenia", "Здесь берём лексику pracy, definicje zawodów, mocne strony и описание обязанностей."),
      input("Osoba, która daje ci pracę, to:", "pracodawca"),
      input("Człowiek, który pracuje z tobą, to:", "współpracownik"),
      free("Wypisz 3 swoje mocne strony i 1 słabą stronę po polsku.", "Например: pracowity, odpowiedzialny, punktualny, ale czasem niecierpliwy."),
      free("Opisz pracę lekarza albo innego zawodu w 4-5 zdaniach.", "Użyj: odpowiedzialna, stresująca, ciekawe obowiązki, miejsce pracy."),
      input("Praca na cały wymiar godzin to:", "cały etat")
    ],
    5: [
      note("Lekcja 5 — wybrane ćwiczenia", "Очень полезный блок: sklepy, produkty, opakowania, wagi i reklamacja."),
      input("Szklane opakowanie dżemu to:", "słoik"),
      input("4 kg słownie:", "cztery kilogramy"),
      input("1 kg 200 g słownie:", ["jeden kilogram dwieście gramów", "kilogram dwieście gramów"]),
      input("Nie lubię czerwonego mięsa. Jaki to przypadek 'czerwonego mięsa'?", "dopełniacz"),
      free("Napisz krótką reklamację w restauracji albo sklepie w 3-5 zdaniach.", "Użyj: zamówiłem, problem, jednak, proszę o zwrot / wymianę.")
    ],
    6: [
      note("Lekcja 6 — wybrane ćwiczenia", "Сильная жизненная тема: typy budynków, pomieszczenia, wyposażenie i wynajem."),
      input("Mieszkanie w starym miejskim budynku często jest w:", "kamienicy"),
      input("Pokój do wspólnego odpoczynku w domu to:", "salon"),
      input("Dodatkowa opłata zabezpieczająca przy wynajmie to:", "kaucja"),
      choice("Zdanie poprawne:", ["Chciałbym wynająć mieszkanie.", "Chciałbym wynajmować mieszkanie to."], "Chciałbym wynająć mieszkanie."),
      free("Opisz idealne mieszkanie w 4-5 zdaniach.", "Napisz o lokalizacji, pokojach, kosztach i okolicy.")
    ],
    7: [
      note("Lekcja 7 — wybrane ćwiczenia", "Отличный дорожный модуль: kierunki, mapa Polski, zabytki i pytanie o drogę."),
      input("Augustów leży w ______ Polsce.", "północno-wschodniej"),
      input("Obiekt, w którym nocują goście, to:", "hotel"),
      input("Idę ___ biblioteki oddać książki.", "do"),
      input("Rodzina idzie ___ kina.", "do"),
      free("Napisz mini-dialog: zgubiłeś się i pytasz o drogę do dworca albo muzeum.", "Добавь 1 вопрос и 1 вежливую просьбу.")
    ],
    8: [
      note("Lekcja 8 — wybrane ćwiczenia", "Сюда хорошо вошли lekarze-specjaliści, części ciała, pogoda i przysłówki."),
      input("Lekarz od zębów i dziąseł to:", "stomatolog"),
      input("Lekarz od uszu, gardła i nosa to:", "laryngolog"),
      choice("Prawda czy fałsz: Śnieg najczęściej pada zimą.", ["P", "F"], "P"),
      input("Przysłówek od 'słoneczny' to:", "słonecznie"),
      free("Opisz dzisiejszą pogodę i swoje samopoczucie w 3-5 zdaniach.", "Użyj: boli mnie / czuję się / jest słonecznie / pada deszcz.")
    ],
    9: [
      note("Lekcja 9 — wybrane ćwiczenia", "Здесь хорошо работают plany dnia, sport i zainteresowania."),
      choice("Gdzie się gra w piłkę nożną?", ["na boisku piłkarskim", "na korcie tenisowym", "na lodowisku"], "na boisku piłkarskim"),
      input("Do gry w tenisa ziemnego potrzebna jest:", "rakieta tenisowa"),
      input("Dokąd idziesz? Do kina na ___", "film"),
      input("Ola często (czytać) literaturę fantastyczną.", "czyta"),
      free("Napisz o swoim hobby i planach na wolny czas w 3-5 zdaniach.", "Добавь: lubię, często, w weekend, chcę.")
    ],
    10: [
      note("Lekcja 10 — wybrane ćwiczenia", "Финальный учебный блок: edukacja, skróty и listy."),
      input("Egzamin dojrzałości to inaczej:", "matura"),
      input("Skrót od 'doktor' to:", ["dr", "dr."]),
      input("Skrót 'm.in.' rozwijamy jako:", "między innymi"),
      choice("List do urzędu albo dziekana to zwykle:", ["list oficjalny", "list prywatny"], "list oficjalny"),
      free("Napisz 3-5 zdań oficjalnej wiadomości: prosisz szkołę lub urząd o informację.", "Użyj: Szanowni Państwo / Szanowny Panie, zwracam się z prośbą, proszę o odpowiedź.")
    ]
  };

  return selected[lesson] || [];
}

function getPrivateAudioExerciseItemsLegacy(lesson) {
  const drills = {
    1: [
      note("Lekcja 1 — audio z zadaniami", "Здесь главное не просто послушать, а вытащить смысл: кто говорит, как представляется и о каких basic informacjach mówi."),
      audio("Lekcja 1: audio aktywne", "Posłuchaj nagrania o przedstawianiu się i podstawowych informacjach. Potem odpowiedz na pytania i napisz mini-podsumowanie.", privateAudio("Podręcznik", "a1.1")),
      input("Jak po polsku: 'Меня зовут ...'?", "mam na imię"),
      input("Jak odpowiesz na pytanie 'Jak się nazywasz?'. Napisz pełne 1 zdanie.", ["nazywam się ...", "mam na imię ..."]),
      free("Po słuchaniu napisz 2-3 zdania: jak ma na imię osoba, skąd pochodzi i gdzie mieszka.", "Даже если не всё понял, собери минимальный понятный ответ.")
    ],
    2: [
      note("Lekcja 2 — audio z zadaniami", "Семья и близкие отлично ложатся в аудирование: имена, роли в семье, wiek i relacje."),
      audio("Lekcja 2: audio aktywne", "Posłuchaj nagrania o rodzinie. Zwróć uwagę na imiona, relacje rodzinne i wiek.", privateAudio("Podręcznik", "a2.1")),
      input("Jak po polsku: 'братья и сестры'?", ["rodzeństwo", "rodzenstwo"]),
      input("Jak nazwiesz po polsku mamę żony albo męża?", "teściowa"),
      free("Po słuchaniu opisz rodzinę z nagrania w 3-4 zdaniach.", "Użyj: mama, tata, brat, siostra, młodszy / starszy.")
    ],
    3: [
      note("Lekcja 3 — audio z zadaniami", "Здесь слушаем не ради одной фразы, а чтобы потом уметь описать wygląd i ubiór своими словами."),
      audio("Lekcja 3: audio aktywne", "Posłuchaj opisu wyglądu lub ubioru. Wypisz cechy i potem opisz osobę własnymi słowami.", privateAudio("Podręcznik", "a3.1")),
      input("Podaj 1 polskie słowo opisujące twarz.", ["owalna", "okrągła", "pociągła"]),
      input("Podaj 1 polskie słowo opisujące włosy.", ["kręcone", "długie", "krótkie", "blond"]),
      free("Po słuchaniu opisz osobę z nagrania w 3-5 zdaniach.", "Użyj minimum 4 cech wyglądu.")
    ],
    4: [
      note("Lekcja 4 — audio z zadaniami", "Аудио про работу лучше всего закрепляется через обязанности, miejsce pracy и mocne strony."),
      audio("Lekcja 4: audio aktywne", "Posłuchaj nagrania o pracy albo zawodzie. Zanotuj zawód, obowiązki i jedną mocną stronę.", privateAudio("Podręcznik", "a4.1")),
      input("Jak po polsku: 'работодатель'?", "pracodawca"),
      input("Jak po polsku: 'сотрудник / коллега по работе'?", "współpracownik"),
      free("Po słuchaniu napisz 3-4 zdania o zawodzie z nagrania.", "Napisz, gdzie ta osoba pracuje i co robi.")
    ],
    5: [
      note("Lekcja 5 — audio z zadaniami", "Это уже очень жизненное слушание: zakupy, jedzenie, ceny i reklamacja."),
      audio("Lekcja 5: audio aktywne", "Posłuchaj nagrania o jedzeniu, zakupach albo reklamacji w restauracji.", privateAudio("Zeszyt ćwiczeń", "b5.3")),
      choice("Jakie danie pojawia się w nagraniu?", ["pizza", "zupa", "kanapka"], "pizza"),
      choice("Jaki był problem według opisu z lekcji?", ["obsługa albo jakość dania", "brak hotelu", "spóźniony pociąg"], "obsługa albo jakość dania"),
      free("Po słuchaniu napisz 2-4 zdania reklamacji: co było nie tak i czego oczekujesz.", "Użyj: jednak, problem, proszę o...")
    ],
    6: [
      note("Lekcja 6 — audio z zadaniami", "Слушание про mieszkanie лучше сразу соединять с pytaniami o koszty, pokoje i wyposażenie."),
      audio("Lekcja 6: audio aktywne", "Posłuchaj nagrania o mieszkaniu, domu albo wynajmie. Zapisz typ budynku, pomieszczenia i jedną informację o kosztach.", privateAudio("Podręcznik", "a6.1")),
      input("Jak po polsku: 'залог при аренде'?", "kaucja"),
      input("Jak po polsku: 'гостиная'?", "salon"),
      free("Po słuchaniu napisz 3-4 zdania o mieszkaniu z nagrania.", "Napisz, gdzie jest, jakie ma pomieszczenia i czy chcesz tam mieszkać.")
    ],
    7: [
      note("Lekcja 7 — audio z zadaniami", "Podróże i droga хорошо тренируются через słuchanie маршрута и короткие ответы."),
      audio("Lekcja 7: audio aktywne", "Posłuchaj nagrania o podróży, kierunku albo pytaniu o drogę. Zwróć uwagę na miejsca i przyimki.", privateAudio("Podręcznik", "a7.1")),
      input("Jakiego przyimka użyjesz: idę ___ biblioteki?", "do"),
      input("Jak po polsku: 'северо-восток'?", ["północny wschód", "polnocny wschod"]),
      free("Po słuchaniu napisz mini-instrukcję drogi w 2-4 zdaniach.", "Na przykład: idź prosto, potem skręć w lewo...")
    ],
    8: [
      note("Lekcja 8 — audio z zadaniami", "Здесь уже можно делать настоящее mini-listening: zdrowie, pogoda, objawy i prognoza."),
      audio("Lekcja 8: audio aktywne", "Posłuchaj prognozy pogody albo opisu samopoczucia. Wypisz 3 najważniejsze informacje.", privateAudio("Zeszyt ćwiczeń", "b8.3")),
      choice("Jaka może być temperatura w nagraniu z tej lekcji?", ["poniżej zera", "czterdzieści stopni", "zawsze taka sama"], "poniżej zera"),
      input("Przysłówek od 'słoneczny' to:", "słonecznie"),
      free("Po słuchaniu napisz krótką prognozę pogody albo opis samopoczucia w 2-4 zdaniach.", "Użyj: wiatr, śnieg, zimno, czuję się...")
    ],
    9: [
      note("Lekcja 9 — audio z zadaniami", "Планы дня и hobby очень хорошо переходят из nagrania в свою речь."),
      audio("Lekcja 9: audio aktywne", "Posłuchaj nagrania o planie dnia albo czasie wolnym. Zwróć uwagę na godziny i czynności.", privateAudio("Zeszyt ćwiczeń", "b9.1")),
      choice("O której mogła wstać bohaterka nagrania według tej lekcji?", ["o siódmej", "o północy", "o trzeciej rano"], "o siódmej"),
      input("Jak po polsku: 'домашнее задание'?", ["praca domowa", "zadanie domowe"]),
      free("Po słuchaniu opisz plan dnia osoby z nagrania w 3-5 zdaniach.", "Dodaj 2 wyrażenia czasu: rano, po południu, wieczorem...")
    ],
    10: [
      note("Lekcja 10 — audio z zadaniami", "На этом этапе слушание уже должно помогать и в письме: edukacja, skróty, styl formalny."),
      audio("Lekcja 10: audio aktywne", "Posłuchaj nagrania związanego ze szkołą, studiami albo oficjalną komunikacją.", privateAudio("Podręcznik", "a10.1")),
      input("Jak inaczej powiesz po polsku 'egzamin dojrzałości'?", "matura"),
      choice("Jaki styl będzie odpowiedni po takim materiale?", ["oficjalny", "bardzo potoczny"], "oficjalny"),
      free("Po słuchaniu napisz 2-4 zdania oficjalnej wiadomości albo krótkiego komunikatu.", "Użyj zwrotu grzecznościowego i jednego celu wiadomości.")
    ]
  };

  return drills[lesson] || [];
}

function getPrivateLessonOverview(lesson) {
  const overview = {
    1: {
      title: "Lekcja 1 — o sobie, kraje, miasta, liczby, godziny",
      body: "Фокус урока: представиться, сказать, откуда ты, где живёшь, сколько тебе лет, назвать страны и города, понять базовые числа и время.",
      words: [["mam na imię", "меня зовут"], ["pochodzę z", "я родом из"], ["mieszkam w", "я живу в"], ["nazwisko", "фамилия"], ["mieszkaniec", "житель"]]
    },
    2: {
      title: "Lekcja 2 — rodzina i cechy charakteru",
      body: "Фокус урока: семья, родственники, семейные отношения, праздники и базовые качества человека. После урока ты должен уметь коротко описать одного близкого человека.",
      words: [["rodzeństwo", "братья и сёстры"], ["teściowa", "тёща / свекровь"], ["wujek", "дядя"], ["wigilia", "сочельник"], ["pracowity", "трудолюбивый"]]
    },
    3: {
      title: "Lekcja 3 — wygląd, ubrania, porównania",
      body: "Фокус урока: описывать внешность, волосы, лицо, одежду и делать простые сравнения: kto jest wyższy, co jest ładniejsze, jaki styl lubisz.",
      words: [["owalna twarz", "овальное лицо"], ["blondynka", "блондинка"], ["kręcone włosy", "кудрявые волосы"], ["szybszy", "быстрее / более быстрый"], ["wysoki", "высокий"]]
    },
    4: {
      title: "Lekcja 4 — praca i zawody",
      body: "Фокус урока: профессии, место работы, сильные стороны, обязанности и простое описание своей работы. После урока ты должен уметь сказать, где работаешь и что делаешь.",
      words: [["pracodawca", "работодатель"], ["współpracownik", "коллега"], ["cały etat", "полная ставка"], ["obowiązki", "обязанности"], ["mocne strony", "сильные стороны"]]
    },
    5: {
      title: "Lekcja 5 — zakupy, jedzenie, ceny, reklamacja",
      body: "Фокус урока: еда, упаковки, количество, вес, покупки и жалоба в магазине или ресторане. Это очень практичный урок для живой жизни.",
      words: [["słoik", "банка"], ["kilogram", "килограмм"], ["paragon", "чек"], ["reklamacja", "рекламация / претензия"], ["wymiana", "обмен"]]
    },
    6: {
      title: "Lekcja 6 — mieszkanie i wynajem",
      body: "Фокус урока: типы домов, комнаты, мебель, аренда, район и стоимость жилья. После урока ты должен уметь описать квартиру и задать вопросы об аренде.",
      words: [["kamienica", "доходный дом / каменица"], ["salon", "гостиная"], ["kaucja", "залог"], ["wynająć", "снять в аренду"], ["spokojna okolica", "спокойный район"]]
    },
    7: {
      title: "Lekcja 7 — podróż, kierunki, droga",
      body: "Фокус урока: направления, карта, путешествие, транспорт и вопросы о дороге. Это хороший урок для przyimki и orientację w mieście.",
      words: [["północny wschód", "северо-восток"], ["do biblioteki", "в библиотеку"], ["hotel", "отель"], ["skręcić", "повернуть"], ["prosto", "прямо"]]
    },
    8: {
      title: "Lekcja 8 — zdrowie, ciało, pogoda",
      body: "Фокус урока: врачи, части тела, самочувствие, погода и прогноз. После урока ты должен уметь сказать, что болит и какая сегодня погода.",
      words: [["stomatolog", "стоматолог"], ["laryngolog", "лор"], ["słonecznie", "солнечно"], ["śnieg", "снег"], ["czuję się", "я себя чувствую"]]
    },
    9: {
      title: "Lekcja 9 — plany, sport, hobby",
      body: "Фокус урока: распорядок дня, свободное время, спорт и увлечения. После урока ты должен уметь рассказать о своём hobby и планах на weekend.",
      words: [["praca domowa", "домашняя работа"], ["rakieta tenisowa", "теннисная ракетка"], ["czas wolny", "свободное время"], ["wstać", "встать"], ["lubię", "мне нравится"]]
    },
    10: {
      title: "Lekcja 10 — edukacja, skróty, list oficjalny",
      body: "Фокус урока: школа, экзамены, сокращения и официальный стиль. Это уже мост к полезному B1-письму и formalnym komunikatom.",
      words: [["matura", "выпускной экзамен"], ["między innymi", "между прочим / среди прочего"], ["list oficjalny", "официальное письмо"], ["zwracam się z prośbą", "обращаюсь с просьбой"], ["Szanowni Państwo", "Уважаемые господа"]]
    }
  };

  return overview[lesson];
}

function getPrivateAudioResourceLinks(lessonConfig) {
  return [
    ...lessonConfig.textbook.map((track) => ({ label: `Podręcznik ${track}`, url: privateAudio("Podręcznik", track) })),
    ...lessonConfig.workbook.map((track) => ({ label: `Ćwiczenia ${track}`, url: privateAudio("Zeszyt ćwiczeń", track) })),
    ...lessonConfig.guide.map((track) => ({ label: `Poradnik ${track}`, url: privateAudio("Poradnik", track) }))
  ];
}

// Override the earlier textbook helpers with a leaner Pages-friendly format:
// one main audio per lesson plus fill-in-the-blank tasks based on the audio.
function getSelectedLessonExercises() {
  return [];
}

function getPrivateAudioExerciseItems(lesson) {
  const drills = {
    1: [
      audio(
        "Lekcja 1: główne audio",
        "Posłuchaj nagrania 1-2 razy. Potem uzupełnij cały dialog poniżej i dopiero na końcu odkryj pełny tekst do sprawdzenia.",
        privateAudio("Podręcznik", "a1.1"),
        [],
        "A: Cześć! Mam na imię Ola. A ty jak masz na imię?\nB: Mam na imię Igor.\nA: Skąd pochodzisz?\nB: Pochodzę z Ukrainy, ale teraz mieszkam w Warszawie.\nA: Bardzo mi miło.\nB: Mi też miło."
      ),
      cloze(
        "Uzupełnij cały dialog po wysłuchaniu nagrania.",
        "Dialog z nagrania",
        [
          "A: Cześć! Mam na [1] Ola. A ty jak masz na [2]?",
          "B: Mam na imię Igor.",
          "A: Skąd [3]?",
          "B: Pochodzę [4] Ukrainy, ale teraz [5] w Warszawie.",
          "A: Bardzo mi [6].",
          "B: Mi też miło."
        ],
        [
          { answers: ["imię", "imie"] },
          { answers: ["imię", "imie"] },
          { answers: ["pochodzisz"] },
          { answers: ["z"] },
          { answers: ["mieszkam"] },
          { answers: ["miło", "milo"] }
        ],
        "Смысл этого трека: представиться, сказать, откуда ты и где сейчас живёшь."
      ),
      choice("Co wiemy o Igorze?", ["Pochodzi z Ukrainy i mieszka w Warszawie.", "Pochodzi z Polski i mieszka w Krakowie.", "Pracuje w sklepie."], "Pochodzi z Ukrainy i mieszka w Warszawie."),
      input("Napisz po polsku pełną odpowiedź: 'Я родом из Украины, но сейчас живу в Варшаве.'", ["Pochodzę z Ukrainy, ale teraz mieszkam w Warszawie.", "Pochodzę z Ukrainy ale teraz mieszkam w Warszawie."])
    ],
    2: [
      audio("Lekcja 2: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a2.1")),
      input("Uzupełnij: To jest moja ___ .", ["mama", "siostra", "rodzina"]),
      input("Uzupełnij: Mój brat jest ode mnie ___ .", ["młodszy", "starszy"]),
      input("Uzupełnij: Moje ___ jest ode mnie młodsze.", ["rodzeństwo", "rodzenstwo"]),
      choice("Nagranie jest o:", ["rodzinie", "mieszkaniu", "sporcie"], "rodzinie")
    ],
    3: [
      audio("Lekcja 3: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a3.1")),
      input("Uzupełnij: Ona ma ___ włosy.", ["długie", "kręcone", "krótkie", "blond"]),
      input("Uzupełnij: Jej twarz jest ___ .", ["owalna", "okrągła"]),
      input("Uzupełnij: On jest wysoki i ___ .", ["szczupły", "wysportowany"]),
      choice("Nagranie pomaga opisać:", ["wygląd", "pracę", "drogę"], "wygląd")
    ],
    4: [
      audio("Lekcja 4: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a4.1")),
      input("Uzupełnij: Pracuję jako ___ .", ["lekarz", "nauczyciel", "sprzedawca", "informatyk"]),
      input("Uzupełnij: Moje ___ to kontakt z klientami.", "obowiązki"),
      input("Uzupełnij: Moją mocną ___ jest punktualność.", "stroną"),
      choice("Nagranie jest o:", ["pracy", "rodzinie", "pogodzie"], "pracy")
    ],
    5: [
      audio("Lekcja 5: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Zeszyt ćwiczeń", "b5.3")),
      input("Uzupełnij: Zamówiliśmy dużą ___ .", "pizzę"),
      input("Uzupełnij: Pani, która nas obsługiwała, była ___ .", ["nieuprzejma", "miła"]),
      input("Uzupełnij: Zgłosiliśmy ___ .", "reklamację"),
      choice("Nagranie dotyczy:", ["reklamacji", "egzaminu", "szkoły"], "reklamacji")
    ],
    6: [
      audio("Lekcja 6: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a6.1")),
      input("Uzupełnij: Chciałbym wynająć ___ .", "mieszkanie"),
      input("Uzupełnij: W mieszkaniu jest duży ___ .", "salon"),
      input("Uzupełnij: Kaucja wynosi dwa tysiące ___ .", ["złotych", "zlotych"]),
      choice("Nagranie dotyczy:", ["mieszkania", "sportu", "listu"], "mieszkania")
    ],
    7: [
      audio("Lekcja 7: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a7.1")),
      input("Uzupełnij: Idę ___ biblioteki.", "do"),
      input("Uzupełnij: Skręć w ___ .", ["lewo", "prawo"]),
      input("Uzupełnij: Dworzec jest na północnym ___ .", "wschodzie"),
      choice("Nagranie dotyczy:", ["drogi i podróży", "ciała", "rodziny"], "drogi i podróży")
    ],
    8: [
      audio("Lekcja 8: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Zeszyt ćwiczeń", "b8.3")),
      input("Uzupełnij: Dziś jest bardzo ___ .", ["zimno", "ciepło", "wietrznie"]),
      input("Uzupełnij: W nocy temperatura będzie poniżej ___ .", "zera"),
      input("Uzupełnij: Czuję się ___ .", ["źle", "dobrze", "słabo"]),
      choice("Nagranie jest o:", ["pogodzie lub samopoczuciu", "pracy", "liście"], "pogodzie lub samopoczuciu")
    ],
    9: [
      audio("Lekcja 9: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Zeszyt ćwiczeń", "b9.1")),
      input("Uzupełnij: Obudziła się o ___ .", ["siódmej", "siodmej"]),
      input("Uzupełnij: Po południu pojechała kupić mamie ___ .", "prezent"),
      input("Uzupełnij: Wieczorem odrabiała pracę ___ .", "domową"),
      choice("Nagranie dotyczy:", ["planu dnia", "wynajmu mieszkania", "reklamacji"], "planu dnia")
    ],
    10: [
      audio("Lekcja 10: audio aktywne", "Posłuchaj nagrania i uzupełnij brakujące słowa.", privateAudio("Podręcznik", "a10.1")),
      input("Uzupełnij: Egzamin dojrzałości to ___ .", "matura"),
      input("Uzupełnij: Zwracam się z ___ o informację.", "prośbą"),
      input("Uzupełnij: To jest list ___ .", "oficjalny"),
      choice("Styl nagrania jest raczej:", ["oficjalny", "bardzo potoczny"], "oficjalny")
    ]
  };

  return drills[lesson] || [];
}

function genPrivateLessonsLegacy(startLesson, endLesson) {
  return privateCourseLessons
    .filter((lesson) => lesson.lesson >= startLesson && lesson.lesson <= endLesson)
    .flatMap((lesson) => {
      const overview = getPrivateLessonOverview(lesson.lesson);
      return [
        note(overview.title, overview.body, overview.words),
        ...getPrivateAudioExerciseItems(lesson.lesson)
      ];
    });
}

function genPrivateLessons(startLesson, endLesson) {
  return privateCourseLessons
    .filter((lesson) => lesson.lesson >= startLesson && lesson.lesson <= endLesson)
    .flatMap((lesson) => {
      const overview = getPrivateLessonOverview(lesson.lesson);
      return [
        note(overview.title, overview.body, overview.words),
        ...getPrivateAudioExerciseItems(lesson.lesson)
      ];
    });
}

function genExamWriting() {
  return repeatTo50([
    free("Pisanie B1: Napisz e-mail do właściciela mieszkania. Opisz awarię, poproś o naprawę i zaproponuj termin. 80–120 słów.", "Checklist: powitanie, problem, szczegóły, prośba, termin, zakończenie."),
    free("Pisanie B1: Napisz reklamację do sklepu internetowego. Podaj numer zamówienia, opisz problem i napisz, czego oczekujesz. 80–120 słów.", "Checklist: fakty, problem, żądanie, grzeczny ton."),
    free("Pisanie B1: Napisz wiadomość do szkoły językowej. Chcesz zmienić termin kursu i wyjaśniasz powód. 80–120 słów.", "Checklist: cel wiadomości, powód, nowy termin, prośba o potwierdzenie."),
    free("Pisanie B1: Napisz krótkie podanie do urzędu. Wyjaśnij, jaki dokument chcesz otrzymać i dlaczego. 80–120 słów.", "Checklist: kto pisze, o co prosi, dlaczego, kontakt.")
  ]);
}

function genExamSpeaking() {
  return repeatTo50([
    free("Mówienie B1: Opisz obrazek: osoba rozmawia z lekarzem w przychodni. Powiedz, kto jest na obrazku, gdzie są osoby i co mogło się stać.", "Mów 1–2 minuty. Użyj: wydaje mi się, prawdopodobnie, ponieważ."),
    free("Mówienie B1: Dialog. Chcesz wynająć mieszkanie. Zapytaj o czynsz, kaucję, ogrzewanie i termin oglądania.", "Napisz swoje repliki pełnymi zdaniami."),
    free("Mówienie B1: Opowiedz o swojej pracy albo nauce. Powiedz, co robisz, co jest trudne i jakie masz plany.", "Mów 1–2 minuty. Użyj czasu teraźniejszego, przeszłego i przyszłego."),
    free("Mówienie B1: Masz problem z zakupem online. Wyjaśnij sytuację pracownikowi sklepu i poproś o rozwiązanie.", "Użyj: zamówienie, dostawa, zwrot, reklamacja.")
  ]);
}

function genExamMixed() {
  return cap50([
    input("Uzupełnij: Nie mam (czas).", "czasu"),
    input("Uzupełnij: Muszę złożyć (wniosek).", "wniosek"),
    input("Uzupełnij: Rozmawiam z (kierownik).", "kierownikiem"),
    input("Uzupełnij: Mieszkam w (centrum).", "centrum"),
    input("Uzupełnij: Potrzebuję (recepta).", "recepty"),
    choice("Jutro ___ raport do końca.", ["będę pisać", "napiszę"], "napiszę"),
    choice("Codziennie ___ do pracy tramwajem.", ["jeżdżę", "pojadę"], "jeżdżę"),
    choice("Idę ___ lekarza.", ["do", "w", "na"], "do"),
    choice("Spotkanie jest ___ dziewiątej.", ["o", "w", "do"], "o"),
    choice("Chcę zapłacić ___.", ["kartą", "kartę", "karty"], "kartą")
  ]);
}

function genDiagnostic() {
  return cap50([
    choice("To są ___ studenci.", ["dobrzy", "dobre", "dobrego"], "dobrzy", "męskoosobowy plural"),
    input("Uzupełnij: Widzę (dobry lekarz).", "dobrego lekarza", "biernik"),
    input("Uzupełnij: Nie mam (czas).", "czasu", "dopełniacz"),
    input("Uzupełnij: Pomagam (mój kolega).", "mojemu koledze", "celownik"),
    input("Uzupełnij: Rozmawiam z (nauczyciel).", "nauczycielem", "narzędnik"),
    input("Uzupełnij: Mieszkam w (Polska).", "Polsce", "miejscownik"),
    input("Uzupełnij formę: ja (pracować).", "pracuję", "czas teraźniejszy"),
    input("Uzupełnij formę: ja, kobieta (być).", "byłam", "czas przeszły"),
    choice("Jutro ___ zadanie do końca.", ["będę robić", "zrobię"], "zrobię", "aspekt"),
    choice("Idę ___ sklepu.", ["do", "w", "na"], "do", "przyimki"),
    input("Через неделю я напишу тест", "za tydzień napiszę test", "czas + przyszłość"),
    choice("Uczę się, ___ lepiej mówić.", ["żeby", "dlatego", "kiedy"], "żeby", "zdania złożone"),
    input("собеседование →", "rozmowa kwalifikacyjna", "praca"),
    input("залог за квартиру →", "kaucja", "mieszkanie"),
    input("рецепт →", "recepta", "zdrowie"),
    input("заявление →", "wniosek", "dokumenty"),
    input("возврат товара →", "zwrot", "zakupy"),
    input("пересадка →", "przesiadka", "transport"),
    choice("Tekst: Wizyta została przełożona z wtorku na czwartek. Co się zmieniło?", ["termin", "czynsz", "paragon"], "termin"),
    choice("Nagranie: Proszę dołączyć kopię paszportu. Co trzeba dołączyć?", ["kopię paszportu", "bilet", "receptę"], "kopię paszportu")
  ]);
}

function genMixed20() {
  const pool = [
    ...genAccusativeForms().slice(0, 8),
    ...genGenitive().slice(0, 8),
    ...genDative().slice(0, 6),
    ...genInstrumental().slice(0, 6),
    ...genLocative().slice(0, 6),
    ...genPresent().slice(0, 8),
    ...genAspectChoice().slice(0, 8),
    ...genPrepositions().slice(0, 8),
    ...genPoliteConditional().slice(0, 5),
    ...genPronouns().slice(0, 5),
    ...genReflexiveSie().slice(0, 5),
    ...genComparisons().slice(0, 5),
    ...genModalVerbs().slice(0, 5),
    ...genImpersonal().slice(0, 5),
    ...genB1Connectors().slice(0, 5),
    ...genThematicWords("work").slice(0, 5),
    ...genThematicWords("housing").slice(0, 5),
    ...genThematicWords("health").slice(0, 5),
    ...genThematicWords("documents").slice(0, 5),
    ...genThematicWords("shopping").slice(0, 5),
    ...genThematicWords("city").slice(0, 5),
    ...genThematicWords("education").slice(0, 5),
    ...genThematicWords("relationships").slice(0, 5),
    ...genThematicWords("travel").slice(0, 5),
    ...genThematicWords("food").slice(0, 5),
    ...genThematicWords("technology").slice(0, 5),
    ...genThematicWords("argumentation").slice(0, 5),
    ...genThematicWords("finance").slice(0, 5),
    ...genThematicWords("family").slice(0, 5),
    ...genThematicWords("daily").slice(0, 5),
    ...genThematicWords("nature").slice(0, 5),
    ...genThematicWords("culture").slice(0, 5),
    ...genThematicWords("leisure").slice(0, 5),
    ...genThematicWords("safety").slice(0, 5),
    ...genThematicWords("society").slice(0, 5),
    ...genThematicWords("personality").slice(0, 5),
    ...genThematicWords("environment").slice(0, 5),
    ...genExamReading().slice(0, 5),
    ...genExamListening().slice(0, 5),
    ...genConnectorChoiceAdvanced().slice(0, 4),
    ...genSentenceAssemblyB1().slice(0, 4),
    ...genB1Mistakes().slice(0, 4)
  ];
  return shuffle(pool).slice(0, 20);
}

const speakingPrompts = repeatTo50([free("Opisz swój typowy dzień. Użyj: rano, potem, wieczorem, kiedy."), free("Dlaczego uczysz się polskiego? Użyj: dlatego, że; żeby; jeśli."), free("Opisz swoją pracę albo naukę. Użyj minimum 6 zdań."), free("Opisz ostatni weekend w czasie przeszłym."), free("Opisz plany na następny tydzień w czasie przyszłym."), free("Opowiedz o swojej rodzinie. Użyj mianownika liczby mnogiej."), free("Co zwykle kupujesz w sklepie? Użyj biernika."), free("Czego potrzebujesz do nauki? Użyj dopełniacza."), free("Komu najczęściej pomagasz? Użyj celownika."), free("Z kim spędzasz czas po pracy? Użyj narzędnika."), free("Gdzie mieszkasz i co lubisz w tym miejscu? Użyj miejscownika."), free("Opisz różnicę między tym, co robisz codziennie, a tym, co zrobisz jutro.")]);

function makeLexiconTopic(key, title, description, theory) {
  return {
    title,
    description,
    theory,
    exercises: [
      makeExercise("Сначала прочитай", genThematicIntro(key)),
      makeExercise("PL → RU", genThematicReverseChoices(key)),
      makeExercise("RU → PL: выбери", genThematicChoices(key)),
      makeExercise("RU → PL: напиши", genThematicWords(key)),
      makeExercise("RU → PL: без подсказки+", genThematicActiveRecall(key)),
      makeExercise("Gotowe frazy", genThematicPhrases(key)),
      makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder(key)),
      makeExercise("Rozumienie tekstu", genThematicComprehension(key)),
      makeExercise("Gramatyka w kontekście", genThematicContextGrammar(key)),
      makeExercise("Ситуация", genTopicSpeaking(key))
    ]
  };
}

function genGrammarNuance(topic) {
  const blocks = {
    pluralNominative: [
      note("Как думать о liczba mnoga", "Сначала реши, кто перед тобой: `oni` или `one`.\n\n1. Если это мужчины или смешанная группа, обычно будет `oni`: nowi studenci, dobrzy lekarze.\n2. Если это женщины, дети, вещи или животные, обычно будет `one`: piękne kobiety, małe dzieci, nowe auta.\n3. Прилагательное тоже меняется вместе с группой: dobry -> dobrzy, ale piękny -> piękne.\n\nСмотри не на одно слово, а на связку целиком: `to są dobrzy studenci`, `to są piękne kobiety`."),
      choice("Что правильно в mianownik liczby mnogiej?", ["to są piękne kobiety", "to są piękni kobiety", "to jest piękne kobiety"], "to są piękne kobiety"),
      choice("Что правильно для смешанной группы?", ["to są nowi pracownicy", "to są nowe pracownicy", "to jest nowi pracownicy"], "to są nowi pracownicy")
    ],
    accusative: [
      note("Почему `widzę piękne kobiety`", "Шаг 1: `widzę` требует `biernik`.\nШаг 2: базовая форма — `piękne kobiety` в liczba mnoga niemęskoosobowa.\nШаг 3: в этой группе `biernik` часто равен `mianownik`, поэтому форма существительного остаётся `kobiety`.\nШаг 4: прилагательное согласуется с существительным: `piękne` + `kobiety`.\n\nПоэтому: `widzę piękne kobiety`, но `widzę dobrych studentów`, потому что męskoosobowy plural ведёт себя иначе."),
      choice("Почему здесь `kobiety`, а не `kobiet`?", ["bo to biernik liczby mnogiej niemęskoosobowej", "bo po widzę zawsze jest dopełniacz", "bo kobiety to rodzaj męski"], "bo to biernik liczby mnogiej niemęskoosobowej"),
      input("Uzupełnij z wyjaśnieniem: widzę (piękna kobieta)", "piękne kobiety", "biernik liczby mnogiej niemęskoosobowej")
    ],
    genitive: [
      note("Почему `nie mam czasu`", "Шаг 1: `mam czas` — обычная базовая фраза.\nШаг 2: отрицание `nie mam` очень часто требует `dopełniacz`.\nШаг 3: `czas` -> `czasu`.\n\nПо той же логике: `mam kawę` -> `nie mam kawy`, `mam pracę` -> `szukam pracy`, `mam telefon` -> `używam telefonu`."),
      choice("Что здесь запускает dopełniacz?", ["отрицание и глагольная конструкция", "множественное число", "будущее время"], "отрицание и глагольная конструкция"),
      input("Uzupełnij: nie mam (czas)", "czasu", "negacja + dopełniacz")
    ],
    dative: [
      note("Почему `pomagam miłej kobiecie`", "Шаг 1: `pomagam` спрашивает `komu?`.\nШаг 2: это значит, что нужен `celownik`.\nШаг 3: `kobieta` -> `kobiecie`.\nШаг 4: прилагательное тоже меняется: `miła` -> `miłej`.\n\nПоэтому: `pomagam miłej kobiecie`, `daję prezent małemu dziecku`, `mówię prawdę koledze`."),
      choice("Что главное в фразе `daję prezent bratu`?", ["глагол требует celownik для адресата", "brat стоит в biernik", "prezent меняет brat"], "глагол требует celownik для адресата"),
      input("Uzupełnij: pomagam (miła kobieta)", "miłej kobiecie", "celownik + согласование прилагательного")
    ],
    instrumental: [
      note("Почему `jestem dobrym lekarzem`", "Шаг 1: после `jestem` при названии профессии обычно нужен `narzędnik`.\nШаг 2: `lekarz` -> `lekarzem`.\nШаг 3: прилагательное тоже уходит в narzędnik: `dobry` -> `dobrym`.\n\nТак же работают: `jestem nowym pracownikiem`, `jadę szybkim autobusem`, `rozmawiam z miłą nauczycielką`."),
      choice("Что меняется после `jestem`?", ["существительное и прилагательное идут в narzędnik", "только глагол", "ничего"], "существительное и прилагательное идут в narzędnik"),
      input("Uzupełnij: jestem (dobry lekarz)", "dobrym lekarzem", "narzędnik po jestem")
    ],
    locative: [
      note("Почему `mieszkam w dużym mieście`", "Шаг 1: `w` в значении `где?` обычно ведёт к `miejscownik`.\nШаг 2: `miasto` -> `mieście`.\nШаг 3: прилагательное тоже меняется: `duże miasto` -> `w dużym mieście`.\n\nСравни: `jadę do dużego miasta` — это уже `dopełniacz`, потому что вопрос `dokąd?`."),
      choice("Почему здесь `mieście`, а не `miasto`?", ["bo `w` tutaj znaczy `gdzie?` i daje miejscownik", "bo to biernik", "bo это прошедшее время"], "bo `w` tutaj znaczy `gdzie?` i daje miejscownik"),
      input("Uzupełnij: mieszkam w (duże miasto)", "dużym mieście", "w + miejscownik")
    ],
    verbsPresent: [
      note("Как разбирать `pracuję`, `robisz`, `mówią`", "Сначала найди лицо: `ja`, `ty`, `oni`.\nПотом вспомни модель:\n- `pracować` -> pracuję, pracujesz...\n- `robić` -> robię, robisz...\n- `mówić` -> mówię, mówisz...\n\nТо есть мы не угадываем форму, а идём по шагам: `кто?` -> `какой это глагол?` -> `какая у него модель?`."),
      choice("Что нужно определить первым?", ["лицо: ja / ty / on / my / wy / oni", "падеж существительного", "род прилагательного"], "лицо: ja / ty / on / my / wy / oni"),
      input("Uzupełnij: oni (mówić)", "mówią", "najpierw ustal osobę: oni")
    ],
    verbsPast: [
      note("Почему `robiłem` и `robiłam` разные", "В прошедшем времени польский показывает род.\n- мужчина: `robiłem`, `byłem`, `poszedłem`\n- женщина: `robiłam`, `byłam`, `poszłam`\n\nПоэтому в B1 всегда полезно думать не только о лице, но и о том, кто говорит."),
      choice("Что отличает `robiłem` от `robiłam`?", ["род говорящего", "падеж дополнения", "число существительного"], "род говорящего"),
      input("Uzupełnij: ja, kobieta (być)", "byłam", "forma żeńska czasu przeszłego")
    ],
    verbsFuture: [
      note("Как выбирать будущее", "Сначала задай себе вопрос: нужен процесс или результат?\n- процесс / длительность: `będę pisać raport`\n- готовый результат: `napiszę raport`\n\nЕсли слышишь `jutro cały wieczór`, часто это процесс. Если слышишь `do końca`, `na jutro`, `w końcu`, часто нужен результат."),
      choice("Что лучше для результата?", ["napiszę raport", "będę pisać raport"], "napiszę raport"),
      choice("Что лучше для процесса вечером?", ["wieczorem będę czytać", "wieczorem przeczytam"], "wieczorem będę czytać")
    ],
    aspect: [
      note("Как думать об aspekcie", "Не начинай с термина, начинай с смысла.\n- `robić` = делать как процесс, привычку, длительность\n- `zrobić` = сделать и получить итог\n\nСравни:\n`codziennie robię ćwiczenia` — привычка\n`jutro zrobię ćwiczenia` — будет готовый результат"),
      choice("Что говорит о процессе?", ["teraz czytam książkę", "zaraz przeczytam książkę"], "teraz czytam książkę"),
      choice("Что говорит о результате?", ["w końcu napisałem mail", "długo pisałem mail"], "w końcu napisałem mail")
    ],
    prepositions: [
      note("Как разбирать предлог", "Сначала не смотри на форму слова. Сначала спроси о смысле:\n- `dokąd?` -> часто `do` / `na` + biernik lub dopełniacz\n- `gdzie?` -> `w` / `na` + miejscownik\n- `skąd?` -> часто `z` + dopełniacz\n- `z kim?` -> `z` + narzędnik\n\nСравни: `idę do sklepu` -> `jestem w sklepie` -> `wracam ze sklepu`."),
      choice("Что правильно для `gdzie?`?", ["w pracy", "do pracy", "z pracą"], "w pracy"),
      choice("Что правильно для `z kim?`?", ["z kolegą", "z kolegi", "do kolegi"], "z kolegą")
    ],
    pronouns: [
      note("Почему `mi`, `mnie`, `mu`, `go` не одно и то же", "Местоимение тоже подчиняется падежу.\n- `daj mi` / `pomóż mi` -> celownik\n- `widzę go` / `znam ją` -> biernik\n- `nie ma mnie` -> dopełniacz/accusative-like form in use\n\nСначала решай вопрос: `komu?`, `kogo?`, `czego?`, и только потом выбирай местоимение."),
      choice("Что правильно после `pomagam`?", ["mu", "go", "jego"], "mu"),
      choice("Что правильно после `widzę`?", ["ją", "jej", "nią"], "ją")
    ],
    reflexiveSie: [
      note("Как понимать `się`", "`się` не переводится одинаково каждый раз. Иногда это часть глагола: `uczyć się`, `bać się`, `interesować się`.\nИногда это конструкция: `podoba mi się ten kurs`.\n\nПоэтому полезно учить не `się` отдельно, а целую фразу: `uczę się polskiego`, `boję się egzaminu`, `podoba mi się ten film`."),
      choice("Что важнее всего с `się`?", ["учить глагол и konstrukcję целиком", "всегда ставить его в конец", "переводить как `себя`"], "учить глагол и konstrukcję целиком"),
      input("Uzupełnij: boję (__) egzaminu", "się", "to stała konstrukcja")
    ],
    comparisons: [
      note("Как строить сравнение", "Сначала есть обычная форма: `tani`.\nПотом сравнительная: `tańszy`.\nПотом превосходная: `najtańszy`.\n\nВ речи чаще всего нужны готовые куски:\n`ten kurs jest tańszy niż tamten`\n`to jest najlepsza opcja`"),
      choice("Что значит `niż`?", ["сравнение: `чем`", "причина: `потому что`", "цель: `чтобы`"], "сравнение: `чем`"),
      input("Uzupełnij: ten telefon jest (drogi) niż tamten", "droższy", "stopień wyższy")
    ],
    wordOrder: [
      note("Как думать о порядке слов", "В польском можно двигать части фразы, но нейтральный порядок всё равно важен.\nСначала обычно идёт тема или время: `jutro`, `wczoraj`, `po pracy`.\nПотом глагол и его части: `jutro spotykam się z kolegą`.\n`nie` обычно стоит перед глаголом: `nie mam czasu`.\n`się` часто идёт сразу после глагола или очень близко к нему."),
      choice("Что звучит нейтральнее?", ["jutro spotykam się z kolegą", "spotykam jutro z kolegą się"], "jutro spotykam się z kolegą"),
      choice("Где обычно стоит `nie`?", ["перед глаголом", "после существительного", "в конце фразы"], "перед глаголом")
    ],
    complexSentences: [
      note("Как удлинять фразу без хаоса", "Лучший путь к B1 — не длинные слова, а понятные связки.\n- `bo` = причина\n- `dlatego` = результат\n- `że` = что\n- `żeby` = чтобы\n- `jeśli` = если\n\nСобирай ответ как конструктор: opinia -> bo -> przykład -> dlatego -> wniosek."),
      choice("Что лучше для причины?", ["bo jestem zmęczony", "dlatego jestem zmęczony", "żeby jestem zmęczony"], "bo jestem zmęczony"),
      choice("Что лучше для результата?", ["pracuję dużo, dlatego jestem zmęczony", "pracuję dużo, bo dlatego", "pracuję dużo, żeby zmęczony"], "pracuję dużo, dlatego jestem zmęczony")
    ]
  };
  return blocks[topic] || [];
}

function genGrammarStepByStep(topic) {
  const blocks = {
    pluralNominative: [
      note("Разбор по шагам: `to są piękne kobiety`", "1. Базовая форма: `piękna kobieta`.\n2. Нужно множественное число, потому что говорим не об одной, а о группе.\n3. Это grupa niemęskoosobowa, потому что речь о женщинах.\n4. Существительное: `kobieta -> kobiety`.\n5. Прилагательное: `piękna -> piękne`.\n\nИтог: `to są piękne kobiety`."),
      input("Uzupełnij: to są (piękna kobieta)", "piękne kobiety", "liczba mnoga niemęskoosobowa"),
      choice("Почему `dobrzy studenci`, но `dobre książki`?", ["bo najpierw rozróżniamy męskoosobowy i niemęskoosobowy", "bo książki są w bierniku", "bo studenci są w czasie przeszłym"], "bo najpierw rozróżniamy męskoosobowy i niemęskoosobowy")
    ],
    accusative: [
      note("Разбор по шагам: `widzę dobrego lekarza`", "1. Глагол `widzę` требует `biernik`.\n2. Базовая форма: `dobry lekarz`.\n3. `lekarz` — męski żywotny, поэтому в biernik он часто похож на dopełniacz.\n4. Существительное: `lekarz -> lekarza`.\n5. Прилагательное: `dobry -> dobrego`.\n\nИтог: `widzę dobrego lekarza`."),
      input("Uzupełnij: kupuję (czarna kawa)", "czarną kawę", "biernik rodzaju żeńskiego"),
      choice("Почему `mam nowy telefon`, а не `nowego telefonu`?", ["bo telefon jest męski nieżywotny i często nie zmienia się w bierniku", "bo po `mam` jest miejscownik", "bo telefon jest w liczbie mnogiej"], "bo telefon jest męski nieżywotny i często nie zmienia się w bierniku")
    ],
    genitive: [
      note("Разбор по шагам: `potrzebuję wolnego czasu`", "1. Глагол `potrzebuję` требует `dopełniacz`.\n2. Базовая форма: `wolny czas`.\n3. Существительное: `czas -> czasu`.\n4. Прилагательное: `wolny -> wolnego`.\n\nИтог: `potrzebuję wolnego czasu`."),
      input("Uzupełnij: szukam (nowa praca)", "nowej pracy", "dopełniacz po `szukam`"),
      choice("Что важнее всего в `dużo ludzi`?", ["słowo ilości wymaga dopełniacza", "ludzie są w miejscowniku", "to forma przyszła"], "słowo ilości wymaga dopełniacza")
    ],
    dative: [
      note("Разбор по шагам: `daję małemu dziecku prezent`", "1. `daję` отвечает на вопрос `komu?`.\n2. Значит, нужен `celownik` для адресата.\n3. Базовая форма: `małe dziecko`.\n4. Существительное: `dziecko -> dziecku`.\n5. Прилагательное: `małe -> małemu`.\n\nИтог: `daję małemu dziecku prezent`."),
      input("Uzupełnij: mówię prawdę (mój kolega)", "mojemu koledze", "celownik"),
      choice("Почему `pomagam jej`, а не `ją`?", ["bo `pomagam` wymaga odpowiedzi na `komu?`", "bo `jej` to biernik", "bo po `pomagam` zawsze jest `z`"], "bo `pomagam` wymaga odpowiedzi na `komu?`")
    ],
    instrumental: [
      note("Разбор по шагам: `rozmawiam z miłą nauczycielką`", "1. Предлог `z` в значении `с кем?` требует `narzędnik`.\n2. Базовая форма: `miła nauczycielka`.\n3. Существительное: `nauczycielka -> nauczycielką`.\n4. Прилагательное: `miła -> miłą`.\n\nИтог: `rozmawiam z miłą nauczycielką`."),
      input("Uzupełnij: jestem (nowy pracownik)", "nowym pracownikiem", "narzędnik po `jestem`"),
      choice("Почему `z Polski`, но `z kolegą`?", ["bo `z` może znaczyć albo `skąd?`, albo `z kim?`", "bo Polska jest w bierniku", "bo kolega jest w miejscowniku"], "bo `z` może znaczyć albo `skąd?`, albo `z kim?`")
    ],
    locative: [
      note("Разбор по шагам: `myślę o polskim egzaminie`", "1. Предлог `o` часто требует `miejscownik`.\n2. Базовая форма: `polski egzamin`.\n3. Существительное: `egzamin -> egzaminie`.\n4. Прилагательное: `polski -> polskim`.\n\nИтог: `myślę o polskim egzaminie`."),
      input("Uzupełnij: jestem na (ważne spotkanie)", "ważnym spotkaniu", "na + miejscownik = gdzie?"),
      choice("Что отличает `na kurs` от `na kursie`?", ["pierwsze odpowiada na `dokąd?`, drugie na `gdzie?`", "оба это biernik", "оба это dopełniacz"], "pierwsze odpowiada na `dokąd?`, drugie na `gdzie?`")
    ],
    verbsPresent: [
      note("Разбор по шагам: `oni pracują`", "1. Найди лицо: `oni`.\n2. Базовый глагол: `pracować`.\n3. В настоящем времени выбираем форму для `oni`.\n4. Получаем: `pracują`.\n\nТот же путь работает и дальше: `ja robię`, `ty mówisz`, `my jedziemy`."),
      input("Uzupełnij: my (robić)", "robimy", "najpierw ustal osobę: my"),
      choice("Что важнее в настоящем времени?", ["najpierw rozpoznać osobę", "najpierw rozpoznać падеж", "najpierw rozpoznać rodzaj rzeczownika"], "najpierw rozpoznać osobę")
    ],
    verbsPast: [
      note("Разбор по шагам: `ja, kobieta -> byłam`", "1. Определи лицо: `ja`.\n2. Определи род говорящего: женщина.\n3. Базовый глагол: `być`.\n4. Для `ja, kobieta` в прошедшем времени нужна форма `byłam`.\n\nПоэтому в прошлом времени мы почти всегда смотрим и на лицо, и на род."),
      input("Uzupełnij: ja, mężczyzna (wrócić)", "wróciłem", "czas przeszły, rodzaj męski"),
      choice("Почему `robiłem` и `robiłam` отличаются?", ["bo czas przeszły pokazuje rodzaj mówiącego", "bo to dwa różne падежи", "bo одно из них przyszłość"], "bo czas przeszły pokazuje rodzaj mówiącego")
    ],
    verbsFuture: [
      note("Разбор по шагам: `jutro napiszę raport`", "1. Маркер времени: `jutro`.\n2. Решаем: нужен процесс или готовый результат?\n3. Здесь важен готовый результат — raport będzie gotowy.\n4. Поэтому выбираем совершенный вид: `napiszę`.\n\nЕсли бы речь была о процессе вечером, было бы: `jutro będę pisać raport`."),
      input("Uzupełnij: wieczorem (ja czytać) książkę", "będę czytać", "proces w przyszłości"),
      choice("Почему `napiszę`, а не `będę pisać`?", ["bo chodzi o gotowy rezultat", "bo raport jest w miejscowniku", "bo `jutro` zawsze wymaga niedokonanego"], "bo chodzi o gotowy rezultat")
    ],
    aspect: [
      note("Разбор по шагам: `codziennie czytam`, ale `jutro przeczytam`", "1. Смотри на смысл, не на термин.\n2. `codziennie` = привычка, повторяемость -> niedokonany: `czytam`.\n3. `jutro` + идея закончить текст = rezultat -> dokonany: `przeczytam`.\n\nАспект — это не украшение, а способ показать процесс или итог."),
      input("Uzupełnij: długo (pisać) ten mail", "pisałem", "proces, długo"),
      choice("Что подсказывает dokonany aspekt?", ["do końca / w końcu / gotowy rezultat", "zawsze / często", "w pracy / w domu"], "do końca / w końcu / gotowy rezultat")
    ],
    prepositions: [
      note("Разбор по шагам: `idę do nowej pracy`", "1. Задай смысловой вопрос: `dokąd?`.\n2. Для движения `куда?` часто нужен предлог `do`.\n3. `do` требует `dopełniacz`.\n4. Базовая форма: `nowa praca`.\n5. Получаем: `nowej pracy`.\n\nИтог: `idę do nowej pracy`."),
      input("Uzupełnij: jestem w (nowy sklep)", "nowym sklepie", "gdzie? = miejscownik"),
      choice("Почему `z kolegą`, но `do kolegi`?", ["bo pierwszy zwrot odpowiada na `z kim?`, a drugi na `dokąd? / do kogo?`", "bo оба это miejscownik", "bo `z` zawsze łączy się z celownikiem"], "bo pierwszy zwrot odpowiada na `z kim?`, a drugi na `dokąd? / do kogo?`")
    ],
    pronouns: [
      note("Разбор по шагам: `daj mi znać`", "1. Глагол/конструкция подразумевает адресата: `komu?`.\n2. Для `ja` в celownik нужна короткая форма `mi`.\n3. Поэтому говорим: `daj mi znać`, `powiedz mi`, `pomóż mi`.\n\nНо `widzisz mnie` — это уже другой вопрос: `kogo?`."),
      input("Uzupełnij: widzę (ona)", "ją", "biernik: kogo?"),
      choice("Почему `mu`, а не `go` после `pomagam`?", ["bo `pomagam` wymaga celownika", "bo `mu` to miejscownik", "bo `go` używa się po `z`"], "bo `pomagam` wymaga celownika")
    ],
    reflexiveSie: [
      note("Разбор по шагам: `podoba mi się ten kurs`", "1. Здесь нельзя думать только о слове `się`.\n2. Вся конструкция такая: `podobać się komu?`.\n3. Значит, `mi` — это celownik, адресат впечатления.\n4. `się` — часть конструкции.\n\nПоэтому: `podoba mi się kurs`, `podobają mi się zajęcia`."),
      input("Uzupełnij: boję ___ egzaminu", "się", "stała konstrukcja"),
      choice("Что лучше учить с `się`?", ["całą konstrukcję, a nie samo słowo", "только перевод `себя`", "всегда ставить его в конец"], "całą konstrukcję, a nie samo słowo")
    ],
    comparisons: [
      note("Разбор по шагам: `ten kurs jest lepszy niż tamten`", "1. Базовая форма: `dobry`.\n2. Нерегулярная сравнительная форма: `lepszy`.\n3. Для сравнения двух вещей часто добавляем `niż`.\n\nИтог: `ten kurs jest lepszy niż tamten`."),
      input("Uzupełnij: to było (dobre rozwiązanie)", "lepsze rozwiązanie", "stopień wyższy"),
      choice("Почему `najlepszy` сильнее, чем `lepszy`?", ["bo to stopień najwyższy, a nie tylko porównanie dwóch rzeczy", "bo это dopełniacz", "bo это forma żeńska"], "bo to stopień najwyższy, a nie tylko porównanie dwóch rzeczy")
    ],
    wordOrder: [
      note("Разбор по шагам: `jutro spotykam się z kolegą`", "1. Сначала можно поставить время: `jutro`.\n2. Потом глагол: `spotykam`.\n3. `się` держим близко к глаголу.\n4. Потом остальная информация: `z kolegą`.\n\nТак фраза звучит нейтрально и по-польски естественно."),
      input("Uzupełnij naturalnie: dziś / nie mam / czasu", "dziś nie mam czasu", "nie przed czasownikiem"),
      choice("Что чаще всего делает фразу странной?", ["dalekie ustawienie `się` i chaos w kolejności", "слишком ясный порядок слов", "использование czasu teraźniejszego"], "dalekie ustawienie `się` i chaos w kolejności")
    ],
    complexSentences: [
      note("Разбор по шагам: `uczę się, żeby lepiej mówić`", "1. Сначала формулируем действие: `uczę się`.\n2. Потом решаем, что хотим добавить: причину, результат или цель.\n3. Здесь это цель: `чтобы говорить лучше`.\n4. Значит, нужна связка `żeby`.\n\nИтог: `uczę się, żeby lepiej mówić`."),
      input("Uzupełnij: nie przyszedłem, ___ byłem chory", "bo", "przyczyna"),
      choice("Что делает `dlatego`?", ["pokazuje skutek", "pokazuje cel", "tworzy miejscownik"], "pokazuje skutek")
    ]
  };
  return blocks[topic] || [];
}

function genB1Strategy(topic) {
  const blocks = {
    b1Connectors: [
      note("Как связки делают ответ уровнем B1", "На B1 мало просто сказать одно короткое предложение. Нужна связность.\n\nСамая удобная схема:\n1. opinia: `moim zdaniem...`\n2. powód: `ponieważ / bo...`\n3. kontrast albo dodatek: `jednak / natomiast / oprócz tego...`\n4. wniosek: `dlatego / podsumowując...`\n\nДаже простой ответ звучит сильнее: `Moim zdaniem kurs online jest wygodny, ponieważ oszczędza czas. Jednak trzeba mieć dobrą organizację. Podsumowując, to dobre rozwiązanie dla wielu osób.`"),
      choice("Что лучше звучит как B1-аргумент?", ["Moim zdaniem to dobry kurs, ponieważ jest praktyczny.", "To dobry kurs. Dobry. Kurs.", "Dobry kurs i tyle."], "Moim zdaniem to dobry kurs, ponieważ jest praktyczny."),
      input("Uzupełnij связкой результата: Mam mało czasu, ___ uczę się codziennie po pracy.", "dlatego", "wynik / skutek")
    ],
    writingTemplates: [
      note("Как писать письмо без паники", "У письма B1 почти всегда есть опорный каркас:\n1. cel: зачем ты пишешь\n2. kontekst: что произошло\n3. szczegóły: 2-3 конкретные детали\n4. prośba lub oczekiwanie\n5. zakończenie\n\nЕсли держать этот порядок, письмо становится намного легче, даже когда лексика ещё не идеальна."),
      choice("Что должно появиться в письме B1 почти всегда?", ["цель письма и конкретная просьба", "сложные книжные слова", "длинные абзацы без структуры"], "цель письма и конкретная просьба"),
      input("Uzupełnij grzecznie: Zwracam się z prośbą o ___", "informację", "najczęstsza formuła pisemna")
    ],
    examB1Reading: [
      note("Как читать на экзамене B1", "В официальных заданиях B1 почти никогда не нужно переводить весь текст.\n\nРабочий порядок:\n1. прочитай вопрос\n2. найди ключевое место в тексте\n3. ищи факт: kto? gdzie? kiedy? dlaczego? co trzeba zrobić?\n4. убери ответы, которые звучат похоже, но не совпадают по смыслу\n\nТо есть мы читаем ради решения задачи, а не ради полного перевода."),
      choice("Что лучше делать первым?", ["посмотреть вопрос и ключевой запрос", "переводить каждое слово подряд", "сразу выбирать самый длинный ответ"], "посмотреть вопрос и ключевой запрос"),
      choice("Что часто проверяет czytanie B1?", ["ключевую информацию и намерение текста", "литературный анализ", "знание редких пословиц"], "ключевую информацию и намерение текста")
    ],
    examB1Listening: [
      note("Как слушать B1 без текста", "На B1 в аудировании чаще всего проверяют ситуацию и деталь: кто говорит, по какому поводу, что нужно сделать, когда и где.\n\nПервое прослушивание: поймай общий смысл.\nВторое: лови детали.\nПосле этого полезно вернуться к словам-маркерам: `jutro`, `przełożyć`, `formularz`, `odbiór`, `opóźniony`.\n\nИменно так строятся сильные привычки, а не через угадывание."),
      choice("Что важнее на первом прослушивании?", ["понять ситуацию целиком", "записать каждое слово", "сразу открыть текст"], "понять ситуацию целиком"),
      choice("Что чаще всего спрашивают после nagrania B1?", ["цель, проблема, время или действие", "автора стихотворения", "точный перевод всей записи"], "цель, проблема, время или действие")
    ],
    examB1Writing: [
      note("Что проверяют в письме B1", "Экзамен смотрит не на красоту стиля, а на то, можешь ли ты выполнить задачу.\n\nОбычно нужно:\n- ответить на все пункты polecenia\n- держать ясную структуру\n- использовать вежливый и понятный тон\n- дать конкретные детали, а не только общие слова\n\nЛучше простой, но полный текст, чем красивый, но недоделанный."),
      choice("Что опаснее всего в письме B1?", ["не ответить на один из пунктов задания", "использовать простую лексику", "написать короткое вежливое вступление"], "не ответить на один из пунктов задания"),
      input("Uzupełnij zakończenie: Z góry dziękuję za ___", "odpowiedź", "częsta formuła końcowa")
    ]
  };
  return blocks[topic] || [];
}

const topics = {
  diagnosticB1: { title: "Диагностика B1", description: "Карта сильных и слабых мест", theory: ["Начни здесь, если хочешь понять текущий уровень.", "20 вопросов смешивают падежи, времена, аспект, лексику и экзаменационные реакции.", "После прохождения смотри проценты по темам и тренируй слабые блоки."], exercises: [makeExercise("Диагностика: 20 вопросов", genDiagnostic())] },
  mixed20: { title: "Смешанный тест 20", description: "Активное вспоминание из всего курса", theory: ["Это режим для памяти: вопросы идут вперемешку, как в реальной речи.", "Запускай после 2–3 тем или в конце дня.", "Цель — 80% правильных без подсказок."], exercises: [makeExercise("Mixed practice 20", genMixed20())] },
  pluralNominative: { title: "Mianownik liczby mnogiej", description: "Множественное число: oni / one", theory: ["Mianownik liczby mnogiej отвечает на pytanie `kto? co?` и нужен, когда мы просто называем группу: `To są studenci. To są książki.`", "Самое важное деление: `oni` = męskoosobowy, `one` = niemęskoosobowy. Если в группе есть мужчины или группа смешанная, очень часто будет `oni`.", "У существительных męskoosobowy часто появляются формы типа `-i / -y / -e / -owie`: `student -> studenci`, `lekarz -> lekarze`, `pan -> panowie`, `kolega -> koledzy`.", "У niemęskoosobowy чаще видим формы `-y / -i / -e / -a`: `kobieta -> kobiety`, `pies -> psy`, `dziecko -> dzieci`, `okno -> okna`, `mieszkanie -> mieszkania`.", "Смотри сразу на прилагательное: `dobrzy studenci`, `mili koledzy`, но `dobre książki`, `nowe mieszkania`, `małe dzieci`. Практическое правило: сначала реши `oni czy one`, а уже потом выбирай форму прилагательного и существительного."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("pluralNominative")), makeExercise("Разбор по шагам", genGrammarStepByStep("pluralNominative")), makeExercise("Męskoosobowy — rzeczowniki", genMascPlural()), makeExercise("Niemęskoosobowy — rzeczowniki", genNonMascPlural()), makeExercise("Przymiotnik + rzeczownik", genPluralAdjectives()), makeExercise("Liczba mnoga w sytuacji", genPluralVariety()), makeExercise("Oni czy one?", genOniOne()), makeExercise("Исправь ошибку", genPluralMistakes()), makeExercise("Разговор", speakingPrompts)] },
  accusative: { title: "Biernik — kogo? co?", description: "Винительный падеж", theory: ["Biernik нужен, когда действие направлено на объект: `widzę`, `mam`, `kupuję`, `znam`, `spotykam`, `lubię`.", "Удобная логика такая: сначала найди глагол, потом спроси `kogo? co?`, и только потом меняй форму слова.", "Мужской одушевлённый в единственном числе обычно получает окончание `-a / -ę`, а прилагательное форму `-ego`: `lekarz -> lekarza`, `student -> studenta`, `pies -> psa`, `dobry lekarz -> dobrego lekarza`.", "Мужской неодушевлённый в единственном числе часто не меняется: `mam telefon`, `kupuję chleb`, `widzę nowy dokument`. Прилагательное здесь обычно остаётся как в mianownik: `ważny dokument`.", "Женский род в единственном числе часто меняется так: существительное `-a -> -ę`, прилагательное `-a -> -ą`: `kawa -> kawę`, `książka -> książkę`, `czarna kawa -> czarną kawę`, `dobra praca -> dobrą pracę`. Средний род обычно совпадает с mianownik: `widzę dziecko`, `mam nowe mieszkanie`.", "Во множественном числе тоже есть важное деление: `widzę dobrych studentów` для męskoosobowy и `widzę dobre książki / nowe auta` для niemęskoosobowy. Очень полезно учить готовыми кусками: `widzę nowego lekarza`, `kupuję czarną kawę`, `mam ważny dokument`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("accusative")), makeExercise("Разбор по шагам", genGrammarStepByStep("accusative")), makeExercise("Формы biernik", genAccusativeForms()), makeExercise("Прилагательные в biernik", genAccusativeAdjectives()), makeExercise("Biernik w sytuacji", genAccusativeVariety()), makeExercise("Типичные ошибки", cap50([input("Widzę dobry lekarz", "widzę dobrego lekarza"), input("Mam nowego samochodu", "mam nowy samochód"), input("Kupuję czarna kawa", "kupuję czarną kawę"), input("Znam polscy studentów", "znam polskich studentów"), input("Spotykam nowy kolegę", "spotykam nowego kolegę")])), makeExercise("Разговор", speakingPrompts)] },
  genitive: { title: "Dopełniacz — kogo? czego?", description: "Родительный падеж", theory: ["Dopełniacz очень частый в живой речи. Он появляется после отрицания `nie ma / nie mam`, после количества `dużo / mało / trochę` и после глаголов `szukam`, `potrzebuję`, `używam`.", "Хороший способ запомнить: dopełniacz часто отвечает за идею `нет чего-то`, `нужно что-то`, `ищу что-то`.", "Полезные ориентиры по окончаниям в единственном числе: мужской род часто даёт `-a / -u` (`brat -> brata`, `telefon -> telefonu`), женский обычно `-y / -i` (`kawa -> kawy`, `praca -> pracy`), средний часто `-a` (`mieszkanie -> mieszkania`, `dziecko -> dziecka`).", "Во множественном числе часто встречаются формы типа `-ów / -i / -y / zero ending`: `studentów`, `ludzi`, `kobiet`, `książek`, `mieszkań`. Не пытайся угадать всё одной формулой: лучше держать частые слова готовыми блоками.", "Типичные пары: `mam czas -> nie mam czasu`, `jest kawa -> nie ma kawy`, `mam pracę -> szukam pracy`. После чисел и слов количества dopełniacz особенно важен: `dużo ludzi`, `mało pieniędzy`, `trochę wody`.", "На B1 полезно не просто знать форму, а держать готовые конструкции: `potrzebuję pomocy`, `używam telefonu`, `nie mam czasu`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("genitive")), makeExercise("Разбор по шагам", genGrammarStepByStep("genitive")), makeExercise("Dopełniacz — формы", genGenitive()), makeExercise("Dopełniacz w sytuacji", genGenitiveVariety()), makeExercise("Исправь ошибку", cap50([input("Nie mam czas", "nie mam czasu"), input("Nie ma kawa", "nie ma kawy"), input("Szukam pracę", "szukam pracy"), input("Potrzebuję pomoc", "potrzebuję pomocy"), input("Dużo ludzie", "dużo ludzi"), input("Używam telefon", "używam telefonu"), input("Mało pieniądze", "mało pieniędzy"), input("Trochę wodę", "trochę wody")])), makeExercise("Разговор", speakingPrompts)] },
  dative: { title: "Celownik — komu? czemu?", description: "Дательный падеж", theory: ["Celownik показывает адресата действия: кому я даю, кому помогаю, кому говорю, кому объясняю.", "Самые полезные формы для жизни: `mi`, `ci`, `mu`, `jej`, `nam`, `wam`, `im`. Они встречаются постоянно: `podoba mi się`, `pomagam ci`, `mówię mu`.", "У существительных полезно видеть типичные окончания: мужской род часто `-owi / -u` (`student -> studentowi`, `brat -> bratu`), женский часто `-ie / -y` (`kobieta -> kobiecie`, `mama -> mamie`), средний часто `-u` (`dziecko -> dziecku`).", "Во множественном числе очень часты формы `-om`: `studentom`, `kobietom`, `dzieciom`, `ludziom`.", "Запоминай с глаголом целиком: `pomagam koledze`, `daję dziecku prezent`, `mówię mamie prawdę`. Частая ошибка B1: ставить biernik вместо celownik. После `pomagać` и `dawać komuś` почти всегда нужен именно celownik."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("dative")), makeExercise("Разбор по шагам", genGrammarStepByStep("dative")), makeExercise("Celownik — формы", genDative()), makeExercise("Celownik w sytuacji", genDativeVariety()), makeExercise("Исправь ошибку", cap50([input("Praca daje mnie satysfakcję", "praca daje mi satysfakcję"), input("Pomagam mój kolega", "pomagam mojemu koledze"), input("Daję książkę brat", "daję książkę bratu"), input("Pokazuję droga student", "pokazuję drogę studentowi"), input("Pomagam ona", "pomagam jej"), input("Daję jemu prezent", "daję mu prezent"), input("Mówię do ci", "mówię ci"), input("Pomagam ludzie", "pomagam ludziom")])), makeExercise("Разговор", speakingPrompts)] },
  instrumental: { title: "Narzędnik — z kim? z czym?", description: "Творительный падеж", theory: ["Narzędnik часто нужен в двух базовых ситуациях: после `z` и после `być`, когда мы называем профессию, роль или состояние.", "С `z` это обычно ответ на `с кем? с чем?`: `z kolegą`, `z rodziną`, `z dokumentem`. После `jestem` это `кем? чем?`: `jestem programistą`, `jestem studentem`.", "Полезные ориентиры по окончаниям: мужской и средний род в единственном числе часто дают `-em` (`studentem`, `samochodem`, `dzieckiem`), женский чаще `-ą` (`kobietą`, `rodziną`, `książką`).", "Во множественном числе очень часты формы `-ami / -mi`: `z kolegami`, `z dziećmi`, `z ludźmi`, `samochodami`.", "На уровне B1 старайся учить narzędnik не списком, а в живых конструкциях: `pracuję z ludźmi`, `jadę samochodem`, `jestem zainteresowany kursem`. Если видишь `z` в значении `вместе с`, очень вероятно нужен narzędnik. Но `z pracy` и `z Polski` — это уже dopełniacz, потому что там значение `откуда`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("instrumental")), makeExercise("Разбор по шагам", genGrammarStepByStep("instrumental")), makeExercise("Narzędnik — формы", genInstrumental()), makeExercise("Исправь ошибку", cap50([input("Jestem programista", "jestem programistą"), input("Idę z kolega", "idę z kolegą"), input("Bawię się z córka", "bawię się z córką"), input("Rozmawiam z nauczyciel", "rozmawiam z nauczycielem"), input("Jadę samochód", "jadę samochodem"), input("On jest lekarz", "on jest lekarzem"), input("Spotykam się z rodzina", "spotykam się z rodziną"), input("Pracuję z ludzie", "pracuję z ludźmi")])), makeExercise("Разговор", speakingPrompts)] },
  locative: { title: "Miejscownik — o kim? o czym?", description: "Местный / предложный падеж", theory: ["Miejscownik почти всегда приходит с предлогом. Самые частые друзья этого падежа: `w`, `na`, `o`, `po`, `przy`.", "Он нужен, когда мы говорим gdzie что-то находится или о чём говорим: `w Polsce`, `w pracy`, `na kursie`, `o rodzinie`, `o problemie`.", "Полезные ориентиры по окончаниям: очень часто встречаются формы `-e / -ie / -u`: `Polska -> Polsce`, `kurs -> kursie`, `praca -> pracy`, `język -> języku`, `park -> parku`, `biuro -> biurze`.", "Для памяти хорошо держать связки готовыми блоками: `w domu`, `w sklepie`, `na spotkaniu`, `o języku polskim`, `po pracy`.", "Частая ловушка: после `w` и `na` нужно понять смысл. `na kurs` = куда? biernik. `na kursie` = где? miejscownik. Чтобы miejscownik стал удобным, полезно учить не одно слово, а мини-фразу: `mieszkam w Polsce`, `myślę o egzaminie`, `rozmawiam o pracy`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("locative")), makeExercise("Разбор по шагам", genGrammarStepByStep("locative")), makeExercise("Miejscownik — формы", genLocative()), makeExercise("Miejscownik w sytuacji", genLocativeVariety()), makeExercise("Исправь ошибку", cap50([input("Mieszkam w Polska", "mieszkam w Polsce"), input("Jestem w praca", "jestem w pracy"), input("Mówię o rodzina", "mówię o rodzinie"), input("Byłem w sklep", "byłem w sklepie"), input("Myślę o kurs", "myślę o kursie"), input("Czytam o język polski", "czytam o języku polskim"), input("Jestem na spotkanie", "jestem na spotkaniu"), input("Spaceruję po park", "spaceruję po parku")])), makeExercise("Разговор", speakingPrompts)] },
  verbsPresent: { title: "Czas teraźniejszy", description: "Настоящее время", theory: ["Czas teraźniejszy нужен для привычек, распорядка, фактов и того, что происходит сейчас: `pracuję`, `uczę się`, `mieszkam`, `wiem`.", "Сначала всегда определи лицо: `ja / ty / on-ona-ono / my / wy / oni-one`. От этого зависит окончание.", "Полезные модели спряжения: `-ować -> -uję, -ujesz, -uje, -ujemy, -ujecie, -ują` (`pracować -> pracuję`); `-ać -> -am, -asz, -a, -amy, -acie, -ają` (`mieszkać -> mieszkam`); многие глаголы на `-ić / -yć / -eć` дают тип `-ę, -isz/-ysz, -i/-y, -imy/-ymy, -icie/-ycie, -ą` (`robić -> robię, robisz`, `mówić -> mówię, mówisz`).", "Очень частая опора для памяти: `ja` часто заканчивается на `-ę` или `-m`, `ty` часто на `-sz`, `my` на `-my`, `wy` на `-cie`, `oni/one` часто на `-ą / -ją`.", "Некоторые глаголы надо просто запомнить как частотные: `być`, `mieć`, `iść`, `jeść`, `móc`. Учись не отдельной форме, а короткой репликой: `pracuję w firmie`, `mieszkam w Warszawie`, `nie mam czasu`, `idziemy do sklepu`.", "Частая ошибка на старте B1 — путать окончания по лицам. Если не уверен, сначала определи `ja / ty / on / my / wy / oni`, и только потом выбирай форму."], exercises: [makeExercise("Grupy i końcówki — jak to działa", genPresentConjugationGuide()), makeExercise("Model końcówek", genPresentConjugationDrills()), makeExercise("Почему так? Разбор формы", genGrammarNuance("verbsPresent")), makeExercise("Разбор по шагам", genGrammarStepByStep("verbsPresent")), makeExercise("Спряжение", genPresent()), makeExercise("Czas teraźniejszy w sytuacji", genPresentVariety()), makeExercise("Исправь ошибку", cap50([input("ja pracuje", "ja pracuję"), input("ty piję kawę", "ty pijesz kawę"), input("oni mówi po polsku", "oni mówią po polsku"), input("my mieszka w Polsce", "my mieszkamy w Polsce"), input("wy robią zadanie", "wy robicie zadanie"), input("on pijesz kawę", "on pije kawę"), input("ja masz czas", "ja mam czas")])), makeExercise("Разговор", speakingPrompts)] },
  irregularVerbs: { title: "Czasowniki nieregularne", description: "Неправильные глаголы и спряжение", theory: ["Это глаголы, которые лучше не выводить по правилу, а запомнить как готовые формы. Они очень частые и дают основу для живой речи.", "Самые важные для повседневного B1: `być`, `mieć`, `iść`, `jechać`, `jeść`, `móc`, `chcieć`, `wiedzieć`, `brać`, `dać`.", "Здесь особенно важно учить не только инфинитив, но и ключевые личные формы. Например: `być -> jestem, jesteś, jest, jesteśmy, jesteście, są`; `mieć -> mam, masz, ma, mamy, macie, mają`.", "Ещё несколько частотных опор: `iść -> idę, idziesz`; `jechać -> jadę, jedziesz`; `jeść -> jem, jesz`; `móc -> mogę, możesz`; `chcieć -> chcę, chcesz`; `wiedzieć -> wiem, wiesz`; `brać -> biorę, bierzesz`; `dać -> dam, dasz`.", "Лучше учить их в коротких фразах: `jestem w domu`, `mam czas`, `idę do pracy`, `mogę pomóc`, `chcę się uczyć`. Обрати внимание на формы, которые чаще всего ломают автоматизм: `idę`, `jadę`, `jem`, `mogę`, `biorę`, `wiem`.", "Задача этого блока не просто узнать таблицу, а начать быстро узнавать и использовать эти формы без остановки."], exercises: [makeExercise("Спряжение nieregularne", genIrregularVerbs()), makeExercise("Nieregularne w sytuacji", genIrregularVerbsVariety()), makeExercise("Исправь ошибку", cap50([input("Ja jest w domu", "ja jestem w domu"), input("Ty moża mi pomóc", "ty możesz mi pomóc"), input("My wiedzą o problemie", "my wiemy o problemie"), input("Oni jecha do pracy", "oni jadą do pracy"), input("Ja bierzesz dokument", "ja biorę dokument"), input("Wy dają odpowiedź", "wy dajecie odpowiedź"), input("On chcie iść", "on chce iść"), input("Ona jem obiad", "ona je obiad")])), makeExercise("Разговор", speakingPrompts)] },
  verbsPast: { title: "Czas przeszły", description: "Прошедшее время", theory: ["Прошедшее время в польском зависит от рода и числа, поэтому сначала смотри: кто говорит и о ком идёт речь.", "В единственном числе полезно держать схему: `ja/on` часто `-łem / -ł`, `ja/ona` часто `-łam / -ła`. Например: `robiłem / robiłam`, `miałem / miałam`, `poszedłem / poszłam`.", "Во множественном числе часто видим `-liśmy / -łyśmy`, `-liście / -łyście`, `-li / -ły`: `robiliśmy`, `robiłyśmy`, `zrobili`, `zrobiły`.", "В 1-м и 2-м лице полезно сразу держать пары: `byłem / byłam`, `miałem / miałam`, `chciałem / chciałam`.", "Если рассказываешь о вчерашнем дне, лучше строить не отдельные формы, а маленький рассказ: `wczoraj wróciłem do domu, zjadłem obiad i odpoczywałem`.", "Отдельно запомни частотные нестандартные формы движения: `pójść -> poszedłem / poszłam`, `przyjść -> przyszedłem / przyszłam`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("verbsPast")), makeExercise("Разбор по шагам", genGrammarStepByStep("verbsPast")), makeExercise("Czas przeszły — формы", genPast()), makeExercise("Разговор", speakingPrompts)] },
  verbsFuture: { title: "Czas przyszły", description: "Будущее время", theory: ["В польском будущем важно сначала понять: ты говоришь о процессе или о результате. Это сразу влияет на форму.", "Если речь о процессе или плане без акцента на завершение, часто будет `będę + bezokolicznik` или `będę + forma przeszła`: `będę pracować`, `będę czytać`, `będę pracował`.", "Формы `być` в будущем такие: `będę, będziesz, będzie, będziemy, będziecie, będą`. Это база для всего будущего процесса.", "Если нужен результат, обычно берём совершенный вид: `zrobię`, `kupię`, `napiszę`, `przeczytam`, `pojadę`. Здесь уже нет `będę`: нельзя говорить `będę zrobię`.", "Сравнение: `jutro będę pisać raport` = процесс; `jutro napiszę raport` = закончу и будет готово.", "Будущее почти всегда дружит с маркерами времени: `jutro`, `pojutrze`, `za godzinę`, `za tydzień`, `w przyszłym miesiącu`, `o ósmej`."], exercises: [makeExercise("Почему так? Разбор формы", genGrammarNuance("verbsFuture")), makeExercise("Разбор по шагам", genGrammarStepByStep("verbsFuture")), makeExercise("Czas przyszły — формы", genFuture()), makeExercise("Czas przyszły w sytuacji", genFutureVariety()), makeExercise("Будущее + время", genFutureWithTime()), makeExercise("Разговор", speakingPrompts)] },
  aspect: { title: "Aspekt — robić vs zrobić", description: "Несовершенный и совершенный вид", theory: ["Aspekt в польском — это взгляд на действие: как на процесс или как на результат. Это одна из самых важных тем для сильного B1.", "Niedokonany показывает процесс, привычку, повторяемость, длительность: `robić`, `czytać`, `pisać`, `uczyć się`.", "Dokonany показывает завершение или конкретный итог: `zrobić`, `przeczytać`, `napisać`, `nauczyć się`.", "В настоящем времени обычны только формы niedokonany: `czytam`, `robię`, `piszę`. Dokonany в настоящем почти не используется для обычного `сейчас`, зато даёт будущее результата: `przeczytam`, `zrobię`, `napiszę`.", "Подсказки в предложении очень помогают. `zawsze`, `często`, `teraz`, `długo` тянут к niedokonany. `już`, `do końca`, `w końcu`, `na jutro` часто тянут к dokonany.", "Хорошая привычка: учить глаголы парами и сразу в контексте, например `czytać książkę` и `przeczytać książkę do końca`."], exercises: [makeExercise("Почему так? Разбор смысла", genGrammarNuance("aspect")), makeExercise("Разбор по шагам", genGrammarStepByStep("aspect")), makeExercise("Выбери аспект", genAspectChoice()), makeExercise("Пары aspektowe", genAspectPairs()), makeExercise("Aspekt w sytuacji", genAspectVariety()), makeExercise("Разговор", speakingPrompts)] },
  prepositions: { title: "Przyimki + przypadki", description: "Предлоги и падежи", theory: ["В польском предлог почти никогда не живёт один: он тянет за собой конкретный падеж. Поэтому учить надо не `do`, а `do + dopełniacz`, не `z`, а разные значения `z`.", "База для жизни: `do sklepu`, `do pracy`, `z pracy`, `w Polsce`, `na kursie`, `na kurs`, `o problemie`, `z rodziną`.", "Самая частая путаница: `na` и `w`, а также разные значения `z`. `z rodziną` = вместе с кем? narzędnik. `z Polski` = откуда? dopełniacz.", "Полезный способ учить: не список предлогов, а мини-маршрут. `Idę do sklepu. Jestem w sklepie. Wracam ze sklepu.`", "Если ты сначала спрашиваешь себя `куда? где? откуда? с кем? о чём?`, падеж выбирается намного легче."], exercises: [makeExercise("Почему так? Смысл и падеж", genGrammarNuance("prepositions")), makeExercise("Разбор по шагам", genGrammarStepByStep("prepositions")), makeExercise("Przyimki", genPrepositions()), makeExercise("Przyimki w sytuacji", genPrepositionVariety()), makeExercise("Разговор", speakingPrompts)] },
  numbersTime: { title: "Liczby i czas", description: "Числа, часы, деньги и выражения времени", theory: ["Числа нужны для времени, дат, цен, адресов и количества.", "После `1` обычно форма единственного числа: `jeden złoty`, `jeden grosz`, `jedna godzina`.", "После `2, 3, 4` чаще идёт форма множественного числа: `dwa złote`, `trzy grosze`, `cztery książki`, `dwie godziny`.", "После `5+` обычно dopełniacz liczby mnogiej: `pięć złotych`, `pięć groszy`, `pięć książek`, `pięć godzin`, `pięć minut`.", "Важно: `22/23/24 -> złote, grosze, godziny`, но `12/13/14 -> złotych, groszy, godzin`, потому что числа на `12-14` ведут себя как группа `5+`.", "Время: `która godzina? -> ósma`, но `o której? -> o ósmej`. Для будущих планов: `Jutro o ósmej będę pracować.`"], exercises: [makeExercise("Liczby 0–100", genNumbers()), makeExercise("Pieniądze: złoty / złote / złotych", genMoney()), makeExercise("Правила 1–4 / 5+", genNumberRules()), makeExercise("Liczby i czas w sytuacji", genNumberTimeVariety()), makeExercise("Która godzina?", genClock()), makeExercise("Wyrażenia czasu", genTimePhrases()), makeExercise("Czas + przyszłość", genFutureWithTime()), makeExercise("Разговор", speakingPrompts)] },
  complexSentences: { title: "Zdania złożone", description: "Сложные предложения", theory: ["На B1 сложное предложение нужно не ради сложности, а чтобы нормально объяснять причины, цели, условия и мнение.", "`że` помогает передавать мысль: `myślę, że...`, `uważam, że...`.", "`bo / ponieważ` дают причину, `dlatego` показывает результат, `żeby` — цель, `jeśli` — условие.", "Удобный шаблон ответа: `Myślę, że...`, `bo...`, `dlatego...`, `na przykład...`.", "Чем чаще ты собираешь длинную мысль из простых связок, тем живее и сильнее звучит речь."], exercises: [makeExercise("Почему так? Связность B1", genGrammarNuance("complexSentences")), makeExercise("Разбор по шагам", genGrammarStepByStep("complexSentences")), makeExercise("Spójniki", genComplexSentences()), makeExercise("Zdania złożone w sytuacji", genComplexSentenceVariety()), makeExercise("Разговор", speakingPrompts)] },
  politeConditional: { title: "Tryb warunkowy", description: "Вежливые просьбы и условное", theory: ["Tryb warunkowy нужен для вежливого B1-письма и просьб.", "Главные формы: chciałbym/chciałabym, mógłbym/mogłabym, mogliby Państwo.", "В условии: gdybym miał czas, zadzwoniłbym."], exercises: [makeExercise("Вежливые формы", genPoliteConditional()), makeExercise("Разговор", speakingPrompts)] },
  imperatives: { title: "Tryb rozkazujący", description: "Инструкции и просьбы", theory: ["Повелительное нужно для инструкций, просьб и запретов.", "Для pan/pani часто используем: proszę + bezokolicznik.", "Для запрета: nie zapomnij, nie rób, proszę nie palić."], exercises: [makeExercise("Rozkazujący", genImperatives()), makeExercise("Разговор", speakingPrompts)] },
  pronouns: { title: "Zaimki w przypadkach", description: "Местоимения: mi, mnie, go, mu", theory: ["На B1 важно не путать короткие формы местоимений.", "Celownik: mi, ci, mu, jej, nam, wam, im.", "Biernik/dopełniacz: mnie, cię/ciebie, go/jego, ją, nas, was, ich.", "Самый рабочий подход: не зубрить таблицу отдельно, а держать пары с глаголом: `pomóż mi`, `widzę go`, `nie ma mnie`, `daj jej znać`.", "Если сначала задаёшь вопрос `komu? kogo? czego?`, форма местоимения вспоминается намного легче."], exercises: [makeExercise("Почему так? Местоимение и падеж", genGrammarNuance("pronouns")), makeExercise("Местоимения", genPronouns()), makeExercise("Разговор", speakingPrompts)] },
  reflexiveSie: { title: "Czasowniki z się", description: "uczę się, podoba mi się", theory: ["`się` часто стоит после глагола: uczę się, spotykam się.", "`podobać się` требует celownik: podoba mi się.", "Некоторые глаголы с `się` меняют смысл: bawić się, bać się, czuć się.", "Самое полезное правило здесь: учить не одно `się`, а целую конструкцию. Не `bać`, а `bać się czegoś`; не `podobać`, а `podoba mi się coś`.", "Тогда эта тема перестаёт быть абстрактной и сразу начинает работать в живой речи."], exercises: [makeExercise("Почему так? Konstrukcja z się", genGrammarNuance("reflexiveSie")), makeExercise("się в речи", genReflexiveSie()), makeExercise("Разговор", speakingPrompts)] },
  comparisons: { title: "Stopniowanie", description: "Сравнения: lepszy, droższy, niż", theory: ["Сравнение нужно для мнения и аргументации.", "Часто: -szy/-ejszy, naj-, niż.", "Нерегулярные: dobry → lepszy → najlepszy, zły → gorszy → najgorszy.", "На B1 сравнение редко живёт одно. Обычно оно входит в мнение: `ten вариант jest wygodniejszy niż tamten`, `to było najlepsze rozwiązanie`.", "Хорошо тренировать не только форму, но и целую мысль: zaleta + porównanie + wniosek."], exercises: [makeExercise("Почему так? Stopniowanie", genGrammarNuance("comparisons")), makeExercise("Разбор по шагам", genGrammarStepByStep("comparisons")), makeExercise("Сравнения", genComparisons()), makeExercise("Porównania w sytuacji", genComparisonVariety()), makeExercise("Разговор", speakingPrompts)] },
  modalVerbs: { title: "Czasowniki modalne", description: "muszę, mogę, powinienem", theory: ["Модальные конструкции делают речь практичной.", "`muszę` = должен, `mogę` = могу, `powinienem/powinnam` = следует. После них обычно идёт bezokolicznik: `muszę pracować`, `mogę wejść`, `powinienem zadzwonić`.", "Полезно помнить и личные формы: `móc -> mogę, możesz, może, możemy, możecie, mogą`; `musieć -> muszę, musisz, musi, musimy, musicie, muszą`.", "`powinienem / powinnam` меняется по роду, а во множественном числе часто встречаем `powinniśmy / powinnyśmy`.", "`wolno / nie wolno` часто используются в правилах и объявлениях: `Tu nie wolno palić.`"], exercises: [makeExercise("Modalne", genModalVerbs()), makeExercise("Modalne w sytuacji", genModalVariety()), makeExercise("Разговор", speakingPrompts)] },
  impersonal: { title: "Formy bezosobowe", description: "można, trzeba, należy, warto", theory: ["Безличные формы очень частые в объявлениях, правилах и инструкциях.", "`można` = можно, `trzeba` = нужно, `należy` = следует, `warto` = стоит.", "После них чаще всего идёт bezokolicznik: `trzeba podpisać`, `można zapłacić kartą`, `warto sprawdzić termin`.", "Это удобный способ говорить нейтрально, без конкретного `я/ты/мы`: не `musisz podpisać`, а более официально `należy podpisać formularz`."], exercises: [makeExercise("Безличные формы", genImpersonal()), makeExercise("Bezosobowe w sytuacji", genImpersonalVariety()), makeExercise("Разговор", speakingPrompts)] },
  wordOrder: { title: "Szyk zdania", description: "Порядок слов B1", theory: ["Польский порядок слов гибкий, но нейтральная фраза должна звучать естественно.", "Базовый порядок для спокойной нейтральной фразы такой: `кто / тема -> глагол -> остальная информация`: `Ja pracuję w biurze.`, `Jutro mam spotkanie.`", "Частица `nie` обычно стоит перед глаголом: `nie rozumiem`, `nie mam czasu`. `się` очень часто стоит сразу после глагола: `uczę się`, `boję się`, `spotykamy się`.", "Короткие местоимения тоже любят свои привычные места: `podoba mi się`, `daj mi znać`, `nie ma go w domu`.", "Вопросы часто начинаются с `kiedy / gdzie / czy / dlaczego`, после чего идёт остальная часть фразы: `Kiedy możesz przyjść?`, `Czy masz czas?`. Если порядок слов звучит странно, почти всегда помогает вернуться к простой прямой конструкции и переставить `się` ближе к глаголу."], exercises: [makeExercise("Почему так? Естественный szyk", genGrammarNuance("wordOrder")), makeExercise("Разбор по шагам", genGrammarStepByStep("wordOrder")), makeExercise("Порядок слов", genWordOrder()), makeExercise("Szyk w sytuacji", genWordOrderVariety()), makeExercise("Разговор", speakingPrompts)] },
  b1Connectors: { title: "Łączniki B1+", description: "jednak, natomiast, oprócz tego", theory: ["Связки превращают короткие фразы в B1-речь.", "`jednak` и `natomiast` помогают противопоставлять мысли более спокойно и точно.", "`oprócz tego`, `z tego powodu`, `podsumowując` помогают строить письмо, мнение и вывод.", "Если связки подобраны правильно, даже простая лексика начинает звучать более зрелой.", "Лучше 2-3 точные связки в одном ответе, чем длинный хаотичный текст без логики."], exercises: [makeExercise("Как строить связный ответ", genB1Strategy("b1Connectors")), makeExercise("Связки B1", genB1Connectors()), makeExercise("Выбери связку", genConnectorChoiceAdvanced()), makeExercise("Собери фразу", genSentenceAssemblyB1()), makeExercise("Короткий ответ 2–4 zdania", genShortWritingB1()), makeExercise("Разговор", speakingPrompts)] },
  workLexicon: { title: "Praca i firma", description: "Работа, компания, собеседование", theory: ["Эта тема нужна для разговоров о работе, обязанностях, сроках и отпуске.", "Сильная B1-речь: не только znam słowo, а умею объяснить ситуацию: mam termin, szukam pracy, chcę wziąć urlop.", "Тренируй слова сразу с падежами: szukam pracy, rozmawiam z kierownikiem, mam spotkanie."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("work")), makeExercise("PL → RU", genThematicReverseChoices("work")), makeExercise("RU → PL: выбери", genThematicChoices("work")), makeExercise("RU → PL: напиши", genThematicWords("work")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("work")), makeExercise("Gotowe frazy", genThematicPhrases("work")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("work")), makeExercise("Rozumienie tekstu", genThematicComprehension("work")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("work")), makeExercise("Ситуация", genTopicSpeaking("work"))] },
  housingLexicon: { title: "Mieszkanie", description: "Жильё, аренда, бытовые проблемы", theory: ["Тема закрывает аренду квартиры, счета, ремонт и контакт с владельцем.", "Важно уметь говорить проблему спокойно и конкретно: mamy awarię, nie działa ogrzewanie, kiedy można obejrzeć mieszkanie?", "Полезные связки: w mieszkaniu, z właścicielem, do innej dzielnicy."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("housing")), makeExercise("PL → RU", genThematicReverseChoices("housing")), makeExercise("RU → PL: выбери", genThematicChoices("housing")), makeExercise("RU → PL: напиши", genThematicWords("housing")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("housing")), makeExercise("Gotowe frazy", genThematicPhrases("housing")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("housing")), makeExercise("Rozumienie tekstu", genThematicComprehension("housing")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("housing")), makeExercise("Ситуация", genTopicSpeaking("housing"))] },
  healthLexicon: { title: "Zdrowie i lekarz", description: "Врач, аптека, симптомы", theory: ["B1 требует уметь объяснить симптомы, записаться к врачу и понять базовые инструкции.", "Главные конструкции: boli mnie..., mam gorączkę, potrzebuję recepty, chcę umówić wizytę.", "Эта тема хорошо тренирует biernik и dopełniacz: mam receptę, potrzebuję skierowania."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("health")), makeExercise("PL → RU", genThematicReverseChoices("health")), makeExercise("RU → PL: выбери", genThematicChoices("health")), makeExercise("RU → PL: напиши", genThematicWords("health")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("health")), makeExercise("Gotowe frazy", genThematicPhrases("health")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("health")), makeExercise("Rozumienie tekstu", genThematicComprehension("health")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("health")), makeExercise("Ситуация", genTopicSpeaking("health"))] },
  documentsLexicon: { title: "Urząd i dokumenty", description: "Документы, заявления, учреждение", theory: ["Это практическая тема для жизни в Польше: urząd, wniosek, formularz, opłata, odbiór dokumentu.", "Цель — уметь спросить, что заполнить, где подписать и когда забрать документ.", "Типичные фразы: złożyć wniosek, podpisać formularz, odebrać dokument."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("documents")), makeExercise("PL → RU", genThematicReverseChoices("documents")), makeExercise("RU → PL: выбери", genThematicChoices("documents")), makeExercise("RU → PL: напиши", genThematicWords("documents")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("documents")), makeExercise("Gotowe frazy", genThematicPhrases("documents")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("documents")), makeExercise("Rozumienie tekstu", genThematicComprehension("documents")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("documents")), makeExercise("Ситуация", genTopicSpeaking("documents"))] },
  shoppingLexicon: { title: "Zakupy i usługi", description: "Покупки, услуги, возврат", theory: ["Тема помогает решать бытовые ситуации: покупка, доставка, возврат, гарантия.", "Для B1 важно уметь не только купить, но и объяснить проблему: chcę zwrócić towar, mam paragon, potrzebuję innego rozmiaru.", "Здесь хорошо повторяются biernik и narzędnik: mam paragon, płacę kartą."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("shopping")), makeExercise("PL → RU", genThematicReverseChoices("shopping")), makeExercise("RU → PL: выбери", genThematicChoices("shopping")), makeExercise("RU → PL: напиши", genThematicWords("shopping")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("shopping")), makeExercise("Gotowe frazy", genThematicPhrases("shopping")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("shopping")), makeExercise("Rozumienie tekstu", genThematicComprehension("shopping")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("shopping")), makeExercise("Ситуация", genTopicSpeaking("shopping"))] },
  cityLexicon: { title: "Miasto i transport", description: "Город, транспорт, как добраться", theory: ["Тема нужна для дороги, опозданий, пересадок и объяснения маршрута.", "Главные действия: dojechać, przesiąść się, kupić bilet, sprawdzić rozkład jazdy.", "Тренируй направления: do centrum, na przystanku, z przesiadką."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("city")), makeExercise("PL → RU", genThematicReverseChoices("city")), makeExercise("RU → PL: выбери", genThematicChoices("city")), makeExercise("RU → PL: напиши", genThematicWords("city")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("city")), makeExercise("Gotowe frazy", genThematicPhrases("city")), makeExercise("Jak mówić o tej sytuacji", genThematicSkillBuilder("city")), makeExercise("Rozumienie tekstu", genThematicComprehension("city")), makeExercise("Gramatyka w kontekście", genThematicContextGrammar("city")), makeExercise("Ситуация", genTopicSpeaking("city"))] },
  educationLexicon: makeLexiconTopic("education", "Edukacja i egzamin", "Учёба, экзамен, прогресс", ["Тема нужна для подготовки к B1, общения с преподавателем и описания своего прогресса.", "Фокус: egzamin, poziom, postęp, błąd, certyfikat.", "Используй лексику, чтобы говорить не только что учишь, но и как именно учишься."]),
  relationshipsLexicon: makeLexiconTopic("relationships", "Relacje i emocje", "Отношения, эмоции, поддержка", ["B1 требует уметь описывать чувства, конфликты, просьбы и отношения.", "Фокус: wsparcie, zaufanie, przeprosiny, decyzja, wdzięczność.", "Эта тема помогает делать речь менее сухой и более человеческой."]),
  travelLexicon: makeLexiconTopic("travel", "Podróże i hotel", "Путешествия, отель, задержки", ["Тема закрывает поездки, бронирование, отель, багаж и проблемы в дороге.", "Фокус: rezerwacja, nocleg, opóźnienie, recepcja, zwiedzanie.", "Полезно для диалогов и писем в сервисные службы."]),
  foodLexicon: makeLexiconTopic("food", "Jedzenie i restauracja", "Еда, ресторан, аллергии", ["Тема нужна для заказа еды, разговора в ресторане и описания вкусов.", "Фокус: danie, składnik, rachunek, napiwek, alergia.", "Здесь удобно тренировать вежливые просьбы и бытовые диалоги."]),
  technologyLexicon: makeLexiconTopic("technology", "Internet i technologia", "Интернет, приложения, проблемы", ["Современный B1 почти всегда требует говорить о телефоне, приложениях и онлайн-сервисах.", "Фокус: hasło, konto, plik, aktualizacja, bezpieczeństwo danych.", "Тема полезна для обращений в поддержку и рабочих ситуаций."]),
  argumentationLexicon: makeLexiconTopic("argumentation", "Argumentacja B1", "Мнение, аргументы, вывод", ["Это ключевой блок для письма и говорения B1.", "Фокус: opinia, argument, przykład, zaleta, wada, wniosek.", "Он помогает строить ответ: мнение → причина → пример → вывод."]),
  financeLexicon: makeLexiconTopic("finance", "Finanse osobiste", "Деньги, бюджет, банк", ["Тема нужна для платежей, расходов, банковских вопросов и жизни в Польше.", "Фокус: budżet, wydatek, dochód, przelew, oszczędności.", "Полезно для писем в банк, разговоров о счетах и планирования бюджета."]),
  familyLexicon: makeLexiconTopic("family", "Rodzina i pokolenia", "Семья, поколения, обязанности", ["B1 часто просит рассказать о семье, обязанностях и отношениях между поколениями.", "Фокус: rodzice, wychowanie, krewny, opieka, uroczystość.", "Эта тема добавляет человеческие детали в письмо и говорение."]),
  dailyLexicon: makeLexiconTopic("daily", "Codzienne życie", "Быт, привычки, организация дня", ["Тема закрывает обычный день, домашние обязанности и рутину.", "Фокус: plan dnia, nawyk, przerwa, odpoczynek, organizacja czasu.", "Это основа для длинных ответов на экзамене."]),
  natureLexicon: makeLexiconTopic("nature", "Pogoda i natura", "Погода, природа, поездки", ["Тема помогает говорить о погоде, планах и отдыхе на природе.", "Фокус: prognoza pogody, deszcz, wiatr, krajobraz, sezon.", "Хорошо подходит для описаний и коротких рассказов."]),
  cultureLexicon: makeLexiconTopic("culture", "Kultura i media", "Культура, новости, медиа", ["B1 требует уметь обсуждать фильмы, книги, новости и события.", "Фокус: artykuł, wiadomości, wystawa, recenzja, wydarzenie kulturalne.", "Эта тема усиливает чтение и аргументацию."]),
  leisureLexicon: makeLexiconTopic("leisure", "Czas wolny i sport", "Хобби, спорт, отдых", ["Тема нужна для разговоров о выходных, интересах и здоровье.", "Фокус: hobby, trening, spacer, zainteresowanie, pasja.", "Здесь удобно тренировать приглашения и предложения."]),
  safetyLexicon: makeLexiconTopic("safety", "Bezpieczeństwo i prawo", "Безопасность, правила, помощь", ["Практическая тема для аварийных ситуаций, документов и заявлений.", "Фокус: policja, wypadek, zgłoszenie, świadek, numer alarmowy.", "Полезно для жизни, письма и экзаменационных ситуаций."]),
  societyLexicon: makeLexiconTopic("society", "Społeczeństwo", "Общество, город, интеграция", ["Тема даёт лексику для более зрелых B1-ответов.", "Фокус: społeczeństwo, integracja, wolontariat, problem społeczny, jakość życia.", "С ней легче писать мнение и говорить о городе."]),
  personalityLexicon: makeLexiconTopic("personality", "Charakter i cechy", "Характер, качества человека", ["Тема нужна для описания себя, друзей, коллег и персонажей.", "Фокус: odpowiedzialny, punktualny, uczciwy, pomocny, pewny siebie.", "Она делает речь точнее и богаче."]),
  environmentLexicon: makeLexiconTopic("environment", "Środowisko", "Экология, город, выбор", ["Тема выводит курс ближе к сильному B1, потому что даёт общественную лексику.", "Фокус: recykling, smog, zanieczyszczenie, transport publiczny, ochrona środowiska.", "Подходит для письма-мнения и устной аргументации."]),
  writingTemplates: { title: "Pisanie: шаблоны B1", description: "Готовые структуры письма", theory: ["B1-письмо легче, когда есть готовый скелет.", "Сначала прочитай шаблон, потом напиши свой текст по ситуации.", "Цель — не красивый стиль, а ясная структура: кто пишет, зачем, детали, просьба, завершение.", "Хорошее письмо B1 обычно выигрывает не за счёт сложных слов, а за счёт ясности и полноты.", "Если ты ответил на все пункты задания и дал конкретные детали, это уже сильная база."], exercises: [makeExercise("Как устроено письмо B1", genB1Strategy("writingTemplates")), makeExercise("Шаблоны", genWritingTemplates()), makeExercise("Собери формулу письма", genWritingAssembly()), makeExercise("Практика по шаблонам", genWritingTemplatePractice()), makeExercise("Короткие ответы 2–4 zdania", genShortWritingB1())] },
  examB1Reading: { title: "Egzamin B1: Czytanie", description: "Экзаменационное чтение", theory: ["Тренировка чтения B1: короткий текст, ключевая информация, выбор ответа.", "На экзамене не нужно переводить каждое слово. Ищи: kto? gdzie? kiedy? co trzeba zrobić?", "В длинных текстах сначала пойми общий смысл, потом ищи конкретную деталь и ключевое слово.", "В официальных тестах часто проверяется не весь текст, а одно точное решение: что нужно сделать, в чём проблема, какая цель сообщения.", "Поэтому лучше читать задачей, а не словарём: вопрос -> ключ -> ответ."], exercises: [makeExercise("Jak czytać na B1", genB1Strategy("examB1Reading")), makeExercise("Czytanie: krótkie komunikaty", genReadingSignalsB1()), makeExercise("Szybkie pytania egzaminacyjne", genExamReading()), makeExercise("Dłuższe teksty B1", genLongReading())] },
  examB1Listening: { title: "Egzamin B1: Słuchanie", description: "Аудирование с озвучкой", theory: ["Сначала слушай запись без текста: цель — понять ситуацию, время, место, просьбу или проблему.", "После ответа открой скрипт и проверь, какие слова ты не услышал. Медленный режим нужен для повторного прохода.", "Диктанты тренируют точность: они заставляют слышать польские звуки и писать слова без подсказки.", "В заданиях B1 особенно важно ловить слова-маркеры: terminy, godziny, zmiana planu, prośba, reklamacja, urząd.", "Даже если ты не понял всё, часто достаточно услышать правильный тип ситуации и одну ключевую деталь."], exercises: [makeExercise("Jak słuchać na B1", genB1Strategy("examB1Listening")), makeExercise("Słuchanie: cel i sytuacja", genListeningSignalsB1()), makeExercise("Audio: słuchaj i odpowiedz", genAudioListening()), makeExercise("Słuchanie z tekstem", genExamListening())] },
  examB1Grammar: { title: "Egzamin B1: Poprawność gramatyczna", description: "Грамматика в контексте B1", theory: ["Этот блок учит видеть грамматику не как таблицу, а как выбор формы по ситуации.", "На B1 важно не только знать правило, но и быстро понимать, что требует контекст: падеж, аспект, время, местоимение или связка.", "Именно такой формат особенно полезен и для экзамена, и для обычной речи, потому что он тренирует автоматизм выбора."], exercises: [makeExercise("Jak działa poprawność gramatyczna", genExamGrammarGuide()), makeExercise("Mikrotest gramatyczny B1", genExamGrammarSkills()), makeExercise("Gramatyka w sytuacji", genExamGrammarContext())] },
  examB1Writing: { title: "Egzamin B1: Pisanie", description: "Письмо: email, жалоба, заявление", theory: ["Письмо B1 требует структуры: приветствие, цель, детали, просьба, завершение.", "Цель — писать 80–120 слов простыми, правильными фразами.", "Проверяй себя по чеклисту: czy jest cel? czy są szczegóły? czy ton jest grzeczny?", "В хорошей работе видно, что автор выполнил задачу, а не просто написал что-то похожее на письмо.", "Если задание просит объяснить проблему, попросить о помощи и предложить решение, все три пункта должны быть в тексте."], exercises: [makeExercise("Na co patrzy egzamin", genB1Strategy("examB1Writing")), makeExercise("Jak rozłożyć polecenie", genWritingTaskAnalysis()), makeExercise("Pisanie B1", genExamWriting()), makeExercise("Krótka odpowiedź 2–4 zdania", genShortWritingB1()), makeExercise("Собери полезную фразу", genWritingAssembly())] },
  examB1Speaking: { title: "Egzamin B1: Mówienie", description: "Говорение: карточки и ситуации", theory: ["Говорение B1 — это не идеальная грамматика, а понятная речь с примерами и связками.", "Тренируй схему: opisuję sytuację → dodaję szczegóły → mówię opinię → kończę wnioskiem.", "Хорошие связки: moim zdaniem, wydaje mi się, ponieważ, dlatego, na przykład."], exercises: [makeExercise("Mówienie B1", genExamSpeaking())] },
  examB1Mock: { title: "Egzamin B1: Mini test", description: "Смешанный пробный тест", theory: ["Мини-тест смешивает грамматику, лексику и экзаменационные реакции.", "Используй его как контроль после прохождения модулей.", "Если тема даёт много ошибок, возвращайся в соответствующий блок курса."], exercises: [makeExercise("Mini test B1", genExamMixed()), makeExercise("Wypowiedź kontrolna", repeatTo50([free("Napisz autoprezentację B1: kim jesteś, czym się zajmujesz, dlaczego uczysz się polskiego i jakie masz plany. 100–140 słów.", "Checklist: teraźniejszość, przeszłość, przyszłość, минимум 5 связок.")]))] },
  b1Mistakes: { title: "Najczęstsze błędy B1", description: "Самые частые ошибки B1", theory: ["Здесь собраны ошибки по падежам, się, порядку слов, аспекту, предлогам и временам.", "Цель — видеть ошибку автоматически.", "Если ошибка повторяется 3 раза — это тема для повторения.", "Лучший способ работать с этим блоком: не просто исправлять форму, а объяснять себе, почему здесь нужен именно этот падеж, аспект или порядок слов."], exercises: [makeExercise("Исправь ошибки B1", genB1Mistakes()), makeExercise("Mikrotest gramatyczny B1", genExamGrammarSkills()), makeExercise("Собери правильную фразу", genSentenceAssemblyB1()), makeExercise("Короткий ответ 2–4 zdania", genShortWritingB1()), makeExercise("Разговор-диагностика", speakingPrompts)] },
  audioUczmySiePolskiego: { title: "Audio: Uczmy się polskiego", description: "Сериал по сериям с YouTube", theory: ["Это отдельный финальный раздел для живого аудирования через учебный сериал. Он хорош тем, что даёт повторяемые бытовые темы и медленную, понятную польскую речь.", "Лучший режим работы такой: сначала смотри без паузы, потом пересматривай с выписыванием 5-10 новых слов, потом добавляй их в словарь и через пару дней возвращайся к серии.", "Начинай с odcinki 1-15, потому что они ближе к базе A2/B1. Когда они станут понятнее, переходи дальше и используй сериал как мост к настоящему аудированию."], exercises: [makeExercise("Serial audio", genUczmySiePolskiego())] }
};

const courseModules = [
  { title: "Диагностика и повторение", keys: ["diagnosticB1", "mixed20"] },
  { title: "База: формы и числа", keys: ["pluralNominative", "numbersTime"] },
  { title: "Падежи в речи", keys: ["accusative", "genitive", "dative", "instrumental", "locative"] },
  { title: "Глаголы и время", keys: ["verbsPresent", "irregularVerbs", "verbsPast", "verbsFuture", "aspect"] },
  { title: "Конструкции B1", keys: ["prepositions", "complexSentences", "b1Connectors", "politeConditional", "imperatives", "pronouns", "reflexiveSie", "comparisons", "modalVerbs", "impersonal", "wordOrder", "b1Mistakes"] },
  { title: "Лексика по темам", keys: ["workLexicon", "housingLexicon", "healthLexicon", "documentsLexicon", "shoppingLexicon", "cityLexicon", "educationLexicon", "relationshipsLexicon", "travelLexicon", "foodLexicon", "technologyLexicon", "argumentationLexicon", "financeLexicon", "familyLexicon", "dailyLexicon", "natureLexicon", "cultureLexicon", "leisureLexicon", "safetyLexicon", "societyLexicon", "personalityLexicon", "environmentLexicon"] },
  { title: "Egzamin B1", keys: ["writingTemplates", "examB1Reading", "examB1Listening", "examB1Grammar", "examB1Writing", "examB1Speaking", "examB1Mock"] },
  { title: "Audio i serial", keys: ["audioUczmySiePolskiego"] }
];

const topicGoals = {
  diagnosticB1: ["Понять текущий уровень", "Найти слабые темы", "Получить направление для повторения"],
  mixed20: ["Вспоминать без подсказок", "Смешивать темы", "Тренировать B1-автоматизм"],
  pluralNominative: ["Отличать oni от one", "Согласовывать прилагательные", "Говорить о людях и вещах во множественном числе"],
  accusative: ["Правильно отвечать на kogo? co?", "Говорить что видишь, покупаешь, любишь", "Не путать żywotny и nieżywotny"],
  genitive: ["Строить отрицание nie mam / nie ma", "Использовать dużo, mało, trochę", "Говорить о том, чего не хватает"],
  dative: ["Говорить кому помогаешь и что даёшь", "Использовать mi, ci, mu, jej", "Не подставлять biernik после pomagać"],
  instrumental: ["Говорить с кем и чем", "Называть профессию после jestem", "Использовать z + narzędnik"],
  locative: ["Говорить где находишься", "Использовать w, na, o + miejscownik", "Описывать место жизни и работы"],
  verbsPresent: ["Спрягать частые глаголы", "Согласовывать глагол с лицом", "Говорить о привычках"],
  irregularVerbs: ["Запомнить самые частые неправильные формы", "Узнавать их на слух и в тексте", "Использовать в коротких живых фразах"],
  verbsPast: ["Говорить о прошлом с родом", "Отличать robiłem / robiłam", "Рассказывать о выходных"],
  verbsFuture: ["Строить планы", "Различать będę robić и zrobię", "Добавлять время: jutro, za godzinę, o ósmej"],
  aspect: ["Выбирать процесс или результат", "Связывать aspekt с маркерами czasu", "Избегать będę zrobię"],
  prepositions: ["Связывать предлог с падежом", "Различать w/na/do/z", "Говорить куда, где и откуда"],
  numbersTime: ["Называть числа, цены и время", "Выбирать złoty/złote/złotych", "Строить планы по времени"],
  complexSentences: ["Соединять мысли через że, bo, dlatego, żeby", "Строить B1-длину фраз", "Объяснять причины и цели"],
  politeConditional: ["Писать вежливые просьбы", "Использовать chciałbym/mogliby Państwo", "Строить условные фразы"],
  imperatives: ["Понимать инструкции", "Давать просьбы и запреты", "Использовать proszę + bezokolicznik"],
  pronouns: ["Не путать mi/mnie/go/mu", "Ставить местоимение в нужный падеж", "Говорить естественнее"],
  reflexiveSie: ["Использовать глаголы с się", "Строить podoba mi się", "Не терять się в предложении"],
  comparisons: ["Сравнивать людей и ситуации", "Использовать niż и naj-", "Делать аргументацию точнее"],
  modalVerbs: ["Говорить что можно, нужно и следует", "Понимать правила", "Использовать powinienem/powinnam"],
  impersonal: ["Понимать объявления и инструкции", "Использовать można/trzeba/należy", "Писать нейтрально и формально"],
  wordOrder: ["Строить естественный порядок слов", "Правильно ставить się и nie", "Формулировать вопросы"],
  b1Connectors: ["Связывать аргументы", "Противопоставлять мысли", "Делать вывод"],
  workLexicon: ["Говорить о работе и обязанностях", "Понимать базовые слова компании", "Писать короткое рабочее сообщение"],
  housingLexicon: ["Обсуждать аренду и счета", "Сообщать о бытовой проблеме", "Описывать район и квартиру"],
  healthLexicon: ["Записаться к врачу", "Описать симптомы", "Понять слова рецепта и обследования"],
  documentsLexicon: ["Подать заявление", "Спросить о формуляре и сроках", "Разобраться в визите в учреждение"],
  shoppingLexicon: ["Купить, вернуть или обменять товар", "Говорить о доставке и гарантии", "Решать ситуацию в магазине"],
  cityLexicon: ["Объяснять маршрут", "Говорить об опоздании и пересадке", "Покупать билет и спрашивать дорогу"],
  educationLexicon: ["Говорить об обучении и экзамене", "Описывать прогресс и ошибки", "Планировать подготовку B1"],
  relationshipsLexicon: ["Описывать эмоции и отношения", "Просить поддержку и давать совет", "Говорить о конфликте спокойно"],
  travelLexicon: ["Бронировать отель и поездку", "Объяснять задержку", "Говорить о путешествии"],
  foodLexicon: ["Заказывать в ресторане", "Говорить о вкусе и аллергиях", "Описывать еду и рецепт"],
  technologyLexicon: ["Объяснять техническую проблему", "Говорить о приложениях и данных", "Писать в поддержку"],
  argumentationLexicon: ["Строить мнение", "Давать аргументы и примеры", "Делать вывод B1"],
  financeLexicon: ["Планировать бюджет", "Говорить о платежах и расходах", "Решать банковскую ситуацию"],
  familyLexicon: ["Рассказывать о семье", "Описывать поколения и обязанности", "Писать приглашение или личное сообщение"],
  dailyLexicon: ["Описывать обычный день", "Говорить о бытовых делах", "Организовывать время"],
  natureLexicon: ["Описывать погоду", "Говорить о природе и поездках", "Понимать прогноз"],
  cultureLexicon: ["Говорить о фильмах, книгах и событиях", "Писать короткую рецензию", "Понимать новости и афиши"],
  leisureLexicon: ["Рассказывать о хобби", "Предлагать планы на выходные", "Говорить о спорте и отдыхе"],
  safetyLexicon: ["Сообщать о проблеме", "Понимать правила и запреты", "Просить помощь в экстренной ситуации"],
  societyLexicon: ["Говорить об обществе и городе", "Строить мнение о проблеме", "Использовать лексику интеграции"],
  personalityLexicon: ["Описывать характер", "Сравнивать людей", "Говорить о сильных качествах"],
  environmentLexicon: ["Говорить об экологии", "Аргументировать ответ о городе", "Описывать ответственный выбор"],
  writingTemplates: ["Использовать готовые структуры", "Писать email, жалобу и просьбу", "Держать формат B1"],
  examB1Reading: ["Понимать короткие и длинные тексты", "Искать ключевую информацию", "Находить лексику в контексте"],
  examB1Listening: ["Слушать без скрипта", "Ловить время, место и действие", "Проверять себя по диктанту"],
  examB1Grammar: ["Выбирать форму по контексту", "Распознавать падеж, аспект и время", "Тренировать грамматический автоматизм B1"],
  examB1Writing: ["Писать email, жалобу и заявление", "Держать структуру B1", "Проверять текст по чеклисту"],
  examB1Speaking: ["Говорить по карточке", "Описывать ситуацию", "Строить ответ 1–2 минуты"],
  examB1Mock: ["Проверить готовность", "Смешать грамматику и лексику", "Найти слабые темы"],
  b1Mistakes: ["Видеть типичные B1-ошибки", "Повторять слабые места", "Готовиться к смешанной речи"],
  audioUczmySiePolskiego: ["Слушать живой учебный польский", "Брать лексику из контекста серии", "Связывать аудирование со словарём и коротким пересказом"]
};

const isPracticeItem = (item) => item.type !== "note" && item.type !== "audio";

function getProfileStorageKey(profileId) {
  return `${PROFILE_STORAGE_PREFIX}-${profileId}`;
}

function createDefaultProfileMeta() {
  return {
    activeProfileId: "profile-1",
    profiles: [
      { id: "profile-1", name: "Виталий" },
      { id: "profile-2", name: "Кристина" }
    ]
  };
}

function normalizeProfileMeta(meta) {
  const fallback = createDefaultProfileMeta();
  const profiles = Array.isArray(meta?.profiles) ? [...meta.profiles] : [];
  if (!profiles.find((profile) => profile.id === "profile-1")) {
    profiles.unshift(fallback.profiles[0]);
  }
  if (!profiles.find((profile) => profile.id === "profile-2")) {
    profiles.push(fallback.profiles[1]);
  }
  const normalizedProfiles = profiles.map((profile) => {
    if (profile.id === "profile-1") return { ...profile, name: "Виталий" };
    if (profile.id === "profile-2") return { ...profile, name: "Кристина" };
    return profile;
  });
  const activeProfileId = normalizedProfiles.find((profile) => profile.id === meta?.activeProfileId) ? meta.activeProfileId : normalizedProfiles[0].id;
  return { activeProfileId, profiles: normalizedProfiles };
}

function loadProfileMeta() {
  try {
    const raw = window.localStorage.getItem(PROFILE_META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.profiles?.length) return normalizeProfileMeta(parsed);
    }
  } catch {}
  return normalizeProfileMeta(createDefaultProfileMeta());
}

function loadProfileCourse(profileId) {
  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(profileId));
    if (raw) return JSON.parse(raw);
    if (profileId === "profile-1") {
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return legacyRaw ? JSON.parse(legacyRaw) : {};
    }
    return {};
  } catch {
    return {};
  }
}

function saveProfileMeta(meta) {
  window.localStorage.setItem(PROFILE_META_KEY, JSON.stringify(meta));
}

function saveProfileCourse(profileId, data) {
  window.localStorage.setItem(getProfileStorageKey(profileId), JSON.stringify(data));
}

function evaluateAnswer(item, answer) {
  if (item.type === "note" || item.type === "audio") return false;
  const value = answer?.value || "";
  if (!answer?.checked) return false;
  if (item.type === "free") return getFreeAnswerScore(value).passed;
  if (item.type === "cloze") return getClozeScore(item, answer).passed;
  if (item.type === "choice") return value === item.correct;
  return (item.a || []).map(norm).includes(norm(value));
}

function getFreeAnswerScore(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  const lower = norm(value);
  const connectors = ["bo", "ponieważ", "dlatego", "żeby", "że", "jeśli", "kiedy", "na przykład", "moim zdaniem"];
  const hasConnector = connectors.some((word) => lower.includes(word));
  const hasPastOrFuture = /(łem|łam|liśmy|łyśmy|będę|będziesz|będzie|będziemy|będą|jutro|wczoraj|za tydzień)/.test(lower);
  return {
    words: words.length,
    hasConnector,
    hasPastOrFuture,
    passed: words.length >= 12 && (hasConnector || words.length >= 25)
  };
}

function getClozeScore(item, value) {
  const values = Array.isArray(value?.values) ? value.values : [];
  const blanks = item.blanks || [];
  const correct = blanks.filter((blank, index) =>
    (blank.answers || []).map(norm).includes(norm(values[index]))
  ).length;
  return { correct, total: blanks.length, passed: blanks.length > 0 && correct === blanks.length };
}

function buildItemId(key, exIndex, itemIndex) {
  return `${key}-${exIndex}-${itemIndex}`;
}

function getItemById(id) {
  const parts = String(id).split("-");
  const itemIndex = Number(parts.pop());
  const exIndex = Number(parts.pop());
  const key = parts.join("-");
  const item = topics[key]?.exercises?.[exIndex]?.items?.[itemIndex];
  return item ? { key, exIndex, itemIndex, item, exerciseTitle: topics[key].exercises[exIndex].title } : null;
}

function getNextReview(previous, isCorrect, now = Date.now()) {
  const intervals = [0, 1, 3, 7, 14, 30];
  const attempts = (previous?.attempts || 0) + 1;
  const corrects = (previous?.corrects || 0) + (isCorrect ? 1 : 0);
  const streak = isCorrect ? (previous?.streak || 0) + 1 : 0;
  const intervalDays = isCorrect ? intervals[Math.min(streak, intervals.length - 1)] : 0;
  return {
    attempts,
    corrects,
    streak,
    intervalDays,
    dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
    lastResult: isCorrect ? "correct" : "wrong",
    updatedAt: now
  };
}

function ProgressBar({ value }) {
  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressFill, width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function DictionaryModal({ words, onClose, onRemove }) {
  const text = words.map((word, index) => `${index + 1}. ${word.pl} — ${word.ru}`).join("\n");

  function copyDictionary() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  function printDictionary() {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Mój słownik</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #202428; }
            h1 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccd6dd; padding: 8px; text-align: left; }
            th { background: #eef3f6; }
          </style>
        </head>
        <body>
          <h1>Mój słownik</h1>
          <p>${words.length} słów</p>
          <table>
            <thead><tr><th>#</th><th>Polski</th><th>Tłumaczenie</th></tr></thead>
            <tbody>${words.map((word, index) => `<tr><td>${index + 1}</td><td>${word.pl}</td><td>${word.ru}</td></tr>`).join("")}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h2>Мой словарь</h2>
            <p>{words.length} слов. Можно скопировать список или распечатать таблицу.</p>
          </div>
          <button style={styles.btn} onClick={onClose}>Закрыть</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button style={styles.primary} onClick={copyDictionary}>Копировать список</button>
          <button style={styles.btn} onClick={printDictionary}>Печать</button>
        </div>
        <textarea readOnly value={text} style={styles.printArea} />
        <div style={{ marginTop: 16 }}>
          {words.map((word) => (
            <div key={`${word.pl}-${word.addedAt}`} style={styles.dictionaryItem}>
              <div><strong>{word.pl}</strong> — {word.ru}<br /><small>{word.source === "manual" ? "добавлено вручную" : word.source}</small></div>
              <button style={styles.btn} onClick={() => onRemove(word.pl)}>Удалить</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnswerBlock({ item, state, setState, addWord }) {
  if (item.type === "note") {
    return (
      <div style={styles.note}>
        <strong>{item.title}</strong>
        <div style={item.body.includes("\n") ? styles.template : { marginTop: 8 }}>{item.body}</div>
        {item.links?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {item.links.map((link) => (
              <div key={link.url} style={{ marginTop: 6 }}>
                <a href={link.url.startsWith("http") ? link.url : encodeURI(link.url)} target="_blank" rel="noreferrer">{link.label}</a>
              </div>
            ))}
          </div>
        )}
        {item.words?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <strong>Добавить в мой словарь</strong>
            <div>
              {item.words.map(([pl, ru]) => (
                <button key={`${pl}-${ru}`} style={styles.wordChip} onClick={() => addWord(pl, ru, item.title)}>
                  + {pl} · {ru}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.type === "audio") {
    const showScript = state?.showScript || false;
    return (
      <div style={styles.note}>
        <strong>{item.title}</strong>
        <div style={{ marginTop: 8 }}>{item.src ? item.body : "Сначала слушай без текста, ответь на вопросы ниже, потом открой скрипт для проверки."}</div>
        {item.src ? (
          <div style={{ marginTop: 10 }}>
            <audio controls preload="none" style={{ width: "100%" }} src={encodeURI(item.src)} />
            <div style={{ marginTop: 10 }}>
              <button style={styles.btn} onClick={() => setState({ ...state, showScript: !showScript })}>
                {showScript ? "Скрыть полный текст" : "Показать полный текст"}
              </button>
            </div>
            {item.links?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {item.links.map((link) => (
                  <div key={link.url} style={{ marginTop: 6 }}>
                    <a href={link.url.startsWith("http") ? link.url : encodeURI(link.url)} target="_blank" rel="noreferrer">{link.label}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button style={styles.primary} onClick={() => speakPolish(item.body, 0.95)}>Слушать</button>
            <button style={styles.btn} onClick={() => speakPolish(item.body, 0.78)}>Медленно</button>
            <button style={styles.btn} onClick={() => window.speechSynthesis?.cancel()}>Стоп</button>
            <button style={styles.btn} onClick={() => setState({ ...state, showScript: !showScript })}>
              {showScript ? "Скрыть скрипт" : "Показать скрипт"}
            </button>
          </div>
        )}
        {showScript && <div style={styles.template}>{item.transcript || item.body}</div>}
      </div>
    );
  }

  if (item.type === "cloze") {
    const values = Array.isArray(state?.values) ? state.values : Array(item.blanks.length).fill("");
    const checked = state?.checked || false;
    const score = getClozeScore(item, { values, checked: true });
    return (
      <div>
        {item.title && <div style={{ marginBottom: 10, fontWeight: "bold" }}>{item.title}</div>}
        <div style={{ ...styles.template, whiteSpace: "normal", lineHeight: 1.7 }}>
          {item.lines.map((line, lineIndex) => {
            const parts = line.split(/(\[\d+\])/g);
            return (
              <div key={`${item.title || item.q}-${lineIndex}`} style={{ marginBottom: 8 }}>
                {parts.map((part, partIndex) => {
                  const match = part.match(/^\[(\d+)\]$/);
                  if (!match) return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                  const blankIndex = Number(match[1]) - 1;
                  return (
                    <input
                      key={`${lineIndex}-${partIndex}`}
                      value={values[blankIndex] || ""}
                      onChange={(e) => {
                        const nextValues = [...values];
                        nextValues[blankIndex] = e.target.value;
                        setState({ values: nextValues, checked: false });
                      }}
                      style={{ ...styles.input, width: 110, display: "inline-block", margin: "0 6px" }}
                      placeholder="..."
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <button onClick={() => setState({ values, checked: true, checkedAt: Date.now() })} style={styles.primary}>Проверить</button>
          <button onClick={() => setState({ values: Array(item.blanks.length).fill(""), checked: false })} style={styles.btn}>Сбросить</button>
          {checked && (
            <span style={{ fontWeight: "bold", color: score.passed ? "green" : "red" }}>
              {score.passed ? "✓ Весь диалог заполнен правильно" : `✗ Правильно: ${score.correct}/${score.total}`}
            </span>
          )}
        </div>
        {checked && !score.passed && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#56616b" }}>
            Проверь формы и предлоги. Здесь важно услышать цельную фразу, а не отдельное слово.
          </div>
        )}
        {checked && item.explanation && <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>{item.explanation}</div>}
      </div>
    );
  }

  const value = state?.value || "";
  const checked = state?.checked || false;
  const isFree = item.type === "free";
  const isChoice = item.type === "choice";
  const correct = isChoice ? item.correct : item.a?.[0];
  const isCorrect = evaluateAnswer(item, { value, checked: true });

  return (
    <div>
      {isChoice ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {item.options.map((opt) => <button key={opt} onClick={() => setState({ value: opt, checked: false })} style={{ ...styles.btn, ...(value === opt ? styles.primary : {}) }}>{opt}</button>)}
        </div>
      ) : isFree ? (
        <textarea value={value} onChange={(e) => setState({ value: e.target.value, checked: false })} rows={5} style={{ ...styles.input, resize: "vertical" }} placeholder="Напиши ответ полными предложениями..." />
      ) : (
        <input value={value} onChange={(e) => setState({ value: e.target.value, checked: false })} style={styles.input} placeholder="Напиши ответ..." />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <button onClick={() => setState({ value, checked: true, checkedAt: Date.now() })} style={styles.primary}>Проверить</button>
        <button onClick={() => setState({ value: "", checked: false })} style={styles.btn}>Сбросить</button>
        {checked && <span style={{ fontWeight: "bold", color: isCorrect ? "green" : "red" }}>{isFree ? (isCorrect ? "✓ Достаточно текста" : "✗ Напиши подробнее") : isCorrect ? "✓ Правильно" : `✗ Правильно: ${correct}`}</span>}
      </div>
      {isFree && checked && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#56616b" }}>
          Слов: {getFreeAnswerScore(value).words} · связка: {getFreeAnswerScore(value).hasConnector ? "есть" : "нет"} · время/план: {getFreeAnswerScore(value).hasPastOrFuture ? "есть" : "нет"}
        </div>
      )}
      {checked && item.explanation && <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>{item.explanation}</div>}
    </div>
  );
}

export default function App() {
  const topicKeys = Object.keys(topics);
  const profileMeta = useMemo(loadProfileMeta, []);
  const initialActiveProfileId = profileMeta.activeProfileId || profileMeta.profiles[0].id;
  const saved = useMemo(() => loadProfileCourse(initialActiveProfileId), [initialActiveProfileId]);
  const [profiles, setProfiles] = useState(profileMeta.profiles);
  const [activeProfileId, setActiveProfileId] = useState(initialActiveProfileId);
  const [loadedProfileId, setLoadedProfileId] = useState(initialActiveProfileId);
  const [topicKey, setTopicKey] = useState(saved.topicKey || topicKeys[0]);
  const [exerciseIndex, setExerciseIndex] = useState(saved.exerciseIndex || 0);
  const [answers, setAnswers] = useState(saved.answers || {});
  const [review, setReview] = useState(saved.review || {});
  const [userWords, setUserWords] = useState(saved.userWords || []);
  const [newWordPl, setNewWordPl] = useState("");
  const [newWordRu, setNewWordRu] = useState("");
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionaryDockOpen, setDictionaryDockOpen] = useState(false);
  const initialModuleTitle = courseModules.find((module) => module.keys.includes(saved.topicKey || topicKeys[0]))?.title || courseModules[0].title;
  const [openModules, setOpenModules] = useState({ [initialModuleTitle]: true });
  const [openTopics, setOpenTopics] = useState({ [saved.topicKey || topicKeys[0]]: true });
  const [rulesOpen, setRulesOpen] = useState(true);

  const safeTopicKey = topics[topicKey] ? topicKey : topicKeys[0];
  const topic = topics[safeTopicKey];
  const hasRuleSheets = (topicRuleSheets[safeTopicKey] || []).length > 0;
  const safeExerciseIndex = topic.exercises[exerciseIndex] ? exerciseIndex : 0;
  const exercise = topic.exercises[safeExerciseIndex];
  const currentItems = exercise.items;

  const flat = topicKeys.flatMap((key) => topics[key].exercises.map((_, i) => ({ key, i })));
  const currentFlat = flat.findIndex((x) => x.key === safeTopicKey && x.i === safeExerciseIndex);

  useEffect(() => {
    saveProfileMeta({ activeProfileId, profiles });
  }, [activeProfileId, profiles]);

  useEffect(() => {
    if (activeProfileId === loadedProfileId) return;
    const course = loadProfileCourse(activeProfileId);
    const nextTopicKey = topics[course.topicKey] ? course.topicKey : topicKeys[0];
    const nextExerciseIndex = topics[nextTopicKey].exercises[course.exerciseIndex] ? course.exerciseIndex : 0;
    const nextModuleTitle = courseModules.find((module) => module.keys.includes(nextTopicKey))?.title || courseModules[0].title;
    setTopicKey(nextTopicKey);
    setExerciseIndex(nextExerciseIndex);
    setAnswers(course.answers || {});
    setReview(course.review || {});
    setUserWords(course.userWords || []);
    setNewWordPl("");
    setNewWordRu("");
    setDictionaryOpen(false);
    setDictionaryDockOpen(false);
    setOpenModules({ [nextModuleTitle]: true });
    setOpenTopics({ [nextTopicKey]: true });
    setRulesOpen(true);
    setLoadedProfileId(activeProfileId);
  }, [activeProfileId, loadedProfileId, topicKeys]);

  useEffect(() => {
    if (activeProfileId !== loadedProfileId) return;
    saveProfileCourse(activeProfileId, { topicKey: safeTopicKey, exerciseIndex: safeExerciseIndex, answers, review, userWords });
  }, [answers, review, userWords, safeTopicKey, safeExerciseIndex, activeProfileId, loadedProfileId]);

  const progress = useMemo(() => {
    const ids = currentItems.map((item, i) => isPracticeItem(item) ? `${safeTopicKey}-${safeExerciseIndex}-${i}` : null).filter(Boolean);
    const checked = ids.filter((id) => answers[id]?.checked).length;
    const correct = ids.filter((id) => {
      const a = answers[id];
      const item = currentItems[Number(id.split("-").pop())];
      return evaluateAnswer(item, a);
    }).length;
    return { checked, correct, total: ids.length, percent: ids.length ? Math.round((correct / ids.length) * 100) : 0 };
  }, [answers, safeTopicKey, safeExerciseIndex, currentItems]);

  const courseStats = useMemo(() => {
    const byTopic = {};
    let checked = 0;
    let correct = 0;
    let total = 0;

    topicKeys.forEach((key) => {
      const topicTotal = topics[key].exercises.reduce((sum, ex) => sum + ex.items.filter(isPracticeItem).length, 0);
      let topicChecked = 0;
      let topicCorrect = 0;

      topics[key].exercises.forEach((ex, exIndex) => {
        ex.items.forEach((item, itemIndex) => {
          if (!isPracticeItem(item)) return;
          const answer = answers[`${key}-${exIndex}-${itemIndex}`];
          if (answer?.checked) topicChecked += 1;
          if (evaluateAnswer(item, answer)) topicCorrect += 1;
        });
      });

      byTopic[key] = {
        checked: topicChecked,
        correct: topicCorrect,
        total: topicTotal,
        percent: topicTotal ? Math.round((topicCorrect / topicTotal) * 100) : 0
      };
      checked += topicChecked;
      correct += topicCorrect;
      total += topicTotal;
    });

    return { byTopic, checked, correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
  }, [answers, topicKeys]);

  const mistakes = useMemo(() => {
    const list = [];
    topicKeys.forEach((key) => {
      topics[key].exercises.forEach((ex, exIndex) => {
        ex.items.forEach((item, itemIndex) => {
          if (!isPracticeItem(item)) return;
          const id = buildItemId(key, exIndex, itemIndex);
          const answer = answers[id];
          if (answer?.checked && !evaluateAnswer(item, answer)) {
            list.push({ id, key, exIndex, itemIndex, item, answer, exerciseTitle: ex.title, checkedAt: answer.checkedAt || 0 });
          }
        });
      });
    });
    return list.sort((a, b) => b.checkedAt - a.checkedAt).slice(0, 8);
  }, [answers, topicKeys]);

  const dueReviews = useMemo(() => {
    const now = Date.now();
    return Object.entries(review)
      .filter(([, state]) => state.dueAt <= now || state.lastResult === "wrong")
      .map(([id, state]) => ({ id, state, ...getItemById(id) }))
      .filter((entry) => entry.item)
      .sort((a, b) => (a.state.dueAt || 0) - (b.state.dueAt || 0))
      .slice(0, 10);
  }, [review]);

  const memoryStats = useMemo(() => {
    const states = Object.values(review);
    return {
      trained: states.length,
      due: dueReviews.length,
      learned: states.filter((state) => state.streak >= 3).length,
      weak: states.filter((state) => state.lastResult === "wrong" || state.streak === 0).length
    };
  }, [review, dueReviews]);

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (value?.checked) {
      const found = getItemById(id);
      if (found) {
        const isCorrect = evaluateAnswer(found.item, value);
        setReview((prev) => ({ ...prev, [id]: getNextReview(prev[id], isCorrect, value.checkedAt || Date.now()) }));
      }
    }
  }
  function addWord(pl, ru, source = "manual") {
    const cleanPl = String(pl || "").trim();
    const cleanRu = String(ru || "").trim();
    if (!cleanPl || !cleanRu) return;
    setUserWords((prev) => {
      const exists = prev.some((word) => norm(word.pl) === norm(cleanPl));
      if (exists) return prev;
      return [{ pl: cleanPl, ru: cleanRu, source, addedAt: Date.now() }, ...prev];
    });
  }
  function addManualWord() {
    addWord(newWordPl, newWordRu, "manual");
    setNewWordPl("");
    setNewWordRu("");
  }
  function switchProfile(nextProfileId) {
    if (nextProfileId && nextProfileId !== activeProfileId) {
      setActiveProfileId(nextProfileId);
    }
  }
  function createProfile() {
    const nextNumber = profiles.length + 1;
    const id = `profile-${Date.now()}`;
    const customName = window.prompt("Имя нового профиля", `Пользователь ${nextNumber}`);
    if (customName === null) return;
    const name = String(customName || "").trim() || `Пользователь ${nextNumber}`;
    setProfiles((prev) => [...prev, { id, name }]);
    saveProfileCourse(id, {});
    setActiveProfileId(id);
  }
  function renameProfile() {
    const current = profiles.find((profile) => profile.id === activeProfileId);
    if (!current) return;
    const nextName = window.prompt("Новое имя профиля", current.name);
    if (nextName === null) return;
    const cleanName = String(nextName || "").trim();
    if (!cleanName) return;
    setProfiles((prev) => prev.map((profile) => profile.id === activeProfileId ? { ...profile, name: cleanName } : profile));
  }
  function removeWord(pl) {
    setUserWords((prev) => prev.filter((word) => norm(word.pl) !== norm(pl)));
  }
  function openPath(key) {
    const module = courseModules.find((item) => item.keys.includes(key));
    if (module) setOpenModules((prev) => ({ ...prev, [module.title]: true }));
    setOpenTopics((prev) => ({ ...prev, [key]: true }));
  }
  function selectTopic(key) { openPath(key); setTopicKey(key); setExerciseIndex(0); }
  function selectExercise(key, i) { openPath(key); setTopicKey(key); setExerciseIndex(i); }
  function toggleModule(title) { setOpenModules((prev) => ({ ...prev, [title]: !prev[title] })); }
  function toggleTopic(key) { setOpenTopics((prev) => ({ ...prev, [key]: !prev[key] })); }
  function prev() { const p = flat[currentFlat - 1]; if (p) selectExercise(p.key, p.i); }
  function next() { const n = flat[currentFlat + 1]; if (n) selectExercise(n.key, n.i); }
  function resetCourse() {
    setAnswers({});
    setReview({});
    setUserWords([]);
    window.localStorage.removeItem(getProfileStorageKey(activeProfileId));
  }

  return (
    <div style={styles.app}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <h1>Polish Trainer A2 → B1</h1>
            <p>Курс-тренажёр: маршрут, цели уроков, повторение ошибок и проверка каждого ответа.</p>
            <div style={styles.profileBar}>
              <span style={styles.badge}>Профиль</span>
              <select value={activeProfileId} onChange={(e) => switchProfile(e.target.value)} style={{ ...styles.input, width: 220 }}>
                {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
              </select>
              <button style={styles.btn} onClick={createProfile}>Новый профиль</button>
              <button style={styles.btn} onClick={renameProfile}>Переименовать</button>
            </div>
            <ProgressBar value={courseStats.percent} />
            <div style={{ marginTop: 8 }}>
              <span style={styles.badge}>Курс: {courseStats.percent}%</span>
              <span style={styles.badge}>Проверено: {courseStats.checked}/{courseStats.total}</span>
              <span style={styles.badge}>Ошибок в повторении: {mistakes.length}</span>
              <span style={styles.badge}>Повторить сегодня: {memoryStats.due}</span>
            </div>
            <div style={styles.dashboardGrid}>
              <div style={styles.metric}><strong>{memoryStats.trained}</strong><br /><small>карточек в памяти</small></div>
              <div style={styles.metric}><strong>{memoryStats.learned}</strong><br /><small>закреплено</small></div>
              <div style={styles.metric}><strong>{memoryStats.weak}</strong><br /><small>слабые места</small></div>
            </div>
          </div>
          <div style={styles.stat}>
            <strong>Текущее упражнение</strong><br />
            Проверено: {progress.checked}/{progress.total}<br />
            Правильно: {progress.correct}/{progress.total}
            <ProgressBar value={progress.percent} />
          </div>
        </div>

        {dictionaryOpen && <DictionaryModal words={userWords} onClose={() => setDictionaryOpen(false)} onRemove={removeWord} />}
        {dictionaryDockOpen && (
          <div style={styles.floatingDictionaryPanel}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <strong>Мой словарь</strong>
                <div><small>{userWords.length} слов в активном профиле</small></div>
              </div>
              <button style={styles.btn} onClick={() => setDictionaryDockOpen(false)}>Свернуть</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
              <input value={newWordPl} onChange={(e) => setNewWordPl(e.target.value)} style={styles.input} placeholder="polskie słowo..." />
              <input value={newWordRu} onChange={(e) => setNewWordRu(e.target.value)} style={styles.input} placeholder="перевод..." />
              <button style={styles.primary} onClick={addManualWord}>Добавить</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button style={styles.primary} onClick={() => setDictionaryOpen(true)}>Открыть полностью</button>
              <span style={styles.badge}>{userWords.length} слов</span>
            </div>
            {userWords.length > 0 && (
              <div style={{ marginTop: 12, maxHeight: 220, overflow: "auto" }}>
                {userWords.slice(0, 12).map((word) => (
                  <div key={`${word.pl}-${word.addedAt}`} style={styles.dictionaryItem}>
                    <div><strong>{word.pl}</strong> · {word.ru}<br /><small>{word.source === "manual" ? "добавлено вручную" : word.source}</small></div>
                    <button style={styles.btn} onClick={() => removeWord(word.pl)}>Удалить</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button style={{ ...styles.primary, ...styles.floatingDictionaryButton }} onClick={() => setDictionaryDockOpen((value) => !value)}>
          {dictionaryDockOpen ? "Скрыть словарь" : `Словарь · ${userWords.length}`}
        </button>

        <div style={styles.layout}>
          <aside style={styles.card}>
            <h2>Маршрут курса</h2>
            {courseModules.map((module) => {
              const moduleTotal = module.keys.reduce((sum, key) => sum + courseStats.byTopic[key].total, 0);
              const moduleCorrect = module.keys.reduce((sum, key) => sum + courseStats.byTopic[key].correct, 0);
              const modulePercent = moduleTotal ? Math.round((moduleCorrect / moduleTotal) * 100) : 0;

              return (
                <div key={module.title} style={styles.moduleCard}>
                  <button style={styles.moduleBtn} onClick={() => toggleModule(module.title)}>
                    <span>{openModules[module.title] ? "▾" : "▸"} {module.title} · {modulePercent}%</span>
                    <span>{module.keys.length}</span>
                  </button>
                  {openModules[module.title] && <ProgressBar value={modulePercent} />}
                  {openModules[module.title] && (
                    <div style={{ marginTop: 10 }}>
                      {module.keys.map((key) => (
                      <div key={key} style={styles.topicPanel}>
                        <button onClick={() => {
                          if (key === safeTopicKey) toggleTopic(key);
                          else selectTopic(key);
                        }} style={{ ...styles.topicBtn, marginBottom: 0, ...(key === safeTopicKey ? styles.activeTopic : {}) }}>
                          <strong>{openTopics[key] ? "▾" : "▸"} {topics[key].title}</strong><br />
                          <small>{topics[key].description}</small><br />
                          <small>{courseStats.byTopic[key].percent}% освоено · {topics[key].exercises.length} упр.</small>
                        </button>
                        {openTopics[key] && (
                          <div style={styles.exerciseList}>
                            {topics[key].exercises.map((ex, i) => (
                              <button key={i} onClick={() => selectExercise(key, i)} style={{ ...styles.exBtn, width: "100%", marginLeft: 0, ...(key === safeTopicKey && i === safeExerciseIndex ? { border: "1px solid #1f4f6f", background: "#e8f1f5" } : {}) }}>
                                {i + 1}. {ex.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <button style={{ ...styles.btn, width: "100%", marginTop: 12 }} onClick={resetCourse}>Сбросить весь прогресс</button>
          </aside>

          <main>
            <section style={{ ...styles.card, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <h2>{topic.title}</h2>
                  <p>{topic.description}</p>
                </div>
                <button style={styles.collapseBtn} onClick={() => setRulesOpen((value) => !value)}>
                  {rulesOpen ? "Свернуть правила" : "Показать правила"}
                </button>
              </div>
              {rulesOpen && (
                <>
                  <div style={styles.goal}>
                    <strong>Цель урока</strong>
                    <div style={{ marginTop: 8 }}>
                      {(topicGoals[safeTopicKey] || []).map((goal) => <span key={goal} style={styles.skillBadge}>{goal}</span>)}
                    </div>
                  </div>
                  {renderRuleSheets(safeTopicKey)}
                  {!hasRuleSheets && topic.theory.map((r, i) => <div key={i} style={styles.rule}>{r}</div>)}
                  {hasRuleSheets && topic.theory.length > 0 && (
                    <div style={{ ...styles.note, marginTop: 12 }}>
                      <strong>Короткая памятка</strong>
                      <div style={{ marginTop: 8 }}>
                        {topic.theory.map((r, i) => <div key={i} style={{ marginBottom: i === topic.theory.length - 1 ? 0 : 8 }}>{r}</div>)}
                      </div>
                    </div>
                  )}
                  {renderTables(safeTopicKey)}
                </>
              )}
            </section>

            {mistakes.length > 0 && (
              <section style={{ ...styles.card, marginBottom: 18 }}>
                <h2>Повторить ошибки</h2>
                <p>Последние неправильные ответы остаются здесь, чтобы курс сам подсказывал, куда вернуться.</p>
                {mistakes.map((m) => (
                  <div key={m.id} style={styles.mistake}>
                    <strong>{topics[m.key].title} · {m.exerciseTitle}</strong>
                    <div>{m.item.q}</div>
                    <small>Твой ответ: {m.answer.value || "пусто"} · правильно: {m.item.correct || m.item.a?.[0] || "развернуть ответ"}</small>
                    <div style={{ marginTop: 8 }}>
                      <button style={styles.btn} onClick={() => selectExercise(m.key, m.exIndex)}>Открыть упражнение</button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {dueReviews.length > 0 && (
              <section style={{ ...styles.card, marginBottom: 18 }}>
                <h2>Умное повторение</h2>
                <p>Эти карточки пора повторить сейчас: ошибки возвращаются сразу, правильные ответы уходят на 1, 3, 7, 14 и 30 дней.</p>
                {dueReviews.map((entry) => (
                  <div key={entry.id} style={styles.review}>
                    <strong>{topics[entry.key].title} · {entry.exerciseTitle}</strong>
                    <div>{entry.item.q}</div>
                    <small>Серия: {entry.state.streak} · попыток: {entry.state.attempts} · правильно: {entry.state.corrects}</small>
                    <div style={{ marginTop: 8 }}>
                      <button style={styles.btn} onClick={() => selectExercise(entry.key, entry.exIndex)}>Повторить</button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <h2>{exercise.title}</h2>
                  <span style={styles.badge}>Проверено: {progress.checked}/{progress.total}</span>
                  <span style={styles.badge}>Правильно: {progress.correct}/{progress.total}</span>
                </div>
                <button style={styles.btn} onClick={() => {
                  const copy = { ...answers };
                  currentItems.forEach((_, i) => delete copy[`${safeTopicKey}-${safeExerciseIndex}-${i}`]);
                  setAnswers(copy);
                }}>Сбросить упражнение</button>
              </div>

              <hr />

              {currentItems.map((item, i) => {
                const id = buildItemId(safeTopicKey, safeExerciseIndex, i);
                return (
                  <div key={id} style={styles.item}>
                    <div style={{ fontWeight: "bold", marginBottom: 8 }}>{i + 1}. {item.q}</div>
                    <AnswerBlock item={item} state={answers[id]} setState={(v) => setAnswer(id, v)} addWord={addWord} />
                  </div>
                );
              })}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
                <button onClick={prev} disabled={currentFlat === 0} style={{ ...styles.btn, opacity: currentFlat === 0 ? 0.5 : 1 }}>← Предыдущее</button>
                <button onClick={next} disabled={currentFlat === flat.length - 1} style={{ ...styles.primary, opacity: currentFlat === flat.length - 1 ? 0.5 : 1 }}>Следующее →</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
