module.exports = {
  插件名: "赛博百科问答插件",
  指令: "^[/!]?赛博朋克(.*)",
  版本: "2.0",
  作者: "Giftina",
  描述: "非常赛博朋克的百科知识问答题",
  使用示例: "赛博朋克",
  预期返回: "大明湖畔位于哪个城市？ 请按如下格式回答: 赛博朋克 你的答案",

  execute: async function (msg, userId, userName, groupId, groupName, options) {
    if (!TIAN_XING_API_KEY) {
      return { type: "text", content: `${this.插件名} 的接口密钥未配置，请通知小夜主人及时配置接口密钥。方法：在状态栏右键小夜头像，点击 打开配置文件，按接口密钥配置说明进行操作` };
    }
    if (msg.split(" ").length > 1) {
      if (`赛博朋克 ${answer}` == msg) {
        return { type: "text", content: `回答正确！答案是${answer}` };
      } else {
        return { type: "text", content: `回答错误，答案是${answer}` };
      }
    } else {
      const cyberPedia = await CyberPedia() ?? "";
      const question = `${cyberPedia.question} 请按如下格式回答: 赛博朋克 你的答案`;
      SaveAnswer(cyberPedia.result);
      return { type: "text", content: question };
    }

  },
};

function SaveAnswer(cyberPediaAnswer) {
  answer = cyberPediaAnswer;
}


const request = require("request");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml"); // 使用yaml解析配置文件
let TIAN_XING_API_KEY, answer;

Init();

// 读取配置文件
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

// 初始化TIAN_XING_API_KEY
async function Init() {
  const resolve = await ReadConfig();
  TIAN_XING_API_KEY = resolve.ApiKey.TIAN_XING_API_KEY;
}

//赛博百科问答
function CyberPedia() {
  return new Promise((resolve, reject) => {
    request(
      `http://api.tianapi.com/txapi/wenda/index?key=${TIAN_XING_API_KEY}`,
      (err, response, body) => {
        body = JSON.parse(body);
        if (!err) {
          resolve({
            question: body.newslist[0].quest,
            result: body.newslist[0].result,
          });
        } else {
          reject(
            "获取赛博百科问答错误，是天行接口的锅。错误原因: " +
            JSON.stringify(response.body),
          );
        }
      },
    );
  });
}