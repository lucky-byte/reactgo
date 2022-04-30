// 图片
export default function Image(props) {
  return (
    <img alt='图片' src={props.src} style={{
      objectFit: 'contain', maxWidth: '100%',
    }} />
  )
}
