# jiawu (家务对 / Chore Couple)

三文件前端：`index.html` + `style.css` + `app.js`，直接用你提供的 `kajilog1` Firebase 项目。

## 部署前需要在 Firebase 控制台做的事

1. **打开 Authentication → Sign-in method**，启用 "Google" 登录方式。
2. **打开 Firestore Database**，创建数据库（选 production 模式即可）。
3. 把 `firestore.rules` 的内容粘贴到 Firestore 的 "规则" 标签页并发布。
4. **打开 Authentication → Settings → Authorized domains**，添加你实际部署的域名（比如 Firebase Hosting 的域名，或本地测试用的域名）。
5. （可选，推荐）用 Firebase Hosting 部署：
   ```
   npm install -g firebase-tools
   firebase login
   firebase init hosting   # 选择 kajilog1 项目，public 目录填这三个文件所在目录
   firebase deploy
   ```
   也可以直接把三个文件放到任何静态托管（Netlify、Vercel、GitHub Pages 都行）。

## 修改管理员密钥

打开 `app.js` 顶部：
```js
const ADMIN_KEY = "jiawu-admin-2026";
```
上线前请改成只有你知道的字符串。

## ⚠️ 安全提示（务必看）

管理员入口目前是**纯前端密码校验** —— 任何打开浏览器控制台的人都能读到 Firestore 里所有小组、用户、记录的数据，因为规则里只要求"已登录"，不要求"是管理员"。这是为了先做出一个能跑的 MVP。

真正想要安全的管理员权限，需要：
- 用 Firebase Admin SDK 在 Cloud Function 里校验管理员身份（比如给管理员账号打上 custom claim），
- 或者把敏感的管理员读取/修改操作都放到 Cloud Function 里，前端只调用 Function，不直接读 Firestore。

这部分可以作为第二阶段和支付功能一起做。

## 数据结构

- `users/{uid}`：name, email, photoURL, groupId, createdAt, lastLogin, loginCount
- `groups/{groupId}`：name, passcode（5位数字）, memberUids（最多2人）, createdAt
- `groups/{groupId}/chores/{choreId}`：自定义家务 name, points, createdBy
- `records/{recordId}`：groupId, uid, userName, choreId, choreName, points, date（当天日期字符串，用于"今日已完成"锁定判断）, timestamp
- `loginLogs/{logId}`：uid, timestamp（登录审计日志）

默认家务（做饭20 / 洗碗15 / 吸尘10）写死在 `app.js` 里的 `DEFAULT_CHORES`，如果想改分数或加默认项，直接改这个数组。

## 已实现的功能

- Google 登录 + 创建/加入小组（5位密码）
- 看板：本周积分对比饼图、点击记录家务、当天已完成的家务对伴侣锁定并显示是谁做的
- 自定义家务（+积分）
- 统计页：月度趋势折线图（按周聚合）、最近记录表、按月切换
- 记录页：全部/只看我的/只看伴侣
- 设置页：管理自定义家务（删除）、修改密码、退出小组、中日英切换
- 管理员：总览统计、查看所有小组（含解散小组、给任意成员调整积分）、查看所有用户（改姓名、查看邮箱/登录信息）

## 第二阶段（未实现，按你的要求推迟）

- Apple Pay / PayPay 付款流程
- 付款后直接跳转记录家务页的逻辑
