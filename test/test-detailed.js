/**
 * 测试脚本 - 测试 Wolai API 完整流程
 * 使用方法: node test/test-detailed.js
 * 
 * 需要先配置 .env 文件:
 * - WOLAI_APP_ID
 * - WOLAI_APP_SECRET  
 * - WOLAI_BLOCK_ID
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const { apiTool: getTokenTool } = await import("../tools/my-workspace/wo-lai/get-token.js");
const { apiTool: getBlockTool } = await import("../tools/my-workspace/wo-lai/get-block.js");
const { apiTool: createBlocksTool } = await import("../tools/my-workspace/wo-lai/create-blocks.js");

async function testDetailed() {
  console.log("=== Wolai API 测试流程 ===\n");

  const appId = process.env.WOLAI_APP_ID;
  const appSecret = process.env.WOLAI_APP_SECRET;
  const blockId = process.env.WOLAI_BLOCK_ID;

  if (!appId || !appSecret) {
    console.error("❌ 请先设置 WOLAI_APP_ID 和 WOLAI_APP_SECRET");
    return;
  }

  if (!blockId) {
    console.error("❌ 请先设置 WOLAI_BLOCK_ID");
    return;
  }

  console.log("环境变量检查:");
  console.log(`  WOLAI_APP_ID: ${appId.substring(0, 10)}...`);
  console.log(`  WOLAI_APP_SECRET: ${appSecret.substring(0, 10)}...`);
  console.log(`  WOLAI_BLOCK_ID: ${blockId}\n`);

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
    console.log("完整响应:", JSON.stringify(tokenResult, null, 2));
    return;
  }

  console.log("✅ Token 获取成功");
  console.log(`Token: ${appToken.substring(0, 30)}...\n`);

  // 步骤2: 测试获取块信息（验证 Token 是否有效）
  console.log("--- 步骤2: 验证 Token（获取块信息） ---");
  const getBlockResult = await getBlockTool.function({
    id: blockId,
    token: appToken
  });

  if (getBlockResult.error) {
    console.error("❌ 获取块信息失败:", getBlockResult.error);
    console.log("\n可能的原因:");
    console.log("1. Token 无效或已过期");
    console.log("2. 页面未添加应用（团队空间需要在页面协作-应用权限中添加应用）");
    console.log("3. 应用权限不足");
    return;
  }

  console.log("✅ Token 验证成功，可以访问块信息\n");

  // 步骤3: 创建内容
  console.log("--- 步骤3: 创建测试内容 ---");
  const blocks = [
    {
      type: "text",
      content: "🎉 这是通过 Wolai MCP API 创建的测试内容！",
      text_alignment: "left"
    },
    {
      type: "heading",
      level: 1,
      content: {
        title: "API 测试成功",
        front_color: "blue"
      },
      text_alignment: "left"
    },
    {
      type: "text",
      content: `✅ 创建时间: ${new Date().toLocaleString("zh-CN")}\n\n这是使用 MCP 工具成功创建的测试内容。`,
      text_alignment: "left"
    }
  ];

  const createResult = await createBlocksTool.function({
    token: appToken,
    parent_id: blockId,
    blocks: blocks
  });

  if (createResult.error) {
    console.error("❌ 创建块失败:", createResult.error);
    return;
  }

  console.log("✅ 内容创建成功！");
  console.log("\n创建结果:");
  console.log(JSON.stringify(createResult, null, 2));
  
  if (createResult.data && Array.isArray(createResult.data)) {
    console.log(`\n成功创建了 ${createResult.data.length} 个块:`);
    createResult.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
  }
  
  console.log("\n=== 测试完成 ===");
}

testDetailed().catch(console.error);

