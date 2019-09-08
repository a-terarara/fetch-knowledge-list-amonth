const fs = require("fs");
require("dotenv").config();
const { Chromeless } = require("chromeless");
const moment = require("moment-timezone");
moment()
  .tz("Asia/Tokyo")
  .format();

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
          const postDate = div.childNodes[1].childNodes[3].childNodes[4].data.substring(
            8,
            13
          );
          return {
            title: title.innerText,
            href: title.href.split("?")[0],
            writer,
            postDate
          };
        }
      );
    });

  chromeless.end();

  return list;
};

const contributes = (list, beforeMonth) => {
  const targetList = list.filter(
    contribution => contribution.postDate.substring(0, 2) === beforeMonth
  );
  return targetList.map(l => `${l.title} ${l.writer}\n${l.href}`).join("\n");
};

const contributionsGraphGenerator = (list, month) => {
  const beginDate = moment();
  beginDate.month(month - 1);
  beginDate.date(1);
  const lastDate = moment();
  lastDate.date(1);
  lastDate.month(month);
  lastDate.date(0);

  const beginDay = beginDate.weekday();

  const dates = Array(lastDate.date()).fill(" ");
  const contributionsPoint = dates.map((val, index) => {
    const mmdd = `${month}/${("0" + (index + 1)).slice(-2)}`;
    return list.find(l => l.postDate === mmdd) ? "■" : "□";
  });
  const emptyPoints = Array(beginDay).fill(" ");
  const flatFullContributionsPoints = emptyPoints.concat(contributionsPoint);

  const daysInWeek = 7;
  const matrixFullContributions = Array(
    flatFullContributionsPoints.length / daysInWeek
  )
    .fill()
    .map((val, index) =>
      flatFullContributionsPoints.slice(
        index * daysInWeek,
        index * daysInWeek + daysInWeek
      )
    );

  const transposeMatrix = a => a[0].map((_, c) => a.map(r => r[c]).join(" "));
  const t = transposeMatrix(matrixFullContributions).map((val, index) => {
    switch (index) {
      case 0:
        return "    " + val;
      case 1:
        return "Mon " + val;
      case 2:
        return "    " + val;
      case 3:
        return "Wed " + val;
      case 4:
        return "    " + val;
      case 5:
        return "Fri " + val;
      case 6:
        return "    " + val;
      default:
        return " ";
    }
  });

  const graph = `contributions in the last month
${t.join("\n")}`;
  console.log(graph);
  return graph;
};

scraping()
  .then(r => {
    const beforeMonth = ("0" + new Date().getMonth()).slice(-2);
    const report = fs
      .readFileSync("./report.template")
      .toString("utf-8")
      .replace("${month}", beforeMonth.replace("0", ""))
      .replace("${contributes}", contributes(r, beforeMonth))
      .replace("${graph}", contributionsGraphGenerator(r, beforeMonth));

    fs.writeFile("./report.txt", report);
  })
  .catch(console.error.bind(console));
