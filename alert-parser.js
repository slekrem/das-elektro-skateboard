const _feed = require("feed-read"),
  _fs = require("fs"),
  _https = require('https'),
  _firebase = require('firebase'),
  /*_app = _firebase.initializeApp({
    databaseURL: "https://das-elektro-skateboard.firebaseio.com",
    serviceAccount: "das-elektro-skateboard-91f21cd37628.json"
    apiKey: "AIzaSyAW_BL-9_ScCQ1oZHu6ctiQKEJ2RtqlCPk",
    authDomain: "das-elektro-skateboard.firebaseapp.com",
    databaseURL: "https://das-elektro-skateboard.firebaseio.com",
    storageBucket: "das-elektro-skateboard.appspot.com",
    messagingSenderId: "667358679071"}),*/
  _googleFeeds = [
    "https://www.google.de/alerts/feeds/04412435237654866870/9110502525763911842",
    "https://www.google.de/alerts/feeds/04412435237654866870/5385553535916750779",
    "https://www.google.de/alerts/feeds/04412435237654866870/3289640072419991976"
  ];

var guid = function() {
  var s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// parsing stuff
var removeBoldText = function(text) {
  if (!text) return text;
  while (text.search("<b>") != -1)
    text = text.replace("<b>", "");
  while (text.search("</b>") != -1)
    text = text.replace("</b>", "");
  return text;
}

var parseLink = function(link, callback) {
  if (!link) throw "!link";
  _https.get(link, (res) => {
    res.on('data', (data) => {
      var content = data.toString('utf8'),
        hrefStartIndex = content.search('href="');
      if (hrefStartIndex === -1) return;
      hrefStartIndex = hrefStartIndex + 6;
      var url = content.substr(hrefStartIndex, content.indexOf('"', hrefStartIndex) - hrefStartIndex);
      callback(url);
    });

  }).on('error', (e) => {
    throw e;
  });
}

var parseGoogleAlertFeed = (feedUrl, callback) => {
  _feed(feedUrl, (error, articles) => {
    if (error) throw error;

    var parsedLinks = 0;
    var data = [];
    console.log("articles: ");
    if (articles.length == 0) callback(data);
    articles.forEach((article, articleIndex) => {
      parseLink(article.link, (url) => {
        ++parsedLinks;
        console.log(parsedLinks);
        var asd = "asdasd"
        console.log(asd);
        data.push(
          {
            $key:
            {
              title: removeBoldText(article.title),
              author: article.author,
              link: url,
              content: removeBoldText(article.content),
              published: article.published
              //feed: article.feed
            }
          });
        if (parsedLinks == articles.length) callback(data);
      });
    });

    console.log("READY");
  });
}

_googleFeeds.forEach((feedUrl) => {
  parseGoogleAlertFeed(feedUrl, (articles) => {
    _fs.writeFile("feed.json", JSON.stringify(articles), (error) => {
      if (error) throw error;
    });
    articles.forEach((element, index, array) => {
    });
  });
});
