import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import ReactPinField from "react-pin-field";
import styles from './index.module.scss';

export default function PinInput(props) {
  const ref = useRef();

  // 设置是否显示明文
  useEffect(() => {
    if (props.hide) {
      ref.current.inputs.forEach(input => input.type = 'password');
    } else {
      ref.current.inputs.forEach(input => input.type = 'text');
    }
  }, [props.hide]);

  // 设置禁用
  useEffect(() => {
    if (props.disabled) {
      ref.current.inputs.forEach(input => input.disabled = true);
    } else {
      ref.current.inputs.forEach(input => input.disabled = false);
    }
  }, [props.disabled]);

  // 设置焦点
  useEffect(() => {
    if (props.focus) {
      ref.current.inputs[0].focus();
    }
  }, [props.focus]);

  // 清除
  useEffect(() => {
    ref.current.inputs.forEach(input => input.value = '');
  }, [props.clear]);

  return (
    <ReactPinField
      ref={ref}
      className={styles.pininput}
      autoComplete="new-password" type='password'
      placeholder='○' length={6} validate='0123456789'
      aria-label="输入代码"
      onChange={props.onChange}
      onComplete={props.onComplete}
    />
  )
}

PinInput.propTypes = {
  hide: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  focus: PropTypes.bool,
  clear: PropTypes.any,
  onChange: PropTypes.func,
  onComplete: PropTypes.func.isRequired,
}

PinInput.defaultProps = {
  hide: true,
  disabled: false,
  focus: false,
  clear: false,
  onChange: () => {},
}
