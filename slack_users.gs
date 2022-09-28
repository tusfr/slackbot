function getSlackUser() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("slack");
  const options = {
    method: "get",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      token: slack_app_token,
    },
  };

  const url = "https://slack.com/api/users.list";
  const response = UrlFetchApp.fetch(url, options);

  const members = JSON.parse(response).members;

  let arr = [];

  for (const member of members) {
    //削除済、botユーザー、Slackbotを除く
    if (!member.deleted && !member.is_bot && member.id !== "USLACKBOT") {
      let id = member.id;
      let real_name = member.real_name; //氏名(※表示名ではない)
      arr.push([real_name, id]);
    }
  }

  //スプレッドシートに書き込み
  sheet.getRange(1, 1, sheet.getMaxRows() - 1, 2).clearContent();
  sheet.getRange(1, 1, arr.length, arr[0].length).setValues(arr);
}
