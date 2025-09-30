import { uploadFile, deleteFile, listFiles } from '../../lib/tencent-cos'

async function testCosConnection() {
  console.log('🧪 Testing Tencent Cloud COS connection...\n')

  try {
    // 测试上传
    console.log('📤 Testing file upload...')
    const testBuffer = Buffer.from('Hello COS! This is a test file.')
    const uploadResult = await uploadFile(
      testBuffer,
      'test.txt',
      'text/plain',
      'test'
    )

    if (uploadResult.success) {
      console.log('✅ Upload successful!')
      console.log(`   URL: ${uploadResult.url}`)
      console.log(`   Filename: ${uploadResult.filename}`)
      console.log(`   File size: ${uploadResult.fileSize} bytes`)

      // 测试删除
      console.log('\n🗑️  Testing file deletion...')
      if (uploadResult.filename) {
        const deleteResult = await deleteFile(uploadResult.filename)
        if (deleteResult) {
          console.log('✅ Delete successful!')
        } else {
          console.log('❌ Delete failed!')
        }
      }
    } else {
      console.log('❌ Upload failed!')
      console.log(`   Error: ${uploadResult.error}`)
    }

    // 测试文件列表
    console.log('\n📋 Testing file listing...')
    const files = await listFiles('', 10)
    console.log(`✅ Found ${files.length} files in bucket`)

    console.log('\n🎉 All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// 运行测试
testCosConnection()
