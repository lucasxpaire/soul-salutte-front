import React, { useState, useEffect, useMemo } from 'react';
import { Sessao, Cliente } from '@/types';
import { getSessoes, getClientes, deleteSessao } from '@/services/api';
import { format, isToday, isTomorrow, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CalendarioPageProps {
  onAddSessao: (date: Date, clienteId?: number) => void;
  onEditSessao: (sessao: Sessao) => void;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

const CalendarioPage: React.FC<CalendarioPageProps> = ({ onAddSessao, onEditSessao }) => {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessaoToDelete, setSessaoToDelete] = useState<number | null>(null);
  const [filterView, setFilterView] = useState<FilterType>('week');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessoesData, clientesData] = await Promise.all([
        getSessoes(),
        getClientes(),
      ]);
      setSessoes(sessoesData);
      setClientes(clientesData);
    } catch (error) {
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!sessaoToDelete) return;

    try {
      await deleteSessao(sessaoToDelete);
      toast.success('Agendamento removido com sucesso!');
      setSessoes(sessoes.filter(s => s.id !== sessaoToDelete));
    } catch (error) {
      toast.error('Erro ao remover agendamento.');
    } finally {
      setSessaoToDelete(null);
    }
  };

  // Mapa de clientes para fácil acesso ao nome. Convertendo ID para string para garantir match segurança.
  const clienteMap = useMemo(() => new Map(clientes.map(c => [String(c.id), c.nome])), [clientes]);

  // Filtragem e Agrupamento
  const sessoesFiltradas = useMemo(() => {
    return sessoes.filter(sessao => {
      const dataSessao = parseISO(sessao.dataHoraInicio);
      switch (filterView) {
        case 'today': return isToday(dataSessao);
        case 'week': return isThisWeek(dataSessao, { weekStartsOn: 0 }); // Domingo como inicio
        case 'month': return isThisMonth(dataSessao);
        case 'all': return true;
        default: return true;
      }
    });
  }, [sessoes, filterView]);

  const sessoesAgrupadas = useMemo(() => {
    const grupos: { [key: string]: Sessao[] } = {};

    // Ordenar sessões por data
    const sessoesOrdenadas = [...sessoesFiltradas].sort((a, b) =>
      new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
    );

    sessoesOrdenadas.forEach(sessao => {
      const data = parseISO(sessao.dataHoraInicio);
      const dataKey = format(data, 'yyyy-MM-dd');

      if (!grupos[dataKey]) {
        grupos[dataKey] = [];
      }
      grupos[dataKey].push(sessao);
    });

    return grupos;
  }, [sessoesFiltradas]);

  const getDayLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas sessões e consultas.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex bg-muted p-1 rounded-lg self-start">
            <button
              onClick={() => setFilterView('today')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterView === 'today' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFilterView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterView === 'week' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setFilterView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterView === 'month' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mês
            </button>
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterView === 'all' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Todos
            </button>
          </div>

          <Button onClick={() => onAddSessao(new Date())} className="shrink-0 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : Object.keys(sessoesAgrupadas).length > 0 ? (
          Object.entries(sessoesAgrupadas).map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 sticky top-20 bg-background/95 p-2 rounded-md z-10 backdrop-blur w-fit">
                <CalendarIcon className="w-4 h-4" />
                {getDayLabel(dateKey)}
              </h2>

              <div className="grid gap-3">
                {items.map((sessao) => (
                  <Card key={sessao.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">

                        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono font-normal text-lg text-gray-800">
                                {format(parseISO(sessao.dataHoraInicio), 'HH:mm')}
                              </span>
                              <span className="text-muted-foreground text-sm">- {format(parseISO(sessao.dataHoraFim), 'HH:mm')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Garantindo acesso ao mapa também via String */}
                              <h3 className="font-semibold text-lg">{clienteMap.get(String(sessao.clienteId)) || 'Cliente Desconhecido'}</h3>
                            </div>
                            {sessao.notasSessao && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{sessao.notasSessao}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              // Estilo neutro para AGENDADA
                              sessao.status === 'AGENDADA' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                sessao.status === 'CONCLUIDA' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {sessao.status}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditSessao(sessao)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                                onClick={() => setSessaoToDelete(sessao.id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-gray-900">Nenhum agendamento neste período</h3>
            <p className="text-muted-foreground mt-2 mb-6">Tente alterar o filtro ou adicione um novo agendamento.</p>
            <Button onClick={() => onAddSessao(new Date())}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Agendamento
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!sessaoToDelete} onOpenChange={() => setSessaoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarioPage;