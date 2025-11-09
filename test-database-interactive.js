/**
 * 交互式测试脚本 - 测试 Wolai Database API
 * 使用方法: node test-database-interactive.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const { apiTool: getTokenTool } = await import("./tools/my-workspace/wo-lai/get-token.js");
const { apiTool: getDatabaseTool } = await import("./tools/my-workspace/wo-lai/get-database.js");
const { apiTool: createDatabaseRowsTool } = await import("./tools/my-workspace/wo-lai/create-database-rows.js");

async function testDatabase() {
  console.log("=== Wolai Database API 测试 ===\n");

  const appId = process.env.WOLAI_APP_ID;
  const appSecret = process.env.WOLAI_APP_SECRET;
  let databaseId = process.env.WOLAI_DATABASE_ID;

  if (!appId || !appSecret) {
    console.error("❌ 请先设置 WOLAI_APP_ID 和 WOLAI_APP_SECRET");
    rl.close();
    return;
  }

  if (!databaseId) {
    databaseId = await question("请输入 Database ID (从数据库页面 URL 获取，wolai.com/ 后面的部分): ");
    if (!databaseId) {
      console.log("❌ 需要 Database ID 才能继续");
      rl.close();
      return;
    }
  } else {
    console.log("✓ 从环境变量读取到 WOLAI_DATABASE_ID");
  }

  // 步骤1: 获取 Token
  console.log("\n--- 步骤1: 获取 Token ---");
  const tokenResult = await getTokenTool.function({});
  
  if (tokenResult.error) {
    console.error("❌ 获取 Token 失败:", tokenResult.error);
    rl.close();
    return;
  }

  const appToken = tokenResult.data?.app_token || tokenResult.appToken?.app_token;
  
  if (!appToken) {
    console.error("❌ 未找到 app_token");
    rl.close();
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
    rl.close();
    return;
  }

  console.log("✅ 数据库信息获取成功");
  const dbData = getDatabaseResult.data;
  
  // 显示数据库结构
  if (dbData) {
    console.log("\n数据库结构信息:");
    if (dbData.columns) {
      console.log("列信息:");
      dbData.columns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.name || col.key || '未知列'} (${col.type || '未知类型'})`);
      });
    }
    if (dbData.rows && dbData.rows.length > 0) {
      console.log(`\n当前已有 ${dbData.rows.length} 行数据`);
      if (dbData.rows[0]) {
        console.log("示例行数据:", JSON.stringify(dbData.rows[0], null, 2).substring(0, 200));
      }
    }
  }

  console.log("\n完整数据库信息:", JSON.stringify(getDatabaseResult, null, 2).substring(0, 1000) + "...\n");

  // 步骤3: 插入测试数据
  console.log("--- 步骤3: 插入测试数据 ---");
  
  // 根据数据库结构构造测试数据
  // 如果数据库有列信息，使用列名；否则使用通用格式
  let rows = [];
  
  if (dbData && dbData.columns && dbData.columns.length > 0) {
    // 使用数据库的实际列结构
    const firstRow = {};
    dbData.columns.forEach((col) => {
      const colName = col.name || col.key || col.id;
      if (colName) {
        firstRow[colName] = `测试数据_${new Date().getTime()}`;
      }
    });
    rows = [firstRow];
  } else if (dbData && dbData.rows && dbData.rows.length > 0) {
    // 根据现有行数据的结构来构造
    const sampleRow = dbData.rows[0];
    const newRow = {};
    Object.keys(sampleRow).forEach((key) => {
      if (key !== 'id' && key !== '_id') {
        newRow[key] = `测试_${new Date().getTime()}`;
      }
    });
    rows = [newRow];
  } else {
    // 使用通用格式
    rows = [
      {
        "名称": "测试数据1",
        "描述": "这是通过 API 创建的测试数据",
        "创建时间": new Date().toLocaleString("zh-CN")
      },
      {
        "名称": "测试数据2",
        "描述": "第二条测试数据",
        "创建时间": new Date().toLocaleString("zh-CN")
      }
    ];
  }

  console.log("准备插入的数据:");
  console.log(JSON.stringify(rows, null, 2));
  
  const createResult = await createDatabaseRowsTool.function({
    token: appToken,
    database_id: databaseId,
    rows: rows
  });

  if (createResult.error) {
    console.error("❌ 插入数据失败:", createResult.error);
    console.log("\n提示:");
    console.log("1. 请检查 rows 数据的格式是否匹配数据库的列结构");
    console.log("2. 确保列名和数据类型正确");
    console.log("3. 检查应用是否有'编辑数据表格数据'权限");
    rl.close();
    return;
  }

  console.log("✅ 数据插入成功！");
  console.log("\n插入结果:");
  console.log(JSON.stringify(createResult, null, 2));
  
  if (createResult.data && Array.isArray(createResult.data)) {
    console.log(`\n成功插入了 ${createResult.data.length} 行数据`);
  }
  
  console.log("\n=== 测试完成 ===");
  rl.close();
}

testDatabase().catch((error) => {
  console.error("错误:", error);
  rl.close();
});

