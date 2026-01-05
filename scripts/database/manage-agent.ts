#!/usr/bin/env ts-node

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { query } from "../../lib/database";

interface ConversationRecord {
  id: number;
  session_id: string;
  user_query: string;
  agent_response: string;
  steps: any;
  plan: any;
  evaluation: any;
  created_at: string;
}

interface SessionRecord {
  session_id: string;
  user_id: string | null;
  context: any;
  summary: string | null;
  created_at: string;
  last_active: string;
}

async function showMenu() {
  console.log("\n🤖 Agent 数据库管理工具");
  console.log("=".repeat(50));
  console.log("1. 查看所有会话 (Sessions)");
  console.log("2. 查看会话详情");
  console.log("3. 查看会话对话历史");
  console.log("4. 查看所有对话记录");
  console.log("5. 查看对话详情 (包含 Steps/Plan/Evaluation)");
  console.log("6. 删除会话 (及其所有对话)");
  console.log("7. 删除单条对话");
  console.log("8. 清理过期会话 (24小时无活动)");
  console.log("9. 数据库统计信息");
  console.log("0. 退出");
  console.log("=".repeat(50));
}

async function listAllSessions() {
  try {
    console.log("\n📋 所有会话列表:");
    console.log("-".repeat(100));

    const result = await query(`
      SELECT 
        s.session_id,
        s.user_id,
        s.created_at,
        s.last_active,
        s.summary,
        COUNT(c.id) as conversation_count
      FROM agent_sessions s
      LEFT JOIN agent_conversations c ON s.session_id = c.session_id
      GROUP BY s.session_id, s.user_id, s.created_at, s.last_active, s.summary
      ORDER BY s.last_active DESC
    `);

    if (result.rows.length === 0) {
      console.log("暂无会话");
      return;
    }

    result.rows.forEach((session: any) => {
      console.log(`Session ID: ${session.session_id}`);
      console.log(`User ID: ${session.user_id || "未设置"}`);
      console.log(`创建时间: ${session.created_at}`);
      console.log(`最后活跃: ${session.last_active}`);
      console.log(`对话数量: ${session.conversation_count}`);
      console.log(`摘要: ${session.summary ? session.summary.substring(0, 50) + "..." : "无"}`);
      console.log("-".repeat(50));
    });

    console.log(`总计: ${result.rows.length} 个会话`);
  } catch (error) {
    console.error("❌ 获取会话列表失败:", error);
  }
}

async function showSessionDetail() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const sessionId = await new Promise<string>((resolve) => {
      readline.question("请输入会话ID (Session ID): ", resolve);
    });
    readline.close();

    const sessionResult = await query(
      "SELECT * FROM agent_sessions WHERE session_id = $1",
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      console.log("❌ 未找到该会话");
      return;
    }

    const session: SessionRecord = sessionResult.rows[0];

    console.log("\n📖 会话详情:");
    console.log("-".repeat(80));
    console.log(`Session ID: ${session.session_id}`);
    console.log(`User ID: ${session.user_id || "未设置"}`);
    console.log(`创建时间: ${session.created_at}`);
    console.log(`最后活跃: ${session.last_active}`);
    console.log(`\n摘要: ${session.summary || "无"}`);
    
    if (session.context) {
      console.log("\n上下文 (Context):");
      console.log(JSON.stringify(session.context, null, 2));
    }

    // 获取对话数量
    const countResult = await query(
      "SELECT COUNT(*) as count FROM agent_conversations WHERE session_id = $1",
      [sessionId]
    );
    console.log(`\n对话数量: ${countResult.rows[0].count}`);
  } catch (error) {
    console.error("❌ 获取会话详情失败:", error);
  }
}

async function showSessionConversations() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const sessionId = await new Promise<string>((resolve) => {
      readline.question("请输入会话ID (Session ID): ", resolve);
    });
    readline.close();

    const result = await query(
      `SELECT id, user_query, agent_response, created_at, 
              jsonb_array_length(COALESCE(steps, '[]'::jsonb)) as steps_count
       FROM agent_conversations 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      console.log("❌ 该会话没有对话记录");
      return;
    }

    console.log(`\n💬 会话 ${sessionId} 的对话历史:`);
    console.log("-".repeat(100));

    result.rows.forEach((conv: any, index: number) => {
      console.log(`\n${index + 1}. 对话ID: ${conv.id}`);
      console.log(`   时间: ${conv.created_at}`);
      console.log(`   用户: ${conv.user_query.substring(0, 80)}${conv.user_query.length > 80 ? "..." : ""}`);
      console.log(`   Agent: ${conv.agent_response.substring(0, 80)}${conv.agent_response.length > 80 ? "..." : ""}`);
      console.log(`   步骤数: ${conv.steps_count || 0}`);
      console.log("-".repeat(50));
    });

    console.log(`\n总计: ${result.rows.length} 条对话`);
  } catch (error) {
    console.error("❌ 获取对话历史失败:", error);
  }
}

async function listAllConversations() {
  try {
    console.log("\n📋 所有对话记录 (最近20条):");
    console.log("-".repeat(100));

    const result = await query(`
      SELECT 
        id, 
        session_id, 
        user_query, 
        agent_response, 
        created_at,
        jsonb_array_length(COALESCE(steps, '[]'::jsonb)) as steps_count
      FROM agent_conversations 
      ORDER BY created_at DESC 
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log("暂无对话记录");
      return;
    }

    result.rows.forEach((conv: any) => {
      console.log(`ID: ${conv.id} | Session: ${conv.session_id}`);
      console.log(`时间: ${conv.created_at}`);
      console.log(`用户: ${conv.user_query.substring(0, 60)}${conv.user_query.length > 60 ? "..." : ""}`);
      console.log(`Agent: ${conv.agent_response.substring(0, 60)}${conv.agent_response.length > 60 ? "..." : ""}`);
      console.log(`步骤数: ${conv.steps_count || 0}`);
      console.log("-".repeat(50));
    });
  } catch (error) {
    console.error("❌ 获取对话记录失败:", error);
  }
}

async function showConversationDetail() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const id = await new Promise<string>((resolve) => {
      readline.question("请输入对话ID: ", resolve);
    });
    readline.close();

    const result = await query(
      "SELECT * FROM agent_conversations WHERE id = $1",
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      console.log("❌ 未找到该对话");
      return;
    }

    const conv: ConversationRecord = result.rows[0];

    console.log("\n📖 对话详情:");
    console.log("=".repeat(80));
    console.log(`ID: ${conv.id}`);
    console.log(`Session ID: ${conv.session_id}`);
    console.log(`创建时间: ${conv.created_at}`);
    
    console.log("\n用户查询:");
    console.log("-".repeat(80));
    console.log(conv.user_query);
    
    console.log("\nAgent 响应:");
    console.log("-".repeat(80));
    console.log(conv.agent_response);

    if (conv.steps && Array.isArray(conv.steps)) {
      console.log("\n执行步骤 (Steps):");
      console.log("-".repeat(80));
      conv.steps.forEach((step: any, index: number) => {
        console.log(`\n步骤 ${index + 1}:`);
        console.log(`  状态: ${step.status}`);
        console.log(`  思考: ${step.thought?.substring(0, 100)}${step.thought?.length > 100 ? "..." : ""}`);
        console.log(`  行动: ${step.action?.tool_name || "无"}`);
        if (step.action?.parameters) {
          console.log(`  参数: ${JSON.stringify(step.action.parameters)}`);
        }
        console.log(`  观察: ${step.observation?.success ? "成功" : "失败"}`);
      });
    }

    if (conv.plan) {
      console.log("\n执行计划 (Plan):");
      console.log("-".repeat(80));
      console.log(JSON.stringify(conv.plan, null, 2));
    }

    if (conv.evaluation) {
      console.log("\n质量评估 (Evaluation):");
      console.log("-".repeat(80));
      console.log(JSON.stringify(conv.evaluation, null, 2));
    }
  } catch (error) {
    console.error("❌ 获取对话详情失败:", error);
  }
}

async function deleteSession() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const sessionId = await new Promise<string>((resolve) => {
      readline.question("请输入要删除的会话ID: ", resolve);
    });

    // 先查询会话信息
    const sessionResult = await query(
      "SELECT * FROM agent_sessions WHERE session_id = $1",
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      console.log("❌ 未找到该会话");
      readline.close();
      return;
    }

    // 查询对话数量
    const countResult = await query(
      "SELECT COUNT(*) as count FROM agent_conversations WHERE session_id = $1",
      [sessionId]
    );

    console.log(`\n⚠️  该会话包含 ${countResult.rows[0].count} 条对话记录`);

    const confirm = await new Promise<string>((resolve) => {
      readline.question("确认删除？这将同时删除所有相关对话 (y/N): ", resolve);
    });
    readline.close();

    if (confirm.toLowerCase() !== "y") {
      console.log("❌ 取消删除");
      return;
    }

    // 先删除对话记录
    await query("DELETE FROM agent_conversations WHERE session_id = $1", [sessionId]);
    
    // 再删除会话
    await query("DELETE FROM agent_sessions WHERE session_id = $1", [sessionId]);

    console.log("✅ 会话及其所有对话删除成功");
  } catch (error) {
    console.error("❌ 删除会话失败:", error);
  }
}

async function deleteConversation() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const id = await new Promise<string>((resolve) => {
      readline.question("请输入要删除的对话ID: ", resolve);
    });

    const confirm = await new Promise<string>((resolve) => {
      readline.question("确认删除这条对话？ (y/N): ", resolve);
    });
    readline.close();

    if (confirm.toLowerCase() !== "y") {
      console.log("❌ 取消删除");
      return;
    }

    const result = await query(
      "DELETE FROM agent_conversations WHERE id = $1 RETURNING id",
      [parseInt(id)]
    );

    if (result.rows.length > 0) {
      console.log("✅ 对话删除成功");
    } else {
      console.log("❌ 未找到该对话");
    }
  } catch (error) {
    console.error("❌ 删除对话失败:", error);
  }
}

async function cleanupExpiredSessions() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const hours = await new Promise<string>((resolve) => {
      readline.question("清理多少小时无活动的会话？ (默认24): ", resolve);
    });
    readline.close();

    const hoursNum = parseInt(hours) || 24;

    // 查询将被删除的会话
    const sessionsResult = await query(
      `SELECT session_id, last_active 
       FROM agent_sessions 
       WHERE last_active < NOW() - INTERVAL '${hoursNum} hours'`
    );

    if (sessionsResult.rows.length === 0) {
      console.log(`✅ 没有超过 ${hoursNum} 小时无活动的会话`);
      return;
    }

    console.log(`\n⚠️  找到 ${sessionsResult.rows.length} 个过期会话:`);
    sessionsResult.rows.forEach((session: any) => {
      console.log(`  - ${session.session_id} (最后活跃: ${session.last_active})`);
    });

    const readline2 = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirm = await new Promise<string>((resolve) => {
      readline2.question("\n确认清理这些会话？ (y/N): ", resolve);
    });
    readline2.close();

    if (confirm.toLowerCase() !== "y") {
      console.log("❌ 取消清理");
      return;
    }

    // 删除对话记录
    const conversationsResult = await query(
      `DELETE FROM agent_conversations 
       WHERE session_id IN (
         SELECT session_id FROM agent_sessions 
         WHERE last_active < NOW() - INTERVAL '${hoursNum} hours'
       )`
    );

    // 删除会话
    const result = await query(
      `DELETE FROM agent_sessions 
       WHERE last_active < NOW() - INTERVAL '${hoursNum} hours'`
    );

    console.log(`✅ 清理完成: 删除了 ${result.rowCount} 个会话和相关对话`);
  } catch (error) {
    console.error("❌ 清理过期会话失败:", error);
  }
}

async function showDatabaseStats() {
  try {
    console.log("\n📊 Agent 数据库统计信息:");
    console.log("-".repeat(80));

    // 会话统计
    const sessionsResult = await query("SELECT COUNT(*) as count FROM agent_sessions");
    const sessionsCount = sessionsResult.rows[0].count;

    // 对话统计
    const conversationsResult = await query("SELECT COUNT(*) as count FROM agent_conversations");
    const conversationsCount = conversationsResult.rows[0].count;

    // 今天的对话数
    const todayResult = await query(
      "SELECT COUNT(*) as count FROM agent_conversations WHERE created_at >= CURRENT_DATE"
    );
    const todayCount = todayResult.rows[0].count;

    // 最活跃的会话
    const activeSessionsResult = await query(`
      SELECT 
        session_id, 
        COUNT(*) as conversation_count,
        MAX(created_at) as last_conversation
      FROM agent_conversations
      GROUP BY session_id
      ORDER BY conversation_count DESC
      LIMIT 5
    `);

    // 平均步骤数
    const avgStepsResult = await query(`
      SELECT AVG(jsonb_array_length(COALESCE(steps, '[]'::jsonb))) as avg_steps
      FROM agent_conversations
      WHERE steps IS NOT NULL
    `);

    console.log(`会话总数: ${sessionsCount}`);
    console.log(`对话总数: ${conversationsCount}`);
    console.log(`今日对话: ${todayCount}`);
    console.log(`平均步骤数: ${parseFloat(avgStepsResult.rows[0].avg_steps || 0).toFixed(2)}`);

    if (activeSessionsResult.rows.length > 0) {
      console.log("\n最活跃的会话 (Top 5):");
      activeSessionsResult.rows.forEach((row: any, index: number) => {
        console.log(`  ${index + 1}. ${row.session_id}`);
        console.log(`     对话数: ${row.conversation_count}`);
        console.log(`     最后对话: ${row.last_conversation}`);
      });
    }

    // 最近的对话
    const recentResult = await query(`
      SELECT user_query, created_at
      FROM agent_conversations
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentResult.rows.length > 0) {
      console.log("\n最近的对话:");
      recentResult.rows.forEach((row: any) => {
        const query = row.user_query.substring(0, 50);
        console.log(`  - ${query}${row.user_query.length > 50 ? "..." : ""} (${row.created_at.split("T")[0]})`);
      });
    }

    // 数据库大小
    const sizeResult = await query(`
      SELECT 
        pg_size_pretty(pg_total_relation_size('agent_conversations')) as conversations_size,
        pg_size_pretty(pg_total_relation_size('agent_sessions')) as sessions_size
    `);

    console.log("\n数据库表大小:");
    console.log(`  agent_conversations: ${sizeResult.rows[0].conversations_size}`);
    console.log(`  agent_sessions: ${sizeResult.rows[0].sessions_size}`);
  } catch (error) {
    console.error("❌ 获取统计信息失败:", error);
  }
}

async function main() {
  console.log("🔧 Agent 数据库管理工具启动...");

  // 测试数据库连接（带重试）
  let retries = 3;
  let connected = false;
  
  while (retries > 0 && !connected) {
    try {
      console.log(`🔗 正在连接数据库... (剩余尝试次数: ${retries})`);
      await query("SELECT NOW()");
      console.log("✅ 数据库连接成功");
      connected = true;
    } catch (error) {
      retries--;
      if (retries > 0) {
        console.log(`⚠️  连接失败，${2}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error("❌ 数据库连接失败:", error);
        console.log("\n💡 故障排除建议:");
        console.log("1. 检查 .env.local 中的 DATABASE_URL 配置");
        console.log("2. 确保网络连接正常");
        console.log("3. 如果使用远程数据库，检查数据库服务是否可用");
        console.log("4. 尝试运行: npm run test:db");
        process.exit(1);
      }
    }
  }

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    await showMenu();

    const choice = await new Promise<string>((resolve) => {
      readline.question("请选择操作 (0-9): ", resolve);
    });

    switch (choice) {
      case "1":
        await listAllSessions();
        break;
      case "2":
        await showSessionDetail();
        break;
      case "3":
        await showSessionConversations();
        break;
      case "4":
        await listAllConversations();
        break;
      case "5":
        await showConversationDetail();
        break;
      case "6":
        await deleteSession();
        break;
      case "7":
        await deleteConversation();
        break;
      case "8":
        await cleanupExpiredSessions();
        break;
      case "9":
        await showDatabaseStats();
        break;
      case "0":
        console.log("👋 再见！");
        readline.close();
        process.exit(0);
      default:
        console.log("❌ 无效选择，请重新输入");
    }

    await new Promise<void>((resolve) => {
      readline.question("\n按回车键继续...", () => resolve());
    });
  }
}

main().catch(console.error);
