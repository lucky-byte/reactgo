# Markdown 语法参考手册 / 速查表

此 Markdown 语法速查表提供了常用 Markdown 语法元素的快速参考。但是此速查表无法涵盖所有极限用法，
因此，如果您需要某些语法元素的详细信息，请参阅
<a href='https://www.markdown.xyz/basic-syntax' target='_blank'>基本语法</a> 和
<a href='https://www.markdown.xyz/extended-syntax' target='_blank'>扩展语法</a> 手册。

## 基本语法

这些是 John Gruber 的原始设计文档中列出的元素。所有 Markdown 应用程序都支持这些元素。

元素 | Markdown 语法 | 效果
---- | ---- | ------
标题 | \# 一级标题<br/>\#\# 二级标题<br/>\#\#\# 三级标题<br/>...<br/>\#\#\#\#\#\# 六级标题 | -
粗体 | \*\*粗体文字\*\* | **这是粗体**
斜体 | \*斜体文字\* | *这是斜体*
删除线 | \~\~删除线文字\~\~ | ~~带删除线的文字~~
引用 | \> 引用内容 | -
有序列表 | 1\. 第一项<br/>2\. 第二项 | 1\. 第一项<br/>2\. 第二项
无序列表 | \- 第一项<br/>\- 第二项 | · 第一项<br/> · 第二项 |
代码 | \`代码\` | `code` `code2`
网站链接 | \[ReactGo\]\(https://reactgo.kross.work) | [ReactGo](https://reactgo.kross.work)
图片链接 | \!\[LOGO\](https://reactgo.kross.work/img/logo.png) |

## 扩展语法

这些元素通过添加额外的功能扩展了基本语法。ReactGO 支持下列的扩展语法：

### 表格

#### 语法

```
标题一 | 标题二    | 标题三
----- | :------: | -----:
左对齐 | 居中对齐  | 右对齐
第一列 | 第二列    | 第三列
```

可以通过冒号 `:` 控制列的对齐方式（默认为左对齐）。

#### 效果

标题一 | 标题二 | 标题三
----- | :------: | -----:
左对齐 | 居中对齐 | 右对齐
第一列 | 第二列    | 第三列

### 代码块

#### 语法

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

#### 效果

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

### 脚注

#### 语法

```
这是一段带有脚注的文字[^1]

[^1]: 这是脚注内容
```

#### 效果

这是一段带有脚注的文字[^1]

[^1]: 这是脚注内容

### 任务列表

#### 语法

```
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
```

#### 效果

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

----
