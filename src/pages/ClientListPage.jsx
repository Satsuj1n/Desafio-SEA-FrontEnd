import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Card, Popconfirm, Tag, App } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { clientService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import ClientFormModal from './ClientFormModal';

export default function ClientListPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const { isAdmin } = useAuth();
  const { notification } = App.useApp();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientService.list();
      setClients(data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar clientes',
        description: error.response?.data?.message || 'Tente novamente',
      });
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id) => {
    try {
      await clientService.delete(id);
      notification.success({ message: 'Cliente excluído com sucesso' });
      fetchClients();
    } catch (error) {
      notification.error({
        message: 'Erro ao excluir cliente',
        description: error.response?.data?.message || 'Tente novamente',
      });
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingClient(record);
    setModalOpen(true);
  };

  const handleModalClose = (saved) => {
    setModalOpen(false);
    setEditingClient(null);
    if (saved) fetchClients();
  };

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      (c.emails?.[0]?.address || '').toLowerCase().includes(term)
    );
  });

  const phoneTypeLabels = {
    MOBILE: { label: 'Celular', color: 'blue' },
    RESIDENTIAL: { label: 'Residencial', color: 'green' },
    COMMERCIAL: { label: 'Comercial', color: 'orange' },
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      width: 160,
    },
    {
      title: 'E-mail',
      dataIndex: 'emails',
      render: (emails) => emails?.map((e) => e.address).join(', ') || '-',
      responsive: ['md'],
    },
    {
      title: 'Telefone',
      dataIndex: 'phones',
      render: (phones) =>
        phones?.map((ph) => (
          <div key={ph.id}>
            <Tag color={phoneTypeLabels[ph.type]?.color || 'default'} style={{ marginBottom: 2 }}>
              {phoneTypeLabels[ph.type]?.label || ph.type}
            </Tag>
            {ph.number}
          </div>
        )) || '-',
      responsive: ['lg'],
    },
    {
      title: 'Cidade/UF',
      render: (_, record) =>
        record.address
          ? `${record.address.city}/${record.address.state}`
          : '-',
      responsive: ['lg'],
    },
    ...(isAdmin
      ? [
          {
            title: 'Ações',
            width: 120,
            render: (_, record) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  size="small"
                />
                <Popconfirm
                  title="Excluir cliente?"
                  description="Esta ação não pode ser desfeita."
                  onConfirm={() => handleDelete(record.id)}
                  okText="Excluir"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Card
        title="Clientes"
        extra={
          <Space>
            <Input
              placeholder="Buscar por nome, CPF ou e-mail"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchClients} />
            {isAdmin && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Novo Cliente
              </Button>
            )}
          </Space>
        }
      >
        <Table
          dataSource={filteredClients}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} cliente(s)`,
          }}
          locale={{ emptyText: 'Nenhum cliente encontrado' }}
        />
      </Card>

      {modalOpen && (
        <ClientFormModal
          open={modalOpen}
          client={editingClient}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
