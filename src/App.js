import React, { useEffect, useMemo, useState } from "react";

// Polish Trainer A2 → B1
// Pure React, no external libraries. Paste into src/App.js

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

const STORAGE_KEY = "polish-trainer-course-v1";

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
  metric: { background: "#f8fafb", border: "1px solid #e0e6ea", borderRadius: 8, padding: 10 }
};

const input = (q, a, explanation = "") => ({ type: "input", q, a: Array.isArray(a) ? a : [a], explanation });
const choice = (q, options, correct, explanation = "") => ({ type: "choice", q, options, correct, explanation });
const free = (q, hint = "Ответ свободный. Напиши 4–8 предложений, потом можешь прислать мне на проверку.") => ({ type: "free", q, explanation: hint });
const note = (title, body, words = []) => ({ type: "note", title, body, words });
const audio = (title, body) => ({ type: "audio", title, body });
const makeExercise = (title, items) => ({ title, items });

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
  if (!items || items.length === 0) return [];
  const shuffled = shuffle(items);
  if (shuffled.length >= 50) return shuffled.slice(0, 50);
  const result = [];
  for (let i = 0; i < 50; i++) result.push(shuffled[i % shuffled.length]);
  return result;
}

function repeatTo50(items) {
  if (!items || items.length === 0) return [];
  if (items.length >= 50) return cap50(items);
  const result = [];
  for (let i = 0; i < 50; i++) {
    const item = items[i % items.length];
    if (item.type === "free" && i >= items.length) {
      result.push({ ...item, q: `${item.q} Wariant ${Math.floor(i / items.length) + 1}.` });
    } else {
      result.push(item);
    }
  }
  return result;
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
  verbsPresent: [{ title: "Czas teraźniejszy", headers: ["osoba", "pracować", "robić", "mówić", "mieć"], rows: [["ja", "pracuję", "robię", "mówię", "mam"], ["ty", "pracujesz", "robisz", "mówisz", "masz"], ["on/ona", "pracuje", "robi", "mówi", "ma"], ["my", "pracujemy", "robimy", "mówimy", "mamy"], ["wy", "pracujecie", "robicie", "mówicie", "macie"], ["oni/one", "pracują", "robią", "mówią", "mają"]] }],
  verbsPast: [{ title: "Czas przeszły", headers: ["osoba", "męski", "żeński / niemęskoos."], rows: [["ja", "robiłem", "robiłam"], ["ty", "robiłeś", "robiłaś"], ["on/ona", "robił", "robiła"], ["my", "robiliśmy", "robiłyśmy"], ["wy", "robiliście", "robiłyście"], ["oni/one", "robili", "robiły"]] }],
  verbsFuture: [{ title: "Czas przyszły", headers: ["typ", "przykład", "znaczenie"], rows: [["będę + infinitiv", "będę pracować", "proces"], ["będę + forma przeszła", "będę pracował", "proces"], ["dokonany", "zrobię", "rezultat"], ["dokonany", "kupię", "rezultat"], ["dokonany", "przeczytam", "rezultat"]] }],
  aspect: [{ title: "Aspekt", headers: ["sytuacja", "niedokonany", "dokonany"], rows: [["proces", "robić", "—"], ["rezultat", "—", "zrobić"], ["często / zawsze", "robię", "—"], ["już / do końca", "—", "zrobiłem / zrobię"], ["długo", "czytałem", "—"], ["całą książkę", "—", "przeczytałem"]] }],
  prepositions: [{ title: "Przyimki + przypadki", headers: ["przyimek", "przypadek", "przykład"], rows: [["do", "dopełniacz", "do sklepu"], ["z = od/skąd", "dopełniacz", "z pracy"], ["z = razem", "narzędnik", "z rodziną"], ["w = gdzie", "miejscownik", "w Polsce"], ["na = gdzie", "miejscownik", "na kursie"], ["na = dokąd", "biernik", "na kurs"], ["o", "miejscownik", "o pracy"]] }],
  numbersTime: [
    { title: "Liczby 1–4 i 5+", headers: ["liczba", "forma", "przykład"], rows: [["1", "mianownik pojedynczy", "jeden złoty, jeden grosz"], ["2, 3, 4", "mianownik liczby mnogiej", "dwa złote, trzy grosze"], ["5–21", "dopełniacz liczby mnogiej", "pięć złotych, pięć groszy"], ["22, 23, 24", "jak 2–4", "dwadzieścia dwa złote"], ["25–31", "jak 5+", "dwadzieścia pięć złotych"], ["pieniądze", "2/3/4 pieniądze, 5 pieniędzy", "mam dwa pieniądze / dużo pieniędzy"]] },
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

function genMascPlural() { return cap50(dict.mascPlural.map(([sg, pl, note]) => input(`${sg} →`, pl, note))); }
function genNonMascPlural() { return cap50(dict.nonMascPlural.map(([sg, pl]) => input(`${sg} →`, pl))); }
function genPluralAdjectives() { const items = []; dict.adjectives.forEach(([base, mascPl, nonMascPl]) => { dict.mascPlural.slice(0, 15).forEach(([sg, pl]) => items.push(input(`${base} ${sg} →`, `${mascPl} ${pl}`))); dict.nonMascPlural.slice(0, 15).forEach(([sg, pl]) => items.push(input(`${base} ${sg} →`, `${nonMascPl} ${pl}`))); }); return cap50(items); }
function genOniOne() { const items = []; dict.mascPlural.forEach(([, pl]) => items.push(choice(`___ to ${pl}`, ["oni", "one"], "oni"))); dict.nonMascPlural.forEach(([, pl]) => items.push(choice(`___ to ${pl}`, ["oni", "one"], "one"))); return cap50(items); }
function genPluralMistakes() { return cap50([input("To są dobre studenci", "to są dobrzy studenci"), input("To są polskie lekarze", "to są polscy lekarze"), input("To są wysokie mężczyźni", "to są wysocy mężczyźni"), input("To są nowe klienci", "to są nowi klienci"), input("To są młode chłopaki", "to są młodzi chłopaki"), input("To są duże pracownicy", "to są duzi pracownicy"), input("To są miłe nauczyciele", "to są mili nauczyciele"), input("To są stare sąsiedzi", "to są starzy sąsiedzi"), input("To są znane aktorzy", "to są znani aktorzy"), input("To są dobre profesorowie", "to są dobrzy profesorowie"), input("To są polscy kobiety", "to są polskie kobiety"), input("To są dobrzy książki", "to są dobre książki"), input("To są nowi samochody", "to są nowe samochody"), input("To są wysocy domy", "to są wysokie domy"), input("To są młodzi dzieci", "to są młode dzieci")]); }
function genAccusativeForms() { const items = []; dict.biernik.animate.forEach(([sg, acc]) => items.push(input(`widzę (${sg})`, acc, "męski żywotny"))); dict.biernik.inanimate.forEach(([sg, acc]) => items.push(input(`mam (${sg})`, acc, "męski nieżywotny"))); dict.biernik.feminine.forEach(([sg, acc]) => items.push(input(`kupuję (${sg})`, acc, "żeński"))); dict.biernik.mascPlural.forEach(([nom, acc]) => items.push(input(`znam (${nom})`, acc, "męskoosobowy plural"))); return cap50(items); }
function genAccusativeAdjectives() { const items = []; dict.adjectives.forEach(([base, , , mascAcc, femAcc]) => { dict.biernik.animate.slice(0, 8).forEach(([sg, acc]) => items.push(input(`widzę (${base} ${sg})`, `${mascAcc} ${acc}`))); dict.biernik.feminine.slice(0, 8).forEach(([sg, acc]) => items.push(input(`kupuję (${base} ${sg})`, `${femAcc} ${acc}`))); dict.biernik.inanimate.slice(0, 8).forEach(([sg, acc]) => items.push(input(`mam (${base} ${sg})`, `${base} ${acc}`))); }); return cap50(items); }
function genGenitive() { const verbs = ["nie mam", "nie ma", "szukam", "potrzebuję", "używam"]; const items = []; dict.genitive.forEach(([sg, gen]) => verbs.forEach((v) => items.push(input(`${v} (${sg})`, gen)))); return cap50(items); }
function genDative() { const verbs = ["daję", "pomagam", "mówię", "pokazuję drogę"]; const items = []; dict.dative.forEach(([sg, dat]) => verbs.forEach((v) => items.push(input(`${v} (${sg})`, dat)))); return cap50(items); }
function genInstrumental() { const items = []; dict.instrumental.forEach(([sg, ins]) => { items.push(input(`z (${sg})`, ins)); items.push(input(`jestem (${sg})`, ins)); items.push(input(`rozmawiam z (${sg})`, ins)); }); return cap50(items); }
function genLocative() { const preps = ["w", "na", "o"]; const items = []; dict.locative.forEach(([sg, loc]) => preps.forEach((p) => items.push(input(`${p} (${sg})`, loc)))); return cap50(items); }
function genPresent() { const persons = ["ja", "ty", "on", "my", "wy", "oni"]; const items = []; dict.present.forEach(([verb, forms]) => forms.forEach((form, i) => items.push(input(`${persons[i]} (${verb})`, form)))); return cap50(items); }
function genPast() { const base = [["ja-mężczyzna (robić)", "robiłem"], ["ja-kobieta (robić)", "robiłam"], ["ty-mężczyzna (robić)", "robiłeś"], ["ty-kobieta (robić)", "robiłaś"], ["on (robić)", "robił"], ["ona (robić)", "robiła"], ["my-mężczyźni (robić)", "robiliśmy"], ["my-kobiety (robić)", "robiłyśmy"], ["wy-mężczyźni (robić)", "robiliście"], ["wy-kobiety (robić)", "robiłyście"], ["oni (robić)", "robili"], ["one (robić)", "robiły"], ["ja-mężczyzna (być)", "byłem"], ["ja-kobieta (być)", "byłam"], ["ja-mężczyzna (pójść)", "poszedłem"], ["ja-kobieta (pójść)", "poszłam"], ["ja-mężczyzna (wrócić)", "wróciłem"], ["ja-kobieta (wrócić)", "wróciłam"]]; return cap50(base.map(([q, a]) => input(q, a))); }
function genFuture() { return cap50([input("ja (pracować) jutro", "będę pracować"), input("ty (pracować) jutro", "będziesz pracować"), input("on (pracować) jutro", "będzie pracować"), input("my (pracować) jutro", "będziemy pracować"), input("wy (pracować) jutro", "będziecie pracować"), input("oni (pracować) jutro", "będą pracować"), input("ja (zrobić) zadanie", "zrobię zadanie"), input("ty (kupić) chleb", "kupisz chleb"), input("on (napisać) mail", "napisze mail"), input("my (przeczytać) książkę", "przeczytamy książkę"), input("wy (pójść) do sklepu", "pójdziecie do sklepu"), input("oni (wrócić) do domu", "wrócą do domu"), input("ja (nauczyć się) tego", "nauczę się tego"), input("ona (ugotować) obiad", "ugotuje obiad"), input("my (spotkać) kolegę", "spotkamy kolegę"), input("oni (zobaczyć) film", "zobaczą film"), input("Jutro o 8:00 (ja pracować)", "będę pracować"), input("W przyszłym tygodniu (my pojechać) do Krakowa", "pojedziemy do Krakowa"), input("Za godzinę (ja zadzwonić)", "zadzwonię"), input("Pojutrze (oni wrócić)", "wrócą"), input("Wieczorem (ja czytać)", "będę czytać"), input("Rano (ona zrobić) śniadanie", "zrobi śniadanie")]); }
function genAspectChoice() { return cap50([choice("Codziennie ___ zadanie", ["robię", "zrobię"], "robię", "codziennie = powtarzalność"), choice("Jutro ___ zadanie do końca", ["będę robić", "zrobię"], "zrobię", "do końca = rezultat"), choice("Wczoraj długo ___ książkę", ["czytałem", "przeczytałem"], "czytałem", "długo = proces"), choice("Wczoraj ___ całą książkę", ["czytałem", "przeczytałem"], "przeczytałem", "całą = rezultat"), choice("Często ___ kawę w domu", ["robię", "zrobię"], "robię"), choice("Za chwilę ___ kawę", ["zrobię", "robię"], "zrobię"), choice("Uczę się, żeby ___ polskiego", ["uczyć się", "nauczyć się"], "nauczyć się"), choice("Teraz ___ polskiego", ["uczę się", "nauczę się"], "uczę się"), choice("Muszę ___ maila", ["napisać", "pisać"], "napisać"), choice("Lubię ___ maile rano", ["pisać", "napisać"], "pisać")]); }
function genAspectPairs() { return cap50(dict.perfectivePairs.map(([imp, perf]) => input(`${imp} →`, perf))); }
function genPrepositions() { return cap50([input("idę ___ sklepu", "do", "do + dopełniacz"), input("jestem ___ pracy", "w", "w + miejscownik"), input("idę ___ spacer", "na", "na + biernik"), input("jestem ___ spacerze", "na", "na + miejscownik"), input("wracam ___ pracy", "z", "z + dopełniacz"), input("jadę ___ Polski", "do", "do + dopełniacz"), input("mieszkam ___ Polsce", "w", "w + miejscownik"), input("spotykam się ___ kolegą", "z", "z + narzędnik"), input("czekam ___ autobus", "na", "na + biernik"), input("rozmawiam ___ rodziną", "z", "z + narzędnik"), input("myślę ___ pracy", "o", "o + miejscownik"), input("to jest prezent ___ dziecka", "dla", "dla + dopełniacz"), input("idę ___ lekarza", "do"), input("jestem ___ kursie", "na"), input("rozmawiam ___ problemie", "o")]); }
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
function genComplexSentences() { return cap50([input("Myślę, ___ to dobry pomysł", "że"), input("Wiem, ___ muszę się uczyć", "że"), input("___ wracam z pracy, jestem zmęczony", "kiedy"), input("___ mam czas, uczę się polskiego", "jeśli"), input("Uczę się, ___ chcę mieszkać w Polsce", "bo"), input("Nie mam czasu, ___ pracuję", "bo"), input("Pracuję dużo, ___ jestem zmęczony", "dlatego"), input("Uczę się polskiego dlatego, ___ lepiej mówić", "żeby"), input("Zostanę w domu, ___ będzie padać", "jeśli"), input("Powiedziałem, ___ wrócę później", "że"), input("Idę na kurs, ___ mówić lepiej", "żeby"), input("Jestem zmęczony, ___ pracowałem długo", "bo"), input("Mam kurs, ___ nie mogę przyjść", "dlatego"), input("___ będę mieć czas, zadzwonię", "jeśli"), input("Nie wiem, ___ to zrobić", "jak")]); }
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
    ...forms.flatMap(([inf, ty, wy]) => [input(`ty: (${inf})`, ty), input(`wy: (${inf})`, wy)]),
    input("proszę (wypełnić) formularz", "wypełnić"),
    input("ty: (napisać) wiadomość", "napisz"),
    input("ty: (poczekać) chwilę", "poczekaj"),
    input("wy: (zrobić) zadanie", "zróbcie"),
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
    ["Daję (ja) książkę", "mi"], ["Pomagam (ty)", "ci"], ["Mówię (on) prawdę", "mu"], ["Pokazuję (ona) drogę", "jej"],
    ["Daję (my) informację", "nam"], ["Pomagam (wy)", "wam"], ["Mówię (oni) prawdę", "im"],
    ["Widzę (ona)", "ją"], ["Znam (on)", "go"], ["Czekam na (my)", "nas"], ["Zapraszam (wy)", "was"], ["Rozumiem (oni)", "ich"]
  ];
  return cap50([
    ...pronounForms.map(([q, a]) => input(q, a)),
    input("Daję (ja) książkę", "mi"),
    input("Pomagam (ty)", "ci"),
    input("Widzę (ona)", "ją"),
    input("Nie znam (on)", "go"),
    input("Mówię (oni) prawdę", "im"),
    input("Czekasz na (my)", "nas"),
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
    input("Nie mam (czas)", "czasu"),
    input("Muszę złożyć (wniosek)", "wniosek"),
    input("Rozmawiam z (kierownik)", "kierownikiem"),
    input("Mieszkam w (centrum)", "centrum"),
    input("Potrzebuję (recepta)", "recepty"),
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
    input("Widzę (dobry lekarz)", "dobrego lekarza", "biernik"),
    input("Nie mam (czas)", "czasu", "dopełniacz"),
    input("Pomagam (mój kolega)", "mojemu koledze", "celownik"),
    input("Rozmawiam z (nauczyciel)", "nauczycielem", "narzędnik"),
    input("Mieszkam w (Polska)", "Polsce", "miejscownik"),
    input("ja (pracować)", "pracuję", "czas teraźniejszy"),
    input("ja-kobieta (być)", "byłam", "czas przeszły"),
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
      makeExercise("Ситуация", genTopicSpeaking(key))
    ]
  };
}

const topics = {
  diagnosticB1: { title: "Диагностика B1", description: "Карта сильных и слабых мест", theory: ["Начни здесь, если хочешь понять текущий уровень.", "20 вопросов смешивают падежи, времена, аспект, лексику и экзаменационные реакции.", "После прохождения смотри проценты по темам и тренируй слабые блоки."], exercises: [makeExercise("Диагностика: 20 вопросов", genDiagnostic())] },
  mixed20: { title: "Смешанный тест 20", description: "Активное вспоминание из всего курса", theory: ["Это режим для памяти: вопросы идут вперемешку, как в реальной речи.", "Запускай после 2–3 тем или в конце дня.", "Цель — 80% правильных без подсказок."], exercises: [makeExercise("Mixed practice 20", genMixed20())] },
  pluralNominative: { title: "Mianownik liczby mnogiej", description: "Множественное число: oni / one", theory: ["Mianownik liczby mnogiej — форма множественного числа: kto? co?", "Главное деление: męskoosobowy = oni; niemęskoosobowy = one.", "Męskoosobowy: мужчины и смешанные группы: studenci, lekarze, koledzy.", "Niemęskoosobowy: женщины, дети, животные, предметы: kobiety, dzieci, psy, książki.", "Прилагательные согласуются: dobrzy studenci, но dobre książki."], exercises: [makeExercise("Męskoosobowy — rzeczowniki", genMascPlural()), makeExercise("Niemęskoosobowy — rzeczowniki", genNonMascPlural()), makeExercise("Przymiotnik + rzeczownik", genPluralAdjectives()), makeExercise("Oni czy one?", genOniOne()), makeExercise("Исправь ошибку", genPluralMistakes()), makeExercise("Разговор", speakingPrompts)] },
  accusative: { title: "Biernik — kogo? co?", description: "Винительный падеж", theory: ["Biernik отвечает на kogo? co?", "После: widzę, mam, kupuję, znam, spotykam, lubię.", "Мужской одушевлённый: lekarz → lekarza.", "Мужской неодушевлённый: telefon → telefon.", "Женский: kawa → kawę."], exercises: [makeExercise("Формы biernik", genAccusativeForms()), makeExercise("Прилагательные в biernik", genAccusativeAdjectives()), makeExercise("Типичные ошибки", cap50([input("Widzę dobry lekarz", "widzę dobrego lekarza"), input("Mam nowego samochodu", "mam nowy samochód"), input("Kupuję czarna kawa", "kupuję czarną kawę"), input("Znam polscy studentów", "znam polskich studentów"), input("Spotykam nowy kolegę", "spotykam nowego kolegę")])), makeExercise("Разговор", speakingPrompts)] },
  genitive: { title: "Dopełniacz — kogo? czego?", description: "Родительный падеж", theory: ["Dopełniacz отвечает на kogo? czego?", "После: nie ma, nie mam, dużo, mało, trochę, szukam, potrzebuję, używam.", "Mam czas → Nie mam czasu.", "kawa → kawy, praca → pracy."], exercises: [makeExercise("Dopełniacz — формы", genGenitive()), makeExercise("Исправь ошибку", cap50([input("Nie mam czas", "nie mam czasu"), input("Nie ma kawa", "nie ma kawy"), input("Szukam pracę", "szukam pracy"), input("Potrzebuję pomoc", "potrzebuję pomocy"), input("Dużo ludzie", "dużo ludzi"), input("Używam telefon", "używam telefonu"), input("Mało pieniądze", "mało pieniędzy"), input("Trochę wodę", "trochę wody")])), makeExercise("Разговор", speakingPrompts)] },
  dative: { title: "Celownik — komu? czemu?", description: "Дательный падеж", theory: ["Celownik отвечает на komu? czemu?", "После: daję, pomagam, mówię komuś, pokazuję komuś.", "Местоимения: mi, ci, mu, jej, nam, wam, im.", "studentowi, koledze, kobiecie, dziecku."], exercises: [makeExercise("Celownik — формы", genDative()), makeExercise("Исправь ошибку", cap50([input("Praca daje mnie satysfakcję", "praca daje mi satysfakcję"), input("Pomagam mój kolega", "pomagam mojemu koledze"), input("Daję książkę brat", "daję książkę bratu"), input("Pokazuję droga student", "pokazuję drogę studentowi"), input("Pomagam ona", "pomagam jej"), input("Daję jemu prezent", "daję mu prezent"), input("Mówię do ci", "mówię ci"), input("Pomagam ludzie", "pomagam ludziom")])), makeExercise("Разговор", speakingPrompts)] },
  instrumental: { title: "Narzędnik — z kim? z czym?", description: "Творительный падеж", theory: ["Narzędnik отвечает на z kim? z czym?", "После z: z kolegą, z rodziną.", "После być при профессии: jestem programistą.", "studentem, kobietą, dzieckiem, ludźmi."], exercises: [makeExercise("Narzędnik — формы", genInstrumental()), makeExercise("Исправь ошибку", cap50([input("Jestem programista", "jestem programistą"), input("Idę z kolega", "idę z kolegą"), input("Bawię się z córka", "bawię się z córką"), input("Rozmawiam z nauczyciel", "rozmawiam z nauczycielem"), input("Jadę samochód", "jadę samochodem"), input("On jest lekarz", "on jest lekarzem"), input("Spotykam się z rodzina", "spotykam się z rodziną"), input("Pracuję z ludzie", "pracuję z ludźmi")])), makeExercise("Разговор", speakingPrompts)] },
  locative: { title: "Miejscownik — o kim? o czym?", description: "Местный / предложный падеж", theory: ["Miejscownik отвечает на o kim? o czym?", "С предлогами: w, na, o, przy, po.", "w Polsce, w domu, w sklepie, na kursie.", "mówię o pracy, myślę o rodzinie."], exercises: [makeExercise("Miejscownik — формы", genLocative()), makeExercise("Исправь ошибку", cap50([input("Mieszkam w Polska", "mieszkam w Polsce"), input("Jestem w praca", "jestem w pracy"), input("Mówię o rodzina", "mówię o rodzinie"), input("Byłem w sklep", "byłem w sklepie"), input("Myślę o kurs", "myślę o kursie"), input("Czytam o język polski", "czytam o języku polskim"), input("Jestem na spotkanie", "jestem na spotkaniu"), input("Spaceruję po park", "spaceruję po parku")])), makeExercise("Разговор", speakingPrompts)] },
  verbsPresent: { title: "Czas teraźniejszy", description: "Настоящее время", theory: ["Настоящее время зависит от типа спряжения.", "-ować: pracuję, pracujesz, pracuje...", "-ić/-yć: robię, robisz, robi...", "Нерегулярные: być, mieć, pić."], exercises: [makeExercise("Спряжение", genPresent()), makeExercise("Исправь ошибку", cap50([input("ja pracuje", "ja pracuję"), input("ty piję kawę", "ty pijesz kawę"), input("oni mówi po polsku", "oni mówią po polsku"), input("my mieszka w Polsce", "my mieszkamy w Polsce"), input("wy robią zadanie", "wy robicie zadanie"), input("on pijesz kawę", "on pije kawę"), input("ja masz czas", "ja mam czas")])), makeExercise("Разговор", speakingPrompts)] },
  verbsPast: { title: "Czas przeszły", description: "Прошедшее время", theory: ["Прошедшее время зависит от рода: robiłem / robiłam.", "On robił, ona robiła, oni robili, one robiły.", "pójść: poszedłem / poszłam."], exercises: [makeExercise("Czas przeszły — формы", genPast()), makeExercise("Разговор", speakingPrompts)] },
  verbsFuture: { title: "Czas przyszły", description: "Будущее время", theory: ["Несовершенный вид: będę robić / będę robił.", "Совершенный вид: zrobię, kupię, pójdę.", "Процесс: będę pracować. Результат: zrobię zadanie.", "С будущим временем часто используются: jutro, pojutrze, za godzinę, za tydzień, w przyszłym tygodniu, rano, wieczorem.", "Время на часах обычно: o ósmej, o dziewiątej, o osiemnastej."], exercises: [makeExercise("Czas przyszły — формы", genFuture()), makeExercise("Будущее + время", genFutureWithTime()), makeExercise("Разговор", speakingPrompts)] },
  aspect: { title: "Aspekt — robić vs zrobić", description: "Несовершенный и совершенный вид", theory: ["Несовершенный вид: процесс, повторяемость, длительность.", "Совершенный вид: результат, завершение.", "zawsze/często/długo → robić. już/do końca/w końcu → zrobić."], exercises: [makeExercise("Выбери аспект", genAspectChoice()), makeExercise("Пары aspektowe", genAspectPairs()), makeExercise("Разговор", speakingPrompts)] },
  prepositions: { title: "Przyimki + przypadki", description: "Предлоги и падежи", theory: ["Предлог часто требует конкретный падеж.", "do + dopełniacz: do sklepu.", "w + miejscownik: w Polsce.", "na + biernik: na kurs; na + miejscownik: na kursie.", "z rodziną = narzędnik; z pracy = dopełniacz."], exercises: [makeExercise("Przyimki", genPrepositions()), makeExercise("Разговор", speakingPrompts)] },
  numbersTime: { title: "Liczby i czas", description: "Числа, часы, деньги и выражения времени", theory: ["Числа нужны для времени, дат, цен, адресов и количества.", "После 1 обычно форма единственного числа: jeden złoty, jeden grosz.", "После 2, 3, 4 — форма множественного: dwa złote, trzy grosze, cztery pieniądze.", "После 5+ обычно dopełniacz liczby mnogiej: pięć złotych, pięć groszy, pięć pieniędzy.", "Важно: 22/23/24 → złote/grosze/pieniądze, но 12/13/14 → złotych/groszy/pieniędzy.", "Время: która godzina? ósma; o której? o ósmej. Для будущих планов: Jutro o ósmej będę pracować."], exercises: [makeExercise("Liczby 0–100", genNumbers()), makeExercise("Pieniądze: złoty / złote / złotych", genMoney()), makeExercise("Правила 1–4 / 5+", genNumberRules()), makeExercise("Która godzina?", genClock()), makeExercise("Wyrażenia czasu", genTimePhrases()), makeExercise("Czas + przyszłość", genFutureWithTime()), makeExercise("Разговор", speakingPrompts)] },
  complexSentences: { title: "Zdania złożone", description: "Сложные предложения", theory: ["że = что", "kiedy/gdy = когда", "jeśli/jeżeli = если", "bo = потому что; dlatego = поэтому; żeby = чтобы."], exercises: [makeExercise("Spójniki", genComplexSentences()), makeExercise("Разговор", speakingPrompts)] },
  politeConditional: { title: "Tryb warunkowy", description: "Вежливые просьбы и условное", theory: ["Tryb warunkowy нужен для вежливого B1-письма и просьб.", "Главные формы: chciałbym/chciałabym, mógłbym/mogłabym, mogliby Państwo.", "В условии: gdybym miał czas, zadzwoniłbym."], exercises: [makeExercise("Вежливые формы", genPoliteConditional()), makeExercise("Разговор", speakingPrompts)] },
  imperatives: { title: "Tryb rozkazujący", description: "Инструкции и просьбы", theory: ["Повелительное нужно для инструкций, просьб и запретов.", "Для pan/pani часто используем: proszę + bezokolicznik.", "Для запрета: nie zapomnij, nie rób, proszę nie palić."], exercises: [makeExercise("Rozkazujący", genImperatives()), makeExercise("Разговор", speakingPrompts)] },
  pronouns: { title: "Zaimki w przypadkach", description: "Местоимения: mi, mnie, go, mu", theory: ["На B1 важно не путать короткие формы местоимений.", "Celownik: mi, ci, mu, jej, nam, wam, im.", "Biernik/dopełniacz: mnie, cię/ciebie, go/jego, ją, nas, was, ich."], exercises: [makeExercise("Местоимения", genPronouns()), makeExercise("Разговор", speakingPrompts)] },
  reflexiveSie: { title: "Czasowniki z się", description: "uczę się, podoba mi się", theory: ["się часто стоит после глагола: uczę się, spotykam się.", "podobać się требует celownik: podoba mi się.", "Некоторые глаголы с się меняют смысл: bawić się, bać się, czuć się."], exercises: [makeExercise("się в речи", genReflexiveSie()), makeExercise("Разговор", speakingPrompts)] },
  comparisons: { title: "Stopniowanie", description: "Сравнения: lepszy, droższy, niż", theory: ["Сравнение нужно для мнения и аргументации.", "Часто: -szy/-ejszy, naj-, niż.", "Нерегулярные: dobry → lepszy → najlepszy, zły → gorszy → najgorszy."], exercises: [makeExercise("Сравнения", genComparisons()), makeExercise("Разговор", speakingPrompts)] },
  modalVerbs: { title: "Czasowniki modalne", description: "muszę, mogę, powinienem", theory: ["Модальные конструкции делают речь практичной.", "muszę = должен, mogę = могу, powinienem/powinnam = следует.", "wolno/nie wolno часто используются в правилах."], exercises: [makeExercise("Modalne", genModalVerbs()), makeExercise("Разговор", speakingPrompts)] },
  impersonal: { title: "Formy bezosobowe", description: "można, trzeba, należy, warto", theory: ["Безличные формы очень частые в объявлениях, правилах и инструкциях.", "można = можно, trzeba = нужно, należy = следует, warto = стоит.", "После них часто идёт bezokolicznik: trzeba podpisać."], exercises: [makeExercise("Безличные формы", genImpersonal()), makeExercise("Разговор", speakingPrompts)] },
  wordOrder: { title: "Szyk zdania", description: "Порядок слов B1", theory: ["Польский порядок слов гибкий, но нейтральная фраза должна звучать естественно.", "Не ставь местоимения и się хаотично: podoba mi się, uczę się.", "Вопросы часто начинаются с kiedy/gdzie/czy."], exercises: [makeExercise("Порядок слов", genWordOrder()), makeExercise("Разговор", speakingPrompts)] },
  b1Connectors: { title: "Łączniki B1+", description: "jednak, natomiast, oprócz tego", theory: ["Связки превращают короткие фразы в B1-речь.", "jednak/natomiast помогают противопоставлять.", "oprócz tego, z tego powodu, podsumowując помогают строить письмо и мнение."], exercises: [makeExercise("Связки B1", genB1Connectors()), makeExercise("Выбери связку", genConnectorChoiceAdvanced()), makeExercise("Собери фразу", genSentenceAssemblyB1()), makeExercise("Короткий ответ 2–4 zdania", genShortWritingB1()), makeExercise("Разговор", speakingPrompts)] },
  workLexicon: { title: "Praca i firma", description: "Работа, компания, собеседование", theory: ["Эта тема нужна для разговоров о работе, обязанностях, сроках и отпуске.", "Сильная B1-речь: не только znam słowo, а умею объяснить ситуацию: mam termin, szukam pracy, chcę wziąć urlop.", "Тренируй слова сразу с падежами: szukam pracy, rozmawiam z kierownikiem, mam spotkanie."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("work")), makeExercise("PL → RU", genThematicReverseChoices("work")), makeExercise("RU → PL: выбери", genThematicChoices("work")), makeExercise("RU → PL: напиши", genThematicWords("work")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("work")), makeExercise("Gotowe frazy", genThematicPhrases("work")), makeExercise("Ситуация", genTopicSpeaking("work"))] },
  housingLexicon: { title: "Mieszkanie", description: "Жильё, аренда, бытовые проблемы", theory: ["Тема закрывает аренду квартиры, счета, ремонт и контакт с владельцем.", "Важно уметь говорить проблему спокойно и конкретно: mamy awarię, nie działa ogrzewanie, kiedy można obejrzeć mieszkanie?", "Полезные связки: w mieszkaniu, z właścicielem, do innej dzielnicy."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("housing")), makeExercise("PL → RU", genThematicReverseChoices("housing")), makeExercise("RU → PL: выбери", genThematicChoices("housing")), makeExercise("RU → PL: напиши", genThematicWords("housing")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("housing")), makeExercise("Gotowe frazy", genThematicPhrases("housing")), makeExercise("Ситуация", genTopicSpeaking("housing"))] },
  healthLexicon: { title: "Zdrowie i lekarz", description: "Врач, аптека, симптомы", theory: ["B1 требует уметь объяснить симптомы, записаться к врачу и понять базовые инструкции.", "Главные конструкции: boli mnie..., mam gorączkę, potrzebuję recepty, chcę umówić wizytę.", "Эта тема хорошо тренирует biernik и dopełniacz: mam receptę, potrzebuję skierowania."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("health")), makeExercise("PL → RU", genThematicReverseChoices("health")), makeExercise("RU → PL: выбери", genThematicChoices("health")), makeExercise("RU → PL: напиши", genThematicWords("health")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("health")), makeExercise("Gotowe frazy", genThematicPhrases("health")), makeExercise("Ситуация", genTopicSpeaking("health"))] },
  documentsLexicon: { title: "Urząd i dokumenty", description: "Документы, заявления, учреждение", theory: ["Это практическая тема для жизни в Польше: urząd, wniosek, formularz, opłata, odbiór dokumentu.", "Цель — уметь спросить, что заполнить, где подписать и когда забрать документ.", "Типичные фразы: złożyć wniosek, podpisać formularz, odebrać dokument."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("documents")), makeExercise("PL → RU", genThematicReverseChoices("documents")), makeExercise("RU → PL: выбери", genThematicChoices("documents")), makeExercise("RU → PL: напиши", genThematicWords("documents")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("documents")), makeExercise("Gotowe frazy", genThematicPhrases("documents")), makeExercise("Ситуация", genTopicSpeaking("documents"))] },
  shoppingLexicon: { title: "Zakupy i usługi", description: "Покупки, услуги, возврат", theory: ["Тема помогает решать бытовые ситуации: покупка, доставка, возврат, гарантия.", "Для B1 важно уметь не только купить, но и объяснить проблему: chcę zwrócić towar, mam paragon, potrzebuję innego rozmiaru.", "Здесь хорошо повторяются biernik и narzędnik: mam paragon, płacę kartą."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("shopping")), makeExercise("PL → RU", genThematicReverseChoices("shopping")), makeExercise("RU → PL: выбери", genThematicChoices("shopping")), makeExercise("RU → PL: напиши", genThematicWords("shopping")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("shopping")), makeExercise("Gotowe frazy", genThematicPhrases("shopping")), makeExercise("Ситуация", genTopicSpeaking("shopping"))] },
  cityLexicon: { title: "Miasto i transport", description: "Город, транспорт, как добраться", theory: ["Тема нужна для дороги, опозданий, пересадок и объяснения маршрута.", "Главные действия: dojechać, przesiąść się, kupić bilet, sprawdzić rozkład jazdy.", "Тренируй направления: do centrum, na przystanku, z przesiadką."], exercises: [makeExercise("Сначала прочитай", genThematicIntro("city")), makeExercise("PL → RU", genThematicReverseChoices("city")), makeExercise("RU → PL: выбери", genThematicChoices("city")), makeExercise("RU → PL: напиши", genThematicWords("city")), makeExercise("RU → PL: без подсказки+", genThematicActiveRecall("city")), makeExercise("Gotowe frazy", genThematicPhrases("city")), makeExercise("Ситуация", genTopicSpeaking("city"))] },
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
  writingTemplates: { title: "Pisanie: шаблоны B1", description: "Готовые структуры письма", theory: ["B1-письмо легче, когда есть готовый скелет.", "Сначала прочитай шаблон, потом напиши свой текст по ситуации.", "Цель — не красивый стиль, а ясная структура: кто пишет, зачем, детали, просьба, завершение."], exercises: [makeExercise("Шаблоны", genWritingTemplates()), makeExercise("Собери формулу письма", genWritingAssembly()), makeExercise("Практика по шаблонам", genWritingTemplatePractice()), makeExercise("Короткие ответы 2–4 zdania", genShortWritingB1())] },
  examB1Reading: { title: "Egzamin B1: Czytanie", description: "Экзаменационное чтение", theory: ["Тренировка чтения B1: короткий текст, ключевая информация, выбор ответа.", "На экзамене не нужно переводить каждое слово. Ищи: kto? gdzie? kiedy? co trzeba zrobić?", "В длинных текстах сначала пойми общий смысл, потом ищи конкретную деталь и ключевое слово."], exercises: [makeExercise("Szybkie pytania egzaminacyjne", genExamReading()), makeExercise("Dłuższe teksty B1", genLongReading())] },
  examB1Listening: { title: "Egzamin B1: Słuchanie", description: "Аудирование с озвучкой", theory: ["Сначала слушай запись без текста: цель — понять ситуацию, время, место, просьбу или проблему.", "После ответа открой скрипт и проверь, какие слова ты не услышал. Медленный режим нужен для повторного прохода.", "Диктанты тренируют точность: они заставляют слышать польские звуки и писать слова без подсказки."], exercises: [makeExercise("Audio: słuchaj i odpowiedz", genAudioListening()), makeExercise("Słuchanie z tekstem", genExamListening())] },
  examB1Writing: { title: "Egzamin B1: Pisanie", description: "Письмо: email, жалоба, заявление", theory: ["Письмо B1 требует структуры: приветствие, цель, детали, просьба, завершение.", "Цель — писать 80–120 слов простыми, правильными фразами.", "Проверяй себя по чеклисту: czy jest cel? czy są szczegóły? czy ton jest grzeczny?"], exercises: [makeExercise("Pisanie B1", genExamWriting()), makeExercise("Krótka odpowiedź 2–4 zdania", genShortWritingB1()), makeExercise("Собери полезную фразу", genWritingAssembly())] },
  examB1Speaking: { title: "Egzamin B1: Mówienie", description: "Говорение: карточки и ситуации", theory: ["Говорение B1 — это не идеальная грамматика, а понятная речь с примерами и связками.", "Тренируй схему: opisuję sytuację → dodaję szczegóły → mówię opinię → kończę wnioskiem.", "Хорошие связки: moim zdaniem, wydaje mi się, ponieważ, dlatego, na przykład."], exercises: [makeExercise("Mówienie B1", genExamSpeaking())] },
  examB1Mock: { title: "Egzamin B1: Mini test", description: "Смешанный пробный тест", theory: ["Мини-тест смешивает грамматику, лексику и экзаменационные реакции.", "Используй его как контроль после прохождения модулей.", "Если тема даёт много ошибок, возвращайся в соответствующий блок курса."], exercises: [makeExercise("Mini test B1", genExamMixed()), makeExercise("Wypowiedź kontrolna", repeatTo50([free("Napisz autoprezentację B1: kim jesteś, czym się zajmujesz, dlaczego uczysz się polskiego i jakie masz plany. 100–140 słów.", "Checklist: teraźniejszość, przeszłość, przyszłość, минимум 5 связок.")]))] },
  b1Mistakes: { title: "Najczęstsze błędy B1", description: "Самые частые ошибки B1", theory: ["Здесь собраны ошибки по падежам, się, порядку слов, аспекту, предлогам и временам.", "Цель — видеть ошибку автоматически.", "Если ошибка повторяется 3 раза — это тема для повторения."], exercises: [makeExercise("Исправь ошибки B1", genB1Mistakes()), makeExercise("Собери правильную фразу", genSentenceAssemblyB1()), makeExercise("Короткий ответ 2–4 zdania", genShortWritingB1()), makeExercise("Разговор-диагностика", speakingPrompts)] }
};

const courseModules = [
  { title: "Диагностика и повторение", keys: ["diagnosticB1", "mixed20"] },
  { title: "База: формы и числа", keys: ["pluralNominative", "numbersTime"] },
  { title: "Падежи в речи", keys: ["accusative", "genitive", "dative", "instrumental", "locative"] },
  { title: "Глаголы и время", keys: ["verbsPresent", "verbsPast", "verbsFuture", "aspect"] },
  { title: "Конструкции B1", keys: ["prepositions", "complexSentences", "b1Connectors", "politeConditional", "imperatives", "pronouns", "reflexiveSie", "comparisons", "modalVerbs", "impersonal", "wordOrder", "b1Mistakes"] },
  { title: "Лексика по темам", keys: ["workLexicon", "housingLexicon", "healthLexicon", "documentsLexicon", "shoppingLexicon", "cityLexicon", "educationLexicon", "relationshipsLexicon", "travelLexicon", "foodLexicon", "technologyLexicon", "argumentationLexicon", "financeLexicon", "familyLexicon", "dailyLexicon", "natureLexicon", "cultureLexicon", "leisureLexicon", "safetyLexicon", "societyLexicon", "personalityLexicon", "environmentLexicon"] },
  { title: "Egzamin B1", keys: ["writingTemplates", "examB1Reading", "examB1Listening", "examB1Writing", "examB1Speaking", "examB1Mock"] }
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
  examB1Writing: ["Писать email, жалобу и заявление", "Держать структуру B1", "Проверять текст по чеклисту"],
  examB1Speaking: ["Говорить по карточке", "Описывать ситуацию", "Строить ответ 1–2 минуты"],
  examB1Mock: ["Проверить готовность", "Смешать грамматику и лексику", "Найти слабые темы"],
  b1Mistakes: ["Видеть типичные B1-ошибки", "Повторять слабые места", "Готовиться к смешанной речи"]
};

const isPracticeItem = (item) => item.type !== "note" && item.type !== "audio";

function loadSavedCourse() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function evaluateAnswer(item, answer) {
  if (item.type === "note" || item.type === "audio") return false;
  const value = answer?.value || "";
  if (!answer?.checked) return false;
  if (item.type === "free") return getFreeAnswerScore(value).passed;
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
        <div style={{ marginTop: 8 }}>Сначала слушай без текста, ответь на вопросы ниже, потом открой скрипт для проверки.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <button style={styles.primary} onClick={() => speakPolish(item.body, 0.95)}>Слушать</button>
          <button style={styles.btn} onClick={() => speakPolish(item.body, 0.78)}>Медленно</button>
          <button style={styles.btn} onClick={() => window.speechSynthesis?.cancel()}>Стоп</button>
          <button style={styles.btn} onClick={() => setState({ ...state, showScript: !showScript })}>
            {showScript ? "Скрыть скрипт" : "Показать скрипт"}
          </button>
        </div>
        {showScript && <div style={styles.template}>{item.body}</div>}
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
  const saved = useMemo(loadSavedCourse, []);
  const [topicKey, setTopicKey] = useState(saved.topicKey || topicKeys[0]);
  const [exerciseIndex, setExerciseIndex] = useState(saved.exerciseIndex || 0);
  const [answers, setAnswers] = useState(saved.answers || {});
  const [review, setReview] = useState(saved.review || {});
  const [userWords, setUserWords] = useState(saved.userWords || []);
  const [newWordPl, setNewWordPl] = useState("");
  const [newWordRu, setNewWordRu] = useState("");
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const initialModuleTitle = courseModules.find((module) => module.keys.includes(saved.topicKey || topicKeys[0]))?.title || courseModules[0].title;
  const [openModules, setOpenModules] = useState({ [initialModuleTitle]: true });
  const [openTopics, setOpenTopics] = useState({ [saved.topicKey || topicKeys[0]]: true });
  const [rulesOpen, setRulesOpen] = useState(true);

  const safeTopicKey = topics[topicKey] ? topicKey : topicKeys[0];
  const topic = topics[safeTopicKey];
  const safeExerciseIndex = topic.exercises[exerciseIndex] ? exerciseIndex : 0;
  const exercise = topic.exercises[safeExerciseIndex];
  const currentItems = exercise.items;

  const flat = topicKeys.flatMap((key) => topics[key].exercises.map((_, i) => ({ key, i })));
  const currentFlat = flat.findIndex((x) => x.key === safeTopicKey && x.i === safeExerciseIndex);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ topicKey: safeTopicKey, exerciseIndex: safeExerciseIndex, answers, review, userWords }));
  }, [answers, review, userWords, safeTopicKey, safeExerciseIndex]);

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
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div style={styles.app}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <h1>Polish Trainer A2 → B1</h1>
            <p>Курс-тренажёр: маршрут, цели уроков, повторение ошибок и проверка каждого ответа.</p>
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

        <section style={{ ...styles.card, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h2>Мой словарь</h2>
              <p>Добавляй слова из текстов или записывай свои. Это твоя личная лексика для повторения.</p>
            </div>
            <div>
              <span style={styles.badge}>{userWords.length} слов</span>
              <button style={styles.primary} onClick={() => setDictionaryOpen(true)}>Открыть полностью</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
            <input value={newWordPl} onChange={(e) => setNewWordPl(e.target.value)} style={styles.input} placeholder="polskie słowo..." />
            <input value={newWordRu} onChange={(e) => setNewWordRu(e.target.value)} style={styles.input} placeholder="перевод..." />
            <button style={styles.primary} onClick={addManualWord}>Добавить</button>
          </div>
          {userWords.length > 0 && (
            <div style={{ marginTop: 12, maxHeight: 220, overflow: "auto" }}>
              {userWords.slice(0, 30).map((word) => (
                <div key={`${word.pl}-${word.addedAt}`} style={styles.dictionaryItem}>
                  <div><strong>{word.pl}</strong> · {word.ru}<br /><small>{word.source === "manual" ? "добавлено вручную" : word.source}</small></div>
                  <button style={styles.btn} onClick={() => removeWord(word.pl)}>Удалить</button>
                </div>
              ))}
            </div>
          )}
        </section>
        {dictionaryOpen && <DictionaryModal words={userWords} onClose={() => setDictionaryOpen(false)} onRemove={removeWord} />}

        <div style={styles.layout}>
          <aside style={styles.card}>
            <h2>Маршрут курса</h2>
            {courseModules.map((module) => {
              const moduleTotal = module.keys.reduce((sum, key) => sum + courseStats.byTopic[key].total, 0);
              const moduleCorrect = module.keys.reduce((sum, key) => sum + courseStats.byTopic[key].correct, 0);
              const modulePercent = moduleTotal ? Math.round((moduleCorrect / moduleTotal) * 100) : 0;

              return (
                <div key={module.title}>
                  <button style={styles.moduleBtn} onClick={() => toggleModule(module.title)}>
                    <span>{openModules[module.title] ? "▾" : "▸"} {module.title} · {modulePercent}%</span>
                    <span>{module.keys.length}</span>
                  </button>
                  {openModules[module.title] && <ProgressBar value={modulePercent} />}
                  {openModules[module.title] && (
                    <div style={{ marginTop: 10 }}>
                      {module.keys.map((key) => (
                      <div key={key} style={{ marginBottom: 14 }}>
                        <button onClick={() => {
                          if (key === safeTopicKey) toggleTopic(key);
                          else selectTopic(key);
                        }} style={{ ...styles.topicBtn, ...(key === safeTopicKey ? styles.activeTopic : {}) }}>
                          <strong>{openTopics[key] ? "▾" : "▸"} {topics[key].title}</strong><br />
                          <small>{topics[key].description}</small><br />
                          <small>{courseStats.byTopic[key].percent}% освоено · {topics[key].exercises.length} упр.</small>
                        </button>
                        {openTopics[key] && topics[key].exercises.map((ex, i) => (
                          <button key={i} onClick={() => selectExercise(key, i)} style={{ ...styles.exBtn, ...(key === safeTopicKey && i === safeExerciseIndex ? { border: "1px solid #1f4f6f", background: "#e8f1f5" } : {}) }}>
                            {i + 1}. {ex.title}
                          </button>
                        ))}
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
                  {topic.theory.map((r, i) => <div key={i} style={styles.rule}>{r}</div>)}
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
