#!/bin/bash

# 头像更新脚本
echo "🔄 正在更新头像..."

# 检查源文件是否存在
if [ ! -f "app/assets/images/avatar.png" ]; then
    echo "❌ 错误：app/assets/images/avatar.png 不存在"
    exit 1
fi

# 获取文件大小
SIZE=$(ls -lh app/assets/images/avatar.png | awk '{print $5}')
echo "✅ 头像已更新到 app/assets/images/avatar.png (大小: $SIZE)"

# 生成新的版本号
VERSION=$(date +%Y%m%d)
echo "📝 建议在代码中使用版本号: ?v=$VERSION"

# 显示文件信息
echo "📊 文件信息:"
ls -la app/assets/images/avatar.png

echo ""
echo "💡 提示：如果浏览器仍然显示旧图片，请："
echo "   1. 强制刷新页面 (Ctrl+F5 或 Cmd+Shift+R)"
echo "   2. 清除浏览器缓存"
echo "   3. 更新代码中的版本号"
