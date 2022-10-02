function gmailSearch() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("users");
  const users_id = sheet.getRange("B:B").getValues().filter(String);
  const users_parse = sheet.getRange("C:C").getValues().filter(String);

  var myMsgs = gmail_query()

  Logger.log("検索該当件数：" + myMsgs.length);

    myMsgs.forEach((messages)=>{
      let msg = messages[0];
      const subject = msg.getSubject();
      const body = msg.getBody();
      console.log(body)

      users_parse.forEach((user_parse,index)=>{
    
      if(subject.indexOf(user_parse) >= 0 ||body.indexOf(user_parse) >=0){
        const msgDate = Utilities.formatDate(msg.getDate(), "JST", "HH:mm")
        var sendText = 
`
【件名】
   ${msg.getSubject()}

【送信元】
   ${msg.getFrom()}

【本文】
   ${msg.getPlainBody()}
`;
        var msgFrom = "送信元：" + msg.getFrom();
        var msgSubject = msg.getSubject();
        //スニペット形式でPost
        //postSlackChannel(msgBody, msgFrom, msgSubject);
        const user_id = users_id[index];
        const mail_url = 'https://mail.google.com/mail/u/0/#all/' + msg.getId();

        const mailPayload = {
          content:sendText,
          msgFrom:msgFrom,
          msgSubject:msgSubject,
          msgDate:msgDate,
          mail_url:mail_url
        }
        postFile(mailPayload,user_id);
      
      }
    })   
    })

    
  
}
function gmail_query(){

  const searchRange = {
    start:0,
    max: 100
  }
  let query = "to:tusfr.mail@gmail.com after:" //+ "2022/10/01" //+ formatDate(new Date());//deploy

  const current_Date = new Date();
  //current_Date.setMinutes(current_Date.getMinutes()-10);
  current_Date.setDate(current_Date.getDate()-1)
  
 const DateBefore10 = Utilities.formatDate(current_Date, "JST", "YYYY/MM/dd");
 query += DateBefore10;
  


  //query+=parseInt(((new Date()).getTime() - 10 * 60 * 1000) / 1000)
  console.log(query)
  
  

  const threads = GmailApp.search( query , searchRange.start , searchRange.max );
  const messagesForThreads = GmailApp.getMessagesForThreads( threads );

  return messagesForThreads;
}

/**
* Post先のチャンネルを指定
* チャンネルを複数管理しやすいようにfunctionを分けている
*/
// function postSlackChannel(mailPayload,user_id) {
//   const slackChannelID = slack_app_token
//   postFile(mailPayload,slackChannelID,user_id,);
// }


function postFile(mailPayload,user_id){
  //Jsonのペイロードに格納  
  const initial_comment = 
  `
  <@${user_id}>宛にメールが届きました。(${mailPayload.msgDate}
  <${mailPayload.mail_url}|メールリンク>`
  var payload = {
    "token" : slack_app_token,
    "channels" : "#general",
    'content' : mailPayload.content,//メッセージの中身
    'filename':"sample.txt",//テキスト形式のファイルを指定
    'initial_comment': initial_comment,
    'title': mailPayload.msgSubject //"Slack上でのファイルのタイトル"
  };
  var options = {
    "method" : "post",
    'contentType': 'application/x-www-form-urlencoded',
    "payload" : payload
  };
  
  var response = UrlFetchApp.fetch("https://slack.com/api/files.upload", options);
  Logger.log(response);
}
