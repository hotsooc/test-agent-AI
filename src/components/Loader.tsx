import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function Loader({ tip = 'Đang tải dữ liệu...' }: { tip?: string }) {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 48,
        color: '#ff4655',
      }}
      spin
    />
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        width: '100%',
        color: '#ffffff',
      }}
    >
      <Spin indicator={antIcon} />
      <p
        style={{
          marginTop: '20px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '2px',
          color: '#8f9499',
          fontSize: '14px',
          textTransform: 'uppercase',
        }}
      >
        {tip}
      </p>
    </div>
  );
}
