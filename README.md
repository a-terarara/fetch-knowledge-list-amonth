# knowledge から前月のレポートを取得する

## 使い方

.env ファイルに credenctials 情報とドメイン情報を埋め込む  
e.x.)

```
KNOWLEDGEUSER="login user id"
KNOWLEDGEPASS="password"
DOMAIN="xxxx.co.jp"
```

report.template ファイルを整形する  
e.x.)

```
${month}月のレポート
${contributes}
${graph}
以上
```

`npm start`

## report.template について

| 変数            | 置き換え値                     |
| :-------------- | :----------------------------- |
| \${month}       | 前月                           |
| \${contributes} | 投稿内容（title, 寄稿者, URL） |
| \${graph}       | 日毎投稿有無のグラフ           |
