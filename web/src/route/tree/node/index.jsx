import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { alpha, styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HdrStrongIcon from '@mui/icons-material/HdrStrong';
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import titleState from "~/state/title";
import { get, post } from '~/rest';

export default function Node() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [tree, setTree] = useState(null);
  const [node, setNode] = useState({});
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState('');
  const [reload, setReload] = useState(true);

  useEffect(() => { setTitle('层级管理'); }, [setTitle]);

  // 选择节点
  const onNodeSelect = useCallback(async (e, nodeIds) => {
    console.log('nodeid: ', nodeIds)
    setSelected(nodeIds);
    try {
      const params = new URLSearchParams({ uuid: nodeIds });
      const resp = await get('/tree/node/info?' + params.toString())
      setNode(resp);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    (async () => {
      try {
        if (reload) {
          const resp = await get('/tree/node/');

          setTree(resp?.tree || null);
          onNodeSelect(null, resp.tree?.uuid)
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setReload(false);
      }
    })();
  }, [enqueueSnackbar, reload, onNodeSelect]);

  // 展开节点
  const onNodeToggle = (e, nodeIds) => {
    setExpanded(nodeIds);
  }

  // 修改名称
  const onChangeName = (uuid, val) => {
    // ...
    console.log(uuid, val)
  }

  // 添加子节点
  const onAddClick = async () => {
    try {
      await post('/tree/node/add', new URLSearchParams({
        uuid: node.uuid,
      }));
      enqueueSnackbar('添加成功', { variant: 'success' });
      setReload(true);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 渲染树结构
  const renderTree = node => (
    <StyledTreeItem key={node.uuid} nodeId={node.uuid} label={
      <Typography sx={{ py: 1 }}>{node.name}</Typography>
    }>
      {Array.isArray(node.children) ? node.children.map(n => renderTree(n)) : null}
    </StyledTreeItem>
  )

  return (
    <Container as='main' role='main' sx={{ mb: 4 }}>
      <Stack direction='row' alignItems='flex-start' spacing={2} sx={{ mt: 2 }}>
        <Box sx={{ flex: 4 }}>
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
        </Box>
        <Paper variant='outlined' sx={{ flex: 8, px: 3, py: 2 }}>
          <Stack direction='row' alignItems='center'>
            <InplaceInput variant='h6' sx={{ flex: 1 }} fontSize='large'
              text={node?.name || ''}
              onConfirm={val => onChangeName(selected?.uuid, val)}
            />
            <Button onClick={onAddClick}>添加子节点</Button>
            <Tooltip title='删除选择的节点以及所有的子节点' placement='top'>
              <Button color='error'>删除</Button>
            </Tooltip>
          </Stack>
          <InplaceInput variant='body2' sx={{ flex: 1 }}
            text={node?.summary || ''}
            onConfirm={val => onChangeName(selected?.uuid, val)}
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
