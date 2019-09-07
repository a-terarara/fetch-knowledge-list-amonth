# knowledgeから前月のレポートを取得する

## 使い方

1. .envファイルにcredenctials情報とドメイン情報を埋め込む  
e.x.)  
KNOWLEDGEUSER="login user id"
KNOWLEDGEPASS="password"
DOMAIN="xxxx.co.jp"
1. report.templateファイルを整形する  
e.x.)  
${month}月のレポート  
${contributes}  
以上
1. `npm start`

## report.templateについて
|変数|置き換え値|
|:--|:--|
|${month}|前月|
|${contributes}|投稿内容（title, 寄稿者, URL）|

