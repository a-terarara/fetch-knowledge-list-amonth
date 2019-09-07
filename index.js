const fs = require("fs");
require("dotenv").config();
const { Chromeless } = require("chromeless");

const scraping = async () => {
  const chromeless = new Chromeless();

  const list = await chromeless
    .goto(`https://${process.env.DOMAIN}/knowledge/open.knowledge/list`)
    .type(process.env.KNOWLEDGEUSER, 'input[name="username"]')
    .type(process.env.KNOWLEDGEPASS, 'input[name="password"]')
    .click("#content_top > div > form > div:nth-child(4) > div > button")
    .press(13)
    .wait("#knowledgeList")
    .evaluate(() => {
      return [].map.call(
        document.querySelectorAll(
          "#knowledgeList > div.col-sm-12.col-md-8.knowledge_list > div"
        ),
        div => {
          const title = div.childNodes[1].childNodes[1];
          const writer =
            div.childNodes[1].childNodes[3].childNodes[3].innerText;
          const postMonth = div.childNodes[1].childNodes[3].childNodes[4].data.substring(
            8,
            10
          );
          return {
            title: title.innerText,
            href: title.href.split("?")[0],
            writer,
            postMonth
          };
        }
      );
    });

  chromeless.end();

  return list;
};

const contributes = (list, beforeMonth) => {
  const targetList = list.filter(
    contribution => contribution.postMonth === beforeMonth
  );
  return targetList.map(l => `${l.title} ${l.writer}\n${l.href}`).join("\n");
};

scraping()
  .then(r => {
    const beforeMonth = ("0" + new Date().getMonth()).slice(-2);
    const report = fs
      .readFileSync("./report.template")
      .toString("utf-8")
      .replace("${month}", beforeMonth.replace("0", ""))
      .replace("${contributes}", contributes(r, beforeMonth));

    fs.writeFile("./report.txt", report);
  })
  .catch(console.error.bind(console));
