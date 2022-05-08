import { lazy, useEffect, useState } from 'react';
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import usePrint from "~/hook/print";
import SimpleMDEDark from './dark';
import help from './help.md';
import "easymde/dist/easymde.min.css";

// 代码拆分
const SimpleMDE = lazy(() => import('react-simplemde-editor'));
const Markdown = lazy(() => import('~/comp/markdown'));

// Markdown 编辑器
export default function MDEditor(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [options, setOptions] = useState({});
  const [content, setContent] = useState(props.value);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPrintNode, setHelpPrintNode] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { placeholder, uniqueId, onChange, ...others } = props;

  const printHelp = usePrint(helpPrintNode);

  // 获取编辑文字
  useEffect(() => { setContent(props.value); }, [props.value]);

  // 异步加载模块，代码拆分
  useEffect(() => {
    (async () => {
      const marked = await import('marked');
      const hljs = await import('highlight.js');
      const DOMPurify = (await import('dompurify')).default;

      // TODO: 切换主题后，2 个 css 都被引入了，这不是期望的效果
      if (theme.palette.mode === 'dark') {
        await import("highlight.js/styles/srcery.css");
      } else {
        await import("highlight.js/styles/xcode.css");
      }

      // 设置 simpleMde 选项
      setOptions({
        placeholder: placeholder || '支持 Markdown 语法',
        spellChecker: false,
        indentWithTabs: false,
        lineNumbers: false,
        theme: theme.palette.mode === 'dark' ? 'abcdef' : 'easymde',
        maxHeight: '400px',
        toolbar: [
          'heading', 'bold', 'italic', 'strikethrough', 'code', 'quote', '|',
          'unordered-list', 'ordered-list', '|',
          'image', 'link', 'table', 'horizontal-rule', '|',
          {
            name: "preview",
            className: "fa fa-eye",
            title: "预览",
            action: editor => {
              setPreviewOpen(true);
            },
          },
          'side-by-side', 'fullscreen', '|',
          {
            name: "help",
            className: "fa fa-question",
            title: "帮助",
            action: editor => {
              setHelpOpen(true);
            },
          }
        ],
        insertTexts: {
          table: ['', '\n标题 | 标题\n------ | ------\n内容 | 内容\n\n'],
          link: ['[标题', '](https://)'],
        },
        autosave: {
          enabled: uniqueId ? true : false,
          uniqueId: uniqueId || 'x',
          delay: 10 * 1000,
          text: '自动保存:',
        },
        errorCallback: message => {
          enqueueSnackbar(message);
        },
        previewRender: text => {
          marked.setOptions({
            langPrefix: 'hljs language-', // 支持语法高亮
            highlight: (code, lang) => {
              if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, {
                  language: lang, ignoreIllegals: true,
                }).value;
              } else {
                return hljs.highlightAuto(code).value;
              }
            },
          });
          let html = marked.parse(text);

          // 链接在新窗口打开, 渲染 checkbox 时删除 list-style
          html = addAnchorTargetBlank(html);
          html = removeListStyleWhenCheckbox(html);

          // 清洗 HTML 代码，避免恶意代码
          html = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

          return html;
        },
      });
    })();
  }, [theme.palette.mode, enqueueSnackbar, placeholder, uniqueId]);

  // 修改内容
  const onContentChange = v => {
    setContent(v);
    onChange && onChange(v);
  }

  // 关闭帮助窗口
  const onHelpClose = () => {
    setHelpOpen(false);
  }

  // 关闭预览窗口
  const onPreviewClose = () => {
    setPreviewOpen(false);
  }

  // 支持 Dark 模式
  const MDE = theme.palette.mode === 'light' ? SimpleMDE : SimpleMDEDark;

  return (
    <>
      <MDE {...others} options={options} onChange={onContentChange} />
      <Dialog open={helpOpen} maxWidth='md' fullWidth onClose={onHelpClose}>
        <DialogTitle>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <IconButton aria-label="打印" onClick={printHelp}>
              <PrintIcon />
            </IconButton>
            <IconButton aria-label="关闭" onClick={onHelpClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Paper variant='outlined' sx={{ p: 2 }} ref={setHelpPrintNode}>
            <Markdown url={help} />
          </Paper>
        </DialogContent>
      </Dialog>
      <Dialog onClose={onPreviewClose} open={previewOpen} maxWidth='md' fullWidth
        PaperProps={{
          style: { border: '1px solid #0808' }
        }}>
        <DialogContent sx={{ minHeight: 400 }}>
          <Markdown>{content}</Markdown>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 下面 2 个函数直接取自于 easy-markdown-editor
// https://github.com/Ionaru/easy-markdown-editor

/**
 * Modify HTML to add 'target="_blank"' to links so they open in new tabs by default.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 */
const anchorToExternalRegex = new RegExp(/(<a.*?https?:\/\/.*?[^a]>)+?/g);
function addAnchorTargetBlank(htmlText) {
  let match;

  while ((match = anchorToExternalRegex.exec(htmlText)) !== null) {
    // With only one capture group in the RegExp,
    // we can safely take the first index from the match.
    const linkString = match[0];

    if (linkString.indexOf('target=') === -1) {
      const fixedLinkString = linkString.replace(/>$/, ' target="_blank">');
      htmlText = htmlText.replace(linkString, fixedLinkString);
    }
  }
  return htmlText;
}

/**
 * Modify HTML to remove the list-style when rendering checkboxes.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 */
function removeListStyleWhenCheckbox(htmlText) {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlText, 'text/html');
  const listItems = htmlDoc.getElementsByTagName('li');

  for (let i = 0; i < listItems.length; i++) {
    const listItem = listItems[i];

    for (let j = 0; j < listItem.children.length; j++) {
      const listItemChild = listItem.children[j];

      if (listItemChild instanceof HTMLInputElement && listItemChild.type === 'checkbox') {
        // From Github: margin: 0 .2em .25em -1.6em;
        listItem.style.marginLeft = '-1.5em';
        listItem.style.listStyleType = 'none';
      }
    }
  }
  return htmlDoc.documentElement.innerHTML;
}

// 获取自动保存数据
export function getAutoSaved(uniqueId) {
  return localStorage.getItem('smde_' + uniqueId);
}

// 清除自动保存数据
export function delAutoSaved(uniqueId) {
  localStorage.removeItem('smde_' + uniqueId);
}
