module.exports = {
  插件名: "聊天教学插件",
  指令: "^[/!]?问：(.*)答：(.*)",
  版本: "2.0",
  作者: "Giftina",
  描述: "添加一组新的聊天回复，抄板于虹原翼版小夜v3教学系统。来调教小夜说话吧！在优秀的聊天算法加成下，帮助养成由数万用户调教练就的嘴臭词库。当小夜收到含有 `关键词` 的语句时便会有几率触发回复。若该关键词有多个回复，将会随机选择一个回复。支持图片问答。注意！冒号是中文全角的 `：`，而不是英文半角的 `:`，并且在 `关键词` 和 `答：` 之间有一个空格。注意注意！如果像这样 `问：小夜的主人到底是谁呀 答：是你呀` 直接教完整的一句话的话是很难有效触发的，这就很考验你应该如何选择关键词了噢。像上面那个例子的话建议改成这样噢： `问：主人 答：是你呀`",
  使用示例: "问：HELLO 答：WORLD",
  预期返回: "哇!小夜学会啦!对我说: HELLO 试试吧，小夜有可能会回复 WORLD 噢",

  execute: async function (msg, userId, userName, groupId, groupName, options) {
    const teachMsg = msg.substr(2).split("答：");
    const teachMsgChecked = teachMsg.replace(/'/g, ""); //防爆
    if (teachMsgChecked.length !== 2) {
      console.log("教学指令: 分割有误，退出教学".error);
      return { type: "text", content: "@你教的姿势好像不对噢qwq" };
    }
    const ask = teachMsgChecked[0].trim(),
      ans = teachMsgChecked[1].trim();
    if (ask == "" || ans == "") {
      console.log("问/答为空，退出教学".error);
      return { type: "text", content: "@你教的关键词或者回答好像是空的噢qwq" };
    }
    if (ask.indexOf(/\r?\n/g) !== -1) {
      console.log("教学指令: 关键词换行了，退出教学".error);
      return { type: "text", content: "@关键词不能换行啦qwq" };
    }
    console.log(
      `${userId} ${userName} 想要教给小夜: 问: ${ask} 答: ${ans}，现在开始检测合法性`
        .log,
    );
    for (let i in CHAT_BAN_WORDS) {
      if (
        ask.toLowerCase().indexOf(CHAT_BAN_WORDS[i].toLowerCase()) !== -1 ||
        ans.toLowerCase().indexOf(CHAT_BAN_WORDS[i].toLowerCase()) !== -1
      ) {
        console.log(
          `教学指令: 检测到不允许的词: ${CHAT_BAN_WORDS[i]}，退出教学`
            .error,
        );
        return { type: "text", content: "@你教的内容里有主人不允许小夜学习的词qwq" };
      }
    }
    if (Buffer.from(ask).length < 4) {
      //关键词最低长度: 4个英文或2个汉字
      console.log("教学指令: 关键词太短，退出教学".error);
      return { type: "text", content: "@关键词太短了啦qwq，至少要4个英文或2个汉字啦" };
    }
    if (ask.length > 350 || ans.length > 350) {
      //图片长度差不多是350左右
      console.log("教学指令: 教的太长了，退出教学".error);
      return { type: "text", content: "@你教的内容太长了，小夜要坏掉了qwq，不要呀" };
    }
    //到这里都没有出错的话就视为没有问题，可以让小夜学了
    console.log("教学指令: 没有检测到问题，可以学习".log);
    db.run(`INSERT INTO chat VALUES('${ask}', '${ans}')`);
    console.log("教学指令: 学习成功".log);
    return { type: "text", content: `@哇!小夜学会啦!对我说: ${ask} 试试吧，小夜有可能会回复 ${ans} 噢` };
  },
};

const fs = require("fs");
const path = require("path");
const yaml = require("yaml"); //使用yaml解析配置文件
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db.db"); //数据库位置，默认与index.js同目录
let CHAT_BAN_WORDS;

Init();

//读取配置文件
function ReadConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(process.cwd(), "config", "config.yml"), "utf-8", function (err, data) {
      if (!err) {
        resolve(yaml.parse(data));
      } else {
        reject("读取配置文件错误。错误原因：" + err);
      }
    });
  });
}

//初始化CHAT_BAN_WORDS
async function Init() {
  const resolve = await ReadConfig();
  CHAT_BAN_WORDS = resolve.qqBot.CHAT_BAN_WORDS;
}