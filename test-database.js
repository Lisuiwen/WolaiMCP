/**
 * 测试脚本 - 测试 Wolai Database API
 * 使用方法: node test-database.js
 * 
 * 需要先配置 .env 文件:
 * - WOLAI_APP_ID
 * - WOLAI_APP_SECRET
 * - WOLAI_DATABASE_ID (可选，如果没有设置会提示输入)
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const { apiTool: getTokenTool } = await import("./tools/my-workspace/wo-lai/get-token.js");
const { apiTool: getDatabaseTool } = await import("./tools/my-workspace/wo-lai/get-database.js");
const { apiTool: createDatabaseRowsTool } = await import("./tools/my-workspace/wo-lai/create-database-rows.js");

async function testDatabase() {
  console.log("=== Wolai Database API 测试 ===\n");

  const appId = process.env.WOLAI_APP_ID;
  const appSecret = process.env.WOLAI_APP_SECRET;
  const databaseId = process.env.WOLAI_DATABASE_ID;

  if (!appId || !appSecret) {
    console.error("❌ 请先设置 WOLAI_APP_ID 和 WOLAI_APP_SECRET");
    return;
  }

  if (!databaseId) {
    console.error("❌ 请先设置 WOLAI_DATABASE_ID");
    console.log("提示: Database ID 可以从数据库页面的 URL 中获取（wolai.com/ 后面的部分）");
    return;
  }

  console.log("环境变量检查:");
  console.log(`  WOLAI_APP_ID: ${appId.substring(0, 10)}...`);
  console.log(`  WOLAI_APP_SECRET: ${appSecret.substring(0, 10)}...`);
  console.log(`  WOLAI_DATABASE_ID: ${databaseId}\n`);

  // 步骤1: 获取 Token
  console.log("--- 步骤1: 获取 Token ---");
  const tokenResult = await getTokenTool.function({});
  
  if (tokenResult.error) {
    console.error("❌ 获取 Token 失败:", tokenResult.error);
    return;
  }

  const appToken = tokenResult.data?.app_token || tokenResult.appToken?.app_token;
  
  if (!appToken) {
    console.error("❌ 未找到 app_token");
    return;
  }

  console.log("✅ Token 获取成功\n");

  // 步骤2: 获取数据库信息
  console.log("--- 步骤2: 获取数据库信息 ---");
  const getDatabaseResult = await getDatabaseTool.function({
    id: databaseId,
    token: appToken
  });

  if (getDatabaseResult.error) {
    console.error("❌ 获取数据库失败:", getDatabaseResult.error);
    return;
  }

  console.log("✅ 数据库信息获取成功");
  console.log("数据库结构:", JSON.stringify(getDatabaseResult, null, 2).substring(0, 500) + "...\n");

  // 步骤3: 插入数据到数据库
  console.log("--- 步骤3: 插入测试数据到数据库 ---");
  
  // 根据数据库结构创建测试数据
  // 注意: rows 的格式需要根据数据库的实际列结构来设置
  // 这里使用通用格式，实际使用时需要根据数据库的列来调整
  const rows = [
    {
      // 示例数据，实际格式需要根据数据库的列结构
      // 例如: { "列名1": "值1", "列名2": "值2" }
      "测试列1": "测试数据1",
      "测试列2": "测试数据2",
      "创建时间": new Date().toLocaleString("zh-CN")
    },
    {
      "测试列1": "测试数据3",
      "测试列2": "测试数据4",
      "创建时间": new Date().toLocaleString("zh-CN")
    }
  ];

  console.log("准备插入的数据:", JSON.stringify(rows, null, 2));
  
  const createResult = await createDatabaseRowsTool.function({
    token: appToken,
    database_id: databaseId,
    rows: rows
  });

  if (createResult.error) {
    console.error("❌ 插入数据失败:", createResult.error);
    console.log("\n提示: rows 的格式需要匹配数据库的列结构");
    console.log("请先查看数据库结构，然后根据实际的列名和类型来构造 rows 数据");
    return;
  }

  console.log("✅ 数据插入成功！");
  console.log("\n插入结果:");
  console.log(JSON.stringify(createResult, null, 2));
  
  console.log("\n=== 测试完成 ===");
}

testDatabase().catch(console.error);

