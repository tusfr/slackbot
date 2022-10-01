function gmailSearch() {
  let query = "l:inbox after:" + "2022/10/01"; // Step 2
  
  const gmailSearchWord = query

  //Gmailから特定条件のスレッドを検索しメールを取り出す

  var myMsgs = gmail_query()

  Logger.log("検索該当件数：" + myMsgs.length);
  
  //各スレッド×メール
    myMsgs.forEach((messages)=>{
      let msg = messages[0]
       Logger.log("TEXT");
          // var msgBody = 
          //     "件名：" + msg.getSubject() + "\n" +
          //       "送信元：" + msg.getFrom() + "\n" +
          //         msg.getPlainBody() + "\n" +
          //           msg.getDate() + "\n" 
          //           ;
          var sendText = `
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
        postSlackChannel(sendText,msgFrom,msgSubject)
    })

    
  
}
function gmail_query(){
  const start = 0;
  const max = 100;
  const searchRange = {
    start:0,
    max: 2
  }
  let query = "l:inbox after:" + "2022/10/01" //+ formatDate(new Date()); // Step 2
  query = ""
  
  

  const threads = GmailApp.search( query , searchRange.start , searchRange.max );
  const messagesForThreads = GmailApp.getMessagesForThreads( threads );

  return messagesForThreads;
}

/**
* Post先のチャンネルを指定
* チャンネルを複数管理しやすいようにfunctionを分けている
*/
function postSlackChannel(msgBody, msgFrom, msgSubject) {
  const slackChannelID = slack_app_token
  postFile(slackChannelID, msgBody, msgFrom, msgSubject);
}


function postFile(slackChannelID, msgBody, msgFrom, msgSubject){
  //Jsonのペイロードに格納  
  var payload = {
    "token" : slack_app_token,
    "channels" : "#general",
    'content' : msgBody,//メッセージの中身
    'filename':"sample.txt",//テキスト形式のファイルを指定
    //'initial_comment': msgFrom,//ファイルのコメント"
    'title': msgSubject //"Slack上でのファイルのタイトル"
  };
  var options = {
    "method" : "post",
    'contentType': 'application/x-www-form-urlencoded',
    "payload" : payload
  };
  
  var response = UrlFetchApp.fetch("https://slack.com/api/files.upload", options);
  Logger.log(response);
}
