import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TreeView from '@mui/lab/TreeView';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BlockIcon from '@mui/icons-material/Block';
import CommitIcon from '@mui/icons-material/Commit';
import { useSnackbar } from 'notistack';
import { get, put } from '~/lib/rest';
import StyledTreeItem from './treeitem';

export default function Parent(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState('');

  const { uuid, name, tpath, reload } = props;

  const expandAll = (nodes, children) => {
    children.map(n => {
      nodes.push(n.uuid);
      if (n.children) {
        expandAll(nodes, n.children);
      }
      return n;
    });
  }

  const onOpenClick = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ uuid });
      const resp = await get('/system/node/?' + params.toString());
      if (resp.tree) {
        setTree(resp.tree);

        const nodes = [resp.tree.uuid];
        expandAll(nodes, resp.tree.children);
        setExpanded(nodes);
        setOpen(true);
      }
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 选择节点
  const onNodeSelect = (e, nodeIds) => {
    setSelected(nodeIds);
  }

  // 展开节点
  const onNodeToggle = (e, nodeIds) => {
    setExpanded(nodeIds);
  }

  // 关闭对话框
  const onClose = () => {
    setSelected('');
    setOpen(false);
  }

  // 确定
  const onOK = async () => {
    try {
      if (!selected) {
        return enqueueSnackbar('请选择父节点', { variant: 'warning' });
      }
      const _audit = `修改节点 ${name} 的父节点`;

      await put('/system/node/parent', new URLSearchParams({
        uuid, parent: selected, _audit,
      }));
      enqueueSnackbar('修改成功', { variant: 'success' });
      reload(true);
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 渲染树结构
  const renderTree = node => {
    if (node.tpath.startsWith(tpath) || node.disabled) {
      return (
        <StyledTreeItem key={node.uuid} nodeId={node.uuid} disabled
          endIcon={<BlockIcon />}
          label={
            <Typography sx={{ py: '4px' }} variant='body2'>{node.name}</Typography>
          }>
          {Array.isArray(node.children) ? node.children.map(n => renderTree(n)) : null}
        </StyledTreeItem>
      )
    }
    return (
      <StyledTreeItem key={node.uuid} nodeId={node.uuid}
        endIcon={<CommitIcon />}
        label={
          <Typography sx={{ py: '4px' }} variant='body2'>{node.name}</Typography>
        }>
        {Array.isArray(node.children) ? node.children.map(n => renderTree(n)) : null}
      </StyledTreeItem>
    )
  }

  return (
    <>
      <LoadingButton loading={loading} onClick={onOpenClick}>修改父节点</LoadingButton>
      <Dialog onClose={onClose} open={open} maxWidth='sm' fullWidth>
        <DialogTitle>修改父节点
          <DialogContentText>请选择 {name} 的父节点</DialogContentText>
        </DialogTitle>
        <DialogContent>
          <Paper variant='outlined' sx={{ mt: 1, py: 1 }}>
            <TreeView
              aria-label="层次结构"
              defaultExpanded={['1']}
              defaultCollapseIcon={<ArrowDropDownIcon />}
              defaultExpandIcon={<ArrowRightIcon />}
              expanded={expanded}
              selected={selected}
              onNodeToggle={onNodeToggle}
              onNodeSelect={onNodeSelect}
              sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {tree && renderTree(tree)}
            </TreeView>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>取消</Button>
          <Button variant='contained' onClick={onOK}>确定</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
