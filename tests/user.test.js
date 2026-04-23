/**
 * 用户管理工具库单元测试 (user.test.js)
 * 
 * 测试覆盖：
 * - 用户档案操作（创建、读取、更新）
 * - 偏好设置管理
 * - 档案完整度检查
 * - 数据导出
 * - 账号注销
 */

const user = require('../user.js');
const storage = require('../storage.js');

// 测试工具函数
const assert = {
  ok: (value, message) => {
    if (!value) throw new Error(`Assert failed: ${message}`);
    console.log(`✓ ${message}`);
  },
  equal: (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(`Assert failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
    console.log(`✓ ${message}`);
  },
  deepEqual: (actual, expected, message) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Assert failed: ${message}`);
    }
    console.log(`✓ ${message}`);
  },
  notOk: (value, message) => {
    if (value) throw new Error(`Assert failed: ${message}`);
    console.log(`✓ ${message}`);
  },
};

// 测试套件
const tests = {
  passed: 0,
  failed: 0,
  total: 0,

  describe: function (suite, fn) {
    console.log(`\n📋 ${suite}`);
    console.log('='.repeat(50));
    try {
      fn();
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      this.failed++;
    }
  },

  it: function (testName, fn) {
    this.total++;
    try {
      fn();
      this.passed++;
    } catch (error) {
      console.error(`❌ ${testName}: ${error.message}`);
      this.failed++;
    }
  },

  summary: function () {
    console.log(`\n\n📊 测试结果总结`);
    console.log('='.repeat(50));
    console.log(`总测试数：${this.total}`);
    console.log(`通过：${this.passed} ✅`);
    console.log(`失败：${this.failed} ❌`);
    console.log(`通过率：${((this.passed / this.total) * 100).toFixed(2)}%`);

    if (this.failed === 0) {
      console.log(`\n🎉 所有测试通过！`);
    }
  },
};

console.log('🚀 开始执行用户管理系统单元测试');
console.log('='.repeat(60));

// TC-201: 用户档案创建测试
tests.describe('TC-201: 用户档案创建', () => {
  tests.it('应创建完整的用户档案', () => {
    const userInfo = {
      openId: 'user-001',
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      gender: 1,
      province: '北京',
      city: '朝阳区',
      birthDate: '1990-01-01',
    };

    const profile = user.createUserProfile(userInfo);

    assert.ok(profile, '应返回创建的档案');
    assert.equal(profile.openId, 'user-001', 'OpenId应匹配');
    assert.equal(profile.nickName, '测试用户', '昵称应匹配');
  });

  tests.it('档案应包含时间戳', () => {
    const profile = user.createUserProfile({
      openId: 'time-test-user',
      nickName: 'TimeTest',
    });

    assert.ok(profile.joinTime, '应有joinTime');
    assert.ok(profile.lastLoginTime, '应有lastLoginTime');
    assert.ok(profile.joinTime > 0, 'joinTime应为有效时间戳');
  });

  tests.it('档案应有默认偏好设置', () => {
    const profile = user.createUserProfile({
      openId: 'pref-test',
      nickName: 'PrefTest',
    });

    assert.ok(profile.preferences, '应有preferences字段');
    assert.equal(profile.preferences.theme, 'dark', '默认主题应为dark');
    assert.equal(profile.preferences.notifications, true, '默认应启用通知');
  });
});

// TC-202: 用户档案读取测试
tests.describe('TC-202: 用户档案读取', () => {
  tests.it('应能读取已创建的档案', () => {
    user.createUserProfile({
      openId: 'get-test',
      nickName: 'GetTest',
    });

    const profile = user.getUserProfile();
    assert.ok(profile, '应返回档案');
    assert.equal(profile.openId, 'get-test', 'OpenId应匹配');
  });

  tests.it('不存在档案时应返回null', () => {
    // 清除档案
    storage.removeStorage('userProfile');

    const profile = user.getUserProfile();
    assert.notOk(profile, '不存在档案时应返回null');
  });
});

// TC-203: 用户档案更新测试
tests.describe('TC-203: 用户档案更新', () => {
  tests.it('应能更新用户档案', () => {
    const profile = user.createUserProfile({
      openId: 'update-test',
      nickName: '原昵称',
    });

    const updated = user.updateUserProfile('update-test', {
      nickName: '新昵称',
      birthDate: '1995-05-05',
    });

    assert.equal(updated.nickName, '新昵称', '昵称应更新');
    assert.equal(updated.birthDate, '1995-05-05', '生日应更新');
  });

  tests.it('更新时不应修改openId和joinTime', () => {
    const profile = user.createUserProfile({
      openId: 'immutable-test',
      nickName: 'Test',
    });

    const originalJoinTime = profile.joinTime;

    const updated = user.updateUserProfile('immutable-test', {
      nickName: 'UpdatedTest',
    });

    assert.equal(updated.openId, 'immutable-test', 'OpenId不应变更');
    assert.equal(updated.joinTime, originalJoinTime, 'JoinTime不应变更');
  });

  tests.it('OpenId不匹配时应抛出错误', () => {
    user.createUserProfile({
      openId: 'existing-user',
      nickName: 'ExistingUser',
    });

    try {
      user.updateUserProfile('non-existing-user', { nickName: 'NewName' });
      assert.ok(false, '应抛出错误');
    } catch (error) {
      assert.ok(error.message.includes('不存在'), '错误信息应提及用户不存在');
    }
  });
});

// TC-204: 头像更新测试
tests.describe('TC-204: 用户头像更新', () => {
  tests.it('应能更新用户头像', () => {
    user.createUserProfile({
      openId: 'avatar-test',
      nickName: 'AvatarTest',
    });

    const success = user.updateUserAvatar('avatar-test', 'https://new-avatar.jpg');
    assert.ok(success, '更新应成功');

    const profile = user.getUserProfile();
    assert.equal(profile.avatarUrl, 'https://new-avatar.jpg', '头像应更新');
  });

  tests.it('用户不存在时应返回false', () => {
    const success = user.updateUserAvatar('non-existing', 'avatar.jpg');
    assert.notOk(success, '用户不存在时应返回false');
  });
});

// TC-205: 偏好设置管理测试
tests.describe('TC-205: 偏好设置管理', () => {
  tests.it('应能更新偏好设置', () => {
    user.createUserProfile({
      openId: 'pref-update-test',
      nickName: 'PrefTest',
    });

    const prefs = user.updatePreferences('pref-update-test', {
      theme: 'light',
      notifications: false,
    });

    assert.equal(prefs.theme, 'light', '主题应更新');
    assert.notOk(prefs.notifications, '通知应关闭');
  });

  tests.it('应能获取偏好设置', () => {
    user.createUserProfile({
      openId: 'pref-get-test',
      nickName: 'PrefGetTest',
    });

    const prefs = user.getPreferences();
    assert.ok(prefs, '应返回偏好设置');
    assert.equal(prefs.theme, 'dark', '应有theme字段');
  });
});

// TC-206: 档案完整度检查测试
tests.describe('TC-206: 档案完整度检查', () => {
  tests.it('空档案应不完整', () => {
    storage.removeStorage('userProfile');
    user.createUserProfile({
      openId: 'incomplete-test',
      nickName: '',
      birthDate: '',
      city: '',
    });

    const result = user.checkProfileCompleteness();
    assert.notOk(result.isComplete, '档案不完整');
    assert.ok(result.missingFields.length > 0, '应列出缺失字段');
  });

  tests.it('完整档案应标记为完整', () => {
    user.createUserProfile({
      openId: 'complete-test',
      nickName: '完整用户',
      birthDate: '1990-01-01',
      city: '北京',
      avatarUrl: 'avatar.jpg',
    });

    const result = user.checkProfileCompleteness();
    assert.ok(result.isComplete, '档案应标记为完整');
    assert.equal(result.missingFields.length, 0, '不应有缺失字段');
  });
});

// TC-207: 注册天数计算测试
tests.describe('TC-207: 用户注册天数计算', () => {
  tests.it('应计算注册天数', () => {
    user.createUserProfile({
      openId: 'days-test',
      nickName: 'DaysTest',
    });

    const days = user.getUserDaysSinceJoin();
    assert.ok(days >= 1, '注册天数应 >= 1');
  });

  tests.it('刚注册的用户应为1天', () => {
    user.createUserProfile({
      openId: 'day1-test',
      nickName: 'Day1Test',
    });

    const days = user.getUserDaysSinceJoin();
    assert.equal(days, 1, '新注册用户应为1天');
  });
});

// TC-208: 基本信息获取测试
tests.describe('TC-208: 基本信息获取', () => {
  tests.it('应能获取用户基本信息', () => {
    user.createUserProfile({
      openId: 'basic-info-test',
      nickName: '基本信息',
      gender: 1,
      city: '北京',
    });

    const info = user.getUserBasicInfo();
    assert.ok(info, '应返回基本信息');
    assert.equal(info.openId, 'basic-info-test', 'OpenId应匹配');
    assert.equal(info.nickName, '基本信息', '昵称应匹配');
  });

  tests.it('没有档案时应返回null', () => {
    storage.removeStorage('userProfile');
    const info = user.getUserBasicInfo();
    assert.notOk(info, '没有档案时应返回null');
  });
});

// TC-209: 最后登录时间更新测试
tests.describe('TC-209: 最后登录时间更新', () => {
  tests.it('应能更新最后登录时间', () => {
    user.createUserProfile({
      openId: 'login-time-test',
      nickName: 'LoginTimeTest',
    });

    const success = user.updateLastLoginTime();
    assert.ok(success, '更新应成功');

    const profile = user.getUserProfile();
    assert.ok(profile.lastLoginTime > profile.joinTime, '最后登录时间应晚于加入时间');
  });
});

// TC-210: 数据导出测试
tests.describe('TC-210: 用户数据导出', () => {
  tests.it('应能导出完整数据', () => {
    user.createUserProfile({
      openId: 'export-test',
      nickName: 'ExportTest',
    });

    const exported = user.exportUserData();
    assert.ok(exported.profile, '应包含profile');
    assert.ok(exported.exportTime, '应包含exportTime');
  });

  tests.it('导出数据应包含所有用户相关信息', () => {
    user.createUserProfile({
      openId: 'full-export-test',
      nickName: 'FullExportTest',
    });

    const exported = user.exportUserData();
    assert.ok(exported.profile, '应有profile');
    assert.ok(Array.isArray(exported.testHistory), '应有testHistory数组');
    assert.ok(Array.isArray(exported.favoriteTests), '应有favoriteTests数组');
  });
});

// TC-211: 账号注销测试
tests.describe('TC-211: 账号注销', () => {
  tests.it('应能删除用户档案', () => {
    user.createUserProfile({
      openId: 'delete-test',
      nickName: 'DeleteTest',
    });

    const success = user.deleteUserProfile('delete-test');
    assert.ok(success, '删除应成功');

    const profile = user.getUserProfile();
    assert.notOk(profile, '删除后不应存在档案');
  });

  tests.it('用户不存在时应返回错误', () => {
    try {
      user.deleteUserProfile('non-existing-delete-test');
      assert.ok(false, '应抛出错误');
    } catch (error) {
      assert.ok(error.message.includes('不存在'), '错误信息应提及用户不存在');
    }
  });
});

// TC-212: 边界情况测试
tests.describe('TC-212: 边界情况处理', () => {
  tests.it('应能处理特殊字符的昵称', () => {
    const profile = user.createUserProfile({
      openId: 'special-char-test',
      nickName: '测试@#$%^&*()',
    });

    assert.equal(profile.nickName, '测试@#$%^&*()', '应保留特殊字符');
  });

  tests.it('应能处理很长的昵称', () => {
    const longName = 'x'.repeat(200);
    const profile = user.createUserProfile({
      openId: 'long-name-test',
      nickName: longName,
    });

    assert.equal(profile.nickName, longName, '应保留完整的长昵称');
  });
});

// 打印测试结果
tests.summary();

module.exports = {
  testsPassed: tests.passed,
  testsFailed: tests.failed,
  testCount: tests.total,
  passRate: (tests.passed / tests.total) * 100,
};
