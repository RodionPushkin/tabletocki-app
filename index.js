require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const tabletochki = [
  {
    name: "Нексиум",
    description: "за 30 минут до еды",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Де-нол",
    description: "утро/вечер за 15 минут до еды",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Креон",
    description: "с каждым приемом пищи",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Трихопол",
    description: "утро/вечер через 15 минут после Де-нола",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Флемоксин",
    description: "утро/вечер через 60 минут после трихопола",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Креон",
    description: "через 60 минут после флемоксина",
    count: 2,
    date: [
      {
        from: "23.06",
        to: "2.07",
      },
    ],
  },
  {
    name: "Ганатон",
    description: "независимо от еды",
    count: 3,
    date: [
      {
        from: "03.07",
        to: "12.07",
      },
      {
        from: "23.07",
        to: "01.08",
      },
      {
        from: "12.08",
        to: "21.08",
      },
    ],
  },
  {
    name: "Омез",
    description: "перед ужином за 30 минут",
    count: 1,
    date: [
      {
        from: "03.07",
        to: "3.09",
      },
    ],
  },
];
function getPillsForDate(inputDate) {
  const dateParts = inputDate.split("-");
  const formattedDate = `${dateParts[2]}.${dateParts[1]}`;

  return tabletochki.filter((pill) =>
    pill.date.some((dateRange) => {
      const fromDate = parseDate(dateRange.from);
      const toDate = parseDate(dateRange.to);
      const checkDate = parseDate(formattedDate);

      return checkDate >= fromDate && checkDate <= toDate;
    })
  );
}

function parseDate(dateStr) {
  const [day, month] = dateStr.split(".");
  return new Date(2025, month - 1, day);
}
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  if (process.env.BOT_WHITELIST_IDS.includes(msg.chat.id)) {
    bot.sendMessage(
      msg.chat.id,
      "Я буду тебе любезно напоминать принимать таблеточки",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть приложение",
                web_app: {
                  url: process.env.BOT_APP_URL,
                },
              },
            ],
          ],
        },
      }
    );
  }
});

process.env.BOT_WHITELIST_IDS.split(",").map((chatId, index) => {
  cron.schedule(
    "0 7 * * *",
    () => {
      if (chatId) {
        let pillText = "";
        getPillsForDate(
          `2025-${new Date().getMonth() + 1}-${new Date().getDate()}`
        ).forEach((pill) => {
          pillText += `\n${pill.name} - ${pill.description}\n`;
        });
        bot.sendMessage(
          chatId,
          "Солнышко, доброе утро❤️ у тебя (" +
            `2025-${new Date().getMonth() + 1}-${new Date().getDate()}` +
            ") сегодня:\n" +
            (pillText.length > 0
              ? pillText + "\nНе забывай отмечать то как пьешь таблеточки"
              : "Отдых"),
          pillText.length > 0
            ? {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Открыть приложение",
                        web_app: {
                          url: process.env.BOT_APP_URL,
                        },
                      },
                    ],
                  ],
                },
              }
            : {}
        );
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Moscow",
    }
  );
  cron.schedule(
    "0 20 * * *",
    () => {
      if (chatId) {
        bot.sendMessage(
          chatId,
          "Солнышко, не забудь отметить выпитые таблеточки",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Открыть приложение",
                    web_app: {
                      url: process.env.BOT_APP_URL,
                    },
                  },
                ],
              ],
            },
          }
        );
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Moscow",
    }
  );
});
// Логирование для отладки
bot.on("message", (msg) => {
  console.log("Chat ID:", msg.chat.id);
});
// bot.sendMessage("363352536", "Солыншко, я наконец заработал❤️", {
//   reply_markup: {
//     inline_keyboard: [
//       [
//         {
//           text: "Открыть приложение",
//           web_app: {
//             url: process.env.BOT_APP_URL,
//           },
//         },
//       ],
//     ],
//   },
// });
