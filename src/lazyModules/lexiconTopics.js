export const lazyLexiconTopicShells = {
  workLexicon: { title: "Praca i firma", description: "Работа, обязанности, коллеги" },
  housingLexicon: { title: "Mieszkanie", description: "Жильё, аренда, бытовые проблемы" },
  healthLexicon: { title: "Zdrowie i lekarz", description: "Врач, аптека, симптомы" },
  documentsLexicon: { title: "Urząd i dokumenty", description: "Документы, заявления, учреждение" },
  shoppingLexicon: { title: "Zakupy i usługi", description: "Покупки, услуги, возврат" },
  cityLexicon: { title: "Miasto i transport", description: "Город, транспорт, как добраться" },
  educationLexicon: { title: "Edukacja i egzamin", description: "Учёба, экзамен, прогресс" },
  relationshipsLexicon: { title: "Relacje i emocje", description: "Отношения, эмоции, поддержка" },
  travelLexicon: { title: "Podróże i hotel", description: "Путешествия, отель, задержки" },
  foodLexicon: { title: "Jedzenie i restauracja", description: "Еда, ресторан, аллергии" },
  technologyLexicon: { title: "Internet i technologia", description: "Интернет, приложения, проблемы" },
  argumentationLexicon: { title: "Argumentacja B1", description: "Мнение, аргументы, вывод" },
  financeLexicon: { title: "Finanse osobiste", description: "Деньги, бюджет, банк" },
  familyLexicon: { title: "Rodzina i pokolenia", description: "Семья, поколения, обязанности" },
  dailyLexicon: { title: "Codzienne życie", description: "Быт, привычки, организация дня" },
  natureLexicon: { title: "Pogoda i natura", description: "Погода, природа, поездки" },
  cultureLexicon: { title: "Kultura i media", description: "Культура, новости, медиа" },
  leisureLexicon: { title: "Czas wolny i sport", description: "Хобби, спорт, отдых" },
  safetyLexicon: { title: "Bezpieczeństwo i prawo", description: "Безопасность, правила, помощь" },
  societyLexicon: { title: "Społeczeństwo", description: "Общество, город, интеграция" },
  personalityLexicon: { title: "Charakter i cechy", description: "Характер, качества человека" },
  environmentLexicon: { title: "Środowisko", description: "Экология, город, выбор" }
};

export function buildLexiconTopics({ makeLexiconTopic }) {
  return {
    workLexicon: {
      title: "Praca i firma",
      description: "Работа, обязанности, коллеги",
      theory: ["Тема нужна, чтобы говорить о работе, задачах, собеседовании и общении в фирме.", "Для сильного B1 важно не просто знать слово `praca`, а уметь описать обязанности, график, проблему и контакт с коллегой.", "Полезный фокус: stanowisko, obowiązki, doświadczenie, spotkanie, raport, dział, klient."],
      buildExercises: () => makeLexiconTopic("work", "Praca i firma", "Работа, обязанности, коллеги", ["Тема нужна, чтобы говорить о работе, задачах, собеседовании и общении в фирме.", "Для сильного B1 важно не просто знать слово `praca`, а уметь описать обязанности, график, проблему и контакт с коллегой.", "Полезный фокус: stanowisko, obowiązki, doświadczenie, spotkanie, raport, dział, klient."]).buildExercises()
    },
    housingLexicon: {
      title: "Mieszkanie",
      description: "Жильё, аренда, бытовые проблемы",
      theory: ["Тема закрывает аренду квартиры, счета, ремонт и контакт с владельцем.", "Важно уметь говорить проблему спокойно и конкретно: mamy awarię, nie działa ogrzewanie, kiedy można obejrzeć mieszkanie?", "Полезные связки: w mieszkaniu, z właścicielem, do innej dzielnicy."],
      buildExercises: () => makeLexiconTopic("housing", "Mieszkanie", "Жильё, аренда, бытовые проблемы", ["Тема закрывает аренду квартиры, счета, ремонт и контакт с владельцем.", "Важно уметь говорить проблему спокойно и конкретно: mamy awarię, nie działa ogrzewanie, kiedy można obejrzeć mieszkanie?", "Полезные связки: w mieszkaniu, z właścicielem, do innej dzielnicy."]).buildExercises()
    },
    healthLexicon: {
      title: "Zdrowie i lekarz",
      description: "Врач, аптека, симптомы",
      theory: ["B1 требует уметь объяснить симптомы, записаться к врачу и понять базовые инструкции.", "Главные конструкции: boli mnie..., mam gorączkę, potrzebuję recepty, chcę umówić wizytę.", "Эта тема хорошо тренирует biernik и dopełniacz: mam receptę, potrzebuję skierowania."],
      buildExercises: () => makeLexiconTopic("health", "Zdrowie i lekarz", "Врач, аптека, симптомы", ["B1 требует уметь объяснить симптомы, записаться к врачу и понять базовые инструкции.", "Главные конструкции: boli mnie..., mam gorączkę, potrzebuję recepty, chcę umówić wizytę.", "Эта тема хорошо тренирует biernik и dopełniacz: mam receptę, potrzebuję skierowania."]).buildExercises()
    },
    documentsLexicon: {
      title: "Urząd i dokumenty",
      description: "Документы, заявления, учреждение",
      theory: ["Это практическая тема для жизни в Польше: urząd, wniosek, formularz, opłata, odbiór dokumentu.", "Цель — уметь спросить, что заполнить, где подписать и когда забрать документ.", "Типичные фразы: złożyć wniosek, podpisać formularz, odebrać dokument."],
      buildExercises: () => makeLexiconTopic("documents", "Urząd i dokumenty", "Документы, заявления, учреждение", ["Это практическая тема для жизни в Польше: urząd, wniosek, formularz, opłata, odbiór dokumentu.", "Цель — уметь спросить, что заполнить, где подписать и когда забрать документ.", "Типичные фразы: złożyć wniosek, podpisać formularz, odebrać dokument."]).buildExercises()
    },
    shoppingLexicon: {
      title: "Zakupy i usługi",
      description: "Покупки, услуги, возврат",
      theory: ["Тема помогает решать бытовые ситуации: покупка, доставка, возврат, гарантия.", "Для B1 важно уметь не только купить, но и объяснить проблему: chcę zwrócić towar, mam paragon, potrzebuję innego rozmiaru.", "Здесь хорошо повторяются biernik и narzędnik: mam paragon, płacę kartą."],
      buildExercises: () => makeLexiconTopic("shopping", "Zakupy i usługi", "Покупки, услуги, возврат", ["Тема помогает решать бытовые ситуации: покупка, доставка, возврат, гарантия.", "Для B1 важно уметь не только купить, но и объяснить проблему: chcę zwrócić towar, mam paragon, potrzebuję innego rozmiaru.", "Здесь хорошо повторяются biernik и narzędnik: mam paragon, płacę kartą."]).buildExercises()
    },
    cityLexicon: {
      title: "Miasto i transport",
      description: "Город, транспорт, как добраться",
      theory: ["Тема нужна для дороги, опозданий, пересадок и объяснения маршрута.", "Главные действия: dojechać, przesiąść się, kupić bilet, sprawdzić rozkład jazdy.", "Тренируй направления: do centrum, na przystanku, z przesiadką."],
      buildExercises: () => makeLexiconTopic("city", "Miasto i transport", "Город, транспорт, как добраться", ["Тема нужна для дороги, опозданий, пересадок и объяснения маршрута.", "Главные действия: dojechać, przesiąść się, kupić bilet, sprawdzić rozkład jazdy.", "Тренируй направления: do centrum, na przystanku, z przesiadką."]).buildExercises()
    },
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
    environmentLexicon: makeLexiconTopic("environment", "Środowisko", "Экология, город, выбор", ["Тема выводит курс ближе к сильному B1, потому что даёт общественную лексику.", "Фокус: recykling, smog, zanieczyszczenie, transport publiczny, ochrona środowiska.", "Подходит для письма-мнения и устной аргументации."])
  };
}
