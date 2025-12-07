import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sessao, Cliente } from '@/types';
import { toast } from 'sonner';
import { createSessao, updateSessao, getClientes } from '@/services/api';
import { format } from 'date-fns';
import { User, Calendar, PenSquare, ClipboardList } from 'lucide-react';

interface SessaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  sessao?: Sessao;
  initialDate?: Date;
  initialClienteId?: number;
  onSave: () => void;
}

const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="space-y-4">
    <h3 className="flex items-center text-lg font-semibold text-primary border-b border-primary/20 pb-2 mb-4">
      <Icon className="w-5 h-5 mr-3" />
      {title}
    </h3>
    {children}
  </div>
);

const SessaoForm: React.FC<SessaoFormProps> = ({ isOpen, onClose, sessao, initialDate, initialClienteId, onSave }) => {
  const [formData, setFormData] = useState<Partial<Sessao>>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (isOpen) {
      getClientes().then(setClientes).catch(() => toast.error("Falha ao carregar clientes."));

      if (sessao) {
        setFormData({
          ...sessao,
          dataHoraInicio: format(new Date(sessao.dataHoraInicio), "yyyy-MM-dd'T'HH:mm"),
          dataHoraFim: format(new Date(sessao.dataHoraFim), "yyyy-MM-dd'T'HH:mm"),
        });
      } else {
        setFormData({
          nome: 'Sessão de Fisioterapia',
          dataHoraInicio: format(initialDate || new Date(), "yyyy-MM-dd'T'09:00'"),
          dataHoraFim: format(initialDate || new Date(), "yyyy-MM-dd'T'10:00'"),
          status: 'AGENDADA',
          notasSessao: '',
          clienteId: initialClienteId,
        } as Partial<Sessao>);
      }
    }
  }, [sessao, initialDate, initialClienteId, isOpen]);

  const handleChange = (field: keyof Sessao, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.dataHoraInicio || !formData.dataHoraFim) {
      toast.error('Cliente e datas são obrigatórios.');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        nome: formData.nome || 'Sessão de Fisioterapia'
      };

      if (sessao && sessao.id) {
        await updateSessao(sessao.id, dataToSave as Sessao);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await createSessao(dataToSave as Omit<Sessao, 'id'>);
        toast.success('Sessão agendada com sucesso!');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar sessão.');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] flex flex-col p-0 bg-card">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl text-primary">{sessao ? 'Editar Sessão' : 'Agendar Nova Sessão'}</DialogTitle>
          <DialogDescription>Preencha os detalhes para agendar a sessão.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          <FormSection title="Detalhes do Agendamento" icon={Calendar}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Sessão</Label>
                <div className="relative flex items-center">
                  <PenSquare className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="nome" value={formData.nome || ''} onChange={e => handleChange('nome', e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <Select
                  value={formData.clienteId ? String(formData.clienteId) : ''}
                  onValueChange={value => handleChange('clienteId', Number(value))}
                >
                  <SelectTrigger>
                    <div className='flex items-center'>
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Selecione um cliente" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataHoraInicio">Início</Label>
                  <Input id="dataHoraInicio" type="datetime-local" value={formData.dataHoraInicio || ''} onChange={e => handleChange('dataHoraInicio', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataHoraFim">Fim</Label>
                  <Input id="dataHoraFim" type="datetime-local" value={formData.dataHoraFim || ''} onChange={e => handleChange('dataHoraFim', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ''} onValueChange={value => handleChange('status', value)}>
                  <SelectTrigger>
                    <div className='flex items-center'>
                      <ClipboardList className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENDADA">Agendada</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notasSessao">Notas Adicionais</Label>
                <Textarea id="notasSessao" value={formData.notasSessao || ''} onChange={e => handleChange('notasSessao', e.target.value)} placeholder="Adicione observações sobre a sessão..." className="bg-muted/50" />
              </div>

            </div>
          </FormSection>
        </form>

        <DialogFooter className="p-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {sessao ? 'Salvar Alterações' : 'Agendar Sessão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessaoForm;