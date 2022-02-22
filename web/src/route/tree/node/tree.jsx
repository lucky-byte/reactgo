import { useEffect, useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HdrWeakIcon from '@mui/icons-material/HdrWeak';
import HdrStrongIcon from '@mui/icons-material/HdrStrong';
import { useSnackbar } from 'notistack';
import { get } from '~/rest';

export default function Tree() {
  const { enqueueSnackbar } = useSnackbar();
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/tree/node/');
        setNodes(resp.nodes || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const renderTree = node => (
    <StyledTreeItem key={node.uuid} nodeId={node.uuid} label={
      <Typography sx={{ py: 1 }}>{node.name}</Typography>
    }>
    </StyledTreeItem>
  )

  return (
    <TreeView
      aria-label="层次结构"
      defaultExpanded={['1']}
      defaultParentIcon={<AddIcon />}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<HdrStrongIcon sx={{ color: '#8888' }} />}
      sx={{ flexGrow: 1, maxWidth: 300, overflowY: 'auto' }}>
      {nodes.length > 0 && renderTree(nodes[0])}

      {/* <StyledTreeItem nodeId="1" label="根节点">
        <TreeItem nodeId="2" label="Hello" endIcon={<AddIcon />}/>
        <TreeItem nodeId="3" label="Subtree with children" sx={{py:1}}>
          <StyledTreeItem nodeId="6" label="Hello" />
          <StyledTreeItem nodeId="7" label="全是中文字符不知道回事什么样子，试一试才能知道">
            <TreeItem nodeId="9" label={
              <Typography sx={{py:1}}>subchild</Typography>
            }>
              <Typography sx={{py:1}}>subchild</Typography>
            <TreeItem nodeId="10" label="Child 2" />
            <TreeItem nodeId="11" label="全是中文字符不知道回事什么样子，试一试才 3" />
            </TreeItem>
          </StyledTreeItem>
          <StyledTreeItem nodeId="8" label="Hello" />
        </TreeItem>
        <StyledTreeItem nodeId="4" label="World" />
        <StyledTreeItem nodeId="5" label="Something something" />
      </StyledTreeItem> */}
    </TreeView>
  )
}

const StyledTreeItem = styled(props => (<TreeItem {...props} />))(({ theme }) => ({
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 10,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));
