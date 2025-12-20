/**
 * 路由保护测试脚本
 * 
 * 运行: node test-routes.js
 */

const scenarios = [
    {
        name: "场景 1: 未登录访问 /dashboard",
        url: "http://localhost:3000/dashboard",
        expectRedirect: true,
        expectedPath: "/auth/login",
        shouldHaveCallbackUrl: true,
    },
    {
        name: "场景 2: 访问登录页",
        url: "http://localhost:3000/auth/login",
        expectRedirect: false,
    },
    {
        name: "场景 3: 访问注册页",
        url: "http://localhost:3000/auth/register",
        expectRedirect: false,
    },
    {
        name: "场景 4: 访问根路径",
        url: "http://localhost:3000/",
        expectRedirect: false, // 未登录时不重定向
    },
    {
        name: "场景 5: 访问 Auth API",
        url: "http://localhost:3000/api/auth/session",
        expectRedirect: false,
        expectJson: true,
    },
]

async function testRoute(scenario) {
    console.log(`\n🧪 ${scenario.name}`)
    console.log(`   URL: ${scenario.url}`)

    try {
        const response = await fetch(scenario.url, {
            redirect: "manual", // 不自动跟随重定向
        })

        const isRedirect = response.status >= 300 && response.status < 400
        const location = response.headers.get("location")

        if (scenario.expectRedirect) {
            if (isRedirect) {
                console.log(`   ✅ 重定向到: ${location}`)

                if (scenario.expectedPath && location.includes(scenario.expectedPath)) {
                    console.log(`   ✅ 重定向路径正确`)
                } else if (scenario.expectedPath) {
                    console.log(`   ❌ 重定向路径错误，期望包含: ${scenario.expectedPath}`)
                }

                if (scenario.shouldHaveCallbackUrl && location.includes("callbackUrl")) {
                    console.log(`   ✅ 包含 callbackUrl 参数`)
                } else if (scenario.shouldHaveCallbackUrl) {
                    console.log(`   ❌ 缺少 callbackUrl 参数`)
                }
            } else {
                console.log(`   ❌ 应该重定向但没有重定向 (状态码: ${response.status})`)
            }
        } else {
            if (isRedirect) {
                console.log(`   ⚠️  意外的重定向到: ${location}`)
            } else {
                console.log(`   ✅ 正常响应 (状态码: ${response.status})`)
            }
        }

        if (scenario.expectJson && response.headers.get("content-type")?.includes("application/json")) {
            console.log(`   ✅ 返回 JSON 格式`)
        }
    } catch (error) {
        console.log(`   ❌ 请求失败: ${error.message}`)
    }
}

async function runTests() {
    console.log("🚀 开始路由保护测试\n")
    console.log("=".repeat(60))

    for (const scenario of scenarios) {
        await testRoute(scenario)
    }

    console.log("\n" + "=".repeat(60))
    console.log("\n✨ 测试完成！")
    console.log("\n💡 提示:")
    console.log("   - 这些测试在未登录状态下运行")
    console.log("   - 已登录状态的测试需要在浏览器中手动验证")
    console.log("   - 详细的测试场景请查看 docs/ROUTE_PROTECTION_TESTS.md")
}

// 运行测试
runTests().catch(console.error)
