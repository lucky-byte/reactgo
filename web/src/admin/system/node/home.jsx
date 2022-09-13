import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BlockIcon from '@mui/icons-material/Block';
import CommitIcon from '@mui/icons-material/Commit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { useConfirm } from 'material-ui-confirm';
import InplaceInput from '~/comp/inplace-input';
import Splitter from '../../../comp/splitter';
import progressState from "~/state/progress";
import { useSetCode } from "~/state/code";
import useTitle from "~/hook/title";
import usePageData from '~/hook/pagedata';
import { get, post, put } from '~/lib/rest';
import StyledTreeItem from './treeitem';
import ChangeParent from './parent';

export default function Home() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const setProgress = useSetRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const [root, setRoot] = useState('');
  const [tree, setTree] = useState(null);
  const [node, setNode] = useState({});
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [hoverNode, setHoverNode] = useState('');
  const [reload, setReload] = useState(true);
  const [detail, setDetail] = useState(false);
  const [nodeLoading, setNodeLoading] = useState(true);

  useTitle('层级管理');
  useSetCode(9060);

  // 保存 splitter 的 sizes
  const onSplitterResize = (_, newSizes) => {
    localStorage.setItem('tree.splitter.sizes', JSON.stringify(newSizes));
  }

  // 恢复之前存储的 sizes
  let splitSizes = [30,70];
  try {
    const sizes = localStorage.getItem('tree.splitter.sizes');
    if (sizes) {
      splitSizes = JSON.parse(sizes)
    }
  } catch (err) {
    console.error(err.message);
  }

  // 选择节点
  const onNodeSelect = useCallback(async (e, nodeIds) => {
    const timer = setTimeout(() => setNodeLoading(true), 500);

    try {
      setSelected(nodeIds);
      setPageData('selected', nodeIds);

      const params = new URLSearchParams({ uuid: nodeIds });
      const resp = await get('/system/node/info?' + params.toString())
      setNode(resp);
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      clearTimeout(timer);
      setNodeLoading(false);
    }
  }, [enqueueSnackbar, setPageData]);

  // 展开节点
  const onNodeToggle = (e, nodeIds) => {
    setExpanded(nodeIds);
    setPageData('expanded', nodeIds);
  }

  // 加载树结构
  useEffect(() => {
    (async () => {
      try {
        if (reload) {
          setProgress(true);

          const params = new URLSearchParams({ root: root });
          const resp = await get('/system/node/?' + params.toString());

          if (resp.tree) {
            setTree(resp.tree || null);

            // 恢复之前展开的状态
            if (!selected) {
              const saved = pageData('selected');
              if (saved) {
                onNodeSelect(null, saved)
              } else {
                onNodeSelect(null, resp.tree.uuid)
              }
            }
            if (expanded.length === 0) {
              const saved = pageData('expanded');
              if (saved && Array.isArray(saved)) {
                setExpanded(saved);
              } else {
                setExpanded([resp.tree.uuid]);
              }
            }
          }
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setReload(false);
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, reload, onNodeSelect, selected, root, setProgress,
    expanded, pageData
  ]);

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

    // 添加一个展开的节点
    const addNode = uuid => {
      if (!nodes.includes(uuid)) {
        nodes.push(uuid);
      }
    }

    // 递归展开
    const expand = (arr) => {
      arr.map(n => {
        if (tpath) {
          if (n.tpath?.startsWith(tpath)) {
            addNode(n.uuid);
          }
        } else {
          if (n.uuid === target) {
            addNode(n.uuid);
            tpath = n.tpath;
          }
        }
        if (n.children) {
          expand(n.children);
        }
        return n;
      });
    }
    if (target === tree.uuid) {
      addNode(tree.uuid);
      tpath = tree.tpath;
      expand(tree.children);
    } else {
      expand(tree.children);
    }
    setExpanded(nodes);
    setSelected(target);
    setPageData('expanded', nodes, 'selected', target);
  }

  // 收拢全部子节点
  const onCollapseAll = () => {
    setContextMenu(null);

    const target = hoverNode || selected;
    const nodes = [...expanded];
    let tpath = null;

    // 删除一个展开的节点
    const removeNode = uuid => {
      const i = nodes.indexOf(uuid);
      if (i >= 0) {
        nodes.splice(i, 1);
      }
    }

    // 递归
    const collapse = (arr) => {
      arr.map(n => {
        if (tpath) {
          if (n.tpath?.startsWith(tpath)) {
            removeNode(n.uuid);
          }
        } else {
          if (n.uuid === target) {
            removeNode(n.uuid);
            tpath = n.tpath;
          }
        }
        if (n.children) {
          collapse(n.children);
        }
        return n;
      });
    }
    if (target === tree.uuid) {
      removeNode(tree.uuid);
      tpath = tree.tpath;
      collapse(tree.children);
    } else {
      collapse(tree.children);
    }
    setExpanded(nodes);
    setSelected(target);
    setPageData('expanded', nodes, 'selected', target);
  }

  // 移到最前
  const onMoveTop = async () => {
    setContextMenu(null);

    try {
      const target = hoverNode || selected;

      await put('/system/node/top', new URLSearchParams({
        uuid: target, _noop: true,
      }));
      setReload(true);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 移到最后
  const onMoveBottom = async () => {
    setContextMenu(null);

    try {
      const target = hoverNode || selected;

      await put('/system/node/bottom', new URLSearchParams({
        uuid: target, _noop: true,
      }));
      setReload(true);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 上移
  const onMoveUp = async () => {
    setContextMenu(null);

    try {
      const target = hoverNode || selected;

      await put('/system/node/up', new URLSearchParams({
        uuid: target, _noop: true,
      }));
      setReload(true);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 下移
  const onMoveDown = async () => {
    setContextMenu(null);

    try {
      const target = hoverNode || selected;

      await put('/system/node/down', new URLSearchParams({
        uuid: target, _noop: true,
      }));
      setReload(true);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改名称
  const onChangeName = async val => {
    try {
      const _audit = `修改节点的名称 ${node.name} => ${val}`;

      await put('/system/node/name', new URLSearchParams({
        uuid: node.uuid, name: val, _audit,
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
      const _audit = `修改节点 ${node.name} 的描述`;

      await put('/system/node/summary', new URLSearchParams({
        uuid: node.uuid, summary: val, _audit,
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
      const _audit = `添加层级节点 ${node.name} 的子节点`;

      await post('/system/node/add', new URLSearchParams({
        uuid: node.uuid, _audit,
      }));
      enqueueSnackbar('添加成功', { variant: 'success' });
      setReload(true);
      setExpanded([...expanded, node.uuid]);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 禁用
  const onDisabledClick = async () => {
    try {
      await confirm({
        description: '这将递归禁用该节点以及其下所有的子节点，确定要继续吗？',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `禁用层级节点 ${node.name}`;

      await put('/system/node/disable', new URLSearchParams({
        uuid: node.uuid, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setReload(true);
      setNode({ ...node, disabled: true });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 启用
  const onEnabledClick = async () => {
    try {
      await confirm({
        description: '这将递归启用该节点以及其下所有的子节点，确定要继续吗？',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `启用层级节点 ${node.name}`;

      await put('/system/node/enable', new URLSearchParams({
        uuid: node.uuid, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setReload(true);
      setNode({ ...node, disabled: false });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 删除
  const onDeleteClick = async () => {
    try {
      await confirm({
        description: '这将递归删除该节点以及其下所有的子节点，确定要继续吗？',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'error' },
        contentProps: { p: 8 },
      });
      const _audit = `删除层级节点 ${node.name}`;

      await put('/system/node/delete', new URLSearchParams({
        uuid: node.uuid, _audit,
      }));
      enqueueSnackbar('删除成功', { variant: 'success' });
      setReload(true);

      setTimeout(() => {
        setPageData('selected', '');
        setSelected('');
      }, 500);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 渲染树结构
  const renderTree = node => (
    <StyledTreeItem key={node.uuid} nodeId={node.uuid}
      endIcon={
        node.disabled ?  <BlockIcon color='disabled' /> : <CommitIcon />
      }
      label={
        node.disabled ?
          <Typography sx={{ py: '4px' }} color='gray' variant='body2'
            onMouseEnter={() => { setHoverNode(node.uuid) }}>
            {node.name}
          </Typography>
          :
          <Typography sx={{ py: '4px' }} variant='body2'
            onMouseEnter={() => { setHoverNode(node.uuid) }}>
            {node.name}
          </Typography>
      }>
      {Array.isArray(node.children) ? node.children.map(n => renderTree(n)) : null}
    </StyledTreeItem>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Container as='main' role='main' sx={{ mb: 4, pt: 3 }}>
        <Splitter initialSizes={splitSizes} minWidths={[200, 400]}
          onResizeFinished={onSplitterResize}>
          <Stack onContextMenu={onNodeContextMenu}>
            {root &&
              <Button sx={{ alignSelf: 'flex-start' }} color='secondary'
                startIcon={<ReplayIcon />} onClick={onResetRootNode}>
                恢复根节点
              </Button>
            }
            <TreeView
              aria-label="层次结构"
              defaultExpanded={[]}
              defaultParentIcon={<AddIcon />}
              defaultCollapseIcon={<ArrowDropDownIcon />}
              defaultExpandIcon={<ArrowRightIcon />}
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
              <Divider />
              <MenuItem onClick={onMoveTop}>
                <ListItemIcon>
                  <VerticalAlignTopIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>移到最前</ListItemText>
              </MenuItem>
              <MenuItem onClick={onMoveUp}>
                <ListItemIcon>
                  <ArrowUpwardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>上移</ListItemText>
              </MenuItem>
              <MenuItem onClick={onMoveDown}>
                <ListItemIcon>
                  <ArrowDownwardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>下移</ListItemText>
              </MenuItem>
              <MenuItem onClick={onMoveBottom}>
                <ListItemIcon>
                  <VerticalAlignBottomIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>移到最后</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
          <Paper variant='outlined' sx={{ px: 3, py: 2 }}>
            <Stack direction='row' alignItems='center'>
              {nodeLoading ?
                <Typography variant="h6" sx={{ flex: 1 }}><Skeleton /></Typography>
                :
                <InplaceInput variant='h6' sx={{ flex: 1 }} fontSize='large'
                  text={node?.name || ''} onConfirm={onChangeName}
                  disabled={node.disabled}
                />
              }
              {!node.disabled && <Button onClick={onAddClick}>添加子节点</Button>}
              {(!node.disabled && node.nlevel > 1) &&
                <ChangeParent name={node.name} uuid={node.uuid} tpath={node.tpath}
                  reload={setReload}
                />
              }
              {node.disabled ?
                <Button onClick={onEnabledClick} color='warning'>启用</Button>
                :
                <Button onClick={onDisabledClick} color='warning'>禁用</Button>
              }
              <Button color='error' onClick={onDeleteClick}>删除</Button>
            </Stack>
            {nodeLoading ?
              <Typography variant="body2" sx={{ flex: 1 }}><Skeleton /></Typography>
              :
              <InplaceInput variant='body2' sx={{ flex: 1 }}
                text={node?.summary || ''} onConfirm={onChangeSummary}
                disabled={node.disabled}
              />
            }
            <Stack direction='row' alignItems='center' sx={{ mt: 1 }}>
              <Typography variant='caption' color='gray'>
                {nodeLoading ? <Skeleton /> : `第 ${node.nlevel || 0} 级`}
              </Typography>
              <IconButton aria-label='展开' sx={{ p: 0, color: '#8888', ml: 1 }}
                onClick={() => { setDetail(!detail) }}>
                {detail ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={detail}>
              <Stack>
                <Typography variant='caption' color='gray'>
                  创建时间: {dayjs(node.create_at).format('YYYY年MM月DD日 HH:mm:ss')}
                </Typography>
                <Typography variant='caption' color='gray'>
                  修改时间: {dayjs(node.update_at).format('YYYY年MM月DD日 HH:mm:ss')}
                </Typography>
                {process.env.NODE_ENV === 'development' &&
                  <>
                    <Typography variant='caption' color='gray'>
                      排序序号: {node.sortno}
                    </Typography>
                    <Typography variant='caption' color='gray'>
                      {node.tpath}
                    </Typography>
                  </>
                }
              </Stack>
            </Collapse>
            <Paper variant='outlined' sx={{ p: 2, mt: 2 }}>
              <Stack direction='row' alignItems='center'>
                <Stack sx={{ flex: 1 }}>
                  <Typography variant='h6' disabled={node.disabled}>绑定用户</Typography>
                  <Typography variant='body2' disabled={node.disabled}>
                    绑定的用户可以访问该节点(包含所有子节点)下的资源
                  </Typography>
                  <Stack direction='row' mt={1} spacing={1}>
                    {node.users?.map(user => (
                      <Chip label={user} variant='outlined' size='small' />
                    ))}
                  </Stack>
                </Stack>
                <Button disabled={node.disabled} variant='contained' onClick={() => {
                  navigate('user', { state: { node }});
                }}>
                  查询及绑定
                </Button>
              </Stack>
            </Paper>
          </Paper>
        </Splitter>
      </Container>
    </DndProvider>
  )
}
