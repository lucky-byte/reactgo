import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { alpha, styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HdrStrongIcon from '@mui/icons-material/HdrStrong';
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import titleState from "~/state/title";
import progressState from "~/state/progress";
import { get, post, put } from '~/rest';

export default function Node() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const [root, setRoot] = useState('');
  const [tree, setTree] = useState(null);
  const [node, setNode] = useState({});
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [hoverNode, setHoverNode] = useState('');
  const [reload, setReload] = useState(true);

  useEffect(() => { setTitle('层级管理'); }, [setTitle]);

  // 选择节点
  const onNodeSelect = useCallback(async (e, nodeIds) => {
    try {
      setSelected(nodeIds);

      const params = new URLSearchParams({ uuid: nodeIds });
      const resp = await get('/tree/node/info?' + params.toString())
      setNode(resp);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }, [enqueueSnackbar]);

  // 展开节点
  const onNodeToggle = (e, nodeIds) => {
    setExpanded(nodeIds);
  }

  // 加载树结构
  useEffect(() => {
    (async () => {
      try {
        if (reload) {
          setProgress(true);

          const params = new URLSearchParams({ root: root });
          const resp = await get('/tree/node/?' + params.toString());

          setTree(resp?.tree || null);
          if (!selected) {
            onNodeSelect(null, resp.tree?.uuid)
          }
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setReload(false);
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, reload, onNodeSelect, selected, root, setProgress]);

  // 显示节点菜单
  const onNodeContextMenu = e => {
    e.preventDefault();

    setContextMenu(
      contextMenu === null ? {
        mouseX: e.clientX - 2,
        mouseY: e.clientY - 4,
      } : null,
    );
  }

  // 设置为显示根节点
  const onSetRootNode = uuid => {
    setContextMenu(null);
    setRoot(hoverNode || selected);
    setReload(true);
  }

  // 恢复默认根节点
  const onResetRootNode = uuid => {
    setRoot('');
    setReload(true);
  }

  // 展开全部子节点
  const onExpandAll = () => {
    setContextMenu(null);

    const target = hoverNode || selected;
    const nodes = [...expanded];
    let tpath = null;

    // 递归展开
    const expand = (arr) => {
      arr.map(n => {
        if (tpath) {
          if (n.tpath?.startsWith(tpath)) {
            if (!nodes.includes(n.uuid)) {
              nodes.push(n.uuid);
            }
          }
        } else {
          if (n.uuid === target) {
            tpath = n.tpath;
            if (!nodes.includes(n.uuid)) {
              nodes.push(n.uuid);
            }
          }
        }
        if (n.children) {
          expand(n.children);
        }
        return n;
      });
    }
    if (target === tree.uuid) {
      if (!nodes.includes(tree.uuid)) {
        nodes.push(tree.uuid);
      }
      tpath = tree.tpath;
      expand(tree.children);
    } else {
      expand(tree.children);
    }
    setExpanded([...nodes]);
    setSelected(target);
  }

  // 收拢全部子节点
  const onCollapseAll = () => {
    setContextMenu(null);

    const target = hoverNode || selected;
    const nodes = [...expanded];
    let tpath = null;

    // 递归
    const collapse = (arr) => {
      arr.map(n => {
        if (tpath) {
          if (n.tpath?.startsWith(tpath)) {
            const i = nodes.indexOf(n.uuid);
            if (i >= 0) {
              nodes.splice(i, 1);
            }
          }
        } else {
          if (n.uuid === target) {
            tpath = n.tpath;
            const i = nodes.indexOf(n.uuid);
            if (i >= 0) {
              nodes.splice(i, 1);
            }
          }
        }
        if (n.children) {
          collapse(n.children);
        }
        return n;
      });
    }
    if (target === tree.uuid) {
      const i = nodes.indexOf(tree.uuid);
      if (i >= 0) {
        nodes.splice(i, 1);
      }
      tpath = tree.tpath;
      collapse(tree.children);
    } else {
      collapse(tree.children);
    }
    setExpanded([...nodes]);
    setSelected(target);
  }

  // 修改名称
  const onChangeName = async val => {
    try {
      await put('/tree/node/name', new URLSearchParams({
        uuid: node.uuid, name: val
      }));
      setNode({ ...node, name: val });
      setReload(true);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改描述
  const onChangeSummary = async val => {
    try {
      await put('/tree/node/summary', new URLSearchParams({
        uuid: node.uuid, summary: val
      }));
      setNode({ ...node, summary: val });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 添加子节点
  const onAddClick = async () => {
    try {
      const resp = await post('/tree/node/add', new URLSearchParams({
        uuid: node.uuid,
      }));
      enqueueSnackbar('添加成功', { variant: 'success' });
      setReload(true);
      setExpanded([...expanded, node.uuid]);
      onNodeSelect(null, resp.uuid);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 渲染树结构
  const renderTree = node => (
    <StyledTreeItem key={node.uuid} nodeId={node.uuid} label={
      <Typography sx={{ py: 1 }} onMouseEnter={() => { setHoverNode(node.uuid) }}>
        {node.name}
      </Typography>
    }>
      {Array.isArray(node.children) ? node.children.map(n => renderTree(n)) : null}
    </StyledTreeItem>
  )

  return (
    <Container as='main' role='main' sx={{ mb: 4 }}>
      <Stack direction='row' alignItems='flex-start' spacing={2} sx={{ mt: 3 }}>
        <Stack sx={{ flex: 4 }} onContextMenu={onNodeContextMenu}>
          {root &&
            <Button sx={{ alignSelf: 'flex-start' }} color='secondary'
              startIcon={<ReplayIcon />} onClick={onResetRootNode}>
              恢复根节点
            </Button>
          }
          <TreeView
            aria-label="层次结构"
            defaultExpanded={['1']}
            defaultParentIcon={<AddIcon />}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<HdrStrongIcon sx={{ color: '#8888' }} />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={onNodeToggle}
            onNodeSelect={onNodeSelect}
            sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {tree && renderTree(tree)}
          </TreeView>
          <Menu
            open={contextMenu !== null}
            onClose={() => setContextMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }>
            <MenuItem onClick={onSetRootNode}>作为根节点显示</MenuItem>
            <MenuItem onClick={onExpandAll}>展开全部子节点</MenuItem>
            <MenuItem onClick={onCollapseAll}>收拢全部子节点</MenuItem>
          </Menu>
        </Stack>
        <Paper variant='outlined' sx={{ flex: 6, px: 3, py: 2 }}>
          <Stack direction='row' alignItems='center'>
            <InplaceInput variant='h6' sx={{ flex: 1 }} fontSize='large'
              text={node?.name || ''} onConfirm={onChangeName}
            />
            <Button onClick={onAddClick}>添加子节点</Button>
            <Button onClick={onAddClick}>修改父节点</Button>
            <Tooltip title='删除选择的节点以及所有的子节点' placement='top'>
              <Button color='error'>删除</Button>
            </Tooltip>
          </Stack>
          <InplaceInput variant='body2' sx={{ flex: 1 }}
            text={node?.summary || ''} onConfirm={onChangeSummary}
          />
          <Divider sx={{ my: 2 }} />
        </Paper>
      </Stack>
    </Container>
  )
}

const StyledTreeItem = styled(props => (<TreeItem {...props} />))(({ theme }) => ({
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 10,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));
