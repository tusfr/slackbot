function main() {
  setTrigger();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("slack");
  const users_id = sheet.getRange("B:B").getValues().filter(String);
  const users_parse = sheet.getRange("C:C").getValues().filter(String);

  const messageForThreads = gmail_query();

  messageForThreads.forEach((messages) => {
    const message = messages[0];
    const subject = message.getSubject();
    const body = message.getBody();

    console.log(subject);

    users_parse.forEach((user_parse, index) => {
      if (subject.indexOf(user_parse) >= 0 || body.indexOf(user_parse) >= 0) {
        const channel = users_id[index];
        console.log(user_parse);
        console.log(channel);
        const mail_url =
          "https://mail.google.com/mail/u/0/#all/" + messages[0].getId();
        const mail_date = Utilities.formatDate(
          messages[0].getDate(),
          "JST",
          "HH:mm"
        );
        const message =
          "<@" +
          channel +
          "> 宛にメールが届きました。" +
          "\n" +
          "<" +
          mail_url +
          "|あなた宛てのメールはこちらから>"; //deploy
        //const message = "<"+channel+"> 宛にメールが届きました。("+mail_date+")" + "\n" +"<"+mail_url+"|メールリンク>"; //test

        console.log(message);
        postSlackbot(message);
      }
    });
  });
}

//引数:配信するメッセージ
//この関数でSlackに配信する
function postSlackbot(message) {
  const slackApp = SlackApp.create(slack_app_token);
  //const channelId = "#他-メール通知";//deploy
  const channelId = "#general"; //test
  slackApp.postMessage(channelId, message);
}

//今日の日付を整える
function formatDate(date) {
  const formated = Utilities.formatDate(date, "Asia/Tokyo", "yyyy/MM/dd");
  return formated;
}

//Gmailの検索クエリ
function gmail_query() {
  const start = 0;
  const max = 100;
  const query = "after:" + formatDate(new Date()); // Step 2

  const threads = GmailApp.search(query, start, max);
  const messagesForThreads = GmailApp.getMessagesForThreads(threads);

  return messagesForThreads;
}

//トリガーの設定
function setTrigger() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(00);
  date.setMinutes(01);
  ScriptApp.newTrigger("main").timeBased().at(date).create();
}

//初期設定
function doGet(e) {
  setTrigger();
}
