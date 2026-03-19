import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cepService, clientService } from '../api/services';
import { maskCep, maskCpf, maskPhone } from '../utils/masks';

const phoneTypes = [
  { value: 'MOBILE', label: 'Celular' },
  { value: 'RESIDENTIAL', label: 'Residencial' },
  { value: 'COMMERCIAL', label: 'Comercial' },
];

export default function ClientFormModal({ open, client, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const { notification } = App.useApp();
  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      form.setFieldsValue({
        name: client.name,
        cpf: client.cpf,
        address: {
          zipCode: client.address?.zipCode || '',
          street: client.address?.street || '',
          neighborhood: client.address?.neighborhood || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          complement: client.address?.complement || '',
        },
        phones: client.phones?.map((ph) => ({
          type: ph.type,
          number: ph.number,
        })) || [{ type: 'MOBILE', number: '' }],
        emails: client.emails?.map((em) => ({
          address: em.address,
        })) || [{ address: '' }],
      });
    } else {
      form.setFieldsValue({
        phones: [{ type: 'MOBILE', number: '' }],
        emails: [{ address: '' }],
      });
    }
  }, [client, form]);

  // ── Auto CEP lookup with debounce ──
  const cepTimerRef = useRef(null);
  const lastCepRef = useRef('');

  const lookupCep = useCallback(async (digits) => {
    if (digits.length !== 8 || digits === lastCepRef.current) return;
    lastCepRef.current = digits;

    setCepLoading(true);
    try {
      const { data } = await cepService.lookup(digits);
      form.setFieldsValue({
        address: {
          zipCode: data.zipCode,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          complement: data.complement || form.getFieldValue(['address', 'complement']),
        },
      });
      notification.success({ message: 'Endereço preenchido automaticamente' });
    } catch (error) {
      const msg = error.response?.data?.message || 'CEP não encontrado';
      notification.error({ message: 'Erro na consulta de CEP', description: msg });
    } finally {
      setCepLoading(false);
    }
  }, [form, notification]);

  const handleCepChange = useCallback((maskedValue) => {
    const digits = maskedValue.replace(/\D/g, '');
    if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
    if (digits.length === 8) {
      cepTimerRef.current = setTimeout(() => lookupCep(digits), 400);
    }
    return maskedValue;
  }, [lookupCep]);

  useEffect(() => {
    return () => {
      if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
    };
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        await clientService.update(client.id, values);
        notification.success({ message: 'Cliente atualizado com sucesso' });
      } else {
        await clientService.create(values);
        notification.success({ message: 'Cliente criado com sucesso' });
      }
      onClose(true);
    } catch (error) {
      const data = error.response?.data;
      const description = data?.errors?.join('\n') || data?.message || 'Verifique os dados e tente novamente';
      notification.error({
        message: isEditing ? 'Erro ao atualizar' : 'Erro ao criar',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* ── Dados pessoais ── */}
        <Form.Item
          name="name"
          label="Nome"
          rules={[
            { required: true, message: 'Nome é obrigatório' },
            { min: 3, message: 'Mínimo 3 caracteres' },
            { max: 100, message: 'Máximo 100 caracteres' },
          ]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item
          name="cpf"
          label="CPF"
          rules={[{ required: true, message: 'CPF é obrigatório' }]}
          getValueFromEvent={(e) => maskCpf(e.target.value)}
        >
          <Input placeholder="000.000.000-00" maxLength={14} />
        </Form.Item>

        {/* ── Endereço ── */}
        <Divider orientation="left">Endereço</Divider>

        <Form.Item
          name={['address', 'zipCode']}
          label="CEP"
          rules={[{ required: true, message: 'CEP obrigatório' }]}
          getValueFromEvent={(e) => handleCepChange(maskCep(e.target.value))}
        >
          <Input
            placeholder="00000-000"
            maxLength={9}
            suffix={cepLoading ? <LoadingOutlined spin /> : null}
          />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name={['address', 'street']}
            label="Logradouro"
            rules={[{ required: true, message: 'Obrigatório' }]}
            style={{ flex: 2 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['address', 'complement']}
            label="Complemento"
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name={['address', 'neighborhood']}
            label="Bairro"
            rules={[{ required: true, message: 'Obrigatório' }]}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['address', 'city']}
            label="Cidade"
            rules={[{ required: true, message: 'Obrigatório' }]}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['address', 'state']}
            label="UF"
            rules={[
              { required: true, message: 'Obrigatório' },
              { len: 2, message: '2 caracteres' },
            ]}
            style={{ width: 80 }}
          >
            <Input maxLength={2} style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </Space>

        {/* ── Telefones ── */}
        <Divider orientation="left">Telefones</Divider>

        <Form.List
          name="phones"
          rules={[
            {
              validator: async (_, phones) => {
                if (!phones || phones.length === 0) {
                  return Promise.reject('Adicione ao menos um telefone');
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="start" style={{ width: '100%', marginBottom: 8 }}>
                  <Form.Item
                    {...rest}
                    name={[name, 'type']}
                    rules={[{ required: true, message: 'Tipo obrigatório' }]}
                    style={{ width: 160 }}
                  >
                    <Select options={phoneTypes} placeholder="Tipo" />
                  </Form.Item>
                  <Form.Item
                    {...rest}
                    name={[name, 'number']}
                    rules={[{ required: true, message: 'Número obrigatório' }]}
                    style={{ flex: 1 }}
                    getValueFromEvent={(e) => maskPhone(e.target.value)}
                  >
                    <Input placeholder="(00) 00000-0000" maxLength={15} />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: '#ff4d4f', marginTop: 8 }}
                    />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ type: 'MOBILE', number: '' })} icon={<PlusOutlined />} block>
                  Adicionar telefone
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* ── E-mails ── */}
        <Divider orientation="left">E-mails</Divider>

        <Form.List
          name="emails"
          rules={[
            {
              validator: async (_, emails) => {
                if (!emails || emails.length === 0) {
                  return Promise.reject('Adicione ao menos um e-mail');
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="start" style={{ width: '100%', marginBottom: 8 }}>
                  <Form.Item
                    {...rest}
                    name={[name, 'address']}
                    rules={[
                      { required: true, message: 'E-mail obrigatório' },
                      { type: 'email', message: 'E-mail inválido' },
                    ]}
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="email@exemplo.com" />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: '#ff4d4f', marginTop: 8 }}
                    />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ address: '' })} icon={<PlusOutlined />} block>
                  Adicionar e-mail
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* ── Ações ── */}
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => onClose(false)}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar Cliente'}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
