import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values);
      notification.success({ message: 'Login realizado com sucesso' });
      navigate('/clients');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Erro ao realizar login';
      notification.error({ message: 'Falha no login', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>
            Client Manager
          </Title>
          <Text type="secondary">Faça login para continuar</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Informe o usuário' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuário" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Informe a senha' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
