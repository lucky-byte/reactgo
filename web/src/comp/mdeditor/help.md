# 总览

此 Markdown 语法速查表提供了所有 Markdown 语法元素的快速参考。但是此速查表无法涵盖所有极限用法，
因此，如果您需要某些语法元素的详细信息，请参阅我们的
<a href='https://www.markdown.xyz/basic-syntax' target='_blank'>基本语法</a> 和
<a href='https://www.markdown.xyz/extended-syntax' target='_blank'>扩展语法</a> 手册。

# 基本语法

这些是 John Gruber 的原始设计文档中列出的元素。所有 Markdown 应用程序都支持这些元素。

元素 | Markdown 语法
---- | ----
标题 | \# h1<br/>\#\# h2<br/>\#\#\# h3<br/>...<br/>\#\#\#\#\#\# h6
粗体 | \*\*粗体文字\*\*
斜体 | \*斜体文字\*
删除线 | \~\~删除文字\~\~
引用块 | \> 引用内容
有序列表 | 1\. 第一项<br/>2\. 第二项
无序列表 | \- 第一项<br/>\- 第二项
代码 | \`代码\`
网站链接 | \[标题\]\(https://example.com)
图片链接 | \!\[替代文字\](https://example.com/a.jpg)

# 扩展语法

这些元素通过添加额外的功能扩展了基本语法。ReactGO 支持下列的扩展语法：

## 表格

```
标题 | 标题
----- | ------
第一行 | 第一行
第二行 | 第二行
```

## 代码块

````
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```
````

代码块支持常用的语言，例如 `go`, `js`, `python` 等等。

## 脚注

```
Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.
```

## 任务列表

```
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
```
