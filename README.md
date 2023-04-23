# 介绍

## 关于这个项目

### 为什么要做这个项目？
1. 为了学历提升

    由于我是专科毕业，在大杭州打拼确实少了几分自信，所以在工作的同时进行着自考。由于并不是很喜欢其他的专业，还是比较喜欢计算机专业所以选考了计算机科学专业本科。一考起来才发现真滴难，光实践课就很多了，这个项目也就是为了做实践课的《软件工程》而创建的。
2. 为了学习`react`和`golang`

    这个项目底子是使用`golang`来操作底层，使用`webview2`的形式引入前端技术来进行混合式桌面端应用开发。`golang`是`Google`开源的语言，`react`是`Facebook`开源的前端框架。这两者的结合必然能创造出一片火花，但是由于`wails`刚刚创建没多久，所以说轮子不是很多，并且解决方案和通用方法比较少。
3. 技术的前瞻性

    其实作为混合应用开发我也做过比较多的方案，就目前技术方案最多的就是使用`electron`来进行前端桌面应用开发；目前（2023年4月）为止，微信、阿里云盘、`vscode`等等大厂的桌面应用都是基于`electorn`进行开发的。`electron`的优势非常巨大，即一个会`node`的前端团队就能做到一个基本的`electron`应用的开发。但是劣势也是比较明显的，就是性能问题、还有的就是文件体积问题；因为`electron`打包的情况需要将整个浏览器的对象都要打包到安装包中，所以就算是一个`helloworld`的`electron`应用都要将近`170MB`的大小。但是其实就目前的硬件问题来说，这都已经不是事了，目前主流的电脑都已经使用固态硬盘，并且内存都是`4G`起步，所以包大小的问题可以忽视。就性能问题来说，其实使用`electron`桌面端应用你会发现，不管是微信还是其他应用，也不管你的电脑配置如何之高，但是总会在特定情况下有那种卡顿无响应的情况，这也并不是我吐槽哪个技术的槽点，而其实就是因为使用浏览器端作为桌面应用就是会附带着这种问题。目前也有轻量版`electron`，也就是删除了一些不需要使用的功能。所以说如果`wails`能有一足之地，也就给混合桌面应用开发多了选择的余地。
    
### 技术选型


