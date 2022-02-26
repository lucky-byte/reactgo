import { forwardRef } from 'react';
import { alpha, styled } from '@mui/material/styles';
import TreeItem, { treeItemClasses, useTreeItem } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';

// 加上展开后的虚线
const StyledTreeItem = styled(props => (
  <TreeItem ContentComponent={CustomContent} {...props} />
))(({ theme }) => ({
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 10,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export default StyledTreeItem;

// 只能通过点击图标开展
const CustomContent = forwardRef(function CustomContent(props, ref) {
  const {
    classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon,
  } = props;

  const {
    disabled, expanded, selected, focused,
    handleExpansion, handleSelection, preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
  };

  return (
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref}>
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <Typography
        onClick={handleSelectionClick}
        component="div"
        className={classes.label}>
        {label}
      </Typography>
    </div>
  );
});
